import { NextResponse } from 'next/server'

/**
 * POST /api/openclaw/verify-completion
 *
 * Openclaw AI verifies quest completion by analyzing the submitted photo
 * and description. Returns verification result with confidence score.
 *
 * In production: send photo to vision model for actual image analysis.
 * Current mock: analyzes note length and presence of photo.
 */

export async function POST(req: Request) {
  try {
    const { questTitle, questDescription, photo, note } = await req.json()

    // --- Openclaw AI Vision Logic (Mock) ---
    // In production, send `photo` (base64) to a vision model:
    // const analysis = await openclaw.vision.analyze(photo, questDescription)

    const hasPhoto = !!photo && photo.length > 100
    const hasNote = !!note && note.trim().length > 0
    const noteLength = note?.trim().length || 0

    let verified = false
    let confidence = 0
    let feedback = ''
    let bonusJuti = 0

    if (!hasPhoto) {
      verified = false
      confidence = 0
      feedback = 'Фото не прикреплено. Добавь фотографию для подтверждения.'
    } else if (noteLength >= 20) {
      // Good note + photo = verified with high confidence
      verified = true
      confidence = 0.92
      feedback = 'Отлично! Openclaw подтверждает выполнение квеста. Детальное описание оценено.'
      bonusJuti = Math.floor(Math.random() * 5) + 3
    } else if (hasNote) {
      // Short note + photo = verified with medium confidence
      verified = true
      confidence = 0.75
      feedback = 'Квест подтверждён. В следующий раз напиши чуть подробнее для бонусных JUTI.'
      bonusJuti = 1
    } else {
      // Photo only, no note = verified with lower confidence
      verified = true
      confidence = 0.6
      feedback = 'Принято по фото. Добавь описание в следующий раз для большей награды.'
      bonusJuti = 0
    }

    return NextResponse.json({
      verified,
      confidence,
      feedback,
      bonusJuti,
      _aiMeta: {
        questAnalyzed: questTitle,
        photoPresent: hasPhoto,
        noteLength,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
