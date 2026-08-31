import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, setUnauthorizedHandler } from './api'
import { getLevelUser } from './jwt'

const AuthContext = createContext(null)

function readStoredAuth() {
  const token = sessionStorage.getItem('token')
  const username = sessionStorage.getItem('username') || ''
  if (!token) {
    return { token: null, username: '', levelUser: null }
  }
  return {
    token,
    username,
    levelUser: getLevelUser(token),
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => readStoredAuth().token)
  const [username, setUsername] = useState(() => readStoredAuth().username)
  const [levelUser, setLevelUser] = useState(() => readStoredAuth().levelUser)

  function clearAuth() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('username')
    setToken(null)
    setUsername('')
    setLevelUser(null)
  }

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth()
      navigate('/login', { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [navigate])

  const value = useMemo(
    () => ({
      token,
      username,
      levelUser,
      isOwner: levelUser === 'PEMILIK',
      async login(nextUsername, password) {
        const data = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: { username: nextUsername, password, forAdmin: true, client: 'admin' },
          handle401: false,
        })
        if (!data?.token) {
          throw new Error('Login failed')
        }
        const role = getLevelUser(data.token)
        if (role !== 'PEMILIK') {
          throw new Error('Admin access only — owners can sign in here')
        }
        sessionStorage.setItem('token', data.token)
        sessionStorage.setItem('username', nextUsername)
        setToken(data.token)
        setUsername(nextUsername)
        setLevelUser(role)
      },
      logout() {
        clearAuth()
        navigate('/login', { replace: true })
      },
    }),
    [token, username, levelUser, navigate],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
