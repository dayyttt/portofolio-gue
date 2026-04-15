import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio — Hidayat Syahidin Ambo',
  description: 'Full Stack Developer specializing in Business Systems, SaaS, and Custom Enterprise Solutions.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
