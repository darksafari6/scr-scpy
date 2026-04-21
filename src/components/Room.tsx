import { MonitorUp, MonitorX, Users, ArrowLeft, Loader2, Info, Copy, CheckCircle2, Volume2, VolumeX, Mic, MicOff, LayoutTemplate, Monitor, X, PlaySquare, StopCircle, Focus, PictureInPicture, Video, AlertCircle, Settings2 } from 'lucide-react';
import { useWebRTC, QualityPreset } from '../hooks/useWebRTC';
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [shareAudio, setShareAudio] = useState(false);
  const [shareMic, setShareMic] = useState(false);
  const [isTrueHost, setIsTrueHost] = useState<boolean | null>(null);
  const [showHostPrompt, setShowHostPrompt] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  if (!roomId) return null;

  useEffect(() => {
    async function checkHost() {
      if (!user) {
        setIsTrueHost(false);
        return;
      }
      try {
        const roomDoc = await getDoc(doc(db, 'rooms', roomId!));
        if (roomDoc.exists() && roomDoc.data().hostId === user.uid) {
          setIsTrueHost(true);
        } else {
          setIsTrueHost(false);
        }
      } catch (e) {
        console.error("Could not verify host status", e);
        setIsTrueHost(false);
      }
    }
    checkHost();
  }, [roomId, user]);

  const {
    videoRef,
    role,
    isStreaming,
    activePeers,
    error,
    clearError,
    startBroadcasting,
    stopBroadcasting,
    isMicMuted,
    toggleMic,
    displaySurface,
    switchDisplaySurface,
    isRecording,
    startRecording,
    stopRecording,
    quality,
    changeQuality
  } = useWebRTC(roomId);

  const isBroadcaster = role === 'broadcaster';

  const handleShareClick = () => {
    if (isTrueHost) {
      startBroadcasting(shareAudio, shareMic);
    } else {
      setShowHostPrompt(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    stopBroadcasting();
    navigate('/');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const togglePiP = () => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else if (videoRef.current) {
      videoRef.current.requestPictureInPicture();
    }
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
            onClick={handleLeave}
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
            <div className="flex items-center gap-2">
              <div className="relative group mr-2">
                <button className="p-2 border rounded-xl transition-all bg-white/5 text-white/80 border-white/10 hover:bg-white/10 flex items-center gap-1" title="Quality Settings">
                  <Settings2 className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-36 bg-black/90 backdrop-blur border border-white/10 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2 flex flex-col gap-1">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest px-2 py-1 font-mono">Stream Quality</div>
                    {(['low', 'medium', 'high', 'source'] as QualityPreset[]).map(q => (
                      <button
                        key={q}
                        onClick={() => changeQuality(q)}
                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${quality === q ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-white/70'}`}
                      >
                        {q.charAt(0).toUpperCase() + q.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={toggleMic}
                className={`p-2 border rounded-xl transition-all mr-2 ${!isMicMuted ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30'}`}
                title={!isMicMuted ? "Mute Microphone" : "Unmute Microphone"}
              >
                {!isMicMuted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => switchDisplaySurface(displaySurface === 'monitor' ? 'window' : 'monitor')}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-white/80 mr-2"
                title={`Switch to ${displaySurface === 'monitor' ? 'Window' : 'Entire Screen'}`}
              >
                {displaySurface === 'monitor' ? <LayoutTemplate className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              </button>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-semibold uppercase tracking-widest transition-all mr-4 shadow-lg ${isRecording ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'}`}
                title={isRecording ? 'Stop Recording locally' : 'Start Recording locally'}
              >
                {isRecording ? <StopCircle className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                <span className="hidden xl:inline">{isRecording ? 'REC' : 'Record'}</span>
              </button>

              <button
                onClick={stopBroadcasting}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-sm font-semibold uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <MonitorX className="w-4 h-4" />
                <span className="hidden sm:inline">Stop Share</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShareMic(!shareMic)}
                title={shareMic ? "Microphone sharing enabled" : "Microphone sharing disabled"}
                className={`p-2 border rounded-xl transition-all ${shareMic ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}
              >
                {shareMic ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShareAudio(!shareAudio)}
                title={shareAudio ? "System audio sharing enabled" : "System audio sharing disabled"}
                className={`p-2 border rounded-xl transition-all ${shareAudio ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}
              >
                {shareAudio ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={handleShareClick}
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
          <div className="absolute top-8 p-4 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 flex items-start gap-3 max-w-xl w-full backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.2)] z-50">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
            <p className="text-sm font-medium leading-relaxed flex-1">{error}</p>
            <button 
              onClick={clearError}
              className="p-1 hover:bg-white/10 rounded-md transition-colors flex-shrink-0 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div ref={videoContainerRef} className="w-full max-w-6xl aspect-video relative rounded-2xl md:rounded-3xl overflow-hidden bg-[#111] border border-white/5 shadow-2xl flex items-center justify-center group">
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls={!isBroadcaster} // Show standard browser controls to viewers for volume control
            muted={isBroadcaster} // Mute our own stream to avoid feedback locally
            className={`w-full h-full object-contain ${!isStreaming ? 'hidden' : ''}`}
          />

          {!isBroadcaster && isStreaming && (
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={togglePiP} className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur text-white rounded-lg transition-colors border border-white/10" title="Picture in Picture">
                <PictureInPicture className="w-5 h-5" />
              </button>
              <button onClick={toggleFullscreen} className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur text-white rounded-lg transition-colors border border-white/10" title="Fullscreen">
                <Focus className="w-5 h-5" />
              </button>
            </div>
          )}

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
                    <h2 className="text-xl md:text-2xl font-medium tracking-wide">
                      {showHostPrompt ? "Only the host can present" : "Ready to connect"}
                    </h2>
                    <p className="text-white/40 text-sm max-w-sm mx-auto">
                      {showHostPrompt 
                        ? "You are currently joined as a Viewer. If you want to share a screen, please return to your Dashboard to create a new session." 
                        : "Wait for the host to start screen sharing, or click \"Share Screen\" if you are the host."}
                    </p>
                    {showHostPrompt && !user && (
                      <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/50 rounded-xl text-xs uppercase font-bold tracking-widest transition-all">
                        Log In To Host
                      </button>
                    )}
                    {showHostPrompt && user && (
                      <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/50 rounded-xl text-xs uppercase font-bold tracking-widest transition-all">
                        Go To Dashboard
                      </button>
                    )}
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
