// import './globals.css'
// import { ReactNode } from 'react'

// export const metadata = {
//   title: 'Mini Model Studio',
//   description: 'Custom LLM personas chat',
// }

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en" className="dark">
//       <body className="flex h-screen bg-gray-900 text-white">
//         {children}
//       </body>
//     </html>
//   )
// }


import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Chat App",
  description: "Persona-based chat app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
