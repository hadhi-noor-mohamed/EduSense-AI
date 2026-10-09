import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { KeyRound, LogIn, Mail, Sparkles } from 'lucide-react'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input, Checkbox } from '../../components/ui/Input'
import { MockBadge } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import { DEMO_ACCOUNTS } from '../../data/seed'
import { ROLE_HOME, ROLE_LABEL } from '../../layouts/navConfig'
import type { Role } from '../../types'

const SUBTITLE: Record<Role, string> = {
  student:
    'Sign in to see your demo risk score, the factors behind it and your personalised action plan.',
  teacher:
    'Sign in to monitor cohort risk, review explainability output and manage student interventions.',
  institution:
    'Sign in for department-level analytics, retention signals and institution-wide reports.',
  organization:
    'Sign in to manage tenants, programs and platform-wide adoption metrics.',
}

const isRole = (v: string | undefined): v is Role =>
  v === 'student' || v === 'teacher' || v === 'institution' || v === 'organization'

export function LoginPage() {
  const { role } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAppStore((s) => s.login)
  const user = useAppStore((s) => s.user)
  const pushToast = useAppStore((s) => s.pushToast)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isRole(role)) return <Navigate to="/roles" replace />
  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from && from.startsWith(`/${user.role === 'organization' ? 'admin' : user.role}`) ? from : ROLE_HOME[user.role]} replace />
  }

  const account = DEMO_ACCOUNTS.find((a) => a.role === role)

  const fillDemo = () => {
    if (!account) return
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError('')

    const trimmed = email.trim().toLowerCase()
    const found = DEMO_ACCOUNTS.find((a) => a.email === trimmed)
    if (found && found.role !== role) {
      setError(
        `${found.email} is a ${ROLE_LABEL[found.role].toLowerCase()} account. Use the ${ROLE_LABEL[role].toLowerCase()} sign-in page instead.`,
      )
      return
    }

    setLoading(true)
    // Simulated network latency for the mock auth service.
    window.setTimeout(() => {
      const result = login(trimmed, password)
      setLoading(false)
      if (!result.ok) {
        setError(result.error ?? 'Unable to sign in.')
        return
      }
      pushToast({
        title: 'Signed in',
        description: `Welcome back, ${found?.name ?? 'there'}. This is a mock session stored in your browser.`,
        tone: 'success',
      })
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? ROLE_HOME[role], { replace: true })
    }, 550)
  }

  return (
    <AuthLayout
      title={`${ROLE_LABEL[role]} sign in`}
      subtitle={SUBTITLE[role]}
      roleLabel={ROLE_LABEL[role]}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@demo.com"
          value={email}
          leftIcon={<Mail className="h-4 w-4" aria-hidden />}
          onChange={(e) => setEmail(e.target.value)}
          error={error && error.includes('email') ? error : undefined}
          required
        />

        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            leftIcon={<KeyRound className="h-4 w-4" aria-hidden />}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <Checkbox
              label="Keep me signed in"
              description="Stored in this browser only"
              checked={remember}
              onChange={setRemember}
            />
            <Link
              to="/forgot-password"
              className="shrink-0 text-[12.5px] font-medium text-accent transition-colors hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {!loading && <LogIn className="h-4 w-4" aria-hidden />}
          Sign in as {ROLE_LABEL[role]}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={fillDemo}
          disabled={!account}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Use demo credentials
        </Button>
      </form>

      <div className="mt-5 rounded-xl border border-dashed border-line bg-panel-muted p-3.5">
        <p className="text-[12px] font-semibold text-ink-muted">Demo account for this role</p>
        <p className="mt-1 font-mono text-[12px] leading-relaxed text-ink-subtle">
          {account?.email ?? '—'}
          <br />
          password: <span className="text-accent">password123</span>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <Link
          to="/roles"
          className="text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          ← Choose a different role
        </Link>
        <MockBadge compact />
      </div>
    </AuthLayout>
  )
}
