import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
export async function POST(req: NextRequest) {
  const { token, reponses } = await req.json()
  const supabase = createServiceSupabaseClient()
  const { data: envoi } = await supabase.from('envois').select('*, clients(*)').eq('token', token).single()
  if (!envoi) return NextResponse.json({ error: 'Token invalide' }, { status: 403 })
  if (reponses) {
    for (const [questionId, valeur] of Object.entries(reponses)) {
      if (valeur) await supabase.from('reponses').upsert({ envoi_id: envoi.id, question_id: questionId, valeur: valeur as string })
    }
  }
  await supabase.from('envois').update({ statut: 'Pieces recues' }).eq('id', envoi.id)
  return NextResponse.json({ success: true })
}