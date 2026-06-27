'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/cabinet/Sidebar'
import { formatDate, formatTaille, statutColor } from '@/lib/utils'

const STATUTS = ['En attente', 'Pieces recues', 'Dossier complet', 'Valide']

export default function ClientDossierPage({ params }: { params: { clientId: string } }) {
  const supabase = createClient()
  const [client, setClient] = useState<any>(null)
  const [envois, setEnvois] = useState<any[]>([])
  const [envoisel, setEnvoisel] = useState<string | null>(null)
  const [fichiers, setFichiers] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [demande, setDemande] = useState('')
  const [tab, setTab] = useState<'documents'|'messages'|'demandes'>('documents')

  useEffect(() => { loadClient() }, [params.clientId])

  async function loadClient() {
    const { data: c } = await supabase.from('clients').select('*').eq('id', params.clientId).single()
    setClient(c)
    const { data: e } = await supabase.from('envois').select('*, formulaires(titre)').eq('client_id', params.clientId).order('created_at', { ascending: false })
    setEnvois(e || [])
    if (e && e.length > 0) selectEnvoi(e[0].id)
  }

  async function selectEnvoi(id: string) {
    setEnvoisel(id)
    const { data: f } = await supabase.from('fichiers').select('*').eq('envoi_id', id).order('created_at')
    setFichiers(f || [])
    const { data: m } = await supabase.from('messages').select('*').eq('envoi_id', id).order('created_at')
    setMessages(m || [])
  }

  async function changeStatut(id: string, statut: string) {
    await supabase.from('envois').update({ statut }).eq('id', id)
    setEnvois(prev => prev.map(e => e.id === id ? { ...e, statut } : e))
    await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ envoisId: id, type: 'statut', statut }) })
  }

  async function sendMessage() {
    if (!newMessage.trim() || !envoisel) return
    await supabase.from('messages').insert({ envoi_id: envoisel, auteur: 'cabinet', contenu: newMessage })
    await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ envoisId: envoisel, type: 'message', contenu: newMessage }) })
    setMessages(prev => [...prev, { auteur: 'cabinet', contenu: newMessage, created_at: new Date().toISOString() }])
    setNewMessage('')
  }

  async function sendDemande() {
    if (!demande.trim() || !envoisel) return
    await supabase.from('demandes_pieces').insert({ envoi_id: envoisel, description: demande })
    await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ envoisId: envoisel, type: 'demande_piece', description: demande }) })
    setDemande('')
    alert('Demande envoyée au client !')
  }

  async function downloadZip() {
    const res = await fetch('/api/download-zip?envoi_id=' + envoisel)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = (client?.nom || 'documents') + '.zip'; a.click()
  }

  async function downloadFichier(fichier: any) {
    const res = await fetch('/api/cabinet/preview?id=' + fichier.id)
    const { url } = await res.json()
    if (url) window.open(url, '_blank')
  }

  const selected = envois.find(e => e.id === envoisel)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        {client && (
          <div className="mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-lg">{client.nom[0]}</div>
            <div><h1 className="text-2xl font-bold text-gray-900">{client.nom}</h1><p className="text-gray-500">{client.email}</p></div>
          </div>
        )}
        <div className="flex gap-6">
          <div className="w-64 shrink-0 space-y-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Dossiers</h2>
            {envois.map(e => (
              <button key={e.id} onClick={() => selectEnvoi(e.id)}
                className={`w-full text-left p-3 rounded-xl border transition ${envoisel === e.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                <p className="font-medium text-sm text-gray-900 truncate">{e.formulaires?.titre}</p>
                <p className="text-xs text-gray-400 mt-0.5">{e.annee} — {e.mission}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${statutColor(e.statut)}`}>{e.statut}</span>
              </button>
            ))}
          </div>
          {selected && (
            <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <div><h3 className="font-semibold text-gray-900">{selected.formulaires?.titre}</h3><p className="text-sm text-gray-500">{selected.annee} — {selected.mission}</p></div>
                <div className="flex items-center gap-3">
                  <select value={selected.statut} onChange={e => changeStatut(selected.id, e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {STATUTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={downloadZip} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition font-medium">⬇️ ZIP</button>
                </div>
              </div>
              <div className="flex border-b border-gray-100">
                {(['documents','messages','demandes'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-5 py-3 text-sm font-medium transition border-b-2 ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    {t === 'documents' ? '📄 Documents' : t === 'messages' ? '💬 Messages' : '📎 Pièces compl.'}
                  </button>
                ))}
              </div>
              <div className="p-5">
                {tab === 'documents' && (
                  <div className="space-y-2">
                    {fichiers.length === 0 && <p className="text-gray-400 text-center py-8">Aucun fichier déposé</p>}
                    {fichiers.map(f => (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                        <span className="text-2xl">{f.type_mime?.includes('pdf') ? '📄' : f.type_mime?.includes('image') ? '🖼️' : '📁'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{f.nom_original}</p>
                          <p className="text-xs text-gray-400">{formatTaille(f.taille || 0)} · v{f.version} · {formatDate(f.created_at)}</p>
                          {f.commentaire && <p className="text-xs text-blue-600 italic">"{f.commentaire}"</p>}
                        </div>
                        <button onClick={() => downloadFichier(f)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Télécharger</button>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'messages' && (
                  <div>
                    <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.auteur === 'cabinet' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${m.auteur === 'cabinet' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                            <p>{m.contenu}</p><p className={`text-xs mt-1 ${m.auteur === 'cabinet' ? 'text-blue-200' : 'text-gray-400'}`}>{formatDate(m.created_at)}</p>
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 && <p className="text-gray-400 text-center py-4">Aucun message</p>}
                    </div>
                    <div className="flex gap-2">
                      <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Écrire un message..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Envoyer</button>
                    </div>
                  </div>
                )}
                {tab === 'demandes' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Le client recevra un email l'invitant à déposer une pièce complémentaire.</p>
                    <textarea value={demande} onChange={e => setDemande(e.target.value)} rows={3}
                      placeholder="Ex: Merci de nous transmettre votre relevé bancaire de mars 2026..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3" />
                    <button onClick={sendDemande} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 font-medium">📎 Envoyer la demande au client</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}