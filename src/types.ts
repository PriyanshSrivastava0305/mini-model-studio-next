// // src/types.ts

// export interface Message {
//   role: 'user' | 'assistant'
//   content: string
//   timestamp?: string
// }

// export interface Model {
//   id: number | string
//   name: string
//   provider: string
//   base_model: string
//   system_prompt: string
// }

// export interface Chat {
//   id: number | string
//   title: string
//   model?: Model
//   messages: Message[]
// }


export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // always required
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  base_model: string;
  system_prompt: string;
}

export interface Chat {
  id: string;
  title: string;
  model?: Model;
  messages: Message[];
}

interface BackendMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  [key: string]: unknown;
}

