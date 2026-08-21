import { NextResponse } from 'next/server'

const CHANNEL_ID = 'UCQwsyjbJ5MR4OzTdA5VcGOQ'
const HANDLE = '@manishafamilychannel2859'
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}/videos`
const SHORTS_URL = `https://www.youtube.com/channel/${CHANNEL_ID}/shorts`

type Item = { id:string; title:string; published:string; thumbnail:string; url:string; description?:string; short?:boolean; views?:number }

function decode(s:string){return s.replace(/\\u0026/g,'&').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'")}
function parsePage(html:string, short=false): {items:Item[]; avatar:string} {
  const items:Item[]=[]
  const seen=new Set<string>()
  let avatar=''
  const av=html.match(/"avatar":\{"thumbnails":\[(.*?)\]\}/)
  if(av){const m=av[1].match(/"url":"([^"]+)"/);if(m)avatar=decode(m[1])}
  const re=short?/"reelItemRenderer":\{"videoId":"([^"]+)"/g:/"videoRenderer":\{"videoId":"([^"]+)"/g
  for(const m of html.matchAll(re)){
    const id=m[1]; if(seen.has(id))continue
    const start=m.index??0; const chunk=html.slice(start,start+6000)
    const title=(chunk.match(/"title":\{"runs":\[\{"text":"((?:\\\\.|[^"])*)"/)?.[1]||'').replace(/\\"/g,'"')
    const published=chunk.match(/"publishedTimeText":\{"simpleText":"([^"]+)"/)?.[1]||''
    if(!title)continue
    seen.add(id)
    items.push({id,title,published,thumbnail:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,url:`https://www.youtube.com/watch?v=${id}`,short})
  }
  return {items,avatar}
}

async function youtubeApi():Promise<{items:Item[];avatar:string}|null>{
  const key=process.env.YOUTUBE_API_KEY
  if(!key)return null
  const items:Item[]=[]
  let token=''
  for(let page=0;page<100;page++){
    const u=new URL('https://www.googleapis.com/youtube/v3/search')
    u.searchParams.set('part','snippet');u.searchParams.set('channelId',CHANNEL_ID);u.searchParams.set('maxResults','50');u.searchParams.set('order','date');u.searchParams.set('type','video');u.searchParams.set('key',key)
    if(token)u.searchParams.set('pageToken',token)
    const r=await fetch(u.toString(),{cache:'no-store'});if(!r.ok)break
    const j=await r.json()
    for(const x of (j.items||[]))items.push({id:x.id.videoId,title:x.snippet.title,published:x.snippet.publishedAt,thumbnail:x.snippet.thumbnails?.high?.url||x.snippet.thumbnails?.medium?.url||`https://i.ytimg.com/vi/${x.id.videoId}/hqdefault.jpg`,url:`https://www.youtube.com/watch?v=${x.id.videoId}`,description:x.snippet.description,short:/#shorts\b/i.test(x.snippet.title+' '+x.snippet.description)})
    token=j.nextPageToken||'';if(!token)break
  }
  return {items,avatar:''}
}

export async function GET(){
  try{
    const api=await youtubeApi()
    if(api && api.items.length) return NextResponse.json({channelId:CHANNEL_ID,handle:HANDLE,videos:api.items,shorts:api.items.filter(x=>x.short),avatar:api.avatar,totalVideos:api.items.length,source:'youtube-api'},{headers:{'Cache-Control':'s-maxage=1800, stale-while-revalidate=3600'}})

    const [vr,sr]=await Promise.all([fetch(CHANNEL_URL,{cache:'no-store',headers:{'User-Agent':'Mozilla/5.0'}}),fetch(SHORTS_URL,{cache:'no-store',headers:{'User-Agent':'Mozilla/5.0'}})])
    const vh=vr.ok?await vr.text():''; const sh=sr.ok?await sr.text():''
    const a=parsePage(vh,false); const b=parsePage(sh,true)
    const map=new Map<string,Item>()
    for(const x of a.items)map.set(x.id,x)
    for(const x of b.items)map.set(x.id,{...x,short:true})
    const items=[...map.values()]
    return NextResponse.json({channelId:CHANNEL_ID,handle:HANDLE,videos:items,shorts:items.filter(x=>x.short),avatar:a.avatar||b.avatar,totalVideos:items.length,source:'youtube-page'},{headers:{'Cache-Control':'s-maxage=1800, stale-while-revalidate=3600'}})
  }catch(e){return NextResponse.json({channelId:CHANNEL_ID,handle:HANDLE,videos:[],shorts:[],avatar:'',totalVideos:0,error:e instanceof Error?e.message:'Unknown error'},{status:200})}
}
