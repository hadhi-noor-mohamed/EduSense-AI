import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  FileText,
  Lightbulb,
  Search,
  SearchX,
  ClipboardCheck,
  GraduationCap,
  User as UserIcon,
} from 'lucide-react'
import type { SearchDoc } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import {
  SEARCH_CATEGORY_ORDER,
  buildSearchIndex,
  searchDocs,
} from '../../services/searchService'
import { MockBadge } from './MockBadge'
import { cn } from '../../utils/cn'

const CATEGORY_ICON: Record<SearchDoc['category'], typeof Search> = {
  Page: ArrowRight,
  Student: UserIcon,
  Subject: GraduationCap,
  Assessment: ClipboardCheck,
  Recommendation: Lightbulb,
  Report: FileText,
}

export function SearchPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.user?.role)
  const recommendations = useAppStore((s) => s.recommendations)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const docs = useMemo(
    () => (role ? buildSearchIndex({ role, recommendations }) : []),
    [role, recommendations],
  )
  const results = useMemo(() => searchDocs(docs, query), [docs, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      window.setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((a) => Math.min(results.length - 1, a + 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((a) => Math.max(0, a - 1))
      }
      if (e.key === 'Enter' && results[active]) {
        e.preventDefault()
        go(results[active])
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, active])

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (doc: SearchDoc) => {
    navigate(doc.path)
    onClose()
  }

  if (!open) return null

  const grouped = SEARCH_CATEGORY_ORDER.map((cat) => ({
    cat,
    items: results.filter((r) => r.category === cat),
  })).filter((g) => g.items.length > 0)

  let runningIdx = -1

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-line bg-panel shadow-pop-lg"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4.5 w-4.5 shrink-0 text-ink-faint" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, subjects, assessments, reports…"
            aria-label="Global search"
            className="h-[52px] w-full bg-transparent py-4 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-line bg-panel-muted px-1.5 py-0.5 text-[10.5px] font-medium text-ink-faint sm:block">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {query.trim() && results.length === 0 && (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <SearchX className="mb-2 h-6 w-6 text-ink-faint" aria-hidden />
              <p className="text-[14px] font-medium text-ink">No matches for “{query}”</p>
              <p className="mt-1 text-[12.5px] text-ink-subtle">
                Try a student name, subject, assessment or page title.
              </p>
            </div>
          )}

          {!query.trim() && (
            <div className="px-3 py-6 text-center">
              <p className="text-[13.5px] font-medium text-ink">Search across EduSense AI</p>
              <p className="mx-auto mt-1.5 max-w-xs text-[12.5px] leading-relaxed text-ink-subtle">
                Students, subjects, assessments, recommendations, reports and every page — start
                typing to see categorized results.
              </p>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.cat} className="mb-1.5">
              <div className="px-3 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint">
                {group.cat}s
              </div>
              {group.items.map((item) => {
                runningIdx += 1
                const idx = runningIdx
                const Icon = CATEGORY_ICON[item.category]
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-idx={idx}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => go(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      idx === active ? 'bg-panel-muted' : 'hover:bg-panel-muted/60',
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel-muted text-ink-muted">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-ink">
                        {item.title}
                      </span>
                      <span className="block truncate text-[12px] text-ink-subtle">
                        {item.subtitle}
                      </span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden />
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
          <span className="flex items-center gap-2 text-[11.5px] text-ink-subtle">
            <kbd className="rounded border border-line bg-panel-muted px-1.5 py-0.5 text-[10.5px]">↑↓</kbd>
            navigate
            <kbd className="rounded border border-line bg-panel-muted px-1.5 py-0.5 text-[10.5px]">↵</kbd>
            open
          </span>
          <MockBadge compact />
        </div>
      </div>
    </div>,
    document.body,
  )
}
