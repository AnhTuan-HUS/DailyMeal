import { useMemo } from 'react'
import { dishes } from '../../data/dishes'
import { findConflicts, collectAvoidTerms } from '../../utils/family'
import TagInput from './TagInput'

const EXCLUDE_SUGGESTIONS = ['Hành sống', 'Nội tạng', 'Dứa', 'Mướp đắng', 'Rau mùi', 'Cà tím']

const PROFILE_TOGGLES = [
  { key: 'soft',     title: 'Mềm',      desc: 'Ưu tiên món hầm, kho, súp — hợp với bé nhỏ và người lớn tuổi.' },
  { key: 'lowSalt',  title: 'Ít mặn',   desc: 'Giảm nước mắm, muối khi gợi ý và nêm nếm.' },
  { key: 'noSpicy',  title: 'Không cay', desc: 'Bỏ ớt, tiêu; món cay chỉ để riêng cho người lớn.' },
  { key: 'lowSugar', title: 'Ít ngọt',  desc: 'Hạn chế món kho ngọt, nước màu, nước sốt đường.' },
]

export default function ProfileTab({ members, profile, onChange, onShowRecipe }) {
  const avoidTerms = useMemo(
    () => collectAvoidTerms(members, profile.excluded),
    [members, profile.excluded]
  )

  const affected = useMemo(
    () =>
      dishes
        .map(d => ({ dish: d, hits: findConflicts(d, avoidTerms) }))
        .filter(x => x.hits.length > 0),
    [avoidTerms]
  )

  const hints = []
  if (members.some(m => m.age < 6) && !profile.lowSalt) hints.push('Nhà có bé dưới 6 tuổi — nên bật "Ít mặn".')
  if (members.some(m => m.age >= 60) && !profile.soft) hints.push('Nhà có người từ 60 tuổi — nên bật "Mềm" cho dễ ăn.')
  if (members.some(m => m.age < 12) && !profile.noSpicy) hints.push('Có trẻ nhỏ — món cay nên tách phần riêng cho người lớn.')

  const activeLabels = PROFILE_TOGGLES.filter(t => profile[t.key]).map(t => t.title)
  const allergyAll = [...new Set(members.flatMap(m => m.allergies))]

  return (
    <div className="fam-profile-grid">
      <div className="fam-profile-main">
        <section className="panel">
          <h3>Khẩu vị chung của cả nhà</h3>
          <p className="panel-sub">Bật các lựa chọn bên dưới, mọi gợi ý thực đơn sẽ ưu tiên theo hồ sơ này.</p>
          <div className="switch-list">
            {PROFILE_TOGGLES.map(t => (
              <div key={t.key} className="switch-row">
                <div>
                  <strong>{t.title}</strong>
                  <small>{t.desc}</small>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={profile[t.key]}
                  aria-label={t.title}
                  className={`switch${profile[t.key] ? ' on' : ''}`}
                  onClick={() => onChange({ [t.key]: !profile[t.key] })}
                >
                  <span />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>Số người ăn mặc định</h3>
          <p className="panel-sub">Dùng khi tính khẩu phần và lên danh sách đi chợ.</p>
          <div className="stepper">
            <button
              type="button"
              aria-label="Giảm"
              disabled={profile.defaultServings <= 1}
              onClick={() => onChange({ defaultServings: profile.defaultServings - 1 })}
            >
              −
            </button>
            <div>
              <strong>{profile.defaultServings}</strong>
              <small>người</small>
            </div>
            <button
              type="button"
              aria-label="Tăng"
              disabled={profile.defaultServings >= 12}
              onClick={() => onChange({ defaultServings: profile.defaultServings + 1 })}
            >
              +
            </button>
            <span className="stepper-hint">Cả nhà hiện có {members.length} thành viên.</span>
          </div>
        </section>

        <section className="panel">
          <h3>Nguyên liệu loại trừ</h3>
          <p className="panel-sub">Những thứ cả nhà không ăn hoặc không muốn xuất hiện trong gợi ý.</p>
          <TagInput
            id="excluded-input"
            value={profile.excluded}
            onChange={excluded => onChange({ excluded })}
            placeholder="Gõ rồi nhấn Enter, ví dụ: Hành sống"
            suggestions={EXCLUDE_SUGGESTIONS}
            tone="danger"
          />
        </section>
      </div>

      <aside className="fam-profile-side">
        <section className="panel fam-summary">
          <h3>Tóm tắt hồ sơ</h3>
          <div className="fam-summary-block">
            <small>Đang áp dụng</small>
            <div className="tag-row">
              {activeLabels.length > 0
                ? activeLabels.map(l => <span key={l} className="tag tag-like">{l}</span>)
                : <em>Chưa chọn khẩu vị nào</em>}
            </div>
          </div>
          <div className="fam-summary-block">
            <small>Dị ứng của cả nhà</small>
            <div className="tag-row">
              {allergyAll.length > 0
                ? allergyAll.map(a => <span key={a} className="tag tag-danger">{a}</span>)
                : <span className="tag tag-ok">Không có</span>}
            </div>
          </div>
          <div className="fam-summary-block">
            <small>Khẩu phần mặc định</small>
            <strong>{profile.defaultServings} người</strong>
          </div>
          {hints.length > 0 && (
            <ul className="fam-hints">
              {hints.map(h => <li key={h}>💡 {h}</li>)}
            </ul>
          )}
        </section>

        <section className="panel">
          <h3>Món cần lưu ý</h3>
          <p className="panel-sub">Món trong kho có nguyên liệu trùng với dị ứng hoặc mục loại trừ.</p>
          {affected.length === 0 ? (
            <p className="empty-state">Chưa có món nào bị ảnh hưởng. 🎉</p>
          ) : (
            <div className="affected-list">
              {affected.map(({ dish, hits }) => (
                <div key={dish.id} className="affected-row">
                  <img src={dish.img} alt="" loading="lazy" />
                  <div>
                    <strong>{dish.name}</strong>
                    <small>Có: {hits.map(h => h.term.toLowerCase()).join(', ')}</small>
                  </div>
                  <button className="mini-btn" onClick={() => onShowRecipe && onShowRecipe(dish.id)}>Xem</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </aside>
    </div>
  )
}
