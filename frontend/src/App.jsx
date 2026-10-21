import { useState } from 'react'
import { ToastProvider } from './context/ToastContext'
import { AppProvider } from './context/AppContext'

import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import Topbar from './components/Topbar'

import HomePage from './pages/HomePage'
import RecipesPage from './pages/RecipesPage'
import PlanPage from './pages/PlanPage'
import ShoppingPage from './pages/ShoppingPage'
import CookPage from './pages/CookPage'
import FamilyPage from './pages/FamilyPage'
import SavedPage from './pages/SavedPage'
import AccountPage from './pages/AccountPage'

export default function App() {
  const [page, setPage] = useState('home')
  const [recipesQuery, setRecipesQuery] = useState('')
  const [activeRecipeId, setActiveRecipeId] = useState(null)

  function navigate(targetPage, query = '') {
    setPage(targetPage)
    if (targetPage === 'recipes' && query) setRecipesQuery(query)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function showRecipe(id) {
    setActiveRecipeId(id)
    setPage('cook')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <ToastProvider>
      <AppProvider>
        <div className="app">
          <Sidebar activePage={page} onNavigate={navigate} />

          <main className="main">
            <Topbar activePage={page} onNavigate={navigate} />

            {page === 'home' && (
              <HomePage onNavigate={navigate} onShowRecipe={showRecipe} />
            )}
            {page === 'recipes' && (
              <RecipesPage
                onShowRecipe={showRecipe}
                initialQuery={recipesQuery}
                key={recipesQuery}
              />
            )}
            {page === 'plan' && (
              <PlanPage onShowRecipe={showRecipe} />
            )}
            {page === 'shopping' && (
              <ShoppingPage />
            )}
            {page === 'cook' && (
              <CookPage activeRecipeId={activeRecipeId} onShowRecipe={showRecipe} />
            )}
            {page === 'family' && (
              <FamilyPage />
            )}
            {page === 'saved' && (
              <SavedPage onShowRecipe={showRecipe} />
            )}
            {page === 'account' && (
              <AccountPage />
            )}
          </main>
        </div>

        <MobileNav activePage={page} onNavigate={navigate} />
      </AppProvider>
    </ToastProvider>
  )
}
