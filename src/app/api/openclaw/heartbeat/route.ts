import { NextResponse } from 'next/server'
import { askOpenclaw } from '@/lib/anthropic'

/**
 * POST /api/openclaw/heartbeat
 *
 * Openclaw periodically checks active quests and evaluates the player's state.
 * Returns AI-powered feedback: reminders, motivational messages, or warnings.
 */

interface QuestInfo {
  id: string
  title: string
  description: string
  type: string
  xp: number
  status: string
}

export async function POST(req: Request) {
  try {
    const { profile, quests } = await req.json()

    const activeQuests: QuestInfo[] = (quests || []).filter((q: QuestInfo) => q.status === 'active')
    const completedToday: QuestInfo[] = (quests || []).filter((q: QuestInfo) => q.status === 'completed')
    const failedToday: QuestInfo[] = (quests || []).filter((q: QuestInfo) => q.status === 'failed')

    const prompt = `Ты — Openclaw, проводишь heartbeat-проверку игрока.

Профиль:
- Уровень: ${profile?.level || 1}
- XP: ${profile?.xp || 0}
- Ранг: ${profile?.rank || 'E-Rank'}
- Стрик: ${profile?.streak || 0}
- JUTI: ${profile?.juti || 0}
- Статы: ${JSON.stringify(profile?.stats || {})}

Активные квесты (${activeQuests.length}):
${activeQuests.map(q => `- "${q.title}" (${q.type}, +${q.xp} XP)`).join('\n') || 'нет'}

Выполнено сегодня: ${completedToday.length}
Провалено сегодня: ${failedToday.length}

Оцени состояние игрока и дай рекомендации:
- Если квестов нет — предложи запросить новый
- Если много активных — напомни приоритизировать
- Если стрик высокий — похвали
- Если много провалов — подбодри без давления
- Если статы несбалансированы — укажи на это

Верни JSON:
{
  "status": "ok" | "warning" | "critical",
  "message": "Краткое сообщение игроку на русском (1-2 предложения)",
  "suggestion": "Конкретное действие/совет (1 предложение)" | null,
  "questsNeedAttention": ["id квестов которые нужно приоритизировать"] | [],
  "shouldGenerateQuest": true/false (true если нет активных квестов)
}`

    const text = await askOpenclaw(prompt)
    const result = JSON.parse(text)

    return NextResponse.json(result)
  } catch (e) {
    console.error('heartbeat error:', e)
    return NextResponse.json({
      status: 'ok',
      message: 'Heartbeat check completed.',
      suggestion: null,
      questsNeedAttention: [],
      shouldGenerateQuest: false,
    })
  }
}
