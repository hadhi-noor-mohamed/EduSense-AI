import type { ReactNode } from 'react'
import { AVATAR_TONE_KEYS, Badge, StatusDot } from '../../../components/ui'
import type { Institution } from '../../../types'
import { hash } from '../../../utils/format'
import { cn } from '../../../utils/cn'

const NF = new Intl.NumberFormat('en-IN')

/** Indian-locale grouping used for every large number on the admin pages. */
export function formatNum(value: number): string {
  return NF.format(value)
}

/** Shortens long institution / program names so chart axes stay readable. */
export function abbrName(name: string, max = 16): string {
  if (name.length <= max) return name
  const words = name.split(' ')
  let out = ''
  for (const w of words) {
    const next = out ? `${out} ${w}` : w
    if (next.length > max) break
    out = next
  }
  return out.length > 3 ? `${out}…` : `${name.slice(0, max - 1)}…`
}

export const PLAN_TONE: Record<Institution['plan'], 'brand' | 'info' | 'neutral'> = {
  Starter: 'neutral',
  Growth: 'info',
  Enterprise: 'brand',
}

export function PlanBadge({ plan }: { plan: Institution['plan'] }) {
  return <Badge tone={PLAN_TONE[plan]}>{plan}</Badge>
}

const ROLE_TONE: Record<string, 'brand' | 'info' | 'success' | 'warning'> = {
  Student: 'info',
  Teacher: 'success',
  'Institution Admin': 'warning',
  'Organization Admin': 'brand',
}

export function RoleBadge({ role }: { role: string }) {
  return <Badge tone={ROLE_TONE[role] ?? 'default'}>{role}</Badge>
}

/** Status pill used in every admin table: coloured dot + label. */
export function StatusCell({ status }: { status: string }) {
  const tone =
    status === 'Active'
      ? 'green'
      : status === 'Inactive' || status === 'Suspended'
        ? 'red'
        : 'slate'
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-ink-muted">
      <StatusDot tone={tone} />
      {status}
    </span>
  )
}

/** Deterministic avatar colour so a demo user keeps the same tone everywhere. */
export function avatarTone(seed: string): string {
  return AVATAR_TONE_KEYS[hash(seed) % AVATAR_TONE_KEYS.length] ?? 'indigo'
}

/** Responsive stat row — collapses to 2 columns on phones. */
export function StatGrid({
  children,
  cols = 4,
}: {
  children: ReactNode
  cols?: 4 | 5
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4',
        cols === 5 ? 'sm:grid-cols-3 xl:grid-cols-5' : 'sm:grid-cols-2 xl:grid-cols-4',
      )}
    >
      {children}
    </div>
  )
}
