'use client'

import { useGameStore } from '@/store/game-store'
import { Target, CheckCircle2, XCircle, Flame } from 'lucide-react'

export function SummaryMetrics() {
  const quests = useGameStore((s) => s.quests)
  const streak = useGameStore((s) => s.profile.streak)

  const active = quests.filter((q) => q.status === 'active').length
  const completed = quests.filter((q) => q.status === 'completed').length
  const failed = quests.filter((q) => q.status === 'failed').length

  const metrics = [
    { label: 'Активных', value: active, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Сделано', value: completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Провал', value: failed, icon: XCircle, color: 'text-red-400', bg: 'bg-red-50' },
    { label: 'Стрик', value: streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {metrics.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-2xl py-3 px-2 text-center">
          <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
            <Icon size={14} className={color} />
          </div>
          <div className="text-base font-bold text-stone-900 tabular-nums leading-none">{value}</div>
          <div className="text-[9px] font-medium text-stone-400 uppercase tracking-wider mt-1">
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
