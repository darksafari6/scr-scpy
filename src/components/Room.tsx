import { MonitorUp, MonitorX, Users, ArrowLeft, Loader2, Info, Copy, CheckCircle2, Volume2, VolumeX, Mic, MicOff, LayoutTemplate, Monitor, X, PlaySquare, StopCircle, Focus, PictureInPicture, Video, AlertCircle, Settings2, MessageSquare, Send, Activity, Wifi } from 'lucide-react';
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
  const [shareAudio, setShareAudio] = useState(true);
  const [shareMic, setShareMic] = useState(localStorage.getItem('safaricast_mic') !== 'true');
  const [isTrueHost, setIsTrueHost] = useState<boolean | null>(null);
  const [showHostPrompt, setShowHostPrompt] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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
    changeQuality,
    messages,
    sendMessage,
    connectionQuality,
    networkStats
  } = useWebRTC(roomId);

  const isBroadcaster = role === 'broadcaster';

  // scroll chat to bottom when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'Excellent': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Good': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Fair': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Poor': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
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
          <div 
            onClick={copyLink}
            className="group flex items-center gap-3 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 pl-4 pr-2 py-1.5 rounded-2xl transition-all"
            title="Copy room link to share"
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-mono leading-none mb-1">Session Key</span>
              <span className="font-mono text-xl md:text-2xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 leading-none">{roomId}</span>
            </div>
            <div className="p-2 bg-white/5 group-hover:bg-purple-500/20 rounded-xl transition-colors">
              {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-purple-400/50 group-hover:text-purple-400" />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mr-4">
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

          <div className="flex items-center ml-4 pl-4 border-l border-white/10">
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-2 border rounded-xl transition-all relative ${isChatOpen ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'}`}
                title="Toggle Chat"
              >
                <MessageSquare className="w-5 h-5" />
                {messages.length > 0 && !isChatOpen && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-[#050505]" />
                )}
              </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden z-10 relative">
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto relative">
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

          {/* Connection Quality & Stats Indicator */}
          <div className="flex items-center gap-2 mt-6 mb-2">
            <div className={`px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center justify-center gap-2 ${getQualityColor()} transition-colors shadow-lg`}>
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-mono tracking-widest font-bold">Network: {connectionQuality}</span>
            </div>
            {isStreaming && networkStats.latency > 0 && (
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 text-white/60 transition-colors shadow-lg group relative cursor-help">
                <Wifi className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold">
                  {networkStats.latency}ms
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-4 py-3 bg-black/90 border border-white/10 rounded-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl backdrop-blur-md">
                  <div className="flex flex-col gap-2 font-mono uppercase tracking-wider text-[10px]">
                    <div className="flex justify-between gap-6"><span className="text-white/40">Latency</span><span className="text-white">{networkStats.latency} ms ping</span></div>
                    <div className="flex justify-between gap-6"><span className="text-white/40">Bandwidth</span><span className="text-white">{networkStats.bitrate > 1000 ? (networkStats.bitrate / 1000).toFixed(1) + ' Mbps' : networkStats.bitrate + ' Kbps'}</span></div>
                  </div>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-b border-r border-white/10 rotate-45 transform"></div>
                </div>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-white/40 font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {isStreaming ? (isBroadcaster ? 'Live - Broadcasting' : 'Live - Viewing') : 'Secure WebRTC Connection Enabled'}
          </div>
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <aside className="w-80 border-l border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md flex flex-col h-full z-20 shrink-0">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold uppercase tracking-widest text-sm text-white/80 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" /> Room Chat
              </h3>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-white/30 text-xs font-mono uppercase tracking-widest mt-10">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.senderId === 'Me' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider mb-1 px-1">{msg.senderId}</span>
                    <div className={`px-3 py-2 rounded-2xl max-w-[90%] text-sm ${msg.senderId === 'Me' ? 'bg-blue-600/50 border border-blue-500/20 text-blue-50 rounded-tr-sm' : 'bg-white/10 border border-white/5 text-white/90 rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                const senderName = user?.displayName || user?.email?.split('@')[0] || (role === 'broadcaster' ? 'Host' : 'Viewer');
                sendMessage(chatInput, senderName);
                setChatInput('');
              }}
              className="p-4 border-t border-white/10 bg-black/50"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type message..."
                  className="w-full bg-[#111] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/30 text-white"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="absolute right-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </aside>
        )}
      </main>
    </div>
  );
}
