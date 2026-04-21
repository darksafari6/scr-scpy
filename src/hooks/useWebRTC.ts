import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export type QualityPreset = 'low' | 'medium' | 'high' | 'source';

export const QUALITY_CONSTRAINTS: Record<QualityPreset, MediaTrackConstraints> = {
  low: { width: { max: 1280 }, height: { max: 720 }, frameRate: { max: 15 } },
  medium: { width: { ideal: 1920, max: 1920 }, height: { ideal: 1080, max: 1080 }, frameRate: { ideal: 30, max: 30 } },
  high: { width: { ideal: 2560, max: 3840 }, height: { ideal: 1440, max: 2160 }, frameRate: { ideal: 60, max: 60 } },
  source: { width: { ideal: 1920, max: 3840 }, height: { ideal: 1080, max: 2160 }, frameRate: { ideal: 30, max: 60 } }
};

export const QUALITY_BITRATES: Record<QualityPreset, number> = {
  low: 500_000,       // 500 kbps
  medium: 2_500_000,  // 2.5 Mbps
  high: 8_000_000,    // 8 Mbps
  source: 15_000_000, // 15 Mbps
};

export function useWebRTC(roomId: string) {
  const [role, setRole] = useState<'viewer' | 'broadcaster'>('viewer');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activePeers, setActivePeers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [displaySurface, setDisplaySurface] = useState<'monitor' | 'window'>('monitor');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quality, setQuality] = useState<QualityPreset>(() => {
    return (localStorage.getItem('safaricast_quality') as QualityPreset) || 'source';
  });
  const [connectionQuality, setConnectionQuality] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unknown'>('Unknown');
  const [networkStats, setNetworkStats] = useState({ latency: 0, bitrate: 0 });

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const lastBytesRef = useRef(new Map<string, { timestamp: number, bytes: number }>());
  const localStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const roleRef = useRef<'viewer' | 'broadcaster'>('viewer');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const updateRole = useCallback((newRole: 'viewer' | 'broadcaster') => {
    roleRef.current = newRole;
    setRole(newRole);
  }, []);

  const createPeerConnection = (targetId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', targetId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (roleRef.current === 'viewer' && videoRef.current) {
        // Set remote stream to viewer's video element
        if (videoRef.current.srcObject !== event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setIsStreaming(true);
        }
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${targetId}:`, pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        if (roleRef.current === 'viewer') {
          setError('Connection dropped or failed. The host may have disconnected, or a firewall/VPN might be blocking WebRTC traffic.');
        }
      } else if (pc.connectionState === 'connected') {
        if (roleRef.current === 'viewer') {
          setError(null);
        }
      }

      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        peerConnectionsRef.current.delete(targetId);
        setActivePeers(peerConnectionsRef.current.size);
        if (roleRef.current === 'viewer') {
          setIsStreaming(false);
          if (videoRef.current) videoRef.current.srcObject = null;
        }
      }
    };

    pc.oniceconnectionstatechange = () => {
      switch(pc.iceConnectionState) {
        case 'completed': 
          setConnectionQuality('Excellent');
          break;
        case 'connected':
          setConnectionQuality('Good');
          break;
        case 'checking':
          setConnectionQuality('Fair');
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          setConnectionQuality('Poor');
          break;
        default:
          setConnectionQuality('Unknown');
      }

      if (pc.iceConnectionState === 'failed') {
        if (roleRef.current === 'viewer') {
          setError('Network routing failed (ICE error). Try disabling any active VPNs, Proxies, or strict Ad-blockers.');
        }
      }
    };

    // If we are the broadcaster, add local stream to the connection
    if (isInitiator && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        const sender = pc.addTrack(track, localStreamRef.current!);
        if (track.kind === 'video') {
           const params = sender.getParameters();
           if (!params.encodings) {
             params.encodings = [{}];
           }
           if (params.encodings.length > 0) {
             params.encodings[0].maxBitrate = QUALITY_BITRATES[quality];
             sender.setParameters(params).catch(e => console.error("Failed to set initial bitrate", e));
           }
        }
      });
    }

    peerConnectionsRef.current.set(targetId, pc);
    setActivePeers(peerConnectionsRef.current.size);
    return pc;
  };

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to signaling server');
      // Always join as viewer initially unless we upgrade
      socket.emit('join-room', roomId, roleRef.current);
    });

    socket.on('viewer-joined', async (viewerId: string) => {
      if (roleRef.current === 'broadcaster') {
        // We are broadcasting, create connection and offer to the viewer
        const pc = createPeerConnection(viewerId, true);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', viewerId, offer);
        } catch (err) {
          console.error('Error creating offer:', err);
        }
      }
    });

    socket.on('offer', async (broadcasterId: string, offer: RTCSessionDescriptionInit) => {
      if (roleRef.current === 'viewer') {
        const pc = createPeerConnection(broadcasterId, false);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', broadcasterId, answer);
        } catch (err) {
          console.error('Error handling offer:', err);
        }
      }
    });

    socket.on('answer', async (viewerId: string, answer: RTCSessionDescriptionInit) => {
      const pc = peerConnectionsRef.current.get(viewerId);
      if (pc && roleRef.current === 'broadcaster') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error setting remote description:', err);
        }
      }
    });

    socket.on('ice-candidate', async (peerId: string, candidate: RTCIceCandidateInit) => {
      const pc = peerConnectionsRef.current.get(peerId);
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    socket.on('stream-stopped', () => {
      if (roleRef.current === 'viewer') {
        peerConnectionsRef.current.forEach((pc) => pc.close());
        peerConnectionsRef.current.clear();
        setActivePeers(0);
        setIsStreaming(false);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    });

    socket.on('peer-disconnected', (peerId: string) => {
      const pc = peerConnectionsRef.current.get(peerId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(peerId);
        setActivePeers(peerConnectionsRef.current.size);
      }
    });

    socket.on('chat-message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [roomId]); // Emulate empty dependency by only depending on roomId

  useEffect(() => {
    if (!isStreaming) {
      setNetworkStats({ latency: 0, bitrate: 0 });
      return;
    }

    const interval = setInterval(async () => {
      let totalLatency = 0;
      let validLatencyCount = 0;
      let totalBytesReceived = 0;
      let totalBytesSent = 0;
      const now = performance.now();

      for (const [targetId, pc] of peerConnectionsRef.current.entries()) {
        try {
          const stats = await pc.getStats();
          let currentBytesRx = 0;
          let currentBytesTx = 0;

          stats.forEach(report => {
            // Calculate latency (RTT)
            if (report.type === 'candidate-pair' && report.state === 'succeeded' && report.currentRoundTripTime !== undefined) {
              totalLatency += report.currentRoundTripTime * 1000;
              validLatencyCount++;
            }
            
            // Calculate byte delta
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              currentBytesRx += report.bytesReceived || 0;
            } else if (report.type === 'outbound-rtp' && report.kind === 'video') {
              currentBytesTx += report.bytesSent || 0;
            }
          });

          // Compute bitrate against last mapped check
          const last = lastBytesRef.current.get(targetId);
          const currentRelevantBytes = roleRef.current === 'broadcaster' ? currentBytesTx : currentBytesRx;
          
          if (last) {
            const deltaBytes = currentRelevantBytes - last.bytes;
            const deltaTime = (now - last.timestamp) / 1000;
            if (deltaBytes > 0 && deltaTime > 0) {
              if (roleRef.current === 'broadcaster') {
                totalBytesSent += (deltaBytes * 8) / deltaTime;
              } else {
                totalBytesReceived += (deltaBytes * 8) / deltaTime;
              }
            }
          }
          lastBytesRef.current.set(targetId, { timestamp: now, bytes: currentRelevantBytes });

        } catch (e) {
          console.error("Error reading stats pipeline", e);
        }
      }

      const avgLatency = validLatencyCount > 0 ? Math.round(totalLatency / validLatencyCount) : 0;
      const sumBitrate = roleRef.current === 'broadcaster' ? totalBytesSent : totalBytesReceived;
      const totalKilobits = Math.round(sumBitrate / 1000);

      setNetworkStats({ latency: avgLatency, bitrate: totalKilobits });

    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const startBroadcasting = async (withSystemAudio: boolean = false, withMic: boolean = false) => {
    try {
      setError(null);
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: displaySurface,
          ...QUALITY_CONSTRAINTS[quality]
        } as MediaTrackConstraints,
        audio: withSystemAudio, // system audio
      });

      const videoTrack = displayStream.getVideoTracks()[0];
      if ('contentHint' in videoTrack) {
        // Optimizes WebRTC encoding for detailed screen content (text)
        videoTrack.contentHint = 'detail';
      }

      // Create an empty composite stream
      const compositeStream = new MediaStream();
      displayStream.getTracks().forEach(track => compositeStream.addTrack(track));

      if (withMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = micStream;
          micStream.getAudioTracks().forEach(track => {
            compositeStream.addTrack(track);
          });
          setIsMicMuted(false);
        } catch (micErr) {
          console.error('Could not get mic', micErr);
        }
      }

      localStreamRef.current = compositeStream;
      
      // Update role
      updateRole('broadcaster');

      // Update video element locally
      if (videoRef.current) {
        videoRef.current.srcObject = compositeStream;
      }
      setIsStreaming(true);

      // Notify server we're upgrading to broadcaster
      if (socketRef.current) {
        // Disconnect and wipe peer connections first to reset state gracefully
        peerConnectionsRef.current.forEach((pc) => pc.close());
        peerConnectionsRef.current.clear();
        setActivePeers(0);
        socketRef.current.emit('join-room', roomId, 'broadcaster');
      }

      // Handle stream end (user clicks "Stop sharing" on the browser native popup)
      displayStream.getVideoTracks()[0].onended = () => {
        stopBroadcasting();
      };

    } catch (err: any) {
      console.error('Failed to get display media', err);
      if (err.name === 'NotAllowedError') {
        setError('Screen sharing or microphone permission was denied by the system or browser.');
      } else if (err.name === 'NotFoundError') {
        setError('No eligible screen or window was found to share, or no microphone detected.');
      } else if (err.name === 'NotReadableError') {
        setError('Hardware error. Another application might be locking your mic or screen capture.');
      } else {
        setError('Could not access screen or microphone. Ensure you have granted necessary OS permissions.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopBroadcasting = () => {
    stopRecording();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    setIsStreaming(false);
    updateRole('viewer');
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (socketRef.current) {
      socketRef.current.emit('stop-stream', roomId);
      // Rejoin as viewer to listen to others securely
      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();
      setActivePeers(0);
      socketRef.current.emit('join-room', roomId, 'viewer');
    }
  };

  const toggleMic = () => {
    if (micStreamRef.current) {
      const audioTracks = micStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const newState = !audioTracks[0].enabled;
        audioTracks.forEach(t => t.enabled = newState);
        setIsMicMuted(!newState);
      }
    }
  };

  const switchDisplaySurface = async (surface: 'monitor' | 'window') => {
    if (!localStreamRef.current) return;
    try {
      const newStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: 'always', 
          displaySurface: surface,
          ...QUALITY_CONSTRAINTS[quality]
        }
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        localStreamRef.current.removeTrack(oldVideoTrack);
      }
      
      localStreamRef.current.addTrack(newVideoTrack);

      peerConnectionsRef.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(newVideoTrack);
        }
      });

      newVideoTrack.onended = () => {
        stopBroadcasting();
      };

      if (videoRef.current) {
        videoRef.current.srcObject = localStreamRef.current;
      }

      setDisplaySurface(surface);
    } catch (err) {
      console.error('Display surface switch failed', err);
    }
  };

  const startRecording = () => {
    if (!localStreamRef.current) return;
    recordedChunksRef.current = [];
    try {
      // Use webm, fallback to whatever browser supports if needed
      const options = { mimeType: 'video/webm; codecs=vp9' };
      const recorder = new MediaRecorder(localStreamRef.current, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `SafariCast-Session-${new Date().getTime()}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      };
      
      recorder.start();
      setIsRecording(true);
      mediaRecorderRef.current = recorder;
    } catch (e) {
      console.error('Failed to start recording', e);
      setError('Screen recording is not supported on this browser context.');
    }
  };

  const sendMessage = (text: string, senderName: string) => {
    const msg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: senderName,
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    if (socketRef.current) {
      socketRef.current.emit('send-message', roomId, msg);
    }
  };

  const changeQuality = async (preset: QualityPreset) => {
    setQuality(preset);
    if (localStreamRef.current && isStreaming && roleRef.current === 'broadcaster') {
      const videoTrack = localStreamRef.current.getVideoTracks().find(t => t.kind === 'video');
      if (videoTrack) {
        try {
          await videoTrack.applyConstraints({
            ...QUALITY_CONSTRAINTS[preset],
            cursor: 'always',
            displaySurface: displaySurface
          });
        } catch (e) {
          console.error("Failed to apply video constraints live", e);
        }
      }

      // Update bitrates live
      peerConnectionsRef.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          const params = sender.getParameters();
          if (params.encodings && params.encodings.length > 0) {
             params.encodings[0].maxBitrate = QUALITY_BITRATES[preset];
             sender.setParameters(params).catch(e => console.error("Failed to update bitrate", e));
          }
        }
      });
    }
  };

  return {
    videoRef,
    role,
    isStreaming,
    activePeers,
    error,
    clearError: () => setError(null),
    startBroadcasting,
    stopBroadcasting,
    isMicMuted,
    toggleMic,
    displaySurface,
    switchDisplaySurface,
    isRecording,
    startRecording,
    stopRecording,
    messages,
    sendMessage,
    quality,
    changeQuality,
    connectionQuality,
    networkStats
  };
}
