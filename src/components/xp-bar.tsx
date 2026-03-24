'use client'

import { useRef, useEffect } from 'react'
import { useGameStore } from '@/store/game-store'

export function XPBar() {
  const profile = useGameStore((s) => s.profile)
  const fillRef = useRef<HTMLDivElement>(null)
  const prevXpRef = useRef(profile.xp)

  const percentage = Math.min(100, (profile.xp / profile.xpToNext) * 100)

  useEffect(() => {
    const el = fillRef.current
    if (!el) return

    // Use GSAP if available, otherwise CSS transition
    const loadGsap = async () => {
      try {
        const { gsap } = await import('gsap')
        gsap.to(el, {
          width: `${percentage}%`,
          duration: 0.8,
          ease: 'power2.out',
        })
      } catch {
        el.style.width = `${percentage}%`
      }
    }
    loadGsap()
    prevXpRef.current = profile.xp
  }, [profile.xp, percentage])

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-stone-500">XP</span>
        <span className="text-xs font-semibold text-stone-700 tabular-nums">
          {profile.xp} / {profile.xpToNext}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
        <div
          ref={fillRef}
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width] duration-700"
          style={{ width: 0 }}
        />
      </div>
    </div>
  )
}
