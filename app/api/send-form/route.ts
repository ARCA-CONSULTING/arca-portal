import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
export async function POST(req: NextRequest) {
  const { formulaireId, clientIds, annee, mission, objetEmail, corpsEmail } = await req.json()
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const serviceSupabase = createServiceSupabaseClient()
  const { data: formulaire } = await serviceSupabase.from('formulaires').select('*').eq('id', formulaireId).single()
  if (!formulaire) return NextResponse.json({ error: 'Formulaire introuvable' }, { status: 404 })
  const results = []
  for (const clientId of clientIds) {
    const { data: client } = await serviceSupabase.from('clients').select('*').eq('id', clientId).single()
    if (!client) continue
    const { data: envoi } = await serviceSupabase.from('envois').insert({ formulaire_id: formulaireId, client_id: clientId, annee: annee || new Date().getFullYear(), mission: mission || 'Bilan', objet_email: objetEmail || '[ARCA CONSULTING] ' + formulaire.titre, corps_email: corpsEmail, envoye_le: new Date().toISOString() }).select().single()
    if (envoi) results.push({ clientNom: client.nom, token: envoi.token, lien: process.env.NEXT_PUBLIC_APP_URL + '/client/' + envoi.token })
  }
  return NextResponse.json({ success: true, results })
}