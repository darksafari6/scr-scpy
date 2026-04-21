import { Share } from 'lucide-react';
import { useState, FormEvent } from 'react';

export function Home({ onJoinRoom }: { onJoinRoom: (id: string) => void }) {
  const [roomId, setRoomId] = useState('');

  const createRoom = () => {
    // Generate a simple readable room ID like a 6-digit hex or words
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    onJoinRoom(newRoomId);
  };

  const joinRoom = (e: FormEvent) => {
    e.preventDefault();
    if (roomId.trim() !== '') {
      onJoinRoom(roomId.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full space-y-8 relative">
        {/* Glow effect backdrops */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-600/20 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/20 rounded-full blur-[80px] -z-10" />

        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Share className="w-10 h-10 text-purple-400" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
            SafariCast
          </h1>
          <p className="text-white/50 text-sm tracking-wide uppercase">
            Minimal WebRTC Screen Sharing
          </p>
        </div>

        <div className="p-8 bg-[#111] border border-white/10 rounded-3xl shadow-2xl space-y-6">
          <button 
            onClick={createRoom}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          >
            Start Broadcasting
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="px-4 text-white/40 bg-[#111]">Or Join Room</span>
            </div>
          </div>

          <form onSubmit={joinRoom} className="space-y-4">
            <input
              type="text"
              placeholder="ENTER ROOM ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-center text-xl tracking-[0.2em] uppercase font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-white/20 transition-all"
            />
            <button
              type="submit"
              disabled={!roomId.trim()}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-sm uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
              Join as Viewer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
