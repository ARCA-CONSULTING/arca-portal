import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const token = req.nextUrl.searchParams.get('token')
  const supabase = createServiceSupabaseClient()
  const { data: envoi } = await supabase.from('envois').select('id').eq('token', token!).single()
  if (!envoi) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { data: fichier } = await supabase.from('fichiers').select('*').eq('id', id!).eq('envoi_id', envoi.id).single()
  if (!fichier) return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
  await supabase.storage.from('documents').remove([fichier.nom_stockage])
  await supabase.from('fichiers').delete().eq('id', id!)
  return NextResponse.json({ success: true })
}