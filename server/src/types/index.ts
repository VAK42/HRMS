export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'hrro' | 'manager' | 'employee';
  employeeId: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}
export interface Department {
  id: string;
  name: string;
  code: string;
  parentDepartmentId: string;
  managerId: string;
  createdAt: string;
  updatedAt: string;
}
export interface Position {
  id: string;
  name: string;
  code: string;
  level: number;
  departmentId: string;
  baseSalary: number;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}
export interface Contract {
  id: string;
  contractNumber: string;
  employeeId: string;
  contractType: 'probation' | 'definite' | 'indefinite';
  startDate: string;
  endDate: string | null;
  grossSalary: number;
  salaryType: 'gross' | 'net';
  workingHoursPerDay: number;
  workingDaysPerWeek: number;
  content: string;
  signedDate: string | null;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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
  otherDeductions: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  paidDate: string | null;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface Allowance {
  id: string;
  name: string;
  code: string;
  amount: number;
  isTaxable: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}
export interface EmployeeAllowance {
  id: string;
  employeeId: string;
  allowanceId: string;
  amount: number;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
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
  status: 'pending' | 'approved' | 'rejected';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  notes: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface LeaveType {
  id: string;
  name: string;
  code: string;
  paidLeave: number;
  maxDaysPerYear: number;
  description: string;
  createdAt: string;
  updatedAt: string;
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
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  carriedOver: number;
  createdAt: string;
  updatedAt: string;
}
export interface Insurance {
  id: string;
  employeeId: string;
  socialInsuranceNumber: string;
  healthInsuranceNumber: string;
  healthInsurancePlace: string;
  registrationDate: string;
  socialInsuranceRate: number;
  healthInsuranceRate: number;
  unemploymentInsuranceRate: number;
  baseSalaryForInsurance: number;
  status: 'active' | 'suspended' | 'terminated';
  createdAt: string;
  updatedAt: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
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