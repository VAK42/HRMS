import { Department, PaginationQuery } from '../types/index.js';
import { buildPagination, now } from '../utils/helpers.js';
import { AuthRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import db from '../database/connection.js';
const allowedSortFields = ['name', 'code', 'createdAt'];
export const getDepartments = (req: AuthRequest, res: Response) => {
  try {
    const query = req.query as unknown as PaginationQuery;
    const { page, limit, offset, sortBy, sortOrder } = buildPagination(query, allowedSortFields);
    const countResult = db.prepare('SELECT COUNT(*) as total FROM departments').get() as { total: number };
    const departments = db.prepare(`
      SELECT d.*, e.fullName as managerName, p.name as parentDepartmentName, (SELECT COUNT(*) FROM employees WHERE departmentId = d.id) as employeeCount
      FROM departments d
      LEFT JOIN employees e ON d.managerId = e.id
      LEFT JOIN departments p ON d.parentDepartmentId = p.id
      ORDER BY d.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    return res.json({
      success: true,
      data: departments,
      pagination: { page, limit, total: countResult.total, totalPages: Math.ceil(countResult.total / limit) }
    });
  } catch (error) {
    console.error('Lỗi Lấy Phòng Ban:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const createDepartment = (req: AuthRequest, res: Response) => {
  try {
    const { name, code, parentDepartmentId, managerId } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Vui Lòng Nhập Tên Và Mã Phòng Ban' });
    }
    const existing = db.prepare('SELECT id FROM departments WHERE code = ?').get(code);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Mã Phòng Ban Đã Tồn Tại' });
    }
    const id = uuidv4();
    const timestamp = now();
    db.prepare('INSERT INTO departments (id, name, code, parentDepartmentId, managerId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, code, parentDepartmentId || null, managerId || null, timestamp, timestamp);
    return res.status(201).json({ success: true, data: { id }, message: 'Tạo Phòng Ban Thành Công' });
  } catch (error) {
    console.error('Lỗi Tạo Phòng Ban:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const updateDepartment = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body as Partial<Department>;
    const existing = db.prepare('SELECT id FROM departments WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Phòng Ban' });
    }
    if (data.code) {
      const existingCode = db.prepare('SELECT id FROM departments WHERE code = ? AND id != ?').get(data.code, id);
      if (existingCode) {
        return res.status(400).json({ success: false, message: 'Mã Phòng Ban Đã Tồn Tại' });
      }
    }
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'createdAt');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Không Có Dữ Liệu Cập Nhật' });
    }
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => {
      const val = (data as Record<string, unknown>)[f];
      if ((f === 'managerId' || f === 'parentDepartmentId') && (val === '' || val === undefined)) return null;
      return val;
    });
    db.prepare(`UPDATE departments SET ${updates}, updatedAt = ? WHERE id = ?`).run(...values, now(), id);
    return res.json({ success: true, message: 'Cập Nhật Phòng Ban Thành Công' });
  } catch (error) {
    console.error('Lỗi Cập Nhật Phòng Ban:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const deleteDepartment = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees WHERE departmentId = ?').get(id) as { count: number };
    if (employeeCount.count > 0) {
      return res.status(400).json({ success: false, message: 'Không Thể Xóa Phòng Ban Có Nhân Viên' });
    }
    db.prepare('DELETE FROM departments WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Xóa Phòng Ban Thành Công' });
  } catch (error) {
    console.error('Lỗi Xóa Phòng Ban:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getAllDepartments = (req: AuthRequest, res: Response) => {
  try {
    const departments = db.prepare('SELECT id, name, code FROM departments ORDER BY name').all();
    return res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Lỗi Lấy Danh Sách Phòng Ban:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};