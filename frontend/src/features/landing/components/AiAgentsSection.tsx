import { Section } from '@/shared'
import { AI_AGENTS, type AiAgent } from '@/features/automations/automations.constants'

const AGENT_BADGES: Record<AiAgent['id'], string> = {
  sincra: 'Agente detector',
  sincro: 'Agente de datos',
}

export function AiAgentsSection() {
  return (
    <Section id="ai-agents" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[8%] h-80 w-80 rounded-full bg-blob-2 blur-3xl max-lg:h-48 max-lg:w-48" />
        <div className="absolute -bottom-28 right-[5%] h-96 w-96 rounded-full bg-blob-4 blur-3xl max-lg:h-56 max-lg:w-56" />
      </div>

      <div className="relative flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <h2 className="max-w-xl text-4xl font-bold text-ink max-sm:text-3xl">
            Sincra y Sincro, tus agentes de IA
          </h2>
          <p className="max-w-2xl text-lg text-ink-muted max-lg:text-base">
            Dos agentes que trabajan juntos para detectar y dejar guardados tus clientes y pedidos
            nuevos, directamente desde tus mensajes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2">
          {AI_AGENTS.map((agent) => {
            const isSincra = agent.id === 'sincra'

            return (
              <div
                key={agent.id}
                className={`flex flex-col gap-5 rounded-card p-8 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
                  isSincra ? 'bg-primary' : 'border border-neutral-100 bg-surface-card'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <h3 className={`text-3xl font-bold ${isSincra ? 'text-white' : 'text-primary'}`}>
                    {agent.name}
                  </h3>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      isSincra ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {AGENT_BADGES[agent.id]}
                  </span>
                </div>

                <p
                  className={`text-sm leading-relaxed ${isSincra ? 'text-white/85' : 'text-ink-muted'}`}
                >
                  {agent.description}
                </p>

                <ul
                  className={`flex flex-col divide-y ${isSincra ? 'divide-white/15' : 'divide-neutral-100'}`}
                >
                  {agent.capabilities.map((capability) => (
                    <li
                      key={capability}
                      className={`flex items-start gap-3 py-3 text-sm first:pt-0 last:pb-0 ${
                        isSincra ? 'text-white/90' : 'text-ink'
                      }`}
                    >
                      <span
                        className={`mt-2 size-1.5 shrink-0 rounded-full ${
                          isSincra ? 'bg-white/70' : 'bg-primary'
                        }`}
                        aria-hidden="true"
                      />
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
