// TODO: Refactor
import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'

const STEPS = [
  {
    title: 'Llegan de todas partes',
    text: 'WhatsApp, Instagram, Gmail, Outlook, Messenger... Cinco pestañas abiertas y ninguna respuesta a tiempo.',
    background: 'var(--color-bg)',
  },
  {
    title: 'Se ordenan en un inbox',
    text: 'Cada conversación con su ficha de cliente, su historial y su etiqueta. Tu equipo sabe qué toca.',
    background: 'color-mix(in srgb, var(--color-primary) 35%, white)',
  },
  {
    title: 'Se convierten en pedidos',
    text: 'De la conversación al pedido en un clic, con seguimiento de estado y estadísticas que sí miras.',
    background: 'var(--color-primary)',
  },
]

const INBOX_MESSAGES = [
  {
    color: 'var(--color-whatsapp)',
    sender: 'Marta',
    text: '¿Tenéis la chaqueta en stock?',
    time: '10:24',
    unread: false,
  },
  {
    color: 'var(--color-instagram)',
    sender: 'Luis',
    text: 'Pedido #12345',
    time: '08:52',
    unread: true,
  },
  {
    color: 'var(--color-outlook)',
    sender: 'Miquel',
    text: 'Presupuesto 50 uds',
    time: '09:47',
    unread: false,
  },
]

export function HowWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const stepCardRefs = useRef<(HTMLDivElement | null)[]>([])
  const stepNumberRefs = useRef<(HTMLSpanElement | null)[]>([])
  const stepTitleRefs = useRef<(HTMLDivElement | null)[]>([])
  const stepTextRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const stepPanelRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section || !stickyRef.current) return

      const sectionRect = section.getBoundingClientRect()
      const scrollableHeight = sectionRect.height - window.innerHeight
      const scrollProgress = Math.min(1, Math.max(0, -sectionRect.top / (scrollableHeight || 1)))

      const activeStepIndex = scrollProgress < 0.36 ? 0 : scrollProgress < 0.7 ? 1 : 2
      const isDarkPhase = activeStepIndex === 2

      stickyRef.current.style.background = STEPS[activeStepIndex].background

      if (titleRef.current) {
        titleRef.current.style.color = isDarkPhase ? '#fff' : 'var(--color-ink)'
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${(scrollProgress * 100).toFixed(1)}%`
      }

      STEPS.forEach((_, stepIndex) => {
        const isActive = stepIndex === activeStepIndex
        const card = stepCardRefs.current[stepIndex]
        const numberBadge = stepNumberRefs.current[stepIndex]

        if (card) {
          card.style.opacity = isActive ? '1' : '.5'
          card.style.background = '#fff'
          card.style.borderColor = isActive ? 'var(--color-primary)' : 'var(--color-neutral-200)'
        }

        if (numberBadge) {
          numberBadge.style.background = isActive
            ? 'var(--color-primary)'
            : 'var(--color-neutral-100)'
          numberBadge.style.color = isActive ? '#fff' : 'var(--color-ink)'
        }

        if (stepTitleRefs.current[stepIndex])
          stepTitleRefs.current[stepIndex]!.style.color = 'var(--color-ink)'
        if (stepTextRefs.current[stepIndex])
          stepTextRefs.current[stepIndex]!.style.color = 'var(--color-ink-muted)'

        const panel = stepPanelRefs.current[stepIndex]
        if (panel) {
          panel.style.opacity = isActive ? '1' : '0'
          panel.style.transform = isActive
            ? 'translateY(0) scale(1)'
            : 'translateY(14px) scale(.98)'
          panel.style.pointerEvents = isActive ? 'auto' : 'none'
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div ref={sectionRef} className="relative h-[340vh] w-full">
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen items-center overflow-hidden bg-bg transition-colors duration-700 ease-in-out"
      >
        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-2 items-center gap-16 px-8 max-lg:grid-cols-1 max-lg:gap-10">
          <div className="flex flex-col gap-8">
            <h2
              ref={titleRef}
              className="max-w-[16ch] text-balance text-5xl font-bold leading-[1.07] tracking-tight transition-colors duration-700 max-lg:text-4xl max-sm:text-3xl"
            >
              De mensajes sueltos a pedidos cerrados
            </h2>

            <div className="flex flex-col gap-4">
              {STEPS.map((step, stepIndex) => (
                <div
                  key={step.title}
                  ref={(element) => {
                    stepCardRefs.current[stepIndex] = element
                  }}
                  className="flex gap-4 rounded-2xl border p-5 transition-[background,border-color,opacity] duration-500"
                >
                  <span
                    ref={(element) => {
                      stepNumberRefs.current[stepIndex] = element
                    }}
                    className="flex size-8 shrink-0 items-center justify-center rounded-[9px] text-sm font-semibold transition-colors duration-500"
                  >
                    {stepIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <div
                      ref={(element) => {
                        stepTitleRefs.current[stepIndex] = element
                      }}
                      className="text-lg font-semibold transition-colors duration-500"
                    >
                      {step.title}
                    </div>
                    <p
                      ref={(element) => {
                        stepTextRefs.current[stepIndex] = element
                      }}
                      className="mt-1.5 text-[15px] leading-relaxed transition-colors duration-500"
                    >
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex aspect-square max-h-[70vh] items-center justify-center max-lg:aspect-4/3">
            <div
              ref={(element) => {
                stepPanelRefs.current[0] = element
              }}
              className="absolute inset-0 flex flex-col justify-center gap-3.5 transition-all duration-500"
            >
              {INBOX_MESSAGES.map((message, index) => (
                <div
                  key={message.text}
                  className={`flex w-[78%] items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl ${index % 2 === 0 ? 'self-start -rotate-2' : 'self-end rotate-1'}`}
                >
                  <span
                    className="size-6 shrink-0 rounded-lg"
                    style={{ background: message.color }}
                  />
                  <span className="text-[15px] text-ink">{message.text}</span>
                </div>
              ))}
            </div>

            <div
              ref={(element) => {
                stepPanelRefs.current[1] = element
              }}
              className="absolute inset-0 flex items-center opacity-0 transition-all duration-500"
            >
              <div className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
                <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-3.5">
                  <span className="size-2.5 rounded-full bg-primary" />
                  <span className="text-sm font-semibold text-ink">Inbox · 3 sin leer</span>
                </div>
                {INBOX_MESSAGES.map((message) => (
                  <div
                    key={message.text}
                    className={`flex items-center gap-3 border-b border-neutral-50 px-5 py-3.5 last:border-0 ${message.unread ? 'bg-surface-hover' : ''}`}
                  >
                    <span
                      className="size-5.5 shrink-0 rounded-md"
                      style={{ background: message.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">
                      {message.sender} · {message.text}
                    </span>
                    <span className="text-xs text-ink-muted">{message.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={(element) => {
                stepPanelRefs.current[2] = element
              }}
              className="absolute inset-0 flex items-center opacity-0 transition-all duration-500"
            >
              <div className="flex w-full flex-col gap-5 rounded-2xl bg-white p-7 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">Pedido #12346</span>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                    Confirmado
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 text-sm">
                  <div className="flex justify-between text-ink-muted">
                    <span>Chaqueta lana · 2 uds</span>
                    <span>118 €</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Envío express</span>
                    <span>6 €</span>
                  </div>
                  <div className="h-px bg-neutral-100" />
                  <div className="flex justify-between text-base font-semibold text-ink">
                    <span>Total</span>
                    <span>124 €</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-ink-muted">
                  <Check size={14} className="text-primary" />
                  Creado desde la conversación de WhatsApp
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-0.75 bg-neutral-100">
          <div
            ref={progressBarRef}
            className="h-full bg-primary transition-[width] duration-100"
            style={{ width: '0%' }}
          />
        </div>
      </div>
    </div>
  )
}
