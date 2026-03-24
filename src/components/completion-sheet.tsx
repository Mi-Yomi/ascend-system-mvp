'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn, getQuestTypeLabel } from '@/lib/utils'
import { resizeImage } from '@/lib/image'
import { Camera, X, ImagePlus } from 'lucide-react'
import type { Quest } from '@/store/game-store'

interface CompletionSheetProps {
  open: boolean
  quest: Quest | null
  onConfirm: (photo: string, note: string) => void
  onCancel: () => void
}

export function CompletionSheet({ open, quest, onConfirm, onCancel }: CompletionSheetProps) {
  const [photo, setPhoto] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const canSubmit = photo !== null

  useEffect(() => {
    if (open) {
      setPhoto(null)
      setNote('')
      animateOpen()
    }
  }, [open])

  const animateOpen = async () => {
    try {
      const { gsap } = await import('gsap')
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.2 })
      gsap.fromTo(sheetRef.current, { y: '100%' }, { y: '0%', duration: 0.35, ease: 'power3.out' })
    } catch {}
  }

  const animateClose = useCallback(async (cb: () => void) => {
    try {
      const { gsap } = await import('gsap')
      gsap.to(sheetRef.current, { y: '100%', duration: 0.25, ease: 'power2.in' })
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, delay: 0.05, onComplete: cb })
    } catch { cb() }
  }, [])

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const dataUrl = await resizeImage(file, 400)
      setPhoto(dataUrl)
    } catch {}
    setLoading(false)
  }

  const handleSubmit = () => {
    if (!canSubmit || !photo) return
    animateClose(() => onConfirm(photo, note))
  }

  if (!open || !quest) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div ref={overlayRef} className="absolute inset-0 bg-black/40 opacity-0" onClick={() => animateClose(onCancel)} />
      <div
        ref={sheetRef}
        className="relative w-full max-w-[430px] bg-white rounded-t-3xl px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] translate-y-full max-h-[85vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="w-9 h-1 rounded-full bg-stone-200 mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-bold text-stone-900">Завершить квест</h3>
          <button onClick={() => animateClose(onCancel)} className="p-1.5 rounded-full bg-stone-100 active:bg-stone-200">
            <X size={16} className="text-stone-500" />
          </button>
        </div>

        {/* Quest info */}
        <div className="bg-stone-50 rounded-2xl p-3.5 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-orange-500 uppercase">
              {getQuestTypeLabel(quest.type)}
            </span>
            <span className="text-[11px] text-stone-300">·</span>
            <span className="text-[11px] font-bold text-amber-600">+{quest.xp} XP</span>
            <span className="text-[11px] text-stone-300">·</span>
            <span className="text-[11px] font-bold text-emerald-600">+{quest.jutiReward} JUTI</span>
          </div>
          <p className="text-[14px] font-semibold text-stone-900">{quest.title}</p>
        </div>

        {/* Photo upload */}
        <p className="text-[13px] font-semibold text-stone-700 mb-2">Фото подтверждение</p>
        <label className="block mb-4 cursor-pointer">
          <div className={cn(
            'w-full aspect-[16/10] rounded-2xl overflow-hidden flex items-center justify-center transition-colors',
            photo ? '' : 'border-2 border-dashed border-stone-200 bg-stone-50 active:bg-stone-100',
          )}>
            {photo ? (
              <div className="relative w-full h-full">
                <img src={photo} alt="Proof" className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.preventDefault(); setPhoto(null) }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 active:bg-black/70"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                {loading ? (
                  <div className="w-8 h-8 border-2 border-stone-300 border-t-orange-500 rounded-full animate-spin mx-auto" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-2">
                      <Camera size={22} className="text-orange-400" />
                    </div>
                    <p className="text-[13px] font-medium text-stone-400">Нажми чтобы добавить фото</p>
                    <p className="text-[11px] text-stone-300 mt-0.5">Подтверди выполнение квеста</p>
                  </>
                )}
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhoto}
          />
        </label>

        {/* Note */}
        <p className="text-[13px] font-semibold text-stone-700 mb-2">Комментарий</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Что было сделано..."
          rows={3}
          className="w-full px-4 py-3 rounded-2xl bg-stone-50 text-[14px] text-stone-900 placeholder-stone-300 resize-none outline-none focus:ring-2 focus:ring-orange-200 transition-shadow mb-5 select-text"
          style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            'w-full py-3.5 rounded-2xl font-semibold text-[15px] text-white transition-all active:scale-[0.98]',
            canSubmit ? 'bg-orange-500' : 'bg-stone-200 text-stone-400',
          )}
        >
          {canSubmit ? `Завершить · +${quest.jutiReward} JUTI` : 'Добавь фото для завершения'}
        </button>
      </div>
    </div>
  )
}
