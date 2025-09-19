'use client'

import React, { useEffect, useState } from 'react'
import type { Chat, Model } from '@/types'
import {
  fetchChats as apiFetchChats,
  createChat as apiCreateChat,
  getModelProfiles as apiGetModelProfiles,
} from '@/utils/api'
import ChatSidebar from '@/components/ChatSidebar'
import ChatWindow from '@/components/ChatWindow'

export default function Page() {
  const [chats, setChats] = useState<Chat[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)

  // form state for creating chat (inline on page)
  const [newTitle, setNewTitle] = useState('')
  const [selectedModelId, setSelectedModelId] = useState<string>('') // empty => no persona attached

  // load chats + models
  useEffect(() => {
    const load = async () => {
      try {
        const cs = await apiFetchChats()
        setChats(cs)
        if (cs.length && !selectedChat) setSelectedChat(cs[0])
      } catch (e) {
        console.error('Failed to load chats', e)
      }

      try {
        const ms = await apiGetModelProfiles()
        setModels(ms)
        // default selection: none (user can pick)
      } catch (e) {
        console.error('Failed to load model profiles', e)
      }
    }
    load()
  }, [])

  // Create chat using the inline form
  const handleCreateChat = async () => {
    try {
      const title = (newTitle || 'New Chat').trim()
      // If backend requires non-empty model_profile_id, you could pass models[0].id as fallback.
      const payload = { title, model_profile_id: selectedModelId || '' }
      const created = await apiCreateChat(payload)
      // add to local state and select it
      setChats((prev) => [created, ...prev])
      setSelectedChat(created)
      // reset form
      setNewTitle('')
      setSelectedModelId('')
    } catch (err) {
      console.error('create chat failed', err)
      alert('Failed to create chat. See console.')
    }
  }

  // handlers passed to ChatSidebar
  const handleSelectChat = (c: Chat) => setSelectedChat(c)
  const handleRename = (id: string | number, newTitle: string) => {
    setChats(prev => prev.map(ch => (ch.id === id ? { ...ch, title: newTitle } : ch)))
  }
  const handleDelete = (id: string | number) => {
    setChats(prev => prev.filter(c => c.id !== id))
    if (selectedChat?.id === id) setSelectedChat(null)
  }

  const handleUpdateChat = (updated: Chat) => {
    setChats(prev => prev.map(c => (c.id === updated.id ? updated : c)))
    if (selectedChat?.id === updated.id) setSelectedChat(updated)
  }

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      <div className="w-72 bg-gray-800 p-3 flex flex-col gap-3">
        {/* Inline Create Chat form */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold mb-2">Create New Chat</h3>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Chat title"
            className="w-full p-2 mb-2 rounded-2xl bg-gray-700 text-sm"
          />

          <label className="text-xs text-gray-300">Persona</label>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-full p-2 mb-2 rounded-2xl bg-gray-700 text-sm"
          >
            <option value="">— No persona —</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.provider} / {m.base_model}
              </option>
            ))}
          </select>

          <button
            onClick={handleCreateChat}
            className="w-full bg-purple-200 text-black p-2 rounded-2xl"
          >
            Create Chat
          </button>
        </div>

        {/* Sidebar component for existing chats */}
        <ChatSidebar
          chats={chats}
          selectedId={selectedChat?.id}
          onSelect={handleSelectChat}
          onNewClick={() => {
            // focus the create form input (simple UX: set default title)
            setNewTitle('')
          }}
          onRename={(id, t) => handleRename(id, t)}
          onDelete={(id) => handleDelete(id)}
        />
      </div>

      <div className="flex-1">
        <ChatWindow chat={selectedChat} models={models} onUpdateChat={handleUpdateChat} />
      </div>
    </div>
  )
}
