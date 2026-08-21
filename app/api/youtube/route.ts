import { NextResponse } from 'next/server'

const HANDLE = '@manishafamilychannel2859'
const RESOLVER = `https://yt.lemnoslife.com/channels?handle=${encodeURIComponent(HANDLE)}`
const RSS = 'https://www.youtube.com/feeds/videos.xml?channel_id='

const xmlText = (xml: string, tag: string) => {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`))
  return (m?.[1] || '').replace(/<!\[CDATA\[|\]\]>/g, '').trim()
}
const xmlAttr = (xml: string, tag: string, name: string) => xml.match(new RegExp(`<${tag}[^>]*${name}=["']([^"']+)["']`))?.[1] || ''
const unescape = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")

async function resolveChannelId() {
  const r = await fetch(RESOLVER, { cache: 'no-store' })
  if (!r.ok) throw new Error('Channel resolver unavailable')
  const j = await r.json()
  const id = j?.items?.[0]?.id
  if (!id) throw new Error('Channel ID not found')
  return id as string
}

export async function GET() {
  try {
    const channelId = await resolveChannelId()
    const r = await fetch(`${RSS}${channelId}`, { cache: 'no-store' })
    if (!r.ok) throw new Error('YouTube RSS feed unavailable')
    const xml = await r.text()
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []

    const items = entries.map(entry => {
      const id = xmlText(entry, 'yt:videoId')
      const title = unescape(xmlText(entry, 'title'))
      const published = xmlText(entry, 'published')
      const thumbnail = xmlAttr(entry, 'media:thumbnail', 'url') || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      const description = unescape(xmlText(entry, 'media:description'))
      const isShortTitle = /(^|\s)#shorts?(\s|$)/i.test(title)
      const verticalHint = /(^|\s)(short|vertical|reel)(\s|$)/i.test(description)
      return { id, title, published, thumbnail, url: `https://www.youtube.com/watch?v=${id}`, description, short: isShortTitle || verticalHint }
    })

    return NextResponse.json({ channelId, videos: items, shorts: items.filter(x => x.short), totalVideos: items.length }, { headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' } })
  } catch (e) {
    return NextResponse.json({ channelId: '', videos: [], shorts: [], totalVideos: 0, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 200 })
  }
}
