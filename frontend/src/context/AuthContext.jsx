import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { authApi } from '@/services/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.getSession())
  const [authModal, setAuthModal] = useState(null) // null | 'login' | 'register'

  const login = useCallback(async creds => {
    const u = await authApi.login(creds)
    setUser(u)
    setAuthModal(null)
    return u
  }, [])

  const register = useCallback(async data => {
    const u = await authApi.register(data)
    setUser(u)
    setAuthModal(null)
    return u
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  // Nap lai user tu "server" (sau khi doi quyen / sua ho so)
  const refreshUser = useCallback(() => setUser(authApi.getSession()), [])

  const hasPermission = useCallback(p => !!user?.permissions?.includes(p), [user])

  const value = useMemo(() => ({
    user, isAuthenticated: !!user, login, register, logout, refreshUser, hasPermission,
    authModal, openAuth: setAuthModal, closeAuth: () => setAuthModal(null),
  }), [user, login, register, logout, refreshUser, hasPermission, authModal])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}