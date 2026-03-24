'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '@/store/game-store'
import { useUIStore } from '@/store/ui-store'
import { X, ArrowLeft, CheckCircle2, Coins, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Stage = 'input' | 'success'

export function TransferScreen() {
  const showTransfer = useUIStore((s) => s.showTransfer)
  const setShowTransfer = useUIStore((s) => s.setShowTransfer)
  const showSnack = useUIStore((s) => s.showSnack)
  const juti = useGameStore((s) => s.profile.juti)
  const transferJuti = useGameStore((s) => s.transferJuti)
  const transfers = useGameStore((s) => s.transfers)

  const [amount, setAmount] = useState(0)
  const [stage, setStage] = useState<Stage>('input')
  const [transferredAmount, setTransferredAmount] = useState(0)
  const screenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showTransfer) {
      setAmount(0)
      setStage('input')
      animateIn()
    }
  }, [showTransfer])

  const animateIn = async () => {
    try {
      const { gsap } = await import('gsap')
      gsap.fromTo(screenRef.current, { x: '100%' }, { x: '0%', duration: 0.3, ease: 'power2.out' })
    } catch {}
  }

  const animateOut = useCallback(async (cb: () => void) => {
    try {
      const { gsap } = await import('gsap')
      gsap.to(screenRef.current, { x: '100%', duration: 0.25, ease: 'power2.in', onComplete: cb })
    } catch { cb() }
  }, [])

  const handleClose = () => animateOut(() => setShowTransfer(false))

  const handleQuickAmount = (val: number) => {
    setAmount(Math.min(val, juti))
  }

  const handleTransfer = () => {
    if (amount <= 0 || amount > juti) return
    const ok = transferJuti(amount)
    if (ok) {
      setTransferredAmount(amount)
      setStage('success')
    }
  }

  const handleDone = () => {
    showSnack(`${transferredAmount} JUTI → ${transferredAmount} ₸`, 'success')
    handleClose()
  }

  if (!showTransfer) return null

  return (
    <div
      ref={screenRef}
      className="fixed inset-0 z-50 bg-white translate-x-full"
    >
      <div className="max-w-[430px] mx-auto min-h-screen flex flex-col">
        {stage === 'input' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
              <button onClick={handleClose} className="p-2 -ml-2 rounded-xl active:bg-stone-50">
                <ArrowLeft size={20} className="text-stone-900" />
              </button>
              <h1 className="text-[15px] font-bold text-stone-900">Перевод в тенге</h1>
              <div className="w-9" />
            </div>

            {/* Balance */}
            <div className="px-4 pt-6 pb-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-50 mb-4">
                <Coins size={14} className="text-amber-500" />
                <span className="text-[13px] font-semibold text-stone-600">Баланс: {juti} JUTI</span>
              </div>
            </div>

            {/* Amount display */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="text-center mb-6">
                <div className="text-[48px] font-bold text-stone-900 tabular-nums leading-none">
                  {amount || '0'} <span className="text-[32px] text-stone-300 font-semibold">J</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <ArrowRight size={12} className="text-stone-300" />
                  <span className="text-[15px] text-stone-400">{amount || '0'} ₸</span>
                </div>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 mb-8">
                {[50, 100, 250].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleQuickAmount(val)}
                    disabled={val > juti}
                    className={cn(
                      'px-5 py-2.5 rounded-2xl text-[14px] font-medium transition-colors',
                      amount === val ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 active:bg-stone-200',
                      val > juti && 'opacity-30',
                    )}
                  >
                    {val} J
                  </button>
                ))}
                <button
                  onClick={() => handleQuickAmount(juti)}
                  className={cn(
                    'px-5 py-2.5 rounded-2xl text-[14px] font-medium transition-colors',
                    amount === juti ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 active:bg-stone-200',
                  )}
                >
                  Все
                </button>
              </div>

              {/* Custom numpad-style input */}
              <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    onClick={() => setAmount((prev) => {
                      const next = prev * 10 + n
                      return next > juti ? prev : next
                    })}
                    className="py-3 text-[20px] font-semibold text-stone-900 rounded-xl active:bg-stone-100 transition-colors"
                  >
                    {n}
                  </button>
                ))}
                <div />
                <button
                  onClick={() => setAmount((prev) => {
                    const next = prev * 10
                    return next > juti ? prev : next
                  })}
                  className="py-3 text-[20px] font-semibold text-stone-900 rounded-xl active:bg-stone-100 transition-colors"
                >
                  0
                </button>
                <button
                  onClick={() => setAmount((prev) => Math.floor(prev / 10))}
                  className="py-3 text-[20px] font-semibold text-stone-400 rounded-xl active:bg-stone-100 transition-colors"
                >
                  ←
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
              <button
                onClick={handleTransfer}
                disabled={amount <= 0}
                className={cn(
                  'w-full py-4 rounded-2xl font-semibold text-[15px] transition-all active:scale-[0.98]',
                  amount > 0 ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400',
                )}
              >
                Перевести {amount > 0 ? `${amount} JUTI → ${amount} ₸` : ''}
              </button>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-[20px] font-bold text-stone-900 mb-1">Переведено</h2>
            <p className="text-[36px] font-bold text-stone-900 tabular-nums mb-1">
              {transferredAmount} ₸
            </p>
            <p className="text-[14px] text-stone-400 mb-2">
              Списано {transferredAmount} JUTI с баланса
            </p>
            <p className="text-[13px] text-stone-300">
              Остаток: {juti} JUTI
            </p>

            {/* Recent transfers */}
            {transfers.length > 0 && (
              <div className="w-full mt-8 bg-stone-50 rounded-2xl p-4">
                <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
                  Последние переводы
                </p>
                {transfers.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0 border-stone-100">
                    <span className="text-[13px] text-stone-500">{t.date}</span>
                    <span className="text-[13px] font-semibold text-stone-700">{t.amount} J → {t.tenge} ₸</span>
                  </div>
                ))}
              </div>
            )}

            <div className="w-full mt-auto pb-[max(16px,env(safe-area-inset-bottom))]">
              <button
                onClick={handleDone}
                className="w-full py-4 rounded-2xl bg-stone-900 text-white font-semibold text-[15px] active:scale-[0.98] transition-transform"
              >
                Отлично
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
