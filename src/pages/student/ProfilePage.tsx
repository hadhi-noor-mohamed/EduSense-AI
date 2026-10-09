import { useEffect, useState } from 'react'
import {
  GraduationCap,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Undo2,
  UserCog,
} from 'lucide-react'
import {
  Avatar,
  AVATAR_TONE_KEYS,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '../../components/ui'
import { DEPARTMENTS, YEARS } from '../../data/seed'
import { useAppStore } from '../../store/useAppStore'
import type { Profile } from '../../types'
import { cn } from '../../utils/cn'
import { DEMO_STUDENT } from './studentData'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+\-\s()]{7,15}$/
const BIO_MAX = 200

function validate(form: Profile): Record<string, string> {
  const errors: Record<string, string> = {}
  if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.'
  }
  if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = 'Enter a valid email address (e.g. name@example.com).'
  }
  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.'
  } else if (!PHONE_RE.test(form.phone.trim())) {
    errors.phone = 'Use 7–15 characters: digits, spaces, +, - and parentheses only.'
  }
  if (form.bio.length > BIO_MAX) {
    errors.bio = `Keep your bio under ${BIO_MAX} characters.`
  }
  return errors
}

export function ProfilePage() {
  const profile = useAppStore((s) => s.profile)
  const updateProfile = useAppStore((s) => s.updateProfile)
  const avatarTone = useAppStore((s) => s.avatarTone)
  const setAvatarTone = useAppStore((s) => s.setAvatarTone)
  const pushToast = useAppStore((s) => s.pushToast)

  const [form, setForm] = useState<Profile>(profile)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // keep the form in sync if the profile changes elsewhere (e.g. login)
  useEffect(() => {
    setForm(profile)
    setErrors({})
  }, [profile])

  const dirty = JSON.stringify(form) !== JSON.stringify(profile)

  const patch = (key: keyof Profile, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const save = () => {
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      pushToast({
        title: 'Fix the highlighted fields',
        description: 'Your changes have not been saved yet.',
        tone: 'error',
      })
      return
    }
    updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      department: form.department,
      year: form.year,
      bio: form.bio.trim(),
    })
    pushToast({
      title: 'Profile updated',
      description: 'Your personal details were saved to this browser.',
      tone: 'success',
    })
  }

  const discard = () => {
    setForm(profile)
    setErrors({})
    pushToast({ title: 'Changes discarded', description: 'Reverted to your saved profile.', tone: 'info' })
  }

  const pickTone = (tone: string) => {
    setAvatarTone(tone)
    pushToast({ title: 'Avatar colour updated', description: `Tone: ${tone}`, tone: 'success' })
  }

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Profile"
        subtitle="Your personal and academic details — changes save to this browser's demo store."
        actions={
          <>
            <Button variant="outline" onClick={discard} disabled={!dirty}>
              <Undo2 className="h-4 w-4" aria-hidden />
              Discard
            </Button>
            <Button onClick={save} disabled={!dirty}>
              <Save className="h-4 w-4" aria-hidden />
              Save changes
            </Button>
          </>
        }
      />

      {profile.name === '' ? (
        <EmptyState
          icon={<UserCog className="h-5 w-5" aria-hidden />}
          title="No profile data"
          description="Sign in with a demo account to load your profile."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* ---------------- personal details ---------------- */}
          <Card className="lg:col-span-2">
            <CardHeader
              icon={<UserCog className="h-4.5 w-4.5" aria-hidden />}
              title="Personal details"
              description="Name, contact information and a short bio for your teachers."
            />
            <CardContent className="space-y-4 pt-3">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  value={form.name}
                  onChange={(e) => patch('name', e.target.value)}
                  error={errors.name}
                  leftIcon={<UserCog className="h-4 w-4" aria-hidden />}
                  autoComplete="name"
                />
                <Input
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={(e) => patch('email', e.target.value)}
                  error={errors.email}
                  leftIcon={<Mail className="h-4 w-4" aria-hidden />}
                  autoComplete="email"
                />
                <Input
                  label="Phone number"
                  value={form.phone}
                  onChange={(e) => patch('phone', e.target.value)}
                  error={errors.phone}
                  leftIcon={<Phone className="h-4 w-4" aria-hidden />}
                  placeholder="+91 98400 12345"
                  autoComplete="tel"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Department"
                    options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                    value={form.department}
                    onChange={(e) => patch('department', e.target.value)}
                  />
                  <Select
                    label="Year"
                    options={YEARS.map((y) => ({ value: y, label: y }))}
                    value={form.year}
                    onChange={(e) => patch('year', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Textarea
                  label="Bio"
                  id="profile-bio"
                  value={form.bio}
                  onChange={(e) => patch('bio', e.target.value)}
                  placeholder="A short introduction shown to your teachers."
                  maxLength={BIO_MAX + 40}
                />
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      'text-[12px]',
                      errors.bio ? 'text-red-600 dark:text-red-400' : 'text-ink-subtle',
                    )}
                  >
                    {errors.bio ?? 'Shown on your student record.'}
                  </span>
                  <span
                    className={cn(
                      'text-[12px] tabular-nums',
                      form.bio.length > BIO_MAX
                        ? 'font-semibold text-red-600 dark:text-red-400'
                        : 'text-ink-faint',
                    )}
                  >
                    {form.bio.length}/{BIO_MAX}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-[12.5px] text-ink-subtle">
                  {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={discard} disabled={!dirty}>
                    <Undo2 className="h-4 w-4" aria-hidden />
                    Discard
                  </Button>
                  <Button onClick={save} disabled={!dirty}>
                    <Save className="h-4 w-4" aria-hidden />
                    Save changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            {/* ---------------- avatar ---------------- */}
            <Card>
              <CardHeader
                title="Avatar colour"
                description="Applies to your initials avatar everywhere."
              />
              <CardContent className="pt-3">
                <div className="flex items-center gap-4">
                  <Avatar name={form.name || 'Student'} tone={avatarTone} size="xl" />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-ink">
                      {form.name || 'Unnamed student'}
                    </p>
                    <p className="truncate text-[12.5px] text-ink-subtle">{form.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Avatar colour options">
                  {AVATAR_TONE_KEYS.map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      aria-pressed={avatarTone === tone}
                      aria-label={`Avatar colour ${tone}`}
                      onClick={() => pickTone(tone)}
                      className={cn(
                        'rounded-xl p-1.5 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                        avatarTone === tone
                          ? 'bg-accent/12 ring-2 ring-accent'
                          : 'hover:bg-panel-muted',
                      )}
                    >
                      <Avatar name={form.name || 'Student'} tone={tone} size="md" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ---------------- academic record ---------------- */}
            <Card>
              <CardHeader
                icon={<GraduationCap className="h-4.5 w-4.5" aria-hidden />}
                title="Academic record"
                description="Read-only details from your enrolment."
              />
              <CardContent className="space-y-2.5 pt-3">
                <dl className="space-y-2.5 text-[13px]">
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-panel-muted px-3 py-2">
                    <dt className="text-ink-subtle">Student ID</dt>
                    <dd className="font-medium text-ink">{DEMO_STUDENT.id}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-panel-muted px-3 py-2">
                    <dt className="text-ink-subtle">Roll number</dt>
                    <dd className="font-medium text-ink">{DEMO_STUDENT.rollNo}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-panel-muted px-3 py-2">
                    <dt className="text-ink-subtle">Course</dt>
                    <dd className="font-medium text-ink">{DEMO_STUDENT.course}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-panel-muted px-3 py-2">
                    <dt className="text-ink-subtle">Semester</dt>
                    <dd className="font-medium text-ink">{DEMO_STUDENT.semester}</dd>
                  </div>
                </dl>
                <div className="flex items-center gap-2 pt-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden />
                  <p className="text-[12px] text-ink-subtle">
                    Changes stay in this browser — demo data is never uploaded.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Badge tone="neutral" className="justify-center">
              Demo student account · {DEMO_STUDENT.risk} risk band
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
