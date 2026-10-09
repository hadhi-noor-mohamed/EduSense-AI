import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartTheme, ChartTooltipCard } from '../../hooks/useChartTheme'

export interface SeriesDef {
  key: string
  name: string
  color: string
}

/** Responsive multi-series line / area chart. */
export function TrendChart({
  data,
  xKey,
  series,
  height = 260,
  area = false,
  yDomain,
  unit = '%',
}: {
  data: Record<string, string | number>[]
  xKey: string
  series: SeriesDef[]
  height?: number
  area?: boolean
  yDomain?: [number, number]
  unit?: string
}) {
  const theme = useChartTheme()
  const Chart = area ? AreaChart : LineChart

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: theme.axis, fontSize: 11 }}
            axisLine={{ stroke: theme.grid }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            tick={{ fill: theme.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={yDomain ?? [0, 100]}
            width={44}
          />
          <Tooltip
            cursor={{ stroke: theme.grid }}
            content={<ChartTooltipCard theme={theme} unit={unit} />}
          />
          {series.length > 3 && (
            <Legend
              wrapperStyle={{ fontSize: 11.5, color: theme.axis, paddingTop: 6 }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => String(value)}
            />
          )}
          {series.map((s) =>
            area ? (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2.2}
                fill={s.color}
                fillOpacity={0.1}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                animationDuration={750}
              />
            ) : (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                animationDuration={750}
              />
            ),
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}

/** Grouped or stacked vertical bars. */
export function CategoryBar({
  data,
  xKey,
  bars,
  height = 260,
  stacked = false,
  horizontal = false,
  unit = '%',
}: {
  data: Record<string, string | number>[]
  xKey: string
  bars: SeriesDef[]
  height?: number
  stacked?: boolean
  horizontal?: boolean
  unit?: string
}) {
  const theme = useChartTheme()

  if (horizontal) {
    return (
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 0 }}>
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: theme.axis, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fill: theme.axis, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <Tooltip
              cursor={{ fill: theme.dark ? 'rgba(148,163,184,0.08)' : 'rgba(100,116,139,0.08)' }}
              content={<ChartTooltipCard theme={theme} unit={unit} />}
            />
            {bars.map((b) => (
              <Bar
                key={b.key}
                dataKey={b.key}
                name={b.name}
                fill={b.color}
                radius={[0, 6, 6, 0]}
                barSize={14}
                animationDuration={750}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: theme.axis, fontSize: 11 }}
            axisLine={{ stroke: theme.grid }}
            tickLine={false}
            interval={0}
            angle={horizontal ? -20 : 0}
            height={44}
          />
          <YAxis
            tick={{ fill: theme.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            cursor={{ fill: theme.dark ? 'rgba(148,163,184,0.08)' : 'rgba(100,116,139,0.08)' }}
            content={<ChartTooltipCard theme={theme} unit={unit} />}
          />
          {bars.length > 1 && (
            <Legend wrapperStyle={{ fontSize: 11.5, color: theme.axis, paddingTop: 6 }} iconType="circle" iconSize={8} />
          )}
          {bars.map((b) => (
            <Bar
              key={b.key}
              dataKey={b.key}
              name={b.name}
              fill={b.color}
              stackId={stacked ? 'stack' : undefined}
              radius={stacked ? 0 : [5, 5, 0, 0]}
              animationDuration={750}
              maxBarSize={44}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Donut / pie distribution with a centred total. */
export function DonutChart({
  data,
  height = 230,
  centerLabel,
  centerSub,
}: {
  data: { name: string; value: number; color: string }[]
  height?: number
  centerLabel?: string
  centerSub?: string
}) {
  const theme = useChartTheme()

  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="90%"
            paddingAngle={2}
            stroke={theme.tooltipBg}
            strokeWidth={2}
            animationDuration={800}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipCard theme={theme} unit="" />} />
          <Legend wrapperStyle={{ fontSize: 11.5, color: theme.axis }} iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="pointer-events-none absolute inset-x-0 top-[38%] text-center">
          <div className="text-2xl font-bold leading-none text-ink">{centerLabel}</div>
          {centerSub && <div className="mt-1 text-[11.5px] text-ink-subtle">{centerSub}</div>}
        </div>
      )}
    </div>
  )
}

export interface ScatterPoint {
  x: number
  y: number
  name: string
  risk: string
}

/** Attendance vs performance bubble/dot plot, coloured by risk. */
export function RiskScatter({
  points,
  height = 300,
  xLabel = 'Attendance',
  yLabel = 'Performance',
}: {
  points: ScatterPoint[]
  height?: number
  xLabel?: string
  yLabel?: string
}) {
  const theme = useChartTheme()
  const colorFor = (risk: string) =>
    risk === 'High' ? '#ef4444' : risk === 'Medium' ? '#f59e0b' : '#22c55e'

  const grouped = ['High', 'Medium', 'Low'].map((risk) => ({
    risk,
    color: colorFor(risk),
    data: points.filter((p) => p.risk === risk),
  }))

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, left: -14, bottom: 4 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            tick={{ fill: theme.axis, fontSize: 11 }}
            axisLine={{ stroke: theme.grid }}
            tickLine={false}
            domain={[40, 100]}
            label={{ value: xLabel, position: 'insideBottomRight', offset: -4, fill: theme.axis, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            tick={{ fill: theme.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[30, 100]}
            width={44}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3', stroke: theme.grid }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0]?.payload as ScatterPoint | undefined
              if (!p) return null
              return (
                <div
                  style={{ background: theme.tooltipBg, borderColor: theme.tooltipBorder }}
                  className="rounded-lg border px-3 py-2 shadow-pop"
                >
                  <div className="text-[12.5px] font-semibold" style={{ color: theme.tooltipText }}>
                    {p.name}
                  </div>
                  <div className="mt-0.5 text-[11.5px]" style={{ color: theme.mutedText }}>
                    {xLabel}: {p.x}% · {yLabel}: {p.y}%
                  </div>
                  <div className="text-[11.5px]" style={{ color: theme.mutedText }}>
                    Risk: {p.risk}
                  </div>
                </div>
              )
            }}
          />
          {grouped.map((g) => (
            <Scatter
              key={g.risk}
              name={g.risk}
              data={g.data}
              fill={g.color}
              fillOpacity={0.85}
              shape="circle"
              animationDuration={700}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
