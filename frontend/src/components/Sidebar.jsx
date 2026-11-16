const NAV_ITEMS = [
  { page: 'home',     ico: '⌂', label: 'Trang chủ' },
  { page: 'recipes',  ico: '⌕', label: 'Khám phá món ăn' },
  { page: 'plan',     ico: '▤', label: 'Lên thực đơn' },
  { page: 'shopping', ico: '🛒', label: 'Đi chợ' },
  { page: 'cook',     ico: '♨', label: 'Vào bếp' },
  { page: 'family',   ico: '♧', label: 'Gia đình' },
  { page: 'saved',    ico: '♡', label: 'Món đã lưu' },
]

const NAV_SECONDARY = [
  { page: 'account', ico: '⚙', label: 'Cài đặt' },
  { page: 'account', ico: 'ⓘ', label: 'Hướng dẫn sử dụng' },
  { page: 'account', ico: '◉', label: 'Điều khoản sử dụng' },
  { page: 'account', ico: '♧', label: 'Quyền riêng tư' },
  { page: 'account', ico: '✉', label: 'Liên hệ' },
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-mark">♨</div>
        <div>
          <div className="brand-name">DailyMeal</div>
          <div className="brand-tag">Bữa cơm ngon, hạnh phúc hơn</div>
        </div>
      </div>

      {/* Primary nav */}
      <div>
        <div className="nav-label">Không gian của bạn</div>
        <nav className="nav" aria-label="Điều hướng chính">
          {NAV_ITEMS.map(item => (
            <button
              key={item.page + item.label}
              className={activePage === item.page ? 'active' : ''}
              onClick={() => onNavigate(item.page)}
            >
              <span className="ico">{item.ico}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Secondary nav */}
      <div>
        <div className="nav-label">Khác</div>
        <nav className="nav" aria-label="Điều hướng phụ">
          {NAV_SECONDARY.map((item, i) => (
            <button key={i} onClick={() => onNavigate(item.page)}>
              <span className="ico">{item.ico}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* User profile */}
      <div className="sidebar-bottom">
        <div className="avatar">VA</div>
        <div>
          <div className="user-name">Nguyễn Văn An</div>
          <div className="user-role">Thành viên gia đình</div>
        </div>
      </div>
    </aside>
  )
}
