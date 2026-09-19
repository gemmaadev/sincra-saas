import { Search } from 'lucide-react'
import { Avatar } from '@/shared/components/avatar'
import { Input } from '@/shared/components/input'

export function HeaderApp() {
  return (
    <header className="flex items-center justify-between border-b border-neutral-100 px-6 py-3">
      <div className="max-w-2xl flex-1">
        <Input
          placeholder="Buscar conversaciones, clientes, pedidos..."
          icon={<Search size={18} />}
          className="bg-neutral-50"
        />
      </div>
      <div className="flex items-center gap-4">
        <Avatar name="Laura García" size="md" />
      </div>
    </header>
  )
}
