import { useState } from 'react'
import { dishes } from '@/data/dishes'
import { roleOf, prefLabel } from '../utils/family'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import RecipeCard from '@/components/recipe/RecipeCard'

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
  const { ingredients, checked, checkIngredient, members } = useApp()
  const [activeDay, setActiveDay] = useState(2)
  const [heroQuery, setHeroQuery] = useState('')

  function handleHeroSearch(e) {
    e.preventDefault()
    onNavigate('recipes', heroQuery)
  }

  return (
    <section id="page-home">
      {/* ── 1. Hero Banner ── */}
      <section className="hero" aria-label="Banner chào mừng">
        <div className="hero-content">
          <div className="eyebrow">✦ TỪ BẾP NHÀ ĐẾN TRÁI TIM</div>
          <h2>
            Hôm nay<br />nhà mình ăn gì?
          </h2>
          <p>Khám phá hàng nghìn công thức ngon, dễ nấu và lên thực đơn cân bằng dinh dưỡng cho cả gia đình.</p>
          <form className="search" id="heroSearch" onSubmit={handleHeroSearch}>
            <div className="hero-search-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="hero-search-icon" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="heroQuery"
                value={heroQuery}
                onChange={e => setHeroQuery(e.target.value)}
                placeholder="Tìm món ăn, nguyên liệu, công thức..."
                aria-label="Tìm món ăn"
              />
            </div>
            <button type="submit">
              <span>Tìm món</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* ── 2. 4 Chức năng chính (Quick links) ── */}
      <div className="quick-links" role="list">
        <button className="quick quick-plan" role="listitem" onClick={() => onNavigate('plan')}>
          <span className="quick-icon quick-icon-plan" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <span className="quick-text">
            <strong>Lên thực đơn</strong>
            <small>Gợi ý bữa ăn theo tuần</small>
          </span>
          <span className="quick-arrow" aria-hidden="true">&rarr;</span>
        </button>

        <button className="quick quick-shopping" role="listitem" onClick={() => onNavigate('shopping')}>
          <span className="quick-icon quick-icon-shopping" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </span>
          <span className="quick-text">
            <strong>Đi chợ</strong>
            <small>Danh sách nguyên liệu</small>
          </span>
          <span className="quick-arrow" aria-hidden="true">&rarr;</span>
        </button>

        <button className="quick quick-cook" role="listitem" onClick={() => onNavigate('cook')}>
          <span className="quick-icon quick-icon-cook" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 13.8V4a2 2 0 1 1 4 0v9.8" />
              <path d="M14 13.8V4a2 2 0 1 1 4 0v9.8" />
              <path d="M2 14h20l-2 7a2 2 0 0 1-2 1H6a2 2 0 0 1-2-1l-2-7z" />
            </svg>
          </span>
          <span className="quick-text">
            <strong>Vào bếp</strong>
            <small>Hướng dẫn chi tiết</small>
          </span>
          <span className="quick-arrow" aria-hidden="true">&rarr;</span>
        </button>

        <button className="quick quick-family" role="listitem" onClick={() => onNavigate('family')}>
          <span className="quick-icon quick-icon-family" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <span className="quick-text">
            <strong>Gia đình</strong>
            <small>Quản lý khẩu vị</small>
          </span>
          <span className="quick-arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>

      {/* ── 3. Khu vực Gợi ý món ăn: Toàn bộ chiều rộng, 3 card cân xứng ── */}
      <section className="home-section" aria-label="Gợi ý món ăn hôm nay">
        <div className="section-head">
          <div>
            <h3>Gợi ý cho bữa ăn hôm nay</h3>
            <p>Món ngon được chọn riêng cho khẩu vị căn bếp của bạn</p>
          </div>
          <button className="text-link" onClick={() => onNavigate('recipes')}>
            <span>Xem tất cả món</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <div className="recipes home-full-recipes">
          {dishes.slice(0, 3).map(d => (
            <RecipeCard key={d.id} dish={d} onShowRecipe={onShowRecipe} />
          ))}
        </div>
      </section>

      {/* ── 4. Khu vực Thực đơn tuần: Bố cục ngang gọn gàng, trực quan ── */}
      <section className="home-section" aria-label="Kế hoạch thực đơn tuần">
        <div className="panel week-plan-horizontal">
          <div className="week-plan-header">
            <div className="week-plan-title-wrap">
              <div className="week-plan-badge">THỰC ĐƠN TUẦN</div>
              <h3>Thực đơn tuần này</h3>
              <p>21/04 – 27/04 · Gợi ý cân bằng dinh dưỡng cho gia đình</p>
            </div>

            {/* Thanh chọn ngày T2 - CN */}
            <div className="week-strip-wrap">
              <div className="week-strip" role="tablist" aria-label="Các ngày trong tuần">
                {DAYS.map(([label, date], i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={activeDay === i}
                    className={`day${activeDay === i ? ' active' : ''}`}
                    onClick={() => {
                      setActiveDay(i)
                      toast(`Đã chọn ngày ${label} (${date}/04)`)
                    }}
                  >
                    <b>{label}</b>
                    <span>{date}/04</span>
                  </button>
                ))}
              </div>
            </div>

            <button className="text-link week-plan-cta" onClick={() => onNavigate('plan')}>
              <span>Xem cả tuần</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

          {/* 3 Bữa ăn (Sáng, Trưa, Tối) xếp ngang trong 3 cột cân đối */}
          <div className="today-meals-grid">
            {TODAY_MEALS.map((m, i) => (
              <div className="meal-card-horizontal" key={i}>
                <div className="meal-card-img-wrap">
                  <img src={m.dish.img} alt={m.dish.name} loading="lazy" />
                  <span className="meal-card-badge">{m.label}</span>
                </div>
                <div className="meal-card-body">
                  <h4 className="meal-card-name" title={m.dish.name}>{m.dish.name}</h4>
                  <div className="meal-card-meta">
                    <span className="meal-card-time">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {m.time}
                    </span>
                    <span className="meal-card-cal">~{m.dish.cal || 300} kcal</span>
                  </div>
                  <button
                    type="button"
                    className="meal-card-btn"
                    onClick={() => onShowRecipe(m.dish.id)}
                  >
                    <span>Công thức</span>
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Dòng tip nấu nhanh tiện lợi */}
          <div className="week-plan-quick-tip">
            <span className="quick-tip-icon" aria-hidden="true">⏱️</span>
            <span className="quick-tip-text">
              <strong>Tối nay chỉ có 30 phút?</strong> Khám phá công thức nấu nhanh thơm ngon, tiết kiệm thời gian chuẩn bị.
            </span>
            <button type="button" className="quick-tip-btn" onClick={() => onNavigate('recipes')}>
              Xem món nhanh &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. Khu vực Đi chợ & Gia đình: 2 cột cân đối, cùng chiều cao ── */}
      <div className="home-dual-grid">
        {/* Cột trái: Danh sách đi chợ */}
        <section className="panel home-card-equal shopping-panel" aria-labelledby="shopping-heading">
          <div className="section-head">
            <div>
              <h3 id="shopping-heading">Danh sách đi chợ</h3>
              <p>Nguyên liệu chuẩn bị cho các bữa ăn sắp tới</p>
            </div>
            <button className="text-link" onClick={() => onNavigate('shopping')}>
              <span>Mở danh sách</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

          <div className="shopping-list">
            {ingredients.slice(0, 6).map((item, i) => (
              <label key={i} className={`shop-item${checked.has(i) ? ' checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked.has(i)}
                  onChange={e => checkIngredient(i, e.target.checked)}
                />
                <span className="shop-item-name">{item[0]}</span>
                <span className="shop-qty-badge">{item[1]}</span>
              </label>
            ))}
          </div>

          <div className="budget">
            <div>
              <small>Chi phí dự kiến</small>
              <strong>135.000đ</strong>
            </div>
            <button className="primary budget-btn" onClick={() => onNavigate('shopping')}>
              <span>Đi chợ ngay</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </section>

        {/* Cột phải: Gia đình mình */}
        <section className="panel home-card-equal family-panel" aria-labelledby="family-heading">
          <div className="section-head">
            <div>
              <h3 id="family-heading">Gia đình mình</h3>
              <p>Khẩu vị và chế độ ăn của từng thành viên</p>
            </div>
            <button className="text-link" onClick={() => onNavigate('family')}>
              <span>Quản lý</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

          <div className="family-grid">
            {members.map(m => (
              <div key={m.id} className="family-member">
                <div className="family-member-avatar" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 3.6a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Zm-2.2 9.6a6.5 6.5 0 0 0-6.3 6.5v.8a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1v-.8a6.5 6.5 0 0 0-6.3-6.5h-4.4Z" fill="#ffffff" />
                  </svg>
                </div>
                <div className="family-member-info">
                  <div className="family-member-top">
                    <strong>{m.name}</strong>
                    <span className="family-age-badge">{m.age} tuổi</span>
                  </div>
                  <div className="family-pref-text">{prefLabel(m)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="family-footer-hint">
            <span className="hint-icon" aria-hidden="true">💡</span>
            <span>Thực đơn được tự động gợi ý phù hợp với khẩu vị của cả {members.length} thành viên.</span>
          </div>
        </section>
      </div>

      {/* ── 6. Footer ── */}
      <footer className="footer">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-mark">♨</span>
            <b>DailyMeal</b>
          </div>
          <p className="footer-tagline">Bữa cơm ngon, gia đình hạnh phúc hơn mỗi ngày.</p>
        </div>
        <div className="footer-right">
          <div className="footer-links">
            <button type="button" onClick={() => onNavigate('guide')}>Hướng dẫn sử dụng</button>
            <span className="footer-dot">·</span>
            <button type="button" onClick={() => onNavigate('account')}>Quyền riêng tư</button>
            <span className="footer-dot">·</span>
            <button type="button" onClick={() => onNavigate('account')}>Điều khoản</button>
            <span className="footer-dot">·</span>
            <button type="button" onClick={() => toast('Hotline hỗ trợ: 1900 8888 • Email: hotro@dailymeal.vn')}>Liên hệ</button>
          </div>
          <div className="footer-copy">
            © 2026 DailyMeal. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </section>
  )
}
