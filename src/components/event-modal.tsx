'use client'

import { useEffect, useRef } from 'react'
import { X, Gift, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GameEvent {
  id: string
  title: string
  description: string
  image: string
  rewards: string[]
  duration: string
  color: string
  startsAt: string
  expiresAt: string
  active: boolean
}

interface EventModalProps {
  event: GameEvent | null
  open: boolean
  onClose: () => void
  onAccept: (event: GameEvent) => void
}

export function EventModal({ event, open, onClose, onAccept }: EventModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const loadGsap = async () => {
      const gsap = (await import('gsap')).default
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 })
      if (cardRef.current) gsap.fromTo(cardRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' })
    }
    loadGsap()
  }, [open])

  if (!open || !event) return null

  const timeLeft = () => {
    const diff = new Date(event.expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Истекло'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}д ${hours % 24}ч`
    return `${hours}ч`
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
      onClick={onClose}
    >
      <div
        ref={cardRef}
        className="w-full max-w-[380px] rounded-3xl overflow-hidden bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with color */}
        <div className="relative h-40 flex items-center justify-center" style={{ backgroundColor: event.color }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
          <div className="relative text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <Gift size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center active:bg-black/40"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-[14px] text-stone-600 leading-relaxed mb-4">{event.description}</p>

          {/* Timer */}
          <div className="flex items-center gap-1.5 mb-4">
            <Clock size={14} className="text-stone-400" />
            <span className="text-[12px] text-stone-400">Осталось: {timeLeft()}</span>
            <span className="text-[12px] text-stone-300 ml-1">· {event.duration}</span>
          </div>

          {/* Rewards */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {event.rewards.map((r, i) => (
              <span
                key={i}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[12px] font-semibold',
                  r.includes('JUTI') ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
                )}
              >
                {r}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-600 font-semibold text-[14px] active:bg-stone-200 transition-colors"
            >
              Позже
            </button>
            <button
              onClick={() => onAccept(event)}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-[14px] active:opacity-80 transition-opacity"
              style={{ backgroundColor: event.color }}
            >
              Участвовать
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
