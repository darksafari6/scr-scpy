import { Share, Play, Loader2, Video, Zap, Shield, MonitorSmartphone, ArrowRight, LayoutTemplate } from 'lucide-react';
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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 md:px-12 relative z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
            <Share className="w-5 h-5 text-purple-400" strokeWidth={2} />
          </div>
          <span className="text-xl font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            SafariCast
          </span>
        </div>
        
        <div>
          {!loading && (
            user ? (
              <button
                 onClick={() => navigate('/dashboard')}
                 className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold tracking-widest uppercase transition-colors flex items-center gap-2"
              >
                Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                 onClick={handleLogin}
                 disabled={isLoggingIn}
                 className="flex items-center gap-2 px-6 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/50 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Host Log In</span>
              </button>
            )
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center pt-20 px-4 relative z-10 w-full max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto space-y-6 mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3" /> Ultra-low latency WebRTC
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
            Share your screen with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              zero friction.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
            Crystal clear, peer-to-peer screen broadcasting directly from your browser. 
            No installations, no heavy servers, purely encrypted streams.
          </p>
        </motion.div>

        {/* Action Split Layout */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mb-32">
          
          {/* Join Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="p-8 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <MonitorSmartphone className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Join a Room</h2>
                <p className="text-white/40 text-sm">Enter the secure 6-character room code from your host to start viewing.</p>
              </div>
              <form onSubmit={joinRoom} className="space-y-4">
                <input
                  type="text"
                  placeholder="ROOM ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-xl tracking-[0.2em] font-mono focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 placeholder:text-white/20 transition-all font-bold uppercase"
                />
                <button
                  type="submit"
                  disabled={!roomId.trim()}
                  className="w-full py-4 bg-white text-black hover:bg-gray-200 font-bold rounded-xl text-sm uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  Connect <Play className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>

          {/* Host Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="p-8 bg-gradient-to-br from-purple-900/20 to-blue-900/10 backdrop-blur-xl border border-purple-500/20 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Video className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold mb-2">Host a Session</h2>
              <p className="text-white/40 text-sm">Create a persistent room, invite peers, and stream your displays in up to 4K resolution.</p>
            </div>
            
            <div className="relative z-10 mt-8">
              {!loading && (
                user ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] font-bold rounded-xl text-sm uppercase tracking-widest transition-all flex justify-center items-center gap-2"
                  >
                    Go To Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] font-bold rounded-xl text-sm uppercase tracking-widest transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                    Log In to Host
                  </button>
                )
              )}
            </div>
          </motion.div>

        </div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="grid md:grid-cols-3 gap-8 w-full max-w-6xl mb-24 border-t border-white/5 pt-16"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <LayoutTemplate className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium">Dynamic Surfaces</h3>
            <p className="text-white/40 text-sm leading-relaxed text-balance">
              Switch seamlessly between individual application windows or your entire physical monitor without dropping the connection.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium">Peer-to-Peer</h3>
            <p className="text-white/40 text-sm leading-relaxed text-balance">
              Traffic routes directly between you and your viewers utilizing ICE traversal. Maximum performance, zero intermediary bottlenecks.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-medium">Encrypted Streams</h3>
            <p className="text-white/40 text-sm leading-relaxed text-balance">
              Every WebRTC stream is fully end-to-end encrypted natively. Nobody can intercept your screen data.
            </p>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
