import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

/** EduSense AI wordmark — typography-led identity (EDU + SENSE). */
export function BrandMark({
  size = 'md',
  to = '/',
  className,
  onClick,
}: {
  size?: 'sm' | 'md' | 'lg'
  to?: string
  className?: string
  onClick?: () => void
}) {
  const sizes = {
    sm: { box: 'h-7 w-7 rounded-lg', icon: 'h-4 w-4', text: 'text-[15px]' },
    md: { box: 'h-8 w-8 rounded-lg', icon: 'h-4.5 w-4.5', text: 'text-[17px]' },
    lg: { box: 'h-10 w-10 rounded-xl', icon: 'h-5.5 w-5.5', text: 'text-[21px]' },
  }[size]

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90',
        className,
      )}
      aria-label="EduSense AI home"
    >
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm',
          sizes.box,
        )}
      >
        <svg viewBox="0 0 24 24" className={sizes.icon} aria-hidden>
          <path
            d="M4 16.5 9 11l3.5 3.5L20 6.5"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="6.5" r="2.4" fill="#c7d2fe" />
        </svg>
      </span>
      <span className={cn('font-bold leading-none tracking-tight text-ink', sizes.text)}>
        EduSense
        <span className="ml-1 rounded bg-brand-50 px-1.5 py-0.5 text-[0.62em] font-extrabold uppercase tracking-[0.12em] text-brand-700 align-middle dark:bg-brand-500/15 dark:text-brand-300">
          AI
        </span>
      </span>
    </Link>
  )
}

export function BrandTagline({ className }: { className?: string }) {
  return (
    <span className={cn('text-[12px] font-medium tracking-wide text-ink-subtle', className)}>
      Predict. Understand. Improve.
    </span>
  )
}
