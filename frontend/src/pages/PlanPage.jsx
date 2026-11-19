import { useState, useMemo } from 'react'
import { dishes } from '@/data/dishes'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'

/* ── Cấu hình các bữa ăn trong ngày ── */
const MEAL_TYPES = [
  { key: 'breakfast', label: 'Bữa sáng', tag: 'SÁNG', dot: '#c45b3d' },
  { key: 'lunch',     label: 'Bữa trưa',  tag: 'TRƯA', dot: '#66835c' },
  { key: 'dinner',    label: 'Bữa tối',   tag: 'TỐI',  dot: '#64252c' },
]

const WEEKDAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']
const SHORT_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

// Lấy ngày trong tuần hiện tại (Thứ 2 → Chủ nhật)
function getCurrentWeekDates() {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=CN, 1=T2, ..., 6=T7
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  return WEEKDAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}

// Tạo thực đơn tuần ngẫu nhiên, cân bằng các món
function generateWeekPlan() {
  const plan = []
  const used = new Set()
  for (let day = 0; day < 7; day++) {
    const meals = {}
    for (const mt of MEAL_TYPES) {
      let available = dishes.filter(d => !used.has(d.id))
      if (available.length === 0) {
        used.clear()
        available = [...dishes]
      }
      const pick = available[Math.floor(Math.random() * available.length)]
      meals[mt.key] = pick
      used.add(pick.id)
    }
    plan.push(meals)
  }
  return plan
}

// Gom danh sách nguyên liệu của 1 ngày (lọc trùng)
function getDayIngredients(dayMeals) {
  const all = []
  MEAL_TYPES.forEach(mt => {
    const dish = dayMeals[mt.key]
    if (dish) dish.ingredients.forEach(ing => all.push(ing))
  })
  const seen = new Set()
  return all.filter(x => {
    const key = x.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// Thống kê thời gian nấu và calo
function getDayStats(dayMeals) {
  let time = 0, cal = 0
  MEAL_TYPES.forEach(mt => {
    const d = dayMeals[mt.key]
    if (d) {
      time += d.time
      cal += parseInt(d.cal) || 0
    }
  })
  return { time, cal }
}

export default function PlanPage({ onShowRecipe, onNavigate }) {
  const toast = useToast()
  const { addIngredient } = useApp()
  const dates = useMemo(() => getCurrentWeekDates(), [])

  const [plan, setPlan] = useState(() => generateWeekPlan())
  const [activeDay, setActiveDay] = useState(() => {
    const dow = new Date().getDay()
    return dow === 0 ? 6 : dow - 1 // 0=T2 ... 6=CN
  })
  const [showIngredients, setShowIngredients] = useState(false)

  // Đổi món cho một bữa
  function swapMeal(dayIdx, mealKey) {
    setPlan(prev => {
      const next = prev.map(d => ({ ...d }))
      const current = next[dayIdx][mealKey]
      const others = dishes.filter(d => d.id !== current.id)
      next[dayIdx][mealKey] = others[Math.floor(Math.random() * others.length)]
      return next
    })
    toast('Đã đổi món ăn mới')
  }

  // Tạo lại thực đơn cho cả tuần
  function regenerate() {
    setPlan(generateWeekPlan())
    toast('Đã tạo thực đơn tuần mới')
  }

  // Đẩy nguyên liệu 1 ngày sang trang Đi chợ
  function pushToShopping(dayIdx) {
    const ings = getDayIngredients(plan[dayIdx])
    ings.forEach(ing => addIngredient(ing))
    toast(`Đã thêm ${ings.length} nguyên liệu của ${WEEKDAYS[dayIdx]} vào danh sách đi chợ!`)
  }

  // Đẩy nguyên liệu cả tuần sang trang Đi chợ
  function pushWeekToShopping() {
    let count = 0
    const allIngs = new Set()
    plan.forEach(dayMeals => {
      const ings = getDayIngredients(dayMeals)
      ings.forEach(ing => {
        const key = ing.toLowerCase().trim()
        if (!allIngs.has(key)) {
          allIngs.add(key)
          addIngredient(ing)
          count++
        }
      })
    })
    toast(`Đã thêm ${count} nguyên liệu của tuần vào danh sách đi chợ!`)
  }

  const todayStats = getDayStats(plan[activeDay])
  const dayIngredients = getDayIngredients(plan[activeDay])

  return (
    <section id="page-plan" className="plan-page">
      {/* ── Thanh công cụ trên cùng (thay cho tiêu đề trùng lặp) ── */}
      <div className="plan-toolbar">
        <div className="plan-week-tag">
          <span className="week-range">Tuần {dates[0]} – {dates[6]}</span>
          <span className="week-dot">•</span>
          <span className="week-sub">7 ngày · 21 bữa ăn</span>
        </div>

        <div className="plan-actions">
          {onNavigate && (
            <button className="btn-plan-link" onClick={() => onNavigate('shopping')}>
              Xem giỏ đi chợ →
            </button>
          )}
          <button className="btn-plan-outline" onClick={pushWeekToShopping}>
            Đẩy cả tuần sang Đi chợ
          </button>
          <button className="btn-plan-primary" onClick={regenerate}>
            Tạo lại thực đơn
          </button>
        </div>
      </div>

      {/* ── Thanh chọn ngày trong tuần (Day Navigation Strip) ── */}
      <div className="plan-day-strip" role="tablist">
        {WEEKDAYS.map((day, i) => {
          const isActive = i === activeDay
          const stats = getDayStats(plan[i])
          return (
            <button
              key={i}
              role="tab"
              aria-selected={isActive}
              className={`plan-day-tab${isActive ? ' active' : ''}`}
              onClick={() => setActiveDay(i)}
            >
              <span className="plan-day-short">{SHORT_DAYS[i]}</span>
              <span className="plan-day-date">{dates[i]}</span>
              <span className="plan-day-time">{stats.time}p</span>
            </button>
          )
        })}
      </div>

      {/* ── Chi tiết thực đơn ngày đang chọn ── */}
      <div className="plan-detail">
        <div className="plan-detail-head">
          <div>
            <h3 className="plan-detail-title">
              {WEEKDAYS[activeDay]}, {dates[activeDay]}
            </h3>
            <div className="plan-detail-meta">
              <span>Tổng thời gian: <strong>{todayStats.time} phút</strong></span>
              <span>·</span>
              <span>Năng lượng: <strong>~{todayStats.cal} kcal</strong></span>
              <span>·</span>
              <span>Phần ăn: <strong>3–4 người</strong></span>
            </div>
          </div>
          <button
            className="btn-plan-subaction"
            onClick={() => pushToShopping(activeDay)}
          >
            + Đẩy nguyên liệu ngày này sang Đi chợ
          </button>
        </div>

        {/* Danh sách 3 bữa (Sáng / Trưa / Tối) */}
        <div className="plan-meals">
          {MEAL_TYPES.map(mt => {
            const dish = plan[activeDay][mt.key]
            if (!dish) return null
            return (
              <div key={mt.key} className="plan-meal-card">
                <div className="plan-meal-img-wrap">
                  <img src={dish.img} alt={dish.name} className="plan-meal-img" />
                  <span className="plan-meal-badge">{mt.label}</span>
                </div>
                <div className="plan-meal-body">
                  <div>
                    <h4 className="plan-meal-name">{dish.name}</h4>
                    <p className="plan-meal-desc">{dish.desc}</p>
                  </div>
                  <div className="plan-meal-meta">
                    <span className="plan-chip">{dish.category}</span>
                    <span className="plan-chip">{dish.time} phút</span>
                    <span className="plan-chip">{dish.cal}</span>
                  </div>
                  <div className="plan-meal-actions">
                    <button
                      className="btn-plan-swap"
                      onClick={() => swapMeal(activeDay, mt.key)}
                      title="Đổi món ngẫu nhiên khác"
                    >
                      Đổi món
                    </button>
                    <button
                      className="btn-plan-view"
                      onClick={() => onShowRecipe(dish.id)}
                    >
                      Xem công thức →
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tổng hợp nguyên liệu cần chuẩn bị */}
        <div className="plan-ingredients-section">
          <button
            className="plan-ingredients-toggle"
            onClick={() => setShowIngredients(!showIngredients)}
          >
            <span>Nguyên liệu cần chuẩn bị cho ngày này ({dayIngredients.length} loại)</span>
            <span className="plan-toggle-arrow">{showIngredients ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}</span>
          </button>
          {showIngredients && (
            <div className="plan-ingredients-list">
              {dayIngredients.map((ing, i) => (
                <span key={i} className="plan-ing-chip">{ing}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bảng tóm tắt toàn bộ tuần ── */}
      <div className="plan-week-overview">
        <div className="overview-header">
          <h4 className="plan-section-title">Tổng quan 7 ngày trong tuần</h4>
          <span className="overview-hint">Bấm vào từng ngày để xem chi tiết mâm cơm</span>
        </div>
        <div className="plan-week-grid">
          {plan.map((dayMeals, i) => {
            const stats = getDayStats(dayMeals)
            const isActive = i === activeDay
            return (
              <div
                key={i}
                className={`plan-week-card${isActive ? ' is-active' : ''}`}
                onClick={() => setActiveDay(i)}
              >
                <div className="plan-week-card-head">
                  <strong>{SHORT_DAYS[i]}</strong>
                  <span className="plan-week-date">{dates[i]}</span>
                </div>
                <div className="plan-week-meals">
                  {MEAL_TYPES.map(mt => (
                    <div key={mt.key} className="plan-week-meal-row">
                      <span className="meal-prefix">{mt.tag}</span>
                      <span className="meal-name">
                        {dayMeals[mt.key]?.name || '—'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="plan-week-card-foot">
                  <span>{stats.time}p</span>
                  <span>{stats.cal} kcal</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
