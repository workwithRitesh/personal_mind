import React, { useState, useEffect, useRef } from 'react';
import { Send, ImageIcon, Mic, StopCircle, Paperclip, Loader2, Sparkles, Search, Cloud, TrendingUp, Copy } from 'lucide-react';
import { useStore } from '../store/useStore';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit, serverTimestamp, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { chatWithGemini } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: any;
  attachments?: { type: string; url: string; name: string }[];
}

export default function ChatPage() {
  const { user, preferences } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/chats`),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    });
    return () => unsubscribe();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isSending || !user) return;

    const userMessage = input.trim();
    setInput('');
    setIsSending(true);

    try {
      // 1. Save user message to Firestore
      await addDoc(collection(db, `users/${user.uid}/chats`), {
        role: 'user',
        content: userMessage,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      // 2. Extract context (YouTube, Search, etc.)
      let context = "";
      if (userMessage.toLowerCase().includes("youtube.com") || userMessage.toLowerCase().includes("youtu.be")) {
          // Trigger summarization logic
          toast.loading("Analyzing video transcript...", { id: 'yt' });
          try {
              const { getYouTubeTranscript } = await import('../utils/youtubeHelper');
              const transcript = await getYouTubeTranscript(userMessage);
              context = `\n\n[YOUTUBE TRANSCRIPT: ${transcript.slice(0, 5000)}]`;
              toast.success("Transcript loaded", { id: 'yt' });
          } catch (e) {
              toast.error("Could not fetch transcript", { id: 'yt' });
          }
      }

      // 3. Prepare context for Gemini
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // 4. Get AI response
      const aiResponse = await chatWithGemini(history, userMessage + context);

      // 4. Save AI response to Firestore
      await addDoc(collection(db, `users/${user.uid}/chats`), {
        role: 'model',
        content: aiResponse,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      if (preferences.voiceEnabled) {
          speak(aiResponse);
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to get response");
    } finally {
      setIsSending(false);
    }
  };

  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-10 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <Sparkles size={48} className="text-indigo-500 animate-pulse" />
            <div>
              <p className="text-xl font-medium text-gray-900 dark:text-white">Hello, {user?.displayName}</p>
              <p className="text-gray-500">How can I help you today?</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-8 max-w-sm">
                <button onClick={() => setInput("What's the weather today?")} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 text-xs hover:border-indigo-500 transition-all shadow-sm">"What's the weather today?"</button>
                <button onClick={() => setInput("Summarize my tasks")} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 text-xs hover:border-indigo-500 transition-all shadow-sm">"Summarize my tasks"</button>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="msg flex flex-col gap-2 max-w-[80%]">
              <div className={`bubble relative p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-brand-accent text-white rounded-br-none' 
                  : 'bg-brand-surface-light text-brand-text border border-brand-border rounded-bl-none'
              }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.role === 'model' && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content);
                      toast.success("Copied to clipboard");
                    }}
                    className="absolute -right-8 top-0 p-1.5 text-brand-text-dim hover:text-brand-accent opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest text-brand-text-dim px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.role === 'user' ? 'Sent' : 'PersonalMind'} • {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
              </span>
            </div>
          </motion.div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-brand-surface-light p-4 rounded-2xl border border-brand-border rounded-bl-none">
              <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Immersive Bar */}
      <div className="mt-4 sticky bottom-0 z-20">
        <form 
          onSubmit={handleSend}
          className="bg-brand-surface-light/80 backdrop-blur-xl rounded-2xl border border-brand-border p-2 shadow-2xl flex items-center gap-3"
        >
          <button type="button" className="p-2 text-brand-text-dim hover:text-brand-accent rounded-lg transition-colors">
            <Paperclip size={20} />
          </button>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask PersonalMind anything..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-brand-text py-2 text-sm placeholder:text-brand-text-dim/50"
          />
          <div className="flex items-center gap-2 pr-1">
            <button 
              type="button" 
              onClick={handleVoiceInput}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white glow-shadow shadow-red-500/20' : 'bg-brand-accent text-white glow-shadow shadow-brand-accent/30'}`}
            >
              {isListening ? <StopCircle size={18} className="animate-pulse" /> : <Mic size={18} />}
            </button>
            <button 
              disabled={!input.trim() || isSending}
              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white rounded-full transition-all active:scale-95 border border-brand-border"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center text-brand-text-dim/40 mt-3 uppercase tracking-widest font-bold">
          Encrypted • PersonalMind Neural Link
        </p>
      </div>
    </div>
  );
}
