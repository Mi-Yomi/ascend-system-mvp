import { NextResponse } from 'next/server'

/**
 * POST /api/openclaw/assign-rank
 *
 * Openclaw AI evaluates the player's profile and assigns an appropriate rank.
 * Can override the XP-based rank system based on AI analysis of stats balance.
 */

export async function POST(req: Request) {
  try {
    const { profile } = await req.json()
    const { xp, stats } = profile || {}

    // --- Openclaw AI Rank Logic (Mock) ---
    // Analyze overall stats balance
    const statValues = Object.values(stats || {}) as number[]
    const avgStat = statValues.length ? statValues.reduce((a, b) => a + b, 0) / statValues.length : 0
    const minStat = statValues.length ? Math.min(...statValues) : 0

    // XP-based rank
    let xpRank = 'E-Rank'
    if (xp >= 700) xpRank = 'A-Rank'
    else if (xp >= 500) xpRank = 'B-Rank'
    else if (xp >= 300) xpRank = 'C-Rank'
    else if (xp >= 180) xpRank = 'D-Rank'

    // AI can adjust rank based on stats balance
    let newRank = xpRank
    let reason = `Ранг определён по XP: ${xp}`
    let changed = false

    // If stats are very unbalanced, AI might lower rank
    if (minStat < 3 && avgStat > 8) {
      const ranks = ['E-Rank', 'D-Rank', 'C-Rank', 'B-Rank', 'A-Rank']
      const idx = ranks.indexOf(xpRank)
      if (idx > 0) {
        newRank = ranks[idx - 1]
        reason = `Openclaw понизил ранг: слабый параметр (${minStat}). Развивай все характеристики равномерно.`
        changed = true
      }
    }

    // If all stats are high, AI might boost rank
    if (minStat >= 10 && avgStat >= 12) {
      const ranks = ['E-Rank', 'D-Rank', 'C-Rank', 'B-Rank', 'A-Rank']
      const idx = ranks.indexOf(xpRank)
      if (idx < 4) {
        newRank = ranks[idx + 1]
        reason = `Openclaw повысил ранг! Сбалансированное развитие всех характеристик.`
        changed = true
      }
    }

    return NextResponse.json({ newRank, reason, changed })
  } catch {
    return NextResponse.json({ error: 'Rank assignment failed' }, { status: 500 })
  }
}
