import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'

export default function OwnerRoute() {
  const { isOwner } = useAuth()

  if (!isOwner) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
