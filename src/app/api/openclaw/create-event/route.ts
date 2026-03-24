import { NextResponse } from 'next/server'
import { askOpenclaw } from '@/lib/anthropic'

export async function POST() {
  try {
    const prompt = `Создай ограниченное по времени игровое событие для системы саморазвития.

Событие должно быть:
- Тематическим (дисциплина, разум, тело, креативность, карьера, социал)
- С конкретными целями на несколько дней
- Мотивирующим

Верни JSON:
{
  "id": "event_${Date.now()}",
  "title": "Название события",
  "description": "Описание с конкретными целями (2-3 предложения)",
  "image": "/events/placeholder.jpg",
  "rewards": ["+50 JUTI", "+3 StatName", "Exclusive Badge"],
  "duration": "X дней",
  "color": "#hex цвет",
  "startsAt": "${new Date().toISOString()}",
  "expiresAt": "ISO дата через X дней",
  "active": true
}`

    const text = await askOpenclaw(prompt)
    const event = JSON.parse(text)

    return NextResponse.json({ event })
  } catch (e) {
    console.error('create-event error:', e)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
