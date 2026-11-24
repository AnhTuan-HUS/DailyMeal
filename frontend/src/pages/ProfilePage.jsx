import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { authApi, ROLE_LABELS } from '@/services/authApi'
import { getInitials } from '@/utils/user'

const ADMIN_PERMS = ['user:manage', 'role:manage', 'permission:manage']

export default function ProfilePage() {
  const { user, refreshUser, hasPermission } = useAuth()
  const toast = useToast()

  const [name, setName] = useState(user.fullName)
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPw, setLoadingPw] = useState(false)
  const [err, setErr] = useState({ profile: '', pw: '' })

  const isAdmin = ADMIN_PERMS.some(hasPermission)

  async function saveProfile(e) {
    e.preventDefault()
    if (!name.trim()) {
      setErr(x => ({ ...x, profile: 'Họ và tên không được để trống' }))
      return
    }
    setLoadingProfile(true)
    try {
      await authApi.updateProfile(user.id, { fullName: name.trim() })
      refreshUser()
      setErr(x => ({ ...x, profile: '' }))
      toast('Đã cập nhật thông tin cá nhân thành công!')
    } catch (ex) {
      setErr(x => ({ ...x, profile: ex.message || 'Không thể cập nhật hồ sơ' }))
    } finally {
      setLoadingProfile(false)
    }
  }

  async function savePassword(e) {
    e.preventDefault()
    if (!pw.oldPassword) {
      return setErr(x => ({ ...x, pw: 'Vui lòng nhập mật khẩu hiện tại' }))
    }
    if (pw.newPassword.length < 6) {
      return setErr(x => ({ ...x, pw: 'Mật khẩu mới phải có ít nhất 6 ký tự' }))
    }
    if (pw.newPassword !== pw.confirm) {
      return setErr(x => ({ ...x, pw: 'Mật khẩu xác nhận không khớp' }))
    }

    setLoadingPw(true)
    try {
      await authApi.changePassword(user.id, pw)
      setPw({ oldPassword: '', newPassword: '', confirm: '' })
      setErr(x => ({ ...x, pw: '' }))
      toast('Đã thay đổi mật khẩu thành công!')
    } catch (ex) {
      setErr(x => ({ ...x, pw: ex.message || 'Không thể đổi mật khẩu' }))
    } finally {
      setLoadingPw(false)
    }
  }

  return (
    <section id="page-profile" className="pf-page">
      {/* Hero card */}
      <div className="pf-hero">
        <div className="pf-hero-main">
          <div className="avatar pf-avatar-large">{getInitials(user.fullName)}</div>
          <div className="pf-hero-info">
            <h3>{user.fullName}</h3>
            <div className="pf-hero-email">{user.email}</div>
            <div className="pf-badges">
              <span className="badge-role">
                {ROLE_LABELS[user.role] || 'Thành viên gia đình'} &middot; {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 cột */}
      <div className="pf-grid">
        {/* Thông tin cá nhân */}
        <form className="pf-card-form" onSubmit={saveProfile}>
          <div className="pf-header">
            <h4>Thông tin cá nhân</h4>
            <p>Cập nhật họ tên và thông tin tài khoản</p>
          </div>

          <div className="pf-field">
            <label htmlFor="pf-name">Họ và tên</label>
            <input
              id="pf-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className="pf-field">
            <label htmlFor="pf-email">Email (không thể đổi)</label>
            <input
              id="pf-email"
              type="email"
              value={user.email}
              disabled
            />
          </div>

          <div className="pf-field">
            <label>Vai trò</label>
            <input
              type="text"
              value={ROLE_LABELS[user.role] || 'Thành viên gia đình'}
              disabled
            />
          </div>

          {err.profile && <div className="pf-error">{err.profile}</div>}

          <button id="pf-save" type="submit" className="pf-submit-btn" disabled={loadingProfile}>
            {loadingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>

        {/* Đổi mật khẩu */}
        <form className="pf-card-form" onSubmit={savePassword}>
          <div className="pf-header">
            <h4>Đổi mật khẩu</h4>
            <p>Mật khẩu nên có ít nhất 6 ký tự, kết hợp chữ và số</p>
          </div>

          <div className="pf-field">
            <label htmlFor="pf-oldPassword">Mật khẩu hiện tại</label>
            <input
              id="pf-oldPassword"
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              value={pw.oldPassword}
              onChange={e => setPw(p => ({ ...p, oldPassword: e.target.value }))}
            />
          </div>

          <div className="pf-field">
            <label htmlFor="pf-newPassword">Mật khẩu mới</label>
            <input
              id="pf-newPassword"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={pw.newPassword}
              onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))}
            />
          </div>

          <div className="pf-field">
            <label htmlFor="pf-confirm">Xác nhận mật khẩu mới</label>
            <input
              id="pf-confirm"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={pw.confirm}
              onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
            />
          </div>

          {err.pw && <div className="pf-error">{err.pw}</div>}

          <button id="pf-change-pw" type="submit" className="pf-submit-btn" disabled={loadingPw}>
            {loadingPw ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>

      {/* Tính năng tài khoản */}
      <div className="pf-permissions-card">
        <div className="pf-header">
          <h4>Tính năng khả dụng</h4>
          <p>Các quyền đã được phân bổ cho tài khoản của bạn</p>
        </div>

        <div className="pf-features-list">
          <div className="pf-feature-item">
            <span className="pf-feature-icon">&#10003;</span>
            <div>
              <strong>Lên thực đơn tuần</strong>
              <div className="pf-feature-desc">Phân bổ món ăn 7 ngày, cân bằng calo</div>
            </div>
          </div>

          <div className="pf-feature-item">
            <span className="pf-feature-icon">&#10003;</span>
            <div>
              <strong>Quản lý giỏ đi chợ</strong>
              <div className="pf-feature-desc">Gom nguyên liệu theo quầy mua sắm</div>
            </div>
          </div>

          <div className="pf-feature-item">
            <span className="pf-feature-icon">&#10003;</span>
            <div>
              <strong>Sổ tay nấu ăn</strong>
              <div className="pf-feature-desc">Hướng dẫn nấu ăn trực quan, hẹn giờ</div>
            </div>
          </div>

          <div className="pf-feature-item">
            <span className="pf-feature-icon">&#10003;</span>
            <div>
              <strong>Hồ sơ khẩu vị</strong>
              <div className="pf-feature-desc">Quản lý dị ứng, khẩu vị từng thành viên</div>
            </div>
          </div>

          {isAdmin && (
            <div className="pf-feature-item pf-feature-admin">
              <span className="pf-feature-icon pf-feature-icon-admin">&#9733;</span>
              <div>
                <strong>Quyền quản trị viên</strong>
                <div className="pf-feature-desc">Quản lý tài khoản, phân quyền, dữ liệu hệ thống</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
