import db from './connection.js';
const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('hrro', 'manager', 'employee')),
      employeeId TEXT NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (employeeId) REFERENCES employees(id)
    );
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      parentDepartmentId TEXT,
      managerId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (parentDepartmentId) REFERENCES departments(id),
      FOREIGN KEY (managerId) REFERENCES employees(id)
    );
    CREATE TABLE IF NOT EXISTS positions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      level INTEGER NOT NULL,
      departmentId TEXT NOT NULL,
      baseSalary REAL NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (departmentId) REFERENCES departments(id)
    );
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      employeeCode TEXT UNIQUE NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      personalEmail TEXT NOT NULL,
      dateOfBirth TEXT NOT NULL,
      gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'other')),
      nationalId TEXT UNIQUE NOT NULL,
      nationalIdDate TEXT NOT NULL,
      nationalIdPlace TEXT NOT NULL,
      taxCode TEXT NOT NULL,
      bankAccount TEXT NOT NULL,
      bankName TEXT NOT NULL,
      bankBranch TEXT NOT NULL,
      permanentAddress TEXT NOT NULL,
      currentAddress TEXT NOT NULL,
      positionId TEXT NOT NULL,
      departmentId TEXT NOT NULL,
      managerId TEXT,
      isManager INTEGER NOT NULL DEFAULT 0,
      hireDate TEXT NOT NULL,
      terminationDate TEXT,
      employmentStatus TEXT NOT NULL CHECK(employmentStatus IN ('active', 'probation', 'terminated', 'resigned')),
      employmentType TEXT NOT NULL CHECK(employmentType IN ('fullTime', 'partTime', 'contract', 'intern')),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (positionId) REFERENCES positions(id),
      FOREIGN KEY (departmentId) REFERENCES departments(id),
      FOREIGN KEY (managerId) REFERENCES employees(id)
    );
    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      contractNumber TEXT UNIQUE NOT NULL,
      employeeId TEXT NOT NULL,
      contractType TEXT NOT NULL CHECK(contractType IN ('probation', 'definite', 'indefinite')),
      startDate TEXT NOT NULL,
      endDate TEXT,
      grossSalary REAL NOT NULL,
      salaryType TEXT NOT NULL CHECK(salaryType IN ('gross', 'net')),
      workingHoursPerDay REAL NOT NULL DEFAULT 8,
      workingDaysPerWeek REAL NOT NULL DEFAULT 5,
      content TEXT NOT NULL,
      signedDate TEXT,
      status TEXT NOT NULL CHECK(status IN ('draft', 'active', 'expired', 'terminated')),
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (employeeId) REFERENCES employees(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS salaries (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      workingDays REAL NOT NULL,
      standardWorkingDays REAL NOT NULL,
      basicSalary REAL NOT NULL,
      allowances REAL NOT NULL DEFAULT 0,
      overtime REAL NOT NULL DEFAULT 0,
      bonus REAL NOT NULL DEFAULT 0,
      grossSalary REAL NOT NULL,
      socialInsurance REAL NOT NULL DEFAULT 0,
      healthInsurance REAL NOT NULL DEFAULT 0,
      unemploymentInsurance REAL NOT NULL DEFAULT 0,
      personalIncomeTax REAL NOT NULL DEFAULT 0,
      otherDeductions REAL NOT NULL DEFAULT 0,
      netSalary REAL NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft', 'approved', 'paid')),
      paidDate TEXT,
      notes TEXT,
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (employeeId) REFERENCES employees(id),
      FOREIGN KEY (createdBy) REFERENCES users(id),
      UNIQUE(employeeId, month, year)
    );
    CREATE TABLE IF NOT EXISTS allowances (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      isTaxable INTEGER NOT NULL DEFAULT 1,
      description TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS employeeAllowances (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      allowanceId TEXT NOT NULL,
      amount REAL NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (employeeId) REFERENCES employees(id),
      FOREIGN KEY (allowanceId) REFERENCES allowances(id)
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      date TEXT NOT NULL,
      checkIn TEXT,
      checkOut TEXT,
      checkInLate INTEGER NOT NULL DEFAULT 0,
      checkOutEarly INTEGER NOT NULL DEFAULT 0,
      workingHours REAL NOT NULL DEFAULT 0,
      overtimeHours REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'halfDay', 'remote')),
      approvalStatus TEXT NOT NULL DEFAULT 'pending' CHECK(approvalStatus IN ('pending', 'approved', 'rejected')),
      notes TEXT,
      approvedBy TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (employeeId) REFERENCES employees(id),
      FOREIGN KEY (approvedBy) REFERENCES users(id),
      UNIQUE(employeeId, date)
    );
    CREATE TABLE IF NOT EXISTS leaveTypes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      paidLeave INTEGER NOT NULL DEFAULT 1,
      maxDaysPerYear INTEGER NOT NULL,
      description TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS leaveRequests (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      leaveTypeId TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      totalDays REAL NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled')),
      approvedBy TEXT,
      approvedAt TEXT,
      rejectionReason TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (employeeId) REFERENCES employees(id),
      FOREIGN KEY (leaveTypeId) REFERENCES leaveTypes(id),
      FOREIGN KEY (approvedBy) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS leaveBalances (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      leaveTypeId TEXT NOT NULL,
      year INTEGER NOT NULL,
      totalDays REAL NOT NULL,
      usedDays REAL NOT NULL DEFAULT 0,
      remainingDays REAL NOT NULL,
      carriedOver REAL NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (employeeId) REFERENCES employees(id),
      FOREIGN KEY (leaveTypeId) REFERENCES leaveTypes(id),
      UNIQUE(employeeId, leaveTypeId, year)
    );
    CREATE TABLE IF NOT EXISTS insurance (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL UNIQUE,
      socialInsuranceNumber TEXT NOT NULL,
      healthInsuranceNumber TEXT NOT NULL,
      healthInsurancePlace TEXT NOT NULL,
      registrationDate TEXT NOT NULL,
      socialInsuranceRate REAL NOT NULL DEFAULT 8,
      healthInsuranceRate REAL NOT NULL DEFAULT 1.5,
      unemploymentInsuranceRate REAL NOT NULL DEFAULT 1,
      baseSalaryForInsurance REAL NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('active', 'suspended', 'terminated')),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (employeeId) REFERENCES employees(id)
    );
    CREATE TABLE IF NOT EXISTS holidays (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      year INTEGER NOT NULL,
      isPaid INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(date, year)
    );
    CREATE TABLE IF NOT EXISTS calendarEvents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      startDateTime TEXT NOT NULL,
      endDateTime TEXT NOT NULL,
      allDay INTEGER NOT NULL DEFAULT 0,
      eventType TEXT NOT NULL CHECK(eventType IN ('meeting', 'training', 'deadline', 'other')),
      createdBy TEXT NOT NULL,
      departmentId TEXT,
      employeeId TEXT,
      isPublic INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (createdBy) REFERENCES users(id),
      FOREIGN KEY (departmentId) REFERENCES departments(id),
      FOREIGN KEY (employeeId) REFERENCES employees(id)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('info', 'warning', 'success', 'error')),
      isRead INTEGER NOT NULL DEFAULT 0,
      link TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS auditLogs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      action TEXT NOT NULL,
      tableName TEXT NOT NULL,
      recordId TEXT NOT NULL,
      oldValues TEXT,
      newValues TEXT,
      ipAddress TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(departmentId);
    CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(managerId);
    CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employeeId, date);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leaveRequests(employeeId);
    CREATE INDEX IF NOT EXISTS idx_salaries_employee_period ON salaries(employeeId, year, month);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId, isRead);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON auditLogs(userId);
  `);
  console.log('Khởi Tạo Cơ Sở Dữ Liệu Thành Công!');
};
createTables();