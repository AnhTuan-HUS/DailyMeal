import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  CalendarDays,
  CheckCheck,
  ChefHat,
  Heart,
  RotateCcw,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'

const CATEGORY_META = {
  meal:     { icon: ChefHat,      label: 'Vào bếp',   bg: '#faeee9', color: '#9c361c' },
  shopping: { icon: ShoppingCart, label: 'Đi chợ',    bg: '#eef5ec', color: '#3b6b35' },
  family:   { icon: Users,        label: 'Gia đình',  bg: '#fdf3e3', color: '#9a6411' },
  plan:     { icon: CalendarDays, label: 'Thực đơn',  bg: '#eef4fb', color: '#1f5a8a' },
  saved:    { icon: Heart,        label: 'Yêu thích', bg: '#fcecf0', color: '#a82849' },
  system:   { icon: Bell,         label: 'Hệ thống',  bg: '#f4ebe1', color: '#64252c' },
}

export default function NotificationMenu({ onNavigate }) {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearAllNotifications,
    resetDefaultNotifications,
  } = useApp()
  const toast = useToast()

  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'unread'
  const ref = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length
  const visibleList = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  // Đóng dropdown khi bấm ra ngoài hoặc nhấn Esc
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

  function handleItemClick(item) {
    if (!item.read) markNotificationRead(item.id)
    setOpen(false)
    if (item.targetPage && onNavigate) {
      onNavigate(item.targetPage)
    }
  }

  function handleMarkAllRead() {
    if (!unreadCount) return
    markAllNotificationsRead()
    toast('Đã đánh dấu đọc tất cả thông báo')
  }

  function handleClearAll() {
    clearAllNotifications()
    toast('Đã xoá toàn bộ danh sách thông báo')
  }

  function handleRestoreSamples() {
    resetDefaultNotifications()
    setFilter('all')
    toast('Đã làm mới các thông báo gợi ý hôm nay')
  }

  return (
    <div className="notif-menu" ref={ref}>
      <button
        type="button"
        id="btn-notifications"
        className={`icon-btn notif-trigger-btn ${open ? 'is-open' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
        aria-label="Thông báo"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        title={unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Thông báo'}
      >
        <Bell size={18} strokeWidth={2.1} className="notif-bell-svg" />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-label={`${unreadCount} thông báo chưa đọc`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

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
                  className="notif-action-link"
                  onClick={handleMarkAllRead}
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck size={14} strokeWidth={2.2} />
                  <span>Đọc tất cả</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  className="notif-icon-action"
                  onClick={handleClearAll}
                  title="Xoá tất cả thông báo"
                  aria-label="Xoá tất cả thông báo"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {/* Bộ lọc Tabs */}
          <div className="notif-tabs">
            <button
              type="button"
              className={`notif-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              type="button"
              className={`notif-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* Danh sách thông báo */}
          <div className="notif-list">
            {visibleList.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty-ico">
                  <Bell size={24} strokeWidth={1.8} />
                </div>
                <strong>
                  {filter === 'unread' ? 'Bạn đã đọc hết thông báo!' : 'Chưa có thông báo nào'}
                </strong>
                <p>
                  {filter === 'unread'
                    ? 'Không còn thông báo mới nào bị bỏ lỡ.'
                    : 'Các nhắc nhở giờ nấu ăn, đi chợ và khẩu vị gia đình sẽ xuất hiện tại đây.'}
                </p>
                {notifications.length === 0 && (
                  <button
                    type="button"
                    className="notif-restore-btn"
                    onClick={handleRestoreSamples}
                  >
                    <RotateCcw size={13} strokeWidth={2.2} />
                    <span>Nhận gợi ý thông báo hôm nay</span>
                  </button>
                )}
              </div>
            ) : (
              visibleList.map(item => {
                const meta = CATEGORY_META[item.category] || CATEGORY_META.system
                const IconComp = meta.icon
                return (
                  <div
                    key={item.id}
                    className={`notif-item ${item.read ? 'is-read' : 'is-unread'}`}
                    onClick={() => handleItemClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleItemClick(item)}
                  >
                    <div
                      className="notif-item-ico"
                      style={{ background: meta.bg, color: meta.color }}
                      aria-hidden="true"
                    >
                      <IconComp size={17} strokeWidth={2.1} />
                    </div>

                    <div className="notif-item-body">
                      <div className="notif-item-top">
                        <span className="notif-cat-tag" style={{ color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className="notif-time">{item.time}</span>
                      </div>
                      <strong className="notif-title">{item.title}</strong>
                      <p className="notif-msg">{item.message}</p>
                      {item.actionLabel && (
                        <span className="notif-cta">{item.actionLabel} →</span>
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

          {/* Chân menu thông báo */}
          <div className="notif-foot">
            <button
              type="button"
              className="notif-foot-btn"
              onClick={() => {
                setOpen(false)
                if (onNavigate) onNavigate('settings')
              }}
            >
              <SlidersHorizontal size={14} strokeWidth={2.1} />
              <span>Cài đặt nhắc giờ nấu ăn & đi chợ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
