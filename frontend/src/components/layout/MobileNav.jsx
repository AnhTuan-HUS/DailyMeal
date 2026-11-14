const MOBILE_ITEMS = [
  { page: 'home',     ico: '⌂', label: 'Trang chủ' },
  { page: 'recipes',  ico: '⌕', label: 'Món ăn' },
  { page: 'plan',     ico: '▤', label: 'Thực đơn' },
  { page: 'shopping', ico: '🛒', label: 'Đi chợ' },
  { page: 'family',   ico: '♧', label: 'Gia đình' },
]

export default function MobileNav({ activePage, onNavigate }) {
  return (
    <nav className="mobile-nav" aria-label="Điều hướng di động">
      {MOBILE_ITEMS.map(item => (
        <button
          key={item.page}
          className={activePage === item.page ? 'active' : ''}
          onClick={() => onNavigate(item.page)}
        >
          <span>{item.ico}</span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
