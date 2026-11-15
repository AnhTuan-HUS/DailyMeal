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
      {/* ── Thẻ đại diện người dùng (Hero Profile Card) ── */}
      <div className="pf-hero">
        <div className="pf-hero-main">
          <div className="avatar pf-avatar-large">
            {getInitials(user.fullName)}
          </div>
          <div className="pf-hero-info">
            <h3>{user.fullName}</h3>
            <div className="pf-hero-email">{user.email}</div>
            <div className="pf-badges">
              <span className="badge-role">
                ★ {ROLE_LABELS[user.role] || 'Thành viên gia đình'}
              </span>
              <span className="badge-verified">
                ✓ Tài khoản đã xác thực
              </span>
            </div>
          </div>
        </div>

        <div className="pf-hero-meta">
          <div className="pf-meta-box">
            <small>Mã tài khoản</small>
            <strong>#DM-{user.id || '2026'}</strong>
          </div>
          <div className="pf-meta-box">
            <small>Trạng thái</small>
            <strong style={{ color: '#3b6b35' }}>Đang hoạt động</strong>
          </div>
        </div>
      </div>

      {/* ── Lưới 2 cột biểu mẫu cập nhật thông tin & mật khẩu ── */}
      <div className="pf-grid">
        {/* Cột 1: Thông tin cá nhân */}
        <form className="pf-card-form" onSubmit={saveProfile}>
          <div className="pf-header">
            <h4>👤 Thông tin cơ bản</h4>
            <p>Cập nhật họ tên hiển thị và thông tin tài khoản của bạn</p>
          </div>

          <div className="pf-field">
            <label htmlFor="pf-name">Họ và tên</label>
            <input
              id="pf-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập họ và tên đầy đủ"
              required
            />
          </div>

          <div className="pf-field">
            <label htmlFor="pf-email">Địa chỉ Email</label>
            <input
              id="pf-email"
              type="email"
              value={user.email}
              disabled
              title="Email dùng để đăng nhập và không thể thay đổi"
            />
            <span className="pf-hint">Email cố định dùng để xác thực và nhận thông báo quan trọng.</span>
          </div>

          <div className="pf-field">
            <label>Vai trò hệ thống</label>
            <input
              type="text"
              value={ROLE_LABELS[user.role] || 'Thành viên gia đình'}
              disabled
            />
          </div>

          {err.profile && <div className="auth-error" style={{ marginBottom: 14 }}>{err.profile}</div>}

          <button id="pf-save" type="submit" className="pf-submit-btn" disabled={loadingProfile}>
            {loadingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </form>

        {/* Cột 2: Đổi mật khẩu */}
        <form className="pf-card-form" onSubmit={savePassword}>
          <div className="pf-header">
            <h4>🔒 Đổi mật khẩu & Bảo mật</h4>
            <p>Nên sử dụng mật khẩu mạnh kết hợp chữ, số và ký tự đặc biệt</p>
          </div>

          <div className="pf-field">
            <label htmlFor="pf-oldPassword">Mật khẩu hiện tại</label>
            <input
              id="pf-oldPassword"
              type="password"
              placeholder="••••••••"
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

          {err.pw && <div className="auth-error" style={{ marginBottom: 14 }}>{err.pw}</div>}

          <button id="pf-change-pw" type="submit" className="pf-submit-btn" disabled={loadingPw}>
            {loadingPw ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>

      {/* ── Thẻ quyền hạn & Tính năng tài khoản ── */}
      <div className="pf-permissions-card">
        <div className="pf-header">
          <h4>🛡 Tính năng & Quyền hạn khả dụng</h4>
          <p>Các quyền và đặc quyền đã được phân bổ cho tài khoản của bạn</p>
        </div>

        <div className="pf-features-list">
          <div className="pf-feature-item">
            <span className="pf-feature-icon">✓</span>
            <div>
              <strong>Lên thực đơn tuần thông minh</strong>
              <div style={{ fontSize: 12, color: '#5e4c41' }}>Tự động phân bổ món ăn 7 ngày và cân bằng calo</div>
            </div>
          </div>

          <div className="pf-feature-item">
            <span className="pf-feature-icon">✓</span>
            <div>
              <strong>Quản lý giỏ đi chợ</strong>
              <div style={{ fontSize: 12, color: '#5e4c41' }}>Gom nguyên liệu theo từng quầy mua sắm tiện lợi</div>
            </div>
          </div>

          <div className="pf-feature-item">
            <span className="pf-feature-icon">✓</span>
            <div>
              <strong>Sổ tay nấu ăn & Vào bếp</strong>
              <div style={{ fontSize: 12, color: '#5e4c41' }}>Hướng dẫn nấu ăn trực quan kèm chế độ 2 bếp và hẹn giờ</div>
            </div>
          </div>

          <div className="pf-feature-item">
            <span className="pf-feature-icon">✓</span>
            <div>
              <strong>Hồ sơ khẩu vị gia đình</strong>
              <div style={{ fontSize: 12, color: '#5e4c41' }}>Quản lý dị ứng, độ mặn/nhạt của từng thành viên</div>
            </div>
          </div>

          {isAdmin && (
            <div className="pf-feature-item" style={{ gridColumn: '1 / -1', background: '#faeee9', borderColor: '#f0cebe' }}>
              <span className="pf-feature-icon" style={{ background: '#f5ded4', color: '#9c361c' }}>★</span>
              <div>
                <strong style={{ color: '#9c361c' }}>Quyền Quản trị viên hệ thống (Admin)</strong>
                <div style={{ fontSize: 12, color: '#6e4f45' }}>Toàn quyền quản lý tài khoản người dùng, phân quyền vai trò và dữ liệu hệ thống</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
