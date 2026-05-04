import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
}

export default function TasksPage() {
  const { user } = useStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/tasks`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tks);
    });
    return () => unsubscribe();
  }, [user]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;

    try {
      await addDoc(collection(db, `users/${user.uid}/tasks`), {
        userId: user.uid,
        title: newTask.trim(),
        status: 'pending',
        priority: priority,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewTask('');
      toast.success("Task added");
    } catch (err) {
      toast.error("Failed to add task");
    }
  };

  const toggleTask = async (task: Task) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, `users/${user.uid}/tasks`, task.id), {
        status: task.status === 'pending' ? 'completed' : 'pending',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/tasks`, id));
      toast.success("Task removed");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Tasks</h1>
          <p className="text-gray-500 dark:text-zinc-400">You have {pendingCount} tasks to complete today.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium">
          <Sparkles size={14} />
          AI Optimized
        </div>
      </div>

      <form onSubmit={addTask} className="mb-10 flex gap-2">
        <input 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:ring-2 focus:ring-brand-accent transition-all outline-none"
        />
        <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as any)}
            className="bg-brand-surface border border-brand-border rounded-xl px-3 py-3 text-xs text-brand-text-dim"
        >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
        </select>
        <button className="bg-brand-accent hover:bg-indigo-700 text-white p-3 rounded-xl transition-all shadow-md active:scale-95 glow-shadow">
          <Plus size={24} />
        </button>
      </form>

      <div className="space-y-3">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                task.status === 'completed' 
                  ? 'bg-brand-surface/50 border-brand-border opacity-40' 
                  : 'immersive-card hover:bg-white/5'
              }`}
            >
              <button 
                onClick={() => toggleTask(task)}
                className={`transition-colors ${task.status === 'completed' ? 'text-green-500' : 'text-brand-text-dim hover:text-brand-accent'}`}
              >
                {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              
              <div className="flex-1">
                <p className={`font-medium ${task.status === 'completed' ? 'line-through text-brand-text-dim' : 'text-brand-text'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    task.priority === 'high' ? 'bg-red-50 text-red-500' : 
                    task.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 
                    'bg-blue-50 text-blue-500'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => deleteTask(task.id)}
                className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
            <Clock className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
            <p className="text-gray-500">No tasks yet. Start by adding one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
