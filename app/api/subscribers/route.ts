import { NextResponse } from 'next/server'

const HANDLE = '@manishafamilychannel2859'

async function resolveChannelId() {
  try {
    const r = await fetch(`https://yt.lemnoslife.com/channels?handle=${encodeURIComponent(HANDLE)}`, { cache: 'no-store' })
    if (r.ok) {
      const j = await r.json()
      if (j?.items?.[0]?.id) return j.items[0].id as string
    }
  } catch {}
  return ''
}

export async function GET() {
  const id = await resolveChannelId()
  if (!id) return NextResponse.json({ subscribers: 0, source: 'fallback' })
  try {
    const r = await fetch(`https://api.socialcounts.org/youtube-live-subscriber-count/${id}`, { cache: 'no-store' })
    if (r.ok) {
      const j = await r.json()
      const value = Number(j?.est_sub ?? j?.subscriber_count)
      if (Number.isFinite(value)) return NextResponse.json({ subscribers: value, source: 'socialcounts' })
    }
  } catch {}
  return NextResponse.json({ subscribers: 0, source: 'livecounts', embed: `https://livecounts.io/embed/youtube-live-subscriber-counter/${id}` })
}
