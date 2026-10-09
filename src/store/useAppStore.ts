import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Assessment,
  Intervention,
  InterventionStatus,
  LearningTask,
  NotificationItem,
  Profile,
  Recommendation,
  RiskLevel,
  Role,
  User,
} from '../types'
import {
  ASSESSMENTS,
  DEMO_ACCOUNTS,
  INSTITUTIONS,
  INITIAL_NOTIFICATIONS,
  INTERVENTIONS,
  LEARNING_TASKS,
} from '../data/seed'

// ---------------------------------------------------------------------------
// EduSense AI — global persisted application state
// ---------------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark'

export interface Settings {
  theme: ThemeMode
  language: 'en' | 'ta'
  notifications: {
    email: boolean
    riskAlerts: boolean
    assessmentReminders: boolean
    recommendationUpdates: boolean
  }
  privacy: {
    shareAnonymisedData: boolean
    showRiskToTeachers: boolean
    activityLogging: boolean
  }
}

export interface StudentNote {
  id: string
  studentId: string
  author: string
  text: string
  createdAt: string
}

export interface QuizResult {
  quizId: string
  correct: number
  total: number
  score: number
  at: string
}

export interface Toast {
  id: string
  title: string
  description?: string
  tone: 'success' | 'error' | 'info' | 'warning'
}

let seq = 0
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(seq += 1)}`

const DEFAULT_PROFILE: Profile = {
  name: 'Ananya Iyer',
  email: 'student@demo.com',
  phone: '+91 98400 12345',
  department: 'Computer Science & Engineering',
  year: '3rd Year',
  bio: 'B.Tech CSE student focusing on machine learning and data structures. Part of the campus coding club.',
  avatar: 'indigo',
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    riskAlerts: true,
    assessmentReminders: true,
    recommendationUpdates: true,
  },
  privacy: {
    shareAnonymisedData: true,
    showRiskToTeachers: true,
    activityLogging: true,
  },
}

interface AppState {
  // auth
  user: User | null
  login: (email: string, password: string) => { ok: boolean; error?: string }
  logout: () => void

  // theme
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  toggleTheme: () => void

  // profile
  profile: Profile
  updateProfile: (patch: Partial<Profile>) => void
  avatarTone: string
  setAvatarTone: (tone: string) => void

  // recommendations
  recommendations: Recommendation[]
  recommendationsSeeded: boolean
  ensureRecommendations: (seed: Recommendation[]) => void
  setRecommendationStatus: (id: string, status: Recommendation['status']) => void

  // learning plan
  learningTasks: LearningTask[]
  toggleLearningTask: (id: string) => void
  resetLearningTasks: () => void

  // assessments + quiz
  assessments: Assessment[]
  quizResults: Record<string, QuizResult>
  submitQuizResult: (
    quizId: string,
    subject: string,
    correct: number,
    total: number,
  ) => QuizResult

  // notifications
  notifications: NotificationItem[]
  pushNotification: (n: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllRead: (role: Role) => void
  deleteNotification: (id: string) => void

  // teacher: interventions + notes
  interventions: Intervention[]
  addIntervention: (
    i: Omit<Intervention, 'id' | 'updatedAt'>,
  ) => void
  updateIntervention: (id: string, patch: Partial<Intervention>) => void
  setInterventionStatus: (id: string, status: InterventionStatus) => void
  deleteIntervention: (id: string) => void
  notes: StudentNote[]
  addNote: (studentId: string, author: string, text: string) => void
  deleteNote: (id: string) => void

  // admin: institutions
  institutions: typeof INSTITUTIONS
  addInstitution: (i: Omit<(typeof INSTITUTIONS)[number], 'id'>) => void
  updateInstitution: (id: string, patch: Partial<(typeof INSTITUTIONS)[number]>) => void
  setInstitutionStatus: (id: string, status: 'Active' | 'Inactive') => void

  // settings
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void

  // toasts (ephemeral but kept here for simplicity)
  toasts: Toast[]
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ---------------- auth ----------------
      user: null,
      login: (email, password) => {
        const trimmed = email.trim().toLowerCase()
        if (!trimmed) return { ok: false, error: 'Please enter your email address.' }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
          return { ok: false, error: 'That does not look like a valid email address.' }
        if (!password) return { ok: false, error: 'Please enter your password.' }

        const account = DEMO_ACCOUNTS.find((a) => a.email === trimmed)
        if (!account) return { ok: false, error: 'No demo account found for that email.' }
        if (account.password !== password)
          return { ok: false, error: 'Incorrect password. Try password123 for demo accounts.' }

        const user: User = {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role,
          password: '',
          avatar: 'indigo',
        }
        set({ user })
        if (account.role === 'student') {
          set({
            profile: { ...get().profile, name: account.name, email: account.email },
          })
        }
        return { ok: true }
      },
      logout: () => set({ user: null }),

      // ---------------- theme ----------------
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),

      // ---------------- profile ----------------
      profile: DEFAULT_PROFILE,
      updateProfile: (patch) => set({ profile: { ...get().profile, ...patch } }),
      avatarTone: 'indigo',
      setAvatarTone: (avatarTone) => set({ avatarTone }),

      // ---------------- recommendations ----------------
      recommendations: [],
      recommendationsSeeded: false,
      ensureRecommendations: (seed) => {
        if (get().recommendationsSeeded) return
        set({ recommendations: seed, recommendationsSeeded: true })
      },
      setRecommendationStatus: (id, status) =>
        set({
          recommendations: get().recommendations.map((r) =>
            r.id === id ? { ...r, status } : r,
          ),
        }),

      // ---------------- learning plan ----------------
      learningTasks: LEARNING_TASKS,
      toggleLearningTask: (id) =>
        set({
          learningTasks: get().learningTasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t,
          ),
        }),
      resetLearningTasks: () => set({ learningTasks: LEARNING_TASKS }),

      // ---------------- assessments + quiz ----------------
      assessments: ASSESSMENTS,
      quizResults: {},
      submitQuizResult: (quizId, subject, correct, total) => {
        const score = Math.round((correct / total) * 100)
        const result: QuizResult = {
          quizId,
          correct,
          total,
          score,
          at: new Date().toISOString(),
        }

        const assessments = get().assessments.map((a) => {
          if (a.subject === subject && a.type === 'Quiz' && a.status !== 'Completed') {
            return { ...a, status: 'Completed' as const, score }
          }
          return a
        })

        set({
          quizResults: { ...get().quizResults, [quizId]: result },
          assessments,
        })
        return result
      },

      // ---------------- notifications ----------------
      notifications: INITIAL_NOTIFICATIONS,
      pushNotification: (n) =>
        set({
          notifications: [
            {
              ...n,
              id: uid('NOT'),
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...get().notifications,
          ],
        }),
      markNotificationRead: (id) =>
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        }),
      markAllRead: (role) =>
        set({
          notifications: get().notifications.map((n) =>
            n.roles.includes(role) ? { ...n, read: true } : n,
          ),
        }),
      deleteNotification: (id) =>
        set({ notifications: get().notifications.filter((n) => n.id !== id) }),

      // ---------------- interventions ----------------
      interventions: INTERVENTIONS,
      addIntervention: (i) =>
        set({
          interventions: [
            { ...i, id: uid('INT'), updatedAt: new Date().toISOString() },
            ...get().interventions,
          ],
        }),
      updateIntervention: (id, patch) =>
        set({
          interventions: get().interventions.map((x) =>
            x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x,
          ),
        }),
      setInterventionStatus: (id, status) =>
        set({
          interventions: get().interventions.map((x) =>
            x.id === id
              ? { ...x, status, updatedAt: new Date().toISOString() }
              : x,
          ),
        }),
      deleteIntervention: (id) =>
        set({ interventions: get().interventions.filter((x) => x.id !== id) }),

      notes: [],
      addNote: (studentId, author, text) =>
        set({
          notes: [
            {
              id: uid('NOTE'),
              studentId,
              author,
              text,
              createdAt: new Date().toISOString(),
            },
            ...get().notes,
          ],
        }),
      deleteNote: (id) => set({ notes: get().notes.filter((n) => n.id !== id) }),

      // ---------------- institutions ----------------
      institutions: INSTITUTIONS,
      addInstitution: (i) =>
        set({ institutions: [{ ...i, id: uid('INS') }, ...get().institutions] }),
      updateInstitution: (id, patch) =>
        set({
          institutions: get().institutions.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        }),
      setInstitutionStatus: (id, status) =>
        set({
          institutions: get().institutions.map((x) =>
            x.id === id ? { ...x, status } : x,
          ),
        }),

      // ---------------- settings ----------------
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      // ---------------- toasts ----------------
      toasts: [],
      pushToast: (t) => {
        const id = uid('TST')
        set({ toasts: [...get().toasts, { ...t, id }] })
        if (typeof window !== 'undefined') {
          window.setTimeout(() => {
            set({ toasts: get().toasts.filter((x) => x.id !== id) })
          }, 4200)
        }
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
    }),
    {
      name: 'edusense-app-v1',
      partialize: (s) => ({
        user: s.user,
        theme: s.theme,
        profile: s.profile,
        avatarTone: s.avatarTone,
        recommendations: s.recommendations,
        recommendationsSeeded: s.recommendationsSeeded,
        learningTasks: s.learningTasks,
        assessments: s.assessments,
        quizResults: s.quizResults,
        notifications: s.notifications,
        interventions: s.interventions,
        notes: s.notes,
        institutions: s.institutions,
        settings: s.settings,
      }),
    },
  ),
)

/** Convenience helpers used across pages. */
export const selectUnread = (notifications: NotificationItem[], role: Role) =>
  notifications.filter((n) => !n.read && n.roles.includes(role)).length

export const selectRoleNotifications = (
  notifications: NotificationItem[],
  role: Role,
) => notifications.filter((n) => n.roles.includes(role))

export const RISK_ORDER: Record<RiskLevel, number> = { High: 0, Medium: 1, Low: 2 }
