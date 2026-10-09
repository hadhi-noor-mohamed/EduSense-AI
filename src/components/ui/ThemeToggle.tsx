import { Moon, Sun } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { cn } from '../../utils/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useAppStore((s) => s.theme)
  const toggle = useAppStore((s) => s.toggleTheme)
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors',
        'hover:bg-panel-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      )}
    >
      <Sun
        className={cn(
          'h-4.5 w-4.5 transition-all duration-300',
          dark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          'absolute h-4.5 w-4.5 transition-all duration-300',
          dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0',
        )}
        aria-hidden
      />
    </button>
  )
}
