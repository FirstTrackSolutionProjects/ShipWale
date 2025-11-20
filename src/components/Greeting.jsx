import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const getGreeting = (h) => {
  if (h >= 5 && h < 12) return 'Good Morning'
  if (h >= 12 && h < 17) return 'Good Afternoon'
  // Use "Good Evening" for late hours as well to keep it professional
  return 'Good Evening'
}

const Greeting = ({ name, className = '' }) => {
  const auth = useAuth?.() || {}
  const displayName = name || auth?.name || 'there'

  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const { greeting, timeString, dateString } = useMemo(() => {
    const h = now.getHours()
    const greetingText = getGreeting(h)
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    return { greeting: greetingText, timeString: timeStr, dateString: dateStr }
  }, [now])

  const theme = useMemo(() => {
    const h = now.getHours()
    if (h >= 5 && h < 12) {
      return {
        gradient: 'from-amber-400 to-orange-600',
        tint: 'bg-amber-500/15',
        ring: 'ring-amber-500/20',
        icon: 'sun'
      }
    }
    if (h >= 12 && h < 17) {
      return {
        gradient: 'from-sky-500 to-indigo-600',
        tint: 'bg-sky-500/15',
        ring: 'ring-sky-500/20',
        icon: 'sun'
      }
    }
    return {
      gradient: 'from-violet-500 to-fuchsia-600',
      tint: 'bg-violet-500/15',
      ring: 'ring-violet-500/20',
      icon: 'moon'
    }
  }, [now])

  const Icon = ({ type }) => {
    if (type === 'moon') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z" />
        </svg>
      )
    }
    // sun
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm8.66-3.95l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 11v2h3v-2h-3zM4.22 19.07l-1.79 1.8 1.41 1.41 1.8-1.79-1.42-1.42zM12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0-5h-2v3h2V0zm7.66 3.05l-1.4-1.4-1.8 1.79 1.41 1.41 1.79-1.8z" />
      </svg>
    )
  }

  return (
    <div className='w-full px-14'>
    <div className={` relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm ${className}`}>
      {/* Decorative gradient blur */}
      <div className={`pointer-events-none absolute -top-16 -right-20 h-56 w-56 rounded-full blur-3xl opacity-30 bg-linear-to-br ${theme.gradient}`} />

      <div className="flex items-start gap-4 p-6 md:p-8">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${theme.tint} ${theme.ring}`} aria-hidden="true">
          <span className="text-gray-700"><Icon type={theme.icon} /></span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
            <span>{greeting}, </span><br />
            <span className={`bg-linear-to-r ${theme.gradient} bg-clip-text text-transparent`}>{displayName}</span>
            <span className="ml-1" role="img" aria-label="wave">👋</span>
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>{dateString}</span>
            <span className="hidden md:inline">•</span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              {timeString}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className={`h-1.5 w-full bg-linear-to-r ${theme.gradient}`} />
    </div>
    </div>
  )
}

export default Greeting
