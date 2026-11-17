import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { authApi, PASSWORD_HINT, validateStrongPassword } from '@/services/authApi'
import { useToast } from '@/context/ToastContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordModal({ open = true, defaultEmail = '', onClose }) {
  const toast = useToast()
  const [step, setStep] = useState(1) // 1: Nhập Email | 2: Nhập OTP | 3: Đặt lại mật khẩu
  const [email, setEmail] = useState(defaultEmail)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [demoOtp, setDemoOtp] = useState('')
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' })
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [pwFieldErr, setPwFieldErr] = useState({ newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const otpRefs = useRef([])

  useEffect(() => {
    if (!open) return
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const otpValue = otpDigits.join('')

  // Bước 1: Gửi mã xác nhận qua Email
  async function handleSendOtp(e) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      return setError('Vui lòng nhập địa chỉ email')
    }
    if (!EMAIL_RE.test(trimmed)) {
      return setError('Định dạng email không hợp lệ')
    }

    setError('')
    setLoading(true)
    try {
      const res = await authApi.requestPasswordReset(trimmed)
      setDemoOtp(res.otp)
      setOtpDigits(['', '', '', '', '', ''])
      setStep(2)
      toast(`Đã gửi mã OTP (6 số) đến ${res.email}`)
      setTimeout(() => otpRefs.current[0]?.focus(), 60)
    } catch (ex) {
      setError(ex.message || 'Email chưa được đăng ký')
    } finally {
      setLoading(false)
    }
  }

  // Xử lý gõ từng ô trong 6 số OTP
  function handleOtpChange(index, val) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otpDigits]
    next[index] = digit
    setOtpDigits(next)
    setError('')

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = ['', '', '', '', '', '']
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]
    }
    setOtpDigits(next)
    setError('')
    const focusIdx = Math.min(pasted.length, 5)
    otpRefs.current[focusIdx]?.focus()
  }

  // Bước 2: Xác nhận OTP
  async function handleVerifyOtp(e) {
    e.preventDefault()
    if (otpValue.length < 6) {
      return setError('Vui lòng nhập đủ 6 chữ số OTP')
    }
    setError('')
    setLoading(true)
    try {
      await authApi.verifyResetOtp(email, otpValue)
      setStep(3)
    } catch (ex) {
      setError(ex.message || 'Mã OTP không chính xác')
    } finally {
      setLoading(false)
    }
  }

  // Gửi lại OTP ở bước 2
  async function handleResendOtp() {
    setError('')
    setLoading(true)
    try {
      const res = await authApi.requestPasswordReset(email)
      setDemoOtp(res.otp)
      setOtpDigits(['', '', '', '', '', ''])
      toast(`Đã gửi lại mã OTP mới đến ${res.email}`)
      setTimeout(() => otpRefs.current[0]?.focus(), 60)
    } catch (ex) {
      setError(ex.message || 'Không thể gửi lại mã OTP')
    } finally {
      setLoading(false)
    }
  }

  // Bước 3: Đặt lại mật khẩu mới
  async function handleResetPassword(e) {
    e.preventDefault()
    const cleanedNew = passwords.newPassword.trim()
    const cleanedConfirm = passwords.confirmPassword.trim()

    const strongErr = validateStrongPassword(cleanedNew)
    const confirmErr = !cleanedConfirm
      ? 'Vui lòng xác nhận mật khẩu mới'
      : cleanedNew !== cleanedConfirm
        ? 'Mật khẩu xác nhận không khớp'
        : ''

    if (strongErr || confirmErr) {
      setPwFieldErr({ newPassword: strongErr, confirmPassword: confirmErr })
      return
    }

    setPwFieldErr({ newPassword: '', confirmPassword: '' })
    setError('')
    setLoading(true)
    try {
      await authApi.resetPasswordWithOtp(email, otpValue, cleanedNew)
      toast('Khôi phục mật khẩu thành công!')
      onClose()
    } catch (ex) {
      setError(ex.message || 'Không thể đặt lại mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal fp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fp-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h3 id="fp-modal-title">Khôi phục mật khẩu</h3>
            <p>
              {step === 1 && 'Nhập địa chỉ email đã đăng ký để nhận mã xác nhận'}
              {step === 2 && `Nhập mã 6 số OTP đã được gửi tới ${email}`}
              {step === 3 && 'Thiết lập mật khẩu mới cho tài khoản của bạn'}
            </p>
          </div>
          <button type="button" className="modal-close" aria-label="Đóng" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Thanh tiến trình 3 bước */}
        <div className="fp-steps" aria-label="Các bước khôi phục mật khẩu">
          <div className={`fp-step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <span className="fp-step-num">{step > 1 ? '✓' : '1'}</span>
            <span className="fp-step-label">Nhập Email</span>
          </div>
          <div className={`fp-step-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`fp-step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
            <span className="fp-step-num">{step > 2 ? '✓' : '2'}</span>
            <span className="fp-step-label">Nhập OTP</span>
          </div>
          <div className={`fp-step-line ${step >= 3 ? 'active' : ''}`} />
          <div className={`fp-step-item ${step >= 3 ? 'active' : ''}`}>
            <span className="fp-step-num">3</span>
            <span className="fp-step-label">Đặt lại mật khẩu</span>
          </div>
        </div>

        {/* Bước 1 - Nhập Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="fp-form" noValidate>
            <div className="pf-field">
              <label htmlFor="fp-email">Email tài khoản</label>
              <input
                id="fp-email"
                type="email"
                className={error ? 'is-invalid' : ''}
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="Nhập email đã đăng ký (vd: an.nguyen@example.com)"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="fp-error-alert" role="alert">
                {error}
              </div>
            )}

            <div className="fp-actions">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Hủy
              </button>
              <button id="fp-send-otp" type="submit" className="pf-submit-btn" disabled={loading}>
                {loading ? 'Đang kiểm tra...' : 'Gửi mã xác nhận'}
              </button>
            </div>
          </form>
        )}

        {/* Bước 2 - Nhập OTP 6 số */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="fp-form" noValidate>
            {demoOtp && (
              <div className="fp-otp-demo-hint">
                Mã xác nhận OTP gửi về mail của bạn là: <strong>{demoOtp}</strong>
              </div>
            )}

            <div className="pf-field">
              <label>Mã xác nhận (6 chữ số)</label>
              <div className="fp-otp-inputs" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el }}
                    id={`fp-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`fp-otp-box ${error ? 'is-invalid' : ''}`}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    aria-label={`Chữ số OTP thứ ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="fp-resend-row">
                <span>Chưa nhận được mã?</span>
                <button
                  type="button"
                  className="fp-forgot-link"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Gửi lại mã OTP
                </button>
              </div>
            </div>

            {error && (
              <div className="fp-error-alert" role="alert">
                {error}
              </div>
            )}

            <div className="fp-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setError('')
                  setStep(1)
                }}
              >
                Quay lại
              </button>
              <button id="fp-verify-otp" type="submit" className="pf-submit-btn" disabled={loading}>
                {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
              </button>
            </div>
          </form>
        )}

        {/* Bước 3 - Đặt lại Mật khẩu */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="fp-form" noValidate>
            <div className="pf-field">
              <label htmlFor="fp-new-password">Mật khẩu mới</label>
              <div className="pf-pw-input-wrap">
                <input
                  id="fp-new-password"
                  type={showNewPw ? 'text' : 'password'}
                  className={pwFieldErr.newPassword ? 'is-invalid' : ''}
                  placeholder="Nhập mật khẩu mới"
                  minLength={8}
                  maxLength={32}
                  value={passwords.newPassword}
                  onChange={e => {
                    const val = e.target.value
                    setPasswords(p => ({ ...p, newPassword: val }))
                    setError('')
                    if (pwFieldErr.newPassword) {
                      setPwFieldErr(err => ({
                        ...err,
                        newPassword: val.trim() ? validateStrongPassword(val) : '',
                      }))
                    }
                  }}
                  onBlur={() => {
                    if (passwords.newPassword) {
                      setPwFieldErr(err => ({
                        ...err,
                        newPassword: validateStrongPassword(passwords.newPassword),
                      }))
                    }
                  }}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className="pf-pw-toggle"
                  onClick={() => setShowNewPw(v => !v)}
                  aria-label={showNewPw ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                  title={showNewPw ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                >
                  {showNewPw ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
              <span className="pf-hint">{PASSWORD_HINT}</span>
              {pwFieldErr.newPassword && (
                <span className="pf-field-error" role="alert">
                  {pwFieldErr.newPassword}
                </span>
              )}
            </div>

            <div className="pf-field">
              <label htmlFor="fp-confirm-password">Xác nhận mật khẩu</label>
              <div className="pf-pw-input-wrap">
                <input
                  id="fp-confirm-password"
                  type={showConfirmPw ? 'text' : 'password'}
                  className={pwFieldErr.confirmPassword ? 'is-invalid' : ''}
                  placeholder="Nhập lại mật khẩu mới"
                  minLength={8}
                  maxLength={32}
                  value={passwords.confirmPassword}
                  onChange={e => {
                    setPasswords(p => ({ ...p, confirmPassword: e.target.value }))
                    setError('')
                    if (pwFieldErr.confirmPassword) {
                      setPwFieldErr(err => ({ ...err, confirmPassword: '' }))
                    }
                  }}
                  onBlur={() => {
                    if (passwords.confirmPassword) {
                      const match = passwords.newPassword.trim() === passwords.confirmPassword.trim()
                      setPwFieldErr(err => ({
                        ...err,
                        confirmPassword: match ? '' : 'Mật khẩu xác nhận không khớp',
                      }))
                    }
                  }}
                  required
                />
                <button
                  type="button"
                  className="pf-pw-toggle"
                  onClick={() => setShowConfirmPw(v => !v)}
                  aria-label={showConfirmPw ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                  title={showConfirmPw ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                >
                  {showConfirmPw ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
              {pwFieldErr.confirmPassword && (
                <span className="pf-field-error" role="alert">
                  {pwFieldErr.confirmPassword}
                </span>
              )}
            </div>

            {error && (
              <div className="fp-error-alert" role="alert">
                {error}
              </div>
            )}

            <div className="fp-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setError('')
                  setStep(2)
                }}
              >
                Quay lại
              </button>
              <button id="fp-reset-submit" type="submit" className="pf-submit-btn" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
