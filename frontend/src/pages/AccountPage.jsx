import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { getInitials } from '@/utils/user'

export default function AccountPage({ onNavigate }) {
  const toast = useToast()
  const { user, isAuthenticated, openAuth } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="panel" style={{ padding: '24px', textAlign: 'center' }}>
        Vui lòng <button className="link-btn" onClick={() => openAuth('login')}>đăng nhập</button> để xem tài khoản.
      </div>
    )
  }

  const rows = [
    { ico: '👤', label: 'Thông tin cá nhân & mật khẩu', action: () => onNavigate && onNavigate('profile') },
    { ico: '⚙', label: 'Cài đặt thông báo & hiển thị', action: () => onNavigate && onNavigate('settings') },
    { ico: 'ⓘ', label: 'Hướng dẫn sử dụng ứng dụng', action: () => onNavigate && onNavigate('guide') },
    { ico: '◉', label: 'Điều khoản sử dụng', action: () => toast('Điều khoản: Bản quyền © 2026 DailyMeal. Mọi quyền được bảo lưu.') },
    { ico: '🛡', label: 'Chính sách quyền riêng tư', action: () => toast('Bảo mật: Thông tin dinh dưỡng và khẩu vị gia đình được mã hóa an toàn.') },
    { ico: '✉', label: 'Trung tâm hỗ trợ & Liên hệ', action: () => toast('Hotline hỗ trợ: 1900 8888 • Email: hotro@dailymeal.vn') },
  ]

  return (
    <section id="page-account">
      <div className="section-head">
        <div>
          <h3>Tài khoản & Trung tâm trợ giúp</h3>
          <p>Quản lý thông tin, điều khoản và trải nghiệm DailyMeal của bạn.</p>
        </div>
      </div>

      {/* Profile card */}
      <div
        className="panel"
        style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 18, cursor: 'pointer' }}
        onClick={() => onNavigate && onNavigate('profile')}
        title="Bấm để chỉnh sửa hồ sơ cá nhân"
      >
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{getInitials(user.fullName)}</div>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 16 }}>{user.fullName}</strong>
          <div className="pf-muted">{user.email}</div>
        </div>
        <span className="arrow" style={{ fontSize: 20 }}>›</span>
      </div>

      {/* Settings rows */}
      <div className="account-list">
        {rows.map((row, i) => (
          <div key={i} className="account-row" onClick={row.action}>
            <span className="row-icon">{row.ico}</span>
            <strong style={{ fontSize: 14 }}>{row.label}</strong>
            <span className="arrow">›</span>
          </div>
        ))}
      </div>
    </section>
  )
}
