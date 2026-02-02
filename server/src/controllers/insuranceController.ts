import { AuthRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import db from '../database/connection.js';
const now = () => new Date().toISOString();
export const getInsuranceRecords = (req: AuthRequest, res: Response) => {
  try {
    const records = db.prepare(`
      SELECT i.*, e.fullName as employeeName, e.employeeCode, d.name as departmentName
      FROM insurance i
      LEFT JOIN employees e ON i.employeeId = e.id
      LEFT JOIN departments d ON e.departmentId = d.id
      ORDER BY e.fullName
    `).all();
    return res.json({ success: true, data: records });
  } catch (error) {
    console.error('Lỗi Lấy Bảo Hiểm:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};

export const createInsurance = (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, socialInsuranceNumber, healthInsuranceNumber, healthInsurancePlace, registrationDate, baseSalaryForInsurance } = req.body;
    if (!employeeId || !socialInsuranceNumber || !healthInsuranceNumber || !healthInsurancePlace || !registrationDate || !baseSalaryForInsurance) {
      return res.status(400).json({ success: false, message: 'Vui Lòng Điền Đầy Đủ Thông Tin' });
    }
    const existing = db.prepare('SELECT id FROM insurance WHERE employeeId = ?').get(employeeId);
    if (existing) return res.status(400).json({ success: false, message: 'Nhân Viên Đã Có Bảo Hiểm' });
    const id = uuidv4();
    db.prepare(`
      INSERT INTO insurance (id, employeeId, socialInsuranceNumber, healthInsuranceNumber, healthInsurancePlace, registrationDate, socialInsuranceRate, healthInsuranceRate, unemploymentInsuranceRate, baseSalaryForInsurance, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, 8, 1.5, 1, ?, 'active', ?, ?)
    `).run(id, employeeId, socialInsuranceNumber, healthInsuranceNumber, healthInsurancePlace, registrationDate, baseSalaryForInsurance, now(), now());
    return res.status(201).json({ success: true, message: 'Tạo Bảo Hiểm Thành Công', data: { id } });
  } catch (error) {
    console.error('Lỗi Tạo Bảo Hiểm:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const updateInsurance = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM insurance WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Không Tìm Thấy' });
    const data = req.body;
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'employeeId');
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'Không Có Dữ Liệu Cập Nhật' });
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (data as Record<string, unknown>)[f]);
    db.prepare(`UPDATE insurance SET ${updates}, updatedAt = ? WHERE id = ?`).run(...values, now(), id);
    return res.json({ success: true, message: 'Cập Nhật Thành Công' });
  } catch (error) {
    console.error('Lỗi Cập Nhật Bảo Hiểm:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const deleteInsurance = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM insurance WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Không Tìm Thấy' });
    db.prepare('DELETE FROM insurance WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Xóa Thành Công' });
  } catch (error) {
    console.error('Lỗi Xóa Bảo Hiểm:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
import { exportToExcel } from '../utils/exportHelper.js';
export const exportInsurance = async (req: AuthRequest, res: Response) => {
  try {
    const records = db.prepare(`
      SELECT e.employeeCode, e.fullName, i.socialInsuranceNumber, i.healthInsuranceNumber, i.healthInsurancePlace, i.registrationDate, i.baseSalaryForInsurance, i.status
      FROM insurance i
      LEFT JOIN employees e ON i.employeeId = e.id
      ORDER BY e.fullName
    `).all() as Record<string, unknown>[];
    const columns = [
      { header: 'Mã NV', key: 'employeeCode', width: 12 },
      { header: 'Họ Tên', key: 'fullName', width: 25 },
      { header: 'Số BHXH', key: 'socialInsuranceNumber', width: 20 },
      { header: 'Số BHYT', key: 'healthInsuranceNumber', width: 20 },
      { header: 'Nơi KCB', key: 'healthInsurancePlace', width: 25 },
      { header: 'Ngày ĐK', key: 'registrationDate', width: 12 },
      { header: 'Mức Đóng', key: 'baseSalaryForInsurance', width: 15 },
      { header: 'Trạng Thái', key: 'status', width: 12 }
    ];
    await exportToExcel(records, columns, 'baoHiem', res);
  } catch (error) {
    console.error('Lỗi Xuất Bảo Hiểm:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};