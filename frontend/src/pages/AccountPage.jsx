import { useToast } from '../context/ToastContext'

const ACCOUNT_ROWS = [
  { ico: '♙', label: 'Thông tin cá nhân' },
  { ico: '♧', label: 'Thông báo' },
  { ico: '◈', label: 'Mật khẩu' },
  { ico: '♡', label: 'Quyền riêng tư' },
  { ico: '⚙', label: 'Cài đặt chung' },
]

export default function AccountPage() {
  const toast = useToast()

  return (
    <section id="page-account">
      <div className="section-head">
        <div>
          <h3>Tài khoản & cài đặt</h3>
          <p>Quản lý thông tin và trải nghiệm DailyMeal của bạn.</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 18 }}>
        <div className="avatar" style={{ width: 60, height: 60, fontSize: 18 }}>VA</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 16, marginBottom: 4 }}>Nguyễn Văn An</h3>
          <p className="panel-sub" style={{ marginBottom: 0 }}>
            an.nguyen@example.com · Thành viên từ 2025
          </p>
        </div>
        <button className="mini-btn" onClick={() => toast('Đã mở thông tin cá nhân')}>
          Chỉnh sửa
        </button>
      </div>

      {/* Settings rows */}
      <div className="account-list">
        {ACCOUNT_ROWS.map((row, i) => (
          <div key={i} className="account-row" onClick={() => toast('Đang mở ' + row.label)}>
            <span className="row-icon">{row.ico}</span>
            <strong>{row.label}</strong>
            <span className="arrow">›</span>
          </div>
        ))}
      </div>
    </section>
  )
}
