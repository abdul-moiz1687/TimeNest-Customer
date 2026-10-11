import { createContext, useContext, useState, useCallback } from 'react'
import * as authApi from '../services/authApi'

const AuthContext = createContext(null)
const KEY = 'timenest_auth'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { token: null, user: null } } catch { return { token: null, user: null } }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(load)

  const save = (a) => { localStorage.setItem(KEY, JSON.stringify(a)); setAuth(a) }

  const login = useCallback(async (email, password) => save(await authApi.login(email, password)), [])
  const signup = useCallback(async (name, email, password) => save(await authApi.signup(name, email, password)), [])
  const logout = useCallback(() => { localStorage.removeItem(KEY); setAuth({ token: null, user: null }) }, [])

  return (
    <AuthContext.Provider value={{ ...auth, isLoggedIn: !!auth.token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
