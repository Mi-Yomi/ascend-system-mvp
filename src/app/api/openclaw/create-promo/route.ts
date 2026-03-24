import { NextResponse } from 'next/server'

/**
 * POST /api/openclaw/create-promo
 *
 * Openclaw AI creates promotional offers for the JUTI store.
 * Promos can give bonus coins, discounts, or special quest rewards.
 */

const promoTemplates = [
  {
    title: 'Двойные JUTI',
    description: 'Все квесты дают x2 JUTI коинов в течение 24 часов!',
    code: 'DOUBLE24',
    type: 'multiplier' as const,
    value: 2,
    minLevel: 1,
    expiresIn: 24 * 60 * 60 * 1000,
  },
  {
    title: 'Бонус новичка',
    description: 'Получи 50 бесплатных JUTI за активность. Продолжай в том же духе!',
    code: 'BONUS50',
    type: 'bonus' as const,
    value: 50,
    minLevel: 1,
    expiresIn: 48 * 60 * 60 * 1000,
  },
  {
    title: 'Кэшбэк за Boss Quest',
    description: 'Выполни Boss Quest и получи +30% JUTI сверху награды.',
    code: 'BOSS30',
    type: 'cashback' as const,
    value: 30,
    minLevel: 3,
    expiresIn: 72 * 60 * 60 * 1000,
  },
  {
    title: 'Штраф отменён',
    description: 'Следующий провал квеста не снимет JUTI. Один раз.',
    code: 'NOFAIL1',
    type: 'shield' as const,
    value: 1,
    minLevel: 2,
    expiresIn: 24 * 60 * 60 * 1000,
  },
  {
    title: 'Streak Reward',
    description: 'Твой streak заслуживает награды. Получи бонус JUTI за серию.',
    code: 'STREAK',
    type: 'bonus' as const,
    value: 25,
    minLevel: 2,
    expiresIn: 12 * 60 * 60 * 1000,
  },
]

export async function POST() {
  try {
    const template = promoTemplates[Math.floor(Math.random() * promoTemplates.length)]

    const promo = {
      id: `promo_${Date.now()}`,
      title: template.title,
      description: template.description,
      code: template.code,
      type: template.type,
      value: template.value,
      minLevel: template.minLevel,
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + template.expiresIn).toISOString(),
    }

    return NextResponse.json({ promo })
  } catch {
    return NextResponse.json({ error: 'Failed to create promo' }, { status: 500 })
  }
}
