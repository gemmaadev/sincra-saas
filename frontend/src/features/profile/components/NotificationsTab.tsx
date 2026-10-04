import { useState } from 'react'
import { Bell, MessageSquare, ShoppingCart, CalendarClock, FileText } from 'lucide-react'
import { Card } from '@/shared/components/card'
import { SincraButton } from '@/shared/components/button'
import { Toggle } from '@/shared/components/toggle'
import { SectionHeader } from './SectionHeader'
import { useProfile } from '../hooks/useProfile'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import type { NotificationPrefs } from '../types/profile.types'

interface PrefDefinition {
  key: keyof NotificationPrefs
  label: string
  icon: React.ReactNode
}

const PREF_DEFINITIONS: PrefDefinition[] = [
  {
    key: 'unansweredCommunications',
    label: 'Mensajes sin responder',
    icon: <MessageSquare size={18} />,
  },
  {
    key: 'newOrders',
    label: 'Pedidos (nuevos, cambios, entregas)',
    icon: <ShoppingCart size={18} />,
  },
  { key: 'followUpTasks', label: 'Tareas y recordatorios', icon: <CalendarClock size={18} /> },
  { key: 'weeklyDigest', label: 'Resumen semanal', icon: <FileText size={18} /> },
]

interface NotificationPreferencesFormProps {
  notificationPrefs: NotificationPrefs | null
}

function NotificationPreferencesForm({ notificationPrefs }: NotificationPreferencesFormProps) {
  const updateProfile = useUpdateProfile()
  const [prefs, setPrefs] = useState<NotificationPrefs>(notificationPrefs ?? {})
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function togglePref(key: keyof NotificationPrefs) {
    setPrefs((current) => ({ ...current, [key]: !current[key] }))
    setSaved(false)
  }

  async function handleSave() {
    setError(null)
    try {
      await updateProfile.mutateAsync({ notificationPrefs: prefs })
      setSaved(true)
    } catch {
      setError('No se pudieron guardar los cambios. Inténtalo de nuevo.')
    }
  }

  return (
    <>
      <ul className="flex flex-col divide-y divide-neutral-100">
        {PREF_DEFINITIONS.map((pref) => (
          <li key={pref.key} className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-3 text-sm text-ink">
              <span className="text-ink-muted">{pref.icon}</span>
              {pref.label}
            </span>
            <Toggle
              checked={prefs[pref.key] ?? false}
              onChange={() => togglePref(pref.key)}
              label={pref.label}
            />
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <SincraButton onClick={handleSave} loading={updateProfile.isPending}>
          Guardar cambios
        </SincraButton>
        {saved && <span className="text-sm text-success">Cambios guardados</span>}
        {error && <span className="text-sm text-error">{error}</span>}
      </div>
    </>
  )
}

export function NotificationsTab() {
  const { data: profile, isLoading, isError } = useProfile()

  if (isLoading) {
    return (
      <Card className="flex flex-col gap-4">
        <SectionHeader
          icon={<Bell size={24} aria-hidden="true" />}
          title="Preferencias de notificación"
        />
        <p className="text-sm text-ink-muted">Cargando preferencias…</p>
      </Card>
    )
  }

  if (isError || !profile) {
    return (
      <Card className="flex flex-col gap-4">
        <SectionHeader
          icon={<Bell size={24} aria-hidden="true" />}
          title="Preferencias de notificación"
        />
        <p className="text-sm text-error">
          No se pudieron cargar tus preferencias. Inténtalo de nuevo más tarde.
        </p>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col gap-4">
      <SectionHeader
        icon={<Bell size={24} aria-hidden="true" />}
        title="Preferencias de notificación"
        description="Elige qué notificaciones quieres recibir de Sincra."
      />
      <NotificationPreferencesForm notificationPrefs={profile.notificationPrefs} />
    </Card>
  )
}
