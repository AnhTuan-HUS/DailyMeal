import { useState } from 'react'
import { roleOf, ageGroup } from '../../utils/family'

function memberNote(m) {
  if (m.allergies.length) return `Loại trừ ${m.allergies.join(', ').toLowerCase()} khỏi mọi món ăn của thành viên.`
  if (m.age < 6) return 'Nên nêm nhạt, thái nhỏ nguyên liệu và tránh các món nhiều xương.'
  if (m.age >= 60) return 'Ưu tiên các món hầm mềm, ít muối mặn và dễ tiêu hóa.'
  return ''
}

// Icon avatar người dùng mặc định (chuẩn nét, phong cách thanh lịch tone màu ấm)
function UserSilhouetteAvatar({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3.6a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Zm-2.2 9.6a6.5 6.5 0 0 0-6.3 6.5v.8a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1v-.8a6.5 6.5 0 0 0-6.3-6.5h-4.4Z"
        fill="#ffffff"
      />
    </svg>
  )
}

export default function MembersTab({ members, onAdd, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null)

  const allergyCount = members.filter(m => m.allergies.length).length
  const specialDietCount = members.filter(m => m.age < 12 || m.age >= 60).length

  return (
    <div className="fam-tab-content">
      {/* ── 1. Thống kê thu gọn tinh tế (Summary Strip) ── */}
      <div className="fam-summary-strip" role="region" aria-label="Tóm tắt gia đình">
        <div className="fam-sum-item">
          <strong className="fam-sum-val">{members.length}</strong>
          <span className="fam-sum-lbl">Thành viên gia đình</span>
        </div>
        <div className="fam-sum-divider" aria-hidden="true" />

        <div className="fam-sum-item">
          <div className="fam-sum-val-row">
            <strong className="fam-sum-val">{allergyCount}</strong>
            {allergyCount > 0 && <span className="fam-sum-dot fam-dot-warn" title="Có thành viên có món kiêng" />}
          </div>
          <span className="fam-sum-lbl">Có dị ứng / kiêng</span>
        </div>
        <div className="fam-sum-divider" aria-hidden="true" />

        <div className="fam-sum-item">
          <strong className="fam-sum-val">{specialDietCount}</strong>
          <span className="fam-sum-lbl">Trẻ nhỏ & người cao tuổi</span>
        </div>
        <div className="fam-sum-divider" aria-hidden="true" />

        <div className="fam-sum-item">
          <div className="fam-sum-val-row">
            <strong className="fam-sum-val" style={{ color: '#3b6b35' }}>100%</strong>
            <span className="fam-sum-dot fam-dot-ok" title="Đã ghi nhận khẩu vị" />
          </div>
          <span className="fam-sum-lbl">Cân bằng khẩu vị</span>
        </div>
      </div>

      {/* ── 2. Danh sách thẻ thành viên ── */}
      {members.length === 0 ? (
        <div className="panel fam-empty">
          <div className="fam-empty-ico">
            <UserSilhouetteAvatar size={36} />
          </div>
          <h4>Chưa có thành viên nào trong gia đình</h4>
          <p>Thêm người thân để DailyMeal ghi nhớ khẩu vị và tự động gợi ý mâm cơm hợp ý cả nhà.</p>
          <button type="button" className="primary" onClick={onAdd}>+ Thêm thành viên đầu tiên</button>
        </div>
      ) : (
        <>
          <div className="fam-member-grid">
            {members.map(m => {
              const role = roleOf(m.role)
              const note = memberNote(m)
              const isConfirming = confirmId === m.id
              const showRoleBadge = m.name.trim().toLowerCase() !== role.label.trim().toLowerCase()

              return (
                <article key={m.id} className="fam-card">
                  {/* Phần đầu: Avatar đồng nhất kiểu Facebook silhouette ấm, tên, tuổi & nút hành động */}
                  <div className="fam-card-header">
                    <div className="fam-avatar-editorial" aria-hidden="true">
                      <UserSilhouetteAvatar size={26} />
                    </div>

                    <div className="fam-header-info">
                      <div className="fam-name-row">
                        <h4 className="fam-member-name">{m.name}</h4>
                        {showRoleBadge && (
                          <span className="fam-role-tag">{role.label}</span>
                        )}
                      </div>
                      <div className="fam-sub-meta">
                        <span>{m.age} tuổi</span>
                        <span className="fam-meta-dot">·</span>
                        <span>{ageGroup(m.age)}</span>
                      </div>
                    </div>

                    {/* Nút hành động Sửa / Xóa */}
                    <div className="fam-action-group">
                      {!isConfirming && (
                        <>
                          <button
                            type="button"
                            className="fam-btn-icon"
                            onClick={() => onEdit(m)}
                            aria-label={`Sửa thông tin ${m.name}`}
                            title="Sửa thông tin"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="fam-btn-icon fam-btn-del"
                            onClick={() => setConfirmId(m.id)}
                            aria-label={`Xóa thành viên ${m.name}`}
                            title="Xóa thành viên"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Thanh xác nhận xóa tinh tế */}
                  {isConfirming && (
                    <div className="fam-confirm-bar" role="alert">
                      <span className="fam-confirm-text">Xóa {m.name}?</span>
                      <div className="fam-confirm-btns">
                        <button type="button" className="fam-conf-cancel" onClick={() => setConfirmId(null)}>Hủy</button>
                        <button type="button" className="fam-conf-delete" onClick={() => { setConfirmId(null); onDelete(m) }}>Xóa</button>
                      </div>
                    </div>
                  )}

                  {/* Sở thích món ăn */}
                  <div className="fam-pref-section">
                    <span className="fam-pref-label">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      Thích ăn
                    </span>
                    <div className="fam-tags-wrap">
                      {m.likes.length > 0 ? (
                        m.likes.map(l => <span key={l} className="fam-chip fam-chip-like">{l}</span>)
                      ) : (
                        <em className="fam-empty-tag">Chưa ghi nhận sở thích</em>
                      )}
                    </div>
                  </div>

                  {/* Dị ứng / Kiêng kỵ */}
                  <div className="fam-pref-section">
                    <span className="fam-pref-label">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      Dị ứng / Kiêng kỵ
                    </span>
                    <div className="fam-tags-wrap">
                      {m.allergies.length > 0 ? (
                        m.allergies.map(a => <span key={a} className="fam-chip fam-chip-allergy">{a}</span>)
                      ) : (
                        <span className="fam-chip fam-chip-none">Không có dị ứng</span>
                      )}
                    </div>
                  </div>

                  {/* Lời khuyên dinh dưỡng thu gọn */}
                  {note && (
                    <div className="fam-editorial-note">
                      <span className="fam-note-bulb" aria-hidden="true">💡</span>
                      <p>{note}</p>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          {/* ── 3. Nút thêm thành viên gọn gàng cuối danh sách ── */}
          <div className="fam-add-footer">
            <button type="button" className="fam-add-footer-btn" onClick={onAdd}>
              <span className="fam-add-plus-icon" aria-hidden="true">+</span>
              <span>Thêm thành viên mới vào gia đình</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
