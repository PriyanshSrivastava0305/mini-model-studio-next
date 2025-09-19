'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { Chat, Model, Message } from '@/types'
import { fetchChatMessages, sendMessage, patchChat } from '@/utils/api'
import PersonaDropdown from './PersonaDropdown'

function uniqueId() {
  return Math.random().toString(36).substring(2, 9)
}

interface Props {
  chat: Chat | null
  models: Model[]
  onUpdateChat: (c: Chat) => void
}

/**
 * ChatWindow:
 * - loads messages via fetchChatMessages(chatId) which returns { messages: Message[] }
 * - sends messages via sendMessage(chatId, content, personaId)
 * - patches chat model via patchChat(chatId, { model_profile_id })
 */

export default function ChatWindow({ chat, models, onUpdateChat }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedPersona, setSelectedPersona] = useState<Model | null>(null)
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  // initialize selected persona from chat or fallback to first model
  useEffect(() => {
    if (chat?.model) setSelectedPersona(chat.model)
    else if (models.length) setSelectedPersona(models[0])
    else setSelectedPersona(null)
  }, [chat?.id, chat?.model, models])

  // load chat messages when chat changes
  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!chat?.id) {
        if (mounted) setMessages([])
        return
      }

      try {
        const resp = await fetchChatMessages(String(chat.id)) // expects { messages: Message[] }
        if (!mounted) return
        const msgs = resp.messages ?? []
        setMessages(msgs)
      } catch (err) {
        console.error('Failed to load chat messages:', err)
        if (mounted) setMessages([])
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [chat?.id])

  // scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // send handler
  const handleSend = async () => {
    if (!input.trim() || !chat?.id) return
    if (!selectedPersona?.id) {
      alert('Please select a persona before sending a message.')
      return
    }

    const trimmed = input.trim()

    // optimistic user message
    const userMsg: Message = {
      id: uniqueId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => {
      const updated = [...prev, userMsg]
      onUpdateChat({ ...(chat as Chat), messages: updated, model: selectedPersona })
      return updated
    })
    setInput('')

    try {
      const resp = await sendMessage(String(chat.id), trimmed, String(selectedPersona.id))

      // If backend returned full messages array
      if (resp?.messages && Array.isArray(resp.messages)) {
        const serverMessages: Message[] = resp.messages
        setMessages(serverMessages)
        onUpdateChat({ ...(chat as Chat), messages: serverMessages, model: selectedPersona })
        return
      }

      // Otherwise handle single reply
      const replyText: string = resp?.reply ?? resp?.raw?.reply ?? resp?.raw?.response ?? 'No response'

      const assistantMsg: Message = {
        id: uniqueId(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => {
        const updated = [...prev, assistantMsg]
        onUpdateChat({ ...(chat as Chat), messages: updated, model: selectedPersona })
        return updated
      })
    } catch (err) {
      console.error('send failed:', err)
      // Optionally notify user
    }
  }

  // When user selects an existing persona from dropdown
  const handlePersonaSelect = async (m: Model) => {
    setSelectedPersona(m)

    if (!chat?.id) return

    try {
      const updated = await patchChat(chat.id, { model_profile_id: m.id })
      // Use backend returned model/messages if present; otherwise update locally
      const newChat: Chat = {
        ...(chat as Chat),
        model: (updated as any).model ?? m,
        messages: (updated as any).messages ?? chat.messages ?? messages,
      }
      onUpdateChat(newChat)
      // also update local messages state if backend returned messages
      if ((updated as any).messages) {
        setMessages((updated as any).messages)
      }
    } catch (err) {
      console.error('Failed to attach persona to chat', err)
      alert('Could not attach persona to chat — check console.')
      // optional: revert selection to previous model
      setSelectedPersona(chat?.model ?? null)
    }
  }

  // When user creates a new persona inside dropdown form
  const handlePersonaCreate = async (m: Model) => {
    setSelectedPersona(m)

    if (!chat?.id) return

    try {
      const updated = await patchChat(chat.id, { model_profile_id: m.id })
      const newChat: Chat = {
        ...(chat as Chat),
        model: (updated as any).model ?? m,
        messages: (updated as any).messages ?? chat.messages ?? messages,
      }
      onUpdateChat(newChat)
      if ((updated as any).messages) setMessages((updated as any).messages)
    } catch (err) {
      console.error('Failed to attach newly created persona', err)
      alert('Could not attach new persona to chat — check console.')
      setSelectedPersona(chat?.model ?? null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-bold">{chat?.title ?? 'No chat selected'}</div>
        <PersonaDropdown
          selected={selectedPersona}
          onSelect={handlePersonaSelect}
          onCreate={handlePersonaCreate}
        />
      </div>

      {/* Messages (scrollable area) */}
      <div className="flex-1 overflow-y-auto mb-3">
        <div className="flex flex-col gap-2 px-1 py-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[70%] w-fit p-3 rounded-2xl ${
                m.role === "user"
                  ? "ml-auto bg-purple-300 text-black"
                  : "bg-purple-950 text-white"
              }`}
            >
              <div className="text-sm break-words">{m.content}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input (always at the bottom) */}
      <div className="flex gap-2 mt-auto">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything..."
          className="flex-1 p-2 rounded-2xl bg-gray-800 "
        />
        <button className="bg-purple-300 px-4 rounded-2xl text-black" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>


  )
}
