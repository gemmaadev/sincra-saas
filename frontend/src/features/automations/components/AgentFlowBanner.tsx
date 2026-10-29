import { Card } from '@/shared/components'
import { AI_AGENTS, type AiAgent } from '../automations.constants'

export function AgentFlowBanner() {
  const [sincra, sincro] = AI_AGENTS

  return (
    <Card
      padding="lg"
      className="flex flex-col items-stretch divide-y divide-neutral-100 sm:flex-row sm:items-center sm:justify-center sm:divide-x sm:divide-y-0"
    >
      <FlowAgent agent={sincra} ringClassName="ring-primary/15" />
      <FlowAgent agent={sincro} ringClassName="ring-primary-dark/15" />
    </Card>
  )
}

function FlowAgent({ agent, ringClassName }: { agent: AiAgent; ringClassName: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 py-4 text-center sm:max-w-60 sm:px-8 sm:py-0">
      <img
        src={agent.avatar}
        alt=""
        width={64}
        height={64}
        className={`size-16 rounded-2xl object-cover ring-4 ${ringClassName}`}
      />
      <div>
        <p className="text-sm font-semibold text-ink">{agent.name}</p>
        <p className="text-xs font-medium text-ink-muted">{agent.role}</p>
      </div>
      <p className="text-xs text-ink-muted">{agent.tagline}</p>
    </div>
  )
}
