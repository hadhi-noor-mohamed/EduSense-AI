// ---------------------------------------------------------------------------
// Local helpers shared by the institution pages.
// (Kept inside the institution folder per the page-authoring contract.)
// ---------------------------------------------------------------------------

const DEPT_SHORT: Record<string, string> = {
  'Computer Science & Engineering': 'CSE',
  'Information Technology': 'IT',
  'Electronics & Communication': 'ECE',
  'Mechanical Engineering': 'ME',
  'Civil Engineering': 'CE',
  'Artificial Intelligence & Data Science': 'AI & DS',
}

/** Compact, axis-friendly label for a department name. */
export function shortDept(name: string): string {
  return DEPT_SHORT[name] ?? name
}

/** Safe integer percentage of `part` against `total` (0 when total is 0). */
export function pctOf(part: number, total: number): number {
  if (!total) return 0
  return Math.round((part / total) * 100)
}
