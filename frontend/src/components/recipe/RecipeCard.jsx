import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'

export default function RecipeCard({ dish, onShowRecipe }) {
  const { saved, toggleSave } = useApp()
  const toast = useToast()
  const isSaved = saved.has(dish.id)

  function handleSave(e) {
    e.stopPropagation()
    toggleSave(dish.id)
    toast(isSaved ? 'Đã bỏ món khỏi danh sách lưu' : 'Đã lưu món ăn yêu thích')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onShowRecipe && onShowRecipe(dish.id)
    }
  }

  return (
    <article
      className="recipe"
      onClick={() => onShowRecipe && onShowRecipe(dish.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Món ăn: ${dish.name}`}
    >
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
          type="button"
          className={`heart${isSaved ? ' saved' : ''}`}
          onClick={handleSave}
          aria-label={isSaved ? 'Bỏ lưu món' : 'Lưu món yêu thích'}
          title={isSaved ? 'Bỏ lưu món' : 'Lưu vào món yêu thích'}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="recipe-body">
        <h4 className="recipe-title">{dish.name}</h4>
        <p className="recipe-desc">{dish.desc}</p>
        <div className="recipe-meta">
          <span className="recipe-meta-item" title={`Thời gian nấu: ${dish.time} phút`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {dish.time} phút
          </span>
          <span className="recipe-meta-item" title={`Khẩu phần: ${dish.servings} người`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {dish.servings} người
          </span>
          {dish.cal && (
            <span className="recipe-meta-item" title={`Năng lượng: ${dish.cal} kcal/khẩu phần`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              ~{dish.cal} kcal
            </span>
          )}
        </div>
        <div className="recipe-footer-cta">
          <span>Xem công thức</span>
          <span className="recipe-cta-arrow" aria-hidden="true">&rarr;</span>
        </div>
      </div>
    </article>
  )
}
