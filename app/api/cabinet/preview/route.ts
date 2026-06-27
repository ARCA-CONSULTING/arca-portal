import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const serviceSupabase = createServiceSupabaseClient()
  const { data: fichier } = await serviceSupabase.from('fichiers').select('*').eq('id', id!).single()
  if (!fichier) return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
  const { data } = await serviceSupabase.storage.from('documents').createSignedUrl(fichier.nom_stockage, 300)
  return NextResponse.json({ url: data?.signedUrl })
}