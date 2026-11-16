import { useState } from 'react'
import { dishes } from '../data/dishes'
import RecipeCard from '../components/RecipeCard'

export default function RecipesPage({ onShowRecipe, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('all')
  const [time, setTime] = useState('all')

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

  return (
    <section id="page-recipes">
      <div className="section-head">
        <div>
          <h3>Khám phá món ăn</h3>
          <p>Tìm cảm hứng mới cho mỗi bữa cơm gia đình</p>
        </div>
      </div>
      <div className="catalog-toolbar">
        <input
          id="catalogSearch"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="⌕  Tìm tên món ăn hoặc nguyên liệu..."
        />
        <select id="categoryFilter" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="all">Tất cả danh mục</option>
          <option value="Món truyền thống">Món truyền thống</option>
          <option value="Thanh mát">Thanh mát</option>
          <option value="Dễ làm">Dễ làm</option>
          <option value="Bổ dưỡng">Bổ dưỡng</option>
        </select>
        <select id="timeFilter" value={time} onChange={e => setTime(e.target.value)}>
          <option value="all">Mọi thời gian</option>
          <option value="30">Dưới 30 phút</option>
          <option value="45">Dưới 45 phút</option>
        </select>
      </div>
      <div className="wide-recipes">
        {filtered.length > 0
          ? filtered.map(d => <RecipeCard key={d.id} dish={d} onShowRecipe={onShowRecipe} />)
          : <p className="empty-state">Chưa có món ăn phù hợp. Thử tìm kiếm khác nhé.</p>}
      </div>
    </section>
  )
}
