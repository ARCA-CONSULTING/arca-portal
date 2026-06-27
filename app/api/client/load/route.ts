import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
  const supabase = createServiceSupabaseClient()
  const { data: envoi } = await supabase.from('envois').select('*, formulaires(*), clients(*)').eq('token', token).single()
  if (!envoi) return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
  const { data: fichiers } = await supabase.from('fichiers').select('*').eq('envoi_id', envoi.id).order('created_at')
  const { data: messages } = await supabase.from('messages').select('*').eq('envoi_id', envoi.id).order('created_at')
  const { data: demandes } = await supabase.from('demandes_pieces').select('*').eq('envoi_id', envoi.id)
  const fichiersGrouped: Record<string, any[]> = {}
  for (const f of fichiers || []) { if (!fichiersGrouped[f.question_id]) fichiersGrouped[f.question_id] = []; fichiersGrouped[f.question_id].push(f) }
  return NextResponse.json({ envoi, formulaire: envoi.formulaires, client: envoi.clients, fichiers: fichiersGrouped, messages: messages || [], demandes: demandes || [] })
}