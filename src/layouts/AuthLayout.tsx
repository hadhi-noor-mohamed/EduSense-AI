import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, ShieldCheck } from 'lucide-react'
import { BrandMark } from '../components/shared/Brand'
import { ThemeToggle } from '../components/ui/ThemeToggle'

/**
 * Centred shell used by the four role login pages plus forgot-password.
 */
export function AuthLayout({
  title,
  subtitle,
  roleLabel,
  children,
}: {
  title: string
  subtitle: string
  roleLabel: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-base">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandMark size="md" to="/" />
          <div className="flex items-center gap-3">
            <Link
              to="/roles"
              className="hidden text-[13px] font-medium text-ink-muted transition-colors hover:text-ink sm:block"
            >
              ← All roles
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-center px-4 py-10 sm:px-6">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
          {/* branding panel */}
          <div className="hidden lg:block">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink-muted">
              <GraduationCap className="h-4 w-4 text-accent" aria-hidden />
              {roleLabel}
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-ink">
              Predict. Understand.
              <br />
              Improve.
            </h1>
            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-muted">{subtitle}</p>

            <div className="mt-8 space-y-3">
              {[
                'Early risk detection from attendance, marks and activity',
                'Explainable factors behind every prediction',
                'Personalised, prioritised action plans',
              ].map((t) => (
                <div key={t} className="flex items-start gap-3 text-[13.5px] text-ink-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {t}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-line bg-panel p-4">
              <p className="text-[12px] font-semibold text-ink-muted">Demo credentials</p>
              <p className="mt-1 font-mono text-[12px] leading-relaxed text-ink-subtle">
                student@demo.com · teacher@demo.com
                <br />
                college@demo.com · admin@demo.com
                <br />
                password: <span className="text-accent">password123</span>
              </p>
            </div>
          </div>

          {/* form panel */}
          <div className="w-full">
            <div className="rounded-2xl border border-line bg-panel p-6 shadow-card sm:p-8">
              <div className="lg:hidden">
                <BrandMark size="md" />
              </div>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-ink lg:mt-0">{title}</h2>
              <p className="mt-1.5 text-[13.5px] text-muted">{subtitle}</p>
              <div className="mt-6">{children}</div>
            </div>
            <p className="mt-4 text-center text-[12px] text-ink-subtle">
              Prototype build · mock authentication stored in localStorage
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
