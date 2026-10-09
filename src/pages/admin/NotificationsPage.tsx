import { NotificationsView } from '../../components/shared/NotificationsView'

export function NotificationsPage() {
  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <NotificationsView
        role="organization"
        title="Notification center"
        subtitle="Platform-level alerts, tenants and digest updates."
      />
    </div>
  )
}
