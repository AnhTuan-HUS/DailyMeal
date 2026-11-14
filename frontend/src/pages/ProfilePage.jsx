import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { authApi, ROLE_LABELS } from '@/services/authApi'
import { getInitials } from '@/utils/user'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(user.fullName)
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [err, setErr] = useState({ profile: '', pw: '' })

  async function saveProfile(e) {
    e.preventDefault()
    try {
      await authApi.updateProfile(user.id, { fullName: name })
      refreshUser()
      setErr(x => ({ ...x, profile: '' }))
      toast('Đã cập nhật hồ sơ')
    } catch (ex) { setErr(x => ({ ...x, profile: ex.message })) }
  }

  async function savePassword(e) {
    e.preventDefault()
    if (pw.newPassword !== pw.confirm) return setErr(x => ({ ...x, pw: 'Mật khẩu xác nhận không khớp' }))
    try {
      await authApi.changePassword(user.id, pw)
      setPw({ oldPassword: '', newPassword: '', confirm: '' })
      setErr(x => ({ ...x, pw: '' }))
      toast('Đã đổi mật khẩu')
    } catch (ex) { setErr(x => ({ ...x, pw: ex.message })) }
  }

  return (
    <section id="page-profile">
      <div className="section-head"><div><h3>Hồ sơ cá nhân</h3><p>Thông tin tài khoản và vai trò của bạn.</p></div></div>

      <div className="panel pf-card">
        <div className="avatar pf-avatar">{getInitials(user.fullName)}</div>
        <div>
          <strong>{user.fullName}</strong>
          <div className="pf-muted">{user.email}</div>
          <span className="role-badge">{ROLE_LABELS[user.role]} · {user.role}</span>
        </div>
      </div>

      <form className="panel pf-form" onSubmit={saveProfile}>
        <h4>Thông tin cá nhân</h4>
        <label className="auth-field">Họ và tên
          <input id="pf-name" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label className="auth-field">Email (không thể đổi)
          <input value={user.email} disabled />
        </label>
        {err.profile && <div className="auth-error">{err.profile}</div>}
        <button id="pf-save" className="auth-submit pf-btn">Lưu thay đổi</button>
      </form>

      <form className="panel pf-form" onSubmit={savePassword}>
        <h4>Đổi mật khẩu</h4>
        {['oldPassword', 'newPassword', 'confirm'].map((k, i) => (
          <label className="auth-field" key={k}>{['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới'][i]}
            <input id={'pf-' + k} type="password" value={pw[k]} onChange={e => setPw(p => ({ ...p, [k]: e.target.value }))} />
          </label>
        ))}
        {err.pw && <div className="auth-error">{err.pw}</div>}
        <button id="pf-change-pw" className="auth-submit pf-btn">Đổi mật khẩu</button>
      </form>

      <div className="panel pf-form">
        <h4>Quyền của bạn ({user.permissions.length})</h4>
        <div className="perm-chips">
          {user.permissions.map(p => <span key={p} className="chip">{p}</span>)}
        </div>
      </div>
    </section>
  )
}