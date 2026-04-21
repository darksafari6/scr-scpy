import { Share, Play } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginWithGoogle } from '../lib/auth';

export function Home() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  const joinRoom = (e: FormEvent) => {
    e.preventDefault();
    if (roomId.trim() !== '') {
      navigate(`/room/${roomId.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top right Navigation link */}
      <div className="absolute top-6 right-6 z-20">
        {!loading && (
          user ? (
            <button
               onClick={() => navigate('/dashboard')}
               className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-semibold tracking-wide backdrop-blur-md transition-colors"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
               onClick={loginWithGoogle}
               className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-sm font-semibold tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-colors"
            >
              Host a Screen
            </button>
          )
        )}
      </div>

      <div className="max-w-md w-full space-y-10 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-30 rounded-full animate-pulse"></div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 relative z-10 backdrop-blur-md">
                <Share className="w-12 h-12 text-blue-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-display uppercase tracking-tighter font-bold text-transparent bg-clip-text bg-gradient-to-tr from-white via-white to-white/40">
            SafariCast
          </h1>
          <p className="text-white/50 text-sm tracking-widest font-mono uppercase">
            Minimal P2P Streaming
          </p>
        </div>

        <div className="p-8 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl relative">
          <form onSubmit={joinRoom} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-widest text-white/40 ml-1">Join a Secure Stream</label>
              <input
                type="text"
                placeholder="ENTER ROOM ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-center text-xl tracking-[0.2em] font-mono focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 placeholder:text-white/10 transition-all font-bold uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={!roomId.trim()}
              className="w-full py-5 bg-white text-black hover:bg-gray-200 font-bold rounded-2xl text-sm uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed flex justify-center items-center gap-3"
            >
              <span>Connect</span>
              <Play className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
