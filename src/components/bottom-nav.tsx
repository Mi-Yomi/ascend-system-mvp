'use client'

import { useUIStore, type Tab } from '@/store/ui-store'
import { useGameStore } from '@/store/game-store'
import { Home, Scroll, Plus, Activity, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs: Array<{ id: Tab; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'quests', label: 'Квесты', icon: Scroll },
  { id: 'log', label: 'Лог', icon: Activity },
  { id: 'profile', label: 'Профиль', icon: User },
]

export function BottomNav() {
  const activeTab = useUIStore((s) => s.activeTab)
  const setTab = useUIStore((s) => s.setTab)
  const generateQuest = useGameStore((s) => s.generateQuest)
  const showSnack = useUIStore((s) => s.showSnack)

  const handleGenerate = async () => {
    showSnack('Openclaw генерирует квест...', 'info')
    const store = useGameStore.getState()
    await store.generateQuestFromAPI()
    showSnack('Новый квест от Openclaw', 'success')
    setTab('quests')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200/80">
      <div className="max-w-[430px] mx-auto flex items-end justify-around px-2 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))]">
        {tabs.slice(0, 2).map((tab) => (
          <NavItem
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onPress={() => setTab(tab.id)}
          />
        ))}

        {/* Center generate button */}
        <button
          onClick={handleGenerate}
          className="flex flex-col items-center -mt-4 active:scale-90 transition-transform"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Plus size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium text-stone-400 mt-1">Новый</span>
        </button>

        {tabs.slice(2).map((tab) => (
          <NavItem
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onPress={() => setTab(tab.id)}
          />
        ))}
      </div>
    </nav>
  )
}

function NavItem({
  tab,
  active,
  onPress,
}: {
  tab: (typeof tabs)[number]
  active: boolean
  onPress: () => void
}) {
  const Icon = tab.icon
  return (
    <button
      onClick={onPress}
      className={cn(
        'flex flex-col items-center py-1.5 px-3 min-w-[56px] transition-colors active:scale-95',
        active ? 'text-orange-500' : 'text-stone-400',
      )}
    >
      <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
      <span className={cn('text-[10px] mt-0.5', active ? 'font-semibold' : 'font-medium')}>
        {tab.label}
      </span>
    </button>
  )
}
