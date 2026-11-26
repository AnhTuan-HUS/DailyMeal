import { ChevronRight, User, SlidersHorizontal, BookOpen, LifeBuoy } from 'lucide-react'
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
    { Icon: User, tone: 'wine', label: 'Thông tin cá nhân & mật khẩu', desc: 'Cập nhật tên, ảnh đại diện và đổi mật khẩu', action: () => onNavigate && onNavigate('profile') },
    { Icon: SlidersHorizontal, tone: 'olive', label: 'Cài đặt thông báo & hiển thị', desc: 'Nhắc nấu ăn, đi chợ, cảnh báo tủ lạnh', action: () => onNavigate && onNavigate('settings') },
    { Icon: BookOpen, tone: 'amber', label: 'Hướng dẫn sử dụng ứng dụng', desc: '5 bước để có bữa cơm ngon mỗi ngày', action: () => onNavigate && onNavigate('guide') },
    { Icon: LifeBuoy, tone: 'rust', label: 'Trung tâm hỗ trợ & Liên hệ', desc: 'Hotline và email hỗ trợ', action: () => toast('Hotline hỗ trợ: 1900 8888 • Email: hotro@dailymeal.vn') },
  ]

  return (
    <section id="page-account">
      <p className="page-intro">Quản lý thông tin và trải nghiệm DailyMeal của bạn.</p>

      {/* Profile card */}
      <div
        className="panel account-profile"
        onClick={() => onNavigate && onNavigate('profile')}
        title="Bấm để chỉnh sửa hồ sơ cá nhân"
      >
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
          {user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} className="avatar-img" /> : getInitials(user.fullName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: 16 }}>{user.fullName}</strong>
          <div className="pf-muted">{user.email}</div>
        </div>
        <ChevronRight size={18} strokeWidth={2.2} className="arrow-ico" />
      </div>

      {/* Settings rows */}
      <div className="account-list">
        {rows.map(({ Icon, tone, label, desc, action }) => (
          <button type="button" key={label} className="account-row" onClick={action}>
            <span className={'icon-chip tone-' + tone}><Icon size={19} strokeWidth={2} /></span>
            <span className="row-text">
              <strong>{label}</strong>
              <small className="pf-muted">{desc}</small>
            </span>
            <ChevronRight size={18} strokeWidth={2.2} className="arrow-ico" />
          </button>
        ))}
      </div>
    </section>
  )
}
