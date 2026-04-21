import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, setDoc, doc, serverTimestamp, deleteDoc, where, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Share, History, Video, ArrowRight, LayoutDashboard, Settings, Activity, Trash2, PanelLeftClose, PanelLeft, Monitor, Key } from 'lucide-react';
import { logout } from '../lib/auth';
import { QualityPreset } from '../hooks/useWebRTC';

interface Room {
  id: string;
  hostId: string;
  name: string;
  status: string;
  createdAt: Timestamp;
  endedAt: Timestamp | null;
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'settings'>('sessions');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [defaultQuality, setDefaultQuality] = useState<QualityPreset>((localStorage.getItem('safaricast_quality') as QualityPreset) || 'source');
  const [autoMuteMic, setAutoMuteMic] = useState<boolean>(localStorage.getItem('safaricast_mic') === 'true');

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
        })) as Room[];
        
        fetchedRooms.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
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

  const handleDeleteRoom = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to end and delete this streaming session forever?");
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, 'rooms', id));
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete room:", err);
    }
  };

  const handleQualityChange = (q: QualityPreset) => {
    setDefaultQuality(q);
    localStorage.setItem('safaricast_quality', q);
  };

  const toggleAutoMute = () => {
    const newVal = !autoMuteMic;
    setAutoMuteMic(newVal);
    localStorage.setItem('safaricast_mic', newVal.toString());
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-64 w-1/2 h-1/2 bg-blue-900/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Sidebar */}
      <aside className={`bg-[#0a0a0a] border-r border-white/5 hidden md:flex flex-col justify-between relative z-20 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl shrink-0">
              <Share className="w-5 h-5 text-purple-400" />
            </div>
            {isSidebarOpen && <h1 className="font-bold uppercase tracking-widest text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 whitespace-nowrap">SafariCast</h1>}
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-sm font-semibold uppercase tracking-widest transition-colors ${activeTab === 'sessions' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
              title="Sessions"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" /> {isSidebarOpen && <span>Sessions</span>}
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-sm font-semibold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
              title="Preferences"
            >
              <Settings className="w-4 h-4 shrink-0" /> {isSidebarOpen && <span>Preferences</span>}
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-white/5">
          <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'} mb-6`}>
            <img src={user?.photoURL || ''} alt="Profile" className="w-10 h-10 rounded-full border border-white/10 shrink-0" title={user?.displayName || 'Host'} />
            {isSidebarOpen && (
              <div className="overflow-hidden relative flex-1">
                <p className="text-sm font-bold truncate">{user?.displayName || 'Host'}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className={`w-full flex justify-center items-center gap-2 ${isSidebarOpen ? 'px-4' : 'px-0'} py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs uppercase tracking-widest font-bold transition-all`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" /> {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth font-sans">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Share className="w-5 h-5 text-purple-400" />
            <h1 className="font-bold uppercase tracking-widest text-sm font-display">SafariCast</h1>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="text-white/40">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-12">
          
          {/* Header & Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="hidden md:flex p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-xl transition-colors mt-2"
                title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
              </button>
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3 font-display">
                  Host Dashboard
                </h2>
                <p className="text-white/40 uppercase tracking-widest text-xs font-mono">Manage your secure streaming infrastructure</p>
              </div>
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
                  <h3 className="uppercase tracking-widest text-sm font-bold font-display text-white/80">Session History</h3>
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
                        
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                          <button 
                            onClick={(e) => handleDeleteRoom(e, room.id)}
                            className="p-4 bg-red-500/5 hover:bg-red-500/20 text-red-500/70 hover:text-red-400 border border-red-500/10 rounded-xl transition-all flex items-center justify-center"
                            title="Delete Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigate(`/room/${room.id}`)}
                            className="w-full sm:w-auto p-4 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            <span className="uppercase text-xs tracking-widest font-bold">Rejoin Engine</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
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
                <h3 className="text-xl font-bold mb-2 font-display">Host Preferences</h3>
                <p className="text-white/40 text-sm">Manage defaults used when initiating new broadcast sessions.</p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Monitor className="w-4 h-4 text-blue-400"/> Default Stream Quality</h4>
                    <p className="text-xs text-white/40 mt-1">Specify default WebRTC bitrate constraints explicitly loaded into new sessions.</p>
                  </div>
                  <div className="relative">
                    <select 
                      value={defaultQuality}
                      onChange={(e) => handleQualityChange(e.target.value as QualityPreset)}
                      className="px-4 py-2 bg-black border border-white/10 rounded-xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-purple-500/50 appearance-none pr-8 cursor-pointer shadow-lg"
                    >
                      <option value="low">Low (500k)</option>
                      <option value="medium">Medium (2.5M)</option>
                      <option value="high">High (8M)</option>
                      <option value="source">Source (15M)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ArrowRight className="w-3 h-3 text-white/40 rotate-90" />
                    </div>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={toggleAutoMute}
                >
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Key className="w-4 h-4 text-purple-400"/> Default Start Muted</h4>
                    <p className="text-xs text-white/40 mt-1">If enabled, your host session will default the microphone transmission track to muted.</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${autoMuteMic ? 'bg-purple-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 bottom-1 w-4 rounded-full transition-all ${autoMuteMic ? 'right-1 bg-white' : 'left-1 bg-white/50'}`}></div>
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
