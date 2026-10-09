import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  KeyRound,
  Languages,
  LogOut,
  Monitor,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  UserCog,
} from 'lucide-react'
import type { Role } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { useT } from '../../hooks/useT'
import { LOCALE_LABEL, type Locale } from '../../i18n'
import { ROLE_LABEL } from '../../layouts/navConfig'
import { PageHeader } from '../ui/PageHeader'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Switch } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { cn } from '../../utils/cn'

function SectionCard({
  icon,
  title,
  description,
  children,
  footer,
  className,
}: {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader icon={icon} title={title} description={description} />
      <CardContent className="pt-2">{children}</CardContent>
      {footer && (
        <div className="border-t border-line px-5 py-3.5">{footer}</div>
      )}
    </Card>
  )
}

export function SettingsView({ role }: { role: Role }) {
  const t = useT()
  const navigate = useNavigate()
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const logout = useAppStore((s) => s.logout)
  const pushToast = useAppStore((s) => s.pushToast)
  const user = useAppStore((s) => s.user)

  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')

  const saveNotif = (key: keyof typeof settings.notifications, value: boolean) => {
    updateSettings({ notifications: { ...settings.notifications, [key]: value } })
    pushToast({ title: t('settings.saved'), description: 'Notification preferences updated.', tone: 'success' })
  }

  const savePrivacy = (key: keyof typeof settings.privacy, value: boolean) => {
    updateSettings({ privacy: { ...settings.privacy, [key]: value } })
    pushToast({ title: t('settings.saved'), description: 'Privacy preferences updated.', tone: 'success' })
  }

  const submitPassword = () => {
    if (pw.current !== 'password123') {
      setPwError('Current demo password is password123.')
      return
    }
    if (pw.next.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    if (pw.next !== pw.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    setPwError('')
    setPwOpen(false)
    setPw({ current: '', next: '', confirm: '' })
    pushToast({ title: 'Password updated', description: 'Use the new password next time you sign in.', tone: 'success' })
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ---------- appearance ---------- */}
        <SectionCard
          icon={<Palette className="h-4.5 w-4.5" />}
          title={t('settings.appearance')}
          description={t('settings.themeDesc')}
        >
          <div className="grid grid-cols-2 gap-3">
            {(['light', 'dark'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setTheme(mode)
                  pushToast({
                    title: mode === 'light' ? 'Light mode enabled' : 'Dark mode enabled',
                    tone: 'info',
                  })
                }}
                aria-pressed={theme === mode}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all',
                  theme === mode
                    ? 'border-accent bg-brand-50/60 ring-1 ring-accent dark:bg-brand-500/10'
                    : 'border-line hover:border-accent/40 hover:bg-panel-muted',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    mode === 'light'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/15'
                      : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15',
                  )}
                >
                  {mode === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </span>
                <span className="text-[13.5px] font-semibold text-ink">
                  {mode === 'light' ? t('settings.light') : t('settings.dark')}
                </span>
                <span className="text-[11.5px] text-ink-subtle">
                  {mode === 'light' ? 'Bright surfaces, soft borders' : 'Low-glare dark surfaces'}
                </span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ---------- language ---------- */}
        <SectionCard
          icon={<Languages className="h-4.5 w-4.5" />}
          title={t('settings.language')}
          description={t('settings.languageDesc')}
        >
          <div className="flex flex-wrap gap-2.5">
            {(['en', 'ta'] as Locale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  updateSettings({ language: loc })
                  pushToast({
                    title: `${LOCALE_LABEL[loc]} selected`,
                    description:
                      loc === 'ta'
                        ? 'Tamil strings are applied where translated; remaining keys fall back to English.'
                        : 'Full English interface active.',
                    tone: 'success',
                  })
                }}
                aria-pressed={settings.language === loc}
                className={cn(
                  'rounded-lg border px-4 py-2.5 text-[13.5px] font-medium transition-all',
                  settings.language === loc
                    ? 'border-accent bg-brand-50/60 text-accent ring-1 ring-accent dark:bg-brand-500/10'
                    : 'border-line text-ink-muted hover:bg-panel-muted',
                )}
              >
                {LOCALE_LABEL[loc]}
              </button>
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-panel-muted px-3 py-2 text-[12px] leading-relaxed text-ink-subtle">
            Translations are resolved per key with automatic English fallback, so new languages
            can be added to <code className="text-accent">src/i18n</code> without touching any
            component.
          </p>
        </SectionCard>

        {/* ---------- notifications ---------- */}
        <SectionCard
          icon={<Bell className="h-4.5 w-4.5" />}
          title={t('settings.notifications')}
          description={t('settings.notificationsDesc')}
        >
          <div className="divide-y divide-line">
            <Switch label={t('settings.email')} description={t('settings.emailDesc')} checked={settings.notifications.email} onChange={(v) => saveNotif('email', v)} />
            <Switch label={t('settings.risk')} description={t('settings.riskDesc')} checked={settings.notifications.riskAlerts} onChange={(v) => saveNotif('riskAlerts', v)} />
            <Switch label={t('settings.assessment')} description={t('settings.assessmentDesc')} checked={settings.notifications.assessmentReminders} onChange={(v) => saveNotif('assessmentReminders', v)} />
            <Switch label={t('settings.recommendation')} description={t('settings.recommendationDesc')} checked={settings.notifications.recommendationUpdates} onChange={(v) => saveNotif('recommendationUpdates', v)} />
          </div>
        </SectionCard>

        {/* ---------- privacy ---------- */}
        <SectionCard
          icon={<ShieldCheck className="h-4.5 w-4.5" />}
          title={t('settings.privacy')}
          description={t('settings.privacyDesc')}
        >
          <div className="divide-y divide-line">
            <Switch label={t('settings.share')} description={t('settings.shareDesc')} checked={settings.privacy.shareAnonymisedData} onChange={(v) => savePrivacy('shareAnonymisedData', v)} />
            <Switch label={t('settings.teacherView')} description={t('settings.teacherViewDesc')} checked={settings.privacy.showRiskToTeachers} onChange={(v) => savePrivacy('showRiskToTeachers', v)} />
            <Switch label={t('settings.logging')} description={t('settings.loggingDesc')} checked={settings.privacy.activityLogging} onChange={(v) => savePrivacy('activityLogging', v)} />
          </div>
        </SectionCard>

        {/* ---------- account ---------- */}
        <SectionCard
          icon={<UserCog className="h-4.5 w-4.5" />}
          title={t('settings.account')}
          description={t('settings.accountDesc')}
          className="lg:col-span-2"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12px] text-ink-subtle">
                Signed in as <span className="font-medium text-ink-muted">{user?.email}</span> on the{' '}
                <span className="font-medium text-ink-muted">{ROLE_LABEL[role]}</span> workspace
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setPwOpen(true)}>
                  <KeyRound className="h-3.5 w-3.5" aria-hidden />
                  {t('settings.changePassword')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    logout()
                    pushToast({ title: 'Signed out', tone: 'info' })
                    navigate('/')
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden />
                  {t('settings.logout')}
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: <Monitor className="h-4 w-4" />, label: 'Active plan', value: 'Prototype' },
              { icon: <Palette className="h-4 w-4" />, label: 'Theme', value: theme === 'dark' ? t('settings.dark') : t('settings.light') },
              { icon: <Languages className="h-4 w-4" />, label: 'Locale', value: LOCALE_LABEL[settings.language] },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-line bg-panel-muted px-3.5 py-3">
                <div className="flex items-center gap-2 text-ink-faint">
                  {m.icon}
                  <span className="text-[11.5px] font-medium">{m.label}</span>
                </div>
                <p className="mt-1.5 text-[15px] font-semibold text-ink">{m.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <Modal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title={t('settings.changePassword')}
        description="Demo accounts use password123."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPwOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submitPassword}>{t('common.save')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            type="password"
            label="Current password"
            value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })}
            placeholder="password123"
          />
          <Input
            type="password"
            label="New password"
            value={pw.next}
            onChange={(e) => setPw({ ...pw, next: e.target.value })}
            placeholder="At least 8 characters"
          />
          <Input
            type="password"
            label="Confirm new password"
            value={pw.confirm}
            onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            error={pwError || undefined}
          />
        </div>
      </Modal>
    </div>
  )
}
