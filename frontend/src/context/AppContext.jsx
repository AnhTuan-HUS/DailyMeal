import { createContext, useContext, useState, useCallback } from 'react'
import { initialIngredients, familyMembers, initialMealProfile, initialHistory } from '@/data/dishes'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [saved, setSaved] = useState(new Set([2, 4]))
  const [ingredients, setIngredients] = useState(initialIngredients)
  const [checked, setChecked] = useState(new Set())
  const [members, setMembers] = useState(familyMembers)
  const [mealProfile, setMealProfile] = useState(initialMealProfile)
  const [history, setHistory] = useState(initialHistory)

  const toggleSave = useCallback((id) => {
    setSaved(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const checkIngredient = useCallback((idx, val) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (val) next.add(idx)
      else next.delete(idx)
      return next
    })
  }, [])

  const addIngredient = useCallback((name, qty = '1 phần') => {
    setIngredients(prev => [...prev, [name, qty]])
  }, [])

  const removeIngredient = useCallback((idx) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx))
    setChecked(prev => {
      const next = new Set()
      prev.forEach(i => { if (i < idx) next.add(i); else if (i > idx) next.add(i - 1) })
      return next
    })
  }, [])

  const clearChecked = useCallback(() => {
    setIngredients(prev => prev.filter((_, i) => !checked.has(i)))
    setChecked(new Set())
  }, [checked])

  // ---- Gia đình ----
  const addMember = useCallback((data) => {
    setMembers(prev => [...prev, { ...data, id: Date.now() }])
  }, [])

  const updateMember = useCallback((id, data) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...data } : m)))
  }, [])

  const removeMember = useCallback((id) => {
    setMembers(prev => prev.filter(m => m.id !== id))
  }, [])

  const updateMealProfile = useCallback((patch) => {
    setMealProfile(prev => ({ ...prev, ...patch }))
  }, [])

  const setHistoryStatus = useCallback((daysAgo, status, swappedTo) => {
    setHistory(prev =>
      prev.map(h =>
        h.daysAgo === daysAgo
          ? { ...h, status, swappedTo: status === 'swapped' ? swappedTo : undefined }
          : h
      )
    )
  }, [])

  return (
    <AppContext.Provider
      value={{
        saved, toggleSave,
        ingredients, checked, checkIngredient, addIngredient, removeIngredient, clearChecked,
        members, addMember, updateMember, removeMember,
        mealProfile, updateMealProfile,
        history, setHistoryStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useApp() {
  return useContext(AppContext)
}
