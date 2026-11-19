import { useRef, useState } from 'react'
import { Camera, Check, Eye, EyeOff, Lock, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { authApi, PASSWORD_HINT, validateStrongPassword } from '@/services/authApi'
import { getInitials } from '@/utils/user'
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const fileInputRef = useRef(null)

  const [name, setName] = useState(user.fullName)
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false })
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingAvatar, setLoadingAvatar] = useState(false)
  const [loadingPw, setLoadingPw] = useState(false)
  const [err, setErr] = useState({ profile: '', oldPassword: '', newPassword: '', confirm: '', pwForm: '' })
  const [showForgotModal, setShowForgotModal] = useState(false)

  function triggerAvatarUpload() {
    if (!loadingAvatar) fileInputRef.current?.click()
  }

  function handleAvatarFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP)')
      e.target.value = ''
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      toast('Kích thước ảnh tối đa là 3MB')
      e.target.value = ''
      return
    }

    setLoadingAvatar(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        await authApi.updateProfile(user.id, { avatarUrl: String(reader.result || '') })
        refreshUser()
        toast('Đã cập nhật ảnh đại diện thành công!')
      } catch (ex) {
        toast(ex.message || 'Không thể tải ảnh đại diện lên')
      } finally {
        setLoadingAvatar(false)
        e.target.value = ''
      }
    }
    reader.onerror = () => {
      setLoadingAvatar(false)
      toast('Không thể đọc tệp ảnh, vui lòng thử lại')
    }
    reader.readAsDataURL(file)
  }

  async function saveProfile(e) {
    e.preventDefault()
    const cleanedName = name.trim()
    if (!cleanedName || cleanedName.length < 2) {
      setErr(x => ({ ...x, profile: 'Họ và tên phải có ít nhất 2 ký tự (không tính khoảng trắng)' }))
      return
    }
    setLoadingProfile(true)
    try {
      await authApi.updateProfile(user.id, { fullName: cleanedName })
      setName(cleanedName)
      refreshUser()
      setErr(x => ({ ...x, profile: '' }))
      toast('Đã cập nhật thông tin cá nhân thành công!')
    } catch (ex) {
      setErr(x => ({ ...x, profile: ex.message || 'Không thể cập nhật hồ sơ' }))
    } finally {
      setLoadingProfile(false)
    }
  }

  function handleNewPwChange(val) {
    setPw(p => ({ ...p, newPassword: val }))
    if (err.newPassword || err.pwForm) {
      const msg = val.trim() ? validateStrongPassword(val) : ''
      setErr(x => ({ ...x, newPassword: msg, pwForm: '' }))
    }
  }

  function handleNewPwBlur() {
    if (!pw.newPassword) return
    const msg = validateStrongPassword(pw.newPassword)
    setErr(x => ({ ...x, newPassword: msg }))
  }

  function handleConfirmBlur() {
    if (!pw.confirm) return
    const cleanedNew = pw.newPassword.trim()
    const cleanedConfirm = pw.confirm.trim()
    setErr(x => ({
      ...x,
      confirm: cleanedNew !== cleanedConfirm ? 'Mật khẩu xác nhận không khớp' : '',
    }))
  }

  async function savePassword(e) {
    e.preventDefault()
    const cleanedOld = pw.oldPassword.trim()
    const cleanedNew = pw.newPassword.trim()
    const cleanedConfirm = pw.confirm.trim()

    const nextErr = { oldPassword: '', newPassword: '', confirm: '', pwForm: '' }

    if (!cleanedOld) {
      nextErr.oldPassword = 'Vui lòng nhập mật khẩu hiện tại'
    }

    const strongErr = validateStrongPassword(cleanedNew)
    if (strongErr) {
      nextErr.newPassword = strongErr
    }

    if (!cleanedConfirm) {
      nextErr.confirm = 'Vui lòng nhập lại mật khẩu mới để xác nhận'
    } else if (cleanedNew !== cleanedConfirm) {
      nextErr.confirm = 'Mật khẩu xác nhận không khớp'
    }

    if (nextErr.oldPassword || nextErr.newPassword || nextErr.confirm) {
      setErr(x => ({ ...x, ...nextErr }))
      return
    }

    setLoadingPw(true)
    try {
      await authApi.changePassword(user.id, {
        oldPassword: cleanedOld,
        newPassword: cleanedNew,
      })
      setPw({ oldPassword: '', newPassword: '', confirm: '' })
      setErr(x => ({ ...x, oldPassword: '', newPassword: '', confirm: '', pwForm: '' }))
      toast('Đã thay đổi mật khẩu thành công!')
    } catch (ex) {
      const message = ex.message || 'Không thể đổi mật khẩu'
      if (message.includes('hiện tại')) {
        setErr(x => ({ ...x, oldPassword: message, pwForm: '' }))
      } else {
        setErr(x => ({ ...x, pwForm: message }))
      }
    } finally {
      setLoadingPw(false)
    }
  }

  return (
    <section id="page-profile" className="pf-page">
      {/* ── Thẻ đại diện người dùng (Hero Profile Card - Hình 3) ── */}
      <div className="pf-hero">
        <div className="pf-hero-main">
          <div className="pf-avatar-wrap">
            <div className="avatar pf-avatar-large" onClick={triggerAvatarUpload} title="Bấm để đổi ảnh đại diện">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="avatar-img" />
              ) : (
                getInitials(user.fullName)
              )}
            </div>
            <button
              type="button"
              className="pf-avatar-cam-btn"
              onClick={triggerAvatarUpload}
              aria-label="Đổi ảnh đại diện"
              title="Đổi ảnh đại diện"
            >
              <Camera size={14} strokeWidth={2.2} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="pf-avatar-file-input"
              onChange={handleAvatarFileChange}
            />
          </div>

          <div className="pf-hero-info">
            <h3>{user.fullName}</h3>
            <div className="pf-hero-email-row">
              <span className="pf-hero-email">{user.email}</span>
              <span className="badge-verified">
                <Check size={13} strokeWidth={2.6} />
                Đã xác thực
              </span>
            </div>
          </div>
        </div>

        <div className="pf-hero-actions">
          <button
            type="button"
            id="btn-upload-avatar"
            className="pf-upload-btn"
            onClick={triggerAvatarUpload}
            disabled={loadingAvatar}
          >
            {loadingAvatar ? 'Đang tải...' : 'Tải ảnh lên'}
          </button>
        </div>
      </div>

      {/* ── Lưới 2 cột biểu mẫu cập nhật thông tin & mật khẩu cân đối ── */}
      <div className="pf-grid">
        {/* Cột 1: Thông tin cơ bản (Hình 1 - không có nút Đổi email) */}
        <form className="pf-card-form" onSubmit={saveProfile} noValidate>
          <div className="pf-header">
            <div className="pf-header-icon" aria-hidden="true">
              <User size={20} strokeWidth={2} />
            </div>
            <div>
              <h4>Thông tin cơ bản</h4>
            </div>
          </div>

          <div className="pf-card-body">
            <div className="pf-field">
              <label htmlFor="pf-name">Họ và tên hiển thị</label>
              <input
                id="pf-name"
                type="text"
                className={err.profile ? 'is-invalid' : ''}
                value={name}
                onChange={e => {
                  setName(e.target.value)
                  if (err.profile) setErr(x => ({ ...x, profile: '' }))
                }}
                placeholder="Nhập họ và tên đầy đủ"
                maxLength={60}
                required
              />
              {err.profile ? (
                <span className="pf-field-error" role="alert">{err.profile}</span>
              ) : (
                <span className="pf-hint">Hiển thị trên thanh điều hướng và trong không gian gia đình.</span>
              )}
            </div>

            <div className="pf-field">
              <label htmlFor="pf-email">Email đăng nhập</label>
              <div className="pf-pw-input-wrap">
                <input
                  id="pf-email"
                  type="email"
                  value={user.email}
                  disabled
                  title="Email dùng để đăng nhập và nhận mã OTP"
                />
                <span className="pf-input-lock-ico" aria-hidden="true">
                  <Lock size={17} strokeWidth={1.9} />
                </span>
              </div>
              <span className="pf-hint">Dùng để đăng nhập và nhận mã OTP.</span>
            </div>
          </div>

          <div className="pf-card-footer">
            <button id="pf-save" type="submit" className="pf-submit-btn" disabled={loadingProfile}>
              {loadingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>

        {/* Cột 2: Đổi mật khẩu (Hình 2 - có icon mắt cho cả 3 ô mật khẩu) */}
        <form className="pf-card-form" onSubmit={savePassword} noValidate>
          <div className="pf-header">
            <div className="pf-header-icon" aria-hidden="true">
              <Lock size={20} strokeWidth={2} />
            </div>
            <div>
              <h4>Đổi mật khẩu</h4>
            </div>
          </div>

          <div className="pf-card-body">
            <div className="pf-field">
              <div className="pf-label-row">
                <label htmlFor="pf-oldPassword">Mật khẩu hiện tại</label>
              </div>
              <div className="pf-pw-input-wrap">
                <input
                  id="pf-oldPassword"
                  type={showPw.old ? 'text' : 'password'}
                  className={err.oldPassword ? 'is-invalid' : ''}
                  placeholder="Nhập mật khẩu hiện tại"
                  value={pw.oldPassword}
                  onChange={e => {
                    setPw(p => ({ ...p, oldPassword: e.target.value }))
                    if (err.oldPassword) setErr(x => ({ ...x, oldPassword: '' }))
                  }}
                />
                <button
                  type="button"
                  className="pf-pw-toggle"
                  onClick={() => setShowPw(s => ({ ...s, old: !s.old }))}
                  aria-label={showPw.old ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'}
                  title={showPw.old ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                >
                  {showPw.old ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
              {err.oldPassword && (
                <span className="pf-field-error" role="alert">{err.oldPassword}</span>
              )}
              <div className="pf-forgot-wrap">
                <button
                  type="button"
                  id="btn-forgot-password"
                  className="fp-forgot-link"
                  onClick={() => setShowForgotModal(true)}
                >
                  Quên mật khẩu hiện tại?
                </button>
              </div>
            </div>

            <div className="pf-field">
              <label htmlFor="pf-newPassword">Mật khẩu mới</label>
              <div className="pf-pw-input-wrap">
                <input
                  id="pf-newPassword"
                  type={showPw.new ? 'text' : 'password'}
                  className={err.newPassword ? 'is-invalid' : ''}
                  placeholder="Nhập mật khẩu mới"
                  minLength={8}
                  maxLength={32}
                  value={pw.newPassword}
                  onChange={e => handleNewPwChange(e.target.value)}
                  onBlur={handleNewPwBlur}
                  aria-describedby="pf-newPassword-hint"
                />
                <button
                  type="button"
                  className="pf-pw-toggle"
                  onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}
                  aria-label={showPw.new ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                  title={showPw.new ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                >
                  {showPw.new ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
              <span id="pf-newPassword-hint" className="pf-hint">
                {PASSWORD_HINT}
              </span>
              {err.newPassword && (
                <span className="pf-field-error" role="alert">{err.newPassword}</span>
              )}
            </div>

            <div className="pf-field">
              <label htmlFor="pf-confirm">Xác nhận mật khẩu mới</label>
              <div className="pf-pw-input-wrap">
                <input
                  id="pf-confirm"
                  type={showPw.confirm ? 'text' : 'password'}
                  className={err.confirm ? 'is-invalid' : ''}
                  placeholder="Nhập lại mật khẩu mới"
                  minLength={8}
                  maxLength={32}
                  value={pw.confirm}
                  onChange={e => {
                    setPw(p => ({ ...p, confirm: e.target.value }))
                    if (err.confirm) setErr(x => ({ ...x, confirm: '' }))
                  }}
                  onBlur={handleConfirmBlur}
                />
                <button
                  type="button"
                  className="pf-pw-toggle"
                  onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                  aria-label={showPw.confirm ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                  title={showPw.confirm ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                >
                  {showPw.confirm ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
              {err.confirm && (
                <span className="pf-field-error" role="alert">{err.confirm}</span>
              )}
            </div>

            {err.pwForm && <div className="auth-error" role="alert">{err.pwForm}</div>}
          </div>

          <div className="pf-card-footer">
            <button id="pf-change-pw" type="submit" className="pf-submit-btn" disabled={loadingPw}>
              {loadingPw ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal Khôi phục mật khẩu (3 bước: Email -> OTP -> Đặt lại mật khẩu) */}
      {showForgotModal && (
        <ForgotPasswordModal
          defaultEmail=""
          onClose={() => setShowForgotModal(false)}
        />
      )}
    </section>
  )
}
