import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useRef } from 'react'
import { groupByStall } from '../utils/groceryStalls'

const STALL_ACCENT = {
  meat:   { bg: '#fdf3ef', dot: '#c45b3d', icon: '🥩' },
  veggie: { bg: '#f0f6ee', dot: '#66835c', icon: '🥬' },
  egg:    { bg: '#fdf8ec', dot: '#b5852a', icon: '🥚' },
  dry:    { bg: '#f4f1f8', dot: '#7c6a9e', icon: '🧂' },
}

export default function ShoppingPage() {
  const toast  = useToast()
  const { ingredients, checked, checkIngredient, addIngredient, removeIngredient, clearChecked } = useApp()
  const inputRef = useRef()

  const stalls = groupByStall(ingredients)
  const total  = ingredients.length
  const bought = checked.size
  const pct    = total > 0 ? Math.round((bought / total) * 100) : 0

  function handleAdd() {
    const val = inputRef.current.value.trim()
    if (!val) { toast('Nhập tên nguyên liệu trước nhé'); return }
    addIngredient(val)
    inputRef.current.value = ''
    inputRef.current.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <section id="page-shopping" className="shop-page">

      {/* Banner tóm tắt quầy */}
      <div className="shop-banner">
        {Object.entries(STALL_ACCENT).map(([key, a]) => {
          const stallData = stalls.find(s => s.key === key)
          const count = stallData ? stallData.items.length : 0
          return (
            <div key={key} className="shop-banner-item" style={{ '--b-dot': a.dot, '--b-bg': a.bg }}>
              <span className="shop-banner-icon">{a.icon}</span>
              <span className="shop-banner-count">{count}</span>
            </div>
          )
        })}
        {total > 0 && (
          <div className="shop-banner-progress">
            <div className="shop-banner-bar">
              <div className="shop-banner-fill" style={{ width: `${pct}%` }} />
            </div>
            <span>{bought === total && total > 0 ? '✓ Xong!' : `${bought}/${total}`}</span>
          </div>
        )}
        {bought > 0 && (
          <button className="btn-done" onClick={() => toast('Hoàn tất! Chúc nấu ngon 🎉')}>
            ✓ Hoàn tất
          </button>
        )}
      </div>

      {/* Ô thêm nguyên liệu */}
      <div className="shop-add-row">
        <div className="shop-input-wrap">
          <span className="shop-input-icon">🔍</span>
          <input
            ref={inputRef}
            className="shop-input"
            placeholder="Thêm nguyên liệu, ví dụ: thịt heo, cà chua..."
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>
        <button className="btn-add" onClick={handleAdd}>+ Thêm</button>
        {bought > 0 && (
          <button className="btn-clear" onClick={clearChecked}>Xóa đã mua</button>
        )}
      </div>

      {/* Danh sách theo quầy */}
      {stalls.length === 0 ? (
        <div className="shop-empty">
          <span className="shop-empty-icon">🛒</span>
          <p>Giỏ đang trống.</p>
          <p className="shop-empty-sub">Gõ tên nguyên liệu phía trên rồi nhấn Enter để thêm.</p>
        </div>
      ) : (
        <div className="shop-stalls">
          {stalls.map(stall => {
            const accent = STALL_ACCENT[stall.key]
            const stallBought = stall.items.filter(it => checked.has(it.idx)).length
            return (
              <div key={stall.key} className="stall" style={{ '--stall-bg': accent.bg, '--stall-dot': accent.dot }}>
                <div className="stall-head">
                  <span className="stall-dot" />
                  <span className="stall-name">{stall.label}</span>
                  <span className="stall-badge">
                    {stallBought > 0 ? `${stallBought}/${stall.items.length}` : stall.items.length}
                  </span>
                </div>
                <ul className="stall-list">
                  {stall.items.map(({ name, qty, idx }) => {
                    const done = checked.has(idx)
                    return (
                      <li key={idx} className={`stall-item${done ? ' is-done' : ''}`}>
                        <button
                          className="check-btn"
                          onClick={() => checkIngredient(idx, !done)}
                          aria-label={done ? 'Bỏ tích' : 'Đánh dấu đã mua'}
                        >
                          {done ? '✓' : ''}
                        </button>
                        <span className="item-name">{name}</span>
                        <span className="item-qty">{qty}</span>
                        <button
                          className="item-del"
                          onClick={() => removeIngredient(idx)}
                          aria-label="Xóa"
                        >×</button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
