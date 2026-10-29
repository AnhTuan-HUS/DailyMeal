import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useRef } from 'react'
import { groupByStall } from '../utils/groceryStalls'

export default function ShoppingPage() {
  const toast = useToast()
  const { ingredients, checked, checkIngredient, addIngredient, removeIngredient, clearChecked } = useApp()
  const inputRef = useRef()

  const stalls = groupByStall(ingredients)
  const total = ingredients.length
  const bought = checked.size

  function handleAdd() {
    const val = inputRef.current.value.trim()
    if (!val) { toast('Nhập tên nguyên liệu trước nhé'); return }
    addIngredient(val)
    inputRef.current.value = ''
    toast('Đã thêm ' + val)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <section id="page-shopping">
      <div className="section-head">
        <div>
          <h3>Danh sách đi chợ</h3>
          <p>Nguyên liệu được chia theo từng quầy để dễ mua.</p>
        </div>
        <button className="primary" onClick={() => toast('Danh sách đi chợ đã sẵn sàng!')}>
          ✓ Hoàn tất
        </button>
      </div>

      {/* Thanh tiến độ */}
      {total > 0 && (
        <div className="shopping-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(bought / total) * 100}%` }} />
          </div>
          <span className="progress-label">Đã mua {bought}/{total} món</span>
        </div>
      )}

      <div className="panel">
        {/* Ô thêm nguyên liệu */}
        <div className="catalog-toolbar">
          <input
            ref={inputRef}
            id="newIngredient"
            placeholder="Ví dụ: cà chua, hành lá, thịt gà..."
            onKeyDown={handleKeyDown}
          />
          <button className="primary" onClick={handleAdd}>+ Thêm</button>
          {bought > 0 && (
            <button className="secondary" onClick={clearChecked}>🗑 Xóa món đã mua</button>
          )}
        </div>

        {/* Danh sách theo quầy */}
        {stalls.length === 0 ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>
            Chưa có nguyên liệu nào. Thêm bằng ô phía trên nhé!
          </p>
        ) : (
          stalls.map(stall => (
            <div key={stall.key} className="stall-group">
              <div className="stall-header">
                <span className="stall-label">{stall.label}</span>
                <span className="stall-count">{stall.items.length} món</span>
              </div>
              <div className="shopping-list">
                {stall.items.map(({ name, qty, idx }) => (
                  <label key={idx} className="shop-item">
                    <input
                      type="checkbox"
                      checked={checked.has(idx)}
                      onChange={e => checkIngredient(idx, e.target.checked)}
                    />
                    <span style={checked.has(idx) ? { textDecoration: 'line-through', color: 'var(--muted)' } : {}}>
                      {name}
                    </span>
                    <span className="qty">{qty}</span>
                    <button
                      className="btn-remove"
                      onClick={() => removeIngredient(idx)}
                      title="Xóa món này"
                    >×</button>
                  </label>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
