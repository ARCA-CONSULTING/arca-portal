import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
export async function GET(req: NextRequest) {
  const envoi_id = req.nextUrl.searchParams.get('envoi_id')
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Non autorisé', { status: 401 })
  const serviceSupabase = createServiceSupabaseClient()
  const { data: fichiers } = await serviceSupabase.from('fichiers').select('*').eq('envoi_id', envoi_id!)
  if (!fichiers || fichiers.length === 0) return new NextResponse('Aucun fichier', { status: 404 })
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  for (const f of fichiers) {
    const { data } = await serviceSupabase.storage.from('documents').download(f.nom_stockage)
    if (data) zip.file(f.nom_original, data)
  }
  const content = await zip.generateAsync({ type: 'nodebuffer' })
  return new NextResponse(content, { headers: { 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="documents.zip"' } })
}