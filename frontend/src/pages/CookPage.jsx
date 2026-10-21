import { useState } from 'react'
import { dishes } from '../data/dishes'
import RecipeCard from '../components/RecipeCard'

export default function CookPage({ activeRecipeId, onShowRecipe }) {
  const activeRecipe = dishes.find(d => d.id === activeRecipeId)

  return (
    <section id="page-cook">
      <div className="section-head">
        <div>
          <h3>Cùng vào bếp</h3>
          <p>Chọn món ăn để xem nguyên liệu và các bước thực hiện.</p>
        </div>
      </div>
      <div className="wide-recipes">
        {dishes.map(d => (
          <RecipeCard key={d.id} dish={d} onShowRecipe={onShowRecipe} />
        ))}
      </div>

      {/* Recipe detail */}
      <div className="panel" id="recipeDetail" style={{ marginTop: 20 }}>
        {activeRecipe ? (
          <div className="recipe-detail-grid">
            <img
              src={activeRecipe.img}
              alt={activeRecipe.name}
            />
            <div>
              <div className="eyebrow">
                {activeRecipe.category} · {activeRecipe.time} PHÚT
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '8px 0' }}>
                {activeRecipe.name}
              </h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
                {activeRecipe.desc}
              </p>
              <h4 style={{ marginBottom: 8 }}>Nguyên liệu</h4>
              <ul>
                {activeRecipe.ingredients.map((x, i) => (
                  <li key={i} style={{ padding: '4px 0' }}>{x}</li>
                ))}
              </ul>
              <h4 style={{ margin: '16px 0 8px' }}>Cách thực hiện</h4>
              <ol>
                {activeRecipe.steps.map((x, i) => (
                  <li key={i} style={{ padding: '5px 0', lineHeight: 1.5 }}>{x}</li>
                ))}
              </ol>
              <button className="primary" style={{ marginTop: 18 }}>
                ♥ Bắt đầu nấu
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3>Chọn một món để bắt đầu</h3>
            <p className="panel-sub">Hướng dẫn sẽ hiển thị tại đây.</p>
          </>
        )}
      </div>
    </section>
  )
}
