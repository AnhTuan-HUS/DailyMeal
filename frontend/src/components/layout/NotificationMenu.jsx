import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  Calendar,
  CheckCheck,
  ChefHat,
  Heart,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'

const CATEGORY_META = {
  meal:     { label: 'Bữa ăn',   Icon: ChefHat,      tone: 'tone-meal' },
  shopping: { label: 'Đi chợ',   Icon: ShoppingCart, tone: 'tone-shop' },
  fridge:   { label: 'Tủ lạnh',  Icon: Sparkles,     tone: 'tone-fridge' },
  family:   { label: 'Gia đình', Icon: Heart,        tone: 'tone-family' },
  plan:     { label: 'Thực đơn', Icon: Calendar,     tone: 'tone-plan' },
  system:   { label: 'Hệ thống', Icon: Bell,         tone: 'tone-meal' },
}

const FILTER_TABS = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'unread',   label: 'Chưa đọc' },
  { key: 'meal',     label: 'Bữa ăn' },
  { key: 'shopping', label: 'Đi chợ' },
]

export default function NotificationMenu({ onNavigate }) {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearAllNotifications,
    resetNotifications,
  } = useApp()
  const toast = useToast()

  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const ref = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!open) return
    const onDown = e => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = e => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const filteredList = notifications.filter(item => {
    if (filter === 'unread') return !item.read
    if (filter === 'meal') return item.category === 'meal' || item.category === 'plan'
    if (filter === 'shopping') return item.category === 'shopping' || item.category === 'fridge'
    return true
  })

  function handleSelectNotification(item) {
    if (!item.read) {
      markNotificationRead(item.id)
    }
    setOpen(false)
    if (item.targetPage && onNavigate) {
      onNavigate(item.targetPage)
    }
  }

  function handleMarkAllRead() {
    if (unreadCount === 0) return
    markAllNotificationsRead()
    toast('Đã đánh dấu tất cả thông báo là đã đọc')
  }

  function handleClearAll() {
    clearAllNotifications()
    toast('Đã dọn sạch danh sách thông báo')
  }

  function handleRestoreSample() {
    resetNotifications()
    toast('Đã khôi phục danh sách thông báo nhắc việc')
  }

  return (
    <div className="notif-menu" ref={ref}>
      <button
        type="button"
        id="btn-notifications"
        className={`icon-btn notif-trigger-btn ${open ? 'is-open' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
        aria-label={unreadCount > 0 ? `Thông báo (${unreadCount} chưa đọc)` : 'Thông báo'}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        title="Thông báo & Nhắc việc bếp nhà"
      >
        <Bell size={18} strokeWidth={2} className="notif-bell-svg" />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Vùng đọc trạng thái cho trình đọc màn hình (Accessibility) */}
      <span className="sr-only" role="status" aria-atomic="true">
        {unreadCount > 0 ? `Có ${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
      </span>

      {open && (
        <div className="notif-dropdown" role="dialog" aria-label="Trung tâm thông báo">
          {/* Header */}
          <div className="notif-head">
            <div className="notif-head-title">
              <h4>Thông báo</h4>
              {unreadCount > 0 && (
                <span className="notif-unread-pill">{unreadCount} mới</span>
              )}
            </div>

            <div className="notif-head-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="notif-action-btn"
                  onClick={handleMarkAllRead}
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck size={14} strokeWidth={2.2} />
                  <span>Đọc tất cả</span>
                </button>
              )}
            </div>
          </div>

          {/* Bộ lọc tab */}
          <div className="notif-tabs" role="tablist">
            {FILTER_TABS.map(t => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={filter === t.key}
                className={`notif-tab ${filter === t.key ? 'active' : ''}`}
                onClick={() => setFilter(t.key)}
              >
                {t.label}
                {t.key === 'unread' && unreadCount > 0 && (
                  <em className="notif-tab-count">{unreadCount}</em>
                )}
              </button>
            ))}
          </div>

          {/* Danh sách thông báo */}
          <div className="notif-list">
            {filteredList.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty-ico">
                  <Bell size={24} strokeWidth={1.8} />
                </div>
                <strong>
                  {filter === 'unread'
                    ? 'Bạn đã đọc hết mọi thông báo!'
                    : 'Chưa có thông báo nào trong mục này'}
                </strong>
                <p>
                  Các nhắc nhở giờ nấu ăn, nguyên liệu đi chợ và cảnh báo thực phẩm tủ lạnh sẽ xuất hiện tại đây.
                </p>
                {notifications.length === 0 && (
                  <button
                    type="button"
                    className="notif-restore-btn"
                    onClick={handleRestoreSample}
                  >
                    <RotateCcw size={13} strokeWidth={2.2} />
                    <span> Tải lại thông báo nhắc việc</span>
                  </button>
                )}
              </div>
            ) : (
              filteredList.map(item => {
                const meta = CATEGORY_META[item.category] || CATEGORY_META.system
                const IconComp = meta.Icon
                return (
                  <div
                    key={item.id}
                    className={`notif-item ${!item.read ? 'is-unread' : ''}`}
                    onClick={() => handleSelectNotification(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleSelectNotification(item)}
                  >
                    <div className={`notif-item-icon ${meta.tone}`}>
                      <IconComp size={17} strokeWidth={2} />
                    </div>

                    <div className="notif-item-body">
                      <div className="notif-item-top">
                        <span className="notif-cat-tag">{meta.label}</span>
                        <span className="notif-time">{item.time}</span>
                      </div>
                      <strong className="notif-item-title">{item.title}</strong>
                      <p className="notif-item-msg">{item.message}</p>
                      {item.actionLabel && (
                        <span className="notif-item-cta">{item.actionLabel} →</span>
                      )}
                    </div>

                    <div className="notif-item-right">
                      {!item.read && <span className="notif-unread-dot" title="Chưa đọc" />}
                      <button
                        type="button"
                        className="notif-del-btn"
                        aria-label="Xoá thông báo này"
                        title="Xoá thông báo"
                        onClick={e => {
                          e.stopPropagation()
                          removeNotification(item.id)
                        }}
                      >
                        <X size={14} strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="notif-foot">
            <button
              type="button"
              className="notif-foot-link"
              onClick={() => {
                setOpen(false)
                if (onNavigate) onNavigate('settings')
              }}
            >
              Tuỳ chỉnh cài đặt thông báo
            </button>

            {notifications.length > 0 && (
              <button
                type="button"
                className="notif-clear-btn"
                onClick={handleClearAll}
                title="Xoá toàn bộ thông báo"
              >
                <Trash2 size={13} strokeWidth={2} />
                <span>Xoá tất cả</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
