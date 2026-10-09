import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { ROLE_HOME } from '../layouts/navConfig'
import type { Role } from '../types'

/**
 * Route guard. Unauthenticated visitors are sent to the role-selection screen;
 * a signed-in user visiting another role's tree is bounced to their own home.
 */
export function RequireAuth({ role, children }: { role: Role; children: ReactNode }) {
  const user = useAppStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/roles" replace state={{ from: location.pathname }} />
  }
  if (user.role !== role) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }
  return <>{children}</>
}
