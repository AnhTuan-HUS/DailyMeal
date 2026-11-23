import { useState } from 'react'
import { Bell, Send } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { useApp } from '@/context/AppContext'

const KEY = 'dm_settings'
const DEFAULTS = {
  notifyMeal: true,
  notifyShopping: true,
  notifyFridge: true,
  notifyFamily: true,
  compact: false,
}
const ROWS = [
  ['notifyMeal', 'Nhắc giờ nấu ăn', 'Thông báo khi đến giờ vào bếp theo thực đơn trong ngày'],
  ['notifyShopping', 'Nhắc đi chợ', 'Thông báo danh sách nguyên liệu còn thiếu cần mua'],
  ['notifyFridge', 'Cảnh báo thực phẩm tủ lạnh', 'Nhắc giải cứu nguyên liệu sắp hết hạn trong 24h'],
  ['notifyFamily', 'Lưu ý khẩu vị & dị ứng gia đình', 'Cảnh báo khi món ăn có nguyên liệu trùng dị ứng thành viên'],
  ['compact', 'Giao diện gọn', 'Giảm khoảng cách giữa các thành phần'],
]

export default function SettingsPage() {
  const toast = useToast()
  const { pushNotification } = useApp()
  const [s, setS] = useState(() => ({ ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }))

  function toggle(k) {
    const next = { ...s, [k]: !s[k] }
    setS(next)
    localStorage.setItem(KEY, JSON.stringify(next))
    toast('Đã lưu cài đặt')
  }

  function handleSendTestNotification() {
    pushNotification({
      category: 'meal',
      title: 'Nhắc nhở từ Bếp DailyMeal',
      message: 'Đã đến giờ chuẩn bị bữa cơm gia đình! Bấm vào đây để mở chế độ Vào bếp rảnh tay.',
      targetPage: 'cook',
      actionLabel: 'Vào bếp ngay',
    })
    toast('Đã gửi 1 thông báo thử nghiệm lên chuông thông báo!')
  }

  return (
    <section id="page-settings">
      <div className="section-head">
        <div>
          <h3>Cài đặt thông báo & hiển thị</h3>
          <p>Tuỳ chỉnh các thông báo nhắc việc bếp nhà và trải nghiệm DailyMeal.</p>
        </div>
        <button
          type="button"
          className="btn-plan-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
          onClick={handleSendTestNotification}
        >
          <Send size={14} strokeWidth={2.2} />
          <span>Gửi thông báo thử nghiệm</span>
        </button>
      </div>

      <div className="account-list">
        {ROWS.map(([k, t, d]) => (
          <div key={k} className="account-row">
            <span className="row-icon" style={{ color: 'var(--wine)', display: 'grid', placeItems: 'center' }}>
              <Bell size={18} strokeWidth={2} />
            </span>
            <div style={{ flex: 1 }}>
              <strong>{t}</strong>
              <div className="pf-muted">{d}</div>
            </div>
            <button
              id={'set-' + k}
              role="switch"
              aria-checked={s[k]}
              className={'switch' + (s[k] ? ' on' : '')}
              onClick={() => toggle(k)}
            >
              <i />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
