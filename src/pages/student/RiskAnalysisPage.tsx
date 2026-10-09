import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Info, RefreshCw } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  PageHeader,
  Progress,
  RiskBadge,
} from '../../components/ui'
import { RiskGauge } from '../../components/charts/RiskGauge'
import { RiskFactorChart } from '../../components/charts/RiskFactorChart'
import { MockBadge, PrototypeNote } from '../../components/shared/MockBadge'
import { PREDICTION_API_CONTRACT } from '../../services/predictionService'
import { useAppStore } from '../../store/useAppStore'
import { cn } from '../../utils/cn'
import type { RiskPrediction } from '../../types'
import { DEMO_STUDENT, demoPrediction } from './studentData'

const HOW_IT_WORKS = [
  'Every input you have — attendance, previous semester marks, internal assessments, quiz averages, assignment completion and weekly self-study hours — is compared against a healthy benchmark.',
  'The shortfall (benchmark minus your value) is multiplied by a fixed weight. Attendance carries the highest weight, self-study the lowest — the weights are declared in the service, not hidden.',
  'All weighted shortfalls are summed and pushed through a sensitivity curve to give a 0–100 risk score: 0 means every benchmark is met, higher means larger shortfalls.',
  'The four largest weighted shortfalls are published as contributing factors, rescaled so they add up to 100% — that is the breakdown on the right.',
  'Recommendations are rule-based and come from exactly the same shortfalls, so every action item can point back to a number on this page.',
]

export function RiskAnalysisPage() {
  const navigate = useNavigate()
  const pushToast = useAppStore((s) => s.pushToast)

  const [pred, setPred] = useState<RiskPrediction>(() => demoPrediction())
  const [regenerating, setRegenerating] = useState(false)
  const [generatedAt, setGeneratedAt] = useState<Date>(() => new Date())

  const regenerate = () => {
    setRegenerating(true)
    window.setTimeout(() => {
      setPred(demoPrediction())
      setGeneratedAt(new Date())
      setRegenerating(false)
      pushToast({
        title: 'Demo prediction regenerated',
        description: 'Re-scored from the same demo inputs — the mock service is deterministic.',
        tone: 'success',
      })
    }, 700)
  }

  const timeLabel = generatedAt.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <PageHeader
        title="Why this prediction?"
        subtitle="The full, transparent breakdown of your demo risk score — every factor, benchmark and gap behind it."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/student/recommendations')}>
              View recommendations
            </Button>
            <Button loading={regenerating} onClick={regenerate}>
              <RefreshCw className="h-4 w-4" aria-hidden />
              Regenerate demo prediction
            </Button>
          </>
        }
      />

      <PrototypeNote />

      {/* ---------------- gauge + explainability ---------------- */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Your score"
            description={`Generated at ${timeLabel} · model status: ${PREDICTION_API_CONTRACT.status}`}
            actions={<MockBadge compact />}
          />
          <CardContent className="pt-3">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-panel-muted px-4 py-6">
              <RiskGauge score={pred.risk_score} level={pred.risk_level} sublabel="0–100 demo scale" />
              <RiskBadge level={pred.risk_level} score={pred.risk_score} />
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-muted">{pred.summary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="What is driving it"
            description="Share of your score attributed to each factor (largest first)."
            actions={<MockBadge compact />}
          />
          <CardContent className="pt-3">
            <RiskFactorChart factors={pred.contributing_factors} level={pred.risk_level} />
          </CardContent>
        </Card>
      </div>

      {/* ---------------- factor breakdown table ---------------- */}
      <Card>
        <CardHeader
          title="Factor breakdown"
          description="Your current value against the benchmark used by the demo model."
        />
        <CardContent className="pt-3">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-line bg-panel-muted/70 text-[11px] uppercase tracking-wider text-ink-subtle">
                  <th scope="col" className="px-4 py-2.5 font-semibold">Factor</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Current value</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Benchmark</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Gap</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Contribution</th>
                </tr>
              </thead>
              <tbody>
                {pred.contributing_factors.map((f) => {
                  const gap = f.raw.value - f.raw.benchmark
                  return (
                    <tr key={f.name} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{f.name}</p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-subtle">
                          {f.detail}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-ink">
                        {f.raw.value}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-ink-subtle">{f.raw.benchmark}</td>
                      <td
                        className={cn(
                          'px-4 py-3 font-semibold tabular-nums',
                          gap < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-emerald-600 dark:text-emerald-400',
                        )}
                      >
                        {gap > 0 ? `+${gap}` : gap}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-[160px] items-center gap-2.5">
                          <Progress value={f.contribution} height="h-1.5" className="flex-1" />
                          <span className="w-10 shrink-0 text-right font-semibold tabular-nums text-ink">
                            {f.contribution}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-ink-subtle">
            All inputs are normalised to a 0–100 scale before scoring (learning activity: 8 hrs/week
            = 100). Red gaps are values sitting below their benchmark.
          </p>
        </CardContent>
      </Card>

      {/* ---------------- method + API contract ---------------- */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            icon={<Info className="h-4.5 w-4.5" aria-hidden />}
            title="How this works"
            description="A transparent weighted-shortfall method — no black box."
          />
          <CardContent className="pt-3">
            <ol className="space-y-3">
              {HOW_IT_WORKS.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[12px] font-bold text-brand-700 dark:bg-brand-500/12 dark:text-brand-300">
                    {i + 1}
                  </span>
                  <p className="text-[13px] leading-relaxed text-ink-muted">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Future API contract"
            description="This page already consumes the exact shape the backend will return."
            actions={<MockBadge compact />}
          />
          <CardContent className="pt-3">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-md bg-panel-muted px-2.5 py-1 text-[12px] font-medium text-ink-muted">
                Endpoint: <span className="text-accent">{PREDICTION_API_CONTRACT.endpoint}</span>
              </span>
              <span className="rounded-md bg-panel-muted px-2.5 py-1 text-[12px] font-medium text-ink-muted">
                Status: <span className="text-amber-600 dark:text-amber-400">{PREDICTION_API_CONTRACT.status}</span>
              </span>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-line bg-panel-muted px-4 py-3.5 text-[12px] leading-relaxed text-ink-muted">
{JSON.stringify(PREDICTION_API_CONTRACT, null, 2)}
            </pre>
            <p className="mt-3 text-[12px] leading-relaxed text-ink-subtle">
              Swapping the browser mock for a trained model means calling{' '}
              <code className="rounded bg-panel-muted px-1 py-0.5 text-[11.5px] text-accent">
                POST /api/predict
              </code>{' '}
              and feeding the response straight into the components on this page — no UI rewrite.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate('/student/recommendations')}>
                View recommendations
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate('/student/performance')}>
                See the underlying numbers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-[12px] text-ink-subtle">
        Signed in as {DEMO_STUDENT.name} ({DEMO_STUDENT.rollNo}) — every number on this page belongs
        to the demo student record.
      </p>
    </div>
  )
}
