import { Tabs } from '@/shared/components/tabs'
import { ProfileHeader } from '@/features/profile/components/ProfileHeader'
import { PersonalInfoTab } from '@/features/profile/components/PersonalInfoTab'
import { NotificationsTab } from '@/features/profile/components/NotificationsTab'
import { SecurityTab } from '@/features/profile/components/SecurityTab'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader user={user} />

      <Tabs
        defaultTab="personal"
        tabs={[
          {
            key: 'personal',
            label: 'Información personal',
            content: <PersonalInfoTab user={user} />,
          },
          { key: 'notifications', label: 'Notificaciones', content: <NotificationsTab /> },
          { key: 'security', label: 'Seguridad', content: <SecurityTab /> },
        ]}
      />
    </div>
  )
}
