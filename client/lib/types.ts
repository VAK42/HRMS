export interface User {
  id: string;
  email: string;
  role: 'hrro' | 'manager' | 'employee';
  employeeId: string;
  employee?: {
    id: string;
    fullName: string;
    employeeCode: string;
    isManager: number;
  };
}
export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  personalEmail: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationalId: string;
  nationalIdDate: string;
  nationalIdPlace: string;
  taxCode: string;
  bankAccount: string;
  bankName: string;
  bankBranch: string;
  permanentAddress: string;
  currentAddress: string;
  positionId: string;
  departmentId: string;
  managerId: string | null;
  isManager: number;
  hireDate: string;
  terminationDate: string | null;
  employmentStatus: 'active' | 'probation' | 'terminated' | 'resigned';
  employmentType: 'fullTime' | 'partTime' | 'contract' | 'intern';
  departmentName?: string;
  positionName?: string;
  managerName?: string;
}
export interface Department {
  id: string;
  name: string;
  code: string;
  parentDepartmentId: string | null;
  managerId: string | null;
  managerName?: string;
  employeeCount?: number;
}
export interface Position {
  id: string;
  name: string;
  code: string;
  level: number;
  departmentId: string;
  baseSalary: number;
  departmentName?: string;
  employeeCount?: number;
}
export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  checkInLate: number;
  checkOutEarly: number;
  workingHours: number;
  overtimeHours: number;
  status: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  notes: string;
  employeeName?: string;
  employeeCode?: string;
}
export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy: string | null;
  rejectionReason: string | null;
  employeeName?: string;
  leaveTypeName?: string;
}
export interface LeaveType {
  id: string;
  name: string;
  code: string;
  paidLeave: number;
  maxDaysPerYear: number;
}
export interface LeaveBalance {
  id: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}
export interface Contract {
  id: string;
  contractNumber: string;
  employeeId: string;
  contractType: 'probation' | 'definite' | 'indefinite';
  startDate: string;
  endDate: string | null;
  grossSalary: number;
  salaryType: string;
  workingHoursPerDay: number;
  workingDaysPerWeek: number;
  content: string;
  signedDate: string | null;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  employeeName?: string;
  employeeCode?: string;
}
export interface Salary {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  workingDays: number;
  standardWorkingDays: number;
  basicSalary: number;
  allowances: number;
  overtime: number;
  bonus: number;
  grossSalary: number;
  socialInsurance: number;
  healthInsurance: number;
  unemploymentInsurance: number;
  personalIncomeTax: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  employeeName?: string;
  employeeCode?: string;
}
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  probationEmployees: number;
  totalDepartments: number;
  todayAttendance: number;
  pendingLeaves: number;
  pendingAttendance: number;
}
export interface ChartData {
  name?: string;
  department?: string;
  status?: string;
  month?: string;
  count?: number;
  days?: number;
}
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}