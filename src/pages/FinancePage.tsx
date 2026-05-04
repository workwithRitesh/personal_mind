import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ArrowRight, RefreshCw, Calculator, Globe } from 'lucide-react';
import { getExchangeRates } from '../services/dataServices';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function FinancePage() {
  const [rates, setRates] = useState<any>(null);
  const [base, setBase] = useState('USD');
  const [amount, setAmount] = useState('1');
  const [target, setTarget] = useState('EUR');
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const data = await getExchangeRates(base);
      setRates(data.conversion_rates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [base]);

  const convertedValue = rates && target in rates ? (parseFloat(amount) * rates[target]).toFixed(2) : '0.00';

  const chartData = [
    { name: 'Mon', value: 1.02 },
    { name: 'Tue', value: 1.05 },
    { name: 'Wed', value: 1.03 },
    { name: 'Thu', value: 1.08 },
    { name: 'Fri', value: 1.06 },
    { name: 'Sat', value: 1.10 },
    { name: 'Sun', value: 1.12 },
  ];

  const popularPairs = ['EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD'];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Finance</h1>
          <p className="text-brand-text-dim">Real-time currency movements and market snapshots.</p>
        </div>
        <button 
          onClick={fetchRates}
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent/10 text-brand-accent rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-brand-accent/20 transition-all"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Sync Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Converter Card */}
        <div className="lg:col-span-1 immersive-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent">
              <Calculator size={20} />
            </div>
            <h3 className="font-bold text-lg text-white">Quick Convert</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-brand-text-dim uppercase tracking-widest mb-2 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-dim font-bold">$</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/20 border border-brand-border rounded-xl py-4 pl-8 pr-4 focus:ring-2 focus:ring-brand-accent text-white font-bold text-xl outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-brand-text-dim uppercase tracking-widest mb-2 block">From</label>
                <select 
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  className="w-full bg-black/20 border border-brand-border rounded-xl p-4 text-white font-medium focus:ring-2 focus:ring-brand-accent appearance-none outline-none text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div className="mt-6 text-brand-border">
                <ArrowRight size={20} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-brand-text-dim uppercase tracking-widest mb-2 block">To</label>
                <select 
                   value={target}
                   onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-black/20 border border-brand-border rounded-xl p-4 text-white font-medium focus:ring-2 focus:ring-brand-accent appearance-none outline-none text-sm"
                >
                  {rates && Object.keys(rates).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 bg-brand-accent rounded-2xl text-center text-white glow-shadow shadow-brand-accent/20">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Result</p>
              <h2 className="text-4xl font-black">{convertedValue} {target}</h2>
            </div>
          </div>
        </div>

        {/* Market Trends Card */}
        <div className="lg:col-span-2 space-y-8">
            <div className="immersive-card p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-white">Price Movements</h3>
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0a0a12', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {popularPairs.map((sym) => (
                    <div key={sym} className="immersive-card p-5 flex items-center justify-between hover:bg-white/5 transition-all">
                        <div>
                            <p className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">{base}/{sym}</p>
                            <h4 className="text-lg font-bold text-white mt-1">
                                {rates && rates[sym] ? rates[sym].toFixed(3) : '---'}
                            </h4>
                        </div>
                        <Globe size={24} className="text-white/5" />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
