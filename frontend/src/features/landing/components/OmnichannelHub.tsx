import type { CSSProperties, ReactNode } from 'react'
import { CHANNEL_BRANDS, type ChannelId } from '@/shared/channels/channels'

const CSS = `
@keyframes hubDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
  @keyframes hubTravel {
    0% { offset-distance: 0%; opacity: 0; }
    12% { opacity: 1; }
    82% { opacity: 1; }
    100% { offset-distance: 100%; opacity: 0; }
  }
  @keyframes hubPop {
    0% { opacity: 0; transform: scale(.62); }
    62% { opacity: 1; transform: scale(1.07); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes hubFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-7px); }
  }
  @keyframes hubSlide {
    0% { opacity: 0; transform: translateY(16px) scale(.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes hubRing {
    0% { transform: scale(.82); opacity: 0; }
    18% { opacity: .5; }
    100% { transform: scale(1.18); opacity: 0; }
  }
  @keyframes hubBreath {
    0%, 100% { box-shadow: 0 10px 34px rgba(108,77,246,.22), 0 0 0 0 rgba(140,110,250,.35); }
    50% { box-shadow: 0 10px 34px rgba(108,77,246,.28), 0 0 0 16px rgba(140,110,250,0); }
  }
  @keyframes hubBlink { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
  }
`

const RINGS = [
  { radius: 200, delay: '0s' },
  { radius: 300, delay: 'calc(1.8s / var(--speed))' },
  { radius: 400, delay: 'calc(3.6s / var(--speed))' },
]

const CONNECTOR_PATHS = [
  {
    d: 'M277,406 V414 Q277,442 305,442 H573',
    drawDelay: '.25s',
    drawDuration: 1,
    travelDuration: 3,
    travelDelay: 1.4,
  },
  {
    d: 'M423,619 V562 Q423,534 451,534 H600 Q628,534 628,506 V484',
    drawDelay: '.45s',
    drawDuration: 1,
    travelDuration: 3,
    travelDelay: 2.6,
  },
  {
    d: 'M658,208 V357',
    drawDelay: '.6s',
    drawDuration: 0.8,
    travelDuration: 2.4,
    travelDelay: 1.9,
  },
  {
    d: 'M982,352 H790 Q762,352 762,380 V414 Q762,442 740,442',
    drawDelay: '.75s',
    drawDuration: 1.1,
    travelDuration: 3.2,
    travelDelay: 2.2,
  },
  {
    d: 'M837,677 H770 Q742,677 742,649 V540 Q742,512 716,510',
    drawDelay: '.9s',
    drawDuration: 1.1,
    travelDuration: 3.2,
    travelDelay: 2.9,
  },
]

const BUBBLES = [
  {
    left: '26.14%',
    top: '75.73%',
    width: '7.98%',
    popDelay: '.5s',
    floatDuration: 5,
    floatDelay: 1.2,
    channelId: 'whatsapp',
  },
  {
    left: '16.03%',
    top: '36.59%',
    width: '7.41%',
    popDelay: '.3s',
    floatDuration: 4.4,
    floatDelay: 0.6,
    channelId: 'instagram',
  },
  {
    left: '42.88%',
    top: '11.71%',
    width: '7.98%',
    popDelay: '.65s',
    floatDuration: 4.8,
    floatDelay: 1.6,
    channelId: 'gmail',
  },
  {
    left: '69.94%',
    top: '36.10%',
    width: '7.98%',
    popDelay: '.8s',
    floatDuration: 5.2,
    floatDelay: 0.9,
    channelId: 'outlook',
  },
  {
    left: '59.62%',
    top: '75.73%',
    width: '7.98%',
    popDelay: '1.05s',
    floatDuration: 5.6,
    floatDelay: 1.4,
    channelId: 'messenger',
  },
]

function SeenTicks() {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ width: '1.3cqw', height: '1.3cqw' }}
      fill="none"
      stroke="#34b7f1"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 13l4 4 9-10" />
      <path d="M9 13l4 4 9-10" />
    </svg>
  )
}

interface ChatCardData {
  left: string
  top: string
  width: string
  delay: string
  avatarIndex: number
  message: string
  time: string
  channelId: ChannelId
  extraStatus?: ReactNode
}

const CHAT_CARDS: ChatCardData[] = [
  {
    left: '66.24%',
    top: '8.54%',
    width: '24.79%',
    delay: '1.5s',
    avatarIndex: 0,
    message: 'Hola, ¿tienen en stock la chaqueta?',
    time: '10:24',
    channelId: 'whatsapp',
    extraStatus: <SeenTicks />,
  },
  {
    left: '3.56%',
    top: '10.98%',
    width: '25.64%',
    delay: '1.9s',
    avatarIndex: 1,
    message: '¿Cuándo llega mi pedido? #12345',
    time: '08:52',
    channelId: 'instagram',
  },
  {
    left: '67.3%',
    top: '57.32%',
    width: '27.35%',
    delay: '2.3s',
    avatarIndex: 2,
    message: 'Quisiera un presupuesto para 50 unidades.',
    time: '09:47',
    channelId: 'outlook',
  },
]

function FloatingBubble({
  left,
  top,
  width,
  popDelay,
  floatDuration,
  floatDelay,
  children,
}: {
  left: string
  top: string
  width: string
  popDelay: string
  floatDuration: number
  floatDelay: number
  children: ReactNode
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        aspectRatio: '1',
        opacity: 0,
        animation: `hubPop calc(.7s / var(--speed)) cubic-bezier(.2,.9,.3,1.3) ${popDelay} forwards`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '26%',
          background: '#fff',
          boxShadow: '0 8px 24px rgba(74,60,140,.13)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `hubFloat calc(${floatDuration}s / var(--speed)) ease-in-out ${floatDelay}s infinite`,
          fontSize: '2rem',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function ChatCard({
  left,
  top,
  width,
  delay,
  avatarSrc,
  message,
  time,
  colorClassName,
  icon,
  extraStatus,
}: {
  left: string
  top: string
  width: string
  delay: string
  avatarSrc?: string
  message: string
  time: string
  colorClassName: string
  icon: ReactNode
  extraStatus?: ReactNode
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        background: '#fff',
        borderRadius: '1.1cqw',
        padding: '1.25cqw 1.4cqw',
        boxShadow: '0 10px 30px rgba(74,60,140,.12)',
        opacity: 0,
        animation: `hubSlide calc(.8s / var(--speed)) cubic-bezier(.2,.9,.3,1.2) ${delay} forwards`,
      }}
    >
      <div style={{ display: 'flex', gap: '.9cqw', alignItems: 'flex-start' }}>
        <div
          style={{
            flex: '0 0 auto',
            width: '3.4cqw',
            height: '3.4cqw',
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          <img
            src={avatarSrc}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#ece9f9' }}
          />
        </div>
        <div style={{ flex: '1 1 auto', minWidth: '0' }}>
          <div style={{ fontSize: '1.35cqw', lineHeight: '1.45', color: 'var(--color-ink)' }}>
            {message}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '.6cqw',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: '.5cqw',
            }}
          >
            {extraStatus}
            <span
              className={colorClassName}
              style={{ width: '1.7cqw', height: '1.7cqw', fontSize: '1.3cqw' }}
            >
              {icon}
            </span>
            <span style={{ fontSize: '1.15cqw', color: 'var(--color-ink-muted)' }}>{time}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface OmnichannelHubProps {
  accent?: string
  speed?: number
  showChats?: boolean
  avatars?: string[]
  style?: CSSProperties
  className?: string
}

export function OmnichannelHub({
  accent = '#8a6cf0',
  speed = 1,
  showChats = true,
  avatars = [],
  style,
  className,
}: OmnichannelHubProps) {
  return (
    <>
      <style>{CSS}</style>
      <div className={className} style={{ ...vars(accent, speed), ...style }}>
        <svg
          viewBox="0 0 1404 820"
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <g fill="none" stroke="#ded7fb" strokeWidth="1.5">
            {RINGS.map((ring) => (
              <circle
                key={ring.radius}
                cx="658"
                cy="442"
                r={ring.radius}
                style={
                  {
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                    animation: 'hubRing calc(5.4s / var(--speed)) ease-out infinite',
                    animationDelay: ring.delay,
                  } as CSSProperties
                }
              />
            ))}
            <circle cx="658" cy="442" r="250" stroke="#efeafd" />
            <circle cx="658" cy="442" r="355" stroke="#f2eefd" />
          </g>

          <g
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={0.85}
          >
            {CONNECTOR_PATHS.map((path) => (
              <path
                key={path.d}
                pathLength={1}
                d={path.d}
                style={
                  {
                    strokeDasharray: '1',
                    strokeDashoffset: '1',
                    animation: `hubDraw calc(${path.drawDuration}s / var(--speed)) ease-out ${path.drawDelay} forwards`,
                  } as CSSProperties
                }
              />
            ))}
          </g>

          <g fill="var(--accent)">
            {CONNECTOR_PATHS.map((path) => (
              <circle
                key={path.d}
                r={6}
                style={
                  {
                    offsetPath: `path('${path.d}')`,
                    animation: `hubTravel calc(${path.travelDuration}s / var(--speed)) ease-in-out ${path.travelDelay}s infinite`,
                  } as CSSProperties
                }
              />
            ))}
          </g>
        </svg>

        <div
          style={{
            position: 'absolute',
            left: '40.81%',
            top: '43.54%',
            width: '12.11%',
            aspectRatio: '1',
            borderRadius: '50%',
            background: '#fff',
            border: '2px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            animation:
              'hubPop calc(.8s / var(--speed)) cubic-bezier(.2,.9,.3,1.3) .05s forwards, hubBreath calc(3.4s / var(--speed)) ease-in-out 1s infinite',
          }}
        >
          <div
            style={{
              width: '58%',
              aspectRatio: '1',
              borderRadius: '26%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(90,70,235,.35)',
            }}
          >
            <svg
              viewBox="0 0 48 48"
              style={{ width: '66%', height: '66%' }}
              fill="none"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
            >
              <path d="M24 24 L10 24 M24 24 L38 24 M24 24 L24 12 M24 24 L24 36" />
              <circle cx="24" cy="24" r="4.4" fill="#fff" stroke="none" />
              <circle cx="8" cy="24" r="3.2" fill="#fff" stroke="none" />
              <circle cx="40" cy="24" r="3.2" fill="#fff" stroke="none" />
              <circle cx="24" cy="10" r="3.2" fill="#fff" stroke="none" />
              <circle cx="24" cy="38" r="3.2" fill="#fff" stroke="none" />
            </svg>
          </div>
        </div>

        {BUBBLES.map((bubble) => {
          const brand = CHANNEL_BRANDS.find((b) => b.id === bubble.channelId)!
          const Icon = brand.icon
          return (
            <FloatingBubble
              key={bubble.channelId}
              left={bubble.left}
              top={bubble.top}
              width={bubble.width}
              popDelay={bubble.popDelay}
              floatDuration={bubble.floatDuration}
              floatDelay={bubble.floatDelay}
            >
              <Icon className={brand.colorClassName} aria-hidden="true" />
            </FloatingBubble>
          )
        })}

        {showChats &&
          CHAT_CARDS.map((card) => {
            const brand = CHANNEL_BRANDS.find((b) => b.id === card.channelId)!
            const Icon = brand.icon
            return (
              <ChatCard
                key={card.channelId}
                left={card.left}
                top={card.top}
                width={card.width}
                delay={card.delay}
                avatarSrc={avatars[card.avatarIndex]}
                message={card.message}
                time={card.time}
                colorClassName={brand.colorClassName}
                icon={<Icon aria-label={brand.name} role="img" />}
                extraStatus={card.extraStatus}
              />
            )
          })}
      </div>
    </>
  )
}

function vars(accent: string, speed: number): CSSProperties {
  return {
    '--accent': accent,
    '--speed': String(speed),
    containerType: 'inline-size',
    position: 'relative',
    width: '100%',
    maxWidth: '1404px',
    margin: '0 auto',
    aspectRatio: '1404/820',
    background: 'linear-gradient(150deg,#f7f6ff 0%,#fdfdff 42%,#f4f2ff 100%)',
    borderRadius: '1.4cqw',
    overflow: 'hidden',
    fontFamily: 'var(--font-sans)',
  } as CSSProperties
}
