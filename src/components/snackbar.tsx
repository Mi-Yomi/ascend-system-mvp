'use client'

import { useUIStore } from '@/store/ui-store'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const config = {
  success: { icon: CheckCircle2, bg: 'bg-emerald-600', iconColor: 'text-emerald-100' },
  error: { icon: XCircle, bg: 'bg-red-600', iconColor: 'text-red-100' },
  info: { icon: Info, bg: 'bg-stone-800', iconColor: 'text-stone-300' },
}

export function Snackbar() {
  const snack = useUIStore((s) => s.snack)
  const hide = useUIStore((s) => s.hideSnack)

  if (!snack) return null

  const { icon: Icon, bg, iconColor } = config[snack.type]

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div
        className={cn(
          'max-w-[400px] w-full pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg animate-slide-up',
          bg,
        )}
        onClick={hide}
      >
        <Icon size={18} className={iconColor} />
        <span className="text-sm font-medium text-white flex-1">{snack.message}</span>
      </div>
    </div>
  )
}
