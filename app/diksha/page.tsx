'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Sparkles, UserRound, Settings2, Send, Trash2 } from 'lucide-react'

type Msg={role:'user'|'assistant';text:string}
type Recognition=any

const quick=[
  'Tumhara naam kya hai?',
  'Who developed you?',
  'Hindi mein baat karo',
  'What can you do?',
  'Hinglish mein bolo',
]

function answer(q:string){
  const x=q.toLowerCase().trim()
  if(/naam|name/.test(x)) return 'Mera naam Diksha hai. Main ek friendly Hindi, English aur Hinglish voice assistant hoon. 😊'
  if(/develop|owner|malik|banaya|created/.test(x)) return 'Mujhe Sachin ne develop kiya hai. Sachin is project ke developer hain.'
  if(/hindi/.test(x)) return 'Bilkul. Ab main Hindi mein baat karungi. Aap kya poochna chahte ho?'
  if(/hinglish/.test(x)) return 'Sure! Ab hum Hinglish mein baat karte hain. Batao, kya help chahiye?'
  if(/what can you do|kya kar/.test(x)) return 'Main voice input le sakti hoon, Hindi-English-Hinglish mein reply kar sakti hoon, basic questions answer kar sakti hoon, aur browser ki speech technology se reply bol sakti hoon.'
  if(/hello|hi|hey/.test(x)) return 'Hello! Main Diksha hoon. 😊 Batao, main tumhari kya help karun?'
  if(/time|samay/.test(x)) return `Abhi ${new Intl.DateTimeFormat('en-IN',{timeStyle:'short'}).format(new Date())} ho rahe hain.`
  if(/date|tarikh|aaj/.test(x)) return `Aaj ${new Intl.DateTimeFormat('en-IN',{dateStyle:'full'}).format(new Date())} hai.`
  return 'Main is question ka reliable answer abhi nahi jaanti. Is version mein live web/AI knowledge connector configured nahi hai. Aap simple question pooch sakte ho ya baad mein AI API connect karke meri knowledge aur powerful bana sakte ho.'
}

export default function Diksha(){
  const [messages,setMessages]=useState<Msg[]>([{role:'assistant',text:'Namaste! 👋 Main Diksha hoon. Hindi, English ya Hinglish mein mujhse baat karo.'}])
  const [input,setInput]=useState('')
  const [listening,setListening]=useState(false)
  const [speaking,setSpeaking]=useState(true)
  const recognition=useRef<Recognition>(null)
  const lang=useMemo(()=>typeof navigator!=='undefined'?'hi-IN':'en-IN',[])

  const speak=(text:string)=>{
    if(!speaking || typeof window==='undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u=new SpeechSynthesisUtterance(text)
    u.lang=/[अ-ह]/.test(text)?'hi-IN':'en-IN'
    u.rate=.94; u.pitch=1.08; u.volume=1
    const voices=window.speechSynthesis.getVoices()
    const v=voices.find(v=>/India|Hindi|en-IN/i.test(`${v.name} ${v.lang}`))
    if(v) u.voice=v
    window.speechSynthesis.speak(u)
  }

  const send=(raw=input)=>{
    const text=raw.trim(); if(!text)return
    const reply=answer(text)
    setMessages(m=>[...m,{role:'user',text},{role:'assistant',text:reply}])
    setInput(''); speak(reply)
  }

  const startVoice=()=>{
    if(typeof window==='undefined')return
    const SR=(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if(!SR){alert('Voice recognition is not supported in this browser. Chrome Android recommended.');return}
    if(listening){recognition.current?.stop();return}
    const r=new SR(); recognition.current=r; r.lang=lang; r.interimResults=false; r.continuous=false
    r.onstart=()=>setListening(true); r.onend=()=>setListening(false)
    r.onerror=()=>setListening(false)
    r.onresult=(e:any)=>{const text=e.results?.[0]?.[0]?.transcript||'';setInput(text);send(text)}
    r.start()
  }

  useEffect(()=>()=>{recognition.current?.stop();window.speechSynthesis?.cancel()},[])

  return <main className="min-h-screen overflow-hidden bg-[#07050d] text-white">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(236,72,153,.22),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(139,92,246,.2),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(249,115,22,.14),transparent_35%)]"/>
    <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-5 sm:px-8">
      <header className="glass flex items-center justify-between rounded-3xl px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 shadow-[0_0_30px_rgba(236,72,153,.3)]"><Sparkles size={22}/></div><div><div className="font-black">Diksha</div><div className="text-xs text-white/45">Voice Assistant • by Sachin</div></div></div>
        <button onClick={()=>setSpeaking(v=>!v)} className="glass grid h-10 w-10 place-items-center rounded-xl" aria-label="Toggle voice">{speaking?<Volume2 size={18}/>:<VolumeX size={18}/>}</button>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-8">
        <div className={`relative grid h-44 w-44 place-items-center rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 shadow-[0_0_80px_rgba(236,72,153,.35)] ${listening?'animate-pulse':''}`}><div className="grid h-36 w-36 place-items-center rounded-full bg-[#0d0915] ring-1 ring-white/10"><span className="text-6xl">👩🏻</span></div></div>
        <h1 className="mt-7 text-center text-5xl font-black tracking-tight sm:text-7xl">Diksha</h1>
        <p className="mt-3 text-center text-white/50">Hindi • English • Hinglish</p>
        <p className="mt-1 text-center text-sm text-pink-200/70">{listening?'Listening...':'Tap the mic and speak naturally'}</p>

        <div className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask Diksha anything..." className="glass min-h-14 flex-1 rounded-2xl px-5 outline-none placeholder:text-white/30 focus:border-pink-400/40"/><button onClick={()=>send()} className="grid min-h-14 place-items-center rounded-2xl bg-white px-7 font-black text-black transition hover:scale-[1.02]"><Send size={19}/></button></div>
        <button onClick={startVoice} className={`mt-4 flex h-16 items-center gap-3 rounded-full px-8 font-black transition hover:scale-105 ${listening?'bg-red-500 shadow-[0_0_35px_rgba(239,68,68,.4)]':'bg-gradient-to-r from-pink-500 to-orange-400 shadow-[0_0_35px_rgba(236,72,153,.28)]'}`}>{listening?<MicOff/>:<Mic/>}{listening?'Stop listening':'Talk to Diksha'}</button>

        <div className="mt-8 flex max-w-3xl flex-wrap justify-center gap-2">{quick.map(q=><button key={q} onClick={()=>send(q)} className="glass rounded-full px-4 py-2 text-xs text-white/65 transition hover:border-pink-400/30 hover:text-white">{q}</button>)}</div>
      </section>

      <section className="glass mb-5 rounded-3xl p-4 sm:p-6"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-bold"><UserRound size={17} className="text-pink-300"/> Conversation</div><button onClick={()=>setMessages([])} className="text-white/35 transition hover:text-white" aria-label="Clear conversation"><Trash2 size={17}/></button></div><div className="max-h-72 space-y-3 overflow-y-auto pr-1">{messages.length===0?<div className="py-8 text-center text-sm text-white/35">Conversation cleared.</div>:messages.map((m,i)=><div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${m.role==='user'?'bg-pink-500/20 text-pink-50':'bg-white/5 text-white/75'}`}>{m.text}</div></div>)}</div></section>
      <footer className="flex items-center justify-between px-2 pb-2 text-[11px] text-white/25"><span>Diksha • Personal voice assistant</span><span><Settings2 size={12} className="mr-1 inline"/> Browser voice technology</span></footer>
    </div>
  </main>
}
