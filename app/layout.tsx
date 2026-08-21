import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Manisha Family Channel | Family Vlogs, Shorts & Promotions',
  description: 'Official Manisha Family Channel website for family vlogs, Shorts, support, donations and brand promotions.',
  keywords: ['Manisha Family Channel','family vlogs','YouTube Shorts','promotions'],
  metadataBase: new URL('https://manishafamilychannel2859.vercel.app'),
  openGraph: { title: 'Manisha Family Channel', description: 'Family vlogs, Shorts, support and promotions.', type: 'website' },
}

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
