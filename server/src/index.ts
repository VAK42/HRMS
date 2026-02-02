import departmentRoutes from './routes/departmentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import insuranceRoutes from './routes/insuranceRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import positionRoutes from './routes/positionRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaveRequests', leaveRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/insurance', insuranceRoutes);
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'HRMS API Đang Hoạt Động', timestamp: new Date().toISOString() });
});
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Lỗi Server:', err);
  res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
});
app.listen(3001, () => {
  console.log('Server HRMS Đang Chạy Tại http://localhost:3001');
});