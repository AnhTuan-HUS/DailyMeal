import { useState } from 'react'
import { ToastProvider } from '@/context/ToastContext'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import AuthModal from '@/components/auth/AuthModal'

import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import Topbar from '@/components/layout/Topbar'

import HomePage from '@/pages/HomePage'
import RecipesPage from '@/pages/RecipesPage'
import PlanPage from '@/pages/PlanPage'
import ShoppingPage from '@/pages/ShoppingPage'
import CookPage from '@/pages/CookPage'
import FamilyPage from '@/pages/FamilyPage'
import SavedPage from '@/pages/SavedPage'
import AccountPage from '@/pages/AccountPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import GuidePage from '@/pages/GuidePage'
import AdminPage from '@/pages/AdminPage'

// Cac trang yeu cau da dang nhap
const PROTECTED = ['profile', 'settings', 'admin']
const ADMIN_PERMS = ['user:manage', 'role:manage', 'permission:manage']

function Shell() {
  const { isAuthenticated, openAuth, hasPermission } = useAuth()
  const [page, setPage] = useState('home')
  const [recipesQuery, setRecipesQuery] = useState('')
  const [activeRecipeId, setActiveRecipeId] = useState(null)

  function navigate(targetPage, query = '') {
    if (PROTECTED.includes(targetPage) && !isAuthenticated) { openAuth('login'); return }
    setPage(targetPage)
    if (targetPage === 'recipes' && query) setRecipesQuery(query)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function showRecipe(id) {
    setActiveRecipeId(id)
    setPage('cook')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Dang xuat / mat quyen khi dang o trang bao ve -> ve trang chu
  const blocked =
    (PROTECTED.includes(page) && !isAuthenticated) ||
    (page === 'admin' && !ADMIN_PERMS.some(hasPermission))
  const current = blocked ? 'home' : page

  return (
    <>
      <div className="app">
        <Sidebar activePage={current} onNavigate={navigate} />

        <main className="main">
          <Topbar activePage={current} onNavigate={navigate} />

          {current === 'home' && <HomePage onNavigate={navigate} onShowRecipe={showRecipe} />}
          {current === 'recipes' && (
            <RecipesPage onShowRecipe={showRecipe} initialQuery={recipesQuery} key={recipesQuery} />
          )}
          {current === 'plan' && <PlanPage onShowRecipe={showRecipe} onNavigate={navigate} />}
          {current === 'shopping' && <ShoppingPage />}
          {current === 'cook' && <CookPage activeRecipeId={activeRecipeId} onShowRecipe={showRecipe} />}
          {current === 'family' && <FamilyPage />}
          {current === 'saved' && <SavedPage onShowRecipe={showRecipe} />}
          {current === 'account' && <AccountPage />}
          {current === 'profile' && <ProfilePage />}
          {current === 'settings' && <SettingsPage />}
          {current === 'guide' && <GuidePage />}
          {current === 'admin' && <AdminPage />}
        </main>
      </div>

      <MobileNav activePage={current} onNavigate={navigate} />
      <AuthModal />
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <Shell />
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  )
}