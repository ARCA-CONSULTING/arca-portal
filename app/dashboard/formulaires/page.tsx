import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/cabinet/Sidebar'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
export default async function FormulairesPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: formulaires } = await supabase.from('formulaires').select('*').order('created_at', { ascending: false })
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Formulaires</h1>
          <Link href="/dashboard/formulaires/nouveau" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Nouveau formulaire</Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {formulaires?.map(f => (
            <div key={f.id} className="flex items-center justify-between p-4">
              <div><p className="font-medium text-gray-900">{f.titre}</p><p className="text-sm text-gray-500">{formatDate(f.created_at)}</p></div>
              <Link href={`/dashboard/formulaires/${f.id}/envoyer`} className="text-blue-600 text-sm hover:underline">Envoyer →</Link>
            </div>
          ))}
          {!formulaires?.length && <p className="p-8 text-center text-gray-400">Aucun formulaire. <Link href="/dashboard/formulaires/nouveau" className="text-blue-600">Créer le premier</Link></p>}
        </div>
      </main>
    </div>
  )
}