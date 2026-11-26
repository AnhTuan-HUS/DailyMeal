import { Compass, CalendarDays, ShoppingCart, CookingPot, Users } from 'lucide-react'

const STEPS = [
  { Icon: Compass, tone: 'wine', title: 'Khám phá món ăn', desc: 'Tìm công thức theo tên món hoặc nguyên liệu, lưu món yêu thích.' },
  { Icon: CalendarDays, tone: 'olive', title: 'Lên thực đơn', desc: 'Chọn món cho từng bữa trong tuần, xem tổng quan dinh dưỡng.' },
  { Icon: ShoppingCart, tone: 'amber', title: 'Đi chợ', desc: 'Danh sách nguyên liệu được gom theo quầy, tick khi đã mua.' },
  { Icon: CookingPot, tone: 'rust', title: 'Vào bếp', desc: 'Làm theo từng bước nấu, có hẹn giờ.' },
  { Icon: Users, tone: 'plum', title: 'Gia đình', desc: 'Quản lý khẩu vị và dị ứng của từng thành viên.' },
]

export default function GuidePage() {
  return (
    <section id="page-guide">
      <p className="page-intro">5 bước để có bữa cơm ngon mỗi ngày.</p>
      <div className="account-list">
        {STEPS.map(({ Icon, tone, title, desc }, i) => (
          <div key={title} className="account-row is-static">
            <span className={'icon-chip tone-' + tone}><Icon size={19} strokeWidth={2} /></span>
            <span className="row-text">
              <strong>{title}</strong>
              <small className="pf-muted">{desc}</small>
            </span>
            <span className="step-no">Bước {i + 1}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
