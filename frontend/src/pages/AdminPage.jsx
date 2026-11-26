import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { authApi, ROLES, ROLE_LABELS, LOCKED_ADMIN_PERMS } from '@/services/authApi'
import { ingredientsApi } from '@/services'

const TABS = [
  ['ingredients', 'Nguyên liệu (API)', 'ingredient:edit'],
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
      <div className="section-head"><div><h3>Quản trị hệ thống</h3><p>Quản lý danh mục nguyên liệu, quyền hạn, vai trò và tài khoản.</p></div></div>
      <div className="tabs">
        {visible.map(([k, label]) => (
          <button key={k} id={'tab-' + k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {tab === 'ingredients' && <IngredientsApiTab />}
      {tab === 'permissions' && <PermissionsTab />}
      {tab === 'matrix' && <MatrixTab />}
      {tab === 'users' && <UsersTab />}
    </section>
  )
}

function IngredientsApiTab() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 10, total_items: 0, total_pages: 1 })
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({
    code: '',
    ingredient_name: '',
    food_group: 'Rau, quả, củ dùng làm rau',
    market_stall: 'Quầy rau củ',
    waste_rate_percent: 0,
  })

  const load = useCallback(async (targetPage = page, keyword = q) => {
    setLoading(true)
    setErr('')
    try {
      const res = await ingredientsApi.list({ q: keyword || undefined, page: targetPage, limit: 10 })
      setItems(res.items)
      setMeta(res.meta)
    } catch (ex) {
      setErr(ex.message || 'Không thể tải danh sách nguyên liệu từ Backend')
    } finally {
      setLoading(false)
    }
  }, [page, q])

  useEffect(() => {
    load(page, q)
  }, [load, page, q])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.code.trim() || !form.ingredient_name.trim()) {
      setErr('Vui lòng nhập mã và tên nguyên liệu')
      return
    }
    try {
      await ingredientsApi.create({
        ...form,
        code: form.code.trim().toUpperCase(),
        ingredient_name: form.ingredient_name.trim(),
        waste_rate_percent: Number(form.waste_rate_percent) || 0,
      })
      toast('Đã thêm nguyên liệu mới vào PostgreSQL!')
      setForm(f => ({ ...f, code: '', ingredient_name: '' }))
      load(1, q)
    } catch (ex) {
      setErr(ex.message)
    }
  }

  async function handleDelete(id, name) {
    try {
      await ingredientsApi.remove(id)
      toast(`Đã xóa "${name}"`)
      load(page, q)
    } catch (ex) {
      toast(ex.message)
    }
  }

  return (
    <>
      <div className="catalog-toolbar" style={{ marginBottom: 14 }}>
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1) }}
          placeholder="⌕ Tìm nguyên liệu trong PostgreSQL (481 nguyên liệu)..."
        />
        <span className="pf-muted" style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>
          Tổng: <strong>{meta.total_items}</strong> nguyên liệu • Trang {meta.page}/{meta.total_pages || 1}
        </span>
      </div>

      {err && <div className="auth-error" style={{ marginBottom: 12 }}>{err}</div>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID / Mã</th>
            <th>Tên nguyên liệu</th>
            <th>Nhóm thực phẩm</th>
            <th>Quầy chợ</th>
            <th>Thải bỏ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 18 }}>Đang tải dữ liệu từ Backend API...</td></tr>
          ) : items.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 18 }}>Không tìm thấy nguyên liệu phù hợp.</td></tr>
          ) : (
            items.map(it => (
              <tr key={it.ingredient_id}>
                <td><code>{it.code}</code></td>
                <td><strong>{it.ingredient_name}</strong></td>
                <td>{it.food_group}</td>
                <td>{it.market_stall}</td>
                <td>{it.waste_rate_percent}%</td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="link-btn"
                    style={{ color: '#b84729' }}
                    onClick={() => handleDelete(it.ingredient_id, it.ingredient_name)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {meta.total_pages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button
            type="button"
            className="btn-plan-outline"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            ← Trang trước
          </button>
          <button
            type="button"
            className="btn-plan-outline"
            disabled={page >= meta.total_pages}
            onClick={() => setPage(p => p + 1)}
          >
            Trang sau →
          </button>
        </div>
      )}

      <form className="panel admin-add" onSubmit={handleCreate} style={{ marginTop: 16 }}>
        <h4>Thêm nguyên liệu mới (POST /api/v1/ingredients)</h4>
        <input
          placeholder="Mã nguyên liệu (VD: RAU_CAI_NGOT)"
          value={form.code}
          onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
        />
        <input
          placeholder="Tên nguyên liệu (VD: Rau cải ngọt)"
          value={form.ingredient_name}
          onChange={e => setForm(f => ({ ...f, ingredient_name: e.target.value }))}
        />
        <select value={form.market_stall} onChange={e => setForm(f => ({ ...f, market_stall: e.target.value }))}>
          <option value="Quầy rau củ">Quầy rau củ</option>
          <option value="Quầy thịt & hải sản">Quầy thịt & hải sản</option>
          <option value="Quầy trứng & đậu">Quầy trứng & đậu</option>
          <option value="Quầy gia vị & đồ khô">Quầy gia vị & đồ khô</option>
        </select>
        <button type="submit" className="auth-submit pf-btn">Thêm nguyên liệu</button>
      </form>
    </>
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
