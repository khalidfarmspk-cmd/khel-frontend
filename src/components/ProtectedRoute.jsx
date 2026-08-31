import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'

export default function ProtectedRoute() {
  const { token, isOwner, logout } = useAuth()

  useEffect(() => {
    if (token && !isOwner) {
      logout()
    }
  }, [token, isOwner, logout])

  if (!token || !isOwner) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
