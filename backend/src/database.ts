import Database, { Database as DatabaseType } from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../data/hrms.db')
const sqliteDb: DatabaseType = new Database(dbPath)
sqliteDb.pragma('journal_mode = WAL')
sqliteDb.exec(`
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parentId INTEGER,
  managerId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  departmentId INTEGER,
  level INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeCode TEXT UNIQUE NOT NULL,
  fullName TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birthday DATE,
  gender TEXT,
  idNumber TEXT,
  address TEXT,
  departmentId INTEGER,
  positionId INTEGER,
  managerId INTEGER,
  startDate DATE,
  status TEXT DEFAULT 'Hoạt Động',
  avatarUrl TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (departmentId) REFERENCES departments(id),
  FOREIGN KEY (managerId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS workSchedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  date DATE NOT NULL,
  shiftType TEXT DEFAULT 'Hành Chính',
  startTime TEXT,
  endTime TEXT,
  notes TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS degrees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  degreeType TEXT,
  major TEXT,
  institution TEXT,
  graduationYear INTEGER,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS familyMembers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  fullName TEXT,
  relationship TEXT,
  birthday DATE,
  occupation TEXT,
  phone TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  contractCode TEXT,
  contractType TEXT,
  startDate DATE,
  endDate DATE,
  baseSalary REAL,
  status TEXT DEFAULT 'Hoạt Động',
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS leaveRequests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  leaveType TEXT,
  startDate DATE,
  endDate DATE,
  days REAL,
  reason TEXT,
  status TEXT DEFAULT 'Chờ Duyệt',
  approvedBy INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  rewardType TEXT,
  decisionNumber TEXT,
  decisionDate DATE,
  amount REAL,
  reason TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS disciplines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  disciplineType TEXT,
  decisionNumber TEXT,
  decisionDate DATE,
  reason TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS salaryAdjustments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  adjustType TEXT,
  decisionNumber TEXT,
  decisionDate DATE,
  effectiveDate DATE,
  oldSalary REAL,
  newSalary REAL,
  reason TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  positionId INTEGER,
  decisionNumber TEXT,
  decisionDate DATE,
  effectiveDate DATE,
  notes TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS dismissals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  dismissalType TEXT,
  decisionNumber TEXT,
  decisionDate DATE,
  effectiveDate DATE,
  reason TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS terminations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  terminationType TEXT,
  decisionNumber TEXT,
  decisionDate DATE,
  effectiveDate DATE,
  reason TEXT,
  severancePay REAL,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  fromDepartmentId INTEGER,
  toDepartmentId INTEGER,
  decisionNumber TEXT,
  decisionDate DATE,
  effectiveDate DATE,
  reason TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS recruitmentPosts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  departmentId INTEGER,
  positionId INTEGER,
  jobType TEXT,
  salaryMin REAL,
  salaryMax REAL,
  deadline DATE,
  description TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'Mở',
  candidateCount INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS trainingCourses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  startDate DATE,
  endDate DATE,
  instructor TEXT,
  location TEXT,
  status TEXT DEFAULT 'Đã Lên Kế Hoạch'
);

CREATE TABLE IF NOT EXISTS trainingParticipants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  courseId INTEGER NOT NULL,
  employeeId INTEGER NOT NULL,
  status TEXT DEFAULT 'Đang Học',
  score REAL,
  FOREIGN KEY (courseId) REFERENCES trainingCourses(id),
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS salaryRecords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  month INTEGER,
  year INTEGER,
  baseSalary REAL,
  allowances REAL,
  bonuses REAL,
  deductions REAL,
  netSalary REAL,
  status TEXT DEFAULT 'Chờ Duyệt',
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS kpiRecords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  month INTEGER,
  year INTEGER,
  targetScore REAL,
  actualScore REAL,
  rating TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER,
  documentType TEXT,
  fileName TEXT,
  filePath TEXT,
  uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS healthRecords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  height REAL,
  weight REAL,
  bloodType TEXT,
  allergies TEXT,
  checkupDate DATE,
  notes TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS socialInsurance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  insuranceNumber TEXT,
  startDate DATE,
  monthlyContribution REAL,
  status TEXT DEFAULT 'Hoạt Động',
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS foreignExits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  destination TEXT,
  purpose TEXT,
  departureDate DATE,
  returnDate DATE,
  status TEXT DEFAULT 'Chờ Duyệt',
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  visitType TEXT,
  visitDate DATE,
  reason TEXT,
  giftValue REAL,
  notes TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS safetyEquipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  equipmentType TEXT,
  issueDate DATE,
  expiryDate DATE,
  status TEXT DEFAULT 'Hoạt Động',
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS safetyIncidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT,
  status TEXT DEFAULT 'Mở',
  date DATE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS systemRoles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  permissions TEXT
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  employeeId INTEGER,
  roleId INTEGER,
  isActive INTEGER DEFAULT 1,
  FOREIGN KEY (roleId) REFERENCES systemRoles(id)
);
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  catalogType TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  isActive INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  configKey TEXT UNIQUE NOT NULL,
  configValue TEXT,
  description TEXT
);
CREATE TABLE IF NOT EXISTS scheduleEvents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  eventType TEXT,
  title TEXT,
  startDate DATE,
  endDate DATE,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
`)
const userCount = (sqliteDb.prepare('SELECT count(*) as c FROM users').get() as any).c
if (userCount === 0) {
  console.log('Cơ Sở Dữ Liệu Trống. Đang Tạo Dữ Liệu Mẫu...')
  sqliteDb.exec(`
    INSERT INTO departments (name, parentId) VALUES
      ('Nhân Sự', NULL),
      ('Kỹ Thuật', NULL),
      ('Tiếp Thị', NULL),
      ('Tài Chính', NULL),
      ('Vận Hành', NULL),
      ('Vận Hành Hệ Thống', 2),
      ('Nhóm Frontend', 2),
      ('Nhóm Backend', 2),
      ('Kinh Doanh', 3),
      ('Hỗ Trợ Khách Hàng', 5);
    INSERT INTO positions (name, departmentId, level) VALUES
      ('Trưởng Phòng Nhân Sự', 1, 3),
      ('Chuyên Viên Nhân Sự', 1, 2),
      ('Trưởng Phòng Kỹ Thuật', 2, 3),
      ('Lập Trình Viên Cấp Cao', 2, 2),
      ('Lập Trình Viên Sơ Cấp', 2, 1),
      ('Trưởng Phòng Tiếp Thị', 3, 3),
      ('Chuyên Viên Tiếp Thị', 3, 2),
      ('Trưởng Phòng Tài Chính', 4, 3),
      ('Kế Toán', 4, 2),
      ('Trưởng Phòng Vận Hành', 5, 3),
      ('Kỹ Sư DevOps', 6, 2),
      ('Lập Trình Viên Frontend', 7, 2),
      ('Lập Trình Viên Backend', 8, 2),
      ('Đại Diện Kinh Doanh', 9, 2),
      ('Chuyên Viên Hỗ Trợ', 10, 2);
    INSERT INTO employees (employeeCode, fullName, email, phone, birthday, gender, idNumber, address, departmentId, positionId, managerId, startDate, status) VALUES
      ('EMP001', 'Nguyễn Văn A', 'nguyen.a@congty.com', '0901234567', '1985-03-15', 'Nam', 'ID001234', '123 Đường Chính, TP.HCM', 1, 1, NULL, '2020-01-15', 'Hoạt Động'),
      ('EMP002', 'Trần Thị B', 'tran.b@congty.com', '0902345678', '1990-07-22', 'Nữ', 'ID002345', '456 Lê Lợi, Hà Nội', 2, 3, 1, '2021-03-01', 'Hoạt Động'),
      ('EMP003', 'Lê Văn C', 'le.c@congty.com', '0903456789', '1988-11-08', 'Nam', 'ID003456', '789 Nguyễn Huệ, Đà Nẵng', 2, 4, 2, '2022-06-15', 'Hoạt Động'),
      ('EMP004', 'Phạm Thị D', 'pham.d@congty.com', '0904567890', '1992-05-30', 'Nữ', 'ID004567', '321 Trần Hưng Đạo, Cần Thơ', 3, 6, 1, '2021-09-01', 'Hoạt Động'),
      ('EMP005', 'Hoàng Văn E', 'hoang.e@congty.com', '0905678901', '1987-01-12', 'Nam', 'ID005678', '654 Võ Văn Kiệt, TP.HCM', 4, 8, 1, '2019-04-20', 'Hoạt Động'),
      ('EMP006', 'Vũ Thị F', 'vu.f@congty.com', '0906789012', '1995-08-25', 'Nữ', 'ID006789', '987 Hai Bà Trưng, Hà Nội', 2, 5, 2, '2023-01-10', 'Hoạt Động'),
      ('EMP007', 'Đặng Văn G', 'dang.g@congty.com', '0907890123', '1983-12-03', 'Nam', 'ID007890', '147 Lý Tự Trọng, Đà Nẵng', 5, 10, 1, '2018-07-01', 'Hoạt Động'),
      ('EMP008', 'Bùi Thị H', 'bui.h@congty.com', '0908901234', '1991-04-18', 'Nữ', 'ID008901', '258 Điện Biên Phủ, Cần Thơ', 1, 2, 1, '2020-11-15', 'Hoạt Động'),
      ('EMP009', 'Ngô Văn I', 'ngo.i@congty.com', '0909012345', '1989-09-27', 'Nam', 'ID009012', '369 Nguyễn Văn Linh, TP.HCM', 6, 11, 5, '2021-05-01', 'Hoạt Động'),
      ('EMP010', 'Dương Thị K', 'duong.k@congty.com', '0900123456', '1994-02-14', 'Nữ', 'ID010123', '741 Lê Duẩn, Hà Nội', 3, 7, 4, '2022-08-20', 'Hoạt Động'),
      ('EMP011', 'Lý Văn L', 'ly.l@congty.com', '0901234567', '1986-06-19', 'Nam', 'ID011234', '852 Trần Phú, Đà Nẵng', 7, 12, 2, '2020-02-01', 'Hoạt Động'),
      ('EMP012', 'Mai Thị M', 'mai.m@congty.com', '0902345678', '1993-10-05', 'Nữ', 'ID012345', '963 Hùng Vương, Cần Thơ', 8, 13, 2, '2021-07-15', 'Hoạt Động'),
      ('EMP013', 'Đỗ Văn N', 'do.n@congty.com', '0903456789', '1984-04-22', 'Nam', 'ID013456', '159 Phan Đình Phùng, TP.HCM', 9, 14, 5, '2019-09-01', 'Hoạt Động'),
      ('EMP014', 'Hồ Thị O', 'ho.o@congty.com', '0904567890', '1996-12-11', 'Nữ', 'ID014567', '357 Bà Triệu, Hà Nội', 10, 15, 7, '2023-03-15', 'Hoạt Động'),
      ('EMP015', 'Trịnh Văn P', 'trinh.p@congty.com', '0905678901', '1988-08-30', 'Nam', 'ID015678', '468 Nguyễn Trãi, Đà Nẵng', 4, 9, 5, '2020-06-01', 'Hoạt Động'),
      ('EMP016', 'Cao Thị Q', 'cao.q@congty.com', '0906789012', '1991-01-07', 'Nữ', 'ID016789', '579 Lê Văn Sỹ, Cần Thơ', 2, 5, 2, '2022-01-10', 'Hoạt Động'),
      ('EMP017', 'Đinh Văn R', 'dinh.r@congty.com', '0907890123', '1987-05-14', 'Nam', 'ID017890', '680 CMT8, TP.HCM', 6, 11, 5, '2021-11-01', 'Hoạt Động'),
      ('EMP018', 'Lâm Thị S', 'lam.s@congty.com', '0908901234', '1994-09-23', 'Nữ', 'ID018901', '791 Nguyễn Thị Minh Khai, Hà Nội', 7, 12, 11, '2022-04-15', 'Hoạt Động'),
      ('EMP019', 'Vương Văn T', 'vuong.t@congty.com', '0909012345', '1989-03-02', 'Nam', 'ID019012', '802 Phạm Văn Đồng, Đà Nẵng', 8, 13, 12, '2020-08-01', 'Hoạt Động'),
      ('EMP020', 'Trương Thị U', 'truong.u@congty.com', '0900123456', '1992-07-16', 'Nữ', 'ID020123', '913 Nguyễn Văn Cừ, Cần Thơ', 9, 14, 13, '2021-12-01', 'Hoạt Động');
    INSERT INTO contracts (employeeId, contractCode, contractType, startDate, endDate, baseSalary, status) VALUES
      (1, 'CTR-2020-001', 'Vô Thời Hạn', '2020-01-15', NULL, 8000, 'Hoạt Động'),
      (2, 'CTR-2021-002', 'Vô Thời Hạn', '2021-03-01', NULL, 9500, 'Hoạt Động'),
      (3, 'CTR-2022-003', 'Có Thời Hạn', '2022-06-15', '2025-06-15', 7500, 'Hoạt Động'),
      (4, 'CTR-2021-004', 'Vô Thời Hạn', '2021-09-01', NULL, 8500, 'Hoạt Động'),
      (5, 'CTR-2019-005', 'Vô Thời Hạn', '2019-04-20', NULL, 9000, 'Hoạt Động'),
      (6, 'CTR-2023-006', 'Thử Việc', '2023-01-10', '2023-04-10', 4500, 'Hoạt Động'),
      (7, 'CTR-2018-007', 'Vô Thời Hạn', '2018-07-01', NULL, 9200, 'Hoạt Động'),
      (8, 'CTR-2020-008', 'Vô Thời Hạn', '2020-11-15', NULL, 6500, 'Hoạt Động'),
      (9, 'CTR-2021-009', 'Vô Thời Hạn', '2021-05-01', NULL, 7800, 'Hoạt Động'),
      (10, 'CTR-2022-010', 'Có Thời Hạn', '2022-08-20', '2024-08-20', 6000, 'Hoạt Động');
    INSERT INTO leaveRequests (employeeId, leaveType, startDate, endDate, days, reason, status, createdAt) VALUES
      (1, 'Nghỉ Phép Năm', '2024-01-15', '2024-01-17', 3, 'Du Lịch Gia Đình', 'Đã Duyệt', '2024-01-10'),
      (2, 'Nghỉ Ốm', '2024-01-20', '2024-01-20', 1, 'Khám Bệnh', 'Đã Duyệt', '2024-01-18'),
      (3, 'Nghỉ Phép Năm', '2024-02-01', '2024-02-05', 5, 'Việc Cá Nhân', 'Chờ Duyệt', '2024-01-25'),
      (4, 'Nghỉ Không Lương', '2024-02-10', '2024-02-12', 3, 'Việc Gia Đình', 'Chờ Duyệt', '2024-02-01'),
      (5, 'Nghỉ Phép Năm', '2024-03-01', '2024-03-03', 3, 'Đám Cưới', 'Đã Duyệt', '2024-02-15');
    INSERT INTO rewards (employeeId, rewardType, decisionNumber, decisionDate, amount, reason) VALUES
      (1, 'Thưởng Hiệu Suất', 'RWD-2024-001', '2024-01-10', 2000, 'Hoàn Thành Xuất Sắc Quý 4'),
      (2, 'Thưởng Dự Án', 'RWD-2024-002', '2024-01-15', 3000, 'Hoàn Thành Dự Án Lớn');
    INSERT INTO disciplines (employeeId, disciplineType, decisionNumber, decisionDate, reason) VALUES
      (3, 'Cảnh Cáo', 'DIS-2024-001', '2024-01-05', 'Nộp Báo Cáo Muộn'),
      (6, 'Khiển Trách Văn Bản', 'DIS-2024-002', '2024-02-10', 'Đi Muộn Nhiều Lần');
    INSERT INTO degrees (employeeId, degreeType, major, institution, graduationYear) VALUES
      (1, 'Thạc Sĩ', 'Nhân Sự', 'Đại Học Quốc Gia', 2010),
      (2, 'Cử Nhân', 'Khoa Học Máy Tính', 'Đại Học Bách Khoa', 2012),
      (3, 'Cử Nhân', 'Kỹ Thuật Phần Mềm', 'Đại Học Công Nghệ', 2015),
      (4, 'Thạc Sĩ', 'Tiếp Thị', 'Đại Học Kinh Tế', 2018),
      (5, 'Cử Nhân', 'Kế Toán', 'Đại Học Tài Chính', 2009);
    INSERT INTO trainingCourses (name, description, startDate, endDate, instructor, location, status) VALUES
      ('Kỹ Năng Lãnh Đạo', 'Đào Tạo Quản Lý Và Lãnh Đạo', '2024-02-01', '2024-02-03', 'Tiến Sĩ Hùng', 'Phòng Họp A', 'Hoàn Thành'),
      ('React Nâng Cao', 'Các Mẫu React Nâng Cao Và Hooks', '2024-03-15', '2024-03-17', 'Chuyên Gia Kỹ Thuật', 'Phòng Đào Tạo', 'Đang Diễn Ra'),
      ('Tối Ưu Hóa SQL', 'Tinh Chỉnh Hiệu Suất Cơ Sở Dữ Liệu', '2024-04-01', '2024-04-02', 'Chuyên Gia DB', 'Trực Tuyến', 'Đã Lên Kế Hoạch');
    INSERT INTO recruitmentPosts (title, departmentId, positionId, jobType, salaryMin, salaryMax, deadline, description, requirements, status, candidateCount) VALUES
      ('Lập Trình Viên Frontend Cấp Cao', 7, 12, 'Toàn Thời Gian', 7000, 9000, '2024-03-15', 'Tìm Kiếm Lập Trình Viên React Có Kinh Nghiệm', '5+ Năm Kinh Nghiệm', 'Mở', 15),
      ('Kỹ Sư DevOps', 6, 11, 'Toàn Thời Gian', 8000, 10000, '2024-03-20', 'Chuyên Gia Hạ Tầng Đám Mây', 'Kinh Nghiệm AWS/GCP', 'Mở', 8);
    INSERT INTO salaryRecords (employeeId, month, year, baseSalary, allowances, bonuses, deductions, netSalary, status) VALUES
      (1, 1, 2024, 8000, 500, 2000, 800, 9700, 'Đã TT'),
      (2, 1, 2024, 9500, 600, 3000, 950, 12150, 'Đã TT'),
      (3, 1, 2024, 7500, 400, 0, 750, 7150, 'Đã TT');
    INSERT INTO kpiRecords (employeeId, month, year, targetScore, actualScore, rating) VALUES
      (1, 1, 2024, 90, 95, 'A'),
      (2, 1, 2024, 90, 88, 'B'),
      (3, 1, 2024, 85, 82, 'B');
    INSERT INTO socialInsurance (employeeId, insuranceNumber, startDate, monthlyContribution, status) VALUES
      (1, 'SI-2020-001', '2020-01-15', 400, 'Hoạt Động'),
      (2, 'SI-2021-002', '2021-03-01', 475, 'Hoạt Động');
    INSERT INTO systemRoles (name, permissions) VALUES
      ('Quản Trị Viên', 'All'),
      ('Quản Lý', 'Dashboard, Personnel, Decisions, Leave, Recruitment, Salary, Reports'),
      ('Nhân Viên HR', 'Dashboard, Personnel, Leave'),
      ('Nhân Viên', 'Dashboard');
    INSERT INTO users (username, password, employeeId, roleId, isActive) VALUES
      ('admin', 'admin123', NULL, 1, 1),
      ('manager', 'manager123', 2, 2, 1),
      ('hrstaff', 'hrstaff123', 8, 3, 1),
      ('user', 'user123', 3, 4, 1);
    INSERT INTO safetyIncidents (title, description, severity, status, date) VALUES
      ('Trượt Ngã Nhẹ', 'Nhân Viên Trượt Ngã Ở Hành Lang, Không Bị Thương', 'Thấp', 'Đã Giải Quyết', '2023-11-10'),
      ('Hỏng Thiết Bị', 'Máy In Quá Nhiệt', 'Thấp', 'Đã Giải Quyết', '2023-12-05'),
      ('Suýt Xảy Ra Tai Nạn', 'Hộp Rơi Từ Kệ, Không Trúng Ai', 'Trung Bình', 'Mở', '2024-01-15');
    INSERT INTO catalog (catalogType, name, code, description, isActive) VALUES
      ('Phòng Ban', 'Nhân Sự', 'HR', 'Phòng Nhân Sự', 1),
      ('Phòng Ban', 'Kỹ Thuật', 'ENG', 'Phòng Kỹ Thuật', 1),
      ('Loại Nghỉ Phép', 'Nghỉ Phép Năm', 'AL', 'Nghỉ Phép Có Lương', 1),
      ('Loại Hợp Đồng', 'Vô Thời Hạn', 'PERM', 'Hợp Đồng Vô Thời Hạn', 1);
    INSERT INTO config (configKey, configValue, description) VALUES
      ('Tên Công Ty', 'HRMS Enterprise', 'Tên Công Ty'),
      ('Giờ Làm Việc Mỗi Ngày', '8', 'Giờ Làm Việc Tiêu Chuẩn'),
      ('Ngày Nghỉ Phép Năm', '15', 'Ngày Nghỉ Phép Mặc Định');
  `)
}
export default sqliteDb