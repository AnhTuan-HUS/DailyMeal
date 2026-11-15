import { useAuth } from '@/context/AuthContext'
import { ROLE_LABELS } from '@/services/authApi'
import { getInitials } from '@/utils/user'

const NAV_ITEMS = [
  { page: 'home',     ico: '⌂', label: 'Trang chủ' },
  { page: 'recipes',  ico: '⌕', label: 'Khám phá món ăn' },
  { page: 'plan',     ico: '▤', label: 'Lên thực đơn' },
  { page: 'shopping', ico: '🛒', label: 'Đi chợ' },
  { page: 'cook',     ico: '♨', label: 'Vào bếp' },
  { page: 'family',   ico: '♧', label: 'Gia đình' },
  { page: 'saved',    ico: '♡', label: 'Món đã lưu' },
]

export default function Sidebar({ activePage, onNavigate }) {
  const { user, isAuthenticated, openAuth } = useAuth()

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand" role="button" tabIndex={0} onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
        <div className="brand-mark">♨</div>
        <div>
          <div className="brand-name">DailyMeal</div>
          <div className="brand-tag">Bữa cơm ngon, hạnh phúc hơn</div>
        </div>
      </div>

      {/* Điều hướng chính */}
      <div className="nav-group">
        <div className="nav-label">Không gian của bạn</div>
        <nav className="nav" aria-label="Điều hướng chính">
          {NAV_ITEMS.map(item => (
            <button
              key={item.page + item.label}
              className={activePage === item.page ? 'active' : ''}
              onClick={() => onNavigate(item.page)}
            >
              <span className="ico">{item.ico}</span>
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Thông tin User ở chân Sidebar - bấm vào để chuyển tới Hồ sơ & Cài đặt */}
      {isAuthenticated ? (
        <div
          className="sidebar-bottom"
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('profile')}
          title="Bấm để mở hồ sơ cá nhân và cài đặt"
        >
          <div className="avatar">{getInitials(user.fullName)}</div>
          <div className="user-info">
            <div className="user-name">{user.fullName}</div>
            <div className="user-role">{ROLE_LABELS[user.role] || 'Thành viên'}</div>
          </div>
          <span className="sidebar-user-arrow" aria-hidden="true">›</span>
        </div>
      ) : (
        <div
          className="sidebar-bottom sidebar-guest"
          role="button"
          tabIndex={0}
          onClick={() => openAuth('login')}
          title="Bấm để đăng nhập hoặc đăng ký"
        >
          <div className="avatar">DM</div>
          <div className="user-info">
            <div className="user-name">Đăng nhập</div>
            <div className="user-role">Đồng bộ dữ liệu của bạn</div>
          </div>
          <span className="sidebar-user-arrow" aria-hidden="true">›</span>
        </div>
      )}
    </aside>
  )
}
