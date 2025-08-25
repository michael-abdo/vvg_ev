import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Navbar } from '@/components/navbar'
import { Providers } from './providers'
import PendoScript from '@/components/PendoScript'
import { Toaster } from '@/components/ui/toaster'

const basePath = process.env.BASE_PATH || '';

export const metadata: Metadata = {
  icons: {
    icon: `${basePath}/logo.svg`,
    shortcut: `${basePath}/logo.svg`,
    apple: `${basePath}/logo.svg`,
  },
  title: {
    default: 'VVG Document Processing Calculator',
    template: '%s | VVG Calculator'
  },
  description: 'Production-ready document processing calculator with upload, extraction, and comparison features',
  keywords: ['document processing', 'calculator', 'PDF extraction', 'document comparison', 'BEV cost analysis'],
  authors: [{ name: 'VVG Team' }],
  openGraph: {
    title: 'VVG Document Processing Calculator',
    description: 'Production-ready document processing calculator',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <Providers>
          <PendoScript />
          <Navbar />
          <div className="pt-14">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
