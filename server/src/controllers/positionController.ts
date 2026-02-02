import { Position, PaginationQuery } from '../types/index.js';
import { buildPagination, now } from '../utils/helpers.js';
import { AuthRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import db from '../database/connection.js';
const allowedSortFields = ['name', 'code', 'level', 'baseSalary', 'createdAt'];
export const getPositions = (req: AuthRequest, res: Response) => {
  try {
    const query = req.query as unknown as PaginationQuery & { departmentId?: string; search?: string };
    const { page, limit, offset, sortBy, sortOrder } = buildPagination(query, allowedSortFields);
    let whereClause = '1=1';
    const params: string[] = [];
    if (query.search) {
      whereClause += ' AND (p.name LIKE ? OR p.code LIKE ?)';
      params.push(`%${query.search}%`, `%${query.search}%`);
    }
    if (query.departmentId) {
      whereClause += ' AND p.departmentId = ?';
      params.push(query.departmentId);
    }
    const countResult = db.prepare(`SELECT COUNT(*) as total FROM positions p WHERE ${whereClause}`).get(...params) as { total: number };
    const positions = db.prepare(`
      SELECT p.*, d.name as departmentName, (SELECT COUNT(*) FROM employees WHERE positionId = p.id) as employeeCount
      FROM positions p
      LEFT JOIN departments d ON p.departmentId = d.id
      WHERE ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return res.json({
      success: true,
      data: positions,
      pagination: { page, limit, total: countResult.total, totalPages: Math.ceil(countResult.total / limit) }
    });
  } catch (error) {
    console.error('Lỗi Lấy Vị Trí:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const createPosition = (req: AuthRequest, res: Response) => {
  try {
    const { name, code, level, departmentId, baseSalary } = req.body;
    if (!name || !code || !level || !departmentId || !baseSalary) {
      return res.status(400).json({ success: false, message: 'Vui Lòng Điền Đầy Đủ Thông Tin' });
    }
    const existing = db.prepare('SELECT id FROM positions WHERE code = ?').get(code);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Mã Vị Trí Đã Tồn Tại' });
    }
    const id = uuidv4();
    const timestamp = now();
    db.prepare('INSERT INTO positions (id, name, code, level, departmentId, baseSalary, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, code, level, departmentId, baseSalary, timestamp, timestamp);
    return res.status(201).json({ success: true, data: { id }, message: 'Tạo Vị Trí Thành Công' });
  } catch (error) {
    console.error('Lỗi Tạo Vị Trí:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const updatePosition = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body as Partial<Position>;
    const existing = db.prepare('SELECT id FROM positions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Vị Trí' });
    }
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'createdAt');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Không Có Dữ Liệu Cập Nhật' });
    }
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (data as Record<string, unknown>)[f]);
    db.prepare(`UPDATE positions SET ${updates}, updatedAt = ? WHERE id = ?`).run(...values, now(), id);
    return res.json({ success: true, message: 'Cập Nhật Vị Trí Thành Công' });
  } catch (error) {
    console.error('Lỗi Cập Nhật Vị Trí:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const deletePosition = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees WHERE positionId = ?').get(id) as { count: number };
    if (employeeCount.count > 0) {
      return res.status(400).json({ success: false, message: 'Không Thể Xóa Vị Trí Có Nhân Viên' });
    }
    db.prepare('DELETE FROM positions WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Xóa Vị Trí Thành Công' });
  } catch (error) {
    console.error('Lỗi Xóa Vị Trí:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getAllPositions = (req: AuthRequest, res: Response) => {
  try {
    const positions = db.prepare('SELECT id, name, code, level, departmentId, baseSalary FROM positions ORDER BY name').all();
    return res.json({ success: true, data: positions });
  } catch (error) {
    console.error('Lỗi Lấy Danh Sách Vị Trí:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};