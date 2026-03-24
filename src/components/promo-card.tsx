'use client'

import { Tag, Zap, Shield, Coins, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Promo {
  id: string
  title: string
  description: string
  code: string
  type: 'multiplier' | 'bonus' | 'cashback' | 'shield'
  value: number
  minLevel: number
  active: boolean
  createdAt: string
  expiresAt: string
}

interface PromoCardProps {
  promo: Promo
  onClaim: (promo: Promo) => void
  claimed?: boolean
  playerLevel: number
}

const typeConfig: Record<Promo['type'], { icon: typeof Tag; color: string; bg: string; label: string }> = {
  multiplier: { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Множитель' },
  bonus: { icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Бонус' },
  cashback: { icon: Gift, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Кэшбэк' },
  shield: { icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50', label: 'Щит' },
}

export function PromoCard({ promo, onClaim, claimed = false, playerLevel }: PromoCardProps) {
  const config = typeConfig[promo.type]
  const Icon = config.icon
  const locked = playerLevel < promo.minLevel
  const expired = new Date(promo.expiresAt).getTime() < Date.now()

  const timeLeft = () => {
    const diff = new Date(promo.expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Истекло'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours >= 24) return `${Math.floor(hours / 24)}д`
    return `${hours}ч`
  }

  return (
    <div className={cn(
      'bg-white rounded-2xl p-4 relative overflow-hidden',
      (claimed || expired || locked) && 'opacity-60',
    )}>
      {/* Type badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-lg', config.bg)}>
          <Icon size={13} className={config.color} />
          <span className={cn('text-[11px] font-semibold', config.color)}>{config.label}</span>
        </div>
        <span className="text-[11px] text-stone-400">{timeLeft()}</span>
      </div>

      {/* Content */}
      <h3 className="text-[15px] font-bold text-stone-900 mb-1">{promo.title}</h3>
      <p className="text-[13px] text-stone-500 leading-relaxed mb-3">{promo.description}</p>

      {/* Code */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 border border-dashed border-stone-200">
          <Tag size={12} className="text-stone-400" />
          <span className="text-[13px] font-mono font-bold text-stone-700 tracking-wider">{promo.code}</span>
        </div>
        {promo.minLevel > 1 && (
          <span className="text-[11px] text-stone-400">Lvl {promo.minLevel}+</span>
        )}
      </div>

      {/* Action */}
      <button
        onClick={() => !claimed && !expired && !locked && onClaim(promo)}
        disabled={claimed || expired || locked}
        className={cn(
          'w-full py-2.5 rounded-xl font-semibold text-[13px] transition-colors',
          claimed ? 'bg-stone-100 text-stone-400' :
          expired ? 'bg-stone-100 text-stone-400' :
          locked ? 'bg-stone-100 text-stone-400' :
          'bg-orange-500 text-white active:bg-orange-600',
        )}
      >
        {claimed ? 'Активировано' : expired ? 'Истекло' : locked ? `Нужен уровень ${promo.minLevel}` : 'Активировать'}
      </button>
    </div>
  )
}
