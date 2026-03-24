import { NextResponse } from 'next/server'
import { askOpenclaw } from '@/lib/anthropic'

export async function POST(req: Request) {
  try {
    const { profile } = await req.json()
    const stats = profile?.stats || {}
    const level = profile?.level || 1
    const xp = profile?.xp || 0

    const prompt = `Сгенерируй один квест для игрока.

Профиль игрока:
- Уровень: ${level}
- XP: ${xp}
- Статы: ${JSON.stringify(stats)}

Проанализируй слабые статы и создай квест, который поможет их прокачать.
Для высоких уровней — сложнее квесты, для низких — проще.

Верни JSON в формате:
{
  "title": "Название квеста",
  "description": "Описание задания (2-3 предложения)",
  "type": "Boss Quest | Main Quest | Daily Quest | Side Quest | Hidden Quest",
  "xp": число от 10 до 120,
  "penalty": отрицательное число от -3 до -25,
  "rewards": ["+1 StatName", "+2 StatName"],
  "jutiReward": число от 3 до 50
}`

    const text = await askOpenclaw(prompt)
    const quest = JSON.parse(text)

    return NextResponse.json({ quest })
  } catch (e) {
    console.error('generate-quest error:', e)
    return NextResponse.json({ error: 'Failed to generate quest' }, { status: 500 })
  }
}
