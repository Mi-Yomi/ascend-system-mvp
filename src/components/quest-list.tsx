'use client'

import { useState, useCallback } from 'react'
import { useGameStore } from '@/store/game-store'
import { useUIStore } from '@/store/ui-store'
import { QuestCard } from './quest-card'
import { CompletionSheet } from './completion-sheet'
import { BottomSheet } from './bottom-sheet'
import { cn } from '@/lib/utils'
import { playQuestComplete } from '@/lib/sounds'

type Filter = 'active' | 'completed' | 'failed' | 'all'

type SheetState = {
  open: boolean
  questId: string | null
  action: 'complete' | 'fail' | null
}

export function QuestList() {
  const quests = useGameStore((s) => s.quests)
  const showSnack = useUIStore((s) => s.showSnack)
  const [filter, setFilter] = useState<Filter>('active')
  const [sheet, setSheet] = useState<SheetState>({ open: false, questId: null, action: null })

  const handleComplete = useCallback((id: string) => {
    setSheet({ open: true, questId: id, action: 'complete' })
  }, [])

  const handleFail = useCallback((id: string) => {
    setSheet({ open: true, questId: id, action: 'fail' })
  }, [])

  // Completion with photo + note — verified by Openclaw AI
  const handleCompletionConfirm = useCallback(async (photo: string, note: string) => {
    if (!sheet.questId) return
    const quest = quests.find((q) => q.id === sheet.questId)
    showSnack('Openclaw проверяет...', 'info')
    const store = useGameStore.getState()
    await store.verifyAndComplete(sheet.questId, photo, note)
    playQuestComplete()
    showSnack(`+${quest?.xp} XP, +${quest?.jutiReward} JUTI!`, 'success')
    // Check rank after completion
    store.checkRank()
    setSheet({ open: false, questId: null, action: null })
  }, [sheet, quests, showSnack])

  // Fail confirmation — Openclaw generates penalty
  const handleFailConfirm = useCallback(async () => {
    if (!sheet.questId) return
    const quest = quests.find((q) => q.id === sheet.questId)
    const store = useGameStore.getState()
    await store.failQuestWithAPI(sheet.questId)
    showSnack(`${quest?.penalty} XP. Openclaw выдал штрафной квест`, 'error')
    setSheet({ open: false, questId: null, action: null })
  }, [sheet, quests, showSnack])

  const handleCancel = useCallback(() => {
    setSheet({ open: false, questId: null, action: null })
  }, [])

  const filtered = filter === 'all' ? quests : quests.filter((q) => q.status === filter)
  const selectedQuest = quests.find((q) => q.id === sheet.questId) || null

  const filters: Array<{ id: Filter; label: string; count: number }> = [
    { id: 'active', label: 'Активные', count: quests.filter((q) => q.status === 'active').length },
    { id: 'completed', label: 'Выполнены', count: quests.filter((q) => q.status === 'completed').length },
    { id: 'failed', label: 'Провалены', count: quests.filter((q) => q.status === 'failed').length },
    { id: 'all', label: 'Все', count: quests.length },
  ]

  return (
    <>
      {/* Filter chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto stats-scroll pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors active:scale-95',
              filter === f.id ? 'bg-orange-500 text-white' : 'bg-white text-stone-500',
            )}
          >
            {f.label}
            {f.count > 0 && (
              <span className={cn('ml-1 text-[11px]', filter === f.id ? 'text-orange-200' : 'text-stone-300')}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quest cards */}
      <div className="space-y-2.5">
        {filtered.map((quest) => (
          <QuestCard key={quest.id} quest={quest} onComplete={handleComplete} onFail={handleFail} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-[13px] text-stone-400">Нет квестов в этой категории</p>
        </div>
      )}

      {/* Completion sheet (photo + note required) */}
      <CompletionSheet
        open={sheet.open && sheet.action === 'complete'}
        quest={selectedQuest}
        onConfirm={handleCompletionConfirm}
        onCancel={handleCancel}
      />

      {/* Fail confirmation sheet */}
      <BottomSheet
        open={sheet.open && sheet.action === 'fail'}
        quest={selectedQuest}
        action="fail"
        onConfirm={handleFailConfirm}
        onCancel={handleCancel}
      />
    </>
  )
}
