import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

const baseControl =
  'w-full rounded-lg border border-line bg-panel px-3.5 text-sm text-ink placeholder:text-ink-faint transition-colors ' +
  'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 disabled:bg-panel-muted'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, id, ...rest }, ref) => {
    const autoId = id ?? (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={autoId}
            className="mb-1.5 block text-[13px] font-medium text-ink"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={autoId}
            className={cn(
              baseControl,
              leftIcon && 'pl-9',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
              className,
            )}
            aria-invalid={!!error}
            {...rest}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-[12px] text-red-600 dark:text-red-400">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-[12px] text-ink-subtle">{hint}</p>
        ) : null}
      </div>
    )
  },
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  ({ className, label, id, ...rest }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink">
          {label}
        </label>
      )}
      <textarea ref={ref} id={id} className={cn(baseControl, 'min-h-[92px] py-2.5', className)} {...rest} />
    </div>
  ),
)
Textarea.displayName = 'Textarea'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, placeholder, id, ...rest }, ref) => {
    const autoId = id ?? (label ? `sel-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={autoId} className="mb-1.5 block text-[13px] font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={autoId}
            className={cn(baseControl, 'appearance-none pr-9', className)}
            {...rest}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            aria-hidden
          />
        </div>
      </div>
    )
  },
)
Select.displayName = 'Select'

export function Checkbox({
  label,
  checked,
  onChange,
  description,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  description?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-[rgb(var(--accent))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink">{label}</span>
        {description && <span className="block text-[12px] text-ink-subtle">{description}</span>}
      </span>
    </label>
  )
}

export function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-ink">{label}</div>
        {description && <div className="mt-0.5 text-[12px] text-ink-subtle">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
          checked ? 'bg-accent' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

export function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[13px] font-medium text-ink">{label}</span>
      {children}
    </div>
  )
}
