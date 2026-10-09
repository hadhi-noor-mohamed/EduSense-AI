import { cn } from '../../utils/cn'

const TONES: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
}

export const AVATAR_TONE_KEYS = Object.keys(TONES)

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-24 w-24 text-2xl',
}

export function Avatar({
  name,
  tone = 'indigo',
  size = 'md',
  className,
}: {
  name: string
  tone?: string
  size?: keyof typeof SIZES
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-black/5',
        SIZES[size],
        TONES[tone] ?? TONES.indigo,
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}

export function AvatarGroup({
  people,
  max = 4,
  size = 'sm',
}: {
  people: { name: string; tone?: string }[]
  max?: number
  size?: keyof typeof SIZES
}) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((p) => (
        <Avatar
          key={p.name}
          name={p.name}
          tone={p.tone}
          size={size}
          className="ring-2 ring-panel dark:ring-[rgb(var(--bg-elevated))]"
        />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-panel-muted font-semibold text-ink-muted ring-2 ring-panel dark:ring-[rgb(var(--bg-elevated))]',
            SIZES[size],
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  )
}
