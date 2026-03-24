'use client'

import { useEffect, useState } from 'react'
import { useUIStore } from '@/store/ui-store'
import { useGameStore } from '@/store/game-store'
import { BottomNav } from './bottom-nav'
import { Snackbar } from './snackbar'
import { TransferScreen } from './transfer-screen'
import { XPBar } from './xp-bar'
import { SummaryMetrics } from './summary-metrics'
import { QuestList } from './quest-list'
import { SystemLog } from './system-log'
import { EventModal } from './event-modal'
import { PromoCard } from './promo-card'
import { getRankColor, cn } from '@/lib/utils'
import {
  Flame, Shield, Brain, Dumbbell, Palette, Briefcase, Users,
  ChevronRight, Swords, Coins, ArrowUpRight, Trophy, Sparkles, Zap,
} from 'lucide-react'
import type { Stats } from '@/store/game-store'
import type { GameEvent } from './event-modal'

const statIcons: Record<keyof Stats, typeof Shield> = {
  discipline: Shield, mind: Brain, body: Dumbbell,
  creativity: Palette, career: Briefcase, social: Users,
}
const statLabels: Record<keyof Stats, string> = {
  discipline: 'Дисциплина', mind: 'Разум', body: 'Тело',
  creativity: 'Креатив', career: 'Карьера', social: 'Социал',
}
const statColors: Record<keyof Stats, string> = {
  discipline: 'text-orange-500 bg-orange-50', mind: 'text-blue-500 bg-blue-50',
  body: 'text-emerald-500 bg-emerald-50', creativity: 'text-violet-500 bg-violet-50',
  career: 'text-amber-600 bg-amber-50', social: 'text-pink-500 bg-pink-50',
}

export function Dashboard() {
  const activeTab = useUIStore((s) => s.activeTab)
  const events = useGameStore((s) => s.events)
  const dismissEvent = useGameStore((s) => s.dismissEvent)
  const showSnack = useUIStore((s) => s.showSnack)
  const [eventModal, setEventModal] = useState<GameEvent | null>(null)

  // Show latest event as modal on mount
  useEffect(() => {
    if (events.length > 0 && !eventModal) {
      const latest = events[0]
      const timer = setTimeout(() => setEventModal(latest), 1500)
      return () => clearTimeout(timer)
    }
  }, [events.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEventAccept = (event: GameEvent) => {
    showSnack(`Вы участвуете в "${event.title}"!`, 'success')
    setEventModal(null)
  }

  const handleEventClose = () => {
    if (eventModal) {
      dismissEvent(eventModal.id)
      setEventModal(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="max-w-[430px] mx-auto min-h-screen bg-[#F2F2F7] relative">
        <div className="pb-24 overflow-y-auto">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'quests' && <QuestsTab />}
          {activeTab === 'log' && <LogTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </div>
        <Snackbar />
        <BottomNav />
        <TransferScreen />
        <EventModal
          event={eventModal}
          open={!!eventModal}
          onClose={handleEventClose}
          onAccept={handleEventAccept}
        />
      </div>
    </div>
  )
}

/* ─── Home Tab ─── */
function HomeTab() {
  const profile = useGameStore((s) => s.profile)
  const quests = useGameStore((s) => s.quests)
  const promos = useGameStore((s) => s.promos)
  const claimedPromos = useGameStore((s) => s.claimedPromos)
  const claimPromo = useGameStore((s) => s.claimPromo)
  const fetchEvent = useGameStore((s) => s.fetchEvent)
  const fetchPromo = useGameStore((s) => s.fetchPromo)
  const setTab = useUIStore((s) => s.setTab)
  const setShowTransfer = useUIStore((s) => s.setShowTransfer)
  const showSnack = useUIStore((s) => s.showSnack)
  const rank = getRankColor(profile.rank)
  const activeQuests = quests.filter((q) => q.status === 'active').slice(0, 3)
  const activePromos = promos.filter(p => new Date(p.expiresAt).getTime() > Date.now()).slice(0, 3)

  return (
    <div className="px-4 pt-[max(12px,env(safe-area-inset-top))]">
      {/* Header */}
      <div className="flex items-center justify-between py-3 mb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Swords size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-stone-900 leading-tight">{profile.name}</h1>
            <p className="text-[11px] text-stone-400 font-medium">Level {profile.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {profile.streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50">
              <Flame size={13} className="text-orange-500" />
              <span className="text-xs font-bold text-orange-600">{profile.streak}</span>
            </div>
          )}
          <span className={cn('px-2.5 py-1 rounded-lg text-[11px] font-bold', rank.bg, rank.text)}>
            {profile.rank}
          </span>
        </div>
      </div>

      {/* JUTI Wallet Card */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-5 mb-4 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-10 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative">
          <div className="flex items-center gap-1.5 mb-3">
            <Coins size={14} className="text-amber-400" />
            <span className="text-[12px] font-medium text-stone-400 uppercase tracking-wider">JUTI Balance</span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[36px] font-bold text-white tabular-nums leading-none">
              {profile.juti.toLocaleString('ru-RU')}
            </span>
            <span className="text-[18px] font-semibold text-stone-500">J</span>
          </div>

          <p className="text-[13px] text-stone-500 mb-5">
            ≈ {profile.juti.toLocaleString('ru-RU')} ₸
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setShowTransfer(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 active:bg-white/20 transition-colors"
            >
              <ArrowUpRight size={15} className="text-white" />
              <span className="text-[13px] font-semibold text-white">Перевести в ₸</span>
            </button>
            <button
              onClick={() => setTab('quests')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 active:bg-amber-500/30 transition-colors"
            >
              <Sparkles size={15} className="text-amber-400" />
              <span className="text-[13px] font-semibold text-amber-400">Заработать</span>
            </button>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-white rounded-2xl p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-500" />
            <span className="text-[13px] font-semibold text-stone-700">Прогресс</span>
          </div>
          <span className="text-[13px] font-bold text-stone-900 tabular-nums">{profile.xp} XP</span>
        </div>
        <XPBar />
      </div>

      {/* Summary metrics */}
      <SummaryMetrics />

      {/* Openclaw AI Actions */}
      <div className="mt-4">
        <h3 className="text-[15px] font-bold text-stone-900 mb-2.5">Openclaw AI</h3>
        <div className="flex gap-2">
          <button
            onClick={async () => { showSnack('Openclaw создаёт событие...', 'info'); await fetchEvent(); showSnack('Новое событие создано!', 'success') }}
            className="flex-1 bg-white rounded-2xl p-3.5 flex items-center gap-2.5 active:bg-stone-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <Zap size={16} className="text-violet-500" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-stone-900">Событие</p>
              <p className="text-[11px] text-stone-400">Получить</p>
            </div>
          </button>
          <button
            onClick={async () => { showSnack('Openclaw создаёт акцию...', 'info'); await fetchPromo(); showSnack('Новая акция!', 'success') }}
            className="flex-1 bg-white rounded-2xl p-3.5 flex items-center gap-2.5 active:bg-stone-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Sparkles size={16} className="text-amber-500" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-stone-900">Акция</p>
              <p className="text-[11px] text-stone-400">Получить</p>
            </div>
          </button>
        </div>
      </div>

      {/* Active promos */}
      {activePromos.length > 0 && (
        <div className="mt-4">
          <h3 className="text-[15px] font-bold text-stone-900 mb-2.5">Акции</h3>
          <div className="space-y-2">
            {activePromos.map((p) => (
              <PromoCard
                key={p.id}
                promo={p}
                claimed={claimedPromos.includes(p.id)}
                playerLevel={profile.level}
                onClaim={(promo) => { claimPromo(promo); showSnack(`Акция "${promo.title}" активирована!`, 'success') }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active quests */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-stone-900">Активные квесты</h3>
          <button
            onClick={() => setTab('quests')}
            className="flex items-center gap-0.5 text-[13px] font-medium text-orange-500 active:opacity-60"
          >
            Все <ChevronRight size={14} />
          </button>
        </div>
        {activeQuests.length > 0 ? (
          <div className="space-y-2">
            {activeQuests.map((q) => (
              <MiniQuestCard key={q.id} quest={q} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 text-center">
            <p className="text-sm text-stone-400">Нет активных квестов</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* Mini quest card for home tab */
function MiniQuestCard({ quest }: { quest: import('@/store/game-store').Quest }) {
  const setTab = useUIStore((s) => s.setTab)
  const typeColors: Record<string, string> = {
    'Boss Quest': 'text-red-600 bg-red-50', 'Main Quest': 'text-orange-600 bg-orange-50',
    'Daily Quest': 'text-blue-600 bg-blue-50', 'Side Quest': 'text-stone-600 bg-stone-100',
    'Hidden Quest': 'text-violet-600 bg-violet-50', 'Penalty Quest': 'text-red-500 bg-red-50',
  }
  const typeLabels: Record<string, string> = {
    'Boss Quest': 'Босс', 'Main Quest': 'Основной', 'Daily Quest': 'Ежедн.',
    'Side Quest': 'Побочный', 'Hidden Quest': 'Скрытый', 'Penalty Quest': 'Штраф',
  }
  const typeIconMap: Record<string, typeof Swords> = {
    'Boss Quest': Swords, 'Main Quest': Flame, 'Daily Quest': Shield,
    'Side Quest': Brain, 'Hidden Quest': Palette, 'Penalty Quest': Shield,
  }
  const Icon = typeIconMap[quest.type] || Shield
  const color = typeColors[quest.type] || 'text-stone-600 bg-stone-100'
  const [textColor, bgColor] = color.split(' ')

  return (
    <button
      onClick={() => setTab('quests')}
      className="w-full bg-white rounded-2xl p-3.5 flex items-center gap-3 active:bg-stone-50 transition-colors text-left"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', bgColor)}>
        <Icon size={18} className={textColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-stone-900 truncate">{quest.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn('text-[11px] font-semibold', textColor)}>
            {typeLabels[quest.type]}
          </span>
          <span className="text-[11px] text-stone-300">·</span>
          <span className="text-[11px] font-semibold text-amber-600">+{quest.xp} XP</span>
          <span className="text-[11px] text-stone-300">·</span>
          <span className="text-[11px] font-semibold text-emerald-600">+{quest.jutiReward} J</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
    </button>
  )
}

/* ─── Quests Tab ─── */
function QuestsTab() {
  return (
    <div className="px-4 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="py-3 mb-1">
        <h1 className="text-xl font-bold text-stone-900">Квесты</h1>
      </div>
      <QuestList />
    </div>
  )
}

/* ─── Log Tab ─── */
function LogTab() {
  return (
    <div className="px-4 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="py-3 mb-1">
        <h1 className="text-xl font-bold text-stone-900">Системный лог</h1>
      </div>
      <SystemLog />
    </div>
  )
}

/* ─── Profile Tab ─── */
function ProfileTab() {
  const profile = useGameStore((s) => s.profile)
  const transfers = useGameStore((s) => s.transfers)
  const rank = getRankColor(profile.rank)

  return (
    <div className="px-4 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="py-3 mb-1">
        <h1 className="text-xl font-bold text-stone-900">Профиль</h1>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl p-5 mb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Swords size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">{profile.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-bold', rank.bg, rank.text)}>
                {profile.rank}
              </span>
              <span className="text-[13px] text-stone-400">Уровень {profile.level}</span>
            </div>
          </div>
        </div>
        <XPBar />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-50">
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-amber-500" />
            <span className="text-[13px] text-stone-500">JUTI баланс</span>
          </div>
          <span className="text-[15px] font-bold text-stone-900 tabular-nums">{profile.juti} J</span>
        </div>
      </div>

      {/* Stats */}
      <h3 className="text-[15px] font-bold text-stone-900 mb-2.5">Характеристики</h3>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {(Object.entries(profile.stats) as [keyof Stats, number][]).map(([key, val]) => {
          const Icon = statIcons[key]
          const colors = statColors[key]
          const [tc, bc] = colors.split(' ')
          return (
            <div key={key} className="bg-white rounded-2xl p-3.5 flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', bc)}>
                <Icon size={16} className={tc} />
              </div>
              <div>
                <div className="text-[15px] font-bold text-stone-900 tabular-nums">{val}</div>
                <div className="text-[11px] text-stone-400 font-medium">{statLabels[key]}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Rank progress */}
      <h3 className="text-[15px] font-bold text-stone-900 mb-2.5">Прогресс ранга</h3>
      <div className="bg-white rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between text-[12px]">
          {['E', 'D', 'C', 'B', 'A'].map((r) => {
            const full = `${r}-Rank`
            const ranks = ['E-Rank','D-Rank','C-Rank','B-Rank','A-Rank']
            const active = profile.rank === full
            const passed = ranks.indexOf(profile.rank) >= ranks.indexOf(full)
            return (
              <div key={r} className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs',
                  active ? 'bg-orange-500 text-white' : passed ? 'bg-orange-100 text-orange-600' : 'bg-stone-100 text-stone-400',
                )}>{r}</div>
              </div>
            )
          })}
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (profile.xp / 700) * 100)}%` }} />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-stone-400">
          <span>0 XP</span><span>700 XP</span>
        </div>
      </div>

      {/* Transfer history */}
      {transfers.length > 0 && (
        <>
          <h3 className="text-[15px] font-bold text-stone-900 mb-2.5">История переводов</h3>
          <div className="bg-white rounded-2xl overflow-hidden mb-4">
            {transfers.slice(0, 5).map((t, i) => (
              <div key={t.id} className={cn('flex items-center justify-between px-4 py-3', i < Math.min(4, transfers.length - 1) && 'border-b border-stone-50')}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <ArrowUpRight size={14} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-stone-700">JUTI → Тенге</p>
                    <p className="text-[11px] text-stone-400">{t.date}</p>
                  </div>
                </div>
                <span className="text-[14px] font-bold text-stone-900 tabular-nums">{t.amount} J</span>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}
