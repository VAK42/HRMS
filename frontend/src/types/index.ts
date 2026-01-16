export interface Employee {
  id: number
  employeeCode: string
  fullName: string
  email: string
  phone: string
  birthday: string
  gender: string
  idNumber: string
  address: string
  departmentId: number
  positionId: number
  startDate: string
  status: string
  avatarUrl: string
  createdAt: string
  departmentName?: string
  positionName?: string
}
export interface Department {
  id: number
  name: string
  parentId: number | null
  managerId: number | null
  createdAt: string
  employeeCount?: number
}
export interface Position {
  id: number
  name: string
  departmentId: number
  level: number
}
export interface Contract {
  id: number
  employeeId: number
  contractCode: string
  contractType: string
  startDate: string
  endDate: string | null
  baseSalary: number
  status: string
}
export interface LeaveRequest {
  id: number
  employeeId: number
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: string
  approvedBy: number | null
  createdAt: string
  fullName?: string
}
export interface Reward {
  id: number
  employeeId: number
  rewardType: string
  decisionNumber: string
  decisionDate: string
  amount: number
  reason: string
}
export interface Discipline {
  id: number
  employeeId: number
  disciplineType: string
  decisionNumber: string
  decisionDate: string
  reason: string
}
export interface RecruitmentPost {
  id: number
  title: string
  departmentId: number
  positionId: number
  jobType: string
  salaryMin: number
  salaryMax: number
  deadline: string
  description: string
  requirements: string
  status: string
  candidateCount: number
  createdAt: string
}
export interface TrainingCourse {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  instructor: string
  location: string
  status: string
}
export interface SalaryRecord {
  id: number
  employeeId: number
  month: number
  year: number
  baseSalary: number
  allowances: number
  bonuses: number
  deductions: number
  netSalary: number
  status: string
}
export interface User {
  id: number
  username: string
  fullName: string
  role: string
  permissions: string
}
export interface ApiResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
export interface DashboardStats {
  totalEmployees: number
  totalDepartments: number
  pendingLeaves: number
  activeContracts: number
  departmentStats: { name: string; employeeCount: number }[]
  recentLeaves: LeaveRequest[]
}