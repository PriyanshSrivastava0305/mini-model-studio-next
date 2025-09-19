'use client'
import React, { useEffect, useState } from 'react'
import type { Model } from '@/types'
import { getModelProfiles, createModelProfile } from '@/utils/api'

interface Props {
  selected: Model | null
  onSelect: (m: Model) => void
  onCreate: (m: Model) => void
}

export default function PersonaDropdown({ selected, onSelect, onCreate }: Props) {
  const [open, setOpen] = useState(false)
  const [models, setModels] = useState<Model[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', provider: 'openai', base_model: '', system_prompt: '' })

  const load = async () => {
    try {
      const ms = await getModelProfiles()
      setModels(ms)
    } catch (e) {
      console.error('fetch models error', e)
    }
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    try {
      const newModel = await createModelProfile({
        name: form.name,
        provider: form.provider,
        base_model: form.base_model,
        system_prompt: form.system_prompt,
      })
      setModels(prev => [...prev, newModel])
      onCreate(newModel)
      setForm({ name: '', provider: 'openai', base_model: '', system_prompt: '' })
      setShowForm(false)
      setOpen(false)
    } catch (e) {
      console.error('create model failed', e)
      alert('Failed to create persona — check console.')
    }
  }

  return (
    <div className="relative">
      <button className="bg-gray-700 p-2 rounded" onClick={() => setOpen(s => !s)}>
        {selected ? selected.name : 'Select Persona'}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded z-20 p-3">
          {!showForm ? (
            <>
              <div className="max-h-52 overflow-y-auto space-y-1">
                {models.map(m => (
                  <div key={m.id} className="p-2 hover:bg-gray-700 cursor-pointer" onClick={() => { onSelect(m); setOpen(false) }}>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-gray-300">{m.provider} · {m.base_model}</div>
                  </div>
                ))}
              </div>

              <div className="mt-2 border-t border-gray-700 pt-2">
                <button className="w-full bg-indigo-600 p-2 rounded" onClick={() => setShowForm(true)}>+ Add New</button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Name" className="p-2 bg-gray-700 rounded" />
              <select value={form.provider} onChange={e => setForm({...form, provider: e.target.value})} className="p-2 bg-gray-700 rounded">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
              <input value={form.base_model} onChange={e => setForm({...form, base_model: e.target.value})} placeholder="Base model (eg. gpt-4o-mini)" className="p-2 bg-gray-700 rounded" />
              <textarea value={form.system_prompt} onChange={e => setForm({...form, system_prompt: e.target.value})} placeholder="System prompt" className="p-2 bg-gray-700 rounded h-24" />
              <div className="flex gap-2">
                <button className="flex-1 bg-indigo-600 p-2 rounded" onClick={handleSubmit}>Go</button>
                <button className="flex-1 bg-gray-600 p-2 rounded" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
