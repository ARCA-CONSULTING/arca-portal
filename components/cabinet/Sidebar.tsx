'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
const nav = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { href: '/dashboard/clients', label: 'Clients', icon: '👥' },
  { href: '/dashboard/formulaires', label: 'Formulaires', icon: '📋' },
  { href: '/dashboard/messagerie', label: 'Messagerie', icon: '💬' },
]
export default function Sidebar() {
  const pathname = usePathname(); const router = useRouter(); const supabase = createClient()
  async function handleLogout() { await supabase.auth.signOut(); router.push('/') }
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-lg">A</div>
          <div><p className="font-semibold text-sm">ARCA CONSULTING</p><p className="text-slate-400 text-xs">Portail cabinet</p></div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${pathname === item.href ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button onClick={handleLogout} className="w-full text-left text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-slate-800 transition">
          🚪 Déconnexion
        </button>
      </div>
    </aside>
  )
}