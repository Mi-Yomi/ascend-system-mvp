import { NextResponse } from 'next/server'

/**
 * POST /api/openclaw/manage-coins
 *
 * Openclaw AI manages the player's JUTI coin balance.
 * Can add or subtract coins with a reason.
 */

export async function POST(req: Request) {
  try {
    const { action, amount, reason, currentBalance } = await req.json()

    if (!action || !amount || typeof currentBalance !== 'number') {
      return NextResponse.json({ error: 'Missing required fields: action, amount, currentBalance' }, { status: 400 })
    }

    if (action !== 'add' && action !== 'subtract') {
      return NextResponse.json({ error: 'Action must be "add" or "subtract"' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })
    }

    let newBalance: number
    if (action === 'add') {
      newBalance = currentBalance + amount
    } else {
      if (amount > currentBalance) {
        return NextResponse.json({ error: 'Insufficient JUTI balance', success: false }, { status: 400 })
      }
      newBalance = currentBalance - amount
    }

    return NextResponse.json({
      success: true,
      amount,
      action,
      reason: reason || (action === 'add' ? 'Openclaw bonus' : 'Openclaw penalty'),
      newBalance,
      previousBalance: currentBalance,
    })
  } catch {
    return NextResponse.json({ error: 'Coin management failed' }, { status: 500 })
  }
}
