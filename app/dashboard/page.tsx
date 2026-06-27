import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/cabinet/Sidebar'
import { statutColor } from '@/lib/utils'
import Link from 'next/link'
export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: envois } = await supabase.from('envois').select('*, clients(nom, email), formulaires(titre)').order('created_at', { ascending: false }).limit(20)
  const stats = {
    attente: envois?.filter(e => e.statut === 'En attente').length || 0,
    recus: envois?.filter(e => e.statut === 'Pieces recues').length || 0,
    complets: envois?.filter(e => e.statut === 'Dossier complet').length || 0,
    valides: envois?.filter(e => e.statut === 'Valide').length || 0,
  }
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[{label:'En attente',count:stats.attente},{label:'Pièces reçues',count:stats.recus},{label:'Dossier complet',count:stats.complets},{label:'Validé',count:stats.valides}].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-3xl font-bold text-gray-900">{s.count}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Derniers dossiers</h2>
            <Link href="/dashboard/clients" className="text-blue-600 text-sm hover:underline">Voir tout →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {envois?.map(e => (
              <Link key={e.id} href={`/dashboard/clients/${e.client_id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div><p className="font-medium text-gray-900">{e.clients?.nom}</p><p className="text-sm text-gray-500">{e.formulaires?.titre} — {e.annee}</p></div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statutColor(e.statut)}`}>{e.statut}</span>
              </Link>
            ))}
            {!envois?.length && <p className="p-8 text-center text-gray-400">Aucun formulaire envoyé pour l'instant</p>}
          </div>
        </div>
      </main>
    </div>
  )
}