import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import UserMenu from '@/components/layout/UserMenu'

const PAGE_TITLES = {
  home:     ['BẾP NHÀ MÌNH',            'Hôm nay nhà mình ăn gì?'],
  recipes:  ['KHÁM PHÁ',                 'Khám phá món ăn'],
  plan:     ['KẾ HOẠCH BỮA ĂN',          'Lên thực đơn'],
  shopping: ['CHUẨN BỊ NGUYÊN LIỆU',    'Đi chợ thông minh'],
  cook:     ['CÔNG THỨC NẤU ĂN',         'Cùng vào bếp'],
  family:   ['NHỮNG NGƯỜI THƯƠNG',       'Gia đình mình'],
  saved:    ['BỘ SƯU TẬP CỦA BẠN',      'Món ăn đã lưu'],
  account:  ['CÁ NHÂN HÓA',             'Tài khoản & cài đặt'],
  profile:  ['TÀI KHOẢN',                'Hồ sơ cá nhân'],
  settings: ['TUỲ CHỈNH',                'Cài đặt'],
  guide:    ['TRỢ GIÚP',                 'Hướng dẫn sử dụng'],
  admin:    ['QUẢN TRỊ',                 'Quản trị hệ thống'],
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 11) return { eyebrow: 'CHÀO NGÀY MỚI', text: 'Chào buổi sáng', icon: '🌞' }
  if (h < 18) return { eyebrow: 'BUỔI CHIỀU VUI VẺ', text: 'Chào buổi chiều', icon: '🌤️' }
  return { eyebrow: 'CHÀO BUỔI TỐI', text: 'Chào buổi tối', icon: '🌙' }
}

export default function Topbar({ activePage, onNavigate }) {
  const toast = useToast()
  const { user, isAuthenticated, openAuth } = useAuth()

  let [eyebrow, title] = PAGE_TITLES[activePage] || PAGE_TITLES.home
  if (activePage === 'home' && isAuthenticated) {
    const g = getGreeting()
    const firstName = user.fullName.trim().split(/\s+/).pop()
    eyebrow = g.eyebrow
    title = `${g.text}, ${firstName}! ${g.icon}`
  }

  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="top-actions">
        <button
          id="btn-notifications"
          className="icon-btn"
          aria-label="Thông báo"
          onClick={() => toast('Bạn đã xem thông báo mới nhất')}
        >
          ♧<i className="dot" />
        </button>

        {isAuthenticated ? (
          <UserMenu onNavigate={onNavigate} />
        ) : (
          <>
            <button id="btn-open-register" className="btn-auth-outline" onClick={() => openAuth('register')}>Đăng ký</button>
            <button id="btn-open-login" className="btn-auth-solid" onClick={() => openAuth('login')}>Đăng nhập</button>
          </>
        )}
      </div>
    </header>
  )
}
