// ============================================================
// AUTH API (MOCK) - luu du lieu trong localStorage.
// Khi backend xong: thay thân tung ham bang http('/auth/...'),
// GIU NGUYEN ten ham + du lieu tra ve -> UI khong phai sua.
// Tuong ung bang DB: role, permission, role_permission, users.role_id
// ============================================================
const K = { users: 'dm_users', session: 'dm_session', roles: 'dm_roles', perms: 'dm_permissions' }

export const ROLES = ['GENERAL_USER', 'CONTENT_EDITOR', 'ADMIN']
export const ROLE_LABELS = {
  GENERAL_USER: 'Thành viên gia đình',
  CONTENT_EDITOR: 'Biên tập nội dung',
  ADMIN: 'Quản trị viên',
}

// Quyen toi thieu cua ADMIN - khong cho go de tranh tu khoa minh ra ngoai
export const LOCKED_ADMIN_PERMS = ['user:manage', 'role:manage', 'permission:manage']

const SEED_PERMISSIONS = [
  { name: 'recipe:view', description: 'Xem và tìm kiếm công thức' },
  { name: 'plan:manage', description: 'Lên và sửa thực đơn của mình' },
  { name: 'shopping:manage', description: 'Quản lý danh sách đi chợ' },
  { name: 'profile:edit', description: 'Sửa hồ sơ cá nhân' },
  { name: 'recipe:edit', description: 'Thêm, sửa, ẩn công thức' },
  { name: 'ingredient:edit', description: 'Thêm, sửa nguyên liệu và dinh dưỡng' },
  { name: 'user:manage', description: 'Xem danh sách và gán vai trò cho tài khoản' },
  { name: 'role:manage', description: 'Phân quyền cho vai trò' },
  { name: 'permission:manage', description: 'Quản lý danh mục quyền hạn' },
]

const BASE = ['recipe:view', 'plan:manage', 'shopping:manage', 'profile:edit']
const SEED_ROLES = {
  GENERAL_USER: BASE,
  CONTENT_EDITOR: [...BASE, 'recipe:edit', 'ingredient:edit'],
  ADMIN: SEED_PERMISSIONS.map(p => p.name),
}

// Tai khoan test co san (xem them TEST_ACCOUNTS.md o thu muc goc)
const SEED_USERS = [
  { id: 1, fullName: 'Quản Trị Viên', email: 'admin@dailymeal.vn', password: 'Admin@123', role: 'ADMIN' },
  { id: 2, fullName: 'Biên Tập Viên', email: 'editor@dailymeal.vn', password: 'Editor@123', role: 'CONTENT_EDITOR' },
  { id: 3, fullName: 'Nguyễn Văn An', email: 'an.nguyen@example.com', password: 'User@123', role: 'GENERAL_USER' },
]

const read = (key, seed) => {
  const raw = localStorage.getItem(key)
  if (raw) return JSON.parse(raw)
  localStorage.setItem(key, JSON.stringify(seed))
  return JSON.parse(JSON.stringify(seed))
}
const write = (key, val) => localStorage.setItem(key, JSON.stringify(val))
const delay = (ms = 250) => new Promise(r => setTimeout(r, ms))

const getUsers = () => read(K.users, SEED_USERS)
const getRoles = () => read(K.roles, SEED_ROLES)
const getPerms = () => read(K.perms, SEED_PERMISSIONS)

function toPublic(u) {
  return { id: u.id, fullName: u.fullName, email: u.email, role: u.role, permissions: getRoles()[u.role] || [] }
}
function saveSession(u) {
  const pub = toPublic(u)
  write(K.session, { id: pub.id })
  return pub
}

export const authApi = {
  // ---------- Xac thuc ----------
  async register({ fullName, email, password }) {
    await delay()
    const users = getUsers()
    const mail = email.trim().toLowerCase()
    if (users.some(u => u.email === mail)) throw new Error('Email này đã được đăng ký')
    // Luon gan GENERAL_USER - khong cho nguoi dung tu chon role
    const user = { id: Date.now(), fullName: fullName.trim(), email: mail, password, role: 'GENERAL_USER' }
    write(K.users, [...users, user])
    return saveSession(user)
  },

  async login({ email, password }) {
    await delay()
    const user = getUsers().find(u => u.email === email.trim().toLowerCase() && u.password === password)
    if (!user) throw new Error('Email hoặc mật khẩu không đúng')
    return saveSession(user)
  },

  async logout() {
    localStorage.removeItem(K.session)
  },

  // Lay lai user tu session (quyen luon moi nhat; user bi xoa -> null)
  getSession() {
    try {
      const s = JSON.parse(localStorage.getItem(K.session) || 'null')
      const u = s && getUsers().find(x => x.id === s.id)
      return u ? toPublic(u) : null
    } catch { return null }
  },

  // ---------- Ho so ----------
  async updateProfile(id, { fullName }) {
    await delay()
    if (fullName.trim().length < 2) throw new Error('Họ tên tối thiểu 2 ký tự')
    const users = getUsers().map(u => (u.id === id ? { ...u, fullName: fullName.trim() } : u))
    write(K.users, users)
    return toPublic(users.find(u => u.id === id))
  },

  async changePassword(id, { oldPassword, newPassword }) {
    await delay()
    const users = getUsers()
    const me = users.find(u => u.id === id)
    if (!me || me.password !== oldPassword) throw new Error('Mật khẩu hiện tại không đúng')
    if (newPassword.length < 6) throw new Error('Mật khẩu mới tối thiểu 6 ký tự')
    write(K.users, users.map(u => (u.id === id ? { ...u, password: newPassword } : u)))
  },

  // ---------- Quan tri (ADMIN) ----------
  async listPermissions() { await delay(100); return getPerms() },

  async createPermission({ name, description }) {
    await delay(100)
    const n = name.trim()
    if (!/^[a-z_]+:[a-z_]+$/.test(n)) throw new Error('Tên quyền dạng "nhom:hanh_dong", ví dụ report:view')
    const perms = getPerms()
    if (perms.some(p => p.name === n)) throw new Error('Quyền này đã tồn tại')
    write(K.perms, [...perms, { name: n, description: description.trim() }])
  },

  async listRoles() { await delay(100); return getRoles() },

  async setRolePermissions(role, permissions) {
    await delay(100)
    if (role === 'ADMIN' && !LOCKED_ADMIN_PERMS.every(p => permissions.includes(p)))
      throw new Error('ADMIN bắt buộc giữ các quyền quản trị')
    write(K.roles, { ...getRoles(), [role]: permissions })
  },

  async listUsers() {
    await delay(100)
    return getUsers().map(toPublic)
  },

  async assignRole(userId, role) {
    await delay(100)
    if (!ROLES.includes(role)) throw new Error('Vai trò không hợp lệ')
    const users = getUsers()
    const target = users.find(u => u.id === userId)
    if (target?.role === 'ADMIN' && role !== 'ADMIN' && users.filter(u => u.role === 'ADMIN').length === 1)
      throw new Error('Không thể hạ quyền ADMIN cuối cùng')
    write(K.users, users.map(u => (u.id === userId ? { ...u, role } : u)))
  },
}