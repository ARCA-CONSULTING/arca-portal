import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const token = formData.get('token') as string
  const questionId = formData.get('question_id') as string
  if (!file || !token || !questionId) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  const supabase = createServiceSupabaseClient()
  const { data: envoi } = await supabase.from('envois').select('id, client_id').eq('token', token).single()
  if (!envoi) return NextResponse.json({ error: 'Token invalide' }, { status: 403 })
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'Fichier trop volumineux (max 50 Mo)' }, { status: 400 })
  const timestamp = Date.now()
  const nomStockage = envoi.client_id + '/' + envoi.id + '/' + questionId + '/' + timestamp + '_' + file.name
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage.from('documents').upload(nomStockage, Buffer.from(arrayBuffer), { contentType: file.type })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })
  const { data: fichier } = await supabase.from('fichiers').insert({ envoi_id: envoi.id, question_id: questionId, nom_original: file.name, nom_stockage: nomStockage, taille: file.size, type_mime: file.type, depose_par: 'client' }).select().single()
  await supabase.from('envois').update({ statut: 'Pieces recues' }).eq('id', envoi.id)
  return NextResponse.json({ fichier })
}