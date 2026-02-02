import { AuthRequest } from '../middleware/auth.js';
import { User, Employee } from '../types/index.js';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../database/connection.js';
const JWT_SECRET = process.env.JWT_SECRET || 'hrms-secret-key-2026';
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui Lòng Nhập Email Và Mật Khẩu' });
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND isActive = 1').get(email) as User | undefined;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email Hoặc Mật Khẩu Không Đúng' });
    }
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Email Hoặc Mật Khẩu Không Đúng' });
    }
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(user.employeeId) as Employee | undefined;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, employeeId: user.employeeId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          employee: employee ? {
            id: employee.id,
            fullName: employee.fullName,
            employeeCode: employee.employeeCode,
            isManager: employee.isManager
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Lỗi Đăng Nhập:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getProfile = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yêu Cầu Đăng Nhập' });
    }
    const user = db.prepare('SELECT id, email, role, employeeId, isActive, createdAt FROM users WHERE id = ?').get(req.user.id) as Omit<User, 'passwordHash'> | undefined;
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Người Dùng' });
    }
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(user.employeeId) as Employee | undefined;
    return res.json({
      success: true,
      data: { user, employee }
    });
  } catch (error) {
    console.error('Lỗi Lấy Thông Tin:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};