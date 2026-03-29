import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'

function AuthGuard() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default AuthGuard
