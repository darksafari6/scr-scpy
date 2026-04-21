import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, setDoc, doc, serverTimestamp, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Share, History, Video, ArrowRight } from 'lucide-react';
import { logout } from '../lib/auth';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function fetchRooms() {
      try {
        const q = query(
          collection(db, 'rooms'),
          where('hostId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const fetchedRooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        fetchedRooms.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setRooms(fetchedRooms);
      } catch (error) {
        console.error("Error fetching rooms", error);
      } finally {
        setLoadingRooms(false);
      }
    }

    fetchRooms();
  }, [user]);

  const createRoom = async () => {
    if (!user) return;
    
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomRef = doc(db, 'rooms', newRoomId);
    
    await setDoc(roomRef, {
      hostId: user.uid,
      name: `Stream Session ${newRoomId}`,
      status: 'active',
      createdAt: serverTimestamp(),
      endedAt: null
    });

    navigate(`/room/${newRoomId}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-900/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      
      <header className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <Share className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="font-display font-bold uppercase tracking-widest text-xl">Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-3">
            <img src={user?.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" />
            <span className="text-white/60 hidden sm:block">{user?.email}</span>
          </div>
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="uppercase tracking-widest text-[10px] sm:text-xs font-semibold">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-12 z-10">
        
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-display font-medium mb-2">Welcome Back.</h2>
            <p className="text-white/40 uppercase tracking-widest text-xs font-mono">Manage your secure streaming sessions</p>
          </div>
          
          <button
            onClick={createRoom}
            className="flex items-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          >
            <Plus className="w-5 h-5" />
            <span>New Host Session</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <History className="w-4 h-4 text-white/40" />
            <h3 className="uppercase text-white/50 tracking-widest text-xs font-bold">Session History</h3>
          </div>

          {loadingRooms ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-white/5 rounded-2xl border border-white/5"></div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/5 rounded-3xl">
              <Video className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 font-mono text-sm uppercase tracking-widest">No past sessions found.</p>
              <p className="text-white/20 text-xs mt-2">Create a new host session to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {rooms.map(room => (
                <div key={room.id} className="flex items-center justify-between p-5 md:p-6 bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-2xl transition-all group">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-mono text-lg font-bold tracking-widest text-blue-400">{room.id}</h4>
                      {room.status === 'active' && (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[10px] uppercase font-bold tracking-wider">Active</span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs font-mono uppercase tracking-wider">
                      {room.createdAt?.toDate().toLocaleDateString()} at {room.createdAt?.toDate().toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/room/${room.id}`)}
                    className="p-3 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-all sm:px-6 sm:py-3 sm:flex sm:items-center sm:gap-2"
                  >
                    <span className="hidden sm:inline uppercase text-xs tracking-widest font-bold">Rejoin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
