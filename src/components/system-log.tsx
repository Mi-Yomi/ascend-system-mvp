'use client'

import { useGameStore } from '@/store/game-store'
import { cn } from '@/lib/utils'
import { Zap, AlertTriangle, MessageSquare, Info } from 'lucide-react'

function getLogIcon(title: string) {
  if (title.includes('completed') || title.includes('Quest')) return Zap
  if (title.includes('Penalty') || title.includes('fail')) return AlertTriangle
  if (title.includes('Victor') || title.includes('note')) return MessageSquare
  return Info
}

export function SystemLog() {
  const logs = useGameStore((s) => s.logs)

  return (
    <div className="space-y-0">
      {logs.slice(0, 30).map((log, i) => {
        const Icon = getLogIcon(log.title)
        return (
          <div
            key={log.id}
            className={cn(
              'flex gap-3 py-3.5 px-4 bg-white',
              i === 0 && 'rounded-t-2xl',
              i === Math.min(logs.length - 1, 29) && 'rounded-b-2xl',
              i < Math.min(logs.length - 1, 29) && 'border-b border-stone-50',
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
              log.epic ? 'bg-orange-50' : 'bg-stone-50',
            )}>
              <Icon size={14} className={log.epic ? 'text-orange-500' : 'text-stone-400'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-[13px] font-semibold',
                  log.epic ? 'text-stone-900' : 'text-stone-600',
                )}>
                  {log.title}
                </span>
                <span className="text-[11px] text-stone-300 font-mono flex-shrink-0">{log.time}</span>
              </div>
              <p className="text-[12px] text-stone-400 mt-0.5 leading-relaxed">{log.body}</p>
            </div>
          </div>
        )
      })}
      {logs.length === 0 && (
        <div className="bg-white rounded-2xl p-6 text-center">
          <p className="text-[13px] text-stone-400">Лог пуст</p>
        </div>
      )}
    </div>
  )
}
