import { NotificationsView } from '../../components/shared/NotificationsView'

export function NotificationsPage() {
  return (
    <div className="animate-fade-in-up space-y-5 sm:space-y-6">
      <NotificationsView
        role="teacher"
        title="Notifications"
        subtitle="Cohort alerts, follow-ups and assessment updates."
      />
    </div>
  )
}
