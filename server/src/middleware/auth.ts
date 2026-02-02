import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../database/connection.js';
const jwtSecret = 'dcc1592ab594e2fca9564483c37df5816cd40e25ec2d2d09dedb4614a9be27339818c6303ddbd983a160f2cf71ac1775358a2e230cbd42ad617052427de8040b';
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'hrro' | 'manager' | 'employee';
    employeeId: string;
  };
}
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Yêu Cầu Đăng Nhập' });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; role: 'hrro' | 'manager' | 'employee'; employeeId: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Token Không Hợp Lệ' });
  }
};
export const requireRole = (...roles: ('hrro' | 'manager' | 'employee')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yêu Cầu Đăng Nhập' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Không Có Quyền Truy Cập' });
    }
    next();
  };
};
export const isManagerOf = (employeeId: string, managerId: string): boolean => {
  const employee = db.prepare('SELECT managerId, isManager FROM employees WHERE id = ?').get(employeeId) as { managerId: string | null; isManager: number } | undefined;
  if (!employee) return false;
  if (employee.managerId === managerId) return true;
  return false;
};
export const canApprove = (req: AuthRequest, targetEmployeeId: string): boolean => {
  if (!req.user) return false;
  if (req.user.role === 'hrro') return true;
  if (req.user.role === 'manager') {
    return isManagerOf(targetEmployeeId, req.user.employeeId);
  }
  return false;
};