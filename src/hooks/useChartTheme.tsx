import { useAppStore } from '../store/useAppStore'

export interface ChartTheme {
  dark: boolean
  grid: string
  axis: string
  tooltipBg: string
  tooltipBorder: string
  tooltipText: string
  mutedText: string
}

export function useChartTheme(): ChartTheme {
  const dark = useAppStore((s) => s.theme) === 'dark'
  return {
    dark,
    grid: dark ? 'rgba(148,163,184,0.14)' : 'rgba(100,116,139,0.18)',
    axis: dark ? '#7888a0' : '#64748b',
    tooltipBg: dark ? '#151b2c' : '#ffffff',
    tooltipBorder: dark ? 'rgba(39,48,70,1)' : 'rgba(226,232,240,1)',
    tooltipText: dark ? '#e2e8f0' : '#0f172a',
    mutedText: dark ? '#94a3b8' : '#64748b',
  }
}

export function ChartTooltipCard({
  active,
  payload,
  label,
  theme,
  unit = '%',
}: {
  active?: boolean
  payload?: { name?: string; value?: number | string; color?: string }[]
  label?: string | number
  theme: ChartTheme
  unit?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{ background: theme.tooltipBg, borderColor: theme.tooltipBorder }}
      className="rounded-lg border px-3 py-2 shadow-pop"
    >
      <div className="mb-1 text-[11px] font-semibold" style={{ color: theme.mutedText }}>
        {label}
      </div>
      <div className="space-y-0.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: p.color }}
              aria-hidden
            />
            <span style={{ color: theme.mutedText }}>{p.name}</span>
            <span className="ml-auto font-semibold" style={{ color: theme.tooltipText }}>
              {p.value}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
