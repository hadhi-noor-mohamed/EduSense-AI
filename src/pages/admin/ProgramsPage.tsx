import { useMemo, useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Input,
  Modal,
  NoResults,
  PageHeader,
  Select,
  StatCard,
} from '../../components/ui'
import { MockBadge } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import { PROGRAMS } from '../../data/seed'
import { formatDate } from '../../utils/format'
import { formatNum, PlanBadge, StatGrid, StatusCell } from './components/AdminShared'

type ProgramStatus = 'Active' | 'Inactive'
type ProgramSeed = (typeof PROGRAMS)[number]
type ProgramRow = Omit<ProgramSeed, 'status'> & { status: ProgramStatus }

const LEVEL_OPTIONS = [
  { value: 'Undergraduate', label: 'Undergraduate' },
  { value: 'Postgraduate', label: 'Postgraduate' },
]

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

function initialStatuses(): Record<string, ProgramStatus> {
  const out: Record<string, ProgramStatus> = {}
  for (const p of PROGRAMS) out[p.id] = p.status === 'Inactive' ? 'Inactive' : 'Active'
  return out
}

export function ProgramsPage() {
  const institutions = useAppStore((s) => s.institutions)
  const pushToast = useAppStore((s) => s.pushToast)

  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [statuses, setStatuses] = useState<Record<string, ProgramStatus>>(initialStatuses)
  const [confirmRow, setConfirmRow] = useState<ProgramRow | null>(null)
  const [detail, setDetail] = useState<ProgramRow | null>(null)

  const rows: ProgramRow[] = useMemo(
    () =>
      PROGRAMS.map((p) => ({
        ...p,
        status: statuses[p.id] ?? (p.status === 'Inactive' ? 'Inactive' : 'Active'),
      })),
    [statuses],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q)) &&
        (!levelFilter || p.level === levelFilter) &&
        (!statusFilter || p.status === statusFilter),
    )
  }, [rows, query, levelFilter, statusFilter])

  const activeCount = rows.filter((p) => p.status === 'Active').length
  const totalEnrollment = rows.reduce((sum, p) => sum + p.students, 0)
  const coveredInstitutions = institutions.filter((i) => i.status === 'Active').length

  const clearFilters = () => {
    setQuery('')
    setLevelFilter('')
    setStatusFilter('')
  }

  const toggleStatus = () => {
    if (!confirmRow) return
    const next: ProgramStatus = confirmRow.status === 'Active' ? 'Inactive' : 'Active'
    setStatuses((s) => ({ ...s, [confirmRow.id]: next }))
    pushToast({
      title: next === 'Active' ? 'Program activated' : 'Program deactivated',
      description: `${confirmRow.name} is now ${next.toLowerCase()}.`,
      tone: next === 'Active' ? 'success' : 'warning',
    })
  }

  const confirmIsDeactivate = confirmRow?.status === 'Active'
  const confirmName = confirmRow?.name ?? 'this program'

  const coverage = detail
    ? institutions
        .filter((i) => i.status === 'Active')
        .sort((a, b) => b.students - a.students)
        .slice(0, Math.max(1, detail.institutions))
    : []

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Programs"
        subtitle="Portfolio of academic programs offered across the tenant institutions."
      />

      <StatGrid>
        <StatCard label="Total programs" value={rows.length} hint="in the platform portfolio" />
        <StatCard label="Active" value={activeCount} tone="success" hint="currently accepting enrollment" />
        <StatCard
          label="Total enrollment"
          value={formatNum(totalEnrollment)}
          tone="info"
          hint="students across all programs"
        />
        <StatCard
          label="Institutions covered"
          value={coveredInstitutions}
          tone="warning"
          hint="active tenants in the portfolio"
        />
      </StatGrid>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          placeholder="Program name"
          leftIcon={<Search className="h-4 w-4" aria-hidden />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          label="Level"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          options={LEVEL_OPTIONS}
          placeholder="All levels"
        />
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
        />
        <div className="flex items-end">
          <Button variant="outline" className="h-10" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Clear filters
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <NoResults
          term={query.trim() || levelFilter || statusFilter || undefined}
          onClear={clearFilters}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[14.5px] font-semibold leading-snug text-ink">{p.name}</h3>
                <Badge tone={p.level === 'Undergraduate' ? 'info' : 'brand'}>{p.level}</Badge>
              </div>

              <p className="mt-1.5 text-[12.5px] text-ink-faint">
                {p.duration} · offered by {p.institutions} institutions
              </p>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-[24px] font-bold leading-none tracking-tight text-ink">
                  {formatNum(p.students)}
                </span>
                <span className="text-[12px] text-ink-subtle">students enrolled</span>
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5">
                <StatusCell status={p.status} />
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => setDetail(p)}>
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant={p.status === 'Active' ? 'danger' : 'success'}
                    onClick={() => setConfirmRow(p)}
                  >
                    {p.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmRow !== null}
        onClose={() => setConfirmRow(null)}
        onConfirm={toggleStatus}
        title={confirmIsDeactivate ? 'Deactivate program?' : 'Activate program?'}
        message={
          confirmIsDeactivate
            ? `${confirmName} will be marked Inactive and hidden from new enrollment flows.`
            : `${confirmName} will be marked Active and available for enrollment again.`
        }
        confirmLabel={confirmIsDeactivate ? 'Deactivate' : 'Activate'}
        tone={confirmIsDeactivate ? 'danger' : 'primary'}
      />

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.name ?? 'Program details'}
        description="Program record with indicative tenant coverage"
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setDetail(null)}>
            Close
          </Button>
        }
      >
        {detail && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: 'Program ID', value: detail.id },
                { label: 'Level', value: detail.level },
                { label: 'Duration', value: detail.duration },
                { label: 'Institutions', value: String(detail.institutions) },
                { label: 'Enrollment', value: formatNum(detail.students) },
                { label: 'Status', value: detail.status },
              ].map((f) => (
                <div
                  key={f.label}
                  className="rounded-xl border border-line bg-panel-muted px-3.5 py-2.5"
                >
                  <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-subtle">
                    {f.label}
                  </dt>
                  <dd className="mt-1 break-words text-[13.5px] font-medium text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>

            <div>
              <h4 className="mb-2 text-[13px] font-semibold text-ink">
                Indicative institution coverage
              </h4>
              <ul className="overflow-hidden rounded-xl border border-line">
                {coverage.map((i) => (
                  <li
                    key={i.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3.5 py-2.5 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-ink">{i.name}</p>
                      <p className="text-[11.5px] text-ink-faint">
                        {i.city} · joined {formatDate(i.joined)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlanBadge plan={i.plan} />
                      <span className="text-[12.5px] tabular-nums text-ink-muted">
                        {formatNum(i.students)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <MockBadge compact />
                <span className="text-[11.5px] text-ink-subtle">
                  Coverage is mapped from the demo tenant list for illustration.
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
