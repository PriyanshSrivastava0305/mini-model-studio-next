// const API_BASE_URL = "http://localhost:8000"; // change if backend runs elsewhere

// // Helper to handle API requests with error handling
// async function apiRequest(endpoint: string, options: RequestInit = {}) {
//   try {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       headers: { "Content-Type": "application/json" },
//       ...options,
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(
//         errorData.detail || `Request failed: ${response.status} ${response.statusText}`
//       );
//     }

//     return response.json();
//   } catch (error) {
//     console.error("API Request Error:", error);
//     throw error;
//   }
// }

// // -------- Model Profiles --------

// // Get all model profiles
// export async function getModelProfiles() {
//   return apiRequest("/model-profiles/");
// }

// // Create new model profile
// export async function createModelProfile(data: {
//   name: string;
//   provider: string;
//   base_model: string;
//   system_prompt: string;
// }) {
//   return apiRequest("/model_profiles/", {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
// }

// // -------- Chats --------

// // Get all chats
// export async function fetchChats() {
//   return apiRequest("/chats/");
// }

// // Create a new chat
// export async function createChat(data: {
//   title: string;
//   model_profile_id: string;
// }) {
//   return apiRequest("/chats/", {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
// }

// // Get single chat by ID
// export async function fetchChat(chatId: string) {
//   return apiRequest(`/chats/${chatId}`);
// }

// // -------- Messages --------

// // Send a message in a chat
// export async function sendMessage(
//   model_profile_id: string,
//   chat_id: string,
//   message: string
// ) {
//   return apiRequest(`/send-message`, {
//     method: "POST",
//     body: JSON.stringify({
//       model_profile_id,
//       chat_id,
//       message,
//     }),
//   });
// }


// src/utils/api.ts
// src/utils/api.ts
// import type { Chat, Model, Message } from '@/types'

// const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// /**
//  * Generic fetch wrapper that returns parsed JSON (or throws).
//  */
// async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
//   const url = `${API_BASE}${endpoint}`
//   const defaultHeaders = { 'Content-Type': 'application/json' }
//   const mergedOptions: RequestInit = {
//     ...options,
//     headers: {
//       ...defaultHeaders,
//       ...(options.headers || {}),
//     },
//   }

//   const res = await fetch(url, mergedOptions)
//   const text = await res.text().catch(() => '')
//   let data: any = null

//   if (text) {
//     try {
//       data = JSON.parse(text)
//     } catch {
//       data = text
//     }
//   }

//   if (!res.ok) {
//     // try to surface backend error message if present
//     const msg = data?.detail ?? data?.message ?? text ?? `${res.status} ${res.statusText}`
//     throw new Error(String(msg))
//   }

//   return data as T
// }

// /* --------------------------- Model profiles --------------------------- */

// /** GET /model-profiles/ */
// export async function getModelProfiles(): Promise<Model[]> {
//   return apiRequest<Model[]>('/model-profiles/')
// }

// /** POST /model-profiles/ */
// export async function createModelProfile(payload: {
//   name: string
//   provider: string
//   base_model: string
//   system_prompt: string
// }): Promise<Model> {
//   return apiRequest<Model>('/model-profiles/', {
//     method: 'POST',
//     body: JSON.stringify(payload),
//   })
// }

// /* alias used in some older code */
// export const fetchModels = getModelProfiles

// /* ------------------------------- Chats ------------------------------- */

// /** GET /chats/ */
// export async function fetchChats(): Promise<Chat[]> {
//   return apiRequest<Chat[]>('/chats/')
// }

// /** POST /chats/  -> body: { title, model_profile_id } */
// export async function createChat(payload: { title: string; model_profile_id: string }): Promise<Chat> {
//   return apiRequest<Chat>('/chats/', {
//     method: 'POST',
//     body: JSON.stringify(payload),
//   })
// }

// /**
//  * Try GET /chats/{id} first (if your backend provides chat meta),
//  * otherwise fallback to GET /chats/{id}/messages and return messages inside an object.
//  */
// export async function fetchChat(chatId: string | number): Promise<Chat | { id: string; messages: Message[] }> {
//   const id = String(chatId)
//   try {
//     // Try to fetch chat meta (if your backend has it)
//     return await apiRequest<Chat>(`/chats/${id}`)
//   } catch (err) {
//     // Fallback to messages endpoint
//     const msgs = await apiRequest<Message[]>(`/chats/${id}/messages`)
//     return { id, messages: msgs }
//   }
// }

// /** GET /chats/{id}/messages  -> returns Message[] */
// export async function fetchChatMessages(chatId: string | number): Promise<Message[]> {
//   const id = String(chatId)
//   return apiRequest<Message[]>(`/chats/${id}/messages`)
// }

// /**
//  * POST /chats/{id}/messages
//  * Body: { content: string }
//  * Expected backend responses vary by implementation; this function tries to return a sensible shape:
//  *  - { reply: '...' } OR { response: '...' } OR { assistant: { content: '...' } } OR { messages: [...] }
//  */
// export async function sendMessageToChat(
//   chatId: string | number,
//   content: string
// ): Promise<{
//   reply?: string
//   messages?: Message[]
//   raw?: any
// }> {
//   const id = String(chatId)
//   const data = await apiRequest<any>(`/chats/${id}/messages`, {
//     method: 'POST',
//     body: JSON.stringify({ content }),
//   })

//   // Try common response shapes
//   const reply: string | undefined =
//     (typeof data?.reply === 'string' && data.reply) ||
//     (typeof data?.response === 'string' && data.response) ||
//     (typeof data?.result === 'string' && data.result) ||
//     (typeof data?.assistant === 'object' && typeof data.assistant.content === 'string' && data.assistant.content) ||
//     undefined

//   const messages: Message[] | undefined = Array.isArray(data?.messages) ? data.messages : undefined

//   return { reply, messages, raw: data }
// }

// /* Backwards-compatible alias: if your code imports `sendMessage` */
// export const sendMessage = sendMessageToChat

// /* Optional: rename/delete chat helpers (if backend supports PATCH/DELETE) */

// export async function renameChat(chatId: string | number, newTitle: string): Promise<Chat> {
//   const id = String(chatId)
//   return apiRequest<Chat>(`/chats/${id}`, {
//     method: 'PATCH',
//     body: JSON.stringify({ title: newTitle }),
//   })
// }

// export async function deleteChat(chatId: string | number): Promise<void> {
//   const id = String(chatId)
//   await apiRequest<void>(`/chats/${id}`, { method: 'DELETE' })
// }


// src/utils/api.ts
import type { Chat, Model, Message } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const defaultHeaders = { 'Content-Type': 'application/json' }
  const merged: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers ?? {}),
    },
  }

  const res = await fetch(url, merged)
  const text = await res.text().catch(() => '')
  let data: any = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const msg = data?.detail ?? data?.message ?? text ?? `${res.status} ${res.statusText}`
    throw new Error(String(msg))
  }
  return data as T
}

/* Model profiles */
export async function getModelProfiles(): Promise<Model[]> {
  return apiRequest<Model[]>('/model-profiles/')
}
export async function createModelProfile(payload: {
  name: string
  provider: string
  base_model: string
  system_prompt: string
}): Promise<Model> {
  return apiRequest<Model>('/model-profiles/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/* Chats */
export async function fetchChats(): Promise<Chat[]> {
  return apiRequest<Chat[]>('/chats/')
}
export async function createChat(payload: { title: string; model_profile_id: string }): Promise<Chat> {
  return apiRequest<Chat>('/chats/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
export async function fetchChat(chatId: string | number): Promise<Chat | { id: string; messages: Message[] }> {
  const id = String(chatId)
  try {
    return await apiRequest<Chat>(`/chats/${id}`)
  } catch {
    // fallback to messages endpoint
    const msgs = await fetchChatMessages(id)
    return { id, messages: msgs.messages }
  }
}

/* Backend message shape */
interface BackendMessage {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface BackendMessagesResponse {
  messages: BackendMessage[]
}

/* Fetch messages for a chat */
export async function fetchChatMessages(chatId: string): Promise<{ messages: Message[] }> {
  const res = await apiRequest<BackendMessagesResponse>(`/chats/${chatId}/messages`)

  const messages: Message[] = res.messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.created_at, // normalize backend field
  }))

  return { messages }
}

export async function patchChat(
  chatId: string | number,
  payload: Partial<{ title: string; model_profile_id: string }>
): Promise<Chat> {
  const id = String(chatId)
  return apiRequest<Chat>(`/chats/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/* Send message to chat */
export async function sendMessageToChat(chatId: string | number, content: string, personaId: string) {
  const chatIdStr = String(chatId) // safe now

  const data = await apiRequest<BackendMessagesResponse | any>(
    `/chats/${chatIdStr}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content }),
    }
  )

  // normalize reply
  const reply: string | undefined =
    (typeof data?.reply === 'string' && data.reply) ||
    (typeof data?.response === 'string' && data.response) ||
    (typeof data?.result === 'string' && data.result) ||
    (typeof data?.assistant === 'object' &&
      typeof data.assistant.content === 'string' &&
      data.assistant.content) ||
    undefined

  // normalize messages
  const messages: Message[] | undefined =
    Array.isArray(data?.messages)
      ? data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.created_at,
        }))
      : undefined

  return { reply, messages, raw: data }
}
export const sendMessage = sendMessageToChat


/* Optional helpers */
export async function renameChat(chatId: string | number, newTitle: string): Promise<Chat> {
  return apiRequest<Chat>(`/chats/${String(chatId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ title: newTitle }),
  })
}
export async function deleteChat(chatId: string | number): Promise<void> {
  await apiRequest<void>(`/chats/${String(chatId)}`, { method: 'DELETE' })
}
