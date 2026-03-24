import { NextResponse } from 'next/server'
import { askOpenclaw } from '@/lib/anthropic'

export async function POST(req: Request) {
  try {
    const { profile } = await req.json()
    const { xp, stats } = profile || {}

    const prompt = `Оцени игрока и определи его ранг.

XP: ${xp || 0}
Статы: ${JSON.stringify(stats || {})}

Правила рангов по XP:
- E-Rank: 0-179 XP
- D-Rank: 180-299 XP
- C-Rank: 300-499 XP
- B-Rank: 500-699 XP
- A-Rank: 700+ XP

Но ты можешь переопределить ранг:
- Понизить если статы сильно несбалансированы (один стат < 3 при среднем > 8)
- Повысить если все статы высокие и сбалансированные (min >= 10, avg >= 12)

Верни JSON:
{
  "newRank": "X-Rank",
  "reason": "Объяснение на русском",
  "changed": true/false (true если ранг отличается от XP-ранга)
}`

    const text = await askOpenclaw(prompt)
    const result = JSON.parse(text)

    return NextResponse.json(result)
  } catch (e) {
    console.error('assign-rank error:', e)
    return NextResponse.json({ error: 'Rank assignment failed' }, { status: 500 })
  }
}
