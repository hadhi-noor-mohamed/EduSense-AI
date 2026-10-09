import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { Toaster } from './components/ui/Toaster'
import { RequireAuth } from './components/RequireAuth'
import { PublicLayout } from './layouts/PublicLayout'
import { AppLayout } from './layouts/AppLayout'
import { ROLE_HOME } from './layouts/navConfig'
import type { Role } from './types'

import { LandingPage } from './pages/landing/LandingPage'
import { RolesPage } from './pages/RolesPage'
import { LoginPage } from './pages/auth/LoginPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPassword'
import { NotFoundPage } from './pages/NotFoundPage'

// student
import { DashboardPage as StudentDashboardPage } from './pages/student/DashboardPage'
import { PerformancePage } from './pages/student/PerformancePage'
import { RiskAnalysisPage } from './pages/student/RiskAnalysisPage'
import { RecommendationsPage as StudentRecommendationsPage } from './pages/student/RecommendationsPage'
import { LearningPlanPage } from './pages/student/LearningPlanPage'
import { AssessmentsPage as StudentAssessmentsPage } from './pages/student/AssessmentsPage'
import { AttendancePage } from './pages/student/AttendancePage'
import { ProgressPage } from './pages/student/ProgressPage'
import { ReportsPage as StudentReportsPage } from './pages/student/ReportsPage'
import { ProfilePage } from './pages/student/ProfilePage'
import { NotificationsPage as StudentNotificationsPage } from './pages/student/NotificationsPage'
import { SettingsPage as StudentSettingsPage } from './pages/student/SettingsPage'

// teacher
import { DashboardPage as TeacherDashboardPage } from './pages/teacher/DashboardPage'
import { StudentsPage as TeacherStudentsPage } from './pages/teacher/StudentsPage'
import { StudentDetailPage } from './pages/teacher/StudentDetailPage'
import { RiskMonitorPage } from './pages/teacher/RiskMonitorPage'
import { AnalyticsPage as TeacherAnalyticsPage } from './pages/teacher/AnalyticsPage'
import { InterventionsPage } from './pages/teacher/InterventionsPage'
import { AssessmentsPage as TeacherAssessmentsPage } from './pages/teacher/AssessmentsPage'
import { ReportsPage as TeacherReportsPage } from './pages/teacher/ReportsPage'
import { NotificationsPage as TeacherNotificationsPage } from './pages/teacher/NotificationsPage'
import { SettingsPage as TeacherSettingsPage } from './pages/teacher/SettingsPage'

// institution
import { DashboardPage as InstitutionDashboardPage } from './pages/institution/DashboardPage'
import { AnalyticsPage as InstitutionAnalyticsPage } from './pages/institution/AnalyticsPage'
import { StudentsPage as InstitutionStudentsPage } from './pages/institution/StudentsPage'
import { DepartmentsPage } from './pages/institution/DepartmentsPage'
import { ReportsPage as InstitutionReportsPage } from './pages/institution/ReportsPage'
import { NotificationsPage as InstitutionNotificationsPage } from './pages/institution/NotificationsPage'
import { SettingsPage as InstitutionSettingsPage } from './pages/institution/SettingsPage'

// organization / admin
import { DashboardPage as AdminDashboardPage } from './pages/admin/DashboardPage'
import { UsersPage } from './pages/admin/UsersPage'
import { InstitutionsPage } from './pages/admin/InstitutionsPage'
import { ProgramsPage } from './pages/admin/ProgramsPage'
import { AnalyticsPage as AdminAnalyticsPage } from './pages/admin/AnalyticsPage'
import { ReportsPage as AdminReportsPage } from './pages/admin/ReportsPage'
import { NotificationsPage as AdminNotificationsPage } from './pages/admin/NotificationsPage'
import { SettingsPage as AdminSettingsPage } from './pages/admin/SettingsPage'

const guard = (role: Role, node: ReactNode) => <RequireAuth role={role}>{node}</RequireAuth>

export default function App() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <>
      <Routes>
        {/* ---------------- public ---------------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/roles" element={<RolesPage />} />
        </Route>

        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ---------------- student ---------------- */}
        <Route element={<AppLayout />}>
          <Route path="/student" element={<Navigate to={ROLE_HOME.student} replace />} />
          <Route path="/student/dashboard" element={guard('student', <StudentDashboardPage />)} />
          <Route path="/student/performance" element={guard('student', <PerformancePage />)} />
          <Route path="/student/risk-analysis" element={guard('student', <RiskAnalysisPage />)} />
          <Route path="/student/recommendations" element={guard('student', <StudentRecommendationsPage />)} />
          <Route path="/student/learning-plan" element={guard('student', <LearningPlanPage />)} />
          <Route path="/student/assessments" element={guard('student', <StudentAssessmentsPage />)} />
          <Route path="/student/attendance" element={guard('student', <AttendancePage />)} />
          <Route path="/student/progress" element={guard('student', <ProgressPage />)} />
          <Route path="/student/reports" element={guard('student', <StudentReportsPage />)} />
          <Route path="/student/profile" element={guard('student', <ProfilePage />)} />
          <Route path="/student/notifications" element={guard('student', <StudentNotificationsPage />)} />
          <Route path="/student/settings" element={guard('student', <StudentSettingsPage />)} />

          {/* ---------------- teacher ---------------- */}
          <Route path="/teacher" element={<Navigate to={ROLE_HOME.teacher} replace />} />
          <Route path="/teacher/dashboard" element={guard('teacher', <TeacherDashboardPage />)} />
          <Route path="/teacher/students" element={guard('teacher', <TeacherStudentsPage />)} />
          <Route path="/teacher/students/:id" element={guard('teacher', <StudentDetailPage />)} />
          <Route path="/teacher/risk-monitor" element={guard('teacher', <RiskMonitorPage />)} />
          <Route path="/teacher/analytics" element={guard('teacher', <TeacherAnalyticsPage />)} />
          <Route path="/teacher/interventions" element={guard('teacher', <InterventionsPage />)} />
          <Route path="/teacher/assessments" element={guard('teacher', <TeacherAssessmentsPage />)} />
          <Route path="/teacher/reports" element={guard('teacher', <TeacherReportsPage />)} />
          <Route path="/teacher/notifications" element={guard('teacher', <TeacherNotificationsPage />)} />
          <Route path="/teacher/settings" element={guard('teacher', <TeacherSettingsPage />)} />

          {/* ---------------- institution ---------------- */}
          <Route path="/institution" element={<Navigate to={ROLE_HOME.institution} replace />} />
          <Route path="/institution/dashboard" element={guard('institution', <InstitutionDashboardPage />)} />
          <Route path="/institution/analytics" element={guard('institution', <InstitutionAnalyticsPage />)} />
          <Route path="/institution/students" element={guard('institution', <InstitutionStudentsPage />)} />
          <Route path="/institution/departments" element={guard('institution', <DepartmentsPage />)} />
          <Route path="/institution/reports" element={guard('institution', <InstitutionReportsPage />)} />
          <Route path="/institution/notifications" element={guard('institution', <InstitutionNotificationsPage />)} />
          <Route path="/institution/settings" element={guard('institution', <InstitutionSettingsPage />)} />

          {/* ---------------- organization / admin ---------------- */}
          <Route path="/admin" element={<Navigate to={ROLE_HOME.organization} replace />} />
          <Route path="/admin/dashboard" element={guard('organization', <AdminDashboardPage />)} />
          <Route path="/admin/users" element={guard('organization', <UsersPage />)} />
          <Route path="/admin/institutions" element={guard('organization', <InstitutionsPage />)} />
          <Route path="/admin/programs" element={guard('organization', <ProgramsPage />)} />
          <Route path="/admin/analytics" element={guard('organization', <AdminAnalyticsPage />)} />
          <Route path="/admin/reports" element={guard('organization', <AdminReportsPage />)} />
          <Route path="/admin/notifications" element={guard('organization', <AdminNotificationsPage />)} />
          <Route path="/admin/settings" element={guard('organization', <AdminSettingsPage />)} />
        </Route>

        {/* ---------------- fallback ---------------- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster />
    </>
  )
}
