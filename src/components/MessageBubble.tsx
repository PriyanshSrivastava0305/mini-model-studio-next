'use client'
import { FC } from 'react'
// import type { Chat, Model } from '@/types'


interface Props {
  role: string
  content: string
}

const MessageBubble: FC<Props> = ({ role, content }) => {
  const isUser = role === 'user'
  return (
    <div className={`p-2 rounded max-w-[70%] ${isUser ? 'bg-indigo-600 self-end' : 'bg-gray-700 self-start'}`}>
      {content}
    </div>
  )
}

export default MessageBubble
