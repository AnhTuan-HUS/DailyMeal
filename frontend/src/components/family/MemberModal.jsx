import { useState, useEffect } from 'react'
import { memberRoles } from '../../data/dishes'
import { roleOf } from '../../utils/family'
import TagInput from './TagInput'

const LIKE_SUGGESTIONS = ['Thịt', 'Cá', 'Rau xanh', 'Trứng', 'Canh', 'Súp', 'Trái cây', 'Đậu phụ']
const ALLERGY_SUGGESTIONS = ['Hải sản có vỏ', 'Đậu phộng', 'Sữa', 'Trứng', 'Gluten']

// Modal thêm / sửa thành viên
export default function MemberModal({ member, onClose, onSave }) {
  const isEdit = Boolean(member)
  const [role, setRole] = useState(member ? member.role : 'khac')
  const [name, setName] = useState(member ? member.name : '')
  const [age, setAge] = useState(member ? String(member.age) : '')
  const [likes, setLikes] = useState(member ? member.likes : [])
  const [allergies, setAllergies] = useState(member ? member.allergies : [])
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function pickRole(nextId) {
    // Thêm mới: tự điền tên theo vai trò nếu người dùng chưa gõ gì
    if (!isEdit && (!name || name === roleOf(role).label)) setName(roleOf(nextId).label)
    setRole(nextId)
  }

  function submit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    const ageNum = Number(age)
    if (!trimmed) return setError('Vui lòng nhập tên thành viên.')
    if (age === '' || !Number.isFinite(ageNum) || ageNum < 0 || ageNum > 120) {
      return setError('Tuổi cần là số từ 0 đến 120.')
    }
    onSave({ role, name: trimmed, age: Math.round(ageNum), likes, allergies })
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
        <div className="modal-head">
          <div>
            <h3 id="member-modal-title">{isEdit ? 'Sửa thông tin thành viên' : 'Thêm thành viên'}</h3>
            <p>Thông tin này giúp DailyMeal gợi ý món hợp khẩu vị cả nhà.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">×</button>
        </div>

        <div className="form-field">
          <label>Vai trò</label>
          <div className="role-picker">
            {memberRoles.map(r => (
              <button
                type="button"
                key={r.id}
                className={role === r.id ? 'active' : ''}
                onClick={() => pickRole(r.id)}
              >
                <span>{r.emoji}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="member-name">Tên gọi</label>
            <input id="member-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ví dụ: Bố, Bé Na..." maxLength={30} />
          </div>
          <div className="form-field form-field-sm">
            <label htmlFor="member-age">Tuổi</label>
            <input id="member-age" type="number" min="0" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder="35" />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="member-likes">Thích ăn</label>
          <TagInput id="member-likes" value={likes} onChange={setLikes} placeholder="Gõ rồi nhấn Enter, ví dụ: Cá" suggestions={LIKE_SUGGESTIONS} tone="like" />
        </div>

        <div className="form-field">
          <label htmlFor="member-allergies">Dị ứng / kiêng</label>
          <TagInput id="member-allergies" value={allergies} onChange={setAllergies} placeholder="Không có thì để trống" suggestions={ALLERGY_SUGGESTIONS} tone="danger" />
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Hủy</button>
          <button type="submit" className="primary">{isEdit ? 'Lưu thay đổi' : 'Thêm thành viên'}</button>
        </div>
      </form>
    </div>
  )
}
