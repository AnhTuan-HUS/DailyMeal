import { dishes } from '../data/dishes'
import { useToast } from '../context/ToastContext'

const PLAN_DAYS = [
  'Thứ Hai · 21/04', 'Thứ Ba · 22/04', 'Thứ Tư · 23/04',
  'Thứ Năm · 24/04', 'Thứ Sáu · 25/04', 'Thứ Bảy · 26/04',
]

export default function PlanPage({ onShowRecipe }) {
  const toast = useToast()

  return (
    <section id="page-plan">
      <div className="section-head">
        <div>
          <h3>Thực đơn tuần của gia đình</h3>
          <p>Lên kế hoạch trước để ăn ngon, tiết kiệm và cân bằng hơn.</p>
        </div>
        <button className="primary" onClick={() => toast('Đã lưu thực đơn tuần của bạn!')}>
          ✓ Lưu thực đơn
        </button>
      </div>
      <div className="plan-layout">
        {PLAN_DAYS.map((day, i) => (
          <div key={i} className="plan-day">
            <h4>🗓️ {day}</h4>
            {[
              ['Bữa sáng', dishes[(i + 6) % 9]],
              ['Bữa trưa', dishes[i % 9]],
              ['Bữa tối', dishes[(i + 2) % 9]],
            ].map(([meal, dish]) => (
              <div key={meal} className="plan-slot">
                <div>
                  <small>{meal}</small>
                  <span>{dish.name}</span>
                </div>
                <button className="mini-btn" onClick={() => onShowRecipe(dish.id)}>
                  Xem món
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
