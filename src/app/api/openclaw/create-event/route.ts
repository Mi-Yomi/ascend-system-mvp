import { NextResponse } from 'next/server'

/**
 * POST /api/openclaw/create-event
 *
 * Openclaw AI creates a limited-time event card with image, description,
 * and special rewards. Events appear as modal cards in the UI.
 */

const eventTemplates = [
  {
    title: 'Неделя Дисциплины',
    description: 'Выполняй все квесты 7 дней подряд. Без пропусков, без оправданий. Только результат.',
    image: '/events/discipline-week.jpg',
    rewards: ['+50 JUTI', '+3 Discipline', 'Exclusive Badge'],
    duration: '7 дней',
    color: '#FF6B35',
  },
  {
    title: 'Турнир Разума',
    description: 'Прочитай 100 страниц, реши 10 задач, изучи 3 новые темы. Прокачай свой интеллект.',
    image: '/events/mind-tournament.jpg',
    rewards: ['+80 JUTI', '+5 Mind', 'Rare Title'],
    duration: '5 дней',
    color: '#7C3AED',
  },
  {
    title: 'Социальный Вызов',
    description: 'Познакомься с 3 новыми людьми, помоги 5 незнакомцам, организуй встречу с друзьями.',
    image: '/events/social-challenge.jpg',
    rewards: ['+60 JUTI', '+4 Social', '+2 Creativity'],
    duration: '3 дня',
    color: '#0EA5E9',
  },
  {
    title: 'Марафон Тела',
    description: 'Каждый день — тренировка. Бег, отжимания, растяжка. Преврати тело в оружие.',
    image: '/events/body-marathon.jpg',
    rewards: ['+70 JUTI', '+5 Body', '+2 Discipline'],
    duration: '5 дней',
    color: '#10B981',
  },
  {
    title: 'Креативный Спринт',
    description: 'Создай что-то каждый день: рисунок, текст, музыку, код. Раскрой творческий потенциал.',
    image: '/events/creative-sprint.jpg',
    rewards: ['+55 JUTI', '+4 Creativity', '+1 Mind'],
    duration: '4 дня',
    color: '#F59E0B',
  },
]

export async function POST() {
  try {
    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)]

    const event = {
      id: `event_${Date.now()}`,
      title: template.title,
      description: template.description,
      image: template.image,
      rewards: template.rewards,
      duration: template.duration,
      color: template.color,
      startsAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + parseDuration(template.duration)).toISOString(),
      active: true,
    }

    return NextResponse.json({ event })
  } catch {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

function parseDuration(dur: string): number {
  const days = parseInt(dur) || 3
  return days * 24 * 60 * 60 * 1000
}
