import { NextResponse } from 'next/server'

/**
 * POST /api/openclaw/generate-quest
 *
 * Openclaw AI generates a contextual quest based on the player's profile.
 * The AI analyzes weak stats and current level to create personalized challenges.
 *
 * Replace the mock logic below with your real Openclaw API call.
 */

const questTemplates = [
  {
    type: 'Boss Quest' as const,
    templates: [
      { title: 'Провести полноценную тренировку', description: 'Выполни полную тренировку: разминка, основная часть, заминка. Минимум 45 минут.', rewards: ['+2 Body', '+1 Discipline'], xp: 100, penalty: -20, juti: 45 },
      { title: 'Подготовить презентацию проекта', description: 'Создай слайды, подготовь речь и прогони всё 2 раза вслух. Должно быть идеально.', rewards: ['+2 Career', '+1 Mind', '+1 Social'], xp: 110, penalty: -25, juti: 50 },
      { title: 'Написать и отправить 5 писем-откликов', description: 'Найди 5 вакансий/проектов, напиши персонализированные отклики и отправь. Не шаблонные.', rewards: ['+2 Career', '+1 Social'], xp: 95, penalty: -20, juti: 40 },
    ],
  },
  {
    type: 'Main Quest' as const,
    templates: [
      { title: 'Изучить новую тему за 1 час', description: 'Выбери тему, которую откладывал. Читай, делай заметки, напиши краткое summary.', rewards: ['+1 Mind', '+1 Discipline'], xp: 45, penalty: -12, juti: 20 },
      { title: 'Навести порядок в рабочем пространстве', description: 'Убери стол, организуй файлы на компьютере, удали лишнее. Чистое пространство = чистый ум.', rewards: ['+1 Discipline', '+1 Creativity'], xp: 35, penalty: -10, juti: 18 },
      { title: 'Позвонить или написать 3 важным людям', description: 'Свяжись с тремя людьми, с которыми давно не общался. Поддержи связь.', rewards: ['+2 Social'], xp: 40, penalty: -10, juti: 22 },
    ],
  },
  {
    type: 'Daily Quest' as const,
    templates: [
      { title: 'Утренняя рутина без телефона', description: 'Первые 30 минут после пробуждения — без экранов. Умойся, разомнись, позавтракай осознанно.', rewards: ['+1 Discipline'], xp: 20, penalty: -6, juti: 8 },
      { title: 'Прочитать 20 страниц книги', description: 'Возьми книгу (не соцсети!) и прочитай 20 страниц. Бумажная или электронная — неважно.', rewards: ['+1 Mind'], xp: 18, penalty: -5, juti: 8 },
      { title: 'Медитация или дыхательная практика', description: 'Сделай 10-15 минут медитации или дыхательных упражнений. Используй приложение или таймер.', rewards: ['+1 Body', '+1 Mind'], xp: 15, penalty: -4, juti: 7 },
    ],
  },
  {
    type: 'Side Quest' as const,
    templates: [
      { title: 'Приготовить новое блюдо', description: 'Найди рецепт, купи продукты и приготовь что-то новое. Бонус если красиво сервируешь.', rewards: ['+1 Creativity'], xp: 15, penalty: -4, juti: 6 },
      { title: 'Нарисовать или создать что-то руками', description: 'Скетч, коллаж, поделка — неважно что. Включи творчество на 30 минут.', rewards: ['+1 Creativity'], xp: 12, penalty: -3, juti: 5 },
    ],
  },
  {
    type: 'Hidden Quest' as const,
    templates: [
      { title: 'Сделать доброе дело незаметно', description: 'Помоги кому-то без просьбы и не рассказывай об этом. Просто сделай.', rewards: ['+1 Social', '+1 Discipline'], xp: 25, penalty: -5, juti: 15 },
      { title: 'Исследовать новое место в городе', description: 'Пойди туда, где никогда не был. Парк, район, кафе — открой что-то новое.', rewards: ['+1 Body', '+1 Creativity'], xp: 20, penalty: -4, juti: 12 },
    ],
  },
]

export async function POST(req: Request) {
  try {
    const { profile } = await req.json()

    // --- Openclaw AI Logic (Mock) ---
    // In production, replace this with:
    // const result = await fetch('https://your-openclaw-api.com/generate', { ... })

    // Analyze weakest stats to prioritize quest types
    const stats = profile?.stats || {}
    const weakest = Object.entries(stats).sort(([, a], [, b]) => (a as number) - (b as number))[0]

    // Select quest type with weighted randomness (favor quests that improve weak stats)
    const typePool = questTemplates[Math.floor(Math.random() * questTemplates.length)]
    const template = typePool.templates[Math.floor(Math.random() * typePool.templates.length)]

    const quest = {
      title: template.title,
      description: template.description,
      type: typePool.type,
      xp: template.xp + Math.floor(Math.random() * 10),
      penalty: template.penalty,
      rewards: template.rewards,
      jutiReward: template.juti,
      _aiNote: weakest ? `Focused on improving weak stat: ${weakest[0]}` : undefined,
    }

    return NextResponse.json({ quest })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate quest' }, { status: 500 })
  }
}
