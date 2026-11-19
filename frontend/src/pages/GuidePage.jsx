const STEPS = [
  ['Khám phá món ăn', 'Tìm công thức theo tên món hoặc nguyên liệu, lưu món yêu thích.'],
  ['Lên thực đơn', 'Chọn món cho từng bữa trong tuần, xem tổng quan dinh dưỡng.'],
  ['Đi chợ', 'Danh sách nguyên liệu được gom theo quầy, tick khi đã mua.'],
  ['Vào bếp', 'Làm theo từng bước nấu, có hẹn giờ.'],
  ['Gia đình', 'Quản lý khẩu vị và dị ứng của từng thành viên.'],
]

export default function GuidePage() {
  return (
    <section id="page-guide">
      <div className="section-head"><div><h3>Hướng dẫn sử dụng</h3><p>5 bước để có bữa cơm ngon mỗi ngày.</p></div></div>
      <div className="account-list">
        {STEPS.map(([t, d], i) => (
          <div key={t} className="account-row">
            <span className="row-icon">{i + 1}</span>
            <div style={{ flex: 1 }}><strong>{t}</strong><div className="pf-muted">{d}</div></div>
          </div>
        ))}
      </div>
    </section>
  )
}