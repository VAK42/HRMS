import { Attendance, PaginationQuery } from '../types/index.js';
import { AuthRequest, canApprove } from '../middleware/auth.js';
import { buildPagination, now } from '../utils/helpers.js';
import { exportToExcel } from '../utils/exportHelper.js';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import db from '../database/connection.js';
const workStartTime = '08:30:00';
const workEndTime = '17:30:00';
const allowedSortFields = ['date', 'checkIn', 'checkOut', 'status', 'approvalStatus', 'createdAt'];
export const getAttendance = (req: AuthRequest, res: Response) => {
  try {
    const query = req.query as unknown as PaginationQuery & { employeeId?: string; month?: string; year?: string; status?: string; approvalStatus?: string; date?: string };
    const { page, limit, offset, sortBy, sortOrder } = buildPagination(query, allowedSortFields);
    let whereClause = '1=1';
    const params: (string | number)[] = [];
    if (req.user?.role === 'employee') {
      whereClause += ' AND a.employeeId = ?';
      params.push(req.user.employeeId);
    } else if (req.user?.role === 'manager') {
      whereClause += ' AND (e.managerId = ? OR a.employeeId = ?)';
      params.push(req.user.employeeId, req.user.employeeId);
    }
    if (query.employeeId) {
      whereClause += ' AND a.employeeId = ?';
      params.push(query.employeeId);
    }
    if (query.date) {
      whereClause += ' AND a.date = ?';
      params.push(query.date);
    } else if (query.month && query.year) {
      whereClause += ` AND strftime('%m', a.date) = ? AND strftime('%Y', a.date) = ?`;
      params.push(query.month.padStart(2, '0'), query.year);
    }
    const statusFilter = query.approvalStatus || query.status;
    if (statusFilter) {
      whereClause += ' AND a.approvalStatus = ?';
      params.push(statusFilter);
    }
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM attendance a
      LEFT JOIN employees e ON a.employeeId = e.id
      WHERE ${whereClause}
    `).get(...params) as { total: number };
    const attendance = db.prepare(`
      SELECT a.*, e.fullName as employeeName, e.employeeCode
      FROM attendance a
      LEFT JOIN employees e ON a.employeeId = e.id
      WHERE ${whereClause}
      ORDER BY a.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return res.json({
      success: true,
      data: attendance,
      pagination: { page, limit, total: countResult.total, totalPages: Math.ceil(countResult.total / limit) }
    });
  } catch (error) {
    console.error('Lỗi Lấy Chấm Công:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const checkIn = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yêu Cầu Đăng Nhập' });
    }
    const today = now().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];
    const existing = db.prepare('SELECT * FROM attendance WHERE employeeId = ? AND date = ?').get(req.user.employeeId, today) as Attendance | undefined;
    if (existing?.checkIn) {
      return res.status(400).json({ success: false, message: 'Bạn Đã Chấm Công Vào Hôm Nay' });
    }
    let checkInLate = 0;
    if (currentTime > workStartTime) {
      const [h1, m1] = workStartTime.split(':').map(Number);
      const [h2, m2] = currentTime.split(':').map(Number);
      checkInLate = (h2 * 60 + m2) - (h1 * 60 + m1);
    }
    const id = existing?.id || uuidv4();
    const timestamp = now();
    if (existing) {
      db.prepare('UPDATE attendance SET checkIn = ?, checkInLate = ?, status = ?, updatedAt = ? WHERE id = ?')
        .run(currentTime, checkInLate, 'present', timestamp, id);
    } else {
      db.prepare(`
        INSERT INTO attendance (id, employeeId, date, checkIn, checkOut, checkInLate, checkOutEarly, workingHours, overtimeHours, status, approvalStatus, notes, approvedBy, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, req.user.employeeId, today, currentTime, null, checkInLate, 0, 0, 0, 'present', 'pending', null, null, timestamp, timestamp);
    }
    return res.json({
      success: true,
      message: checkInLate > 0 ? `Chấm Công Vào Thành Công (Muộn ${checkInLate} Phút)` : 'Chấm Công Vào Thành Công',
      data: { checkIn: currentTime, checkInLate }
    });
  } catch (error) {
    console.error('Lỗi Chấm Công Vào:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const checkOut = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yêu Cầu Đăng Nhập' });
    }
    const today = now().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];
    const existing = db.prepare('SELECT * FROM attendance WHERE employeeId = ? AND date = ?').get(req.user.employeeId, today) as Attendance | undefined;
    if (!existing?.checkIn) {
      return res.status(400).json({ success: false, message: 'Bạn Chưa Chấm Công Vào Hôm Nay' });
    }
    if (existing.checkOut) {
      return res.status(400).json({ success: false, message: 'Bạn Đã Chấm Công Ra Hôm Nay' });
    }
    let checkOutEarly = 0;
    if (currentTime < workEndTime) {
      const [h1, m1] = currentTime.split(':').map(Number);
      const [h2, m2] = workEndTime.split(':').map(Number);
      checkOutEarly = (h2 * 60 + m2) - (h1 * 60 + m1);
    }
    const [h1, m1] = existing.checkIn.split(':').map(Number);
    const [h2, m2] = currentTime.split(':').map(Number);
    const workingMinutes = (h2 * 60 + m2) - (h1 * 60 + m1) - 60;
    const workingHours = Math.max(0, workingMinutes / 60);
    let overtimeHours = 0;
    if (currentTime > workEndTime) {
      const [eh, em] = workEndTime.split(':').map(Number);
      overtimeHours = ((h2 * 60 + m2) - (eh * 60 + em)) / 60;
    }
    db.prepare('UPDATE attendance SET checkOut = ?, checkOutEarly = ?, workingHours = ?, overtimeHours = ?, updatedAt = ? WHERE id = ?')
      .run(currentTime, checkOutEarly, workingHours.toFixed(2), overtimeHours.toFixed(2), now(), existing.id);
    return res.json({
      success: true,
      message: 'Chấm Công Ra Thành Công',
      data: { checkOut: currentTime, workingHours: workingHours.toFixed(2), overtimeHours: overtimeHours.toFixed(2) }
    });
  } catch (error) {
    console.error('Lỗi Chấm Công Ra:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const approveAttendance = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body as { status: 'approved' | 'rejected'; notes?: string };
    const attendance = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id) as Attendance | undefined;
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Bản Ghi Chấm Công' });
    }
    if (!canApprove(req, attendance.employeeId)) {
      return res.status(403).json({ success: false, message: 'Không Có Quyền Duyệt' });
    }
    db.prepare('UPDATE attendance SET approvalStatus = ?, notes = ?, approvedBy = ?, updatedAt = ? WHERE id = ?')
      .run(status, notes || attendance.notes, req.user?.id, now(), id);
    return res.json({ success: true, message: status === 'approved' ? 'Đã Duyệt Chấm Công' : 'Đã Từ Chối Chấm Công' });
  } catch (error) {
    console.error('Lỗi Duyệt Chấm Công:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getTodayAttendance = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yêu Cầu Đăng Nhập' });
    }
    const today = now().split('T')[0];
    const attendance = db.prepare('SELECT * FROM attendance WHERE employeeId = ? AND date = ?').get(req.user.employeeId, today);
    return res.json({ success: true, data: attendance || null });
  } catch (error) {
    console.error('Lỗi Lấy Chấm Công Hôm Nay:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const exportAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.query as { month: string; year: string };
    let whereClause = '1=1';
    const params: string[] = [];
    if (month && year) {
      whereClause += ` AND strftime('%m', a.date) = ? AND strftime('%Y', a.date) = ?`;
      params.push(month.padStart(2, '0'), year);
    }
    const attendance = db.prepare(`
      SELECT e.employeeCode, e.fullName, a.date, a.checkIn, a.checkOut, a.checkInLate, a.workingHours, a.overtimeHours, a.approvalStatus
      FROM attendance a
      LEFT JOIN employees e ON a.employeeId = e.id
      WHERE ${whereClause}
      ORDER BY a.date, e.employeeCode
    `).all(...params) as Record<string, unknown>[];
    const columns = [
      { header: 'Mã NV', key: 'employeeCode', width: 15 },
      { header: 'Họ Tên', key: 'fullName', width: 25 },
      { header: 'Ngày', key: 'date', width: 15 },
      { header: 'Giờ Vào', key: 'checkIn', width: 12 },
      { header: 'Giờ Ra', key: 'checkOut', width: 12 },
      { header: 'Muộn (Phút)', key: 'checkInLate', width: 15 },
      { header: 'Giờ Làm', key: 'workingHours', width: 12 },
      { header: 'OT', key: 'overtimeHours', width: 10 },
      { header: 'Trạng Thái', key: 'approvalStatus', width: 15 }
    ];
    await exportToExcel(attendance, columns, `chamCong${month}${year}`, res);
  } catch (error) {
    console.error('Lỗi Xuất Chấm Công:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};