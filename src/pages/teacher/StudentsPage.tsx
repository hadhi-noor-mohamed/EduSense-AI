import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ExternalLink,
  Search,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
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
import { MockBadge } from '../../components/shared/MockBadge'
import { toOptions } from '../../components/shared/FilterBar'
import { DEPARTMENTS, STUDENTS, YEARS } from '../../data/seed'
import type { Student } from '../../types'
import { riskCounts } from './teacherHelpers'

const RISK_SELECT_OPTIONS = [
  { value: 'AtRisk', label: 'At risk (High + Medium)' },
  { value: 'High', label: 'High risk' },
  { value: 'Medium', label: 'Medium risk' },
  { value: 'Low', label: 'Low risk' },
]

export function StudentsPage() {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [riskSelect, setRiskSelect] = useState('')
  const [riskLevel, setRiskLevel] = useState('all')

  const filtered = STUDENTS.filter((s) => {
    const q = query.trim().toLowerCase()
    if (q && !`${s.name} ${s.rollNo} ${s.email}`.toLowerCase().includes(q)) return false
    if (department && s.department !== department) return false
    if (year && s.year !== year) return false
    if (riskSelect === 'AtRisk' && s.risk === 'Low') return false
    if (riskSelect !== '' && riskSelect !== 'AtRisk' && s.risk !== riskSelect) return false
    if (riskLevel !== 'all' && s.risk !== riskLevel) return false
    return true
  })

  const counts = riskCounts(filtered)
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
            <span className="block w-max max-w-[180px] truncate text-[13.5px] font-semibold text-ink">
              {s.name}
            </span>
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
      key: 'attendance',
      header: 'Attendance',
      align: 'right',
      sortValue: (s) => s.attendance,
      render: (s) => (
        <span
          className={
            s.attendance < 70
              ? 'text-[13px] font-semibold tabular-nums text-red-600 dark:text-red-400'
              : 'text-[13px] font-medium tabular-nums text-ink'
          }
        >
          {s.attendance}%
        </span>
      ),
    },
    {
      key: 'overall',
      header: 'Overall',
      align: 'right',
      sortValue: (s) => s.overallPerformance,
      render: (s) => (
        <span className="text-[13px] font-medium tabular-nums text-ink">
          {s.overallPerformance}%
        </span>
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
          aria-label={`Open ${s.name}`}
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
        subtitle="Search, filter and sort the full cohort. Every filter below combines with the others, and counts update from the filtered set."
        actions={<MockBadge compact />}
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
            label="Risk level (select)"
            placeholder="Any risk level"
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

      {/* ---------- stats derived from the filtered set ---------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Students"
          value={filtered.length}
          icon={<Users className="h-4 w-4" aria-hidden />}
          tone="brand"
          hint="in the current filtered set"
        />
        <StatCard
          label="High risk"
          value={counts.High}
          icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
          tone="danger"
          hint="mock prediction output"
        />
        <StatCard
          label="Medium risk"
          value={counts.Medium}
          icon={<TriangleAlert className="h-4 w-4" aria-hidden />}
          tone="warning"
          hint="watch list"
        />
        <StatCard
          label="Low risk"
          value={counts.Low}
          icon={<ShieldCheck className="h-4 w-4" aria-hidden />}
          tone="success"
          hint="within healthy benchmarks"
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
