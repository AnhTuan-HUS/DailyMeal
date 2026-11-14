import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getInitials } from '@/utils/user'

const ITEMS = [
  { ico: '👤', label: 'Hồ sơ cá nhân', page: 'profile' },
  { ico: '⚙', label: 'Cài đặt', page: 'settings' },
  { ico: 'ⓘ', label: 'Hướng dẫn', page: 'guide' },
]
const ADMIN_PERMS = ['user:manage', 'role:manage', 'permission:manage']

export default function UserMenu({ onNavigate }) {
  const { user, logout, hasPermission } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const items = ADMIN_PERMS.some(hasPermission)
    ? [...ITEMS, { ico: '🛡', label: 'Quản trị hệ thống', page: 'admin' }]
    : ITEMS

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

  return (
    <div className="user-menu" ref={ref}>
      <button id="btn-account" className="icon-btn" aria-label="Tài khoản" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        👤
      </button>
      {open && (
        <div className="user-dropdown" role="menu">
          <div className="ud-head">
            <div className="avatar">{getInitials(user.fullName)}</div>
            <div>
              <div className="ud-name">{user.fullName}</div>
              <div className="ud-email">{user.email}</div>
            </div>
          </div>
          {items.map(it => (
            <button key={it.page} role="menuitem" className="ud-item" onClick={() => { setOpen(false); onNavigate(it.page) }}>
              <span>{it.ico}</span>{it.label}
            </button>
          ))}
          <button id="btn-logout" role="menuitem" className="ud-item ud-logout" onClick={handleLogout}>
            <span>⊘</span>Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}