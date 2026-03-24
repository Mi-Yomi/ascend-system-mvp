import { NextResponse } from 'next/server'
import { askOpenclaw } from '@/lib/anthropic'

export async function POST() {
  try {
    const now = new Date()
    const prompt = `Создай промо-акцию для JUTI магазина в системе Ascend.

Типы акций:
- multiplier: множитель JUTI (value = множитель, напр. 2)
- bonus: бонусные JUTI (value = количество, напр. 50)
- cashback: кэшбэк за квесты (value = процент, напр. 30)
- shield: защита от штрафа (value = 1)

Верни JSON:
{
  "id": "promo_${Date.now()}",
  "title": "Название акции",
  "description": "Описание (1-2 предложения)",
  "code": "ПРОМОКОД",
  "type": "multiplier | bonus | cashback | shield",
  "value": число,
  "minLevel": число от 1 до 5,
  "active": true,
  "createdAt": "${now.toISOString()}",
  "expiresAt": "ISO дата через 12-72 часа"
}`

    const text = await askOpenclaw(prompt)
    const promo = JSON.parse(text)

    return NextResponse.json({ promo })
  } catch (e) {
    console.error('create-promo error:', e)
    return NextResponse.json({ error: 'Failed to create promo' }, { status: 500 })
  }
}
