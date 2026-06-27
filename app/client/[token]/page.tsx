'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

export default function PortailClientPage({ params }: { params: { token: string } }) {
  const [envoi, setEnvoi] = useState<any>(null)
  const [formulaire, setFormulaire] = useState<any>(null)
  const [client, setClient] = useState<any>(null)
  const [fichiers, setFichiers] = useState<Record<string, any[]>>({})
  const [messages, setMessages] = useState<any[]>([])
  const [demandes, setDemandes] = useState<any[]>([])
  const [reponses, setReponses] = useState<Record<string, string>>({})
  const [newMessage, setNewMessage] = useState('')
  const [tab, setTab] = useState<'formulaire'|'messages'>('formulaire')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  useEffect(() => { loadData() }, [params.token])

  async function loadData() {
    const res = await fetch('/api/client/load?token=' + params.token)
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    setEnvoi(data.envoi); setFormulaire(data.formulaire); setClient(data.client)
    setFichiers(data.fichiers); setMessages(data.messages); setDemandes(data.demandes)
    setLoading(false)
  }

  async function handleUpload(questionId: string, files: FileList) {
    setUploading(p => ({...p, [questionId]: true}))
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append('file', file); fd.append('token', params.token); fd.append('question_id', questionId)
      const res = await fetch('/api/client/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.fichier) setFichiers(p => ({...p, [questionId]: [...(p[questionId]||[]), data.fichier]}))
    }
    setUploading(p => ({...p, [questionId]: false}))
  }

  async function deleteFichier(questionId: string, id: string) {
    await fetch('/api/client/delete-file?id='+id+'&token='+params.token, { method: 'DELETE' })
    setFichiers(p => ({...p, [questionId]: (p[questionId]||[]).filter(f => f.id !== id)}))
  }

  async function previewFichier(id: string) {
    const res = await fetch('/api/client/preview?id='+id+'&token='+params.token)
    const { url } = await res.json()
    if (url) window.open(url, '_blank')
  }

  async function handleSubmit() {
    await fetch('/api/client/submit', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ token: params.token, reponses }) })
    setSubmitted(true)
  }

  async function sendMessage() {
    if (!newMessage.trim()) return
    await fetch('/api/client/message', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ token: params.token, contenu: newMessage }) })
    setMessages(p => [...p, { auteur: 'client', contenu: newMessage, created_at: new Date().toISOString() }])
    setNewMessage('')
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div><p className="text-gray-500">Chargement...</p></div></div>
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center bg-white rounded-2xl p-8 shadow max-w-md"><p className="text-4xl mb-4">🔒</p><h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide ou expiré</h1><p className="text-gray-500">Contactez votre cabinet comptable.</p></div></div>
  if (submitted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center bg-white rounded-2xl p-8 shadow max-w-md"><p className="text-5xl mb-4">✅</p><h1 className="text-xl font-bold text-gray-900 mb-2">Documents envoyés !</h1><p className="text-gray-500 mb-4">Votre cabinet a été notifié.</p><button onClick={() => setSubmitted(false)} className="text-blue-600 text-sm hover:underline">Revenir au formulaire</button></div></div>

  const sections = formulaire?.sections || []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white">A</div>
          <div><p className="font-semibold text-gray-900">ARCA CONSULTING</p><p className="text-xs text-gray-500">Espace sécurisé — {client?.nom}</p></div>
          <div className="ml-auto"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">🔒 Sécurisé</span></div>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h1 className="text-xl font-bold text-gray-900">{formulaire?.titre}</h1>
          {formulaire?.description && <p className="text-gray-600 mt-2 text-sm">{formulaire.description}</p>}
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${envoi?.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{envoi?.statut}</span>
          </div>
        </div>
        {demandes.filter((d: any) => d.statut === 'En attente').length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-orange-800 mb-2">📎 Pièces complémentaires demandées</h3>
            {demandes.filter((d: any) => d.statut === 'En attente').map((d: any) => <p key={d.id} className="text-orange-700 text-sm">• {d.description}</p>)}
          </div>
        )}
        <div className="flex mb-6 bg-white rounded-xl border border-gray-200 p-1">
          {(['formulaire','messages'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'formulaire' ? '📋 Formulaire & Documents' : `💬 Messages (${messages.length})`}
            </button>
          ))}
        </div>
        {tab === 'formulaire' && (
          <div className="space-y-4">
            {sections.map((section: any, si: number) => (
              <div key={si} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100"><h2 className="font-semibold text-gray-800">{section.titre}</h2></div>
                <div className="p-6 space-y-6">
                  {section.questions?.map((q: any) => (
                    <div key={q.id}>
                      <label className="block font-medium text-gray-800 mb-2">{q.titre}{q.obligatoire && <span className="text-red-500 ml-1">*</span>}</label>
                      {q.type === 'pj' && (
                        <div>
                          <label htmlFor={`up-${q.id}`} className={`border-2 border-dashed rounded-xl p-6 text-center block cursor-pointer transition ${uploading[q.id] ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                            <input type="file" id={`up-${q.id}`} multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip" className="hidden"
                              onChange={e => e.target.files && handleUpload(q.id, e.target.files)} disabled={uploading[q.id]} />
                            <p className="text-3xl mb-2">{uploading[q.id] ? '⏳' : '📎'}</p>
                            <p className="text-sm font-medium text-gray-700">{uploading[q.id] ? 'Envoi en cours...' : 'Glissez vos fichiers ou cliquez'}</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, Images, ZIP · Max 50 Mo</p>
                          </label>
                          {(fichiers[q.id]||[]).map(f => (
                            <div key={f.id} className="flex items-center gap-3 p-3 mt-2 bg-gray-50 rounded-xl border border-gray-200">
                              <span className="text-xl">{f.type_mime?.includes('pdf') ? '📄' : f.type_mime?.includes('image') ? '🖼️' : '📁'}</span>
                              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{f.nom_original}</p></div>
                              <button onClick={() => previewFichier(f.id)} className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1">👁️</button>
                              <button onClick={() => deleteFichier(q.id, f.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1">🗑️</button>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === 'texte' && (
                        <textarea value={reponses[q.id]||''} onChange={e => setReponses(p => ({...p, [q.id]: e.target.value}))}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} placeholder="Votre réponse..." />
                      )}
                      {q.type === 'checkbox' && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={reponses[q.id]==='true'} onChange={e => setReponses(p => ({...p, [q.id]: e.target.checked ? 'true' : 'false'}))} className="w-4 h-4" />
                          <span className="text-sm text-gray-600">Oui</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              ✉️ Envoyer mes documents au cabinet
            </button>
            <p className="text-center text-xs text-gray-400">Vos documents sont transmis de manière sécurisée</p>
          </div>
        )}
        {tab === 'messages' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Messagerie avec ARCA CONSULTING</h2></div>
            <div className="p-5 space-y-3 min-h-64 max-h-96 overflow-y-auto">
              {messages.map((m: any, i: number) => (
                <div key={i} className={`flex ${m.auteur==='client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${m.auteur==='client' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    <p>{m.contenu}</p><p className={`text-xs mt-1 ${m.auteur==='client' ? 'text-blue-200' : 'text-gray-400'}`}>{m.auteur==='client' ? 'Vous' : 'Cabinet'}</p>
                  </div>
                </div>
              ))}
              {messages.length===0 && <div className="text-center py-8"><p className="text-4xl mb-2">💬</p><p className="text-gray-400 text-sm">Aucun message</p></div>}
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMessage()}
                placeholder="Écrire un message..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Envoyer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}