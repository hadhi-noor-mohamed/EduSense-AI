import { useEffect, useState } from 'react'
import type { RiskLevel } from '../../types'
import { cn } from '../../utils/cn'

const COLORS: Record<RiskLevel, string> = {
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#ef4444',
}

/**
 * Radial risk score indicator.
 * Deterministic SVG arc — no chart library required, fully theme aware.
 */
export function RiskGauge({
  score,
  level,
  size = 190,
  label = 'Risk Score',
  sublabel,
  className,
}: {
  score: number
  level: RiskLevel
  size?: number
  label?: string
  sublabel?: string
  className?: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 80)
    return () => window.clearTimeout(t)
  }, [])

  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = Math.PI * radius // half circle
  const value = mounted ? Math.max(0, Math.min(100, score)) : 0
  const offset = circumference - (value / 100) * circumference
  const color = COLORS[level]
  const cy = size / 2

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size / 2 + 42 }}>
        <svg width={size} height={size / 2 + 8} role="img" aria-label={`${label}: ${score} out of 100`}>
          <path
            d={`M ${stroke / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${cy}`}
            fill="none"
            className="stroke-panel-muted"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d={`M ${stroke / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>

        <div className="absolute inset-x-0 top-[34%] flex flex-col items-center">
          <span className="text-[38px] font-extrabold leading-none tracking-tight text-ink">
            {Math.round(value)}
            <span className="text-lg font-bold text-ink-subtle">%</span>
          </span>
          <span
            className="mt-1.5 text-[12px] font-bold uppercase tracking-[0.14em]"
            style={{ color }}
          >
            {level} Risk
          </span>
        </div>
      </div>

      <div className="mt-1 text-center">
        <div className="text-[12.5px] font-medium text-ink-muted">{label}</div>
        {sublabel && <div className="mt-0.5 text-[11.5px] text-ink-faint">{sublabel}</div>}
      </div>
    </div>
  )
}
