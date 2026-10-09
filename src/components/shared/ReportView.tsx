import { useState, type ReactNode } from 'react'
import {
  CheckCircle2,
  Download,
  FileCheck2,
  Printer,
  RefreshCw,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { PageHeader } from '../ui/PageHeader'
import { Skeleton } from '../ui/States'
import { MockBadge } from './MockBadge'
import { BrandMark } from './Brand'
import { formatDate } from '../../utils/format'
import { cn } from '../../utils/cn'

export interface ReportBlock {
  title: string
  content: ReactNode
}

/**
 * Printable report renderer shared by every role.
 * "Generate" performs a real asynchronous generation step, "Print" uses the
 * browser print pipeline and "Download" produces a self-contained HTML file.
 */
export function ReportView({
  title,
  subtitle,
  audience,
  meta,
  blocks,
  includeBrandHeader = true,
}: {
  title: string
  subtitle: string
  audience: string
  meta: { label: string; value: string }[]
  blocks: ReportBlock[]
  includeBrandHeader?: boolean
}) {
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const generate = () => {
    setGenerating(true)
    window.setTimeout(() => {
      setGenerating(false)
      setGeneratedAt(new Date().toISOString())
    }, 900)
  }

  const download = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
 body{font-family:Inter,Segoe UI,sans-serif;color:#0f172a;max-width:820px;margin:36px auto;padding:0 24px;line-height:1.6}
 h1{font-size:24px;margin:0} h2{font-size:15px;margin:28px 0 8px;color:#4338ca;text-transform:uppercase;letter-spacing:.06em}
 .sub{color:#64748b;font-size:14px;margin-top:4px}
 .meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:20px 0}
 .meta div{border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px}
 .meta span{display:block;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.06em}
 .meta b{font-size:15px}
 table{width:100%;border-collapse:collapse;font-size:13.5px}
 td,th{border-bottom:1px solid #e2e8f0;padding:7px 8px;text-align:left}
 footer{margin-top:32px;border-top:1px solid #e2e8f0;padding-top:12px;font-size:12px;color:#64748b}
</style></head><body>
<h1>${title}</h1><p class="sub">${subtitle}</p>
<p class="sub">EduSense AI · Predict. Understand. Improve. · Generated ${new Date(generatedAt ?? Date.now()).toLocaleString()}</p>
<div class="meta">${meta.map((m) => `<div><span>${m.label}</span><b>${m.value}</b></div>`).join('')}</div>
${blocks
  .map(
    (b) =>
      `<h2>${b.title}</h2><div>${textOfNode(b.content).split('\n').map((l) => (l ? `<p>${escapeHtml(l)}</p>` : '')).join('')}</div>`,
  )
  .join('')}
<footer>Prototype report produced by a mock ML service for demonstration. Not a clinically or scientifically validated assessment.</footer>
</body></html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-edusense.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in-up">
      <div className="no-print">
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={
            generatedAt ? (
              <>
                <Button variant="secondary" onClick={generate} loading={generating}>
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Regenerate
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" aria-hidden />
                  Print report
                </Button>
                <Button onClick={download}>
                  <Download className="h-4 w-4" aria-hidden />
                  Download report
                </Button>
              </>
            ) : (
              <Button onClick={generate} loading={generating}>
                <FileCheck2 className="h-4 w-4" aria-hidden />
                Generate report
              </Button>
            )
          }
        />
      </div>

      {!generatedAt ? (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-6 sm:p-10">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/12 dark:text-brand-300">
              <FileCheck2 className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-ink">Build your {audience.toLowerCase()} report</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              The generator assembles student information, performance, risk score, contributing
              factors, recommendations and progress into a single printable document.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Button onClick={generate} loading={generating}>
                Generate report
              </Button>
              <MockBadge compact />
            </div>
            {generating && (
              <div className="mt-6 space-y-2.5 text-left">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <article className="print-area overflow-hidden rounded-2xl border border-line bg-panel shadow-card">
          <div className="border-b border-line bg-panel-muted/60 px-5 py-4 sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              {includeBrandHeader && <BrandMark size="sm" />}
              <div className="flex items-center gap-2 text-[11.5px] text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                Generated {formatDate(generatedAt)}
              </div>
            </div>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-ink">{title}</h2>
            <p className="mt-1 text-[13.5px] text-muted">{subtitle}</p>
          </div>

          <div className="grid gap-2.5 border-b border-line px-5 py-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            {meta.map((m) => (
              <div key={m.label} className="rounded-xl border border-line bg-panel-muted px-3.5 py-2.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-subtle">
                  {m.label}
                </p>
                <p className="mt-1 text-[14px] font-semibold text-ink">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="px-5 py-5 sm:px-8 sm:py-7">
            {blocks.map((b, i) => (
              <section key={b.title} className={cn(i > 0 && 'mt-7')}>
                <h3 className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-accent">
                  <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
                  {b.title}
                </h3>
                <div className="text-[13.5px] leading-relaxed text-ink-muted">{b.content}</div>
              </section>
            ))}
          </div>

          <div className="border-t border-line px-5 py-4 sm:px-8">
            <MockBadge compact />
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink-subtle">
              This document was produced by an educational prototype using a transparent mock
              prediction service. It must not be used as a validated academic assessment or to
              make high-stakes decisions about any student.
            </p>
          </div>
        </article>
      )}
    </div>
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Best-effort text extraction from arbitrary ReactNode content. */
function textOfNode(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOfNode).filter(Boolean).join('\n')
  if (typeof node === 'object' && 'props' in node) {
    const el = node as { props?: { children?: ReactNode; className?: string } }
    const children = textOfNode(el.props?.children)
    return children
  }
  return ''
}
