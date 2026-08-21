import { NextResponse } from 'next/server'

const HANDLE='@manishafamilychannel2859'
const RSS='https://www.youtube.com/feeds/videos.xml?channel_id='

function text(xml:string,tag:string){const m=xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));return m?m[1].replace(/<!\[CDATA\[|\]\]>/g,'').trim():''}
function attr(xml:string,tag:string,attrName:string){const m=xml.match(new RegExp(`<${tag}[^>]*${attrName}=["']([^"']+)["']`));return m?.[1]||''}
function esc(s:string){return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'")}

async function resolveChannel(){
  try{const r=await fetch(`https://yt.lemnoslife.com/channels?handle=${encodeURIComponent(HANDLE)}`,{cache:'no-store'});if(r.ok){const j=await r.json();const id=j?.items?.[0]?.id;if(id)return id}}catch{}
  try{const r=await fetch(`https://banner.yt/api/channel/${encodeURIComponent(HANDLE)}?type=handle`,{cache:'no-store'});if(r.ok){const j=await r.json();if(j?.channelId)return j.channelId}}catch{}
  return ''
}

export async function GET(){
 try{
  const channelId=await resolveChannel()
  if(!channelId)return NextResponse.json({channelId:'',videos:[],subscribers:0,error:'Could not resolve channel ID right now.'},{status:200})
  const feed=await fetch(`${RSS}${channelId}`,{cache:'no-store'})
  if(!feed.ok)throw new Error('RSS feed unavailable')
  const xml=await feed.text(); const entries=xml.match(/<entry>[\s\S]*?<\/entry>/g)||[]
  const videos=entries.map(e=>{const id=text(e,'yt:videoId');const title=esc(text(e,'title'));const published=text(e,'published');const link=attr(e,'link','href')||`https://www.youtube.com/watch?v=${id}`;const thumb=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;const short=/\#shorts\b|\bshorts\b/i.test(title);return{id,title,published,thumbnail:thumb,url:link,short}})
  return NextResponse.json({channelId,videos,subscribers:0,totalViews:0},{headers:{'Cache-Control':'s-maxage=1800, stale-while-revalidate=3600'}})
 }catch(e){return NextResponse.json({channelId:'',videos:[],subscribers:0,error:e instanceof Error?e.message:'Unknown error'},{status:200})}
}
