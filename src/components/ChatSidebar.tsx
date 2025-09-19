'use client'
import React from 'react'
import type { Chat } from '@/types'

interface Props {
  chats: Chat[]
  selectedId?: string | null
  onSelect: (c: Chat) => void
  onNewClick: () => void
  onRename: (id: string, newTitle: string) => void
  onDelete: (id: string) => void
}

export default function ChatSidebar({ chats, selectedId, onSelect, onNewClick, onRename, onDelete }: Props) {
  return (
    <div className="w-70 bg-gray-800 p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Chats</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {chats.map(chat => (
          <div key={chat.id} className={`p-2 rounded-2xl ${selectedId === chat.id ? 'bg-gray-700' : 'bg-gray-900 hover:bg-gray-800'}`}>
            <div className="flex justify-between items-center">
              <div className="cursor-pointer" onClick={() => onSelect(chat)}>{chat.title}</div>
              <div className="flex gap-1">
                <button className="text-xs bg-gray-600 px-1 rounded" onClick={() => {
                  const newTitle = prompt('Rename chat', chat.title)
                  if (newTitle) onRename(chat.id, newTitle)
                }}>Rename</button>
                <button className="text-xs bg-red-600 px-1 rounded" onClick={() => { if (confirm('Delete chat?')) onDelete(chat.id) }}>Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
