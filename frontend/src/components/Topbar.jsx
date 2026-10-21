import { useToast } from '../context/ToastContext'

const PAGE_TITLES = {
  home:     ['BẾP NHÀ MÌNH',            'Hôm nay nhà mình ăn gì?'],
  recipes:  ['KHÁM PHÁ',                 'Khám phá món ăn'],
  plan:     ['KẾ HOẠCH BỮA ĂN',          'Lên thực đơn'],
  shopping: ['CHUẨN BỊ NGUYÊN LIỆU',    'Đi chợ thông minh'],
  cook:     ['CÔNG THỨC NẤU ĂN',         'Cùng vào bếp'],
  family:   ['NHỮNG NGƯỜI THƯƠNG',       'Gia đình mình'],
  saved:    ['BỘ SƯU TẬP CỦA BẠN',      'Món ăn đã lưu'],
  account:  ['CÁ NHÂN HÓA',             'Tài khoản & cài đặt'],
}

export default function Topbar({ activePage, onNavigate }) {
  const toast = useToast()
  const [eyebrow, title] = PAGE_TITLES[activePage] || PAGE_TITLES.home

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
        <button
          id="btn-account"
          className="icon-btn"
          aria-label="Tài khoản"
          onClick={() => onNavigate('account')}
        >
          👤
        </button>
      </div>
    </header>
  )
}

export { PAGE_TITLES }
