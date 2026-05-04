import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  CheckSquare, 
  Newspaper, 
  DollarSign, 
  Book, 
  Brain, 
  Settings, 
  Menu, 
  X,
  User,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useStore } from './store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';

// Pages (to be implemented)
import ChatPage from './pages/ChatPage';
import TasksPage from './pages/TasksPage';
import NewsPage from './pages/NewsPage';
import FinancePage from './pages/FinancePage';
import JournalPage from './pages/JournalPage';
import MemoriesPage from './pages/MemoriesPage';
import SettingsPage from './pages/SettingsPage';

type Page = 'chat' | 'tasks' | 'news' | 'finance' | 'journal' | 'memories' | 'settings';

export default function App() {
  const { user, setUser, loading, setLoading, preferences, setPreferences } = useStore();
  const [activePage, setActivePage] = useState<Page>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error("Auth failed");
    }
  };

  const handleLogout = () => {
    signOut(auth);
    toast.success("Logged out");
  };

  const toggleTheme = () => {
    const newTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    setPreferences({ theme: newTheme });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-indigo-50 dark:bg-zinc-950 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">PersonalMind</h1>
          <p className="text-gray-500 dark:text-zinc-400 mb-8">Your all-in-one AI Life Assistant. Secure, private, and powerful.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <User className="w-5 h-5" />
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'journal', label: 'Journal', icon: Book },
    { id: 'memories', label: 'Memories', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`h-screen flex overflow-hidden bg-brand-bg text-brand-text ${preferences.theme === 'dark' ? 'dark' : ''}`}>
      <Toaster position="top-right" />
      
      {/* Sidebar - Immersive Nav */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="h-full bg-brand-surface border-r border-brand-border flex flex-col transition-all duration-300 z-50"
      >
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen ? 'hidden' : ''}`}>
            <div className="w-8 h-8 flex items-center justify-center">
              <Brain className="w-6 h-6 text-brand-accent shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white truncate">PersonalMind</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-brand-text-dim">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activePage === item.id 
                  ? 'bg-brand-accent/10 text-brand-accent font-semibold' 
                  : 'text-brand-text-dim hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className={activePage === item.id ? 'text-brand-accent' : ''} />
              {isSidebarOpen && <span className="text-sm truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-border space-y-1">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-brand-text-dim hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            {preferences.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {isSidebarOpen && <span>{preferences.theme === 'dark' ? 'Light' : 'Dark'}</span>}
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500/80 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Column */}
      <main className="flex-1 h-full overflow-hidden relative flex flex-col bg-[radial-gradient(circle_at_50%_-20%,_#1e1b4b_0%,_#030305_70%)]">
        <header className="h-16 flex items-center justify-between px-8 z-10 glass-header">
          <h2 className="text-[10px] font-bold text-brand-text-dim uppercase tracking-[0.2em]">
            {activePage} Mode
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white leading-none">{user.displayName}</p>
            </div>
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="w-8 h-8 rounded-full border border-brand-border" alt="" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activePage === 'chat' && <ChatPage />}
              {activePage === 'tasks' && <TasksPage />}
              {activePage === 'news' && <NewsPage />}
              {activePage === 'finance' && <FinancePage />}
              {activePage === 'journal' && <JournalPage />}
              {activePage === 'memories' && <MemoriesPage />}
              {activePage === 'settings' && <SettingsPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Right Column - Status Panel (The Immersive Edge) */}
      <aside className="hidden xl:flex w-[320px] h-full bg-brand-surface border-l border-brand-border flex-col p-6 gap-6 overflow-y-auto">
          <div className="immersive-card p-5">
              <div className="flex justify-between items-center mb-4 text-[10px] uppercase font-bold tracking-widest text-brand-text-dim">
                  <span>Atmosphere</span>
                  <span className="text-brand-accent">Live</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">72°F</div>
              <div className="text-xs text-brand-text-dim">San Francisco • Clear Sky</div>
          </div>

          <div className="immersive-card p-5">
              <div className="flex justify-between items-center mb-4 text-[10px] uppercase font-bold tracking-widest text-brand-text-dim">
                  <span>Critical Path</span>
                  <span className="text-amber-500">2 Active</span>
              </div>
              <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                      <span className="text-white">Review Q4 Strategy</span>
                      <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded uppercase font-bold">High</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-2">
                      <span className="text-white">Sync with Ravi</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase font-bold">Med</span>
                  </div>
              </div>
          </div>

          <div className="immersive-card p-5">
              <div className="text-[10px] uppercase font-bold tracking-widest text-brand-text-dim mb-4">Memory Nodes</div>
              <div className="space-y-4">
                  <p className="text-xs text-brand-text-dim border-l-2 border-brand-accent pl-3 leading-relaxed">
                      User prefers 10-minute summaries for news articles.
                  </p>
                  <p className="text-xs text-brand-text-dim border-l-2 border-brand-accent pl-3 leading-relaxed">
                      Frequent travels reported between SF and NYC.
                  </p>
              </div>
          </div>

          <div className="immersive-card p-5">
              <div className="text-[10px] uppercase font-bold tracking-widest text-brand-text-dim mb-4">Markets</div>
              <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                      <span className="text-brand-text-dim">BTC/USD</span>
                      <span className="text-emerald-500 font-bold">+2.45%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                      <span className="text-brand-text-dim">USD/EUR</span>
                      <span className="text-red-500 font-bold">-0.12%</span>
                  </div>
              </div>
          </div>
          
          <div className="mt-auto text-center">
              <span className="text-[10px] font-bold text-brand-text-dim/50 uppercase tracking-[0.2em]">AI Status: Optimal</span>
          </div>
      </aside>
    </div>
  );
}
