import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, setDoc, doc, serverTimestamp, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Share, History, Video, ArrowRight, LayoutDashboard, Settings, Activity } from 'lucide-react';
import { logout } from '../lib/auth';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'settings'>('sessions');

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
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-64 w-1/2 h-1/2 bg-blue-900/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 hidden md:flex flex-col justify-between relative z-20">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <Share className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="font-bold uppercase tracking-widest text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">SafariCast</h1>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-widest transition-colors ${activeTab === 'sessions' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Sessions
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
            >
              <Settings className="w-4 h-4" /> Preferences
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <img src={user?.photoURL || ''} alt="Profile" className="w-10 h-10 rounded-full border border-white/10" />
            <div className="overflow-hidden relative flex-1">
              <p className="text-sm font-bold truncate">{user?.displayName || 'Host'}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs sm:text-xs uppercase tracking-widest font-bold transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Share className="w-5 h-5 text-purple-400" />
            <h1 className="font-bold uppercase tracking-widest text-sm">SafariCast</h1>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="text-white/40">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-12">
          
          {/* Header & Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-2">Host Dashboard</h2>
              <p className="text-white/40 uppercase tracking-widest text-xs font-mono">Manage your secure streaming infrastructure</p>
            </div>
            
            <button
              onClick={createRoom}
              className="flex items-center justify-center auto-cols-min gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
            >
              <Plus className="w-5 h-5" />
              <span>New Stream Session</span>
            </button>
          </div>

          {activeTab === 'sessions' && (
            <>
              {/* Quick Stats Ribbon */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl">
                  <Activity className="w-5 h-5 text-blue-400 mb-4" />
                  <div className="text-3xl font-bold font-mono">{rooms.length}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Total Sessions</div>
                </div>
                <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl">
                  <Video className="w-5 h-5 text-purple-400 mb-4" />
                  <div className="text-3xl font-bold font-mono">4K</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Video Capability</div>
                </div>
                <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl">
                  <History className="w-5 h-5 text-green-400 mb-4" />
                  <div className="text-3xl font-bold font-mono">{rooms.filter(r => r.status === 'active').length}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Active Now</div>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/20 border border-purple-500/20 rounded-2xl flex flex-col justify-center items-start">
                  <div className="text-sm font-semibold uppercase tracking-widest text-purple-300 mb-1">PRO Plan</div>
                  <div className="text-[10px] text-white/60">Unlimited Bandwidth Enabled</div>
                </div>
              </div>

              {/* Sessions List */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <h3 className="uppercase tracking-widest text-sm font-bold">Session History</h3>
                </div>

                {loadingRooms ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-[#0a0a0a] rounded-2xl border border-white/5"></div>
                    ))}
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-24 bg-[#0a0a0a] border border-white/5 rounded-3xl">
                    <Video className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 font-mono text-sm uppercase tracking-widest">No past sessions found.</p>
                    <p className="text-white/20 text-xs mt-2">Create a new host session to begin routing traffic.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {rooms.map(room => (
                      <div key={room.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-2xl transition-all group gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <Video className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-mono text-xl font-bold tracking-widest text-white">{room.id}</h4>
                              {room.status === 'active' && (
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[10px] uppercase font-bold tracking-wider">Active</span>
                              )}
                            </div>
                            <p className="text-white/40 text-xs font-mono uppercase tracking-wider">
                              {room.createdAt?.toDate().toLocaleDateString()} · {room.createdAt?.toDate().toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => navigate(`/room/${room.id}`)}
                          className="w-full sm:w-auto p-4 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <span className="uppercase text-xs tracking-widest font-bold">Rejoin Engine</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <div className="p-8 bg-[#0a0a0a] rounded-3xl border border-white/5 space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-2">Host Preferences</h3>
                <p className="text-white/40 text-sm">Manage default WebRTC capabilities and stream behavior.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <h4 className="font-semibold text-sm">Force Hardware Acceleration</h4>
                    <p className="text-xs text-white/40 mt-1">Prefer GPU encoders to heavily reduce CPU loads during 4K streaming.</p>
                  </div>
                  <div className="w-12 h-6 bg-purple-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <h4 className="font-semibold text-sm">Auto-Start Microphones</h4>
                    <p className="text-xs text-white/40 mt-1">Automatically request microphone access when opening a new stream.</p>
                  </div>
                  <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 bottom-1 w-4 bg-white/50 rounded-full"></div>
                  </div>
                </div>

                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <h4 className="font-semibold text-sm text-red-400">Strict Viewer DRM</h4>
                    <p className="text-xs text-red-400/50 mt-1">Aggressively disconnect viewers flagged for saving screen streams.</p>
                  </div>
                  <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 bottom-1 w-4 bg-white/50 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
