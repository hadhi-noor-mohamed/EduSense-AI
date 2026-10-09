// ---------------------------------------------------------------------------
// EduSense AI — Core domain types
// ---------------------------------------------------------------------------

export type Role = 'student' | 'teacher' | 'institution' | 'organization'

export type RiskLevel = 'Low' | 'Medium' | 'High'

export type Trend = 'up' | 'down' | 'flat'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  password: string
  avatar: string // avatar seed / initials colour key
}

export interface Profile {
  name: string
  email: string
  phone: string
  department: string
  year: string
  bio: string
  avatar: string
}

export interface Subject {
  id: string
  name: string
  code: string
  teacher: string
  attendance: number
  marks: number
  quiz: number
  assignments: number
  risk: RiskLevel
}

export interface Student {
  id: string
  name: string
  email: string
  rollNo: string
  department: string
  year: string
  semester: string
  course: string
  attendance: number
  previousMarks: number
  internalMarks: number
  quizScore: number
  assignmentCompletion: number
  learningActivity: number // hours / week
  overallPerformance: number
  risk: RiskLevel
  riskScore: number
  topFactor: string
  avatar: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  department: string
  subjects: string[]
  students: number
  avatar: string
}

export interface Institution {
  id: string
  name: string
  code: string
  city: string
  students: number
  departments: number
  status: 'Active' | 'Inactive'
  plan: 'Starter' | 'Growth' | 'Enterprise'
  joined: string
  performance: number
}

export interface ContributingFactor {
  name: string
  contribution: number // 0-100, sums (approximately) to 100
  detail: string
  raw: { factor: string; value: number; benchmark: number }
}

export interface Recommendation {
  id: string
  title: string
  description: string
  reason: string
  priority: 'High' | 'Medium' | 'Low'
  estimatedEffort: string
  status: 'Not Started' | 'In Progress' | 'Completed'
  relatedSubject: string
}

export interface RiskPrediction {
  risk_level: RiskLevel
  risk_score: number
  contributing_factors: ContributingFactor[]
  recommendations: Recommendation[]
  summary: string
  isMock: true
}

export type AssessmentType = 'Quiz' | 'Assignment' | 'Internal' | 'Exam'

export interface Assessment {
  id: string
  subject: string
  title: string
  type: AssessmentType
  dueDate: string
  status: 'Completed' | 'Pending' | 'Overdue' | 'Upcoming'
  score: number | null
  maxScore: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

export interface Quiz {
  id: string
  subject: string
  title: string
  questions: QuizQuestion[]
}

export interface AttendanceRecord {
  month: string
  overall: number
  bySubject: Record<string, number>
}

export interface PerformancePoint {
  label: string
  marks: number
  attendance: number
  quiz: number
  assignments: number
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'risk' | 'recommendation' | 'assessment' | 'teacher' | 'system' | 'progress'
  createdAt: string
  read: boolean
  link?: string
  roles: Role[]
}

export type InterventionStatus = 'Pending' | 'In Progress' | 'Completed'

export interface Intervention {
  id: string
  studentId: string
  studentName: string
  risk: RiskLevel
  intervention: string
  note: string
  status: InterventionStatus
  followUpDate: string
  updatedAt: string
}

export interface LearningTask {
  id: string
  day: string
  subject: string
  topic: string
  minutes: number
  done: boolean
  resource: string
}

export type TimeFilter = 'Weekly' | 'Monthly' | 'Semester'

export interface SearchDoc {
  id: string
  title: string
  subtitle: string
  category: 'Student' | 'Subject' | 'Assessment' | 'Report' | 'Recommendation' | 'Page'
  path: string
}
