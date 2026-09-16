import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Camera, Clipboard, Gauge, Keyboard, MonitorUp, Radio, ShieldCheck, SlidersHorizontal, Sparkles, Timer, Wifi } from 'lucide-react';

const presets = [
  ['Presentation','1080p • 30 FPS','Balanced clarity for slides and demos'],
  ['Gaming','1080p • 60 FPS','Prioritizes smooth motion'],
  ['Low bandwidth','720p • 15 FPS','Keeps sessions usable on slower links'],
  ['Ultra','4K • 60 FPS','Maximum visual detail when hardware allows'],
];
const tools = [
  ['Remote cursor','Show a visible pointer so viewers can follow your actions.','MonitorUp'],
  ['Session timer','Keep a visible session clock for demos and classrooms.','Timer'],
  ['Quality monitor','Watch connection health and adapt before frames drop.','Activity'],
  ['Quick capture','Capture a local frame for notes or bug reports.','Camera'],
  ['Keyboard hints','Surface useful shortcuts without interrupting the stream.','Keyboard'],
  ['Connection guard','Keep sensitive session controls behind the authenticated operator.','ShieldCheck'],
];
const icons:any={MonitorUp,Timer,Activity,Camera,Keyboard,ShieldCheck};

export function AdvancedFeatures(){
 const [preset,setPreset]=useState('Presentation');
 const [active,setActive]=useState(0);
 const selected=useMemo(()=>presets.find(p=>p[0]===preset)!,[preset]);
 return <section id="technology" className="relative w-full border-y border-white/5 bg-white/[.015] py-24 md:py-32">
  <div className="mx-auto max-w-7xl px-5 sm:px-8">
   <div className="max-w-3xl"><div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/5 px-3 py-1.5 text-[10px] uppercase tracking-[.25em] text-purple-300"><Sparkles className="h-3.5 w-3.5"/> Operator toolkit</div><h2 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">More control. <span className="text-white/35">Less friction.</span></h2><p className="mt-4 text-sm leading-7 text-white/45 md:text-base">A cleaner control layer around SafariCast’s existing WebRTC workflow. Pick a transmission profile, inspect session health and discover operator-friendly utilities.</p></div>
   <div className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
    <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-5 backdrop-blur-2xl md:p-7"><div className="flex items-center justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[.25em] text-white/35">Transmission profiles</p><h3 className="mt-2 text-xl font-bold text-white">Adaptive quality presets</h3></div><SlidersHorizontal className="h-5 w-5 text-purple-300"/></div><div className="mt-6 grid gap-2 sm:grid-cols-2">{presets.map(p=><button key={p[0]} onClick={()=>setPreset(p[0])} className={`rounded-2xl border p-4 text-left transition ${preset===p[0]?'border-purple-400/35 bg-purple-500/10':'border-white/8 bg-black/20 hover:bg-white/5'}`}><p className="text-sm font-semibold text-white">{p[0]}</p><p className="mt-1 font-mono text-[10px] text-purple-300/70">{p[1]}</p><p className="mt-2 text-[11px] leading-5 text-white/35">{p[2]}</p></button>)}</div><div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4"><div className="flex items-center gap-3"><Gauge className="h-4 w-4 text-emerald-300"/><span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Selected</span><span className="ml-auto text-xs font-semibold text-white">{selected[0]} · {selected[1]}</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5"><motion.div animate={{width: preset==='Ultra'?'92%':preset==='Gaming'?'76%':preset==='Low bandwidth'?'42%':'64%'}} className="h-full rounded-full bg-purple-400"/></div></div></div>
    <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-5 backdrop-blur-2xl md:p-7"><div className="flex items-center justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[.25em] text-white/35">Session telemetry</p><h3 className="mt-2 text-xl font-bold text-white">Live health board</h3></div><Wifi className="h-5 w-5 text-emerald-300"/></div><div className="mt-6 grid grid-cols-2 gap-3">{[['Connection','Stable','emerald'],['Transport','WebRTC','blue'],['Security','DTLS/SRTP','purple'],['Mode','P2P','amber']].map(([a,b])=><div key={a} className="rounded-2xl border border-white/8 bg-black/20 p-4"><p className="font-mono text-[9px] uppercase tracking-widest text-white/30">{a}</p><p className="mt-2 text-sm font-semibold text-white">{b}</p></div>)}</div><div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4"><div className="flex items-center gap-2 text-xs text-white/55"><Radio className="h-4 w-4 text-purple-300"/> Peer signaling ready</div><div className="mt-3 flex gap-1">{Array.from({length:28}).map((_,i)=><motion.span key={i} animate={{opacity:[.2,.8,.2],height:[5,Math.random()*18+5,5]}} transition={{duration:1.2+Math.random(),repeat:Infinity,delay:i*.03}} className="w-1 rounded-full bg-purple-400/70"/>)}</div></div></div>
   </div>
   <div id="security" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tools.map(([title,desc,icon],i)=>{const I=icons[icon];return <motion.button key={title} onClick={()=>setActive(i)} whileHover={{y:-3}} className={`rounded-3xl border p-5 text-left transition ${active===i?'border-purple-400/25 bg-purple-500/7':'border-white/8 bg-white/[.025]'}`}><I className="h-5 w-5 text-purple-300"/><h4 className="mt-4 text-sm font-semibold text-white">{title}</h4><p className="mt-2 text-xs leading-5 text-white/35">{desc}</p></motion.button>})}</div>
  </div>
 </section>;
}
