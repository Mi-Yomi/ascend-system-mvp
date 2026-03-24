import Link from 'next/link'

const endpoints = [
  {
    method: 'POST',
    path: '/api/openclaw/generate-quest',
    title: 'Генерация квеста',
    description: 'Openclaw AI анализирует профиль игрока и генерирует персонализированный квест, ориентируясь на слабые характеристики.',
    body: `{
  "profile": {
    "xp": 120,
    "level": 3,
    "stats": {
      "discipline": 11,
      "mind": 14,
      "body": 7,
      "creativity": 13,
      "career": 9,
      "social": 6
    }
  }
}`,
    response: `{
  "quest": {
    "title": "Провести полноценную тренировку",
    "description": "Выполни полную тренировку...",
    "type": "Boss Quest",
    "xp": 105,
    "penalty": -20,
    "rewards": ["+2 Body", "+1 Discipline"],
    "jutiReward": 45
  }
}`,
    types: 'Boss Quest | Main Quest | Daily Quest | Side Quest | Hidden Quest',
  },
  {
    method: 'POST',
    path: '/api/openclaw/generate-penalty',
    title: 'Генерация штрафного квеста',
    description: 'При провале квеста AI создаёт восстановительный штрафной квест. Штрафы — не наказание, а путь к восстановлению.',
    body: `{
  "failedQuestTitle": "Провести полноценную тренировку"
}`,
    response: `{
  "quest": {
    "title": "Штраф: Записать 3 причины провала",
    "description": "После провала \\"...\\"...",
    "type": "Penalty Quest",
    "xp": 10,
    "penalty": -4,
    "rewards": ["+1 Mind"],
    "jutiReward": 4
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/openclaw/verify-completion',
    title: 'Верификация выполнения',
    description: 'AI анализирует фото и описание для подтверждения выполнения квеста. Возвращает уровень уверенности и бонусные JUTI за детальные отчёты.',
    body: `{
  "questTitle": "Утренняя рутина без телефона",
  "questDescription": "Первые 30 минут...",
  "photo": "data:image/jpeg;base64,...",
  "note": "Проснулся в 7, сделал зарядку и позавтракал"
}`,
    response: `{
  "verified": true,
  "confidence": 0.92,
  "feedback": "Отлично! Openclaw подтверждает выполнение.",
  "bonusJuti": 5,
  "_aiMeta": {
    "questAnalyzed": "Утренняя рутина без телефона",
    "photoPresent": true,
    "noteLength": 42
  }
}`,
    notes: 'confidence: 0-1. bonusJuti зависит от детальности описания. Фото обязательно для верификации.',
  },
  {
    method: 'POST',
    path: '/api/openclaw/manage-coins',
    title: 'Управление JUTI монетами',
    description: 'AI управляет балансом JUTI монет: начисление бонусов и списание штрафов с проверкой баланса.',
    body: `{
  "action": "add",
  "amount": 50,
  "reason": "Бонус за streak",
  "currentBalance": 150
}`,
    response: `{
  "success": true,
  "amount": 50,
  "action": "add",
  "reason": "Бонус за streak",
  "newBalance": 200,
  "previousBalance": 150
}`,
    notes: 'action: "add" | "subtract". При subtract проверяется достаточность баланса.',
  },
  {
    method: 'POST',
    path: '/api/openclaw/assign-rank',
    title: 'Назначение ранга',
    description: 'AI оценивает баланс характеристик и может переопределить XP-ранг. Несбалансированное развитие ведёт к понижению, равномерное — к повышению.',
    body: `{
  "profile": {
    "xp": 350,
    "stats": {
      "discipline": 11,
      "mind": 14,
      "body": 2,
      "creativity": 13,
      "career": 9,
      "social": 6
    }
  }
}`,
    response: `{
  "newRank": "D-Rank",
  "reason": "Openclaw понизил ранг: слабый параметр (2)...",
  "changed": true
}`,
    notes: 'Ранги: E-Rank → D-Rank → C-Rank → B-Rank → A-Rank. AI понижает при min < 3 и avg > 8. Повышает при min >= 10 и avg >= 12.',
  },
  {
    method: 'POST',
    path: '/api/openclaw/create-event',
    title: 'Создание события',
    description: 'AI создаёт ограниченное по времени событие с наградами. Отображается как модальная карточка.',
    body: '{}',
    response: `{
  "event": {
    "id": "event_1711234567890",
    "title": "Неделя Дисциплины",
    "description": "Выполняй все квесты 7 дней подряд...",
    "image": "/events/discipline-week.jpg",
    "rewards": ["+50 JUTI", "+3 Discipline", "Exclusive Badge"],
    "duration": "7 дней",
    "color": "#FF6B35",
    "startsAt": "2024-03-24T12:00:00.000Z",
    "expiresAt": "2024-03-31T12:00:00.000Z",
    "active": true
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/openclaw/create-promo',
    title: 'Создание промо-акции',
    description: 'AI создаёт промо-акцию с бонусами для JUTI магазина: множители, бонусы, кэшбэк, щиты от штрафов.',
    body: '{}',
    response: `{
  "promo": {
    "id": "promo_1711234567890",
    "title": "Двойные JUTI",
    "description": "Все квесты дают x2 JUTI...",
    "code": "DOUBLE24",
    "type": "multiplier",
    "value": 2,
    "minLevel": 1,
    "active": true,
    "createdAt": "2024-03-24T12:00:00.000Z",
    "expiresAt": "2024-03-25T12:00:00.000Z"
  }
}`,
    notes: 'type: "multiplier" | "bonus" | "cashback" | "shield". minLevel — минимальный уровень для активации.',
  },
  {
    method: 'GET',
    path: '/api/openclaw/status',
    title: 'Статус системы',
    description: 'Проверка состояния Openclaw AI. Используется для health check и отображения статуса в UI.',
    body: null,
    response: `{
  "status": "online",
  "version": "1.0.0",
  "name": "Openclaw",
  "capabilities": [
    "quest-generation",
    "penalty-generation",
    "completion-verification",
    "coin-management",
    "rank-assignment",
    "event-creation",
    "promo-creation"
  ],
  "model": "openclaw-v1-mock",
  "uptime": 12345.678,
  "timestamp": "2024-03-24T12:00:00.000Z"
}`,
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-orange-500 font-medium mb-4 inline-block">&larr; Назад в приложение</Link>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Openclaw API</h1>
          <p className="text-stone-500 text-[15px] leading-relaxed">
            Документация по API системы Openclaw AI — движка Ascend System.
            Все эндпоинты доступны по базовому пути <code className="px-1.5 py-0.5 bg-stone-100 rounded text-[13px] font-mono">/api/openclaw/</code>
          </p>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-2xl p-5 mb-6">
          <h2 className="text-lg font-bold text-stone-900 mb-3">Обзор</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-stone-50 rounded-xl p-3">
              <div className="text-stone-400 text-xs mb-1">Версия</div>
              <div className="font-semibold text-stone-900">1.0.0</div>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <div className="text-stone-400 text-xs mb-1">Эндпоинтов</div>
              <div className="font-semibold text-stone-900">{endpoints.length}</div>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <div className="text-stone-400 text-xs mb-1">Формат</div>
              <div className="font-semibold text-stone-900">JSON</div>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <div className="text-stone-400 text-xs mb-1">Режим</div>
              <div className="font-semibold text-stone-900">Mock AI</div>
            </div>
          </div>
        </div>

        {/* Currency info */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-100">
          <h3 className="font-bold text-stone-900 mb-2">JUTI Coin</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Внутренняя валюта Ascend System. <strong>1 JUTI = 1 ₸ (тенге)</strong>.
            Зарабатывается за выполнение квестов, бонусы от AI, промо-акции.
            Можно переводить в тенге через экран переводов.
          </p>
        </div>

        {/* Endpoints */}
        <h2 className="text-xl font-bold text-stone-900 mb-4">Эндпоинты</h2>
        <div className="space-y-4">
          {endpoints.map((ep, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden">
              {/* Endpoint header */}
              <div className="px-5 py-4 border-b border-stone-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${ep.method === 'GET' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {ep.method}
                  </span>
                  <code className="text-[13px] font-mono text-stone-700">{ep.path}</code>
                </div>
                <h3 className="text-[16px] font-bold text-stone-900 mt-2">{ep.title}</h3>
                <p className="text-[13px] text-stone-500 mt-1 leading-relaxed">{ep.description}</p>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Request body */}
                {ep.body && (
                  <div>
                    <div className="text-[12px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Request Body</div>
                    <pre className="bg-stone-50 rounded-xl p-3 text-[12px] font-mono text-stone-700 overflow-x-auto leading-relaxed">{ep.body}</pre>
                  </div>
                )}

                {/* Response */}
                <div>
                  <div className="text-[12px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Response</div>
                  <pre className="bg-stone-50 rounded-xl p-3 text-[12px] font-mono text-stone-700 overflow-x-auto leading-relaxed">{ep.response}</pre>
                </div>

                {/* Notes */}
                {('notes' in ep && ep.notes) && (
                  <div className="bg-amber-50 rounded-xl p-3">
                    <div className="text-[12px] font-semibold text-amber-700 mb-1">Примечание</div>
                    <p className="text-[12px] text-amber-800 leading-relaxed">{ep.notes}</p>
                  </div>
                )}

                {/* Quest types */}
                {('types' in ep && ep.types) && (
                  <div className="flex flex-wrap gap-1.5">
                    {ep.types.split(' | ').map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-stone-100 rounded text-[11px] font-medium text-stone-600">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Error handling */}
        <div className="bg-white rounded-2xl p-5 mt-6">
          <h2 className="text-lg font-bold text-stone-900 mb-3">Обработка ошибок</h2>
          <p className="text-[13px] text-stone-500 mb-3">Все эндпоинты возвращают JSON с полем error при ошибке:</p>
          <pre className="bg-red-50 rounded-xl p-3 text-[12px] font-mono text-red-700 leading-relaxed">{`// 400 Bad Request
{ "error": "Missing required fields: action, amount, currentBalance" }

// 500 Internal Server Error
{ "error": "Quest generation failed" }`}</pre>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[11px] font-bold">200</span>
              <span className="text-[13px] text-stone-600">Успешный запрос</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[11px] font-bold">400</span>
              <span className="text-[13px] text-stone-600">Неверные параметры запроса</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[11px] font-bold">500</span>
              <span className="text-[13px] text-stone-600">Внутренняя ошибка сервера</span>
            </div>
          </div>
        </div>

        {/* Integration guide */}
        <div className="bg-white rounded-2xl p-5 mt-4 mb-8">
          <h2 className="text-lg font-bold text-stone-900 mb-3">Интеграция</h2>
          <p className="text-[13px] text-stone-500 mb-3">Клиент для работы с API:</p>
          <pre className="bg-stone-50 rounded-xl p-3 text-[12px] font-mono text-stone-700 overflow-x-auto leading-relaxed">{`import { openclaw } from '@/lib/openclaw'

// Генерация квеста
const { quest } = await openclaw.generateQuest(profile)

// Верификация выполнения
const result = await openclaw.verifyCompletion(
  quest.title, quest.description, photoBase64, note
)

// Управление монетами
const coins = await openclaw.manageCoins('add', 50, 'bonus', 150)

// Создание события
const { event } = await openclaw.createEvent()

// Создание акции
const { promo } = await openclaw.createPromo()`}</pre>
        </div>
      </div>
    </div>
  )
}
