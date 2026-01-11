import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Music Bechdel Test',
  description: 'Analyze songs using the Bechdel test criteria: at least two women, talking to each other, about something other than a man.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

