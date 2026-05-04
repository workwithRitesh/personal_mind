import React from 'react';
import { User, Bell, Shield, Moon, Monitor, Mic, Brain, Sparkles, Sliders } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const { preferences, setPreferences, user } = useStore();

  const handleToggleVoice = () => {
    setPreferences({ voiceEnabled: !preferences.voiceEnabled });
    toast.success(`Voice output ${!preferences.voiceEnabled ? 'enabled' : 'disabled'}`);
  };

  const handleUpdateAgentName = (name: string) => {
    setPreferences({ agentName: name });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Configuration</h1>
        <p className="text-brand-text-dim">Manage your preferences and AI personality.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="immersive-card p-8">
          <div className="flex items-center gap-4 mb-8 border-b border-brand-border pb-8">
            <img src={user?.photoURL || ''} className="w-20 h-20 rounded-2xl border border-brand-border" alt="" />
            <div>
              <h3 className="text-xl font-bold text-white">{user?.displayName}</h3>
              <p className="text-brand-text-dim">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
                <Shield size={12} />
                Verified Intelligence
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-brand-text-dim uppercase tracking-widest block">Agent Identity</label>
              <div className="flex items-center gap-3 p-4 bg-black/20 rounded-2xl border border-brand-border focus-within:border-brand-accent transition-all">
                <Brain className="text-brand-accent" size={20} />
                <input 
                  type="text" 
                  value={preferences.agentName}
                  onChange={(e) => handleUpdateAgentName(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm p-0 w-full font-bold text-white outline-none"
                />
              </div>
              <p className="text-[10px] text-brand-text-dim lowercase tracking-wide font-mono">ID: PMIND-NODE-X01</p>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-brand-text-dim uppercase tracking-widest block">Interaction</label>
              <button 
                onClick={handleToggleVoice}
                className="w-full flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-brand-border hover:bg-white/5 transition-all outline-none"
              >
                <div className="flex items-center gap-3">
                  <Mic className={preferences.voiceEnabled ? 'text-brand-accent' : 'text-brand-text-dim'} size={20} />
                  <span className="text-sm font-bold text-white">Voice Output</span>
                </div>
                <div className={`w-10 h-5 rounded-full transition-all relative ${preferences.voiceEnabled ? 'bg-brand-accent' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.voiceEnabled ? 'left-6' : 'left-1'}`} />
                </div>
              </button>
              <p className="text-[10px] text-brand-text-dim">Neural responses will be synthesized.</p>
            </div>
          </div>
        </section>

        {/* System Settings */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="immersive-card p-6 flex flex-col items-center text-center">
                <Bell size={24} className="text-amber-500 mb-4" />
                <h4 className="font-bold text-sm mb-1 text-white">Notifications</h4>
                <p className="text-[10px] text-brand-text-dim uppercase tracking-tight">Push & Email</p>
                <button className="mt-4 px-4 py-2 bg-white/5 rounded-xl text-xs font-bold text-brand-text-dim hover:text-white transition-all">Configure</button>
            </div>
            <div className="immersive-card p-6 flex flex-col items-center text-center">
                <Monitor size={24} className="text-brand-accent mb-4" />
                <h4 className="font-bold text-sm mb-1 text-white">Display</h4>
                <p className="text-[10px] text-brand-text-dim uppercase tracking-tight">Immersive Mode</p>
                <button 
                    onClick={() => setPreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })}
                    className="mt-4 px-4 py-2 bg-brand-accent/10 border border-brand-accent/30 rounded-xl text-xs font-bold text-brand-accent hover:bg-brand-accent/20 transition-all"
                >
                    Toggle Theme
                </button>
            </div>
            <div className="immersive-card p-6 flex flex-col items-center text-center opacity-50">
                <Sliders size={24} className="text-emerald-500 mb-4" />
                <h4 className="font-bold text-sm mb-1 text-white">Neural Net</h4>
                <p className="text-[10px] text-brand-text-dim uppercase tracking-tight">Core Params</p>
                <button className="mt-4 px-4 py-2 bg-white/5 rounded-xl text-xs font-bold text-brand-text-dim cursor-not-allowed">Enterprise Only</button>
            </div>
        </section>

        <section className="text-center py-10 opacity-30">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles size={16} className="text-brand-accent" />
                <p className="text-xs font-bold text-white uppercase tracking-[0.3em]">PersonalMind Studio</p>
            </div>
            <p className="text-[10px] text-brand-text-dim font-mono">Build 2026</p>
        </section>
      </div>
    </div>
  );
}
