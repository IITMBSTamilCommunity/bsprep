import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // enforce allowed payer roles
    const { data: profile } = await supabase
      .from('user_profiles_extended')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'user'
    if (!['student', 'mentor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { amount, currency = 'INR', provider = 'razorpay', metadata = {} } = body
    if (!amount) return NextResponse.json({ error: 'Missing amount' }, { status: 400 })

    const normalizedAmount = Math.round(Number(amount))
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    let providerOrderId: string | null = null
    if (provider === 'razorpay' && keyId && keySecret) {
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
      const order = await razorpay.orders.create({ amount: normalizedAmount, currency, payment_capture: 1 })
      providerOrderId = order.id
    }

    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          user_id: user.id,
          amount: normalizedAmount,
          currency,
          provider,
          provider_order_id: providerOrderId ?? `demo_${cryptoRandomId()}`,
          status: 'pending',
          metadata,
        },
      ])
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

    return NextResponse.json({
      order: {
        id: data.id,
        provider_order_id: data.provider_order_id,
        amount: data.amount,
        currency: data.currency,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function cryptoRandomId() {
  // tiny, non-guessable id for demo provider_order_id
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}
