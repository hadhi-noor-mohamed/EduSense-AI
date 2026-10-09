import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { MockBadge } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import { DEMO_ACCOUNTS } from '../../data/seed'

export function ForgotPasswordPage() {
  const pushToast = useAppStore((s) => s.pushToast)

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()

    if (!trimmed) {
      setError('Enter the email address registered with your institution.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('That does not look like a valid email address.')
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      const account = DEMO_ACCOUNTS.find((a) => a.email === trimmed)
      if (!account) {
        setError('No demo account matches that address. Try one of the demo emails below.')
        return
      }
      setError('')
      setSent(true)
      pushToast({
        title: 'Reset link requested',
        description: 'Prototype only — no email is actually sent.',
        tone: 'info',
      })
    }, 700)
  }

  return (
    <AuthLayout
      title={sent ? 'Check your inbox' : 'Reset your password'}
      subtitle={
        sent
          ? 'We generated a mock reset link for this prototype session.'
          : 'Enter your account email and we will prepare a password reset link.'
      }
      roleLabel="Account recovery"
    >
      {sent ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
            <div>
              <p className="text-[13.5px] font-semibold text-ink">Reset link prepared</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                A link would be sent to{' '}
                <span className="font-medium text-ink">{email}</span>. In this prototype no email
                leaves your browser — use the demo password{' '}
                <span className="font-mono font-semibold text-accent">password123</span> instead.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-line bg-panel-muted p-3.5">
            <p className="text-[12px] font-semibold text-ink-muted">Demo accounts</p>
            <ul className="mt-1.5 space-y-1 font-mono text-[11.5px] text-ink-subtle">
              {DEMO_ACCOUNTS.map((a) => (
                <li key={a.email} className="flex items-center justify-between gap-3">
                  <span>{a.email}</span>
                  <span className="text-accent">{a.role}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setSent(false)
                setEmail('')
                setError('')
              }}
            >
              Try another address
            </Button>
            <Link
              to="/roles"
              className="inline-flex h-10 items-center rounded-lg border border-line bg-panel px-4 text-sm font-medium text-ink transition-colors hover:bg-panel-muted"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              Back to roles
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Account email"
            type="email"
            autoComplete="email"
            placeholder="student@demo.com"
            value={email}
            leftIcon={<Mail className="h-4 w-4" aria-hidden />}
            onChange={(e) => setEmail(e.target.value)}
            error={error || undefined}
            hint="All demo accounts share the password password123."
            required
          />

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {!loading && <Send className="h-4 w-4" aria-hidden />}
            Send reset link
          </Button>
        </form>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <Link
          to="/roles"
          className="text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          ← Choose a role
        </Link>
        <MockBadge compact />
      </div>
    </AuthLayout>
  )
}
