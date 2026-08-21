import { NextResponse } from 'next/server'

const CHANNEL_ID_FALLBACK=''
const HANDLE='@manishafamilychannel2859'

async function channelId(){
 try{const r=await fetch(`https://yt.lemnoslife.com/channels?handle=${encodeURIComponent(HANDLE)}`,{cache:'no-store'});if(r.ok){const j=await r.json();if(j?.items?.[0]?.id)return j.items[0].id}}catch{}
 try{const r=await fetch(`https://banner.yt/api/channel/${encodeURIComponent(HANDLE)}?type=handle`,{cache:'no-store'});if(r.ok){const j=await r.json();if(j?.channelId)return j.channelId}}catch{}
 return CHANNEL_ID_FALLBACK
}

export async function GET(){
 const id=await channelId()
 if(!id)return NextResponse.json({subscribers:0,source:'fallback'})
 try{const r=await fetch(`https://api.socialcounts.org/youtube-live-subscriber-count/${id}`,{cache:'no-store'});if(r.ok){const j=await r.json();const n=Number(j?.est_sub??j?.subscriber_count);if(Number.isFinite(n)&&n>0)return NextResponse.json({subscribers:n,source:'socialcounts'})}}catch{}
 return NextResponse.json({subscribers:0,source:'fallback',embed:`https://livecounts.io/embed/youtube-live-subscriber-counter/${id}`})
}
