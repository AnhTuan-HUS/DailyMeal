import { useEffect, useRef, useState } from 'react'
import { LogOut, Settings, User, SlidersHorizontal, BookOpen, LifeBuoy, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getInitials } from '@/utils/user'

const BASE_ITEMS = [
  { Icon: User, label: 'Hồ sơ cá nhân', page: 'profile' },
  { Icon: SlidersHorizontal, label: 'Cài đặt tài khoản', page: 'settings' },
  { Icon: BookOpen, label: 'Hướng dẫn sử dụng', page: 'guide' },
  { Icon: LifeBuoy, label: 'Hỗ trợ & Liên hệ', action: 'contact' },
]
const ADMIN_PERMS = ['user:manage', 'role:manage', 'permission:manage']

export default function UserMenu({ onNavigate }) {
  const { user, logout, hasPermission } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const items = ADMIN_PERMS.some(hasPermission)
    ? [...BASE_ITEMS.slice(0, 3), { Icon: ShieldCheck, label: 'Quản trị hệ thống', page: 'admin' }, ...BASE_ITEMS.slice(3)]
    : BASE_ITEMS

  // Dong menu khi bam ra ngoai hoac nhan Esc
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

  async function handleLogout() {
    setOpen(false)
    await logout()
    onNavigate('home')
    toast('Bạn đã đăng xuất')
  }

  function handleItemClick(item) {
    setOpen(false)
    if (item.action === 'contact') {
      toast('Hotline hỗ trợ: 1900 8888 • Email: hotro@dailymeal.vn')
      return
    }
    if (item.page) {
      onNavigate(item.page)
    }
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        id="btn-account"
        className="icon-btn"
        aria-label="Cài đặt & Tài khoản"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        title="Cài đặt & Tài khoản"
      >
        <Settings size={18} strokeWidth={2} />
      </button>

      {open && (
        <div className="user-dropdown" role="menu">
          <div className="ud-head" onClick={() => { setOpen(false); onNavigate('profile') }} style={{ cursor: 'pointer' }} title="Mở hồ sơ cá nhân">
            <div className="avatar">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} className="avatar-img" /> : getInitials(user.fullName)}
            </div>
            <div>
              <div className="ud-name">{user.fullName}</div>
              <div className="ud-email">{user.email}</div>
            </div>
          </div>

          <div className="ud-list">
            {items.map((it, idx) => (
              <button
                key={it.page || it.action || idx}
                role="menuitem"
                className="ud-item"
                onClick={() => handleItemClick(it)}
              >
                <span className="ud-ico"><it.Icon size={17} strokeWidth={2} /></span>
                <span className="ud-text">{it.label}</span>
              </button>
            ))}
          </div>

          <button id="btn-logout" role="menuitem" className="ud-item ud-logout" onClick={handleLogout}>
            <span className="ud-ico" style={{ display: 'grid', placeItems: 'center' }}>
              <LogOut size={16} strokeWidth={2.2} />
            </span>
            <span className="ud-text">Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  )
}
