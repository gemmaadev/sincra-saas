import { useState } from 'react'
import { Bell, MessageSquare, ShoppingCart, CalendarClock, FileText } from 'lucide-react'
import { Card } from '@/shared/components/card'
import { SincraButton } from '@/shared/components/button'
import { Select } from '@/shared/components/select'
import { SectionHeader } from './SectionHeader'

const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Solo por email' },
  { value: 'app', label: 'Solo dentro de la app' },
  { value: 'both', label: 'Email y dentro de la app' },
]

// TODO: (backend/user-feature): the preferred channel doesn't exist yet in the
// backend. Mocked here until GET /api/user/notification-settings exists.
const MOCK_PREFERRED_CHANNEL = 'both'

interface NotificationPref {
  key: string
  label: string
  icon: React.ReactNode
  enabled: boolean
}

const initialPrefs: NotificationPref[] = [
  { key: 'messages', label: 'Nuevos mensajes', icon: <MessageSquare size={18} />, enabled: true },
  {
    key: 'orders',
    label: 'Pedidos (nuevos, cambios, entregas)',
    icon: <ShoppingCart size={18} />,
    enabled: true,
  },
  {
    key: 'tasks',
    label: 'Tareas y recordatorios',
    icon: <CalendarClock size={18} />,
    enabled: true,
  },
  { key: 'digest', label: 'Resumen diario', icon: <FileText size={18} />, enabled: false },
]

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-neutral-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export function NotificationsTab() {
  const [prefs, setPrefs] = useState(initialPrefs)
  const [channel, setChannel] = useState(MOCK_PREFERRED_CHANNEL)
  const [saved, setSaved] = useState(false)

  function togglePref(key: string) {
    setPrefs((current) =>
      current.map((pref) => (pref.key === key ? { ...pref, enabled: !pref.enabled } : pref)),
    )
    setSaved(false)
  }

  // TODO: There is no real endpoint yet (see backend/user-feature): saving is simulated.
  function handleSave() {
    setSaved(true)
  }

  return (
    <Card className="flex flex-col gap-4">
      <SectionHeader
        icon={<Bell size={24} aria-hidden="true" />}
        title="Preferencias de notificación"
        description="Elige cómo y cuándo quieres saber de Sincra."
      />

      <div className="max-w-xs">
        <Select
          id="preferred-channel"
          label="Canal preferido"
          options={CHANNEL_OPTIONS}
          value={channel}
          onChange={(event) => {
            setChannel(event.target.value)
            setSaved(false)
          }}
        />
      </div>

      <ul className="flex flex-col divide-y divide-neutral-100">
        {prefs.map((pref) => (
          <li key={pref.key} className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-3 text-sm text-ink">
              <span className="text-ink-muted">{pref.icon}</span>
              {pref.label}
            </span>
            <Toggle
              checked={pref.enabled}
              onChange={() => togglePref(pref.key)}
              label={pref.label}
            />
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <SincraButton onClick={handleSave}>Guardar cambios</SincraButton>
        {saved && <span className="text-sm text-success">Cambios guardados</span>}
      </div>
    </Card>
  )
}
