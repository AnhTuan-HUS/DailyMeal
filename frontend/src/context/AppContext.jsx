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

  return (
    <AppContext.Provider value={{ saved, toggleSave, ingredients, checked, checkIngredient, addIngredient }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
