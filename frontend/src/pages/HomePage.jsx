import { useState } from 'react'
import { dishes, familyMembers } from '../data/dishes'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import RecipeCard from '../components/RecipeCard'

const DAYS = [
  ['T2', '21'], ['T3', '22'], ['T4', '23'],
  ['T5', '24'], ['T6', '25'], ['T7', '26'], ['CN', '27'],
]

const TODAY_MEALS = [
  { label: 'Bữa sáng', dish: dishes[6], time: '20 phút' },
  { label: 'Bữa trưa', dish: dishes[0], time: '45 phút' },
  { label: 'Bữa tối',  dish: dishes[1], time: '30 phút' },
]

export default function HomePage({ onNavigate, onShowRecipe }) {
  const toast = useToast()
  const { ingredients, checked, checkIngredient } = useApp()
  const [activeDay, setActiveDay] = useState(2)
  const [heroQuery, setHeroQuery] = useState('')

  function handleHeroSearch(e) {
    e.preventDefault()
    onNavigate('recipes', heroQuery)
  }

  return (
    <section id="page-home">
      {/* ── Hero ── */}
      <section className="hero" aria-label="Banner chào mừng">
        <div className="hero-content">
          <div className="eyebrow">♥ TỪ BẾP NHÀ ĐẾN TRÁI TIM</div>
          <h2>
            Hôm nay<br />nhà mình ăn gì?
          </h2>
          <p>Khám phá hàng nghìn công thức ngon, dễ nấu và lên thực đơn phù hợp cho gia đình bạn.</p>
          <form className="search" id="heroSearch" onSubmit={handleHeroSearch}>
            <input
              id="heroQuery"
              value={heroQuery}
              onChange={e => setHeroQuery(e.target.value)}
              placeholder="Tìm món ăn, nguyên liệu, công thức..."
              aria-label="Tìm món ăn"
            />
            <button type="submit">⌕ Tìm món</button>
          </form>
        </div>
      </section>

      {/* ── Quick links ── */}
      <div className="quick-links" role="list">
        <button className="quick" role="listitem" onClick={() => onNavigate('plan')}>
          <span className="quick-icon">🗓️</span>
          <span>
            <strong>Lên thực đơn</strong>
            <small>Gợi ý bữa ăn theo tuần</small>
          </span>
        </button>
        <button className="quick" role="listitem" onClick={() => onNavigate('shopping')}>
          <span className="quick-icon">🛒</span>
          <span>
            <strong>Đi chợ</strong>
            <small>Danh sách nguyên liệu</small>
          </span>
        </button>
        <button className="quick" role="listitem" onClick={() => onNavigate('cook')}>
          <span className="quick-icon">🍳</span>
          <span>
            <strong>Vào bếp</strong>
            <small>Hướng dẫn chi tiết</small>
          </span>
        </button>
        <button className="quick" role="listitem" onClick={() => onNavigate('family')}>
          <span className="quick-icon">👨‍👩‍👧</span>
          <span>
            <strong>Gia đình</strong>
            <small>Quản lý khẩu vị</small>
          </span>
        </button>
      </div>

      {/* ── Content grid ── */}
      <div className="content-grid">
        {/* Left: recipes */}
        <div>
          <div className="section-head">
            <div>
              <h3>Gợi ý cho bữa ăn hôm nay</h3>
              <p>Món ngon được chọn riêng cho căn bếp của bạn</p>
            </div>
            <button className="text-link" onClick={() => onNavigate('recipes')}>Xem tất cả →</button>
          </div>
          <div className="recipes">
            {dishes.slice(0, 3).map(d => (
              <RecipeCard key={d.id} dish={d} onShowRecipe={onShowRecipe} />
            ))}
          </div>
        </div>

        {/* Right: sidebar panels */}
        <aside className="side-stack">
          {/* Week plan panel */}
          <div className="panel">
            <div className="section-head">
              <div>
                <h3>Thực đơn tuần này</h3>
                <p>21/04 – 27/04 · Gợi ý cân bằng dinh dưỡng</p>
              </div>
              <button className="text-link" onClick={() => onNavigate('plan')}>Chi tiết →</button>
            </div>
            <div className="week-strip">
              {DAYS.map(([label, date], i) => (
                <button
                  key={i}
                  className={`day${activeDay === i ? ' active' : ''}`}
                  onClick={() => {
                    setActiveDay(i)
                    toast(`Đã chọn ngày ${label} ${date}/04`)
                  }}
                >
                  <b>{label}</b>
                  {date}/04
                </button>
              ))}
            </div>
            {/* Today's meals */}
            <div>
              {TODAY_MEALS.map((m, i) => (
                <div className="meal-row" key={i}>
                  <img src={m.dish.img} alt={m.dish.name} />
                  <div className="meal-info">
                    <small>{m.label}</small>
                    <strong>{m.dish.name}</strong>
                    <span>◷ {m.time}</span>
                  </div>
                  <button className="mini-btn" onClick={() => onShowRecipe(m.dish.id)}>
                    Chi tiết
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Promo panel */}
          <div className="panel promo">
            <div className="promo-icon">⏱️</div>
            <div>
              <strong>Tối nay chỉ có 30 phút?</strong>
              <p>Khám phá những món ngon, đơn giản, tiết kiệm thời gian.</p>
              <button className="text-link" onClick={() => onNavigate('recipes')}>Xem món nhanh →</button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Lower grid ── */}
      <div className="lower-grid">
        {/* Shopping list */}
        <section className="panel" aria-labelledby="shopping-heading">
          <div className="section-head">
            <div>
              <h3 id="shopping-heading">Danh sách đi chợ</h3>
              <p>Nguyên liệu cho thực đơn sắp tới</p>
            </div>
            <button className="text-link" onClick={() => onNavigate('shopping')}>Mở danh sách →</button>
          </div>
          <div className="shopping-list">
            {ingredients.slice(0, 6).map((item, i) => (
              <label key={i} className="shop-item">
                <input
                  type="checkbox"
                  checked={checked.has(i)}
                  onChange={e => checkIngredient(i, e.target.checked)}
                />
                <span style={checked.has(i) ? { textDecoration: 'line-through', color: 'var(--muted)' } : {}}>
                  {item[0]}
                </span>
                <span className="qty">{item[1]}</span>
              </label>
            ))}
          </div>
          <div className="budget">
            <div>
              <small>Chi phí dự kiến</small>
              <strong>135.000đ</strong>
            </div>
            <button className="primary" onClick={() => onNavigate('shopping')}>Đi chợ ngay →</button>
          </div>
        </section>

        {/* Family */}
        <section className="panel" aria-labelledby="family-heading">
          <div className="section-head">
            <div>
              <h3 id="family-heading">Gia đình mình</h3>
              <p>Khẩu vị và sở thích của các thành viên</p>
            </div>
            <button className="text-link" onClick={() => onNavigate('family')}>Quản lý →</button>
          </div>
          <div className="family-grid">
            {familyMembers.map((m, i) => (
              <div key={i} className="family-member">
                <div className="avatar" style={{ fontSize: 18 }}>{m.emoji}</div>
                <div>
                  <strong>{m.name}</strong>
                  <small>{m.age}</small>
                  <small>{m.pref}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <div>
          <b>DailyMeal</b>
          <div style={{ marginTop: 5 }}>Bữa cơm ngon, hạnh phúc hơn.</div>
        </div>
        <div>
          Hướng dẫn sử dụng&nbsp;&nbsp;·&nbsp;&nbsp;Quyền riêng tư&nbsp;&nbsp;·&nbsp;&nbsp;Liên hệ
          <br />
          <span style={{ display: 'inline-block', marginTop: 8 }}>
            © 2026 DailyMeal. Tất cả quyền được bảo lưu.
          </span>
        </div>
      </footer>
    </section>
  )
}
