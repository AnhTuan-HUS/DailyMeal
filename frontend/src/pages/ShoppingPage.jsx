import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { useState, useRef } from 'react'
import { groupByStall } from '@/utils/groceryStalls'

const STALL_ACCENT = {
  meat:   { bg: '#fdf3ef', dot: '#c45b3d', name: 'Thịt & Cá' },
  veggie: { bg: '#f0f6ee', dot: '#66835c', name: 'Rau củ' },
  egg:    { bg: '#fdf8ec', dot: '#b5852a', name: 'Trứng & Đậu' },
  dry:    { bg: '#f4f1f8', dot: '#7c6a9e', name: 'Đồ khô & Gia vị' },
  other:  { bg: '#f7f6f4', dot: '#8a817c', name: 'Khác' },
}

export default function ShoppingPage() {
  const toast  = useToast()
  const { ingredients, checked, checkIngredient, addIngredient, removeIngredient, clearChecked } = useApp()
  const inputRef = useRef()

  const stalls = groupByStall(ingredients)
  const total  = ingredients.length
  const bought = checked.size
  const pct    = total > 0 ? Math.round((bought / total) * 100) : 0
  const [fridgeInput, setFridgeInput] = useState('')

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

  function handleFridgeCheck(e) {
    if (e) e.preventDefault()
    const val = fridgeInput.trim().toLowerCase()
    if (!val) {
      toast('Nhập tên món nhà bạn đã có sẵn nhé')
      return
    }
    const foundIdx = ingredients.findIndex(item => item[0].toLowerCase().includes(val))
    if (foundIdx !== -1) {
      checkIngredient(foundIdx, true)
      toast(`Đã gạch bớt "${ingredients[foundIdx][0]}" vì tủ lạnh nhà bạn đã có sẵn!`)
    } else {
      toast(`Đã ghi nhận "${fridgeInput.trim()}" có sẵn trong tủ lạnh`)
    }
    setFridgeInput('')
  }

  return (
    <section id="page-shopping" className="shop-page">

      {/* Thanh thông tin tổng quan trên cùng */}
      <div className="shop-banner">
        <div className="shop-banner-budget">
          <span className="budget-tag">Dự kiến</span>
          <strong className="budget-amount">135.000đ</strong>
        </div>

        <div className="shop-banner-right">
          {total > 0 && (
            <div className="shop-banner-progress">
              <div className="shop-banner-bar">
                <div className="shop-banner-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="shop-progress-count">{bought}/{total}</span>
            </div>
          )}

          {bought > 0 && (
            <button className="btn-done" onClick={() => toast('Hoàn tất danh sách đi chợ!')}>
              Hoàn tất
            </button>
          )}
        </div>
      </div>

      {/* Ô thêm nguyên liệu */}
      <div className="shop-add-row">
        <input
          ref={inputRef}
          className="shop-input"
          placeholder="Thêm nguyên liệu, ví dụ: thịt ba chỉ, cà chua, hành lá..."
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button className="btn-add" onClick={handleAdd}>+ Thêm</button>
        {bought > 0 && (
          <button className="btn-clear" onClick={clearChecked}>Xóa đã mua</button>
        )}
      </div>

      {/* Gợi ý mua kèm nhanh */}
      <div className="shop-quick-tags">
        <span className="quick-tags-label">Gợi ý nhanh:</span>
        {['Hành lá', 'Tỏi', 'Ớt tươi', 'Gừng', 'Chanh', 'Trứng gà'].map(name => (
          <button
            key={name}
            type="button"
            className="quick-tag-chip"
            onClick={() => {
              addIngredient(name)
              toast(`Đã thêm ${name} vào danh sách`)
            }}
          >
            + {name}
          </button>
        ))}
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
            return (
              <div key={stall.key} className="stall" style={{ '--stall-bg': accent.bg, '--stall-dot': accent.dot }}>
                <div className="stall-head">
                  <span className="stall-dot" />
                  <span className="stall-name">{stall.label}</span>
                  <span className="stall-count">{stall.items.length} món</span>
                </div>
                <ul className="stall-list">
                  {stall.items.length === 0 ? (
                    <li className="stall-empty-hint">Chưa có món nào</li>
                  ) : (
                    stall.items.map(({ name, qty, idx }) => {
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
                    })
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      {/* Khối Cứu tủ lạnh — Tận dụng thực phẩm sẵn có */}
      <div className="shop-fridge-card">
        <div className="fridge-card-header">
          <span className="fridge-badge">CỨU TỦ LẠNH</span>
          <h3>Tận dụng thực phẩm sẵn có</h3>
          <p>Nhập những nguyên liệu nhà bạn đã có để tự động gạch bớt khỏi danh sách đi chợ, tránh mua thừa.</p>
        </div>

        <form className="fridge-form" onSubmit={handleFridgeCheck}>
          <input
            className="fridge-input"
            value={fridgeInput}
            onChange={e => setFridgeInput(e.target.value)}
            placeholder="Tủ lạnh nhà bạn đang có sẵn gì? (Ví dụ: tỏi, hành lá, trứng...)"
          />
          <button type="submit" className="btn-fridge">
            Đã có sẵn
          </button>
        </form>
      </div>
    </section>
  )
}
