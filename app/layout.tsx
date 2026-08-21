import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Manisha Family Channel | Family Vlogs & Shorts',
  description: 'Official website of Manisha Family Channel — family vlogs, Shorts, promotions, support and UPI donations.',
  metadataBase: new URL('https://youtube.com/@manishafamilychannel2859'),
  openGraph: { title: 'Manisha Family Channel', description: 'Family vlogs, Shorts and more.', type: 'website' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
