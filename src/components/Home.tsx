import { Share, Play, Loader2, Video, Zap, Shield, MonitorSmartphone, ArrowRight, LayoutTemplate, Cpu, Globe, Lock, Server, Activity, AlertTriangle } from 'lucide-react';
import { useState, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginWithGoogle } from '../lib/auth';
import { motion } from 'motion/react';

export function Home() {
  const [roomId, setRoomId] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const authInProgress = useRef(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  const joinRoom = (e: FormEvent) => {
    e.preventDefault();
    if (roomId.trim() !== '') {
      navigate(`/room/${roomId.trim().toUpperCase()}`);
    }
  };

  const handleLogin = async () => {
    if (authInProgress.current) return;
    authInProgress.current = true;
    setIsLoggingIn(true);
    
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-blocked') {
        alert('Popup blocked by your browser. Please allow popups for this site and try again.');
      } else if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        alert('Failed to sign in securely. Please ensure popups are allowed for this site and try again.');
      }
    } finally {
      authInProgress.current = false;
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-purple-500/30">
      {/* Dynamic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#020202]">
        {/* Animated Blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            opacity: [0.03, 0.08, 0.03],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px] mix-blend-screen" 
        />
        
        {/* Data Packets Animation (Overlay) */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <svg className="w-full h-full">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.03"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Dynamic Packet Lines */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: "-100%", y: `${15 * (i + 1)}%` }}
            animate={{ x: "200%" }}
            transition={{ 
              duration: 8 + i * 2, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 3
            }}
            className="absolute h-[1px] w-64 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent blur-[1px]"
          />
        ))}

        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 md:p-6 lg:px-12 relative z-20 border-b border-white/5 bg-[#020202]/70 backdrop-blur-2xl sticky top-0">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="p-2 bg-gradient-to-br from-white/10 to-transparent rounded-xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
            <Share className="w-5 h-5 md:w-6 md:h-6 text-purple-400" strokeWidth={2} />
          </motion.div>
          <span className="text-lg md:text-xl font-bold tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
            SafariCast
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-8 mr-8">
            {['Architecture', 'Compliance', 'Specs', 'Pricing'].map((item) => (
              <a key={item} href="#" className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
          {!loading && (
            user ? (
              <button
                 onClick={() => navigate('/dashboard')}
                 className="px-4 py-2 md:px-6 md:py-2.5 bg-gradient-to-br from-white/10 to-transparent hover:from-white/15 hover:to-transparent border border-white/10 text-white rounded-xl text-xs md:text-sm font-semibold tracking-widest uppercase transition-all flex items-center gap-2 shadow-2xl"
              >
                Dashboard <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            ) : (
              <button
                 onClick={handleLogin}
                 disabled={isLoggingIn}
                 className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs md:text-sm font-semibold tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
              >
                {isLoggingIn ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : null}
                <span>Operator Auth</span>
              </button>
            )
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center pt-24 md:pt-32 px-4 relative z-10 w-full max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full max-w-5xl mx-auto space-y-8 mb-32"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] backdrop-blur-xl shadow-2xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            NETWORK PROTOCOL STABLE • v2.4.14
          </motion.div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95]">
            The New Standard in <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/20">
              Visual Logic.
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-white/40 max-w-4xl mx-auto font-light leading-relaxed px-4">
            A high-performance P2P broadcasting ecosystem designed for low-latency synchronization. SafariCast eliminates server overhead, ensuring your data stream remains private, unmetered, and instantaneous.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button className="px-8 py-4 bg-white text-black font-bold rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-white/90 transition-all shadow-white/10 shadow-2xl">Get Started</button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all">Protocol Whitepaper</button>
          </div>
        </motion.div>

        {/* Action Split Layout - 4D Box Style */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 w-full max-w-6xl mb-48">
          
          {/* Join Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1 }}
            className="group relative p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent transition-all hover:scale-[1.02]"
          >
            <div className="p-8 md:p-12 bg-[#080808] border border-white/5 rounded-[2.4rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] h-full flex flex-col relative overflow-hidden backdrop-blur-3xl">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] group-hover:bg-purple-500/10 transition-colors" />
              <div className="relative z-10 flex flex-col h-full space-y-12">
                <div className="flex items-center justify-between">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                    <Play className="w-6 h-6 text-white/50" />
                  </div>
                  <span className="text-[10px] font-mono text-white/20 tracking-widest uppercase">BRIDGE INGRESS</span>
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Active Node Join</h2>
                  <p className="text-white/30 text-base leading-relaxed font-light">Input the session synchronization key to initialize the peer handshake and establish a direct secure vision tunnel.</p>
                </div>
                <form onSubmit={joinRoom} className="space-y-6 pt-6 mt-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ENTER ROOM ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-6 text-2xl md:text-3xl tracking-[0.4em] font-mono focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 placeholder:text-white/5 transition-all font-black uppercase text-center shadow-inner"
                    />
                    <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
                  </div>
                  <button
                    type="submit"
                    disabled={!roomId.trim()}
                    className="w-full py-6 bg-white text-black hover:bg-white/90 font-black rounded-2xl text-xs uppercase tracking-[0.3em] transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex justify-center items-center gap-4 shadow-white/5 shadow-2xl group-active:scale-95"
                  >
                    ESTABLISH LINK <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Host Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="group relative p-1 rounded-[2.5rem] bg-gradient-to-br from-purple-500/20 to-transparent transition-all hover:scale-[1.02]"
          >
            <div className="p-8 md:p-12 bg-gradient-to-br from-[#0a0610] to-[#050505] border border-purple-500/20 rounded-[2.4rem] shadow-[0_30px_100px_rgba(168,85,247,0.15)] h-full flex flex-col relative overflow-hidden backdrop-blur-3xl">
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] group-hover:bg-blue-500/10 transition-colors" />
              <div className="relative z-10 flex flex-col h-full space-y-12">
                <div className="flex items-center justify-between">
                  <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                    <LayoutTemplate className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-[10px] font-mono text-purple-400/30 tracking-widest uppercase">BROADCAST EGRESS</span>
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">System Deployment</h2>
                  <p className="text-purple-100/30 text-base leading-relaxed font-light">Provision an encrypted signaling room. Host multiple viewing nodes with hardware-accelerated 4K encoding and zero bitrate caps.</p>
                </div>
                
                <div className="relative z-10 pt-6 mt-auto">
                  {!loading && (
                    user ? (
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl text-xs uppercase tracking-[0.3em] transition-all flex justify-center items-center gap-4 shadow-purple-500/20 shadow-2xl group-active:scale-95"
                      >
                        COMMAND CENTER <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    ) : (
                      <button
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className="w-full py-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-2xl text-xs uppercase tracking-[0.3em] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-4 group-active:scale-95 shadow-2xl"
                      >
                        {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4 text-purple-400" />}
                        OPERATOR AUTH
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl mb-48 border-y border-white/5 py-12">
          {[
            { label: 'Latency', value: '< 40ms', color: 'text-purple-400' },
            { label: 'Encrypted', value: 'DTLS 2.0', color: 'text-blue-400' },
            { label: 'Payload', value: '4K HIGH', color: 'text-emerald-400' },
            { label: 'Uptime', value: '99.99%', color: 'text-white' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center md:text-left"
            >
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
              <div className={`text-2xl md:text-3xl font-black tracking-tight ${stat.color}`}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Infrastructure Deep Dive */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="w-full max-w-6xl mb-48 space-y-24"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Modern <br/>Infrastructure.</h2>
              <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed">We stripped away the heavy layers of centralized streaming to build on core WebRTC primitives for a hyper-resilient network.</p>
            </div>
            <div className="flex items-center gap-4 text-purple-400 text-xs font-mono uppercase tracking-[0.3em]">
              <div className="w-12 h-[1px] bg-purple-500/30" /> SC RE-ARCH V2
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: 'Decentralized Mesh', desc: 'Direct IP-to-IP data routing bypasses cloud ingest centers for maximum raw throughput.', color: 'text-blue-400', bg: 'hover:border-blue-500/20 hover:bg-blue-500/5' },
              { icon: Cpu, title: 'Bypass-Level Perf', desc: 'Native GPU offloading for VP9/AV1 encoding ensures minimal system footprint during sessions.', color: 'text-purple-400', bg: 'hover:border-purple-500/20 hover:bg-purple-500/5' },
              { icon: Lock, title: 'Quantum Ready', desc: 'Mandatory SRTP and DTLS key-exchange per frame, protecting every visual packet from intrusion.', color: 'text-emerald-400', bg: 'hover:border-emerald-500/20 hover:bg-emerald-500/5' },
              { icon: Activity, title: 'Dynamic Bitrate', desc: 'Our feedback-loop allows for infinite resolution scaling based on your active physical connection.', color: 'text-red-400', bg: 'hover:border-red-500/20 hover:bg-red-500/5' },
              { icon: Server, title: 'Signal Isolation', desc: 'Websocket-only signaling keeps our servers blind to your data, strictly metadata-neutral.', color: 'text-amber-400', bg: 'hover:border-amber-500/20 hover:bg-amber-500/5' },
              { icon: Shield, title: 'Fault Tolerant', desc: 'No central failure point. If the world goes dark, your local P2P tunnels continue to resonate.', color: 'text-white', bg: 'hover:border-white/20 hover:bg-white/5' },
            ].map((feature, i) => (
              <div key={i} className={`group bg-white/[0.01] border border-white/5 p-10 rounded-[2.5rem] transition-all duration-500 ${feature.bg} relative overflow-hidden`}>
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <feature.icon className={`w-10 h-10 ${feature.color} mb-8 transition-transform group-hover:scale-110`} />
                <h3 className="text-xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-white/30 text-sm leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mid-Content Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full max-w-6xl mb-48 p-12 md:p-20 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 rounded-[3rem] relative overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter">Ready for the Future?</h2>
            <p className="text-white/50 text-base md:text-xl max-w-2xl mx-auto font-light">Join the thousands of developers and tech-leads who rely on our secure tunneling engine for critical presentations.</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleLogin} className="px-10 py-5 bg-white text-black font-bold rounded-2xl text-xs uppercase tracking-widest shadow-2xl">Start Free Deployment</button>
            </div>
          </div>
        </motion.div>

        {/* Security & Compliance Warning */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full max-w-5xl mb-48 p-10 md:p-16 bg-red-950/10 border border-red-500/20 rounded-[3rem] relative overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute right-0 top-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="flex flex-col lg:flex-row gap-10 lg:items-center relative z-10">
            <div className="p-6 bg-red-500/10 rounded-3xl shrink-0 self-start border border-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-red-100 tracking-tight flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                RESTRICTED PROTOCOL NOTICE
              </h3>
              <div className="space-y-4 font-mono text-[11px] md:text-xs text-red-100/40 uppercase tracking-widest leading-relaxed">
                <p>
                  BY ACCESSING THE INFRASTRUCTURE, YOU ACKNOWLEDGE THE FOLLOWING CONDITIONS:
                </p>
                <p className="text-red-100/60 transition-colors hover:text-red-100">
                  • ALL SIGNALING ASSETS ARE EPHEMERAL AND NOT STORED FOR LONG-TERM AUDIT.<br/>
                  • UNAUTHORIZED PORT-MAPPING OR HANDSHAKE INTERCEPTION IS AUTOMATICALLY LOGGED.<br/>
                  • DEVICE HARDWARE SIGNATURES ARE REQUIRED FOR BROADCASTER TOKEN VALIDATION.<br/>
                  • ANY VIOLATION OF P2P STANDARDS RESULTS IN IMMEDIATE SEGMENT DE-AUTH.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-4 text-red-500 text-[10px] font-bold tracking-[0.4em]">
                SYS_VERIFIED • ENFORCE_AES_256
              </div>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#010101] pt-24 pb-12 px-8 relative z-10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="space-y-6 max-w-xs">
              <div className="flex items-center gap-3">
                <Share className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold tracking-[0.4em] uppercase text-white">SafariCast</span>
              </div>
              <p className="text-white/30 text-xs font-light leading-relaxed">The premier choice for unmetered, secure, peer-to-peer screen broadcasting for high-stakes environments.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="space-y-4">
                <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Protocol</div>
                <ul className="space-y-2 text-xs text-white/40 hover:text-white transition-colors">
                  <li><a href="#">Whitepaper</a></li>
                  <li><a href="#">Security Audit</a></li>
                  <li><a href="#">Network Status</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Connect</div>
                <ul className="space-y-2 text-xs text-white/40 hover:text-white transition-colors">
                  <li><a href="#">Github</a></li>
                  <li><a href="#">Documentation</a></li>
                  <li><a href="#">API Ingress</a></li>
                </ul>
              </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5">
           <div className="text-white/20 text-[10px] font-mono tracking-widest text-center md:text-left">
             <p>&copy; 2026 SAFARICAST INFRASTRUCTURE. OPERATED BY DEFENSE MEDIA GROUP.</p>
           </div>
           <div className="flex items-center gap-8">
             <a href="#" className="text-white/20 hover:text-white text-[10px] uppercase tracking-widest transition-colors font-mono">Priv_Policy</a>
             <a href="#" className="text-white/20 hover:text-white text-[10px] uppercase tracking-widest transition-colors font-mono">Eula_Terms</a>
           </div>
         </div>
      </footer>
    </div>
  );
}
