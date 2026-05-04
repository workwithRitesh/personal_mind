import React, { useState, useEffect } from 'react';
import { Book, Plus, Smile, Meh, Frown, Sparkles, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'react-hot-toast';

interface Entry {
  id: string;
  mood: 'happy' | 'neutral' | 'sad';
  note: string;
  date: string;
  createdAt: any;
}

export default function JournalPage() {
  const { user } = useStore();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>('happy');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/journal`),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
      setEntries(ens);
    });
    return () => unsubscribe();
  }, [user]);

  const addEntry = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/journal`), {
        userId: user.uid,
        mood,
        note,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNote('');
      toast.success("Mood captured");
    } catch (err) {
      toast.error("Failed to save entry");
    }
  };

  const moodData = [
    { name: 'Happy', count: entries.filter(e => e.mood === 'happy').length, color: '#10b981' },
    { name: 'Neutral', count: entries.filter(e => e.mood === 'neutral').length, color: '#6366f1' },
    { name: 'Sad', count: entries.filter(e => e.mood === 'sad').length, color: '#f59e0b' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Journal</h1>
          <p className="text-gray-500 dark:text-zinc-400">Track your daily mood and reflections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            {/* Entry Form */}
            <div className="immersive-card p-8">
                <h3 className="font-bold text-lg mb-6 text-white">Reflect</h3>
                
                <div className="flex justify-between mb-8">
                    <button 
                        onClick={() => setMood('happy')}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${mood === 'happy' ? 'bg-emerald-500 text-white scale-110 shadow-lg glow-shadow shadow-emerald-500/20' : 'bg-white/5 text-brand-text-dim opacity-30 hover:opacity-100 transition-all'}`}
                    >
                        <Smile size={32} />
                    </button>
                    <button 
                        onClick={() => setMood('neutral')}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${mood === 'neutral' ? 'bg-indigo-500 text-white scale-110 shadow-lg glow-shadow shadow-indigo-500/20' : 'bg-white/5 text-brand-text-dim opacity-30 hover:opacity-100 transition-all'}`}
                    >
                        <Meh size={32} />
                    </button>
                    <button 
                        onClick={() => setMood('sad')}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${mood === 'sad' ? 'bg-amber-500 text-white scale-110 shadow-lg glow-shadow shadow-amber-500/20' : 'bg-white/5 text-brand-text-dim opacity-30 hover:opacity-100 transition-all'}`}
                    >
                        <Frown size={32} />
                    </button>
                </div>

                <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Short reflection..."
                    className="w-full bg-black/20 border border-brand-border rounded-2xl p-4 text-sm text-brand-text focus:ring-2 focus:ring-brand-accent min-h-[120px] mb-6 outline-none"
                />

                <button 
                    onClick={addEntry}
                    className="w-full bg-brand-accent hover:bg-brand-accent/80 text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95 glow-shadow"
                >
                    Capture Mood
                </button>
            </div>

            {/* Analytics Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={20} className="text-indigo-500" />
                    <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Weekly Insight</h3>
                </div>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={moodData}>
                            <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                                {moodData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {entries.map((entry, i) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                                    <CalendarIcon size={12} />
                                    {entry.date}
                                </span>
                                <div className={`${
                                    entry.mood === 'happy' ? 'text-emerald-500 bg-emerald-50' : 
                                    entry.mood === 'neutral' ? 'text-indigo-500 bg-indigo-50' : 
                                    'text-amber-500 bg-amber-50'
                                } p-2 rounded-xl`}>
                                    {entry.mood === 'happy' ? <Smile size={20} /> : 
                                     entry.mood === 'neutral' ? <Meh size={20} /> : 
                                     <Frown size={20} />}
                                </div>
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                                {entry.note || "No reflection added."}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
}
