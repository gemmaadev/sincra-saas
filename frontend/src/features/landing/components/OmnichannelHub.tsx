import type { CSSProperties } from 'react'

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
            <circle
              cx="658"
              cy="442"
              r="200"
              style={
                {
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animation: 'hubRing calc(5.4s / var(--speed)) ease-out infinite',
                } as CSSProperties
              }
            ></circle>
            <circle
              cx="658"
              cy="442"
              r="300"
              style={
                {
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animation: 'hubRing calc(5.4s / var(--speed)) ease-out infinite',
                  animationDelay: 'calc(1.8s / var(--speed))',
                } as CSSProperties
              }
            ></circle>
            <circle
              cx="658"
              cy="442"
              r="400"
              style={
                {
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animation: 'hubRing calc(5.4s / var(--speed)) ease-out infinite',
                  animationDelay: 'calc(3.6s / var(--speed))',
                } as CSSProperties
              }
            ></circle>
            <circle cx="658" cy="442" r="250" stroke="#efeafd"></circle>
            <circle cx="658" cy="442" r="355" stroke="#f2eefd"></circle>
          </g>

          <g
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={0.85}
          >
            <path
              pathLength={1}
              d="M277,406 V414 Q277,442 305,442 H573"
              style={
                {
                  strokeDasharray: '1',
                  strokeDashoffset: '1',
                  animation: 'hubDraw calc(1s / var(--speed)) ease-out .25s forwards',
                } as CSSProperties
              }
            ></path>
            <path
              pathLength={1}
              d="M423,619 V562 Q423,534 451,534 H600 Q628,534 628,506 V484"
              style={
                {
                  strokeDasharray: '1',
                  strokeDashoffset: '1',
                  animation: 'hubDraw calc(1s / var(--speed)) ease-out .45s forwards',
                } as CSSProperties
              }
            ></path>
            <path
              pathLength={1}
              d="M658,208 V357"
              style={
                {
                  strokeDasharray: '1',
                  strokeDashoffset: '1',
                  animation: 'hubDraw calc(.8s / var(--speed)) ease-out .6s forwards',
                } as CSSProperties
              }
            ></path>
            <path
              pathLength={1}
              d="M982,352 H790 Q762,352 762,380 V414 Q762,442 740,442"
              style={
                {
                  strokeDasharray: '1',
                  strokeDashoffset: '1',
                  animation: 'hubDraw calc(1.1s / var(--speed)) ease-out .75s forwards',
                } as CSSProperties
              }
            ></path>
            <path
              pathLength={1}
              d="M837,677 H770 Q742,677 742,649 V540 Q742,512 716,510"
              style={
                {
                  strokeDasharray: '1',
                  strokeDashoffset: '1',
                  animation: 'hubDraw calc(1.1s / var(--speed)) ease-out .9s forwards',
                } as CSSProperties
              }
            ></path>
          </g>

          <g fill="var(--accent)">
            <circle
              r={6}
              style={
                {
                  offsetPath: "path('M277,406 V414 Q277,442 305,442 H573')",
                  animation: 'hubTravel calc(3s / var(--speed)) ease-in-out 1.4s infinite',
                } as CSSProperties
              }
            ></circle>
            <circle
              r={6}
              style={
                {
                  offsetPath: "path('M423,619 V562 Q423,534 451,534 H600 Q628,534 628,506 V484')",
                  animation: 'hubTravel calc(3s / var(--speed)) ease-in-out 2.6s infinite',
                } as CSSProperties
              }
            ></circle>
            <circle
              r={6}
              style={
                {
                  offsetPath: "path('M658,208 V357')",
                  animation: 'hubTravel calc(2.4s / var(--speed)) ease-in-out 1.9s infinite',
                } as CSSProperties
              }
            ></circle>
            <circle
              r={6}
              style={
                {
                  offsetPath: "path('M982,352 H790 Q762,352 762,380 V414 Q762,442 740,442')",
                  animation: 'hubTravel calc(3.2s / var(--speed)) ease-in-out 2.2s infinite',
                } as CSSProperties
              }
            ></circle>
            <circle
              r={6}
              style={
                {
                  offsetPath: "path('M837,677 H770 Q742,677 742,649 V540 Q742,512 716,510')",
                  animation: 'hubTravel calc(3.2s / var(--speed)) ease-in-out 2.9s infinite',
                } as CSSProperties
              }
            ></circle>
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
              background: 'linear-gradient(140deg, var(--accent), var(--accent))',
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
              <path d="M24 24 L10 24 M24 24 L38 24 M24 24 L24 12 M24 24 L24 36"></path>
              <circle cx="24" cy="24" r="4.4" fill="#fff" stroke="none"></circle>
              <circle cx="8" cy="24" r="3.2" fill="#fff" stroke="none"></circle>
              <circle cx="40" cy="24" r="3.2" fill="#fff" stroke="none"></circle>
              <circle cx="24" cy="10" r="3.2" fill="#fff" stroke="none"></circle>
              <circle cx="24" cy="38" r="3.2" fill="#fff" stroke="none"></circle>
            </svg>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '26.14%',
            top: '75.73%',
            width: '7.98%',
            aspectRatio: '1',
            opacity: 0,
            animation: 'hubPop calc(.7s / var(--speed)) cubic-bezier(.2,.9,.3,1.3) .5s forwards',
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
              animation: 'hubFloat calc(5s / var(--speed)) ease-in-out 1.2s infinite',
            }}
          >
            <svg viewBox="0 0 48 48" style={{ width: '66%', height: '66%' }}>
              <defs>
                <linearGradient id="wag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#57E376"></stop>
                  <stop offset="1" stopColor="#20C75A"></stop>
                </linearGradient>
              </defs>
              <rect width="48" height="48" rx="12" fill="url(#wag)"></rect>
              <path
                fill="#fff"
                d="M24 8.5c-8.6 0-15.6 6.9-15.6 15.4 0 2.9.8 5.7 2.4 8.2L8 40.5l8.8-2.6c2.2 1.2 4.7 1.8 7.2 1.8 8.6 0 15.6-6.9 15.6-15.4S32.6 8.5 24 8.5zm0 27.9c-2.4 0-4.7-.7-6.7-1.9l-.5-.3-5.2 1.5 1.6-5-.3-.5c-1.4-2.1-2.1-4.6-2.1-7.2 0-7 5.9-12.8 13.2-12.8s13.2 5.7 13.2 12.8S31.3 36.4 24 36.4z"
              ></path>
              <path
                fill="#fff"
                d="M31.4 27.3c-.4-.2-2.4-1.2-2.8-1.3-.4-.1-.6-.2-.9.2l-1.2 1.5c-.2.3-.4.3-.8.1s-1.8-.6-3.3-2c-1.2-1.1-2-2.4-2.3-2.8-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.7.1-.2 0-.5-.1-.7l-1.2-2.9c-.3-.7-.6-.6-.9-.6h-.8c-.3 0-.7.1-1 .5-.3.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.8c.2.3 2.6 4.1 6.4 5.7 3 1.2 3.6 1 4.2.9.7-.1 2.1-.8 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.3-.2-.7-.4z"
              ></path>
            </svg>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '16.03%',
            top: '36.59%',
            width: '7.41%',
            aspectRatio: '1',
            opacity: 0,
            animation: 'hubPop calc(.7s / var(--speed)) cubic-bezier(.2,.9,.3,1.3) .3s forwards',
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
              animation: 'hubFloat calc(4.4s / var(--speed)) ease-in-out .6s infinite',
            }}
          >
            <svg viewBox="0 0 48 48" style={{ width: '66%', height: '66%' }}>
              <defs>
                <radialGradient id="igr" cx=".28" cy="1.05" r="1.25">
                  <stop offset="0" stopColor="#FFD879"></stop>
                  <stop offset=".28" stopColor="#F58529"></stop>
                  <stop offset=".58" stopColor="#DD2A7B"></stop>
                  <stop offset=".85" stopColor="#8134AF"></stop>
                  <stop offset="1" stopColor="#515BD4"></stop>
                </radialGradient>
              </defs>
              <rect width="48" height="48" rx="13" fill="url(#igr)"></rect>
              <rect
                x="11.5"
                y="11.5"
                width="25"
                height="25"
                rx="7.5"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
              ></rect>
              <circle cx="24" cy="24" r="6.3" fill="none" stroke="#fff" strokeWidth="3"></circle>
              <circle cx="32.8" cy="15.2" r="1.9" fill="#fff"></circle>
            </svg>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '42.88%',
            top: '11.71%',
            width: '7.98%',
            aspectRatio: '1',
            opacity: 0,
            animation: 'hubPop calc(.7s / var(--speed)) cubic-bezier(.2,.9,.3,1.3) .65s forwards',
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
              animation: 'hubFloat calc(4.8s / var(--speed)) ease-in-out 1.6s infinite',
            }}
          >
            <svg viewBox="0 0 64 48" style={{ width: '70%', height: '70%' }}>
              <defs>
                <linearGradient
                  id="gml"
                  x1="9"
                  y1="10"
                  x2="30"
                  y2="36"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#F9436B"></stop>
                  <stop offset=".55" stopColor="#F03C40"></stop>
                  <stop offset="1" stopColor="#EA4335"></stop>
                </linearGradient>
                <linearGradient
                  id="gmr"
                  x1="36"
                  y1="12"
                  x2="57"
                  y2="42"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#FBBC04"></stop>
                  <stop offset=".45" stopColor="#34A853"></stop>
                  <stop offset="1" stopColor="#4285F4"></stop>
                </linearGradient>
              </defs>
              <path
                d="M9.5 40.5 V14.5 L32 31"
                fill="none"
                stroke="url(#gml)"
                strokeWidth="11"
                strokeLinejoin="round"
                strokeLinecap="round"
              ></path>
              <path
                d="M32 31 L54.5 14.5 V40.5"
                fill="none"
                stroke="url(#gmr)"
                strokeWidth="11"
                strokeLinejoin="round"
                strokeLinecap="round"
              ></path>
            </svg>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '69.94%',
            top: '36.10%',
            width: '7.98%',
            aspectRatio: '1',
            opacity: 0,
            animation: 'hubPop calc(.7s / var(--speed)) cubic-bezier(.2,.9,.3,1.3) .8s forwards',
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
              animation: 'hubFloat calc(5.2s / var(--speed)) ease-in-out .9s infinite',
            }}
          >
            <svg viewBox="0 0 48 48" style={{ width: '70%', height: '70%' }}>
              <defs>
                <linearGradient
                  id="ouA"
                  x1="10"
                  y1="42"
                  x2="42"
                  y2="14"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#48C3FF"></stop>
                  <stop offset="1" stopColor="#2B7CF0"></stop>
                </linearGradient>
                <linearGradient
                  id="ouB"
                  x1="22"
                  y1="6"
                  x2="44"
                  y2="26"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#4AA8F5"></stop>
                  <stop offset="1" stopColor="#2B31C9"></stop>
                </linearGradient>
                <linearGradient
                  id="ouC"
                  x1="6"
                  y1="20"
                  x2="26"
                  y2="42"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#2F6FE0"></stop>
                  <stop offset="1" stopColor="#1B3FB8"></stop>
                </linearGradient>
              </defs>
              <path
                d="M5 20.5 24.5 7.5a3 3 0 0 1 3.4 0L45 19.6a3 3 0 0 1 1.3 2.5v17a3.5 3.5 0 0 1-3.5 3.5H8.5A3.5 3.5 0 0 1 5 39.1z"
                fill="url(#ouA)"
              ></path>
              <path
                d="M24.5 7.5a3 3 0 0 1 3.4 0L45 19.6c1.4 1 1.4 3.1 0 4.1L27 36.3a3 3 0 0 1-3.5 0l-6.7-4.8 18.4-13.2z"
                fill="url(#ouB)"
                opacity=".95"
              ></path>
              <path d="M5 20.9 16.8 31.5 5 40z" fill="#1E56D6" opacity=".35"></path>
              <rect x="3" y="19" width="21.5" height="21.5" rx="4.5" fill="url(#ouC)"></rect>
              <ellipse
                cx="13.7"
                cy="29.7"
                rx="6"
                ry="6.9"
                fill="none"
                stroke="#fff"
                strokeWidth="3.6"
              ></ellipse>
            </svg>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '59.62%',
            top: '75.73%',
            width: '7.98%',
            aspectRatio: '1',
            opacity: 0,
            animation: 'hubPop calc(.7s / var(--speed)) cubic-bezier(.2,.9,.3,1.3) 1.05s forwards',
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
              animation: 'hubFloat calc(5.6s / var(--speed)) ease-in-out 1.4s infinite',
            }}
          >
            <svg viewBox="0 0 48 48" style={{ width: '64%', height: '64%' }}>
              <defs>
                <linearGradient id="msgg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#00B2FF"></stop>
                  <stop offset="1" stopColor="#006AFF"></stop>
                </linearGradient>
              </defs>
              <path
                d="M24 4C12.6 4 4 12.3 4 23.5c0 6.3 2.8 11.8 7.4 15.4V46l6.8-3.7c1.8.5 3.7.8 5.8.8 11.4 0 20-8.3 20-19.6C44 12.3 35.4 4 24 4z"
                fill="url(#msgg)"
              ></path>
              <path
                d="m12.6 29 9.1-9.6 4.7 4.9 8.3-4.9-9.1 9.6-4.6-4.9L12.6 29z"
                fill="#fff"
              ></path>
            </svg>
          </div>
        </div>

        {showChats && (
          <div>
            <div
              style={{
                position: 'absolute',
                left: '66.24%',
                top: '8.54%',
                width: '24.79%',
                background: '#fff',
                borderRadius: '1.1cqw',
                padding: '1.25cqw 1.4cqw',
                boxShadow: '0 10px 30px rgba(74,60,140,.12)',
                opacity: 0,
                animation:
                  'hubSlide calc(.8s / var(--speed)) cubic-bezier(.2,.9,.3,1.2) 1.5s forwards',
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
                    src={avatars[0]}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      background: '#ece9f9',
                    }}
                  />
                </div>
                <div style={{ flex: '1 1 auto', minWidth: '0' }}>
                  <div style={{ fontSize: '1.35cqw', lineHeight: '1.45', color: '#3c3a52' }}>
                    Hola, ¿tienen en stock la chaqueta?
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '.5cqw',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      marginTop: '.5cqw',
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      style={{ width: '1.3cqw', height: '1.3cqw' }}
                      fill="none"
                      stroke="#34b7f1"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 13l4 4 9-10"></path>
                      <path d="M9 13l4 4 9-10"></path>
                    </svg>
                    <svg viewBox="0 0 48 48" style={{ width: '1.7cqw', height: '1.7cqw' }}>
                      <circle cx="24" cy="24" r="23" fill="url(#wag)"></circle>
                      <path
                        fill="#fff"
                        d="M24 9c-8.3 0-15 6.6-15 14.8 0 2.8.8 5.5 2.3 7.8L9 39.5l8.4-2.5c2.1 1.1 4.4 1.7 6.6 1.7 8.3 0 15-6.6 15-14.8S32.3 9 24 9zm0 26.8c-2.3 0-4.5-.6-6.4-1.8l-.5-.3-5 1.4 1.5-4.7-.3-.5c-1.3-2-2-4.4-2-6.9C11.3 16.3 17 10.6 24 10.6s12.7 5.7 12.7 12.4S31 35.8 24 35.8z"
                      ></path>
                      <path
                        fill="#fff"
                        d="M31 27.6c-.4-.2-2.2-1.1-2.6-1.2-.3-.1-.6-.2-.8.2l-1.1 1.4c-.2.2-.4.3-.8.1s-1.7-.6-3.1-1.9c-1.1-1-1.9-2.3-2.1-2.6-.2-.4 0-.6.2-.7l.5-.7c.2-.2.3-.4.4-.6.1-.2 0-.4-.1-.6l-1.1-2.7c-.3-.6-.6-.6-.8-.6h-.7c-.3 0-.7.1-1 .5-.3.4-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.9 6 5.3 2.8 1.1 3.4.9 4 .8.6-.1 2-.8 2.2-1.6.3-.8.3-1.4.2-1.5-.1-.1-.3-.2-.5-.3z"
                      ></path>
                    </svg>
                    <span style={{ fontSize: '1.15cqw', color: '#9a98ad' }}>10:24</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                left: '3.56%',
                top: '10.98%',
                width: '25.64%',
                background: '#fff',
                borderRadius: '1.1cqw',
                padding: '1.25cqw 1.4cqw',
                boxShadow: '0 10px 30px rgba(74,60,140,.12)',
                opacity: 0,
                animation:
                  'hubSlide calc(.8s / var(--speed)) cubic-bezier(.2,.9,.3,1.2) 1.9s forwards',
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
                    src={avatars[1]}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      background: '#ece9f9',
                    }}
                  />
                </div>
                <div style={{ flex: '1 1 auto', minWidth: '0' }}>
                  <div style={{ fontSize: '1.35cqw', lineHeight: '1.45', color: '#3c3a52' }}>
                    ¿Cuándo llega mi pedido? #12345
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '.8cqw',
                      alignItems: 'center',
                      marginTop: '.6cqw',
                    }}
                  >
                    <svg viewBox="0 0 48 48" style={{ width: '1.8cqw', height: '1.8cqw' }}>
                      <rect width="48" height="48" rx="13" fill="url(#igr)"></rect>
                      <rect
                        x="11.5"
                        y="11.5"
                        width="25"
                        height="25"
                        rx="7.5"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3.2"
                      ></rect>
                      <circle
                        cx="24"
                        cy="24"
                        r="6.3"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3.2"
                      ></circle>
                      <circle cx="32.8" cy="15.2" r="2" fill="#fff"></circle>
                    </svg>
                    <span style={{ fontSize: '1.15cqw', color: '#9a98ad' }}>08:52</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                left: '67.3%',
                top: '57.32%',
                width: '27.35%',
                background: '#fff',
                borderRadius: '1.1cqw',
                padding: '1.25cqw 1.4cqw',
                boxShadow: '0 10px 30px rgba(74,60,140,.12)',
                opacity: 0,
                animation:
                  'hubSlide calc(.8s / var(--speed)) cubic-bezier(.2,.9,.3,1.2) 2.3s forwards',
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
                    src={avatars[2]}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      background: '#ece9f9',
                    }}
                  />
                </div>
                <div style={{ flex: '1 1 auto', minWidth: '0' }}>
                  <div style={{ fontSize: '1.35cqw', lineHeight: '1.45', color: '#3c3a52' }}>
                    Quisiera un presupuesto para 50 unidades.
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '.8cqw',
                      alignItems: 'center',
                      marginTop: '.6cqw',
                    }}
                  >
                    <svg viewBox="0 0 48 48" style={{ width: '1.9cqw', height: '1.9cqw' }}>
                      <path
                        d="M5 20.5 24.5 7.5a3 3 0 0 1 3.4 0L45 19.6a3 3 0 0 1 1.3 2.5v17a3.5 3.5 0 0 1-3.5 3.5H8.5A3.5 3.5 0 0 1 5 39.1z"
                        fill="url(#ouA)"
                      ></path>
                      <path
                        d="M24.5 7.5a3 3 0 0 1 3.4 0L45 19.6c1.4 1 1.4 3.1 0 4.1L27 36.3a3 3 0 0 1-3.5 0l-6.7-4.8 18.4-13.2z"
                        fill="url(#ouB)"
                        opacity=".95"
                      ></path>
                      <rect
                        x="3"
                        y="19"
                        width="21.5"
                        height="21.5"
                        rx="4.5"
                        fill="url(#ouC)"
                      ></rect>
                      <ellipse
                        cx="13.7"
                        cy="29.7"
                        rx="6"
                        ry="6.9"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3.6"
                      ></ellipse>
                    </svg>
                    <span style={{ fontSize: '1.15cqw', color: '#9a98ad' }}>09:47</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
