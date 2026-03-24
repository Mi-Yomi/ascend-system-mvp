import { NextResponse } from 'next/server'

/**
 * GET /api/openclaw/status
 *
 * Returns the current status of the Openclaw AI system.
 * Used for health checks and displaying AI status in the UI.
 */

export async function GET() {
  return NextResponse.json({
    status: 'online',
    version: '1.0.0',
    name: 'Openclaw',
    capabilities: [
      'quest-generation',
      'penalty-generation',
      'completion-verification',
      'coin-management',
      'rank-assignment',
      'event-creation',
      'promo-creation',
    ],
    model: 'openclaw-v1-mock',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
}
