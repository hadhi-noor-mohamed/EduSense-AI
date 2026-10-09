import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  CreditCard,
  GraduationCap,
  School,
  Users,
} from 'lucide-react'
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  ChartCard,
  PageHeader,
  StatCard,
} from '../../components/ui'
import { CategoryBar, DonutChart, TrendChart } from '../../components/charts/ChartPrimitives'
import { MockBadge } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import { PLATFORM_SIGNUP_TREND, PLATFORM_USERS, PROGRAMS } from '../../data/seed'
import { CHART_COLORS } from '../../utils/format'
import {
  abbrName,
  avatarTone,
  formatNum,
  RoleBadge,
  StatGrid,
  StatusCell,
} from './components/AdminShared'

const PLAN_COLORS: Record<string, string> = {
  Starter: CHART_COLORS.cyan,
  Growth: CHART_COLORS.secondary,
  Enterprise: CHART_COLORS.primary,
}

export function DashboardPage() {
  const navigate = useNavigate()
  const institutions = useAppStore((s) => s.institutions)

  const totalStudents = useMemo(
    () => institutions.reduce((sum, i) => sum + i.students, 0),
    [institutions],
  )
  const activePlans = useMemo(
    () => institutions.filter((i) => i.status === 'Active').length,
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
  const performanceData = useMemo(
    () => institutions.map((i) => ({ name: abbrName(i.name, 15), performance: i.performance })),
    [institutions],
  )
  const trendMax = useMemo(
    () =>
      Math.max(
        100,
        ...PLATFORM_SIGNUP_TREND.map((p) => Math.max(p.signups, p.active)),
      ),
    [],
  )

  const activePrograms = PROGRAMS.filter((p) => p.status === 'Active').length
  const recentUsers = PLATFORM_USERS.slice(0, 6)

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Platform overview"
        subtitle="Tenants, users, programs and growth across the EduSense AI platform."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/admin/analytics')}>
              <GraduationCap className="h-4 w-4" aria-hidden />
              View analytics
            </Button>
            <Button onClick={() => navigate('/admin/institutions')}>
              <Building2 className="h-4 w-4" aria-hidden />
              Manage institutions
            </Button>
          </>
        }
      />

      <StatGrid cols={5}>
        <StatCard
          label="Institutions"
          value={institutions.length}
          icon={<Building2 className="h-4 w-4" aria-hidden />}
          hint={`${activePlans} active tenants on the platform`}
        />
        <StatCard
          label="Active plans"
          value={activePlans}
          tone="success"
          icon={<CreditCard className="h-4 w-4" aria-hidden />}
          hint="tenants with an active subscription"
        />
        <StatCard
          label="Platform users"
          value={PLATFORM_USERS.length}
          tone="info"
          icon={<Users className="h-4 w-4" aria-hidden />}
          hint="accounts across every tenant"
        />
        <StatCard
          label="Programs"
          value={PROGRAMS.length}
          tone="warning"
          icon={<GraduationCap className="h-4 w-4" aria-hidden />}
          hint={`${activePrograms} currently active`}
        />
        <StatCard
          label="Total students"
          value={formatNum(totalStudents)}
          icon={<School className="h-4 w-4" aria-hidden />}
          hint="enrolled across all tenants"
        />
      </StatGrid>

      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Platform growth"
          description="Monthly signups vs monthly active users"
          actions={<MockBadge compact />}
        >
          <TrendChart
            data={PLATFORM_SIGNUP_TREND}
            xKey="month"
            unit=""
            yDomain={[0, Math.ceil(trendMax / 100) * 100]}
            series={[
              { key: 'signups', name: 'Signups', color: CHART_COLORS.primary },
              { key: 'active', name: 'Active users', color: CHART_COLORS.success },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Plan distribution"
          description="Institutions by subscription tier"
          actions={<MockBadge compact />}
        >
          <DonutChart
            data={planMix}
            centerLabel={String(institutions.length)}
            centerSub="institutions"
          />
        </ChartCard>
      </div>

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

        <Card className="flex flex-col">
          <CardHeader
            title="Recently active users"
            description="Sample directory entries"
            actions={<MockBadge compact />}
          />
          <CardContent className="flex-1 pt-2">
            <ul>
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-start gap-3 border-b border-line py-3 last:border-0">
                  <Avatar name={u.name} tone={avatarTone(u.name)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-ink">{u.name}</span>
                      <RoleBadge role={u.role} />
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-ink-faint">{u.institution}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3">
                      <StatusCell status={u.status} />
                      <span className="text-[11.5px] text-ink-subtle">{u.lastActive}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="h-3.5 w-3.5" aria-hidden />
              View all users
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
