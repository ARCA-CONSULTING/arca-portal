'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/cabinet/Sidebar'
import { useRouter } from 'next/navigation'

export default function EnvoyerPage({ params }: { params: { formId: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [formulaire, setFormulaire] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [newClient, setNewClient] = useState({ nom: '', email: '' })
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [annee, setAnnee] = useState(new Date().getFullYear())
  const [mission, setMission] = useState('Bilan')
  const [objet, setObjet] = useState('')
  const [corps, setCorps] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    const { data: f } = await supabase.from('formulaires').select('*').eq('id', params.formId).single()
    setFormulaire(f)
    if (f) setObjet('[ARCA CONSULTING] ' + f.titre)
    const { data: c } = await supabase.from('clients').select('*').order('nom')
    setClients(c || [])
  }

  async function addClient() {
    if (!newClient.nom || !newClient.email) return
    const { data } = await supabase.from('clients').insert(newClient).select().single()
    if (data) { setClients(prev => [...prev, data]); setSelectedClientIds(prev => [...prev, data.id]); setNewClient({ nom: '', email: '' }) }
  }

  function toggleClient(id: string) {
    setSelectedClientIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function send() {
    if (selectedClientIds.length === 0) return alert('Sélectionnez au moins un client')
    setSending(true)
    await fetch('/api/send-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formulaireId: params.formId, clientIds: selectedClientIds, annee, mission, objetEmail: objet, corpsEmail: corps })
    })
    setSent(true)
    setSending(false)
  }

  if (sent) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-10 shadow max-w-md">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Formulaire envoyé !</h2>
          <p className="text-gray-500 mb-6">Un email a été envoyé à {selectedClientIds.length} client(s) avec leur lien sécurisé.</p>
          <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Retour au tableau de bord</button>
        </div>
      </main>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Envoyer : {formulaire?.titre}</h1>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">1. Paramètres</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                <input type="number" value={annee} onChange={e => setAnnee(Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
                <select value={mission} onChange={e => setMission(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option>Bilan</option><option>Liasse fiscale</option><option>Comptabilité</option><option>Autre</option>
                </select></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">2. Destinataires</h2>
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
              {clients.map(c => (
                <label key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={selectedClientIds.includes(c.id)} onChange={() => toggleClient(c.id)} className="w-4 h-4 text-blue-600" />
                  <div><p className="font-medium text-sm text-gray-900">{c.nom}</p><p className="text-xs text-gray-400">{c.email}</p></div>
                </label>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Ajouter un nouveau client</p>
              <div className="flex gap-2">
                <input value={newClient.nom} onChange={e => setNewClient(p => ({...p, nom: e.target.value}))} placeholder="Nom" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <input value={newClient.email} onChange={e => setNewClient(p => ({...p, email: e.target.value}))} placeholder="Email" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <button onClick={addClient} className="bg-gray-100 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">+ Ajouter</button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">3. Email</h2>
            <input value={objet} onChange={e => setObjet(e.target.value)} placeholder="Objet" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3" />
            <textarea value={corps} onChange={e => setCorps(e.target.value)} rows={4} placeholder="Corps du message (optionnel — un message par défaut sera utilisé)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
          <button onClick={send} disabled={sending || selectedClientIds.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            {sending ? 'Envoi en cours...' : `✉️ Envoyer à ${selectedClientIds.length} client(s)`}
          </button>
        </div>
      </main>
    </div>
  )
}