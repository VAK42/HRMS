import { Contract, PaginationQuery } from '../types/index.js';
import { buildPagination, now } from '../utils/helpers.js';
import { exportToExcel } from '../utils/exportHelper.js';
import { AuthRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import db from '../database/connection.js';
const allowedSortFields = ['contractNumber', 'startDate', 'endDate', 'grossSalary', 'status', 'createdAt'];
export const getContracts = (req: AuthRequest, res: Response) => {
  try {
    const query = req.query as unknown as PaginationQuery & { employeeId?: string; status?: string; search?: string };
    const { page, limit, offset, sortBy, sortOrder } = buildPagination(query, allowedSortFields);
    let whereClause = '1=1';
    const params: (string | number)[] = [];
    if (req.user?.role === 'employee') {
      whereClause += ' AND c.employeeId = ?';
      params.push(req.user.employeeId);
    } else if (req.user?.role === 'manager') {
      whereClause += ' AND (e.managerId = ? OR c.employeeId = ?)';
      params.push(req.user.employeeId, req.user.employeeId);
    }
    if (query.search) {
      whereClause += ' AND (e.fullName LIKE ? OR e.employeeCode LIKE ? OR c.contractNumber LIKE ?)';
      params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    }
    if (query.employeeId) {
      whereClause += ' AND c.employeeId = ?';
      params.push(query.employeeId);
    }
    if (query.status) {
      whereClause += ' AND c.status = ?';
      params.push(query.status);
    }
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM contracts c
      LEFT JOIN employees e ON c.employeeId = e.id
      WHERE ${whereClause}
    `).get(...params) as { total: number };
    const contracts = db.prepare(`
      SELECT c.*, e.fullName as employeeName, e.employeeCode
      FROM contracts c
      LEFT JOIN employees e ON c.employeeId = e.id
      WHERE ${whereClause}
      ORDER BY c.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return res.json({
      success: true,
      data: contracts,
      pagination: { page, limit, total: countResult.total, totalPages: Math.ceil(countResult.total / limit) }
    });
  } catch (error) {
    console.error('Lỗi Lấy Hợp Đồng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};

export const createContract = (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (!data.contractNumber || !data.employeeId || !data.contractType || !data.startDate || !data.grossSalary || !data.content) {
      return res.status(400).json({ success: false, message: 'Vui Lòng Điền Đầy Đủ Thông Tin (Bắt Buộc Có Nội Dung Hợp Đồng)' });
    }
    const existing = db.prepare('SELECT id FROM contracts WHERE contractNumber = ?').get(data.contractNumber);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Số Hợp Đồng Đã Tồn Tại' });
    }
    const id = uuidv4();
    const timestamp = now();
    db.prepare(`
      INSERT INTO contracts (id, contractNumber, employeeId, contractType, startDate, endDate, grossSalary, salaryType, workingHoursPerDay, workingDaysPerWeek, content, signedDate, status, createdBy, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.contractNumber, data.employeeId, data.contractType, data.startDate, data.endDate || null, data.grossSalary, data.salaryType || 'gross', data.workingHoursPerDay || 8, data.workingDaysPerWeek || 5, data.content || '', data.signedDate || null, 'draft', req.user?.id, timestamp, timestamp);
    return res.status(201).json({ success: true, data: { id }, message: 'Tạo Hợp Đồng Thành Công' });
  } catch (error) {
    console.error('Lỗi Tạo Hợp Đồng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const updateContract = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body as Partial<Contract>;
    const existing = db.prepare('SELECT id FROM contracts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Hợp Đồng' });
    }
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'createdAt' && k !== 'createdBy');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Không Có Dữ Liệu Cập Nhật' });
    }
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (data as Record<string, unknown>)[f]);
    db.prepare(`UPDATE contracts SET ${updates}, updatedAt = ? WHERE id = ?`).run(...values, now(), id);
    return res.json({ success: true, message: 'Cập Nhật Hợp Đồng Thành Công' });
  } catch (error) {
    console.error('Lỗi Cập Nhật Hợp Đồng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const activateContract = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(id) as Contract | undefined;
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Hợp Đồng' });
    }
    db.prepare('UPDATE contracts SET status = ?, signedDate = ?, updatedAt = ? WHERE id = ?').run('active', now().split('T')[0], now(), id);
    db.prepare('UPDATE contracts SET status = ? WHERE employeeId = ? AND id != ? AND status = ?').run('expired', contract.employeeId, id, 'active');
    return res.json({ success: true, message: 'Hợp Đồng Đã Được Kích Hoạt' });
  } catch (error) {
    console.error('Lỗi Kích Hoạt Hợp Đồng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const deleteContract = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contract = db.prepare('SELECT id FROM contracts WHERE id = ?').get(id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Hợp Đồng' });
    }
    db.prepare('DELETE FROM contracts WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Đã Xóa Hợp Đồng' });
  } catch (error) {
    console.error('Lỗi Xóa Hợp Đồng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const exportContracts = async (req: AuthRequest, res: Response) => {
  try {
    const contracts = db.prepare(`
      SELECT c.contractNumber, e.fullName, e.employeeCode, c.contractType, c.startDate, c.endDate, c.grossSalary, c.status
      FROM contracts c
      LEFT JOIN employees e ON c.employeeId = e.id
      ORDER BY c.createdAt DESC
    `).all() as Record<string, unknown>[];
    const columns = [
      { header: 'Số HĐ', key: 'contractNumber', width: 15 },
      { header: 'Mã NV', key: 'employeeCode', width: 12 },
      { header: 'Họ Tên', key: 'fullName', width: 25 },
      { header: 'Loại HĐ', key: 'contractType', width: 15 },
      { header: 'Ngày BĐ', key: 'startDate', width: 12 },
      { header: 'Ngày KT', key: 'endDate', width: 12 },
      { header: 'Lương', key: 'grossSalary', width: 15 },
      { header: 'Trạng Thái', key: 'status', width: 12 }
    ];
    await exportToExcel(contracts, columns, 'hopDong', res);
  } catch (error) {
    console.error('Lỗi Xuất Hợp Đồng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};