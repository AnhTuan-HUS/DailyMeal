import { useState } from 'react'
import { roleOf, ageGroup } from '../../utils/family'

function memberNote(m) {
  if (m.allergies.length) return `Nhớ loại trừ ${m.allergies.join(', ').toLowerCase()} khỏi thực đơn.`
  if (m.age < 6) return 'Nên nêm nhạt, thái nhỏ và tránh món nhiều xương.'
  if (m.age >= 60) return 'Ưu tiên món mềm, ít mặn và dễ tiêu.'
  return ''
}

export default function MembersTab({ members, onAdd, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null)

  const stats = [
    { label: 'Thành viên', value: members.length, ico: '♧' },
    { label: 'Có dị ứng / kiêng', value: members.filter(m => m.allergies.length).length, ico: '⚠' },
    { label: 'Trẻ dưới 12 tuổi', value: members.filter(m => m.age < 12).length, ico: '☺' },
    { label: 'Từ 60 tuổi', value: members.filter(m => m.age >= 60).length, ico: '♡' },
  ]

  return (
    <>
      <div className="fam-stats">
        {stats.map(s => (
          <div key={s.label} className="fam-stat">
            <span className="fam-stat-ico">{s.ico}</span>
            <div>
              <strong>{s.value}</strong>
              <small>{s.label}</small>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 ? (
        <div className="panel fam-empty">
          <div className="fam-empty-ico">♧</div>
          <h4>Chưa có thành viên nào</h4>
          <p>Thêm người thân để DailyMeal ghi nhớ khẩu vị và gợi ý món phù hợp.</p>
          <button className="primary" onClick={onAdd}>+ Thêm thành viên đầu tiên</button>
        </div>
      ) : (
        <div className="fam-member-grid">
          {members.map(m => {
            const role = roleOf(m.role)
            const note = memberNote(m)
            return (
              <article key={m.id} className="fam-card">
                <div className="fam-card-top">
                  <div className="fam-avatar">{role.emoji}</div>
                  <div className="fam-card-id">
                    <strong>{m.name}</strong>
                    <span>{role.label} · {m.age} tuổi · {ageGroup(m.age)}</span>
                  </div>
                </div>

                <div className="fam-field">
                  <small>Thích ăn</small>
                  <div className="tag-row">
                    {m.likes.length > 0
                      ? m.likes.map(l => <span key={l} className="tag tag-like">{l}</span>)
                      : <em>Chưa ghi nhận</em>}
                  </div>
                </div>

                <div className="fam-field">
                  <small>Dị ứng / kiêng</small>
                  <div className="tag-row">
                    {m.allergies.length > 0
                      ? m.allergies.map(a => <span key={a} className="tag tag-danger">{a}</span>)
                      : <span className="tag tag-ok">Không có</span>}
                  </div>
                </div>

                {note && <p className="fam-note">💡 {note}</p>}

                <div className="fam-card-actions">
                  {confirmId === m.id ? (
                    <>
                      <span className="fam-confirm-text">Xóa {m.name}?</span>
                      <button className="mini-btn" onClick={() => setConfirmId(null)}>Hủy</button>
                      <button
                        className="mini-btn danger"
                        onClick={() => { setConfirmId(null); onDelete(m) }}
                      >
                        Xóa
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="mini-btn" onClick={() => onEdit(m)}>✎ Sửa</button>
                      <button className="mini-btn danger-soft" onClick={() => setConfirmId(m.id)}>Xóa</button>
                    </>
                  )}
                </div>
              </article>
            )
          })}

          <button className="fam-add-card" onClick={onAdd}>
            <span>+</span>
            Thêm thành viên
          </button>
        </div>
      )}
    </>
  )
}
