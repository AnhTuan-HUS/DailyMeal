import { dishes } from '../data/dishes'
import { useApp } from '../context/AppContext'
import RecipeCard from '../components/RecipeCard'

export default function SavedPage({ onShowRecipe }) {
  const { saved } = useApp()
  const savedDishes = dishes.filter(d => saved.has(d.id))

  return (
    <section id="page-saved">
      <div className="section-head">
        <div>
          <h3>Món ăn đã lưu</h3>
          <p>Tập hợp những công thức bạn yêu thích.</p>
        </div>
      </div>
      <div className="wide-recipes">
        {savedDishes.length > 0
          ? savedDishes.map(d => <RecipeCard key={d.id} dish={d} onShowRecipe={onShowRecipe} />)
          : <p className="empty-state">Bạn chưa lưu món ăn nào. Hãy khám phá và lưu những công thức yêu thích!</p>}
      </div>
    </section>
  )
}
