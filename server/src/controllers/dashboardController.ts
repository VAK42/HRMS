import { AuthRequest } from '../middleware/auth.js';
import { Response } from 'express';
import db from '../database/connection.js';
export const getDashboardStats = (req: AuthRequest, res: Response) => {
  try {
    let employeeFilter = '';
    const params: string[] = [];
    if (req.user?.role === 'manager') {
      employeeFilter = 'WHERE managerId = ? OR id = ?';
      params.push(req.user.employeeId, req.user.employeeId);
    } else if (req.user?.role === 'employee') {
      employeeFilter = 'WHERE id = ?';
      params.push(req.user.employeeId);
    }
    const totalEmployees = db.prepare(`SELECT COUNT(*) as count FROM employees ${employeeFilter}`).get(...params) as { count: number };
    const activeEmployees = db.prepare(`SELECT COUNT(*) as count FROM employees ${employeeFilter ? employeeFilter + ' AND' : 'WHERE'} employmentStatus = 'active'`).get(...params) as { count: number };
    const probationEmployees = db.prepare(`SELECT COUNT(*) as count FROM employees ${employeeFilter ? employeeFilter + ' AND' : 'WHERE'} employmentStatus = 'probation'`).get(...params) as { count: number };
    const totalDepartments = db.prepare('SELECT COUNT(*) as count FROM departments').get() as { count: number };
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = db.prepare(`
      SELECT COUNT(*) as count FROM attendance a
      LEFT JOIN employees e ON a.employeeId = e.id
      WHERE a.date = ? ${employeeFilter ? 'AND (' + employeeFilter.replace('WHERE', '').replace(/\bid\b/g, 'a.employeeId').replace('managerId', 'e.managerId') + ')' : ''}
    `).get(today, ...params) as { count: number };
    const pendingLeaves = db.prepare(`
      SELECT COUNT(*) as count FROM leaveRequests lr
      LEFT JOIN employees e ON lr.employeeId = e.id
      WHERE lr.status = 'pending' ${employeeFilter ? 'AND (' + employeeFilter.replace('WHERE', '').replace(/\bid\b/g, 'lr.employeeId').replace('managerId', 'e.managerId') + ')' : ''}
    `).get(...params) as { count: number };
    const pendingAttendance = db.prepare(`
      SELECT COUNT(*) as count FROM attendance a
      LEFT JOIN employees e ON a.employeeId = e.id
      WHERE a.approvalStatus = 'pending' ${employeeFilter ? 'AND (' + employeeFilter.replace('WHERE', '').replace(/\bid\b/g, 'a.employeeId').replace('managerId', 'e.managerId') + ')' : ''}
    `).get(...params) as { count: number };
    return res.json({
      success: true,
      data: {
        totalEmployees: totalEmployees.count,
        activeEmployees: activeEmployees.count,
        probationEmployees: probationEmployees.count,
        totalDepartments: totalDepartments.count,
        todayAttendance: todayAttendance.count,
        pendingLeaves: pendingLeaves.count,
        pendingAttendance: pendingAttendance.count
      }
    });
  } catch (error) {
    console.error('Lỗi Lấy Thống Kê:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getEmployeesByDepartment = (req: AuthRequest, res: Response) => {
  try {
    const data = db.prepare(`
      SELECT d.name as department, COUNT(e.id) as count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.departmentId AND e.employmentStatus = 'active'
      GROUP BY d.id, d.name
      ORDER BY count DESC
    `).all() as { department: string; count: number }[];
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Lỗi Thống Kê Phòng Ban:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getEmployeeStatusDistribution = (req: AuthRequest, res: Response) => {
  try {
    const data = db.prepare(`
      SELECT employmentStatus as status, COUNT(*) as count
      FROM employees
      GROUP BY employmentStatus
    `).all() as { status: string; count: number }[];
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Lỗi Thống Kê Trạng Thái:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getMonthlyAttendance = (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query as { year?: string };
    const targetYear = year || new Date().getFullYear().toString();
    const data = db.prepare(`
      SELECT strftime('%m', date) as month, COUNT(*) as count
      FROM attendance
      WHERE strftime('%Y', date) = ? AND approvalStatus = 'approved'
      GROUP BY strftime('%m', date)
      ORDER BY month
    `).all(targetYear) as { month: string; count: number }[];
    const result = Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, '0');
      const found = data.find(d => d.month === month);
      return { month: `Tháng ${i + 1}`, count: found?.count || 0 };
    });
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Lỗi Thống Kê Chấm Công:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getLeaveStatistics = (req: AuthRequest, res: Response) => {
  try {
    const data = db.prepare(`
      SELECT lt.name as leaveType, SUM(lr.totalDays) as days
      FROM leaveRequests lr
      LEFT JOIN leaveTypes lt ON lr.leaveTypeId = lt.id
      WHERE lr.status = 'approved'
      GROUP BY lt.id, lt.name
      ORDER BY days DESC
    `).all() as { leaveType: string; days: number }[];
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Lỗi Thống Kê Nghỉ Phép:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getHiringTrends = (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query as { year?: string };
    const targetYear = year || new Date().getFullYear().toString();
    const data = db.prepare(`
      SELECT strftime('%m', hireDate) as month, COUNT(*) as count
      FROM employees
      WHERE strftime('%Y', hireDate) = ?
      GROUP BY strftime('%m', hireDate)
      ORDER BY month
    `).all(targetYear) as { month: string; count: number }[];
    const result = Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, '0');
      const found = data.find(d => d.month === month);
      return { month: `Tháng ${i + 1}`, count: found?.count || 0 };
    });
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Lỗi Thống Kê Tuyển Dụng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
}