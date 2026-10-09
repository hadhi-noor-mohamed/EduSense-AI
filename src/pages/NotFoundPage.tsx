import { useNavigate } from 'react-router-dom'
import { Compass, Home, LayoutGrid } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { MockBadge } from '../components/shared/MockBadge'
import { useAppStore } from '../store/useAppStore'
import { ROLE_HOME } from '../layouts/navConfig'

export function NotFoundPage() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4 py-16 text-center">
      <div className="animate-fade-in-up w-full max-w-lg rounded-3xl border border-line bg-panel p-8 shadow-card">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300">
          <Compass className="h-6 w-6" aria-hidden />
        </span>

        <p className="mt-5 text-[56px] font-extrabold leading-none tracking-tight text-ink">404</p>
        <h1 className="mt-3 text-xl font-bold text-ink">This page is not part of the demo</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          The route you asked for does not exist in EduSense AI. Pick one of the paths below to
          continue the walkthrough.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <Button onClick={() => navigate(user ? ROLE_HOME[user.role] : '/')}>
            <Home className="h-4 w-4" aria-hidden />
            {user ? 'Back to my dashboard' : 'Back to home'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/roles')}>
            <LayoutGrid className="h-4 w-4" aria-hidden />
            Choose a role
          </Button>
        </div>

        <div className="mt-6 flex justify-center border-t border-line pt-4">
          <MockBadge compact />
        </div>
      </div>
    </div>
  )
}
