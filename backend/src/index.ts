import express from 'express'
import cors from 'cors'
import db from './database'
const app = express()
const PORT = 3001
app.use(cors())
app.use(express.json())
const tableSearchFields: Record<string, string[]> = {
  employees: ['fullName', 'employeeCode', 'email', 'phone'],
  departments: ['name', 'code'],
  positions: ['name'],
  degrees: ['institution', 'major'],
  familyMembers: ['fullName', 'relationship'],
  contracts: ['contractCode', 'contractType'],
  leaveRequests: ['leaveType', 'reason'],
  rewards: ['rewardType', 'reason'],
  disciplines: ['disciplineType', 'reason'],
  salaryAdjustments: ['reason'],
  appointments: ['newPosition', 'reason'],
  transfers: ['reason'],
  terminations: ['reason'],
  recruitmentPosts: ['title', 'requirements'],
  trainingCourses: ['name', 'description'],
  trainingParticipants: [],
  salaryRecords: [],
  kpiRecords: ['period'],
  documents: ['documentName', 'documentType'],
  healthRecords: ['diagnosis', 'treatment'],
  socialInsurance: ['insuranceNumber'],
  foreignExits: ['country', 'purpose'],
  visits: ['purpose', 'visitorName'],
  safetyEquipment: ['equipmentName'],
  systemRoles: ['name'],
  users: ['username'],
  catalog: ['name', 'code', 'catalogType'],
  config: ['configKey', 'configValue'],
  scheduleEvents: ['title', 'eventType'],
}
const tablesWithEmployee = ['degrees', 'familyMembers', 'contracts', 'leaveRequests', 'rewards', 'disciplines', 'salaryAdjustments', 'appointments', 'transfers', 'terminations', 'trainingParticipants', 'salaryRecords', 'kpiRecords', 'documents', 'healthRecords', 'socialInsurance', 'foreignExits', 'scheduleEvents', 'visits']
const createCrudRoutes = (tableName: string, idField = 'id') => {
  const router = express.Router()
  const searchFields = tableSearchFields[tableName] || []
  const hasEmployee = tablesWithEmployee.includes(tableName)
  router.get('/', (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', ...filters } = req.query
      const offset = (Number(page) - 1) * Number(limit)
      let whereClause = '1=1'
      const params: any[] = []
      if (search && searchFields.length > 0) {
        const searchConditions = searchFields.map(f => `t.${f} LIKE ?`).join(' OR ')
        whereClause += ` AND (${searchConditions})`
        const searchTerm = `%${search}%`
        searchFields.forEach(() => params.push(searchTerm))
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'limit' && key !== 'search') {
          whereClause += ` AND t.${key} = ?`
          params.push(value)
        }
      })
      let selectClause = 't.*'
      let fromClause = `${tableName} t`
      if (hasEmployee) {
        selectClause += ', e.fullName as employeeName, e.employeeCode as empCode'
        fromClause += ' LEFT JOIN employees e ON t.employeeId = e.id'
      }
      const countStmt = db.prepare(`SELECT COUNT(*) as total FROM ${fromClause} WHERE ${whereClause}`)
      const total = (countStmt.get(...params) as { total: number }).total
      const dataStmt = db.prepare(`SELECT ${selectClause} FROM ${fromClause} WHERE ${whereClause} ORDER BY t.${idField} DESC LIMIT ? OFFSET ?`)
      const data = dataStmt.all(...params, Number(limit), offset)
      res.json({ data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })
  router.get('/:id', (req, res) => {
    try {
      let selectClause = 't.*'
      let fromClause = `${tableName} t`
      if (hasEmployee) {
        selectClause += ', e.fullName as employeeName, e.employeeCode as empCode'
        fromClause += ' LEFT JOIN employees e ON t.employeeId = e.id'
      }
      const stmt = db.prepare(`SELECT ${selectClause} FROM ${fromClause} WHERE t.${idField} = ?`)
      const row = stmt.get(req.params.id)
      if (!row) return res.status(404).json({ error: 'Không Tìm Thấy' })
      res.json(row)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })
  router.post('/', (req, res) => {
    try {
      const columns = Object.keys(req.body)
      const values = Object.values(req.body)
      const placeholders = columns.map(() => '?').join(', ')
      const stmt = db.prepare(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`)
      const result = stmt.run(...values)
      res.status(201).json({ id: result.lastInsertRowid, ...req.body })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })
  router.put('/:id', (req, res) => {
    try {
      const updates = Object.keys(req.body).map(key => `${key} = ?`).join(', ')
      const values = [...Object.values(req.body), req.params.id]
      const stmt = db.prepare(`UPDATE ${tableName} SET ${updates} WHERE ${idField} = ?`)
      stmt.run(...values)
      res.json({ id: req.params.id, ...req.body })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })
  router.delete('/:id', (req, res) => {
    try {
      const stmt = db.prepare(`DELETE FROM ${tableName} WHERE ${idField} = ?`)
      stmt.run(req.params.id)
      res.json({ message: 'Xóa Thành Công' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })
  return router
}
app.use('/api/departments', createCrudRoutes('departments'))
app.use('/api/positions', createCrudRoutes('positions'))
app.use('/api/employees', createCrudRoutes('employees'))
app.use('/api/degrees', createCrudRoutes('degrees'))
app.use('/api/familyMembers', createCrudRoutes('familyMembers'))
app.use('/api/contracts', createCrudRoutes('contracts'))
app.use('/api/leaveRequests', createCrudRoutes('leaveRequests'))
app.use('/api/rewards', createCrudRoutes('rewards'))
app.use('/api/disciplines', createCrudRoutes('disciplines'))
app.use('/api/salaryAdjustments', createCrudRoutes('salaryAdjustments'))
app.use('/api/appointments', createCrudRoutes('appointments'))
app.use('/api/transfers', createCrudRoutes('transfers'))
app.use('/api/terminations', createCrudRoutes('terminations'))
app.use('/api/recruitmentPosts', createCrudRoutes('recruitmentPosts'))
app.use('/api/trainingCourses', createCrudRoutes('trainingCourses'))
app.use('/api/trainingParticipants', createCrudRoutes('trainingParticipants'))
app.use('/api/salaryRecords', createCrudRoutes('salaryRecords'))
app.use('/api/kpiRecords', createCrudRoutes('kpiRecords'))
app.use('/api/documents', createCrudRoutes('documents'))
app.use('/api/healthRecords', createCrudRoutes('healthRecords'))
app.use('/api/socialInsurance', createCrudRoutes('socialInsurance'))
app.use('/api/foreignExits', createCrudRoutes('foreignExits'))
app.use('/api/visits', createCrudRoutes('visits'))
app.use('/api/safetyEquipment', createCrudRoutes('safetyEquipment'))
app.use('/api/systemRoles', createCrudRoutes('systemRoles'))
app.use('/api/users', createCrudRoutes('users'))
app.use('/api/catalog', createCrudRoutes('catalog'))
app.use('/api/config', createCrudRoutes('config'))
app.use('/api/scheduleEvents', createCrudRoutes('scheduleEvents'))
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body
    const user = db.prepare('SELECT u.*, r.name as roleName, r.permissions, e.fullName FROM users u LEFT JOIN systemRoles r ON u.roleId = r.id LEFT JOIN employees e ON u.employeeId = e.id WHERE u.username = ? AND u.password = ? AND u.isActive = 1').get(username, password) as any
    if (!user) return res.status(401).json({ error: 'Thông Tin Đăng Nhập Không Hợp Lệ' })
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000
    db.prepare('INSERT INTO sessions (userId, token, expiresAt) VALUES (?, ?, ?)').run(user.id, token, expiresAt)
    res.json({ token, user: { id: user.id, username: user.username, fullName: user.fullName || 'Lan Nhi', role: user.roleName, permissions: user.permissions } })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
app.post('/api/auth/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
    res.json({ message: 'Đăng Xuất Thành Công' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Chưa Cung Cấp Token' })
    const session = db.prepare('SELECT * FROM sessions WHERE token = ? AND expiresAt > ?').get(token, Date.now()) as any
    if (!session) return res.status(401).json({ error: 'Token Không Hợp Lệ Hoặc Đã Hết Hạn' })
    const user = db.prepare('SELECT u.*, r.name as roleName, r.permissions, e.fullName FROM users u LEFT JOIN systemRoles r ON u.roleId = r.id LEFT JOIN employees e ON u.employeeId = e.id WHERE u.id = ?').get(session.userId) as any
    res.json({ id: user.id, username: user.username, fullName: user.fullName || 'Lan Nhi', role: user.roleName, permissions: user.permissions })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalEmployees = (db.prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'Hoạt Động'").get() as any).count
    const totalDepartments = (db.prepare('SELECT COUNT(*) as count FROM departments').get() as any).count
    const pendingLeaves = (db.prepare("SELECT COUNT(*) as count FROM leaveRequests WHERE status = 'Chờ Duyệt'").get() as any).count
    const activeContracts = (db.prepare("SELECT COUNT(*) as count FROM contracts WHERE status = 'Hoạt Động'").get() as any).count
    const departmentStats = db.prepare(`
        SELECT d.name, COUNT(e.id) as employeeCount, COALESCE(AVG(c.baseSalary), 0) as avgSalary 
        FROM departments d 
        LEFT JOIN employees e ON d.id = e.departmentId 
        LEFT JOIN contracts c ON e.id = c.employeeId AND c.status = 'Hoạt Động'
        GROUP BY d.id
    `).all()
    const monthlyHiresRaw = db.prepare("SELECT strftime('%m', startDate) as month, COUNT(*) as count FROM employees WHERE strftime('%Y', startDate) = strftime('%Y', 'now') GROUP BY month").all() as any[]
    const monthlyHires = Array(12).fill(0).map((_, i) => {
      const m = String(i + 1).padStart(2, '0')
      return monthlyHiresRaw.find(r => r.month === m)?.count || 0
    })
    const monthlyResignsRaw = db.prepare("SELECT strftime('%m', effectiveDate) as month, COUNT(*) as count FROM terminations WHERE strftime('%Y', effectiveDate) = strftime('%Y', 'now') GROUP BY month").all() as any[]
    const monthlyResigns = Array(12).fill(0).map((_, i) => {
      const m = String(i + 1).padStart(2, '0')
      return monthlyResignsRaw.find(r => r.month === m)?.count || 0
    })
    const performanceDataRaw = db.prepare("SELECT month, AVG(actualScore) as score FROM kpiRecords WHERE year = CAST(strftime('%Y', 'now') AS INTEGER) GROUP BY month").all() as any[]
    const performanceData = Array(12).fill(0).map((_, i) => {
      return Math.round(performanceDataRaw.find(r => r.month === i + 1)?.score || 0)
    })
    const topPerformers = db.prepare(`
        SELECT e.fullName as name, d.name as department, k.actualScore as score 
        FROM kpiRecords k 
        JOIN employees e ON k.employeeId = e.id 
        LEFT JOIN departments d ON e.departmentId = d.id 
        ORDER BY k.actualScore DESC LIMIT 5
    `).all()
    const employeesLocations = db.prepare("SELECT address FROM employees WHERE status='Hoạt Động'").all() as any[]
    const locMap: Record<string, number> = {}
    employeesLocations.forEach(e => {
      const parts = e.address ? e.address.split(',') : []
      const city = parts.length > 0 ? parts[parts.length - 1].trim() : 'Không Xác Định'
      locMap[city] = (locMap[city] || 0) + 1
    })
    const officeLocations = Object.entries(locMap).map(([city, count]) => ({ city, employees: count, status: 'Hoạt Động' })).slice(0, 5)
    const upcomingEvents = db.prepare(`
        SELECT title, startDate as date, 'Cuộc Họp' as type FROM scheduleEvents WHERE startDate >= date('now')
        UNION ALL
        SELECT name as title, startDate as date, 'Đào Tạo' as type FROM trainingCourses WHERE startDate >= date('now')
        ORDER BY date ASC LIMIT 5
    `).all()
    const recentHires = db.prepare(`
        SELECT e.fullName as name, p.name as position, e.startDate as date 
        FROM employees e 
        LEFT JOIN positions p ON e.positionId = p.id 
        ORDER BY e.startDate DESC LIMIT 5
    `).all()
    const recentActivities = db.prepare(`SELECT 'Nhân Viên Mới' as action, fullName as user, createdAt as time FROM employees ORDER BY createdAt DESC LIMIT 5`).all()
    const recentLeavesApproved = db.prepare("SELECT 'Nghỉ Phép Đã Duyệt' as action, e.fullName as user, lr.createdAt as time FROM leaveRequests lr JOIN employees e ON lr.employeeId = e.id WHERE lr.status = 'Đã Duyệt' ORDER BY lr.createdAt DESC LIMIT 5").all()
    const combinedActivities = [...recentActivities, ...recentLeavesApproved].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)
    const skillsDistribution = db.prepare(`SELECT major as skill, COUNT(*) as count FROM degrees GROUP BY major ORDER BY count DESC LIMIT 5`).all()
    const recentLeaves = db.prepare('SELECT lr.*, e.fullName FROM leaveRequests lr JOIN employees e ON lr.employeeId = e.id ORDER BY lr.createdAt DESC LIMIT 5').all()
    res.json({
      totalEmployees, totalDepartments, pendingLeaves, activeContracts, departmentStats, recentLeaves,
      monthlyHires, monthlyResigns, performanceData, topPerformers, officeLocations, upcomingEvents,
      recentHires, recentActivities: combinedActivities, skillsDistribution
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
app.get('/api/reports/employees', (req, res) => {
  try {
    const employees = db.prepare(`
      SELECT e.*, d.name as departmentName, p.name as positionName, c.baseSalary, c.contractType
      FROM employees e
      LEFT JOIN departments d ON e.departmentId = d.id
      LEFT JOIN positions p ON e.positionId = p.id
      LEFT JOIN contracts c ON e.id = c.employeeId AND c.status = 'Hoạt Động'
      ORDER BY e.id
    `).all()
    res.json(employees)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
app.get('/api/orgChart', (req, res) => {
  try {
    const employees = db.prepare(`
      SELECT e.id, e.fullName, e.employeeCode, p.name as position, d.name as department, e.managerId
      FROM employees e
      LEFT JOIN positions p ON e.positionId = p.id
      LEFT JOIN departments d ON e.departmentId = d.id
      WHERE e.status = 'Hoạt Động'
    `).all()
    res.json(employees)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
app.get('/api/workSchedule', (req, res) => {
  try {
    const { month, year } = req.query
    const schedules = db.prepare(`
      SELECT ws.*, e.fullName, e.employeeCode
      FROM workSchedule ws
      JOIN employees e ON ws.employeeId = e.id
      WHERE strftime('%m', ws.date) = ? AND strftime('%Y', ws.date) = ?
    `).all(String(month).padStart(2, '0'), year)
    res.json(schedules)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
app.get('/api/safety/stats', (req, res) => {
  try {
    const totalEmployees = (db.prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'Hoạt Động'").get() as any).count
    const equipmentIssued = (db.prepare("SELECT COUNT(*) as count FROM safetyEquipment WHERE status = 'Hoạt Động'").get() as any).count
    const incidentsCount = (db.prepare("SELECT COUNT(*) as count FROM safetyIncidents").get() as any).count
    const employeesWithEquipment = (db.prepare("SELECT COUNT(DISTINCT employeeId) as count FROM safetyEquipment WHERE status = 'Hoạt Động'").get() as any).count
    const compliance = totalEmployees > 0 ? Math.round((employeesWithEquipment / totalEmployees) * 100) : 100
    const incidents = db.prepare("SELECT severity FROM safetyIncidents").all() as any[]
    let penalty = 0
    incidents.forEach(inc => {
      if (inc.severity === 'Thấp') penalty += 2
      else if (inc.severity === 'Trung Bình') penalty += 5
      else if (inc.severity === 'Cao') penalty += 10
      else if (inc.severity === 'Nghiêm Trọng') penalty += 20
    })
    const safetyScore = Math.max(0, 100 - penalty)

    res.json({ safetyScore, equipmentIssued, incidentsCount, compliance: `${compliance}%` })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
app.listen(PORT, () => {
  console.log(`Máy Chủ Đang Chạy Tại http://localhost:${PORT}`)
})