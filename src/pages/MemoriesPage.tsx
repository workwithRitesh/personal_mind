import React, { useState, useEffect } from 'react';
import { Brain, Trash2, Plus, Search, Tag, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

interface Memory {
  id: string;
  content: string;
  category: string;
  createdAt: any;
}

export default function MemoriesPage() {
  const { user } = useStore();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemory, setNewMemory] = useState('');
  const [category, setCategory] = useState('Personal');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/memories`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Memory));
      setMemories(mems);
    });
    return () => unsubscribe();
  }, [user]);

  const addMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim() || !user) return;

    try {
      await addDoc(collection(db, `users/${user.uid}/memories`), {
        userId: user.uid,
        content: newMemory.trim(),
        category,
        createdAt: serverTimestamp()
      });
      setNewMemory('');
      toast.success("Memory saved");
    } catch (err) {
      toast.error("Failed to save memory");
    }
  };

  const deleteMemory = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/memories`, id));
      toast.success("Memory forgotten");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const filteredMemories = memories.filter(m => 
    m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Memory Bank</h1>
          <p className="text-brand-text-dim">Structured facts the agent uses to personalize your experience.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-dim" size={18} />
          <input 
            type="text" 
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-accent transition-all text-white placeholder:text-brand-text-dim/50"
          />
        </div>
      </div>

      <form onSubmit={addMemory} className="immersive-card p-8 mb-10">
        <h3 className="font-bold text-lg mb-4 text-white">Store a permanent fact</h3>
        <div className="space-y-4">
          <textarea 
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            placeholder="E.g., 'I prefer meeting at 10 AM on Tuesdays'..."
            className="w-full bg-black/20 border border-brand-border rounded-2xl p-4 text-white focus:ring-2 focus:ring-brand-accent min-h-[80px] outline-none"
          />
          <div className="flex items-center gap-4">
            <div className="flex-1">
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/20 border border-brand-border rounded-xl p-3 text-sm text-brand-text-dim focus:ring-2 focus:ring-brand-accent appearance-none outline-none"
                >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Family">Family</option>
                    <option value="Preferences">Preferences</option>
                    <option value="Health">Health</option>
                </select>
            </div>
            <button className="bg-brand-accent hover:opacity-80 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 glow-shadow">
                <Plus size={20} />
                Remember
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredMemories.map((memo) => (
            <motion.div
              key={memo.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="immersive-card p-6 group hover:border-brand-accent transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-brand-accent bg-brand-accent/10 px-2 py-1 rounded">
                  <Tag size={10} />
                  {memo.category}
                </span>
                <button 
                    onClick={() => deleteMemory(memo.id)}
                    className="p-1.5 text-brand-text-dim hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                    <Trash2 size={14} />
                </button>
              </div>
              <p className="text-white font-medium leading-relaxed">
                {memo.content}
              </p>
              <div className="mt-4 flex items-center text-[10px] text-brand-text-dim font-medium gap-1">
                <Clock size={12} />
                Stored on {memo.createdAt?.toDate().toLocaleDateString() || 'Recently'}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredMemories.length === 0 && (
          <div className="md:col-span-2 text-center py-20 opacity-30">
            <Brain size={64} className="mx-auto mb-4 text-brand-text-dim" />
            <p className="text-brand-text-dim">Your memory bank is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
