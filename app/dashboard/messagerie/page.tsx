import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/cabinet/Sidebar'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
export default async function MessageriePage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: messages } = await supabase.from('messages').select('*, envois(client_id, token, clients(nom))').eq('lu', false).order('created_at', { ascending: false }).limit(50)
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messagerie ({messages?.length || 0} non lus)</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {messages?.map(m => (
            <Link key={m.id} href={`/dashboard/clients/${m.envois?.client_id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">{m.envois?.clients?.nom?.[0]?.toUpperCase()}</div>
              <div className="flex-1"><p className="font-medium text-gray-900">{m.envois?.clients?.nom}</p><p className="text-sm text-gray-500 truncate">{m.contenu}</p></div>
              <p className="text-xs text-gray-400">{formatDate(m.created_at)}</p>
            </Link>
          ))}
          {!messages?.length && <p className="p-8 text-center text-gray-400">Aucun message non lu</p>}
        </div>
      </main>
    </div>
  )
}