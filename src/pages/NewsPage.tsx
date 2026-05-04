import React, { useState, useEffect } from 'react';
import { ExternalLink, Newspaper, RefreshCw, Hash } from 'lucide-react';
import { getTopNews } from '../services/dataServices';
import { motion } from 'motion/react';

interface Article {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string; url: string };
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('general');

  const categories = ['general', 'world', 'nation', 'business', 'technology', 'entertainment', 'sports', 'science', 'health'];

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await getTopNews(category);
      setArticles(data.articles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Daily Brief</h1>
          <p className="text-gray-500 dark:text-zinc-400">Curated news from around the globe.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === cat 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 border border-gray-100 dark:border-zinc-800'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800 animate-pulse">
              <div className="h-40 bg-gray-100 dark:bg-zinc-800 rounded-xl mb-4" />
              <div className="h-6 bg-gray-100 dark:bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-full mb-2" />
              <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <motion.div
              key={article.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={article.image || 'https://images.unsplash.com/photo-1585829365234-781fcdb4442a?q=80&w=2074&auto=format&fit=crop'} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                  alt="" 
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-brand-surface/90 backdrop-blur-md text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full text-brand-accent shadow-sm">
                    {article.source.name}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-brand-text line-clamp-2 leading-snug mb-3 capitalize">
                  {article.title}
                </h3>
                <p className="text-sm text-brand-text-dim line-clamp-3 mb-6">
                  {article.description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] text-brand-text-dim font-medium">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-brand-accent text-xs font-semibold hover:underline"
                  >
                    Read More
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {!loading && articles.length === 0 && (
        <div className="text-center py-20">
          <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">No news found for this category.</p>
        </div>
      )}
    </div>
  );
}
