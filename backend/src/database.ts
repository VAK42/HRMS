import Database, { Database as DatabaseType } from 'better-sqlite3'
import path from 'path'
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
  status TEXT DEFAULT 'active',
  avatarUrl TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (departmentId) REFERENCES departments(id),
  FOREIGN KEY (managerId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS workSchedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  date DATE NOT NULL,
  shiftType TEXT DEFAULT 'regular',
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
  status TEXT DEFAULT 'active',
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
  status TEXT DEFAULT 'pending',
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
  status TEXT DEFAULT 'open',
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
  status TEXT DEFAULT 'planned'
);

CREATE TABLE IF NOT EXISTS trainingParticipants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  courseId INTEGER NOT NULL,
  employeeId INTEGER NOT NULL,
  status TEXT DEFAULT 'enrolled',
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
  status TEXT DEFAULT 'pending',
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
  status TEXT DEFAULT 'active',
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS foreignExits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL,
  destination TEXT,
  purpose TEXT,
  departureDate DATE,
  returnDate DATE,
  status TEXT DEFAULT 'pending',
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
  status TEXT DEFAULT 'active',
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS safetyIncidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT,
  status TEXT DEFAULT 'Open',
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
  console.log('Database Empty. Seeding Initial Data...')
  sqliteDb.exec(`
    INSERT INTO departments (name, parentId) VALUES
      ('Human Resources', NULL),
      ('Engineering', NULL),
      ('Marketing', NULL),
      ('Finance', NULL),
      ('Operations', NULL),
      ('DevOps', 2),
      ('Frontend Team', 2),
      ('Backend Team', 2),
      ('Sales', 3),
      ('Customer Support', 5);
    INSERT INTO positions (name, departmentId, level) VALUES
      ('HR Manager', 1, 3),
      ('HR Specialist', 1, 2),
      ('Engineering Manager', 2, 3),
      ('Senior Developer', 2, 2),
      ('Junior Developer', 2, 1),
      ('Marketing Manager', 3, 3),
      ('Marketing Specialist', 3, 2),
      ('Finance Manager', 4, 3),
      ('Accountant', 4, 2),
      ('Operations Manager', 5, 3),
      ('DevOps Engineer', 6, 2),
      ('Frontend Developer', 7, 2),
      ('Backend Developer', 8, 2),
      ('Sales Representative', 9, 2),
      ('Support Specialist', 10, 2);
    INSERT INTO employees (employeeCode, fullName, email, phone, birthday, gender, idNumber, address, departmentId, positionId, managerId, startDate, status) VALUES
      ('EMP001', 'John Smith', 'john.smith@company.com', '555-0101', '1985-03-15', 'Male', 'ID001234', '123 Main St, City', 1, 1, NULL, '2020-01-15', 'Active'),
      ('EMP002', 'Jane Doe', 'jane.doe@company.com', '555-0102', '1990-07-22', 'Female', 'ID002345', '456 Oak Ave, Town', 2, 3, 1, '2021-03-01', 'Active'),
      ('EMP003', 'Bob Wilson', 'bob.wilson@company.com', '555-0103', '1988-11-08', 'Male', 'ID003456', '789 Pine Rd, Village', 2, 4, 2, '2022-06-15', 'Active'),
      ('EMP004', 'Alice Brown', 'alice.brown@company.com', '555-0104', '1992-05-30', 'Female', 'ID004567', '321 Elm St, City', 3, 6, 1, '2021-09-01', 'Active'),
      ('EMP005', 'Charlie Davis', 'charlie.davis@company.com', '555-0105', '1987-01-12', 'Male', 'ID005678', '654 Maple Dr, Town', 4, 8, 1, '2019-04-20', 'Active'),
      ('EMP006', 'Emma Johnson', 'emma.j@company.com', '555-0106', '1995-08-25', 'Female', 'ID006789', '987 Cedar Ln, Village', 2, 5, 2, '2023-01-10', 'Active'),
      ('EMP007', 'Michael Lee', 'michael.lee@company.com', '555-0107', '1983-12-03', 'Male', 'ID007890', '147 Birch Ave, City', 5, 10, 1, '2018-07-01', 'Active'),
      ('EMP008', 'Sarah Miller', 'sarah.m@company.com', '555-0108', '1991-04-18', 'Female', 'ID008901', '258 Ash St, Town', 1, 2, 1, '2020-11-15', 'Active'),
      ('EMP009', 'David Chen', 'david.chen@company.com', '555-0109', '1989-09-27', 'Male', 'ID009012', '369 Spruce Rd, Village', 6, 11, 5, '2021-05-01', 'Active'),
      ('EMP010', 'Lisa Wang', 'lisa.wang@company.com', '555-0110', '1994-02-14', 'Female', 'ID010123', '741 Walnut Dr, City', 3, 7, 4, '2022-08-20', 'Active'),
      ('EMP011', 'Kevin Harris', 'kevin.h@company.com', '555-0111', '1986-06-19', 'Male', 'ID011234', '852 Chestnut Ln, Town', 7, 12, 2, '2020-02-01', 'Active'),
      ('EMP012', 'Rachel Green', 'rachel.g@company.com', '555-0112', '1993-10-05', 'Female', 'ID012345', '963 Hickory Ave, Village', 8, 13, 2, '2021-07-15', 'Active'),
      ('EMP013', 'Thomas Wright', 'thomas.w@company.com', '555-0113', '1984-04-22', 'Male', 'ID013456', '159 Poplar St, City', 9, 14, 5, '2019-09-01', 'Active'),
      ('EMP014', 'Jennifer Taylor', 'jennifer.t@company.com', '555-0114', '1996-12-11', 'Female', 'ID014567', '357 Willow Rd, Town', 10, 15, 7, '2023-03-15', 'Active'),
      ('EMP015', 'Andrew Martinez', 'andrew.m@company.com', '555-0115', '1988-08-30', 'Male', 'ID015678', '468 Cypress Dr, Village', 4, 9, 5, '2020-06-01', 'Active'),
      ('EMP016', 'Michelle Adams', 'michelle.a@company.com', '555-0116', '1991-01-07', 'Female', 'ID016789', '579 Redwood Ln, City', 2, 5, 2, '2022-01-10', 'Active'),
      ('EMP017', 'Christopher Clark', 'chris.c@company.com', '555-0117', '1987-05-14', 'Male', 'ID017890', '680 Sequoia Ave, Town', 6, 11, 5, '2021-11-01', 'Active'),
      ('EMP018', 'Amanda Lopez', 'amanda.l@company.com', '555-0118', '1994-09-23', 'Female', 'ID018901', '791 Magnolia St, Village', 7, 12, 11, '2022-04-15', 'Active'),
      ('EMP019', 'Daniel White', 'daniel.w@company.com', '555-0119', '1989-03-02', 'Male', 'ID019012', '802 Dogwood Rd, City', 8, 13, 12, '2020-08-01', 'Active'),
      ('EMP020', 'Jessica Hall', 'jessica.h@company.com', '555-0120', '1992-07-16', 'Female', 'ID020123', '913 Sycamore Dr, Town', 9, 14, 13, '2021-12-01', 'Active');
    INSERT INTO contracts (employeeId, contractCode, contractType, startDate, endDate, baseSalary, status) VALUES
      (1, 'CTR-2020-001', 'Permanent', '2020-01-15', NULL, 8000, 'Active'),
      (2, 'CTR-2021-002', 'Permanent', '2021-03-01', NULL, 9500, 'Active'),
      (3, 'CTR-2022-003', 'Fixed-Term', '2022-06-15', '2025-06-15', 7500, 'Active'),
      (4, 'CTR-2021-004', 'Permanent', '2021-09-01', NULL, 8500, 'Active'),
      (5, 'CTR-2019-005', 'Permanent', '2019-04-20', NULL, 9000, 'Active'),
      (6, 'CTR-2023-006', 'Probation', '2023-01-10', '2023-04-10', 4500, 'Active'),
      (7, 'CTR-2018-007', 'Permanent', '2018-07-01', NULL, 9200, 'Active'),
      (8, 'CTR-2020-008', 'Permanent', '2020-11-15', NULL, 6500, 'Active'),
      (9, 'CTR-2021-009', 'Permanent', '2021-05-01', NULL, 7800, 'Active'),
      (10, 'CTR-2022-010', 'Fixed-Term', '2022-08-20', '2024-08-20', 6000, 'Active');
    INSERT INTO leaveRequests (employeeId, leaveType, startDate, endDate, days, reason, status, createdAt) VALUES
      (1, 'Annual Leave', '2024-01-15', '2024-01-17', 3, 'Family Vacation', 'Approved', '2024-01-10'),
      (2, 'Sick Leave', '2024-01-20', '2024-01-20', 1, 'Medical Appointment', 'Approved', '2024-01-18'),
      (3, 'Annual Leave', '2024-02-01', '2024-02-05', 5, 'Personal Trip', 'Pending', '2024-01-25'),
      (4, 'Unpaid Leave', '2024-02-10', '2024-02-12', 3, 'Personal Matters', 'Pending', '2024-02-01'),
      (5, 'Annual Leave', '2024-03-01', '2024-03-03', 3, 'Wedding Attendance', 'Approved', '2024-02-15');
    INSERT INTO rewards (employeeId, rewardType, decisionNumber, decisionDate, amount, reason) VALUES
      (1, 'Performance Bonus', 'RWD-2024-001', '2024-01-10', 2000, 'Outstanding Q4 Performance'),
      (2, 'Project Completion', 'RWD-2024-002', '2024-01-15', 3000, 'Successfully Delivered Major Project');
    INSERT INTO disciplines (employeeId, disciplineType, decisionNumber, decisionDate, reason) VALUES
      (3, 'Warning', 'DIS-2024-001', '2024-01-05', 'Late Submission Of Reports'),
      (6, 'Written Warning', 'DIS-2024-002', '2024-02-10', 'Repeated Tardiness');
    INSERT INTO degrees (employeeId, degreeType, major, institution, graduationYear) VALUES
      (1, 'Master', 'Human Resources', 'State University', 2010),
      (2, 'Bachelor', 'Computer Science', 'Tech University', 2012),
      (3, 'Bachelor', 'Software Engineering', 'Engineering College', 2015),
      (4, 'Master', 'Marketing', 'Business School', 2018),
      (5, 'Bachelor', 'Accounting', 'Finance University', 2009);
    INSERT INTO trainingCourses (name, description, startDate, endDate, instructor, location, status) VALUES
      ('Leadership Skills', 'Management And Leadership Training', '2024-02-01', '2024-02-03', 'Dr. Johnson', 'Conference Room A', 'Completed'),
      ('React Advanced', 'Advanced React Patterns And Hooks', '2024-03-15', '2024-03-17', 'Tech Trainer', 'Training Lab', 'Ongoing'),
      ('SQL Optimization', 'Database Performance Tuning', '2024-04-01', '2024-04-02', 'DB Expert', 'Online', 'Planned');
    INSERT INTO recruitmentPosts (title, departmentId, positionId, jobType, salaryMin, salaryMax, deadline, description, requirements, status, candidateCount) VALUES
      ('Senior Frontend Developer', 7, 12, 'Full-Time', 7000, 9000, '2024-03-15', 'Looking For Experienced React Developer', '5+ Years Experience', 'Open', 15),
      ('DevOps Engineer', 6, 11, 'Full-Time', 8000, 10000, '2024-03-20', 'Cloud Infrastructure Specialist Needed', 'AWS/GCP Experience', 'Open', 8);
    INSERT INTO salaryRecords (employeeId, month, year, baseSalary, allowances, bonuses, deductions, netSalary, status) VALUES
      (1, 1, 2024, 8000, 500, 2000, 800, 9700, 'Paid'),
      (2, 1, 2024, 9500, 600, 3000, 950, 12150, 'Paid'),
      (3, 1, 2024, 7500, 400, 0, 750, 7150, 'Paid');
    INSERT INTO kpiRecords (employeeId, month, year, targetScore, actualScore, rating) VALUES
      (1, 1, 2024, 90, 95, 'A'),
      (2, 1, 2024, 90, 88, 'B'),
      (3, 1, 2024, 85, 82, 'B');
    INSERT INTO socialInsurance (employeeId, insuranceNumber, startDate, monthlyContribution, status) VALUES
      (1, 'SI-2020-001', '2020-01-15', 400, 'Active'),
      (2, 'SI-2021-002', '2021-03-01', 475, 'Active');
    INSERT INTO systemRoles (name, permissions) VALUES
      ('Admin', 'All'),
      ('Manager', 'Dashboard, Personnel, Decisions, Leave, Recruitment, Salary, Reports'),
      ('HR Staff', 'Dashboard, Personnel, Leave'),
      ('Employee', 'Dashboard');
    INSERT INTO users (username, password, employeeId, roleId, isActive) VALUES
      ('admin', 'admin123', NULL, 1, 1),
      ('manager', 'manager123', 2, 2, 1),
      ('hrstaff', 'hrstaff123', 8, 3, 1),
      ('user', 'user123', 3, 4, 1);
    INSERT INTO safetyIncidents (title, description, severity, status, date) VALUES
      ('Minor Slip', 'Employee Slipped In Hallway, No Injury', 'Low', 'Resolved', '2023-11-10'),
      ('Equipment Malfunction', 'Printer Overheated', 'Low', 'Resolved', '2023-12-05'),
      ('Near Miss', 'Box Fell From Shelf, No One Hit', 'Medium', 'Open', '2024-01-15');
    INSERT INTO catalog (catalogType, name, code, description, isActive) VALUES
      ('Department', 'Human Resources', 'HR', 'HR Department', 1),
      ('Department', 'Engineering', 'ENG', 'Engineering Department', 1),
      ('Leave Type', 'Annual Leave', 'AL', 'Paid Annual Leave', 1),
      ('Contract Type', 'Permanent', 'PERM', 'Permanent Contract', 1);
    INSERT INTO config (configKey, configValue, description) VALUES
      ('Company Name', 'HRMS Enterprise', 'Company Name'),
      ('Working Hours Per Day', '8', 'Standard Working Hours Per Day'),
      ('Annual Leave Days', '15', 'Default Annual Leave Days');
  `)
}
export default sqliteDb