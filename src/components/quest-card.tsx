'use client'

import { cn, getQuestTypeLabel } from '@/lib/utils'
import { CheckCircle2, XCircle, Swords, Zap, Clock, Sparkles, Eye, AlertTriangle, Coins, ImageIcon } from 'lucide-react'
import type { Quest, QuestType } from '@/store/game-store'

const typeIcons: Record<QuestType, typeof Swords> = {
  'Boss Quest': Swords, 'Main Quest': Zap, 'Daily Quest': Clock,
  'Side Quest': Sparkles, 'Hidden Quest': Eye, 'Penalty Quest': AlertTriangle,
}

const typeColors: Record<QuestType, string> = {
  'Boss Quest': 'text-red-600 bg-red-50', 'Main Quest': 'text-orange-600 bg-orange-50',
  'Daily Quest': 'text-blue-600 bg-blue-50', 'Side Quest': 'text-stone-500 bg-stone-100',
  'Hidden Quest': 'text-violet-600 bg-violet-50', 'Penalty Quest': 'text-red-500 bg-red-50',
}

interface QuestCardProps {
  quest: Quest
  onComplete: (id: string) => void
  onFail: (id: string) => void
}

export function QuestCard({ quest, onComplete, onFail }: QuestCardProps) {
  const isActive = quest.status === 'active'
  const Icon = typeIcons[quest.type] || Sparkles
  const color = typeColors[quest.type] || typeColors['Side Quest']
  const [textColor, bgColor] = color.split(' ')

  return (
    <div className={cn('bg-white rounded-2xl overflow-hidden', !isActive && 'opacity-50')}>
      {/* Completion proof photo */}
      {quest.completionPhoto && (
        <div className="relative">
          <img src={quest.completionPhoto} alt="" className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-2 left-3 flex items-center gap-1">
            <ImageIcon size={11} className="text-white/80" />
            <span className="text-[10px] font-medium text-white/80">Подтверждено</span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Top: icon + type + rewards */}
        <div className="flex items-center gap-3 mb-2.5">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', bgColor)}>
            <Icon size={16} className={textColor} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn('text-[11px] font-bold uppercase tracking-wide', textColor)}>
                {getQuestTypeLabel(quest.type)}
              </span>
              {quest.status !== 'active' && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded',
                  quest.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
                )}>
                  {quest.status === 'completed' ? 'Выполнен' : 'Провален'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[12px] font-bold text-amber-600">+{quest.xp} XP</span>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50">
              <Coins size={10} className="text-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-600">{quest.jutiReward}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-stone-900 leading-snug mb-1">{quest.title}</h3>

        {/* Description */}
        <p className="text-[13px] text-stone-400 leading-relaxed mb-3">{quest.description}</p>

        {/* Completion note */}
        {quest.completionNote && (
          <div className="bg-stone-50 rounded-xl px-3 py-2 mb-3">
            <p className="text-[12px] text-stone-500 italic">"{quest.completionNote}"</p>
          </div>
        )}

        {/* Rewards chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {quest.rewards.map((r) => (
            <span key={r} className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-stone-50 text-stone-500">
              {r}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-red-50 text-red-400">
            Штраф: {quest.penalty} XP
          </span>
        </div>
      </div>

      {/* Actions */}
      {isActive && (
        <div className="flex border-t border-stone-100">
          <button
            onClick={() => onComplete(quest.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-orange-500 active:bg-orange-50 transition-colors border-r border-stone-100"
          >
            <CheckCircle2 size={15} />
            Выполнить
          </button>
          <button
            onClick={() => onFail(quest.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-stone-400 active:bg-stone-50 transition-colors"
          >
            <XCircle size={15} />
            Провалить
          </button>
        </div>
      )}
    </div>
  )
}
