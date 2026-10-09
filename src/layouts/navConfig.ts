import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  CalendarRange,
  ClipboardCheck,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Settings,
  ShieldAlert,
  Target,
  TrendingUp,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '../types'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  /** included in the mobile bottom bar */
  primary?: boolean
}

export const NAV: Record<Role, NavItem[]> = {
  student: [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard, primary: true },
    { label: 'My Performance', path: '/student/performance', icon: TrendingUp, primary: true },
    { label: 'Risk Analysis', path: '/student/risk-analysis', icon: ShieldAlert, primary: true },
    { label: 'Recommendations', path: '/student/recommendations', icon: Lightbulb },
    { label: 'Learning Plan', path: '/student/learning-plan', icon: CalendarRange },
    { label: 'Assessments', path: '/student/assessments', icon: ClipboardCheck, primary: true },
    { label: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
    { label: 'Progress', path: '/student/progress', icon: Activity },
    { label: 'Reports', path: '/student/reports', icon: FileText },
    { label: 'Profile', path: '/student/profile', icon: User },
    { label: 'Notifications', path: '/student/notifications', icon: Bell },
    { label: 'Settings', path: '/student/settings', icon: Settings },
  ],
  teacher: [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard, primary: true },
    { label: 'Students', path: '/teacher/students', icon: Users, primary: true },
    { label: 'Risk Monitor', path: '/teacher/risk-monitor', icon: ShieldAlert, primary: true },
    { label: 'Analytics', path: '/teacher/analytics', icon: BarChart3 },
    { label: 'Interventions', path: '/teacher/interventions', icon: Target },
    { label: 'Assessments', path: '/teacher/assessments', icon: ClipboardCheck },
    { label: 'Reports', path: '/teacher/reports', icon: FileBarChart, primary: true },
    { label: 'Notifications', path: '/teacher/notifications', icon: Bell },
    { label: 'Settings', path: '/teacher/settings', icon: Settings },
  ],
  institution: [
    { label: 'Dashboard', path: '/institution/dashboard', icon: LayoutDashboard, primary: true },
    { label: 'Analytics', path: '/institution/analytics', icon: BarChart3, primary: true },
    { label: 'Students', path: '/institution/students', icon: Users, primary: true },
    { label: 'Departments', path: '/institution/departments', icon: Building2 },
    { label: 'Reports', path: '/institution/reports', icon: FileText, primary: true },
    { label: 'Notifications', path: '/institution/notifications', icon: Bell },
    { label: 'Settings', path: '/institution/settings', icon: Settings },
  ],
  organization: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, primary: true },
    { label: 'Users', path: '/admin/users', icon: Users, primary: true },
    { label: 'Institutions', path: '/admin/institutions', icon: Building2, primary: true },
    { label: 'Programs', path: '/admin/programs', icon: GraduationCap },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Reports', path: '/admin/reports', icon: FileText, primary: true },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ],
}

export const ROLE_LABEL: Record<Role, string> = {
  student: 'Student',
  teacher: 'Teacher / Faculty',
  institution: 'Institution',
  organization: 'Organization',
}

export const ROLE_HOME: Record<Role, string> = {
  student: '/student/dashboard',
  teacher: '/teacher/dashboard',
  institution: '/institution/dashboard',
  organization: '/admin/dashboard',
}

export const ROLE_LOGIN: Record<Role, string> = {
  student: '/login/student',
  teacher: '/login/teacher',
  institution: '/login/institution',
  organization: '/login/organization',
}
