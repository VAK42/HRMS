import { LeaveRequest, LeaveBalance, PaginationQuery } from '../types/index.js';
import { AuthRequest, canApprove } from '../middleware/auth.js';
import { buildPagination, now } from '../utils/helpers.js';
import { exportToExcel } from '../utils/exportHelper.js';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import db from '../database/connection.js';
const allowedSortFields = ['startDate', 'endDate', 'totalDays', 'status', 'createdAt'];
export const getLeaveRequests = (req: AuthRequest, res: Response) => {
  try {
    const query = req.query as unknown as PaginationQuery & { employeeId?: string; status?: string; leaveTypeId?: string; search?: string };
    const { page, limit, offset, sortBy, sortOrder } = buildPagination(query, allowedSortFields);
    let whereClause = '1=1';
    const params: (string | number)[] = [];
    if (req.user?.role === 'employee') {
      whereClause += ' AND lr.employeeId = ?';
      params.push(req.user.employeeId);
    } else if (req.user?.role === 'manager') {
      whereClause += ' AND (e.managerId = ? OR lr.employeeId = ?)';
      params.push(req.user.employeeId, req.user.employeeId);
    }
    if (query.search) {
      whereClause += ' AND (e.fullName LIKE ? OR e.employeeCode LIKE ?)';
      params.push(`%${query.search}%`, `%${query.search}%`);
    }
    if (query.employeeId) {
      whereClause += ' AND lr.employeeId = ?';
      params.push(query.employeeId);
    }
    if (query.status) {
      whereClause += ' AND lr.status = ?';
      params.push(query.status);
    }
    if (query.leaveTypeId) {
      whereClause += ' AND lr.leaveTypeId = ?';
      params.push(query.leaveTypeId);
    }
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM leaveRequests lr
      LEFT JOIN employees e ON lr.employeeId = e.id
      WHERE ${whereClause}
    `).get(...params) as { total: number };
    const requests = db.prepare(`
      SELECT lr.*, e.fullName as employeeName, e.employeeCode, lt.name as leaveTypeName, u.email as approverEmail
      FROM leaveRequests lr
      LEFT JOIN employees e ON lr.employeeId = e.id
      LEFT JOIN leaveTypes lt ON lr.leaveTypeId = lt.id
      LEFT JOIN users u ON lr.approvedBy = u.id
      WHERE ${whereClause}
      ORDER BY lr.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return res.json({
      success: true,
      data: requests,
      pagination: { page, limit, total: countResult.total, totalPages: Math.ceil(countResult.total / limit) }
    });
  } catch (error) {
    console.error('Lỗi Lấy Đơn Xin Nghỉ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const createLeaveRequest = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yêu Cầu Đăng Nhập' });
    }
    const { leaveTypeId, startDate, endDate, reason } = req.body;
    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Vui Lòng Điền Đầy Đủ Thông Tin' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({ success: false, message: 'Ngày Bắt Đầu Phải Trước Ngày Kết Thúc' });
    }
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const currentYear = new Date().getFullYear();
    const balance = db.prepare('SELECT * FROM leaveBalances WHERE employeeId = ? AND leaveTypeId = ? AND year = ?')
      .get(req.user.employeeId, leaveTypeId, currentYear) as LeaveBalance | undefined;
    if (balance && balance.remainingDays < totalDays) {
      return res.status(400).json({ success: false, message: `Bạn Chỉ Còn ${balance.remainingDays} Ngày Phép` });
    }
    const id = uuidv4();
    const timestamp = now();
    db.prepare(`
      INSERT INTO leaveRequests (id, employeeId, leaveTypeId, startDate, endDate, totalDays, reason, status, approvedBy, approvedAt, rejectionReason, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.employeeId, leaveTypeId, startDate, endDate, totalDays, reason, 'pending', null, null, null, timestamp, timestamp);
    const employee = db.prepare('SELECT managerId FROM employees WHERE id = ?').get(req.user.employeeId) as { managerId: string } | undefined;
    if (employee?.managerId) {
      const manager = db.prepare('SELECT id FROM users WHERE employeeId = ?').get(employee.managerId) as { id: string } | undefined;
      if (manager) {
        db.prepare(`INSERT INTO notifications (id, userId, title, message, type, isRead, link, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .run(uuidv4(), manager.id, 'Đơn Xin Nghỉ Mới', `Có đơn xin nghỉ mới cần duyệt`, 'info', 0, `/leave-requests/${id}`, timestamp);
      }
    }
    return res.status(201).json({ success: true, data: { id }, message: 'Gửi Đơn Xin Nghỉ Thành Công' });
  } catch (error) {
    console.error('Lỗi Tạo Đơn Xin Nghỉ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const approveLeaveRequest = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body as { status: 'approved' | 'rejected'; rejectionReason?: string };
    const request = db.prepare('SELECT * FROM leaveRequests WHERE id = ?').get(id) as LeaveRequest | undefined;
    if (!request) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Đơn Xin Nghỉ' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Đơn Đã Được Xử Lý' });
    }
    if (!canApprove(req, request.employeeId)) {
      return res.status(403).json({ success: false, message: 'Không Có Quyền Duyệt' });
    }
    const timestamp = now();
    db.prepare('UPDATE leaveRequests SET status = ?, approvedBy = ?, approvedAt = ?, rejectionReason = ?, updatedAt = ? WHERE id = ?')
      .run(status, req.user?.id, timestamp, rejectionReason || null, timestamp, id);
    if (status === 'approved') {
      const currentYear = new Date().getFullYear();
      db.prepare('UPDATE leaveBalances SET usedDays = usedDays + ?, remainingDays = remainingDays - ?, updatedAt = ? WHERE employeeId = ? AND leaveTypeId = ? AND year = ?')
        .run(request.totalDays, request.totalDays, timestamp, request.employeeId, request.leaveTypeId, currentYear);
    }
    const requester = db.prepare('SELECT id FROM users WHERE employeeId = ?').get(request.employeeId) as { id: string } | undefined;
    if (requester) {
      db.prepare(`INSERT INTO notifications (id, userId, title, message, type, isRead, link, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(uuidv4(), requester.id, status === 'approved' ? 'Đơn Được Duyệt' : 'Đơn Bị Từ Chối', status === 'approved' ? 'Đơn xin nghỉ của bạn đã được duyệt' : `Đơn xin nghỉ bị từ chối: ${rejectionReason}`, status === 'approved' ? 'success' : 'error', 0, `/leave-requests/${id}`, timestamp);
    }
    return res.json({ success: true, message: status === 'approved' ? 'Đã Duyệt Đơn' : 'Đã Từ Chối Đơn' });
  } catch (error) {
    console.error('Lỗi Duyệt Đơn:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const cancelLeaveRequest = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const request = db.prepare('SELECT * FROM leaveRequests WHERE id = ?').get(id) as LeaveRequest | undefined;
    if (!request) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Đơn Xin Nghỉ' });
    }
    if (req.user?.role === 'employee' && request.employeeId !== req.user.employeeId) {
      return res.status(403).json({ success: false, message: 'Không Có Quyền Hủy Đơn Này' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Chỉ Có Thể Hủy Đơn Đang Chờ Duyệt' });
    }
    db.prepare('UPDATE leaveRequests SET status = ?, updatedAt = ? WHERE id = ?').run('cancelled', now(), id);
    return res.json({ success: true, message: 'Đã Hủy Đơn Xin Nghỉ' });
  } catch (error) {
    console.error('Lỗi Hủy Đơn:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const deleteLeaveRequest = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const request = db.prepare('SELECT * FROM leaveRequests WHERE id = ?').get(id) as LeaveRequest | undefined;
    if (!request) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Đơn Xin Nghỉ' });
    }
    db.prepare('DELETE FROM leaveRequests WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Đã Xóa Đơn Xin Nghỉ' });
  } catch (error) {
    console.error('Lỗi Xóa Đơn:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getLeaveBalance = (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.params.employeeId || req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Thiếu ID Nhân Viên' });
    }
    const currentYear = new Date().getFullYear();
    const balances = db.prepare(`
      SELECT lb.*, lt.name as leaveTypeName, lt.code as leaveTypeCode
      FROM leaveBalances lb
      LEFT JOIN leaveTypes lt ON lb.leaveTypeId = lt.id
      WHERE lb.employeeId = ? AND lb.year = ?
    `).all(employeeId, currentYear);
    return res.json({ success: true, data: balances });
  } catch (error) {
    console.error('Lỗi Lấy Số Ngày Phép:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getLeaveTypes = (req: AuthRequest, res: Response) => {
  try {
    const types = db.prepare('SELECT * FROM leaveTypes ORDER BY name').all();
    return res.json({ success: true, data: types });
  } catch (error) {
    console.error('Lỗi Lấy Loại Nghỉ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const exportLeaveRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = db.prepare(`
      SELECT e.employeeCode, e.fullName, lt.name as leaveTypeName, lr.startDate, lr.endDate, lr.totalDays, lr.reason, lr.status
      FROM leaveRequests lr
      LEFT JOIN employees e ON lr.employeeId = e.id
      LEFT JOIN leaveTypes lt ON lr.leaveTypeId = lt.id
      ORDER BY lr.createdAt DESC
    `).all() as Record<string, unknown>[];
    const columns = [
      { header: 'Mã NV', key: 'employeeCode', width: 15 },
      { header: 'Họ Tên', key: 'fullName', width: 25 },
      { header: 'Loại Nghỉ', key: 'leaveTypeName', width: 20 },
      { header: 'Từ Ngày', key: 'startDate', width: 15 },
      { header: 'Đến Ngày', key: 'endDate', width: 15 },
      { header: 'Số Ngày', key: 'totalDays', width: 10 },
      { header: 'Lý Do', key: 'reason', width: 30 },
      { header: 'Trạng Thái', key: 'status', width: 15 }
    ];
    await exportToExcel(requests, columns, 'donXinNghi', res);
  } catch (error) {
    console.error('Lỗi Xuất Đơn Nghỉ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};