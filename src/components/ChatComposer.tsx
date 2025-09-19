'use client'
import { FC, useState } from 'react'
// import type { Chat, Model } from '@/types'


interface Props {
  onSend: (text: string) => void
}

const ChatComposer: FC<Props> = ({ onSend }) => {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  return (
    <div className="flex mt-2 gap-2">
      <input
        type="text"
        className="flex-1 p-2 rounded bg-gray-800 text-white"
        placeholder="Type a message..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
      />
      <button
        className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  )
}

export default ChatComposer
