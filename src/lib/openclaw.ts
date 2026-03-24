/**
 * Openclaw AI Client
 *
 * Calls the local API routes powered by Claude AI (Anthropic).
 * All endpoints use real AI — no mocks.
 */

export interface OpenclawQuest {
  title: string
  description: string
  type: 'Boss Quest' | 'Main Quest' | 'Daily Quest' | 'Side Quest' | 'Hidden Quest' | 'Penalty Quest'
  xp: number
  penalty: number
  rewards: string[]
  jutiReward: number
}

export interface VerificationResult {
  verified: boolean
  confidence: number
  feedback: string
  bonusJuti: number
}

export interface CoinResult {
  success: boolean
  amount: number
  reason: string
  newBalance: number
}

export interface RankResult {
  newRank: string
  reason: string
  changed: boolean
}

export interface GameEvent {
  id: string
  title: string
  description: string
  imageUrl: string
  ctaText: string
  ctaAction: 'give_coins' | 'give_quest' | 'give_xp'
  ctaValue: number
  expiresAt: string
}

export interface Promo {
  id: string
  title: string
  description: string
  reward: { type: 'juti' | 'xp'; amount: number }
  bgColor: string
  claimed: boolean
}

export interface HeartbeatResult {
  status: 'ok' | 'warning' | 'critical'
  message: string
  suggestion: string | null
  questsNeedAttention: string[]
  shouldGenerateQuest: boolean
}

export interface OpenclawStatus {
  status: 'online' | 'no_api_key'
  version: string
  engine: string
  mode: string
  capabilities: string[]
}

async function post<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/openclaw/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Openclaw API error: ${res.status}`)
  return res.json()
}

async function get<T>(endpoint: string): Promise<T> {
  const res = await fetch(`/api/openclaw/${endpoint}`)
  if (!res.ok) throw new Error(`Openclaw API error: ${res.status}`)
  return res.json()
}

export const openclaw = {
  /** AI generates a new quest based on player profile */
  generateQuest: (profile: Record<string, unknown>) =>
    post<{ quest: OpenclawQuest }>('generate-quest', { profile }),

  /** AI generates a penalty quest for a failed quest */
  generatePenalty: (failedQuestTitle: string, profile: Record<string, unknown>) =>
    post<{ quest: OpenclawQuest }>('generate-penalty', { failedQuestTitle, profile }),

  /** AI verifies quest completion photo and note */
  verifyCompletion: (questTitle: string, questDescription: string, photo: string, note: string) =>
    post<VerificationResult>('verify-completion', { questTitle, questDescription, photo, note }),

  /** AI manages player coins (give/take) */
  manageCoins: (action: 'add' | 'subtract', amount: number, reason: string, currentBalance: number) =>
    post<CoinResult>('manage-coins', { action, amount, reason, currentBalance }),

  /** AI assigns rank based on player stats */
  assignRank: (profile: Record<string, unknown>) =>
    post<RankResult>('assign-rank', { profile }),

  /** AI creates a game event with modal card */
  createEvent: () =>
    post<{ event: GameEvent }>('create-event', {}),

  /** AI creates a promotional offer */
  createPromo: () =>
    post<{ promo: Promo }>('create-promo', {}),

  /** Heartbeat — AI checks quest status and gives feedback */
  heartbeat: (profile: Record<string, unknown>, quests: Record<string, unknown>[]) =>
    post<HeartbeatResult>('heartbeat', { profile, quests }),

  /** Get Openclaw system status */
  getStatus: () =>
    get<OpenclawStatus>('status'),
}
