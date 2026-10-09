import { ReportView, type ReportBlock } from '../../components/shared/ReportView'
import { useAppStore } from '../../store/useAppStore'
import {
  PLATFORM_SIGNUP_TREND,
  PLATFORM_USERS,
  PROGRAMS,
} from '../../data/seed'
import { formatDate } from '../../utils/format'
import { formatNum } from './components/AdminShared'

function countBy(values: string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const v of values) out[v] = (out[v] ?? 0) + 1
  return out
}

function namesOf(items: { name: string }[]): string {
  return items.map((i) => i.name).join(', ')
}

export function ReportsPage() {
  const institutions = useAppStore((s) => s.institutions)

  const activePlans = institutions.filter((i) => i.status === 'Active').length
  const inactiveTenants = institutions.filter((i) => i.status === 'Inactive')
  const lowPerformance = institutions.filter((i) => i.performance < 70)
  const totalStudents = institutions.reduce((sum, i) => sum + i.students, 0)
  const totalDepartments = institutions.reduce((sum, i) => sum + i.departments, 0)
  const cityCount = new Set(institutions.map((i) => i.city)).size

  const activePrograms = PROGRAMS.filter((p) => p.status === 'Active')
  const inactivePrograms = PROGRAMS.filter((p) => p.status === 'Inactive')

  const roleCounts = countBy(PLATFORM_USERS.map((u) => u.role))
  const activeUsers = PLATFORM_USERS.filter((u) => u.status === 'Active').length
  const suspendedUsers = PLATFORM_USERS.filter((u) => u.status === 'Suspended').length
  const institutionCounts = countBy(PLATFORM_USERS.map((u) => u.institution))
  const busiestTenant = Object.entries(institutionCounts).sort((a, b) => b[1] - a[1])[0]

  const latest = PLATFORM_SIGNUP_TREND[PLATFORM_SIGNUP_TREND.length - 1]

  const meta = [
    { label: 'Institutions', value: String(institutions.length) },
    { label: 'Programs', value: String(PROGRAMS.length) },
    { label: 'Platform users', value: String(PLATFORM_USERS.length) },
    { label: 'Active plans', value: String(activePlans) },
    { label: 'Generated', value: formatDate(new Date().toISOString()) },
  ]

  const blocks: ReportBlock[] = [
    {
      title: 'Platform overview',
      content: (
        <div className="space-y-2">
          <p>
            EduSense AI serves {institutions.length} institutions across {cityCount} cities, with{' '}
            {formatNum(totalStudents)} enrolled students and {PLATFORM_USERS.length} registered
            users.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              {activePlans} active tenants and {inactiveTenants.length} inactive tenants
            </li>
            <li>
              {PROGRAMS.length} programs ({activePrograms.length} active,{' '}
              {inactivePrograms.length} inactive)
            </li>
            <li>
              {formatNum(totalStudents)} students across {totalDepartments} departments
            </li>
            {latest && (
              <li>
                Latest cycle ({latest.month}): {latest.signups} signups and {latest.active} active
                users
              </li>
            )}
          </ul>
        </div>
      ),
    },
    {
      title: 'Institution directory',
      content: (
        <ul className="space-y-1.5">
          {institutions.map((i) => (
            <li key={i.id}>
              <span className="font-semibold text-ink">{i.name}</span> ({i.code}) — {i.city} ·{' '}
              {formatNum(i.students)} students · {i.departments} departments · {i.plan} plan ·{' '}
              {i.status} · performance {i.performance}%
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Program portfolio',
      content: (
        <ul className="space-y-1.5">
          {PROGRAMS.map((p) => (
            <li key={p.id}>
              <span className="font-semibold text-ink">{p.name}</span> — {p.level} · {p.duration}{' '}
              · {formatNum(p.students)} students · offered by {p.institutions} institutions ·{' '}
              {p.status}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'User composition',
      content: (
        <div className="space-y-2">
          <p>By role: {Object.entries(roleCounts).map(([role, n]) => `${role} — ${n}`).join(' · ')}</p>
          <p>
            By status: {activeUsers} active, {suspendedUsers} suspended.
          </p>
          {busiestTenant && (
            <p>
              {busiestTenant[0]} accounts for {busiestTenant[1]} of {PLATFORM_USERS.length}{' '}
              directory entries.
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Recommended platform actions',
      content: (
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            {inactiveTenants.length > 0
              ? `Re-engage ${inactiveTenants.length} inactive tenant${inactiveTenants.length === 1 ? '' : 's'} (${namesOf(inactiveTenants)}) — confirm billing status and reactivation dates.`
              : 'Every tenant is active — keep the renewal calendar current.'}
          </li>
          <li>
            {lowPerformance.length > 0
              ? `Schedule adoption reviews with ${lowPerformance.length} institution${lowPerformance.length === 1 ? '' : 's'} scoring below 70 (${namesOf(lowPerformance)}).`
              : 'No institution scores below 70 — continue the current success programme.'}
          </li>
          <li>
            {inactivePrograms.length > 0
              ? `Review ${inactivePrograms.length} inactive program${inactivePrograms.length === 1 ? '' : 's'} (${namesOf(inactivePrograms)}) — decide whether to retire or relist them.`
              : 'All programs are active — monitor enrollment each quarter.'}
          </li>
          <li>
            {suspendedUsers > 0
              ? `Audit ${suspendedUsers} suspended user account${suspendedUsers === 1 ? '' : 's'} before the next reporting cycle.`
              : 'No suspended accounts require action this cycle.'}
          </li>
          <li>
            Publish the monthly platform digest so tenant admins see signups, active users and
            program demand in one place.
          </li>
        </ul>
      ),
    },
  ]

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <ReportView
        title="Platform & Tenant Report"
        subtitle="Platform-wide snapshot of tenants, programs, users and recommended actions for the organization team."
        audience="Organization"
        meta={meta}
        blocks={blocks}
      />
    </div>
  )
}
