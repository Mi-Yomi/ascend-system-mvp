import { NextResponse } from 'next/server'

export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY

  return NextResponse.json({
    status: hasKey ? 'online' : 'no_api_key',
    version: '2.0.0',
    name: 'Openclaw',
    engine: 'claude-sonnet-4-20250514',
    mode: 'production',
    capabilities: [
      'quest-generation',
      'penalty-generation',
      'completion-verification',
      'coin-management',
      'rank-assignment',
      'event-creation',
      'promo-creation',
      'manual-quest-injection',
      'heartbeat',
    ],
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
}
