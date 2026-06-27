'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/cabinet/Sidebar'
import { useRouter } from 'next/navigation'

type Question = { id: string; titre: string; type: 'pj' | 'texte' | 'checkbox'; obligatoire: boolean }
type Section = { titre: string; questions: Question[] }

export default function NouveauFormulairePage() {
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [sections, setSections] = useState<Section[]>([{ titre: 'Section 1', questions: [] }])
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function addQuestion(si: number) {
    const id = Math.random().toString(36).substr(2, 9)
    setSections(prev => prev.map((s, i) => i === si ? { ...s, questions: [...s.questions, { id, titre: 'Nouvelle question', type: 'pj', obligatoire: false }] } : s))
  }

  function updateQuestion(si: number, qi: number, field: string, value: any) {
    setSections(prev => prev.map((s, i) => i === si ? { ...s, questions: s.questions.map((q, j) => j === qi ? { ...q, [field]: value } : q) } : s))
  }

  function removeQuestion(si: number, qi: number) {
    setSections(prev => prev.map((s, i) => i === si ? { ...s, questions: s.questions.filter((_, j) => j !== qi) } : s))
  }

  function addSection() {
    setSections(prev => [...prev, { titre: 'Nouvelle section', questions: [] }])
  }

  async function save() {
    if (!titre.trim()) return alert('Veuillez saisir un titre')
    setSaving(true)
    const { data } = await supabase.from('formulaires').insert({ titre, description, sections }).select().single()
    if (data) router.push('/dashboard/formulaires/' + data.id + '/envoyer')
    setSaving(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nouveau formulaire</h1>
          <button onClick={save} disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {saving ? 'Enregistrement...' : '💾 Enregistrer et envoyer'}
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre du formulaire (ex: Bilan 2026)"
            className="w-full text-xl font-bold border-0 outline-none text-gray-900 mb-3 placeholder-gray-300" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optionnelle)..."
            className="w-full text-sm border-0 outline-none text-gray-600 resize-none placeholder-gray-300" rows={2} />
        </div>
        {sections.map((section, si) => (
          <div key={si} className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
              <input value={section.titre} onChange={e => setSections(prev => prev.map((s, i) => i === si ? { ...s, titre: e.target.value } : s))}
                className="font-semibold text-gray-800 bg-transparent border-0 outline-none w-full" />
            </div>
            <div className="p-6 space-y-4">
              {section.questions.map((q, qi) => (
                <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input value={q.titre} onChange={e => updateQuestion(si, qi, 'titre', e.target.value)}
                        className="w-full font-medium text-gray-800 border-0 outline-none border-b border-gray-200 pb-1 mb-2" />
                      <div className="flex gap-3">
                        <select value={q.type} onChange={e => updateQuestion(si, qi, 'type', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
                          <option value="pj">📎 Pièce jointe</option>
                          <option value="texte">💬 Champ texte</option>
                          <option value="checkbox">☑️ Case à cocher</option>
                        </select>
                        <label className="flex items-center gap-1.5 text-sm text-gray-600">
                          <input type="checkbox" checked={q.obligatoire} onChange={e => updateQuestion(si, qi, 'obligatoire', e.target.checked)} className="w-4 h-4" />
                          Obligatoire
                        </label>
                      </div>
                    </div>
                    <button onClick={() => removeQuestion(si, qi)} className="text-gray-300 hover:text-red-400 transition">🗑️</button>
                  </div>
                </div>
              ))}
              <button onClick={() => addQuestion(si)} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition">
                + Ajouter une question
              </button>
            </div>
          </div>
        ))}
        <button onClick={addSection} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition font-medium">
          + Ajouter une section
        </button>
      </main>
    </div>
  )
}