import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
export async function POST(req: NextRequest) {
  const { envoisId, type, statut, contenu, description } = await req.json()
  const supabase = createServiceSupabaseClient()
  const { data: envoi } = await supabase.from('envois').select('*, clients(*)').eq('id', envoisId).single()
  if (!envoi) return NextResponse.json({ error: 'Envoi introuvable' }, { status: 404 })
  console.log('Notification:', type, 'pour', envoi.clients?.email, statut || contenu || description)
  return NextResponse.json({ success: true })
}