import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import { cn } from '../../utils/cn'
import { EmptyState, NoResults } from './States'

export interface Column<T> {
  key: string
  header: ReactNode
  render?: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  align?: 'left' | 'right' | 'center'
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  /** Enables the built-in search box when provided. */
  searchFields?: (row: T) => string[]
  searchPlaceholder?: string
  toolbar?: ReactNode
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  pageSize?: number
  footer?: ReactNode
  dense?: boolean
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  searchFields,
  searchPlaceholder = 'Search…',
  toolbar,
  onRowClick,
  emptyTitle = 'Nothing to show',
  emptyDescription,
  emptyAction,
  pageSize = 10,
  footer,
  dense,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const searched = useMemo(() => {
    if (!searchFields || !query.trim()) return rows
    const q = query.trim().toLowerCase()
    return rows.filter((r) => searchFields(r).some((f) => f.toLowerCase().includes(q)))
  }, [rows, query, searchFields])

  const sorted = useMemo(() => {
    if (!sortKey) return searched
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return searched
    const dir = sortDir === 'asc' ? 1 : -1
    return [...searched].sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [searched, sortKey, sortDir, columns])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const visible = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  const hasToolbar = Boolean(searchFields || toolbar)

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-card">
      {hasToolbar && (
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          {searchFields && (
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-9 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="p-5">
          {query.trim() ? (
            <NoResults term={query} onClear={() => setQuery('')} />
          ) : (
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
            />
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-panel-muted/70">
                {columns.map((c) => {
                  const sortable = Boolean(c.sortValue)
                  const active = sortKey === c.key
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      className={cn(
                        'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle sm:px-5',
                        c.align === 'right' && 'text-right',
                        c.align === 'center' && 'text-center',
                        c.headerClassName,
                      )}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          className={cn(
                            'inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-ink',
                            active && 'text-accent',
                          )}
                        >
                          {c.header}
                          {active ? (
                            sortDir === 'asc' ? (
                              <ArrowUp className="h-3 w-3" aria-hidden />
                            ) : (
                              <ArrowDown className="h-3 w-3" aria-hidden />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden />
                          )}
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter') onRowClick(row)
                        }
                      : undefined
                  }
                  className={cn(
                    'border-b border-line last:border-0 transition-colors',
                    onRowClick &&
                      'cursor-pointer hover:bg-panel-muted focus-visible:bg-panel-muted focus-visible:outline-none',
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        'px-4 align-middle text-[13.5px] text-ink-muted sm:px-5',
                        dense ? 'py-2.5' : 'py-3.5',
                        c.align === 'right' && 'text-right',
                        c.align === 'center' && 'text-center',
                        c.className,
                      )}
                    >
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(sorted.length > pageSize || footer) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
          <p className="text-[12.5px] text-ink-subtle">
            Showing {safePage * pageSize + 1}–{Math.min(sorted.length, (safePage + 1) * pageSize)} of{' '}
            {sorted.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="h-8 rounded-lg border border-line px-3 text-[12.5px] font-medium text-ink-muted transition-colors hover:bg-panel-muted disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-1 text-[12.5px] tabular-nums text-ink-subtle">
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="h-8 rounded-lg border border-line px-3 text-[12.5px] font-medium text-ink-muted transition-colors hover:bg-panel-muted disabled:opacity-40"
            >
              Next
            </button>
          </div>
          {footer}
        </div>
      )}
    </div>
  )
}
