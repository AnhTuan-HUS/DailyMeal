import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import authBg from '@/assets/auth-bg.jpg'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AuthModal() {
  const { authModal, openAuth, closeAuth, login, register } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Khoa cuon trang khi popup dang mo
  useEffect(() => {
    if (!authModal) return
    document.documentElement.classList.add('modal-open')
    document.body.classList.add('modal-open')
    return () => {
      document.documentElement.classList.remove('modal-open')
      document.body.classList.remove('modal-open')
    }
  }, [authModal])

  if (!authModal) return null
  const isRegister = authModal === 'register'
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  function switchTo(mode) {
    setError('')
    openAuth(mode)
  }

  function validate() {
    if (isRegister && form.fullName.trim().length < 2) return 'Vui lòng nhập họ tên'
    if (!EMAIL_RE.test(form.email.trim())) return 'Email không hợp lệ'
    if (form.password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự'
    if (isRegister && form.password !== form.confirm) return 'Mật khẩu xác nhận không khớp'
    return ''
  }

  async function submit(e) {
    e.preventDefault()
    const msg = validate()
    if (msg) return setError(msg)
    setError('')
    setLoading(true)
    try {
      const u = isRegister ? await register(form) : await login(form)
      toast((isRegister ? 'Đăng ký thành công! Xin chào ' : 'Chào mừng trở lại, ') + u.fullName)
      setForm({ fullName: '', email: '', password: '', confirm: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-bg" style={{ backgroundImage: `url(${authBg})` }} />

      <form className="auth-modal" onSubmit={submit} noValidate>
        <button type="button" className="auth-close" aria-label="Đóng" onClick={closeAuth}>×</button>
        <h2 className="auth-title">{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h2>
        <p className="auth-sub">{isRegister ? 'Bắt đầu lên thực đơn cho gia đình bạn' : 'Chào mừng bạn quay lại DailyMeal'}</p>

        {isRegister && (
          <label className="auth-field">Họ và tên
            <input id="auth-fullname" value={form.fullName} onChange={set('fullName')} placeholder="Nguyễn Văn An" autoComplete="name" />
          </label>
        )}
        <label className="auth-field">Email
          <input id="auth-email" type="email" value={form.email} onChange={set('email')} placeholder="ban@example.com" autoComplete="email" />
        </label>
        <label className="auth-field">Mật khẩu
          <input id="auth-password" type="password" value={form.password} onChange={set('password')} placeholder="••••••" autoComplete={isRegister ? 'new-password' : 'current-password'} />
        </label>
        {isRegister && (
          <label className="auth-field">Xác nhận mật khẩu
            <input id="auth-confirm" type="password" value={form.confirm} onChange={set('confirm')} placeholder="••••••" autoComplete="new-password" />
          </label>
        )}

        {error && <div className="auth-error" role="alert">{error}</div>}

        <button id="auth-submit" className="auth-submit" disabled={loading}>
          {loading ? 'Đang xử lý…' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
        </button>

        <p className="auth-switch">
          {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
          <button type="button" onClick={() => switchTo(isRegister ? 'login' : 'register')}>
            {isRegister ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </p>
      </form>
    </div>
  )
}