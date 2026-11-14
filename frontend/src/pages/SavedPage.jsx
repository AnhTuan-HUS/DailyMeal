import { useState, useMemo } from 'react'
import { dishes, dishTypes } from '@/data/dishes'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'

export default function SavedPage({ onShowRecipe, onNavigate }) {
  const { saved, toggleSave, addIngredient, members, mealProfile } = useApp()
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState('all') // 'all', 'man', 'canh', 'rau', 'quick'
  const [sortBy, setSortBy] = useState('default') // 'default', 'time-asc', 'cal-asc', 'name-asc'

  // Danh sách tất cả món đã lưu
  const allSavedDishes = useMemo(() => {
    return dishes.filter(d => saved.has(d.id))
  }, [saved])

  // Tính toán cảnh báo khẩu vị gia đình (dị ứng, món hạn chế)
  function getDishWarnings(dish) {
    const warnings = []
    if (mealProfile?.excluded && Array.isArray(mealProfile.excluded)) {
      for (const exc of mealProfile.excluded) {
        if (dish.ingredients.some(ing => ing.toLowerCase().includes(exc.toLowerCase()))) {
          warnings.push(`Chứa "${exc}" (trong mục gia đình hạn chế)`)
        }
      }
    }
    if (members && Array.isArray(members)) {
      members.forEach(m => {
        if (m.allergies && Array.isArray(m.allergies)) {
          m.allergies.forEach(all => {
            if (dish.ingredients.some(ing => ing.toLowerCase().includes(all.toLowerCase()))) {
              warnings.push(`${m.name} dị ứng: ${all}`)
            }
          })
        }
      })
    }
    return warnings
  }

  // Đếm số món theo từng phân loại để hiển thị trên badge
  const counts = useMemo(() => {
    const res = { all: allSavedDishes.length, man: 0, canh: 0, rau: 0, quick: 0 }
    allSavedDishes.forEach(d => {
      if (d.type && res[d.type] !== undefined) res[d.type]++
      if (d.time <= 30) res.quick++
    })
    return res
  }, [allSavedDishes])

  // Lọc và sắp xếp
  const filteredDishes = useMemo(() => {
    return allSavedDishes
      .filter(dish => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const matchName = dish.name.toLowerCase().includes(q)
          const matchDesc = dish.desc?.toLowerCase().includes(q)
          const matchCat = dish.category?.toLowerCase().includes(q)
          const matchIng = dish.ingredients?.some(i => i.toLowerCase().includes(q))
          if (!matchName && !matchDesc && !matchCat && !matchIng) return false
        }
        if (activeType === 'quick') {
          if (dish.time > 30) return false
        } else if (activeType !== 'all') {
          if (dish.type !== activeType) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'time-asc') return a.time - b.time
        if (sortBy === 'cal-asc') return (parseInt(a.cal) || 0) - (parseInt(b.cal) || 0)
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'vi')
        return 0
      })
  }, [allSavedDishes, searchQuery, activeType, sortBy])

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = allSavedDishes.length
    if (total === 0) return { total: 0, avgTime: 0, minTime: 0, avgCal: 0 }
    const totalTime = allSavedDishes.reduce((acc, d) => acc + (d.time || 0), 0)
    const minTime = Math.min(...allSavedDishes.map(d => d.time || 0))
    const totalCal = allSavedDishes.reduce((acc, d) => acc + (parseInt(d.cal) || 0), 0)
    return {
      total,
      avgTime: Math.round(totalTime / total),
      minTime,
      avgCal: Math.round(totalCal / total),
    }
  }, [allSavedDishes])

  // Thao tác: Bỏ lưu món
  function handleToggleSave(dishId, dishName, e) {
    e.stopPropagation()
    toggleSave(dishId)
    toast(`Đã bỏ "${dishName}" khỏi danh sách lưu`)
  }

  // Thao tác: Đẩy tất cả nguyên liệu của các món đang hiển thị sang Đi chợ
  function pushAllToShopping() {
    if (filteredDishes.length === 0) return
    let count = 0
    const added = new Set()
    filteredDishes.forEach(dish => {
      dish.ingredients.forEach(ing => {
        const key = ing.toLowerCase().trim()
        if (!added.has(key)) {
          added.add(key)
          addIngredient(ing)
          count++
        }
      })
    })
    toast(`Đã thêm ${count} nguyên liệu của ${filteredDishes.length} món vào Đi chợ!`)
  }

  // Thao tác: Thêm nguyên liệu 1 món vào Đi chợ
  function pushDishToShopping(dish, e) {
    e.stopPropagation()
    dish.ingredients.forEach(ing => addIngredient(ing))
    toast(`Đã thêm ${dish.ingredients.length} nguyên liệu của "${dish.name}" vào Đi chợ!`)
  }

  return (
    <section id="page-saved" className="saved-page">
      {/* ── Thống kê tổng quan bộ sưu tập ── */}
      <div className="fam-stats saved-stats">
        <div className="fam-stat">
          <div className="fam-stat-ico">♥</div>
          <div>
            <strong>{stats.total} món</strong>
            <small>Đã lưu vào bộ sưu tập</small>
          </div>
        </div>

        <div className="fam-stat">
          <div className="fam-stat-ico ok">◷</div>
          <div>
            <strong>~{stats.avgTime} phút</strong>
            <small>Nhanh nhất: {stats.minTime > 0 ? `${stats.minTime}p` : '0p'}</small>
          </div>
        </div>

        <div className="fam-stat">
          <div className="fam-stat-ico warn">⚡</div>
          <div>
            <strong>~{stats.avgCal} kcal</strong>
            <small>Trung bình mỗi khẩu phần</small>
          </div>
        </div>
      </div>

      {/* ── Thanh công cụ: Tìm kiếm, lọc và sắp xếp ── */}
      <div className="saved-toolbar">
        <div className="saved-search">
          <input
            type="text"
            placeholder="Tìm theo tên món, nguyên liệu (thịt, cá, tỏi...)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Xóa từ khóa"
              title="Xóa tìm kiếm"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          aria-label="Sắp xếp món đã lưu"
        >
          <option value="default">Sắp xếp: Mặc định</option>
          <option value="time-asc">Nấu nhanh nhất</option>
          <option value="cal-asc">Ít calo nhất</option>
          <option value="name-asc">Tên món: A → Z</option>
        </select>

        {filteredDishes.length > 0 && (
          <button
            type="button"
            className="btn-plan-outline"
            onClick={pushAllToShopping}
            title="Gom tất cả nguyên liệu của các món hiển thị sang danh sách đi chợ"
          >
            Đẩy {filteredDishes.length} món sang Đi chợ
          </button>
        )}
      </div>

      {/* ── Hàng chip phân loại món ── */}
      <div className="chip-row">
        <button
          type="button"
          className={`filter-chip${activeType === 'all' ? ' active' : ''}`}
          onClick={() => setActiveType('all')}
        >
          Tất cả <em>{counts.all}</em>
        </button>
        {dishTypes.map(t => (
          <button
            key={t.id}
            type="button"
            className={`filter-chip${activeType === t.id ? ' active' : ''}`}
            onClick={() => setActiveType(t.id)}
          >
            {t.label} <em>{counts[t.id] || 0}</em>
          </button>
        ))}
        <button
          type="button"
          className={`filter-chip${activeType === 'quick' ? ' active' : ''}`}
          onClick={() => setActiveType('quick')}
        >
          Nấu nhanh ≤ 30p <em>{counts.quick}</em>
        </button>
      </div>

      {/* ── Danh sách thẻ món ăn ── */}
      {filteredDishes.length > 0 ? (
        <div className="wide-recipes">
          {filteredDishes.map(dish => {
            const warnings = getDishWarnings(dish)
            const typeInfo = dishTypes.find(t => t.id === dish.type)

            return (
              <article key={dish.id} className="recipe saved-card">
                <div className="recipe-img">
                  <img
                    src={dish.img}
                    alt={dish.name}
                    loading="lazy"
                    onError={e => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'
                    }}
                  />
                  <span className="pill">{dish.category}</span>
                  <button
                    className="heart saved"
                    onClick={e => handleToggleSave(dish.id, dish.name, e)}
                    aria-label={`Bỏ lưu ${dish.name}`}
                    title="Bỏ lưu món này"
                  >
                    ♥
                  </button>
                </div>

                <div className="recipe-body">
                  <div className="saved-card-top">
                    <h4 className="recipe-title">{dish.name}</h4>
                    {typeInfo && <span className="tag">{typeInfo.label}</span>}
                  </div>

                  <p className="recipe-desc">{dish.desc}</p>

                  {/* Cảnh báo khẩu vị gia đình nếu có */}
                  {warnings.length > 0 && (
                    <div className="saved-warn" title="Khẩu vị gia đình">
                      ⚠ {warnings.join(' • ')}
                    </div>
                  )}

                  {/* Danh sách nguyên liệu tiêu biểu */}
                  {dish.ingredients && (
                    <div className="saved-ings">
                      {dish.ingredients.slice(0, 3).map((ing, idx) => (
                        <span key={idx} className="saved-ing-tag">{ing}</span>
                      ))}
                      {dish.ingredients.length > 3 && (
                        <span className="saved-ing-more">+{dish.ingredients.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="recipe-meta">
                    <span>◷ {dish.time} phút</span>
                    <span>♧ {dish.servings} người</span>
                    <span>⚡ {dish.cal}</span>
                  </div>

                  {/* Nút hành động trực tiếp */}
                  <div className="saved-actions">
                    <button
                      type="button"
                      className="primary"
                      onClick={() => onShowRecipe && onShowRecipe(dish.id)}
                    >
                      🍳 Vào bếp nấu
                    </button>
                    <button
                      type="button"
                      className="mini-btn"
                      onClick={e => pushDishToShopping(dish, e)}
                      title="Thêm nguyên liệu món này vào danh sách đi chợ"
                    >
                      + Đi chợ
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : allSavedDishes.length > 0 ? (
        /* Trạng thái tìm kiếm không có kết quả */
        <div className="saved-empty">
          <div className="saved-empty-ico">🔍</div>
          <h4>Không tìm thấy món ăn phù hợp</h4>
          <p>Không có món nào trong bộ sưu tập khớp với từ khóa "{searchQuery}" hoặc bộ lọc được chọn.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn-plan-outline"
              onClick={() => { setSearchQuery(''); setActiveType('all'); setSortBy('default') }}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      ) : (
        /* Trạng thái chưa lưu món nào (Empty collection) */
        <div className="saved-empty">
          <div className="saved-empty-ico">♡</div>
          <h4>Bộ sưu tập món ăn đang trống</h4>
          <p>
            Lưu lại những công thức yêu thích bằng cách bấm vào biểu tượng trái tim để dễ dàng
            lên thực đơn, vào bếp và mua nguyên liệu bất cứ khi nào!
          </p>

          {onNavigate && (
            <button
              type="button"
              className="btn-plan-primary"
              style={{ marginTop: 10 }}
              onClick={() => onNavigate('recipes')}
            >
              Khám phá món ăn ngay →
            </button>
          )}

          {/* Gợi ý món ngon để lưu nhanh */}
          <div className="saved-suggestions">
            <h5 className="saved-suggestions-title">Gợi ý món ăn ngon cho gia đình:</h5>
            <div className="saved-suggestions-grid">
              {dishes.slice(0, 3).map(dish => (
                <div key={dish.id} className="saved-suggestion-card">
                  <img src={dish.img} alt={dish.name} />
                  <div className="saved-suggestion-info">
                    <h6>{dish.name}</h6>
                    <span>◷ {dish.time}p · {dish.cal}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-quick-save"
                    onClick={() => {
                      toggleSave(dish.id)
                      toast(`Đã lưu "${dish.name}" vào bộ sưu tập!`)
                    }}
                  >
                    + Lưu món
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
