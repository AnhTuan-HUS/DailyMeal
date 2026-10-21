import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'

export default function RecipeCard({ dish, onShowRecipe }) {
  const { saved, toggleSave } = useApp()
  const toast = useToast()
  const isSaved = saved.has(dish.id)

  function handleSave(e) {
    e.stopPropagation()
    toggleSave(dish.id)
    toast(isSaved ? 'Đã bỏ món khỏi danh sách lưu' : 'Đã lưu món ăn yêu thích')
  }

  return (
    <article className="recipe">
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
          className={`heart${isSaved ? ' saved' : ''}`}
          onClick={handleSave}
          aria-label="Lưu món"
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>
      <div className="recipe-body">
        <h4 className="recipe-title">{dish.name}</h4>
        <p className="recipe-desc">{dish.desc}</p>
        <div className="recipe-meta">
          <span>◷ {dish.time} phút</span>
          <span>♧ {dish.servings} người</span>
        </div>
        <button
          className="text-link"
          style={{ padding: '12px 0 0', display: 'block' }}
          onClick={() => onShowRecipe && onShowRecipe(dish.id)}
        >
          Xem công thức →
        </button>
      </div>
    </article>
  )
}
