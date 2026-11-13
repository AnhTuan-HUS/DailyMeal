import { createContext, useContext, useState, useCallback } from 'react'
import { initialIngredients } from '../data/dishes'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [saved, setSaved] = useState(new Set([2, 4]))
  const [ingredients, setIngredients] = useState(initialIngredients)
  const [checked, setChecked] = useState(new Set())

  const toggleSave = useCallback((id) => {
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const checkIngredient = useCallback((idx, val) => {
    setChecked(prev => {
      const next = new Set(prev)
      val ? next.add(idx) : next.delete(idx)
      return next
    })
  }, [])

  const addIngredient = useCallback((name) => {
    setIngredients(prev => [...prev, [name, '1 phần']])
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

  return (
    <AppContext.Provider value={{ saved, toggleSave, ingredients, checked, checkIngredient, addIngredient, removeIngredient, clearChecked }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
