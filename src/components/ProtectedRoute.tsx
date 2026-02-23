import { Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'

export default function ProtectedRoute({
  session,
  children,
}: {
  session: Session | null
  children: React.ReactNode
}) {
  if (!session) return <Navigate to="/auth" replace />
  return <>{children}</>
}
