import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useRef } from 'react'

export default function ShoppingPage() {
  const toast = useToast()
  const { ingredients, checked, checkIngredient, addIngredient } = useApp()
  const inputRef = useRef()

  function handleAdd() {
    const val = inputRef.current.value.trim()
    if (!val) { toast('Nhập tên nguyên liệu trước nhé'); return }
    addIngredient(val)
    inputRef.current.value = ''
    toast('Đã thêm ' + val)
  }

  return (
    <section id="page-shopping">
      <div className="section-head">
        <div>
          <h3>Danh sách nguyên liệu</h3>
          <p>Tích chọn những món đã mua và thêm nguyên liệu cần thiết.</p>
        </div>
        <button className="primary" onClick={() => toast('Danh sách đi chợ đã sẵn sàng!')}>
          ✓ Hoàn tất
        </button>
      </div>
      <div className="panel">
        <div className="catalog-toolbar">
          <input ref={inputRef} id="newIngredient" placeholder="Ví dụ: cà chua, hành lá, thịt gà..." />
          <button className="primary" onClick={handleAdd}>+ Thêm nguyên liệu</button>
        </div>
        <div className="shopping-list">
          {ingredients.map((item, i) => (
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
            <strong id="budgetAmount">135.000đ</strong>
          </div>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>Ước tính cho 3–4 người</span>
        </div>
      </div>
    </section>
  )
}
