import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameEvent } from '@/components/event-modal'
import type { Promo } from '@/components/promo-card'

/* ── Types ── */
export interface Stats {
  discipline: number
  mind: number
  body: number
  creativity: number
  career: number
  social: number
}

export type QuestType = 'Boss Quest' | 'Main Quest' | 'Daily Quest' | 'Side Quest' | 'Hidden Quest' | 'Penalty Quest'
export type QuestStatus = 'active' | 'completed' | 'failed'

export interface Quest {
  id: string
  title: string
  description: string
  type: QuestType
  xp: number
  penalty: number
  status: QuestStatus
  rewards: string[]
  jutiReward: number
  completionPhoto?: string
  completionNote?: string
}

export interface LogEntry {
  id: string
  time: string
  title: string
  body: string
  epic: boolean
}

export interface Transfer {
  id: string
  amount: number
  tenge: number
  date: string
}

export interface Profile {
  name: string
  level: number
  xp: number
  xpToNext: number
  rank: string
  streak: number
  stats: Stats
  juti: number
}

interface GameState {
  profile: Profile
  quests: Quest[]
  logs: LogEntry[]
  transfers: Transfer[]
  events: GameEvent[]
  promos: Promo[]
  claimedPromos: string[]
  completeQuest: (id: string, photo: string, note: string) => void
  failQuest: (id: string) => void
  generateQuest: () => void
  generateQuestFromAPI: () => Promise<void>
  failQuestWithAPI: (id: string) => Promise<void>
  verifyAndComplete: (id: string, photo: string, note: string) => Promise<void>
  checkRank: () => Promise<void>
  fetchEvent: () => Promise<void>
  fetchPromo: () => Promise<void>
  claimPromo: (promo: Promo) => void
  dismissEvent: (id: string) => void
  transferJuti: (amount: number) => boolean
  resetDemo: () => void
}

/* ── Helpers ── */
function uid() { return crypto.randomUUID() }

function timeNow() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function dateNow() {
  return new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function makeLog(title: string, body: string, epic = false): LogEntry {
  return { id: uid(), time: timeNow(), title, body, epic }
}

function updateRank(profile: Profile) {
  const { xp } = profile
  if (xp >= 700) profile.rank = 'A-Rank'
  else if (xp >= 500) profile.rank = 'B-Rank'
  else if (xp >= 300) profile.rank = 'C-Rank'
  else if (xp >= 180) profile.rank = 'D-Rank'
  else profile.rank = 'E-Rank'
  profile.level = Math.max(1, Math.floor(xp / 80) + 1)
  profile.xpToNext = profile.level * 80
}

function applyRewards(stats: Stats, rewards: string[], positive: boolean) {
  const delta = positive ? 1 : -1
  rewards.forEach(r => {
    const key = r.toLowerCase()
    if (key.includes('discipline')) stats.discipline += delta
    if (key.includes('mind')) stats.mind += delta
    if (key.includes('body')) stats.body += delta
    if (key.includes('creativity')) stats.creativity += delta
    if (key.includes('career')) stats.career += delta
    if (key.includes('social')) stats.social += delta
  })
}

/* ── Quest pool ── */
const questPool: Array<[QuestType, string, string, number, number, string[], number]> = [
  ['Side Quest', 'Сделать 20 минут английского', 'Пройди speaking practice или повтори 20 новых слов.', 18, -5, ['+1 Mind'], 8],
  ['Hidden Quest', 'Выйти на прогулку на 20 минут', 'Просто выйди на улицу, проветрись и пройдись без телефона.', 16, -4, ['+1 Body'], 12],
  ['Main Quest', 'Доделать один экран дизайна', 'Выбери один экран и доведи его до аккуратного рабочего состояния.', 35, -10, ['+1 Creativity', '+1 Career'], 25],
  ['Daily Quest', 'Разобрать 1 важный документ', 'Открой, прочитай и разложи по полочкам один нужный файл или тему.', 20, -6, ['+1 Mind'], 10],
]

/* ── Default state ── */
const defaultProfile: Profile = {
  name: 'Ануар',
  level: 3,
  xp: 120,
  xpToNext: 200,
  rank: 'E-Rank',
  streak: 4,
  stats: { discipline: 11, mind: 14, body: 7, creativity: 13, career: 9, social: 6 },
  juti: 150,
}

const defaultQuests: Quest[] = [
  {
    id: uid(), title: 'Подготовить 10 ответов на визовое интервью',
    description: 'Собери 10 сильных коротких ответов для Work and Travel interview и проговори их вслух 2 раза.',
    type: 'Boss Quest', xp: 120, penalty: -25, status: 'active',
    rewards: ['+2 Mind', '+2 Discipline', '+1 Social'], jutiReward: 50,
  },
  {
    id: uid(), title: 'Закрыть один учебный хвост до вечера',
    description: 'Выбери одну задачу, которую давно откладывал, и закрой её полностью без полумер.',
    type: 'Main Quest', xp: 55, penalty: -15, status: 'active',
    rewards: ['+1 Discipline', '+1 Career'], jutiReward: 25,
  },
  {
    id: uid(), title: '30 минут фокусной работы без телефона',
    description: 'Поставь таймер и поработай 30 минут в полном фокусе. Никаких соцсетей и скачков между задачами.',
    type: 'Daily Quest', xp: 25, penalty: -8, status: 'active',
    rewards: ['+1 Discipline'], jutiReward: 10,
  },
]

const defaultLogs: LogEntry[] = [
  makeLog('System initialized', 'MVP активирован. Квесты назначены. Штрафной протокол включён.', true),
  makeLog('Victor note', 'Не копи квесты. Лучше закрыть один полностью, чем пять наполовину.', false),
]

/* ── Store ── */
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      profile: { ...defaultProfile, stats: { ...defaultProfile.stats } },
      quests: defaultQuests.map(q => ({ ...q })),
      logs: [...defaultLogs],
      transfers: [],
      events: [],
      promos: [],
      claimedPromos: [],

      completeQuest: (id, photo, note) =>
        set((state) => {
          const quest = state.quests.find(q => q.id === id)
          if (!quest || quest.status !== 'active') return state

          const newQuests = state.quests.map(q =>
            q.id === id ? { ...q, status: 'completed' as QuestStatus, completionPhoto: photo, completionNote: note } : q
          )
          const newProfile = {
            ...state.profile,
            xp: state.profile.xp + quest.xp,
            juti: state.profile.juti + quest.jutiReward,
            streak: state.profile.streak + 1,
            stats: { ...state.profile.stats },
          }
          applyRewards(newProfile.stats, quest.rewards, true)
          updateRank(newProfile)

          const newLog = makeLog(
            'Quest completed',
            `${quest.title} закрыт. +${quest.xp} XP, +${quest.jutiReward} JUTI`,
            true,
          )

          return { quests: newQuests, profile: newProfile, logs: [newLog, ...state.logs] }
        }),

      failQuest: (id) =>
        set((state) => {
          const quest = state.quests.find(q => q.id === id)
          if (!quest || quest.status !== 'active') return state

          const newQuests = state.quests.map(q =>
            q.id === id ? { ...q, status: 'failed' as QuestStatus } : q
          )
          const newProfile = {
            ...state.profile,
            xp: Math.max(0, state.profile.xp + quest.penalty),
            streak: 0,
            stats: { ...state.profile.stats, discipline: Math.max(0, state.profile.stats.discipline - 1) },
          }
          updateRank(newProfile)

          const penaltyQuest: Quest = {
            id: uid(),
            title: `Штрафной: восстановление после "${quest.title}"`,
            description: 'Сделай короткое восстановительное действие: 15 минут фокуса без отвлечений.',
            type: 'Penalty Quest', xp: 12, penalty: -4, status: 'active',
            rewards: ['+1 Discipline'], jutiReward: 5,
          }
          const newLog = makeLog(
            'Penalty applied',
            `${quest.title} провален. Штраф ${quest.penalty} XP. Выдан штрафной квест.`,
            true,
          )

          return { quests: [penaltyQuest, ...newQuests], profile: newProfile, logs: [newLog, ...state.logs] }
        }),

      generateQuest: () =>
        set((state) => {
          const [type, title, description, xp, penalty, rewards, jutiReward] =
            questPool[Math.floor(Math.random() * questPool.length)]
          const quest: Quest = { id: uid(), type, title, description, xp, penalty, status: 'active', rewards, jutiReward }
          const log = makeLog('New quest assigned', `Получен: ${title} (+${jutiReward} JUTI)`, true)
          return { quests: [quest, ...state.quests], logs: [log, ...state.logs] }
        }),

      /* ── Openclaw API Integration ── */

      generateQuestFromAPI: async () => {
        try {
          const { profile } = get()
          const res = await fetch('/api/openclaw/generate-quest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile: { xp: profile.xp, level: profile.level, stats: profile.stats } }),
          })
          if (!res.ok) throw new Error('API error')
          const data = await res.json()
          const q = data.quest
          const quest: Quest = {
            id: uid(), title: q.title, description: q.description,
            type: q.type, xp: q.xp, penalty: q.penalty,
            status: 'active', rewards: q.rewards, jutiReward: q.jutiReward,
          }
          set((state) => ({
            quests: [quest, ...state.quests],
            logs: [makeLog('Openclaw quest', `AI выдал: ${quest.title} (+${quest.jutiReward} JUTI)`, true), ...state.logs],
          }))
        } catch {
          // Fallback to local generation
          get().generateQuest()
        }
      },

      failQuestWithAPI: async (id) => {
        const state = get()
        const quest = state.quests.find(q => q.id === id)
        if (!quest || quest.status !== 'active') return

        // Mark as failed and apply penalty
        const newQuests = state.quests.map(q =>
          q.id === id ? { ...q, status: 'failed' as QuestStatus } : q
        )
        const newProfile = {
          ...state.profile,
          xp: Math.max(0, state.profile.xp + quest.penalty),
          streak: 0,
          stats: { ...state.profile.stats, discipline: Math.max(0, state.profile.stats.discipline - 1) },
        }
        updateRank(newProfile)

        try {
          const res = await fetch('/api/openclaw/generate-penalty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ failedQuestTitle: quest.title }),
          })
          if (!res.ok) throw new Error('API error')
          const data = await res.json()
          const p = data.quest
          const penaltyQuest: Quest = {
            id: uid(), title: p.title, description: p.description,
            type: 'Penalty Quest', xp: p.xp, penalty: p.penalty || -4,
            status: 'active', rewards: p.rewards, jutiReward: p.jutiReward,
          }
          set({
            quests: [penaltyQuest, ...newQuests], profile: newProfile,
            logs: [makeLog('Openclaw penalty', `${quest.title} провален. AI выдал штрафной квест.`, true), ...state.logs],
          })
        } catch {
          // Fallback: local penalty quest
          const penaltyQuest: Quest = {
            id: uid(),
            title: `Штрафной: восстановление после "${quest.title}"`,
            description: 'Сделай короткое восстановительное действие: 15 минут фокуса без отвлечений.',
            type: 'Penalty Quest', xp: 12, penalty: -4, status: 'active',
            rewards: ['+1 Discipline'], jutiReward: 5,
          }
          set({
            quests: [penaltyQuest, ...newQuests], profile: newProfile,
            logs: [makeLog('Penalty applied', `${quest.title} провален. Штраф ${quest.penalty} XP.`, true), ...state.logs],
          })
        }
      },

      verifyAndComplete: async (id, photo, note) => {
        const state = get()
        const quest = state.quests.find(q => q.id === id)
        if (!quest || quest.status !== 'active') return

        try {
          const res = await fetch('/api/openclaw/verify-completion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questTitle: quest.title, questDescription: quest.description, photo, note }),
          })
          if (!res.ok) throw new Error('API error')
          const verification = await res.json()

          if (!verification.verified) {
            set((s) => ({
              logs: [makeLog('Verification failed', `Openclaw: ${verification.feedback}`, false), ...s.logs],
            }))
            return
          }

          // Verified — complete quest with possible bonus JUTI
          const bonusJuti = verification.bonusJuti || 0
          const totalJuti = quest.jutiReward + bonusJuti

          const newQuests = state.quests.map(q =>
            q.id === id ? { ...q, status: 'completed' as QuestStatus, completionPhoto: photo, completionNote: note } : q
          )
          const newProfile = {
            ...state.profile,
            xp: state.profile.xp + quest.xp,
            juti: state.profile.juti + totalJuti,
            streak: state.profile.streak + 1,
            stats: { ...state.profile.stats },
          }
          applyRewards(newProfile.stats, quest.rewards, true)
          updateRank(newProfile)

          const feedback = verification.feedback ? ` ${verification.feedback}` : ''
          const bonusText = bonusJuti > 0 ? ` (+${bonusJuti} бонус JUTI!)` : ''
          set({
            quests: newQuests, profile: newProfile,
            logs: [makeLog('Quest verified', `${quest.title} подтверждён AI. +${quest.xp} XP, +${totalJuti} JUTI.${feedback}${bonusText}`, true), ...state.logs],
          })
        } catch {
          // Fallback: complete without verification
          get().completeQuest(id, photo, note)
        }
      },

      checkRank: async () => {
        try {
          const { profile } = get()
          const res = await fetch('/api/openclaw/assign-rank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile: { xp: profile.xp, stats: profile.stats } }),
          })
          if (!res.ok) return
          const data = await res.json()
          if (data.changed && data.newRank !== profile.rank) {
            set((state) => ({
              profile: { ...state.profile, rank: data.newRank },
              logs: [makeLog('Rank change', data.reason, true), ...state.logs],
            }))
          }
        } catch { /* silent */ }
      },

      fetchEvent: async () => {
        try {
          const res = await fetch('/api/openclaw/create-event', { method: 'POST' })
          if (!res.ok) return
          const data = await res.json()
          set((state) => ({
            events: [data.event, ...state.events.slice(0, 4)],
            logs: [makeLog('New event', `Openclaw создал событие: ${data.event.title}`, true), ...state.logs],
          }))
        } catch { /* silent */ }
      },

      fetchPromo: async () => {
        try {
          const res = await fetch('/api/openclaw/create-promo', { method: 'POST' })
          if (!res.ok) return
          const data = await res.json()
          set((state) => ({
            promos: [data.promo, ...state.promos.slice(0, 4)],
            logs: [makeLog('New promo', `Акция: ${data.promo.title} — ${data.promo.code}`, false), ...state.logs],
          }))
        } catch { /* silent */ }
      },

      claimPromo: (promo) =>
        set((state) => {
          if (state.claimedPromos.includes(promo.id)) return state
          let bonusJuti = 0
          if (promo.type === 'bonus') bonusJuti = promo.value
          else if (promo.type === 'cashback') bonusJuti = Math.floor(promo.value / 2)

          return {
            claimedPromos: [...state.claimedPromos, promo.id],
            profile: { ...state.profile, juti: state.profile.juti + bonusJuti },
            logs: [makeLog('Promo claimed', `Активирована акция "${promo.title}"${bonusJuti > 0 ? ` +${bonusJuti} JUTI` : ''}`, true), ...state.logs],
          }
        }),

      dismissEvent: (id) =>
        set((state) => ({
          events: state.events.filter(e => e.id !== id),
        })),

      transferJuti: (amount) => {
        const state = get()
        if (amount <= 0 || amount > state.profile.juti) return false
        const transfer: Transfer = {
          id: uid(),
          amount,
          tenge: amount, // 1 JUTI = 1 ₸
          date: dateNow(),
        }
        set({
          profile: { ...state.profile, juti: state.profile.juti - amount },
          transfers: [transfer, ...state.transfers],
          logs: [makeLog('Transfer', `Переведено ${amount} JUTI → ${amount} ₸`, true), ...state.logs],
        })
        return true
      },

      resetDemo: () =>
        set(() => ({
          profile: { ...defaultProfile, stats: { ...defaultProfile.stats } },
          quests: defaultQuests.map(q => ({ ...q, id: uid() })),
          logs: [makeLog('System reset', 'Демо сброшено. Начинаем с нуля.', true)],
          transfers: [],
          events: [],
          promos: [],
          claimedPromos: [],
        })),
    }),
    { name: 'ascend-system-v4' },
  ),
)
