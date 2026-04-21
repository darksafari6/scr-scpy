import { MonitorUp, MonitorX, Users, ArrowLeft, Loader2, Info, Copy, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useState } from 'react';

interface RoomProps {
  roomId: string;
  onLeave: () => void;
}

export function Room({ roomId, onLeave }: RoomProps) {
  const [copied, setCopied] = useState(false);
  const [shareAudio, setShareAudio] = useState(false);
  const {
    videoRef,
    role,
    isStreaming,
    activePeers,
    error,
    startBroadcasting,
    stopBroadcasting,
  } = useWebRTC(roomId);

  const isBroadcaster = role === 'broadcaster';

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Aesthetic background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md z-10 w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={onLeave}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Room ID</div>
              <div className="font-mono text-lg font-bold tracking-widest text-purple-400">{roomId}</div>
            </div>
            <button
              onClick={copyLink}
              title="Copy link"
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Users className="w-4 h-4 text-white/50" />
            <span className="text-sm font-mono text-white/80">{activePeers}</span>
          </div>

          {isBroadcaster ? (
            <button
              onClick={stopBroadcasting}
              className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-sm font-semibold uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <MonitorX className="w-4 h-4" />
              <span className="hidden sm:inline">Stop Share</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShareAudio(!shareAudio)}
                title={shareAudio ? "System audio sharing enabled" : "System audio sharing disabled"}
                className={`p-2 border rounded-xl transition-all ${shareAudio ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}
              >
                {shareAudio ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={() => startBroadcasting(shareAudio)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] rounded-xl text-sm font-semibold uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <MonitorUp className="w-4 h-4" />
                <span className="hidden sm:inline">Share Screen</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 relative">
        {error && (
          <div className="absolute top-8 p-4 bg-red-950/50 border border-red-500/50 rounded-xl text-red-200 flex items-center gap-3 max-w-lg w-full backdrop-blur-sm z-50">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="w-full max-w-6xl aspect-video relative rounded-2xl md:rounded-3xl overflow-hidden bg-[#111] border border-white/5 shadow-2xl flex items-center justify-center">
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls={!isBroadcaster} // Show standard browser controls to viewers for volume control
            muted={isBroadcaster} // Mute our own stream to avoid feedback locally
            className={`w-full h-full object-contain ${!isStreaming ? 'hidden' : ''}`}
          />

          {!isStreaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-6 bg-black/40 backdrop-blur-sm">
              {isBroadcaster ? (
                <>
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                  <p className="text-white/60 font-mono text-sm uppercase tracking-widest">
                    Initializing screen capture...
                  </p>
                </>
              ) : (
                <>
                  <div className="p-4 bg-white/5 rounded-full border border-white/10">
                    <MonitorUp className="w-12 h-12 text-white/30" strokeWidth={1} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl font-medium tracking-wide">Ready to connect</h2>
                    <p className="text-white/40 text-sm max-w-sm mx-auto">
                      Wait for the host to start screen sharing, or click "Share Screen" if you are the presenter.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-widest text-white/40 font-mono">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {isStreaming ? (isBroadcaster ? 'Live - Broadcasting' : 'Live - Viewing') : 'Secure WebRTC Connection Enabled'}
        </div>
      </main>
    </div>
  );
}
