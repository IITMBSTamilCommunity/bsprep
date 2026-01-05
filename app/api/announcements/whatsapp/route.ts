import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST: WhatsApp webhook endpoint (for Twilio, Meta Cloud API, or custom bot)
// Expects: { message, sender, whatsapp_msg_id }
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { message, sender, whatsapp_msg_id } = body
    if (!message || !whatsapp_msg_id) return NextResponse.json({ error: 'Missing message or whatsapp_msg_id' }, { status: 400 })
    // Prevent duplicate import
    const { data: existing } = await supabase.from('announcements').select('id').eq('whatsapp_msg_id', whatsapp_msg_id).single()
    if (existing) return NextResponse.json({ success: true, duplicate: true })
    // Insert as WhatsApp announcement
    const { data, error } = await supabase.from('announcements').insert([
      { title: sender ? `WhatsApp: ${sender}` : 'WhatsApp Announcement', body: message, source: 'whatsapp', whatsapp_msg_id }
    ]).select()
    if (error) return NextResponse.json({ error: 'Failed to import WhatsApp message' }, { status: 500 })
    return NextResponse.json({ success: true, announcement: data?.[0] })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
