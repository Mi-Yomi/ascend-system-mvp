'use client'

import { useRef, useEffect, useCallback } from 'react'
import { cn, getQuestTypeLabel } from '@/lib/utils'
import { Swords, Zap, Clock, Sparkles, Eye, AlertTriangle } from 'lucide-react'
import type { Quest, QuestType } from '@/store/game-store'

const typeIcons: Record<QuestType, typeof Swords> = {
  'Boss Quest': Swords, 'Main Quest': Zap, 'Daily Quest': Clock,
  'Side Quest': Sparkles, 'Hidden Quest': Eye, 'Penalty Quest': AlertTriangle,
}

interface BottomSheetProps {
  open: boolean
  quest: Quest | null
  action: 'complete' | 'fail' | null
  onConfirm: () => void
  onCancel: () => void
}

export function BottomSheet({ open, quest, action, onConfirm, onCancel }: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  const animateOpen = useCallback(async () => {
    try {
      const { gsap } = await import('gsap')
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.2 })
      gsap.fromTo(sheetRef.current, { y: '100%' }, { y: '0%', duration: 0.35, ease: 'power3.out' })
    } catch {}
  }, [])

  const animateClose = useCallback(async (cb: () => void) => {
    try {
      const { gsap } = await import('gsap')
      gsap.to(sheetRef.current, { y: '100%', duration: 0.25, ease: 'power2.in' })
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, delay: 0.05, onComplete: cb })
    } catch { cb() }
  }, [])

  useEffect(() => {
    if (open) animateOpen()
  }, [open, animateOpen])

  if (!open || !quest) return null

  const isComplete = action === 'complete'
  const Icon = typeIcons[quest.type] || Sparkles

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div ref={overlayRef} className="absolute inset-0 bg-black/40 opacity-0" onClick={() => animateClose(onCancel)} />
      <div ref={sheetRef} className="relative w-full max-w-[430px] bg-white rounded-t-3xl px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] translate-y-full">
        {/* Handle */}
        <div className="w-9 h-1 rounded-full bg-stone-200 mx-auto mb-5" />

        <h3 className="text-[17px] font-bold text-stone-900 text-center mb-4">
          {isComplete ? 'Завершить квест?' : 'Провалить квест?'}
        </h3>

        {/* Quest info */}
        <div className="flex items-center gap-3 bg-stone-50 rounded-2xl p-3.5 mb-5">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            isComplete ? 'bg-emerald-50' : 'bg-red-50',
          )}>
            <Icon size={18} className={isComplete ? 'text-emerald-600' : 'text-red-500'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-stone-900 truncate">{quest.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-semibold text-stone-400">
                {getQuestTypeLabel(quest.type)}
              </span>
              <span className="text-[11px] text-stone-300">·</span>
              <span className={cn(
                'text-[11px] font-bold',
                isComplete ? 'text-emerald-600' : 'text-red-500',
              )}>
                {isComplete ? `+${quest.xp} XP` : `${quest.penalty} XP`}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => animateClose(onConfirm)}
          className={cn(
            'w-full py-3.5 rounded-2xl font-semibold text-[15px] text-white mb-2 active:scale-[0.98] transition-transform',
            isComplete ? 'bg-orange-500' : 'bg-red-500',
          )}
        >
          {isComplete ? 'Да, завершить' : 'Да, провалить'}
        </button>
        <button
          onClick={() => animateClose(onCancel)}
          className="w-full py-3.5 rounded-2xl font-semibold text-[15px] text-stone-500 bg-stone-100 active:bg-stone-200 transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  )
}
