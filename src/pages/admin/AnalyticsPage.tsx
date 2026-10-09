import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  Building2,
  GraduationCap,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, ChartCard, PageHeader, Tabs } from '../../components/ui'
import { CategoryBar, DonutChart, TrendChart } from '../../components/charts/ChartPrimitives'
import { MockBadge } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import {
  DROPOUT_RISK_TREND,
  PLATFORM_SIGNUP_TREND,
  PROGRAMS,
} from '../../data/seed'
import { CHART_COLORS } from '../../utils/format'
import { abbrName, formatNum } from './components/AdminShared'

interface Insight {
  icon: ReactNode
  title: string
  body: string
}

const TABS = [
  { value: 'growth', label: 'Growth', icon: <TrendingUp className="h-3.5 w-3.5" aria-hidden /> },
  {
    value: 'institutions',
    label: 'Institutions',
    icon: <Building2 className="h-3.5 w-3.5" aria-hidden />,
  },
  {
    value: 'programs',
    label: 'Programs',
    icon: <GraduationCap className="h-3.5 w-3.5" aria-hidden />,
  },
  { value: 'risk', label: 'Risk', icon: <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> },
]

const PLAN_COLORS: Record<string, string> = {
  Starter: CHART_COLORS.cyan,
  Growth: CHART_COLORS.secondary,
  Enterprise: CHART_COLORS.primary,
}

export function AnalyticsPage() {
  const institutions = useAppStore((s) => s.institutions)
  const [tab, setTab] = useState('growth')

  const growthMax = useMemo(
    () => Math.max(100, ...PLATFORM_SIGNUP_TREND.map((p) => Math.max(p.signups, p.active))),
    [],
  )
  const riskMax = useMemo(
    () => Math.max(10, ...DROPOUT_RISK_TREND.map((p) => Math.max(p.flagged, p.intervened))),
    [],
  )

  const performanceData = useMemo(
    () => institutions.map((i) => ({ name: abbrName(i.name, 15), performance: i.performance })),
    [institutions],
  )

  const planMix = useMemo(
    () =>
      (['Starter', 'Growth', 'Enterprise'] as const).map((plan) => ({
        name: plan,
        value: institutions.filter((i) => i.plan === plan).length,
        color: PLAN_COLORS[plan],
      })),
    [institutions],
  )

  const programData = useMemo(
    () =>
      PROGRAMS.map((p) => ({
        name: abbrName(p.name, 15),
        Undergraduate: p.level === 'Undergraduate' ? p.students : 0,
        Postgraduate: p.level === 'Postgraduate' ? p.students : 0,
      })),
    [],
  )

  const insights = useMemo<Insight[]>(() => {
    const first = PLATFORM_SIGNUP_TREND[0]
    const last = PLATFORM_SIGNUP_TREND[PLATFORM_SIGNUP_TREND.length - 1]
    const growthPct =
      first && last && first.signups > 0
        ? Math.round(((last.signups - first.signups) / first.signups) * 100)
        : 0
    const enterprise = institutions.filter((i) => i.plan === 'Enterprise').length
    const enterpriseShare = Math.round((enterprise / Math.max(1, institutions.length)) * 100)
    const topProgram = PROGRAMS.reduce((best, p) => (p.students > best.students ? p : best))
    const belowSeventy = institutions.filter((i) => i.performance < 70).length

    return [
      {
        icon: <TrendingUp className="h-4 w-4" aria-hidden />,
        title: `Signups grew ${growthPct}%`,
        body: `Monthly signups moved from ${first?.signups ?? 0} in ${first?.month ?? '—'} to ${
          last?.signups ?? 0
        } in ${last?.month ?? '—'} according to the demo platform log.`,
      },
      {
        icon: <Building2 className="h-4 w-4" aria-hidden />,
        title: `${enterpriseShare}% on Enterprise`,
        body: `${enterprise} of ${institutions.length} institutions run the Enterprise plan; the rest are on Growth or Starter.`,
      },
      {
        icon: <GraduationCap className="h-4 w-4" aria-hidden />,
        title: `${abbrName(topProgram.name, 26)} leads`,
        body: `${formatNum(topProgram.students)} students across ${topProgram.institutions} institutions — the largest program in the portfolio.`,
      },
      {
        icon: <AlertTriangle className="h-4 w-4" aria-hidden />,
        title: `${belowSeventy} below 70 performance`,
        body:
          belowSeventy > 0
            ? `${belowSeventy} institutions score under 70. Schedule an onboarding and adoption review with each tenant.`
            : 'Every institution scores 70 or above — keep up the adoption work.',
      },
    ]
  }, [institutions])

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Platform analytics"
        subtitle="Growth, tenant health, program demand and retention signals across the platform."
        actions={<MockBadge />}
      />

      <div className="overflow-x-auto pb-1">
        <Tabs items={TABS} value={tab} onChange={setTab} />
      </div>

      <div key={tab} className="animate-fade-in space-y-5">
        {tab === 'growth' && (
          <ChartCard
            title="Platform growth"
            description="Signups vs monthly active users"
            actions={<MockBadge compact />}
          >
            <TrendChart
              data={PLATFORM_SIGNUP_TREND}
              xKey="month"
              height={300}
              unit=""
              yDomain={[0, Math.ceil(growthMax / 100) * 100]}
              series={[
                { key: 'signups', name: 'Signups', color: CHART_COLORS.primary },
                { key: 'active', name: 'Active users', color: CHART_COLORS.success },
              ]}
            />
          </ChartCard>
        )}

        {tab === 'institutions' && (
          <div className="grid gap-5 lg:grid-cols-3">
            <ChartCard
              className="lg:col-span-2"
              title="Institution performance"
              description="Composite performance score per tenant"
              actions={<MockBadge compact />}
            >
              <CategoryBar
                horizontal
                data={performanceData}
                xKey="name"
                bars={[{ key: 'performance', name: 'Performance', color: CHART_COLORS.primary }]}
              />
            </ChartCard>
            <ChartCard
              title="Plan mix"
              description="Institutions per subscription tier"
              actions={<MockBadge compact />}
            >
              <DonutChart
                data={planMix}
                centerLabel={String(institutions.length)}
                centerSub="institutions"
              />
            </ChartCard>
          </div>
        )}

        {tab === 'programs' && (
          <ChartCard
            title="Enrollment by program"
            description="Students per program, split by study level"
            actions={<MockBadge compact />}
          >
            <CategoryBar
              horizontal
              stacked
              height={300}
              data={programData}
              xKey="name"
              unit=""
              bars={[
                {
                  key: 'Undergraduate',
                  name: 'Undergraduate',
                  color: CHART_COLORS.secondary,
                },
                { key: 'Postgraduate', name: 'Postgraduate', color: CHART_COLORS.purple },
              ]}
            />
          </ChartCard>
        )}

        {tab === 'risk' && (
          <ChartCard
            title="Dropout risk vs intervention"
            description="Students flagged by the demo risk service vs. students receiving an intervention"
            actions={<MockBadge compact />}
          >
            <TrendChart
              data={DROPOUT_RISK_TREND}
              xKey="month"
              height={300}
              unit=""
              yDomain={[0, Math.ceil(riskMax / 5) * 5]}
              series={[
                { key: 'flagged', name: 'Flagged', color: CHART_COLORS.danger },
                { key: 'intervened', name: 'Intervened', color: CHART_COLORS.success },
              ]}
            />
          </ChartCard>
        )}
      </div>

      <Card>
        <CardHeader
          title="Key insights"
          description="Computed directly from the demo dataset"
          actions={<MockBadge compact />}
        />
        <CardContent className="pt-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map((ins) => (
              <div
                key={ins.title}
                className="rounded-xl border border-line bg-panel-muted p-4"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel text-accent">
                    {ins.icon}
                  </span>
                  <p className="text-[13.5px] font-semibold text-ink">{ins.title}</p>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{ins.body}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
