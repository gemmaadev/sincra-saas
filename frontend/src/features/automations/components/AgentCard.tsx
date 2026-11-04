import { Check } from 'lucide-react'
import { Card } from '@/shared/components'
import type { AiAgent } from '../automations.constants'

interface AgentCardProps {
  agent: AiAgent
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <img
          src={agent.avatar}
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-xl object-cover"
        />
        <div>
          <h2 className="text-lg font-semibold text-ink">{agent.name}</h2>
          <p className="text-sm text-ink-muted">{agent.role}</p>
        </div>
      </div>

      <p className="text-sm text-ink-muted">{agent.description}</p>

      <ul className="flex flex-col gap-2">
        {agent.capabilities.map((capability) => (
          <li key={capability} className="flex items-start gap-2 text-sm text-ink">
            <Check size={16} className="shrink-0 text-success" aria-hidden="true" />
            {capability}
          </li>
        ))}
      </ul>
    </Card>
  )
}
