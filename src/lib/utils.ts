import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getQuestTypeClass(type: string): string {
  const map: Record<string, string> = {
    'Boss Quest': 'quest-type-boss',
    'Main Quest': 'quest-type-main',
    'Daily Quest': 'quest-type-daily',
    'Side Quest': 'quest-type-side',
    'Hidden Quest': 'quest-type-hidden',
    'Penalty Quest': 'quest-type-penalty',
  }
  return map[type] || 'quest-type-side'
}

export function getQuestTypeLabel(type: string): string {
  const map: Record<string, string> = {
    'Boss Quest': 'Босс',
    'Main Quest': 'Основной',
    'Daily Quest': 'Ежедневный',
    'Side Quest': 'Побочный',
    'Hidden Quest': 'Скрытый',
    'Penalty Quest': 'Штрафной',
  }
  return map[type] || type
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Активен',
    completed: 'Выполнен',
    failed: 'Провален',
  }
  return map[status] || status
}

export function getRankColor(rank: string) {
  const map: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    'E-Rank': { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-300', glow: '' },
    'D-Rank': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', glow: '' },
    'C-Rank': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', glow: '' },
    'B-Rank': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-300', glow: '' },
    'A-Rank': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', glow: 'shadow-[0_0_12px_rgba(217,170,0,0.15)]' },
  }
  return map[rank] || map['E-Rank']
}
