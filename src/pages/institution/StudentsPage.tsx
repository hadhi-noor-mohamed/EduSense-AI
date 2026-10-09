import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck2,
  ExternalLink,
  Search,
  ShieldAlert,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Avatar,
  Button,
  DataTable,
  Input,
  NoResults,
  PageHeader,
  RiskBadge,
  SegmentedControl,
  Select,
  StatCard,
  type Column,
} from '../../components/ui'
import { toOptions } from '../../components/shared/FilterBar'
import { DEPARTMENTS, STUDENTS, YEARS } from '../../data/seed'
import type { Student } from '../../types'

const RISK_SELECT_OPTIONS = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
  { value: 'AtRisk', label: 'At risk (High + Medium)' },
]

export function StudentsPage() {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [riskSelect, setRiskSelect] = useState('')
  const [riskLevel, setRiskLevel] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return STUDENTS.filter((s) => {
      if (department && s.department !== department) return false
      if (year && s.year !== year) return false
      if (riskSelect === 'AtRisk' && s.risk === 'Low') return false
      if (riskSelect !== '' && riskSelect !== 'AtRisk' && s.risk !== riskSelect) return false
      if (riskLevel !== 'all' && s.risk !== riskLevel) return false
      if (q && !`${s.name} ${s.rollNo} ${s.email}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, department, year, riskSelect, riskLevel])

  const stats = useMemo(() => {
    const total = filtered.length
    const high = filtered.filter((s) => s.risk === 'High').length
    const avgAttendance = total
      ? Math.round(filtered.reduce((a, s) => a + s.attendance, 0) / total)
      : 0
    const avgPerformance = total
      ? Math.round(filtered.reduce((a, s) => a + s.overallPerformance, 0) / total)
      : 0
    return { total, high, avgAttendance, avgPerformance }
  }, [filtered])

  const anyActive = Boolean(query || department || year || riskSelect || riskLevel !== 'all')

  const clearAll = () => {
    setQuery('')
    setDepartment('')
    setYear('')
    setRiskSelect('')
    setRiskLevel('all')
  }

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Student',
      sortValue: (s) => s.name,
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar name={s.name} tone={s.avatar} size="sm" />
          <div className="min-w-0">
            <Link
              to={`/teacher/students/${s.id}`}
              className="block w-max max-w-full truncate text-[13.5px] font-semibold text-ink transition-colors hover:text-accent"
            >
              {s.name}
            </Link>
            <span className="block text-[11.5px] text-ink-subtle">{s.rollNo}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortValue: (s) => s.department,
      render: (s) => <span className="text-[13px] text-ink-muted">{s.department}</span>,
    },
    {
      key: 'year',
      header: 'Year',
      sortValue: (s) => s.year,
      render: (s) => <span className="text-[13px] text-ink-muted">{s.year}</span>,
    },
    {
      key: 'attendance',
      header: 'Attendance',
      align: 'right',
      sortValue: (s) => s.attendance,
      render: (s) => (
        <span className="text-[13px] font-medium tabular-nums text-ink">{s.attendance}%</span>
      ),
    },
    {
      key: 'overall',
      header: 'Overall',
      align: 'right',
      sortValue: (s) => s.overallPerformance,
      render: (s) => (
        <span className="text-[13px] font-medium tabular-nums text-ink">{s.overallPerformance}%</span>
      ),
    },
    {
      key: 'risk',
      header: 'Risk score',
      align: 'right',
      sortValue: (s) => s.riskScore,
      render: (s) => <RiskBadge level={s.risk} score={s.riskScore} size="sm" />,
    },
    {
      key: 'factor',
      header: 'Top factor',
      render: (s) => <span className="text-[13px] text-ink-muted">{s.topFactor}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <Link
          to={`/teacher/students/${s.id}`}
          aria-label={`View ${s.name}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-accent transition-colors hover:bg-panel-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          View <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ),
    },
  ]

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Students"
        subtitle="Browse the full cohort, combine filters and sort by any column. Demo prediction data is marked as such."
      />

      {/* ---------- filters ---------- */}
      <div className="rounded-2xl border border-line bg-panel p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Search students"
            placeholder="Name, roll number or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" aria-hidden />}
          />
          <Select
            label="Department"
            placeholder="All departments"
            options={toOptions(DEPARTMENTS)}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <Select
            label="Year"
            placeholder="All years"
            options={toOptions(YEARS)}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <Select
            label="Risk (select)"
            placeholder="All risk levels"
            options={RISK_SELECT_OPTIONS}
            value={riskSelect}
            onChange={(e) => setRiskSelect(e.target.value)}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-ink">Risk level</span>
            <SegmentedControl
              options={[
                { value: 'all', label: 'All' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
              value={riskLevel}
              onChange={setRiskLevel}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12.5px] tabular-nums text-ink-subtle">
              {filtered.length} of {STUDENTS.length} students
            </span>
            <Button variant="outline" size="sm" onClick={clearAll} disabled={!anyActive}>
              Clear filters
            </Button>
          </div>
        </div>
      </div>

      {/* ---------- aggregate stats from the filtered set ---------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Students"
          value={stats.total}
          icon={<Users className="h-4 w-4" aria-hidden />}
          tone="brand"
          hint="in the current filtered set"
        />
        <StatCard
          label="High risk"
          value={stats.high}
          icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
          tone="danger"
          hint="flagged by the mock prediction service"
        />
        <StatCard
          label="Avg attendance"
          value={stats.avgAttendance}
          unit="%"
          icon={<CalendarCheck2 className="h-4 w-4" aria-hidden />}
          tone="info"
        />
        <StatCard
          label="Avg performance"
          value={stats.avgPerformance}
          unit="%"
          icon={<TrendingUp className="h-4 w-4" aria-hidden />}
          tone="success"
        />
      </div>

      {/* ---------- table ---------- */}
      {filtered.length === 0 ? (
        <NoResults term={query.trim() || undefined} onClear={clearAll} />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowId={(s) => s.id}
          pageSize={Math.max(1, filtered.length)}
          dense
        />
      )}
    </div>
  )
}