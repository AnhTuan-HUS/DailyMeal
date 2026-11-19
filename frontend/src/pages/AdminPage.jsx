import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { authApi, ROLES, ROLE_LABELS, LOCKED_ADMIN_PERMS } from '@/services/authApi'

const TABS = [
  ['permissions', 'Quyền hạn', 'permission:manage'],
  ['matrix', 'Phân quyền cho vai trò', 'role:manage'],
  ['users', 'Gán vai trò cho tài khoản', 'user:manage'],
]

export default function AdminPage() {
  const { hasPermission } = useAuth()
  const visible = TABS.filter(t => hasPermission(t[2]))
  const [tab, setTab] = useState(visible[0]?.[0])

  if (!visible.length) return <div className="panel">Bạn không có quyền truy cập khu vực quản trị.</div>

  return (
    <section id="page-admin">
      <div className="section-head"><div><h3>Quản trị hệ thống</h3><p>Quản lý quyền hạn, vai trò và tài khoản.</p></div></div>
      <div className="tabs">
        {visible.map(([k, label]) => (
          <button key={k} id={'tab-' + k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {tab === 'permissions' && <PermissionsTab />}
      {tab === 'matrix' && <MatrixTab />}
      {tab === 'users' && <UsersTab />}
    </section>
  )
}

function PermissionsTab() {
  const toast = useToast()
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name: '', description: '' })
  const [err, setErr] = useState('')
  const load = useCallback(() => authApi.listPermissions().then(setList), [])
  useEffect(() => { load() }, [load])

  async function add(e) {
    e.preventDefault()
    try {
      await authApi.createPermission(form)
      setForm({ name: '', description: '' }); setErr(''); toast('Đã thêm quyền'); load()
    } catch (ex) { setErr(ex.message) }
  }

  return (
    <>
      <table className="admin-table">
        <thead><tr><th>Tên quyền</th><th>Mô tả</th></tr></thead>
        <tbody>{list.map(p => <tr key={p.name}><td><code>{p.name}</code></td><td>{p.description}</td></tr>)}</tbody>
      </table>
      <form className="panel admin-add" onSubmit={add}>
        <h4>Thêm quyền mới</h4>
        <input id="perm-name" placeholder="nhom:hanh_dong (vd report:view)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input id="perm-desc" placeholder="Mô tả" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        {err && <div className="auth-error">{err}</div>}
        <button id="perm-add" className="auth-submit pf-btn">Thêm quyền</button>
      </form>
    </>
  )
}

function MatrixTab() {
  const toast = useToast()
  const { refreshUser } = useAuth()
  const [perms, setPerms] = useState([])
  const [roles, setRoles] = useState(null)
  useEffect(() => { authApi.listPermissions().then(setPerms); authApi.listRoles().then(setRoles) }, [])
  if (!roles) return null

  async function toggle(role, perm) {
    const cur = roles[role]
    const next = cur.includes(perm) ? cur.filter(p => p !== perm) : [...cur, perm]
    try {
      await authApi.setRolePermissions(role, next)
      setRoles(r => ({ ...r, [role]: next }))
      refreshUser()
      toast('Đã lưu phân quyền')
    } catch (ex) { toast(ex.message) }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="admin-table">
        <thead><tr><th>Quyền</th>{ROLES.map(r => <th key={r}>{r}</th>)}</tr></thead>
        <tbody>
          {perms.map(p => (
            <tr key={p.name}>
              <td><code>{p.name}</code><div className="pf-muted">{p.description}</div></td>
              {ROLES.map(r => (
                <td key={r} style={{ textAlign: 'center' }}>
                  <input type="checkbox" id={`chk-${r}-${p.name}`}
                    checked={roles[r].includes(p.name)}
                    disabled={r === 'ADMIN' && LOCKED_ADMIN_PERMS.includes(p.name)}
                    onChange={() => toggle(r, p.name)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UsersTab() {
  const toast = useToast()
  const { user: me, refreshUser } = useAuth()
  const [users, setUsers] = useState([])
  const load = useCallback(() => authApi.listUsers().then(setUsers), [])
  useEffect(() => { load() }, [load])

  async function change(id, role) {
    try {
      await authApi.assignRole(id, role)
      toast('Đã gán vai trò'); load(); refreshUser()
    } catch (ex) { toast(ex.message) }
  }

  return (
    <table className="admin-table">
      <thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th></tr></thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td>{u.fullName}{u.id === me.id && <span className="chip"> bạn</span>}</td>
            <td>{u.email}</td>
            <td>
              <select id={'role-' + u.email} value={u.role} disabled={u.id === me.id} onChange={e => change(u.id, e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r} — {ROLE_LABELS[r]}</option>)}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}