import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Room } from './components/Room';

export default function App() {
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setRoomId(roomFromUrl.toUpperCase());
    }
  }, []);

  const handleJoinRoom = (id: string) => {
    setRoomId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('room', id);
    window.history.pushState({}, '', url.toString());
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url.toString());
  };

  if (roomId) {
    return <Room roomId={roomId} onLeave={handleLeaveRoom} />;
  }

  return <Home onJoinRoom={handleJoinRoom} />;
}
