import type { Recommendation, Role, SearchDoc } from '../types'
import { ASSESSMENTS, STUDENTS, SUBJECTS_WITH_RISK } from '../data/seed'
import { NAV } from '../layouts/navConfig'

export interface SearchContext {
  role: Role
  recommendations?: Recommendation[]
}

/** Builds a flat, categorised index of everything global search should cover. */
export function buildSearchIndex({ role, recommendations = [] }: SearchContext): SearchDoc[] {
  const docs: SearchDoc[] = []

  for (const nav of NAV[role]) {
    docs.push({
      id: `page-${nav.path}`,
      title: nav.label,
      subtitle: 'Page',
      category: 'Page',
      path: nav.path,
    })
  }

  for (const s of SUBJECTS_WITH_RISK) {
    docs.push({
      id: `subject-${s.id}`,
      title: s.name,
      subtitle: `${s.code} · ${s.teacher}`,
      category: 'Subject',
      path:
        role === 'student'
          ? '/student/performance'
          : role === 'teacher'
            ? '/teacher/analytics'
            : role === 'institution'
              ? '/institution/analytics'
              : '/admin/analytics',
    })
  }

  for (const a of ASSESSMENTS) {
    docs.push({
      id: `assessment-${a.id}`,
      title: a.title,
      subtitle: `${a.subject} · ${a.status}`,
      category: 'Assessment',
      path:
        role === 'student'
          ? '/student/assessments'
          : role === 'teacher'
            ? '/teacher/assessments'
            : role === 'institution'
              ? '/institution/analytics'
              : '/admin/analytics',
    })
  }

  if (role === 'teacher' || role === 'institution') {
    for (const s of STUDENTS) {
      docs.push({
        id: `student-${s.id}`,
        title: s.name,
        subtitle: `${s.rollNo} · ${s.department} · ${s.risk} risk`,
        category: 'Student',
        path: role === 'teacher' ? `/teacher/students/${s.id}` : '/institution/students',
      })
    }
  }

  for (const r of recommendations) {
    docs.push({
      id: `rec-${r.id}`,
      title: r.title,
      subtitle: `${r.priority} priority · ${r.status}`,
      category: 'Recommendation',
      path: '/student/recommendations',
    })
  }

  const reportPaths: Partial<Record<Role, string>> = {
    student: '/student/reports',
    teacher: '/teacher/reports',
    institution: '/institution/reports',
    organization: '/admin/reports',
  }
  docs.push({
    id: 'report-main',
    title: `${role === 'student' ? 'Student' : role === 'teacher' ? 'Teacher' : role === 'institution' ? 'Institution' : 'Platform'} Report`,
    subtitle: 'Generated PDF-style report preview',
    category: 'Report',
    path: reportPaths[role] ?? '/',
  })
  docs.push({
    id: 'report-risk',
    title: 'Risk Summary Report',
    subtitle: 'Risk distribution, factors and interventions',
    category: 'Report',
    path: reportPaths[role] ?? '/',
  })

  return docs
}

export function searchDocs(docs: SearchDoc[], query: string): SearchDoc[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return docs
    .filter(
      (d) =>
        d.title.toLowerCase().includes(q) || d.subtitle.toLowerCase().includes(q),
    )
    .slice(0, 14)
}

export const SEARCH_CATEGORY_ORDER: SearchDoc['category'][] = [
  'Page',
  'Student',
  'Subject',
  'Assessment',
  'Recommendation',
  'Report',
]
