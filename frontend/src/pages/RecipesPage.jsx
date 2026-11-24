import { useState, useEffect } from 'react'
import { dishes } from '@/data/dishes'
import RecipeCard from '@/components/recipe/RecipeCard'

const CATEGORIES = [
  { value: 'all', label: 'Tất cả món' },
  { value: 'Món truyền thống', label: 'Món truyền thống' },
  { value: 'Thanh mát', label: 'Thanh mát' },
  { value: 'Dễ làm', label: 'Dễ nấu nhanh' },
  { value: 'Bổ dưỡng', label: 'Bổ dưỡng' },
]

const ITEMS_PER_PAGE = 6

export default function RecipesPage({ onShowRecipe, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('all')
  const [time, setTime] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = dishes.filter(d => {
    const matchQ =
      !query ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.desc.toLowerCase().includes(query.toLowerCase()) ||
      d.ingredients.join(' ').toLowerCase().includes(query.toLowerCase())
    const matchCat = category === 'all' || d.category === category
    const matchTime = time === 'all' || d.time <= Number(time)
    return matchQ && matchCat && matchTime
  })

  const hasActiveFilter = Boolean(query || category !== 'all' || time !== 'all')
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1

  // Khi thay đổi bộ lọc, tự động đưa về trang 1
  useEffect(() => {
    setCurrentPage(1)
  }, [query, category, time])

  // Lấy danh sách món ăn cho trang hiện tại
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedDishes = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  function clearFilters() {
    setQuery('')
    setCategory('all')
    setTime('all')
    setCurrentPage(1)
  }

  function goToPage(page) {
    setCurrentPage(page)
    const el = document.getElementById('page-recipes')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section id="page-recipes" className="recipes-page">
      {/* Mô tả ngắn gọn dưới tiêu đề chính */}
      <p className="recipes-lead">Tìm cảm hứng mới cho mỗi bữa cơm gia đình đầm ấm</p>

      {/* Thanh tìm kiếm và bộ lọc thời gian tinh gọn */}
      <div className="recipes-toolbar">
        <div className="recipes-search-wrap">
          <svg
            className="recipes-search-icon"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="catalogSearch"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm tên món ăn, nguyên liệu, hương vị..."
            aria-label="Tìm tên món ăn hoặc nguyên liệu"
          />
          {query && (
            <button
              className="recipes-search-clear"
              onClick={() => setQuery('')}
              aria-label="Xóa tìm kiếm"
              type="button"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="recipes-filters">
          <select
            id="timeFilter"
            className="recipes-select"
            value={time}
            onChange={e => setTime(e.target.value)}
            aria-label="Lọc theo thời gian"
          >
            <option value="all">Mọi thời gian nấu</option>
            <option value="30">Dưới 30 phút</option>
            <option value="45">Dưới 45 phút</option>
          </select>
        </div>
      </div>

      {/* Hàng danh mục dạng pill chính thức & số lượng món ăn */}
      <div className="recipes-subbar">
        <div className="recipes-chips" role="tablist" aria-label="Bộ lọc danh mục món ăn">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              type="button"
              role="tab"
              aria-selected={category === c.value}
              className={`recipes-chip${category === c.value ? ' active' : ''}`}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="recipes-status">
          <span className="recipes-count">
            <strong>{filtered.length}</strong> món ăn{hasActiveFilter ? ' phù hợp' : ''}
            {totalPages > 1 && (
              <span className="recipes-page-hint"> · Trang {currentPage}/{totalPages}</span>
            )}
          </span>
          {hasActiveFilter && (
            <button type="button" className="recipes-reset-btn" onClick={clearFilters}>
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Danh sách thẻ món ăn (phân trang 6 món/trang) */}
      <div className="wide-recipes">
        {paginatedDishes.length > 0 ? (
          paginatedDishes.map(d => <RecipeCard key={d.id} dish={d} onShowRecipe={onShowRecipe} />)
        ) : (
          <div className="recipes-empty">
            <div className="recipes-empty-icon">&#9906;</div>
            <h4>Không tìm thấy món ăn phù hợp</h4>
            <p>Thử thay đổi từ khóa hoặc chọn danh mục khác để khám phá thêm món ngon nhé</p>
            <button type="button" className="recipes-reset-btn" onClick={clearFilters}>
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* ── Thanh chuyển trang (Pagination Controls) ── */}
      {totalPages > 1 && (
        <nav className="recipes-pagination" aria-label="Phân trang danh sách món ăn">
          <button
            type="button"
            className="recipes-page-btn recipes-page-prev"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <span aria-hidden="true">&larr;</span>
            <span>Trang trước</span>
          </button>

          <div className="recipes-page-numbers">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNumber => (
              <button
                key={pageNumber}
                type="button"
                className={`recipes-page-num${currentPage === pageNumber ? ' active' : ''}`}
                onClick={() => goToPage(pageNumber)}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
                aria-label={`Trang ${pageNumber}`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="recipes-page-btn recipes-page-next"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            <span>Trang sau</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </nav>
      )}
    </section>
  )
}
