import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
export async function POST(req: NextRequest) {
  const { token, contenu } = await req.json()
  const supabase = createServiceSupabaseClient()
  const { data: envoi } = await supabase.from('envois').select('id').eq('token', token).single()
  if (!envoi) return NextResponse.json({ error: 'Token invalide' }, { status: 403 })
  await supabase.from('messages').insert({ envoi_id: envoi.id, auteur: 'client', contenu })
  return NextResponse.json({ success: true })
}