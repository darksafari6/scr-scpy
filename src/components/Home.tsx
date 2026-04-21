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
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] bg-indigo-500/5 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 md:p-6 lg:px-12 relative z-20 border-b border-white/5 bg-[#020202]/50 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Share className="w-5 h-5 md:w-6 md:h-6 text-purple-400" strokeWidth={2} />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            SafariCast
          </span>
        </div>
        
        <div>
          {!loading && (
            user ? (
              <button
                 onClick={() => navigate('/dashboard')}
                 className="px-4 py-2 md:px-6 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs md:text-sm font-semibold tracking-widest uppercase transition-colors flex items-center gap-2"
              >
                Dashboard <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            ) : (
              <button
                 onClick={handleLogin}
                 disabled={isLoggingIn}
                 className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/50 rounded-xl text-xs md:text-sm font-semibold tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : null}
                <span>Host Log In</span>
              </button>
            )
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center pt-16 md:pt-24 px-4 relative z-10 w-full max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center w-full max-w-5xl mx-auto space-y-6 md:space-y-8 mb-20 md:mb-32"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/5 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <Zap className="w-3 h-3" /> Ultra-low latency WebRTC Core v2.0
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1] md:leading-[1.1]">
            Share your screen with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-500 filter drop-shadow-lg">
              absolute zero friction.
            </span>
          </h1>
          <p className="text-base md:text-xl text-white/50 max-w-3xl mx-auto font-light leading-relaxed px-4">
            A hardened, pure peer-to-peer visual broadcasting network. Eliminate the middleman, protect your data, and deliver maximum bitrates directly from browser to browser.
          </p>
        </motion.div>

        {/* Action Split Layout */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl mb-32 md:mb-48">
          
          {/* Join Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="p-6 md:p-10 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
              <MonitorSmartphone className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between space-y-8">
              <div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                  <Play className="w-5 h-5 text-white/70" />
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-3 tracking-tight">Join a Room</h2>
                <p className="text-white/40 text-sm leading-relaxed">Enter the secure 6-character room code provided by your host to instantly synchronize and begin viewing their stream.</p>
              </div>
              <form onSubmit={joinRoom} className="space-y-4 pt-4 mt-auto">
                <input
                  type="text"
                  placeholder="ROOM ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-xl md:text-2xl tracking-[0.3em] font-mono focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 placeholder:text-white/10 transition-all font-bold uppercase text-center md:text-left shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!roomId.trim()}
                  className="w-full py-5 bg-white text-black hover:bg-gray-200 font-bold rounded-2xl text-sm uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  Connect Bridge <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>

          {/* Host Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="p-6 md:p-10 bg-gradient-to-br from-purple-900/20 to-blue-900/10 backdrop-blur-2xl border border-purple-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(168,85,247,0.1)] relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/50 transition-all duration-500 disabled:opacity-50"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
              <Video className="w-48 h-48 text-purple-400" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
                <LayoutTemplate className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-3 tracking-tight">Deploy a Session</h2>
              <p className="text-purple-100/50 text-sm leading-relaxed">Establish a persistent, encrypted room on the network. Invite peers and broadcast displays in native 1080p to 4K resolutions with unmetered bandwidth.</p>
            </div>
            
            <div className="relative z-10 pt-8 mt-auto">
              {!loading && (
                user ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] font-bold rounded-2xl text-sm uppercase tracking-widest transition-all flex justify-center items-center gap-3"
                  >
                    Enter Operations Control <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] font-bold rounded-2xl text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                  >
                    {isLoggingIn ? <Loader2 className="w-4 h-4 animation-spin" /> : <div className="w-4 h-4 rounded-full border-2 border-white border-t-white/30 animate-spin mr-1 hidden"/>}
                    Authenticate to Host
                  </button>
                )
              )}
            </div>
          </motion.div>
        </div>

        {/* Informative Boxes / Infrastructure Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-6xl mb-32 md:mb-48 space-y-12"
        >
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Infrastructure.</h2>
            <p className="text-white/40 text-sm md:text-base leading-relaxed">We stripped away the heavy proprietary streaming protocols and built directly on standard WebRTC primitives. The result is a hyper-fast, decentralized topology.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors">
              <Globe className="w-8 h-8 text-blue-400 mb-6" />
              <h3 className="text-lg font-bold mb-3 tracking-wide">Decentralized Mesh</h3>
              <p className="text-white/40 text-sm leading-relaxed">Unlike Twitch or Zoom, SafariCast does not route your heavy video data through a central server. Video flows directly from your IP address to your viewer's IP address.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors">
              <Cpu className="w-8 h-8 text-purple-400 mb-6" />
              <h3 className="text-lg font-bold mb-3 tracking-wide">Hardware Accelerated</h3>
              <p className="text-white/40 text-sm leading-relaxed">By hooking directly into Chromium and WebKit media APIs, stream encoding is automatically offloaded to your device's native GPU, drastically lowering CPU usage.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors">
              <Lock className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-lg font-bold mb-3 tracking-wide">DTLS/SRTP Encryption</h3>
              <p className="text-white/40 text-sm leading-relaxed">All active sessions enforce mandatory Datagram Transport Layer Security (DTLS) and Secure Real-time Transport Protocol (SRTP). Traffic cannot be read in transit.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors">
              <Activity className="w-8 h-8 text-red-400 mb-6" />
              <h3 className="text-lg font-bold mb-3 tracking-wide">True Source Quality</h3>
              <p className="text-white/40 text-sm leading-relaxed">Bypass artificial quality downgrades. If your bandwidth and hardware support pushing 4K streams at 60fps, the engine allows you to broadcast without compression caps.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors">
              <Server className="w-8 h-8 text-amber-400 mb-6" />
              <h3 className="text-lg font-bold mb-3 tracking-wide">Ephemeral Signaling</h3>
              <p className="text-white/40 text-sm leading-relaxed">Our signaling server uses lightweight WebSockets solely to exchange SDP handshakes. Once the peer connection is established, the centralized server steps completely out of the way.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 border border-purple-500/20 p-8 rounded-3xl hover:border-purple-500/40 transition-colors relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                <Zap className="w-32 h-32" />
              </div>
              <Shield className="w-8 h-8 text-white mb-6" />
              <h3 className="text-lg font-bold mb-3 tracking-wide text-white">Always Available</h3>
              <p className="text-white/60 text-sm leading-relaxed">Built for resilience. Because the platform relies on P2P connections, massive traffic spikes will never crash active rooms. The network scales automatically.</p>
            </div>
          </div>
        </motion.div>

        {/* Security & Compliance Warning */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full max-w-4xl mb-32 p-8 md:p-12 bg-red-950/20 border border-red-500/20 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex flex-col md:flex-row gap-6 md:items-start relative z-10">
            <div className="p-4 bg-red-500/10 rounded-2xl shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-50 tracking-tight">Security & Compliance Notice</h3>
              <p className="text-red-200/60 text-sm leading-relaxed">
                <strong className="text-red-200 font-semibold uppercase tracking-wider text-xs block mb-1">WARNING: RESTRICTED SYSTEM</strong>
                Unauthorized access to SafariCast routing servers or attempts to intercept signaling traffic is strictly prohibited. This system is monitored up to the edge protocols. 
                Any malicious activity, including brute forcing room codes, executing unauthorized signaling handshakes, or exploiting STUN/TURN relays will result in permanent hardware-level bans and potential legal action.
              </p>
              <p className="text-red-200/60 text-sm leading-relaxed">
                By clicking "Host Log In" or "Connect Bridge", you agree to our Terms of Service and acknowledge that you are fully responsible for the data transmitted through your P2P tunnel.
              </p>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#020202] pt-16 pb-8 px-6 relative z-10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-3">
             <Share className="w-5 h-5 text-white/30" />
             <span className="text-white/30 font-bold tracking-widest uppercase text-sm">SafariCast</span>
           </div>
           
           <div className="text-white/20 text-xs font-mono tracking-widest text-center md:text-right">
             <p className="mb-2">ALL SYSTEMS OPERATIONAL.</p>
             <p>&copy; 2026 SAFARICAST INFRASTRUCTURE. ALL RIGHTS RESERVED.</p>
           </div>
         </div>
      </footer>
    </div>
  );
}
