import { useMemo, useState } from 'react'
import { Eye, RotateCcw, Search, UserCheck, UserX } from 'lucide-react'
import {
  Avatar,
  Button,
  ConfirmDialog,
  DataTable,
  type Column,
  Input,
  Modal,
  NoResults,
  PageHeader,
  Select,
  StatCard,
} from '../../components/ui'
import { MockBadge } from '../../components/shared/MockBadge'
import { useAppStore } from '../../store/useAppStore'
import { PLATFORM_USERS } from '../../data/seed'
import { avatarTone, RoleBadge, StatGrid, StatusCell } from './components/AdminShared'

type UserStatus = 'Active' | 'Suspended'
type SeedUser = (typeof PLATFORM_USERS)[number]
type UserRow = Omit<SeedUser, 'status'> & { status: UserStatus }

const ROLE_OPTIONS = [
  { value: 'Student', label: 'Student' },
  { value: 'Teacher', label: 'Teacher' },
  { value: 'Institution Admin', label: 'Institution Admin' },
  { value: 'Organization Admin', label: 'Organization Admin' },
]

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
]

function initialStatuses(): Record<string, UserStatus> {
  const out: Record<string, UserStatus> = {}
  for (const u of PLATFORM_USERS) {
    out[u.id] = u.status === 'Suspended' ? 'Suspended' : 'Active'
  }
  return out
}

export function UsersPage() {
  const pushToast = useAppStore((s) => s.pushToast)

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [statuses, setStatuses] = useState<Record<string, UserStatus>>(initialStatuses)
  const [confirmRow, setConfirmRow] = useState<UserRow | null>(null)
  const [viewUser, setViewUser] = useState<UserRow | null>(null)

  const rows: UserRow[] = useMemo(
    () =>
      PLATFORM_USERS.map((u) => ({
        ...u,
        status: statuses[u.id] ?? (u.status === 'Suspended' ? 'Suspended' : 'Active'),
      })),
    [statuses],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(
      (u) =>
        (!q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.institution.toLowerCase().includes(q)) &&
        (!roleFilter || u.role === roleFilter) &&
        (!statusFilter || u.status === statusFilter),
    )
  }, [rows, query, roleFilter, statusFilter])

  const activeCount = filtered.filter((u) => u.status === 'Active').length
  const suspendedCount = filtered.filter((u) => u.status === 'Suspended').length
  const studentCount = filtered.filter((u) => u.role === 'Student').length

  const confirmTarget = confirmRow
  const confirmIsSuspend = confirmTarget?.status === 'Active'
  const confirmName = confirmTarget?.name ?? 'This user'

  const clearFilters = () => {
    setQuery('')
    setRoleFilter('')
    setStatusFilter('')
  }

  const applyToggle = (row: UserRow) => {
    const next: UserStatus = row.status === 'Active' ? 'Suspended' : 'Active'
    setStatuses((s) => ({ ...s, [row.id]: next }))
    pushToast({
      title: next === 'Suspended' ? `${row.name} suspended` : `${row.name} reactivated`,
      description:
        next === 'Suspended'
          ? 'The account can no longer sign in to the platform.'
          : 'The account can sign in to the platform again.',
      tone: next === 'Suspended' ? 'warning' : 'success',
    })
  }

  const columns: Column<UserRow>[] = [
    {
      key: 'name',
      header: 'User',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} tone={avatarTone(r.name)} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold text-ink">{r.name}</p>
            <p className="truncate text-[11.5px] text-ink-faint">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortValue: (r) => r.role,
      render: (r) => <RoleBadge role={r.role} />,
    },
    {
      key: 'institution',
      header: 'Institution',
      sortValue: (r) => r.institution,
      render: (r) => <span className="text-[13px]">{r.institution}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.status,
      render: (r) => <StatusCell status={r.status} />,
    },
    {
      key: 'lastActive',
      header: 'Last active',
      sortValue: (r) => r.lastActive,
      render: (r) => <span className="text-[13px] text-ink-subtle">{r.lastActive}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => setViewUser(r)}>
            <Eye className="h-3.5 w-3.5" aria-hidden />
            View
          </Button>
          <Button
            size="sm"
            variant={r.status === 'Active' ? 'outline' : 'success'}
            onClick={() => setConfirmRow(r)}
          >
            {r.status === 'Active' ? (
              <>
                <UserX className="h-3.5 w-3.5" aria-hidden />
                Suspend
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5" aria-hidden />
                Reactivate
              </>
            )}
          </Button>
        </div>
      ),
    },
  ]

  const emptyTerm = query.trim() || roleFilter || statusFilter || undefined

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Platform users"
        subtitle="Search, review and suspend every account registered across the tenants."
      />

      <StatGrid>
        <StatCard
          label="Filtered users"
          value={filtered.length}
          hint="matching the current filters"
        />
        <StatCard
          label="Active"
          value={activeCount}
          tone="success"
          hint="accounts in good standing"
        />
        <StatCard
          label="Suspended"
          value={suspendedCount}
          tone="danger"
          hint="sign-in currently blocked"
        />
        <StatCard
          label="Students"
          value={studentCount}
          tone="info"
          hint="student accounts in the result"
        />
      </StatGrid>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          placeholder="Name, email or institution"
          leftIcon={<Search className="h-4 w-4" aria-hidden />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          label="Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={ROLE_OPTIONS}
          placeholder="All roles"
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
        <NoResults term={emptyTerm} onClear={clearFilters} />
      ) : (
        <DataTable<UserRow>
          columns={columns}
          rows={filtered}
          getRowId={(r) => r.id}
          pageSize={10}
        />
      )}

      <ConfirmDialog
        open={confirmRow !== null}
        onClose={() => setConfirmRow(null)}
        onConfirm={() => {
          if (confirmRow) applyToggle(confirmRow)
        }}
        title={confirmIsSuspend ? 'Suspend user?' : 'Reactivate user?'}
        message={
          confirmIsSuspend
            ? `${confirmName} will no longer be able to sign in. Their records stay available to tenant admins.`
            : `${confirmName} will be able to sign in again with their existing credentials.`
        }
        confirmLabel={confirmIsSuspend ? 'Suspend user' : 'Reactivate user'}
        tone={confirmIsSuspend ? 'danger' : 'primary'}
      />

      <Modal
        open={viewUser !== null}
        onClose={() => setViewUser(null)}
        title="User details"
        description="Directory entry from the demo dataset"
        footer={
          <Button variant="outline" onClick={() => setViewUser(null)}>
            Close
          </Button>
        }
      >
        {viewUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={viewUser.name} tone={avatarTone(viewUser.name)} size="lg" />
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-ink">{viewUser.name}</p>
                <p className="truncate text-[13px] text-muted">{viewUser.email}</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              {[
                { label: 'User ID', value: viewUser.id },
                { label: 'Role', value: viewUser.role },
                { label: 'Institution', value: viewUser.institution },
                { label: 'Status', value: viewUser.status },
                { label: 'Last active', value: viewUser.lastActive },
                { label: 'Password', value: 'Demo accounts use password123' },
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

            <div className="rounded-xl border border-dashed border-line bg-panel-muted px-3.5 py-3">
              <MockBadge compact />
              <p className="mt-2 text-[12px] leading-relaxed text-ink-subtle">
                This directory entry is sample demo data shipped with the prototype — no real
                personal information is stored or processed.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
