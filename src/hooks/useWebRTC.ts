import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC(roomId: string) {
  const [role, setRole] = useState<'viewer' | 'broadcaster'>('viewer');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activePeers, setActivePeers] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const roleRef = useRef<'viewer' | 'broadcaster'>('viewer');

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
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        peerConnectionsRef.current.delete(targetId);
        setActivePeers(peerConnectionsRef.current.size);
        if (roleRef.current === 'viewer') {
          setIsStreaming(false);
          if (videoRef.current) videoRef.current.srcObject = null;
        }
      }
    };

    // If we are the broadcaster, add local stream to the connection
    if (isInitiator && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
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

    return () => {
      socket.disconnect();
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [roomId]); // Emulate empty dependency by only depending on roomId

  const startBroadcasting = async (withAudio: boolean = false) => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        } as MediaTrackConstraints,
        audio: withAudio,
      });

      localStreamRef.current = stream;
      
      // Update role
      updateRole('broadcaster');

      // Update video element locally
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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
      stream.getVideoTracks()[0].onended = () => {
        stopBroadcasting();
      };

    } catch (err: any) {
      console.error('Failed to get display media', err);
      setError('Could not access screen. Ensure you have granted permissions.');
    }
  };

  const stopBroadcasting = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
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

  return {
    videoRef,
    role,
    isStreaming,
    activePeers,
    error,
    startBroadcasting,
    stopBroadcasting
  };
}
