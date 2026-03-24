import { NextResponse } from 'next/server'
import { askOpenclaw } from '@/lib/anthropic'

export async function POST(req: Request) {
  try {
    const { failedQuestTitle } = await req.json()

    const prompt = `Игрок провалил квест: "${failedQuestTitle}".

Сгенерируй восстановительный штрафной квест. Он должен быть:
- Коротким (5-15 минут)
- Восстановительным, не карательным
- Помогать вернуть контроль и фокус

Верни JSON:
{
  "title": "Штраф: название",
  "description": "Описание (после провала конкретного квеста)",
  "type": "Penalty Quest",
  "xp": число от 5 до 15,
  "penalty": -4,
  "rewards": ["+1 StatName"],
  "jutiReward": число от 2 до 8
}`

    const text = await askOpenclaw(prompt)
    const quest = JSON.parse(text)

    return NextResponse.json({ quest })
  } catch (e) {
    console.error('generate-penalty error:', e)
    return NextResponse.json({ error: 'Failed to generate penalty' }, { status: 500 })
  }
}
