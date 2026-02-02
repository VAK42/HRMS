import { buildPagination, buildSearchCondition, now } from '../utils/helpers.js';
import { Employee, PaginationQuery } from '../types/index.js';
import { exportToExcel } from '../utils/exportHelper.js';
import { AuthRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import db from '../database/connection.js';
const allowedSortFields = ['employeeCode', 'fullName', 'email', 'departmentId', 'positionId', 'hireDate', 'employmentStatus', 'createdAt'];
export const getEmployees = (req: AuthRequest, res: Response) => {
  try {
    const query = req.query as unknown as PaginationQuery & { departmentId?: string; status?: string };
    const { page, limit, offset, sortBy, sortOrder } = buildPagination(query, allowedSortFields);
    const { condition: searchCondition, params: searchParams } = buildSearchCondition(query.search, ['e.fullName', 'e.employeeCode', 'e.email', 'e.phone']);
    let whereClause = '1=1';
    const params: (string | number)[] = [];
    if (searchCondition) {
      whereClause += ` AND ${searchCondition}`;
      params.push(...searchParams);
    }
    if (query.departmentId) {
      whereClause += ' AND e.departmentId = ?';
      params.push(query.departmentId);
    }
    if (query.status) {
      whereClause += ' AND e.employmentStatus = ?';
      params.push(query.status);
    }
    if (req.user?.role === 'manager') {
      whereClause += ' AND (e.managerId = ? OR e.id = ?)';
      params.push(req.user.employeeId, req.user.employeeId);
    } else if (req.user?.role === 'employee') {
      whereClause += ' AND e.id = ?';
      params.push(req.user.employeeId);
    }
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM employees e
      LEFT JOIN departments d ON e.departmentId = d.id
      LEFT JOIN positions p ON e.positionId = p.id
      LEFT JOIN employees m ON e.managerId = m.id
      WHERE ${whereClause}
    `).get(...params) as { total: number };
    const employees = db.prepare(`
      SELECT e.*, d.name as departmentName, p.name as positionName, m.fullName as managerName
      FROM employees e
      LEFT JOIN departments d ON e.departmentId = d.id
      LEFT JOIN positions p ON e.positionId = p.id
      LEFT JOIN employees m ON e.managerId = m.id
      WHERE ${whereClause}
      ORDER BY e.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return res.json({
      success: true,
      data: employees,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Lỗi Lấy Danh Sách Nhân Viên:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getOrgChart = (req: AuthRequest, res: Response) => {
  try {
    const employees = db.prepare(`
      SELECT e.id, e.fullName, e.employeeCode, e.managerId, d.name as departmentName, p.name as positionName
      FROM employees e
      LEFT JOIN departments d ON e.departmentId = d.id
      LEFT JOIN positions p ON e.positionId = p.id
      WHERE e.employmentStatus = 'active'
      ORDER BY e.fullName
    `).all();
    return res.json({ success: true, data: employees });
  } catch (error) {
    console.error('Lỗi Lấy Sơ Đồ Tổ Chức:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};

export const createEmployee = (req: AuthRequest, res: Response) => {
  try {
    const data = req.body as Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
    const existingEmail = db.prepare('SELECT id FROM employees WHERE email = ?').get(data.email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email Đã Tồn Tại' });
    }
    const existingCode = db.prepare('SELECT id FROM employees WHERE employeeCode = ?').get(data.employeeCode);
    if (existingCode) {
      return res.status(400).json({ success: false, message: 'Mã Nhân Viên Đã Tồn Tại' });
    }
    const id = uuidv4();
    const timestamp = now();
    db.prepare(`
      INSERT INTO employees (id, employeeCode, firstName, lastName, fullName, email, phone, personalEmail, dateOfBirth, gender, nationalId, nationalIdDate, nationalIdPlace, taxCode, bankAccount, bankName, bankBranch, permanentAddress, currentAddress, positionId, departmentId, managerId, isManager, hireDate, terminationDate, employmentStatus, employmentType, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.employeeCode, data.firstName, data.lastName, data.fullName, data.email, data.phone, data.personalEmail, data.dateOfBirth, data.gender, data.nationalId, data.nationalIdDate, data.nationalIdPlace, data.taxCode, data.bankAccount, data.bankName, data.bankBranch, data.permanentAddress, data.currentAddress, data.positionId, data.departmentId, data.managerId || null, data.isManager ? 1 : 0, data.hireDate, null, data.employmentStatus, data.employmentType, timestamp, timestamp);
    return res.status(201).json({ success: true, data: { id }, message: 'Tạo Nhân Viên Thành Công' });
  } catch (error) {
    console.error('Lỗi Tạo Nhân Viên:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const updateEmployee = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body as Partial<Employee>;
    const existing = db.prepare('SELECT id FROM employees WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Nhân Viên' });
    }
    if (data.email) {
      const existingEmail = db.prepare('SELECT id FROM employees WHERE email = ? AND id != ?').get(data.email, id);
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email Đã Tồn Tại' });
      }
    }
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'createdAt');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Không Có Dữ Liệu Cập Nhật' });
    }
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => {
      const val = (data as Record<string, unknown>)[f];
      if (f === 'isManager') return val ? 1 : 0;
      if (f === 'managerId' && (val === '' || val === undefined)) return null;
      return val;
    });
    db.prepare(`UPDATE employees SET ${updates}, updatedAt = ? WHERE id = ?`).run(...values, now(), id);
    return res.json({ success: true, message: 'Cập Nhật Nhân Viên Thành Công' });
  } catch (error) {
    console.error('Lỗi Cập Nhật Nhân Viên:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const deleteEmployee = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM employees WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Nhân Viên' });
    }
    db.prepare('DELETE FROM users WHERE employeeId = ?').run(id);
    db.prepare('DELETE FROM attendance WHERE employeeId = ?').run(id);
    db.prepare('DELETE FROM leaveRequests WHERE employeeId = ?').run(id);
    db.prepare('DELETE FROM leaveBalances WHERE employeeId = ?').run(id);
    db.prepare('DELETE FROM contracts WHERE employeeId = ?').run(id);
    db.prepare('DELETE FROM salaries WHERE employeeId = ?').run(id);
    db.prepare('DELETE FROM notifications WHERE userId IN (SELECT id FROM users WHERE employeeId = ?)').run(id);
    db.prepare('UPDATE employees SET managerId = NULL WHERE managerId = ?').run(id);
    db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Đã Xóa Nhân Viên' });
  } catch (error) {
    console.error('Lỗi Xóa Nhân Viên:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const exportEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const employees = db.prepare(`
      SELECT e.employeeCode, e.fullName, e.email, e.phone, e.personalEmail, e.dateOfBirth, e.gender, e.nationalId, e.nationalIdDate, e.nationalIdPlace, e.taxCode, e.bankAccount, e.bankName, e.bankBranch, e.permanentAddress, e.currentAddress, d.name as departmentName, p.name as positionName, m.fullName as managerName, e.hireDate, e.employmentStatus, e.employmentType
      FROM employees e
      LEFT JOIN departments d ON e.departmentId = d.id
      LEFT JOIN positions p ON e.positionId = p.id
      LEFT JOIN employees m ON e.managerId = m.id
      ORDER BY e.employeeCode
    `).all() as Record<string, unknown>[];
    const columns = [
      { header: 'Mã NV', key: 'employeeCode', width: 12 },
      { header: 'Họ Tên', key: 'fullName', width: 22 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Điện Thoại', key: 'phone', width: 14 },
      { header: 'Email Cá Nhân', key: 'personalEmail', width: 28 },
      { header: 'Ngày Sinh', key: 'dateOfBirth', width: 14 },
      { header: 'Giới Tính', key: 'gender', width: 12 },
      { header: 'CCCD', key: 'nationalId', width: 16 },
      { header: 'Ngày Cấp', key: 'nationalIdDate', width: 14 },
      { header: 'Nơi Cấp', key: 'nationalIdPlace', width: 18 },
      { header: 'Mã Số Thuế', key: 'taxCode', width: 14 },
      { header: 'Số TK', key: 'bankAccount', width: 18 },
      { header: 'Ngân Hàng', key: 'bankName', width: 18 },
      { header: 'Chi Nhánh', key: 'bankBranch', width: 20 },
      { header: 'Địa Chỉ Thường Trú', key: 'permanentAddress', width: 35 },
      { header: 'Địa Chỉ Hiện Tại', key: 'currentAddress', width: 35 },
      { header: 'Phòng Ban', key: 'departmentName', width: 20 },
      { header: 'Vị Trí', key: 'positionName', width: 22 },
      { header: 'Quản Lý', key: 'managerName', width: 22 },
      { header: 'Ngày Vào', key: 'hireDate', width: 14 },
      { header: 'Trạng Thái', key: 'employmentStatus', width: 14 },
      { header: 'Loại HĐ', key: 'employmentType', width: 14 }
    ];
    await exportToExcel(employees, columns, 'nhanVien', res);
  } catch (error) {
    console.error('Lỗi Xuất Excel:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getManagers = (req: AuthRequest, res: Response) => {
  try {
    const managers = db.prepare(`
      SELECT id, fullName, employeeCode, departmentId
      FROM employees
      WHERE isManager = 1 AND employmentStatus = 'active'
      ORDER BY fullName
    `).all();
    return res.json({ success: true, data: managers });
  } catch (error) {
    console.error('Lỗi Lấy Danh Sách Quản Lý:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};