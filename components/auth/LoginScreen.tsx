'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth'

type User = {
  id: string
  name: string
  role: string
}

type AvatarStyle = {
  color: string
  bg: string
  border: string
}

const AVATAR_PALETTE: AvatarStyle[] = [
  { color: '#58a6ff', bg: 'rgba(56,139,253,0.15)',  border: 'rgba(56,139,253,0.3)'  },
  { color: '#3fb950', bg: 'rgba(35,134,54,0.15)',   border: 'rgba(35,134,54,0.3)'   },
  { color: '#d29922', bg: 'rgba(187,128,9,0.15)',   border: 'rgba(187,128,9,0.3)'   },
  { color: '#a371f7', bg: 'rgba(163,113,247,0.15)', border: 'rgba(163,113,247,0.3)' },
]

function avatarStyle(name: string): AvatarStyle {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

const NUMPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

const PAGE_BG: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0d1117',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
}

const GRADIENT_OVERLAY: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(31,111,235,0.06), transparent),' +
    'radial-gradient(ellipse 80% 60% at 100% 100%, rgba(35,134,54,0.04), transparent)',
  pointerEvents: 'none',
}

const CARD: React.CSSProperties = {
  background: '#161b22',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '40px 44px',
  width: '100%',
  margin: '0 20px',
  position: 'relative',
  zIndex: 1,
}

export default function LoginScreen({ users }: { users: User[] }) {
  const router = useRouter()
  const [screen, setScreen] = useState<'select' | 'pin'>('select')
  const [selected, setSelected] = useState<User | null>(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSelectUser = (user: User) => {
    setSelected(user)
    setPin('')
    setPinError(false)
    setShake(false)
    setScreen('pin')
  }

  const handleBack = () => {
    setScreen('select')
    setSelected(null)
    setPin('')
    setPinError(false)
    setShake(false)
  }

  const handleKey = useCallback(
    async (key: string) => {
      if (loading) return

      if (key === '⌫') {
        setPin((p) => p.slice(0, -1))
        setPinError(false)
        return
      }

      const next = pin + key
      setPin(next)

      if (next.length === 4) {
        setLoading(true)
        const result = await login(selected!.id, next)
        setLoading(false)

        if (result.success) {
          router.push('/dashboard')
        } else {
          setPinError(true)
          setShake(true)
          setTimeout(() => {
            setShake(false)
            setPin('')
            setPinError(false)
          }, 700)
        }
      }
    },
    [pin, loading, selected, router]
  )

  if (screen === 'select') {
    return (
      <div style={PAGE_BG}>
        <div style={GRADIENT_OVERLAY} />
        <div style={{ ...CARD, maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(31,111,235,0.12)',
                border: '1px solid rgba(31,111,235,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 26,
                  color: '#1f6feb',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                B
              </span>
            </div>
            <div
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 20,
                color: '#e6edf3',
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              BVIEW Cashup
            </div>
            <div style={{ fontSize: 12, color: '#6e7681' }}>Desai Superstore · Harrismith</div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 24 }} />

          {/* Label */}
          <div
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#6e7681',
              marginBottom: 14,
            }}
          >
            Select user
          </div>

          {/* User cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {users.map((user) => (
              <UserCard key={user.id} user={user} av={avatarStyle(user.name)} onClick={() => handleSelectUser(user)} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // PIN screen
  const av = avatarStyle(selected!.name)

  return (
    <div style={PAGE_BG}>
      <div style={GRADIENT_OVERLAY} />

      {/* Back button */}
      <BackButton onClick={handleBack} />

      <div style={{ ...CARD, maxWidth: 360 }}>
        {/* User avatar */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: av.bg,
              border: `1px solid ${av.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 700, color: av.color }}>{initials(selected!.name)}</span>
          </div>
          <div style={{ fontSize: 18, color: '#e6edf3', fontWeight: 600, marginBottom: 4 }}>{selected!.name}</div>
          <div style={{ fontSize: 12, color: '#6e7681', textTransform: 'capitalize' }}>{selected!.role}</div>
        </div>

        {/* PIN dots */}
        <div
          className={shake ? 'pin-shake' : undefined}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 6 }}
        >
          {[0, 1, 2, 3].map((i) => {
            const filled = pin.length > i
            const dotColor = pinError ? '#f85149' : '#58a6ff'
            return (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: `2px solid ${filled ? dotColor : 'rgba(255,255,255,0.2)'}`,
                  background: filled ? dotColor : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              />
            )
          })}
        </div>

        <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {pinError && <span style={{ fontSize: 12, color: '#f85149' }}>Incorrect PIN</span>}
        </div>

        {/* Numpad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 24 }}>
          {NUMPAD.map((key, i) =>
            key === '' ? (
              <div key={i} />
            ) : (
              <NumKey key={i} label={key} disabled={loading} onClick={() => handleKey(key)} />
            )
          )}
        </div>
      </div>
    </div>
  )
}

function UserCard({ user, av, onClick }: { user: User; av: AvatarStyle; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0d1117',
        border: `1px solid ${hovered ? 'rgba(56,139,253,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 12,
        padding: '20px 12px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'border-color 0.2s',
        display: 'block',
        width: '100%',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: av.bg,
          border: `1px solid ${av.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: av.color }}>{user.name.slice(0, 2).toUpperCase()}</span>
      </div>
      <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500, marginBottom: 3 }}>{user.name}</div>
      <div style={{ fontSize: 11, color: '#6e7681', textTransform: 'capitalize' }}>{user.role}</div>
    </button>
  )
}

function NumKey({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 60,
        background: hovered && !disabled ? '#1c2128' : '#0d1117',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        fontSize: label === '⌫' ? 20 : 22,
        color: '#e6edf3',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        top: 24,
        left: 24,
        color: '#58a6ff',
        background: hovered ? 'rgba(88,166,255,0.08)' : 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        borderRadius: 8,
        zIndex: 2,
        transition: 'background 0.15s',
      }}
    >
      ← Back
    </button>
  )
}
