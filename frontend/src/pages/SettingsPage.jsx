import { useState } from 'react'
import { useToast } from '@/context/ToastContext'

const KEY = 'dm_settings'
const DEFAULTS = { notifyMeal: true, notifyShopping: true, compact: false }
const ROWS = [
  ['notifyMeal', 'Nhắc giờ nấu ăn', 'Thông báo khi đến giờ vào bếp'],
  ['notifyShopping', 'Nhắc đi chợ', 'Thông báo danh sách nguyên liệu cần mua'],
  ['compact', 'Giao diện gọn', 'Giảm khoảng cách giữa các thành phần'],
]

export default function SettingsPage() {
  const toast = useToast()
  const [s, setS] = useState(() => ({ ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }))

  function toggle(k) {
    const next = { ...s, [k]: !s[k] }
    setS(next)
    localStorage.setItem(KEY, JSON.stringify(next))
    toast('Đã lưu cài đặt')
  }

  return (
    <section id="page-settings">
      <div className="section-head"><div><h3>Cài đặt</h3><p>Tuỳ chỉnh trải nghiệm DailyMeal.</p></div></div>
      <div className="account-list">
        {ROWS.map(([k, t, d]) => (
          <div key={k} className="account-row">
            <div style={{ flex: 1 }}><strong>{t}</strong><div className="pf-muted">{d}</div></div>
            <button id={'set-' + k} role="switch" aria-checked={s[k]} className={'switch' + (s[k] ? ' on' : '')} onClick={() => toggle(k)}><i /></button>
          </div>
        ))}
      </div>
    </section>
  )
}