import { NextResponse } from 'next/server'
import { askOpenclaw } from '@/lib/anthropic'

export async function POST(req: Request) {
  try {
    const { questTitle, questDescription, photo, note } = await req.json()

    const hasPhoto = !!photo && photo.length > 100
    const hasNote = !!note && note.trim().length > 0

    if (!hasPhoto) {
      return NextResponse.json({
        verified: false,
        confidence: 0,
        feedback: 'Фото не прикреплено. Добавь фотографию для подтверждения.',
        bonusJuti: 0,
      })
    }

    const prompt = `Проверь выполнение квеста.

Квест: "${questTitle}"
Описание квеста: "${questDescription}"
Заметка игрока: "${note || 'не указана'}"
Фото прикреплено: да (${photo.length} символов base64)

Оцени по заметке игрока, насколько вероятно что квест выполнен.
Если заметка подробная и релевантная — высокая уверенность.
Если заметка короткая или нерелевантная — средняя.

Верни JSON:
{
  "verified": true/false,
  "confidence": число от 0 до 1,
  "feedback": "Краткий отзыв на русском",
  "bonusJuti": число от 0 до 8 (больше за детальное описание)
}`

    const text = await askOpenclaw(prompt)
    const result = JSON.parse(text)

    return NextResponse.json(result)
  } catch (e) {
    console.error('verify-completion error:', e)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
