import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return client
}

export const OPENCLAW_SYSTEM_PROMPT = `Ты — Openclaw, AI-движок системы Ascend System — геймифицированной системы саморазвития.
Твоя роль — генерировать квесты, проверять выполнение, управлять рангами и создавать события для игрока.
Игрок — Ануар, казахстанец, студент, стремится к саморазвитию через систему квестов.

Правила:
- Отвечай ТОЛЬКО валидным JSON (без markdown, без пояснений, без обёрток в \`\`\`)
- Квесты должны быть реалистичными и выполнимыми за 1 день
- Штрафы — восстановительные, не карательные
- JUTI — внутренняя валюта, 1 JUTI = 1 тенге
- Характеристики: discipline, mind, body, creativity, career, social
- Типы квестов: Boss Quest, Main Quest, Daily Quest, Side Quest, Hidden Quest, Penalty Quest
- Ранги: E-Rank → D-Rank → C-Rank → B-Rank → A-Rank
- Язык: русский`

export async function askOpenclaw(prompt: string): Promise<string> {
  const anthropic = getAnthropicClient()
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: OPENCLAW_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })
  const block = message.content[0]
  if (block.type === 'text') return block.text
  throw new Error('Unexpected response type')
}
