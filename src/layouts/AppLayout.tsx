import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
  User as UserIcon,
  X,
  LayoutGrid,
} from 'lucide-react'
import { useAppStore, selectUnread } from '../store/useAppStore'
import { NAV, ROLE_HOME, ROLE_LABEL } from './navConfig'
import { BrandMark } from '../components/shared/Brand'
import { SearchPalette } from '../components/shared/SearchPalette'
import { NotificationBell } from '../components/shared/NotificationBell'
import { Avatar } from '../components/ui/Avatar'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { Dropdown, MenuItem, MenuLabel, MenuSeparator } from '../components/ui/Dropdown'
import { ConfirmDialog } from '../components/ui/Modal'
import { cn } from '../utils/cn'

function SidebarContent({
  collapsed,
  onNavigate,
  onCollapseToggle,
}: {
  collapsed: boolean
  onNavigate?: () => void
  onCollapseToggle?: () => void
}) {
  const user = useAppStore((s) => s.user)
  const role = user?.role ?? 'student'
  const items = NAV[role]

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-line',
          collapsed ? 'justify-center px-3' : 'justify-between px-5',
        )}
      >
        {!collapsed && <BrandMark size="sm" />}
        {collapsed && <BrandMark size="sm" to={ROLE_HOME[role]} className="[&>span:last-child]:hidden" />}
        {onCollapseToggle && (
          <button
            type="button"
            onClick={onCollapseToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-panel-muted hover:text-ink lg:inline-flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        {!collapsed && (
          <p className="mb-2 px-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
            {ROLE_LABEL[role]}
          </p>
        )}
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-all duration-150',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-ink-muted hover:bg-panel-muted hover:text-ink',
                  )
                }
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl border border-dashed border-line bg-panel-muted px-3 py-2.5">
            <p className="text-[11px] font-semibold text-ink-muted">Prototype build</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-subtle">
              Predictions come from a mock ML service for demonstration.
            </p>
          </div>
        )}
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          <Avatar name={user?.name ?? 'User'} size="sm" tone="indigo" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-[11.5px] text-ink-subtle">{user?.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppStore((s) => s.user)
  const profile = useAppStore((s) => s.profile)
  const logout = useAppStore((s) => s.logout)
  const notifications = useAppStore((s) => s.notifications)
  const pushToast = useAppStore((s) => s.pushToast)

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const role = user?.role ?? 'student'
  const unread = selectUnread(notifications, role)
  // Only students own an editable profile name; every other role shows the
  // name of the account that is actually signed in.
  const displayName =
    role === 'student'
      ? profile.name || user?.name || 'Student'
      : user?.name || profile.name || 'User'

  useEffect(() => {
    setMobileOpen(false)
    setBellOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.title =
      unread > 0
        ? `(${unread}) EduSense AI`
        : 'EduSense AI — Predict. Understand. Improve.'
  }, [unread])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  if (!user) return null

  const doLogout = () => {
    logout()
    pushToast({ title: 'Signed out', description: 'Your session has ended.', tone: 'info' })
    navigate('/')
  }

  const primary = NAV[role].filter((n) => n.primary).slice(0, 4)

  return (
    <div className="min-h-screen bg-base">
      {/* ---------- desktop sidebar ---------- */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-panel transition-[width] duration-300 lg:flex',
          collapsed ? 'w-[76px]' : 'w-[260px]',
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onCollapseToggle={() => setCollapsed((c) => !c)}
        />
      </aside>

      {/* ---------- mobile drawer ---------- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-slate-950/55"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-[268px] animate-slide-drawer border-r border-line bg-panel">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 rounded-lg p-1.5 text-ink-faint hover:bg-panel-muted"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* ---------- content ---------- */}
      <div
        className={cn(
          'transition-[padding] duration-300',
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[260px]',
        )}
      >
        <header className="sticky top-0 z-30 border-b border-line bg-panel/85 backdrop-blur-md">
          <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-panel-muted lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="lg:hidden">
              <BrandMark size="sm" to={ROLE_HOME[role]} />
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-[13px] text-ink-faint transition-colors hover:border-accent/40 hover:text-ink-subtle md:inline-flex xl:w-72"
              >
                <Search className="h-4 w-4" aria-hidden />
                <span className="truncate">Search EduSense…</span>
                <kbd className="ml-auto rounded border border-line bg-panel-muted px-1.5 py-0.5 text-[10px] font-medium">
                  ⌘K
                </kbd>
              </button>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-panel-muted md:hidden"
              >
                <Search className="h-4.5 w-4.5" />
              </button>

              <ThemeToggle />

              <NotificationBell
                role={role}
                menuOpen={bellOpen}
                onToggle={() => setBellOpen((v) => !v)}
              />

              <Dropdown
                menuLabel="Account menu"
                trigger={({ toggle, open }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    aria-expanded={open}
                    className="ml-0.5 flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-panel-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:pr-2.5"
                  >
                    <Avatar name={displayName} size="sm" tone="indigo" />
                    <span className="hidden min-w-0 text-left sm:block">
                      <span className="block max-w-[140px] truncate text-[13px] font-semibold leading-tight text-ink">
                        {displayName}
                      </span>
                      <span className="block text-[11px] leading-tight text-ink-subtle">
                        {ROLE_LABEL[role]}
                      </span>
                    </span>
                  </button>
                )}
              >
                {(close) => (
                  <>
                    <div className="flex items-center gap-3 px-3.5 py-2.5">
                      <Avatar name={displayName} size="lg" tone="indigo" />
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-semibold text-ink">
                          {displayName}
                        </p>
                        <p className="truncate text-[12px] text-ink-subtle">{user.email}</p>
                        <p className="mt-1 inline-flex rounded bg-panel-muted px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted">
                          {ROLE_LABEL[role]}
                        </p>
                      </div>
                    </div>
                    <MenuSeparator />
                    <MenuLabel>Account</MenuLabel>
                    <MenuItem
                      icon={<UserIcon className="h-4 w-4" />}
                      onClick={() => {
                        close()
                        navigate(
                          role === 'student'
                            ? '/student/profile'
                            : role === 'teacher'
                              ? '/teacher/settings'
                              : `/${role === 'organization' ? 'admin' : role}/settings`,
                        )
                      }}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      icon={<Settings className="h-4 w-4" />}
                      onClick={() => {
                        close()
                        navigate(
                          `/${role === 'organization' ? 'admin' : role}/settings`,
                        )
                      }}
                    >
                      Settings
                    </MenuItem>
                    <MenuItem
                      icon={<LayoutGrid className="h-4 w-4" />}
                      onClick={() => {
                        close()
                        navigate('/roles')
                      }}
                    >
                      Switch role
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      danger
                      icon={<LogOut className="h-4 w-4" />}
                      onClick={() => {
                        close()
                        setConfirmLogout(true)
                      }}
                    >
                      Log out
                    </MenuItem>
                  </>
                )}
              </Dropdown>
            </div>
          </div>
        </header>

        <main className="px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* ---------- mobile bottom navigation ---------- */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/95 backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {primary.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2.5 text-[10.5px] font-medium transition-colors',
                  isActive ? 'text-accent' : 'text-ink-subtle',
                )
              }
            >
              <item.icon className="h-5 w-5" aria-hidden />
              <span className="w-full truncate text-center">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2.5 text-[10.5px] font-medium text-ink-subtle"
          >
            <Menu className="h-5 w-5" aria-hidden />
            <span>More</span>
          </button>
        </div>
      </nav>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={doLogout}
        title="Log out of EduSense AI?"
        message="You will be returned to the role selection screen. Your demo data stays saved in this browser."
        confirmLabel="Log out"
        tone="danger"
      />
    </div>
  )
}
