import { useAuth } from '@/context/AuthContext'
import { ROLE_LABELS } from '@/services/authApi'
import { getInitials } from '@/utils/user'

const NAV_ITEMS = [
  {
    page: 'home',
    label: 'Trang chủ',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    page: 'recipes',
    label: 'Khám phá món ăn',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    page: 'plan',
    label: 'Lên thực đơn',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    page: 'shopping',
    label: 'Đi chợ',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    page: 'cook',
    label: 'Vào bếp',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 13.8V4a2 2 0 1 1 4 0v9.8" />
        <path d="M14 13.8V4a2 2 0 1 1 4 0v9.8" />
        <path d="M2 14h20l-2 7a2 2 0 0 1-2 1H6a2 2 0 0 1-2-1l-2-7z" />
      </svg>
    ),
  },
  {
    page: 'family',
    label: 'Gia đình',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    page: 'saved',
    label: 'Món đã lưu',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
]

export default function Sidebar({ activePage, onNavigate }) {
  const { user, isAuthenticated, openAuth } = useAuth()

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div
        className="brand"
        role="button"
        tabIndex={0}
        onClick={() => onNavigate('home')}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onNavigate('home')}
        style={{ cursor: 'pointer' }}
      >
        <div className="brand-mark" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a5 5 0 0 1 5 5c0 .7-.1 1.4-.4 2h.4a4 4 0 0 1 4 4 4 4 0 0 1-4 4H7a4 4 0 0 1-4-4 4 4 0 0 1 4-4h.4A5 5 0 0 1 12 2z" />
            <path d="M8 17v4" />
            <path d="M12 17v4" />
            <path d="M16 17v4" />
          </svg>
        </div>
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
              key={item.page}
              className={activePage === item.page ? 'active' : ''}
              onClick={() => onNavigate(item.page)}
            >
              <span className="ico">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Thông tin User ở chân Sidebar */}
      {isAuthenticated ? (
        <div
          className="sidebar-bottom"
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('profile')}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onNavigate('profile')}
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
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && openAuth('login')}
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
