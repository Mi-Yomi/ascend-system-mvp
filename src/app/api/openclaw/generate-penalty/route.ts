import { NextResponse } from 'next/server'

/**
 * POST /api/openclaw/generate-penalty
 *
 * Openclaw AI generates a contextual penalty quest based on the failed quest.
 * Penalties are designed to be restorative, not punitive.
 */

const penaltyTemplates = [
  { title: 'Восстановление фокуса: 15 минут без отвлечений', description: 'Закрой все вкладки, убери телефон. 15 минут чистой работы над любой задачей.', rewards: ['+1 Discipline'], xp: 12, juti: 5 },
  { title: 'Записать 3 причины провала', description: 'Честно напиши почему квест провален. Не оправдания, а реальные причины. Это урок.', rewards: ['+1 Mind'], xp: 10, juti: 4 },
  { title: 'Сделать 30 приседаний прямо сейчас', description: 'Физическая активность перезагружает мозг. Встань и сделай 30 приседаний. Без отговорок.', rewards: ['+1 Body'], xp: 8, juti: 3 },
  { title: 'Убрать одну вещь в комнате', description: 'Маленькое действие для возвращения контроля. Убери что-то одно — стол, полку, провода.', rewards: ['+1 Discipline'], xp: 8, juti: 3 },
  { title: 'Написать план на завтра', description: 'Возьми бумагу или заметку. Напиши 3 главных дела на завтра. Конкретно, с временем.', rewards: ['+1 Mind', '+1 Discipline'], xp: 15, juti: 6 },
]

export async function POST(req: Request) {
  try {
    const { failedQuestTitle } = await req.json()

    // --- Openclaw AI Logic (Mock) ---
    const template = penaltyTemplates[Math.floor(Math.random() * penaltyTemplates.length)]

    const quest = {
      title: `Штраф: ${template.title}`,
      description: `После провала "${failedQuestTitle}": ${template.description}`,
      type: 'Penalty Quest' as const,
      xp: template.xp,
      penalty: -4,
      rewards: template.rewards,
      jutiReward: template.juti,
    }

    return NextResponse.json({ quest })
  } catch {
    return NextResponse.json({ error: 'Failed to generate penalty' }, { status: 500 })
  }
}
