// ---------------------------------------------------------------------------
// EduSense AI — Recommendation engine
//
// Rule-based, explainable recommendation generator. Each suggestion is derived
// from a specific shortfall in the prediction input, so the UI can always show
// WHY a recommendation was produced.
//
// Designed so a future backend recommendation service can return the same
// `Recommendation[]` shape without touching the UI.
// ---------------------------------------------------------------------------

import type { ContributingFactor, Recommendation } from '../types'
import type { PredictionInput } from './predictionService'

let counter = 0
function nextId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

interface Rule {
  /** returns true when this rule should fire */
  when: (input: PredictionInput, factors: ContributingFactor[]) => boolean
  build: (input: PredictionInput, factors: ContributingFactor[]) => Omit<Recommendation, 'id' | 'status'>
}

function contributionOf(factors: ContributingFactor[], name: string): number {
  return factors.find((f) => f.name === name)?.contribution ?? 0
}

const RULES: Rule[] = [
  {
    when: (i) => i.attendance < 80,
    build: (i, f) => ({
      title: 'Improve Class Attendance',
      description:
        'Attend every scheduled class for the next two weeks and reach out to your faculty for any sessions you missed. Attendance is tracked daily in this platform.',
      reason: `Attendance is ${i.attendance}% against an 85% target and accounts for ${contributionOf(f, 'Attendance')}% of your demo risk score.`,
      priority: i.attendance < 70 ? 'High' : 'Medium',
      estimatedEffort: 'Ongoing — 2 weeks',
      relatedSubject: i.weakSubject ?? 'All subjects',
    }),
  },
  {
    when: (i) => i.assignment_completion < 85,
    build: (i, f) => ({
      title: 'Complete Pending Assignments',
      description:
        'List every unfinished submission, order them by due date, and clear the two most urgent items first. Use the Assessments page to track status.',
      reason: `Assignment completion is ${i.assignment_completion}% against a 90% target and contributes ${contributionOf(f, 'Assignment Completion')}% of your demo risk score.`,
      priority: i.assignment_completion < 70 ? 'High' : 'Medium',
      estimatedEffort: '3–5 hours this week',
      relatedSubject: i.weakSubject ?? 'All subjects',
    }),
  },
  {
    when: (i) => i.internal_marks < 70,
    build: (i, f) => ({
      title: 'Review Weak Subjects & Internal Papers',
      description:
        'Re-work the questions you lost marks on in the last internal assessment, then attempt one full-length practice paper under a timer.',
      reason: `Internal assessment average is ${i.internal_marks}% against a 75% target and contributes ${contributionOf(f, 'Internal Assessment')}% of your demo risk score.`,
      priority: i.internal_marks < 60 ? 'High' : 'Medium',
      estimatedEffort: '4–6 hours this week',
      relatedSubject: i.weakSubject ?? 'All subjects',
    }),
  },
  {
    when: (i) => i.quiz_scores < 70,
    build: (i, f) => ({
      title: 'Practice Topic-Based Quizzes',
      description:
        'Attempt one short quiz per topic every alternate day. Focus on the topics you scored lowest on, then re-attempt them after 48 hours.',
      reason: `Quiz average is ${i.quiz_scores}% against a 75% target and contributes ${contributionOf(f, 'Quiz Performance')}% of your demo risk score.`,
      priority: i.quiz_scores < 60 ? 'High' : 'Medium',
      estimatedEffort: '20 minutes daily',
      relatedSubject: i.weakSubject ?? 'All subjects',
    }),
  },
  {
    when: (i) => i.previous_marks < 70,
    build: (i, f) => ({
      title: 'Revisit Previous Semester Weak Areas',
      description:
        'Identify the two subjects that pulled down your previous aggregate and rebuild those fundamentals with summary notes before the next cycle.',
      reason: `Previous semester aggregate is ${i.previous_marks}% against a 75% target and contributes ${contributionOf(f, 'Previous Semester Marks')}% of your demo risk score.`,
      priority: 'Medium',
      estimatedEffort: '2–3 hours weekly',
      relatedSubject: i.weakSubject ?? 'All subjects',
    }),
  },
  {
    when: (i) => i.learning_activity < 6,
    build: (i, f) => ({
      title: 'Build a Consistent Study Routine',
      description:
        'Block a fixed daily study slot and log your hours. Aim to move from your current weekly self-study time towards 8 hours gradually.',
      reason: `Current self-study is ${i.learning_activity} hrs/week against an 8 hr target and contributes ${contributionOf(f, 'Learning Activity')}% of your demo risk score.`,
      priority: 'Low',
      estimatedEffort: '30–45 minutes daily',
      relatedSubject: i.weakSubject ?? 'All subjects',
    }),
  },
  {
    when: (i, f) => f.length > 0 && f[0].contribution >= 25 && i.attendance >= 80,
    build: (i, f) => ({
      title: `Focus on ${f[0].name}`,
      description: `Reserve focused revision time for ${f[0].name.toLowerCase()}, which is currently the strongest signal in your demo prediction.`,
      reason: `${f[0].name} contributes ${f[0].contribution}% of your demo risk score.`,
      priority: 'Medium',
      estimatedEffort: '2 hours this week',
      relatedSubject: i.weakSubject ?? 'All subjects',
    }),
  },
]

export function generateRecommendations(
  input: PredictionInput,
  factors: ContributingFactor[],
): Recommendation[] {
  const fired = RULES.filter((r) => {
    try {
      return r.when(input, factors)
    } catch {
      return false
    }
  }).map((r) => ({
    ...r.build(input, factors),
    id: nextId('rec'),
    status: 'Not Started' as const,
  }))

  const order = { High: 0, Medium: 1, Low: 2 } as const
  fired.sort((a, b) => order[a.priority] - order[b.priority])

  if (fired.length === 0) {
    return [
      {
        id: nextId('rec'),
        title: 'Maintain Your Current Routine',
        description:
          'No significant shortfall detected. Keep your attendance, submissions and practice schedule consistent through the semester.',
        reason: 'All tracked inputs are currently at or above their demo benchmarks.',
        priority: 'Low',
        estimatedEffort: 'Ongoing',
        status: 'Not Started',
        relatedSubject: input.weakSubject ?? 'All subjects',
      },
    ]
  }

  return fired.slice(0, 6)
}

/** Recommendation produced when a student completes a quiz demo attempt. */
export function buildRecommendation(
  partial: Omit<Recommendation, 'id' | 'status'>,
  status: Recommendation['status'] = 'Not Started',
): Recommendation {
  return { ...partial, id: nextId('rec'), status }
}

export function resetRecommendationIds() {
  counter = 0
}
