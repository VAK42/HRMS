import { calculateNetFromGross } from '../utils/taxCalculator.js';
import { Salary, PaginationQuery } from '../types/index.js';
import { buildPagination, now } from '../utils/helpers.js';
import { exportToExcel } from '../utils/exportHelper.js';
import { AuthRequest } from '../middleware/auth.js';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/connection.js';
const allowedSortFields = ['month', 'year', 'grossSalary', 'netSalary', 'status', 'createdAt'];
export const getSalaries = (req: AuthRequest, res: Response) => {
  try {
    const query = req.query as unknown as PaginationQuery & { employeeId?: string; month?: string; year?: string; status?: string; search?: string };
    const { page, limit, offset, sortBy, sortOrder } = buildPagination(query, allowedSortFields);
    let whereClause = '1=1';
    const params: (string | number)[] = [];
    if (req.user?.role === 'employee') {
      whereClause += ' AND s.employeeId = ?';
      params.push(req.user.employeeId);
    } else if (req.user?.role === 'manager') {
      whereClause += ' AND (e.managerId = ? OR s.employeeId = ?)';
      params.push(req.user.employeeId, req.user.employeeId);
    }
    if (query.search) {
      whereClause += ' AND (e.fullName LIKE ? OR e.employeeCode LIKE ?)';
      params.push(`%${query.search}%`, `%${query.search}%`);
    }
    if (query.employeeId) {
      whereClause += ' AND s.employeeId = ?';
      params.push(query.employeeId);
    }
    if (query.month) {
      whereClause += ' AND s.month = ?';
      params.push(parseInt(query.month));
    }
    if (query.year) {
      whereClause += ' AND s.year = ?';
      params.push(parseInt(query.year));
    }
    if (query.status) {
      whereClause += ' AND s.status = ?';
      params.push(query.status);
    }
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM salaries s
      LEFT JOIN employees e ON s.employeeId = e.id
      WHERE ${whereClause}
    `).get(...params) as { total: number };
    const salaries = db.prepare(`
      SELECT s.*, e.fullName as employeeName, e.employeeCode
      FROM salaries s
      LEFT JOIN employees e ON s.employeeId = e.id
      WHERE ${whereClause}
      ORDER BY s.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return res.json({
      success: true,
      data: salaries,
      pagination: { page, limit, total: countResult.total, totalPages: Math.ceil(countResult.total / limit) }
    });
  } catch (error) {
    console.error('Lỗi Lấy Bảng Lương:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const calculateMonthlySalary = (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.body as { month: number; year: number };
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Vui Lòng Chọn Tháng Và Năm' });
    }
    const employees = db.prepare(`
      SELECT e.id, e.employeeCode, e.fullName, c.grossSalary as contractSalary
      FROM employees e
      LEFT JOIN contracts c ON e.id = c.employeeId AND c.status = 'active'
      WHERE e.employmentStatus = 'active'
    `).all() as { id: string; employeeCode: string; fullName: string; contractSalary: number }[];
    const daysInMonth = new Date(year, month, 0).getDate();
    const weekendDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = new Date(year, month - 1, i + 1).getDay();
      return day === 0 || day === 6 ? 1 : 0;
    }).reduce((a: number, b: number) => a + b, 0);
    const holidays = db.prepare(`
      SELECT COUNT(*) as count FROM holidays
      WHERE year = ? AND strftime('%m', date) = ?
    `).get(year, month.toString().padStart(2, '0')) as { count: number };
    const standardWorkingDays = daysInMonth - weekendDays - holidays.count;
    const timestamp = now();
    let created = 0;
    let updated = 0;
    for (const emp of employees) {
      const attendance = db.prepare(`
        SELECT COUNT(*) as days, SUM(overtimeHours) as ot
        FROM attendance
        WHERE employeeId = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ? AND approvalStatus = 'approved'
      `).get(emp.id, month.toString().padStart(2, '0'), year.toString()) as { days: number; ot: number };
      const allowances = db.prepare(`
        SELECT SUM(ea.amount) as total
        FROM employeeAllowances ea
        WHERE ea.employeeId = ? AND ea.startDate <= ? AND (ea.endDate IS NULL OR ea.endDate >= ?)
      `).get(emp.id, `${year}-${month.toString().padStart(2, '0')}-01`, `${year}-${month.toString().padStart(2, '0')}-01`) as { total: number };
      const workingDays = attendance.days || 0;
      const basicSalary = (emp.contractSalary || 0) * (workingDays / standardWorkingDays);
      const overtimePay = ((emp.contractSalary || 0) / standardWorkingDays / 8) * 1.5 * (attendance.ot || 0);
      const totalAllowances = allowances.total || 0;
      const grossSalary = basicSalary + overtimePay + totalAllowances;
      const calc = calculateNetFromGross(grossSalary);
      const existing = db.prepare('SELECT id FROM salaries WHERE employeeId = ? AND month = ? AND year = ?').get(emp.id, month, year) as { id: string } | undefined;
      if (existing) {
        db.prepare(`
          UPDATE salaries SET workingDays = ?, standardWorkingDays = ?, basicSalary = ?, allowances = ?, overtime = ?, bonus = ?, grossSalary = ?, socialInsurance = ?, healthInsurance = ?, unemploymentInsurance = ?, personalIncomeTax = ?, netSalary = ?, status = ?, updatedAt = ?
          WHERE id = ?
        `).run(workingDays, standardWorkingDays, basicSalary, totalAllowances, overtimePay, 0, grossSalary, calc.socialInsurance, calc.healthInsurance, calc.unemploymentInsurance, calc.personalIncomeTax, calc.netSalary, 'draft', timestamp, existing.id);
        updated++;
      } else {
        db.prepare(`
          INSERT INTO salaries (id, employeeId, month, year, workingDays, standardWorkingDays, basicSalary, allowances, overtime, bonus, grossSalary, socialInsurance, healthInsurance, unemploymentInsurance, personalIncomeTax, otherDeductions, netSalary, status, paidDate, notes, createdBy, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), emp.id, month, year, workingDays, standardWorkingDays, basicSalary, totalAllowances, overtimePay, 0, grossSalary, calc.socialInsurance, calc.healthInsurance, calc.unemploymentInsurance, calc.personalIncomeTax, 0, calc.netSalary, 'draft', null, null, req.user?.id, timestamp, timestamp);
        created++;
      }
    }
    return res.json({ success: true, message: `Đã Tính Lương: ${created} Mới, ${updated} Cập Nhật` });
  } catch (error) {
    console.error('Lỗi Tính Lương:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const approveSalary = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const salary = db.prepare('SELECT * FROM salaries WHERE id = ?').get(id) as Salary | undefined;
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Bảng Lương' });
    }
    db.prepare('UPDATE salaries SET status = ?, updatedAt = ? WHERE id = ?').run('approved', now(), id);
    return res.json({ success: true, message: 'Đã Duyệt Bảng Lương' });
  } catch (error) {
    console.error('Lỗi Duyệt Lương:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const markSalaryPaid = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const salary = db.prepare('SELECT * FROM salaries WHERE id = ?').get(id) as Salary | undefined;
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Không Tìm Thấy Bảng Lương' });
    }
    if (salary.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Bảng Lương Chưa Được Duyệt' });
    }
    db.prepare('UPDATE salaries SET status = ?, paidDate = ?, updatedAt = ? WHERE id = ?').run('paid', now().split('T')[0], now(), id);
    return res.json({ success: true, message: 'Đã Đánh Dấu Thanh Toán' });
  } catch (error) {
    console.error('Lỗi Thanh Toán:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const exportSalaries = async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.query as { month: string; year: string };
    let whereClause = '1=1';
    const params: (string | number)[] = [];
    if (month) {
      whereClause += ' AND s.month = ?';
      params.push(parseInt(month));
    }
    if (year) {
      whereClause += ' AND s.year = ?';
      params.push(parseInt(year));
    }
    const salaries = db.prepare(`
      SELECT e.employeeCode, e.fullName, s.month, s.year, s.workingDays, s.basicSalary, s.allowances, s.overtime, s.grossSalary, s.socialInsurance, s.healthInsurance, s.unemploymentInsurance, s.personalIncomeTax, s.netSalary, s.status
      FROM salaries s
      LEFT JOIN employees e ON s.employeeId = e.id
      WHERE ${whereClause}
      ORDER BY e.employeeCode
    `).all(...params) as Record<string, unknown>[];
    const columns = [
      { header: 'Mã NV', key: 'employeeCode', width: 15 },
      { header: 'Họ Tên', key: 'fullName', width: 25 },
      { header: 'Tháng', key: 'month', width: 10 },
      { header: 'Năm', key: 'year', width: 10 },
      { header: 'Ngày Công', key: 'workingDays', width: 12 },
      { header: 'Lương CB', key: 'basicSalary', width: 15 },
      { header: 'Phụ Cấp', key: 'allowances', width: 15 },
      { header: 'Tăng Ca', key: 'overtime', width: 15 },
      { header: 'Gross', key: 'grossSalary', width: 15 },
      { header: 'BHXH', key: 'socialInsurance', width: 12 },
      { header: 'BHYT', key: 'healthInsurance', width: 12 },
      { header: 'BHTN', key: 'unemploymentInsurance', width: 12 },
      { header: 'Thuế TNCN', key: 'personalIncomeTax', width: 15 },
      { header: 'Net', key: 'netSalary', width: 15 },
      { header: 'Trạng Thái', key: 'status', width: 12 }
    ];
    await exportToExcel(salaries, columns, `bangLuong${month}${year}`, res);
  } catch (error) {
    console.error('Lỗi Xuất Bảng Lương:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};