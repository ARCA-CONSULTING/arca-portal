import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/cabinet/Sidebar'
import Link from 'next/link'
export default async function ClientsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: clients } = await supabase.from('clients').select('*, envois(statut)').order('nom')
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Clients ({clients?.length || 0})</h1>
          <Link href="/dashboard/formulaires/nouveau" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Envoyer un formulaire</Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {clients?.map(client => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">{client.nom[0]?.toUpperCase()}</div>
              <div className="flex-1"><p className="font-medium text-gray-900">{client.nom}</p><p className="text-sm text-gray-500">{client.email}</p></div>
              <div className="text-right"><p className="text-xs text-gray-400">{client.envois?.length || 0} dossier(s)</p></div>
              <span className="text-gray-300">→</span>
            </Link>
          ))}
          {!clients?.length && <p className="p-8 text-center text-gray-400">Aucun client pour l'instant</p>}
        </div>
      </main>
    </div>
  )
}