import { familyMembers } from '../data/dishes'
import { useToast } from '../context/ToastContext'

export default function FamilyPage() {
  const toast = useToast()

  return (
    <section id="page-family">
      <div className="section-head">
        <div>
          <h3>Gia đình mình</h3>
          <p>Ghi nhớ sở thích để DailyMeal gợi ý bữa ăn phù hợp.</p>
        </div>
        <button
          className="primary"
          onClick={() => toast('Bạn có thể cập nhật thành viên trong phần tài khoản.')}
        >
          + Thêm thành viên
        </button>
      </div>
      <div className="panel">
        <div className="family-grid">
          {familyMembers.map((m, i) => (
            <div key={i} className="family-member">
              <div className="avatar" style={{ width: 39, height: 39, fontSize: 18 }}>
                {m.emoji}
              </div>
              <div>
                <strong>{m.name}</strong>
                <small>{m.age}</small>
                <small>{m.pref}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
