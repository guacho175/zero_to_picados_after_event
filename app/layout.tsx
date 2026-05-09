import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { RootNav } from '@/components/root-nav'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { SolanaWalletProvider } from '@/components/solana/solana-wallet-provider'
import { FirebaseCitiesInitializer } from '@/components/firebase-cities-initializer'
import './globals.css'

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: 'Reflect — Emotional Check-in Platform',
  description: 'Transform self-awareness through guided reflections with AI companions. Check in with your emotions, receive personalized guidance, and join our collaborative mood harvesting community.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f1419',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background dark" style={{ backgroundColor: '#0a0e17' }}>
      <body className={`${nunito.variable} font-sans antialiased bg-background`} style={{ backgroundColor: '#0a0e17' }}>
        <SolanaWalletProvider>
          <LanguageProvider>
            <FirebaseCitiesInitializer />
            <RootNav />
            {children}
          </LanguageProvider>
        </SolanaWalletProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
