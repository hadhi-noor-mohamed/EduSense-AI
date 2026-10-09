import { Link, Outlet } from 'react-router-dom'
import { ShieldCheck, Sparkles, Building2 } from 'lucide-react'
import { BrandMark } from '../components/shared/Brand'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { MockBadge } from '../components/shared/MockBadge'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-base">
      <header className="sticky top-0 z-40 border-b border-line bg-panel/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandMark size="md" />
          <nav className="hidden items-center gap-6 md:flex" aria-label="Landing">
            {[
              { label: 'How it works', hash: '#how-it-works' },
              { label: 'Explainable AI', hash: '#explainable' },
              { label: 'For institutions', hash: '#audiences' },
              { label: 'FAQ', hash: '#faq' },
            ].map((l) => (
              <a
                key={l.hash}
                href={l.hash}
                className="text-[13.5px] font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/roles"
              className="inline-flex h-9 items-center rounded-lg bg-accent px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Explore Platform
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-panel">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <BrandMark size="md" />
              <p className="mt-3 text-[13px] font-medium text-ink-muted">
                Predict. Understand. Improve.
              </p>
              <p className="mt-2 max-w-xs text-[12.5px] leading-relaxed text-ink-subtle">
                An explainable AI-based student performance prediction and early risk detection
                system — a college mini-project prototype.
              </p>
            </div>

            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                Platform
              </p>
              <ul className="space-y-2 text-[13px] text-ink-muted">
                <li>
                  <Link to="/roles" className="transition-colors hover:text-ink">
                    Role selection
                  </Link>
                </li>
                <li>
                  <Link to="/login/student" className="transition-colors hover:text-ink">
                    Student login
                  </Link>
                </li>
                <li>
                  <Link to="/login/teacher" className="transition-colors hover:text-ink">
                    Teacher login
                  </Link>
                </li>
                <li>
                  <Link to="/login/institution" className="transition-colors hover:text-ink">
                    Institution login
                  </Link>
                </li>
                <li>
                  <Link to="/login/organization" className="transition-colors hover:text-ink">
                    Organization login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                Workflow
              </p>
              <ul className="space-y-2 text-[13px] text-ink-muted">
                <li>Collect data</li>
                <li>Predict risk</li>
                <li>Explain the prediction</li>
                <li>Recommend actions</li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                Transparency
              </p>
              <ul className="space-y-2.5 text-[13px] text-ink-muted">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                  Demo predictions only
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                  Explainability-first design
                </li>
                <li className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden />
                  Built for institutions
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-ink-subtle">
              © {new Date().getFullYear()} EduSense AI · Educational prototype. Not a clinically
              or scientifically validated predictive tool.
            </p>
            <MockBadge compact />
          </div>
        </div>
      </footer>
    </div>
  )
}
