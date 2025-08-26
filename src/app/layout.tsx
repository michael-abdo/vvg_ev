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
    default: 'BEV Cost Calculator',
    template: '%s | BEV Cost Calculator'
  },
  description: 'Compare Battery Electric Vehicle costs vs Diesel with multiple interactive UI approaches',
  keywords: ['BEV cost calculator', 'electric vehicle', 'diesel comparison', 'fleet analysis', 'TCO calculator'],
  authors: [{ name: 'VVG Team' }],
  openGraph: {
    title: 'BEV Cost Calculator',
    description: 'Compare Battery Electric Vehicle costs vs Diesel with multiple interactive UI approaches',
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
