import { NotificationsView } from '../../components/shared/NotificationsView'

export function NotificationsPage() {
  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <NotificationsView
        role="student"
        title="Notifications"
        subtitle="Everything that changed in your academic plan — risk alerts, deadlines, recommendations and teacher notes."
      />
    </div>
  )
}
