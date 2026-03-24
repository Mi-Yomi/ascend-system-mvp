import { NextResponse } from 'next/server'

const allowedTypes = ['Boss Quest', 'Main Quest', 'Daily Quest', 'Side Quest', 'Hidden Quest', 'Penalty Quest'] as const

type QuestType = (typeof allowedTypes)[number]

interface ManualQuestBody {
  title?: string
  description?: string
  type?: QuestType
  xp?: number
  penalty?: number
  rewards?: string[]
  jutiReward?: number
  source?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ManualQuestBody

    if (!body.title || !body.description) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 })
    }

    const type: QuestType = allowedTypes.includes((body.type || 'Main Quest') as QuestType)
      ? (body.type || 'Main Quest') as QuestType
      : 'Main Quest'

    const quest = {
      title: body.title,
      description: body.description,
      type,
      xp: Math.max(1, Number(body.xp ?? 35)),
      penalty: Number(body.penalty ?? -10),
      rewards: Array.isArray(body.rewards) && body.rewards.length > 0 ? body.rewards : ['+1 Discipline'],
      jutiReward: Math.max(0, Number(body.jutiReward ?? 15)),
      source: body.source || 'Victor Manual Quest',
      injectedAt: new Date().toISOString(),
    }

    return NextResponse.json({ quest })
  } catch {
    return NextResponse.json({ error: 'Failed to create manual quest' }, { status: 500 })
  }
}
