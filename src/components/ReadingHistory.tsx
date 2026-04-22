import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History as HistoryIcon, Clock, Trash2 } from 'lucide-react';
import { getTarotCards } from '../tarot-data';
import { TarotCard as TarotCardType } from '../types';

import { supabase } from '../lib/supabase';

export default function ReadingHistory() {
  const [deck, setDeck] = useState<TarotCardType[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeckAndHistory = async () => {
      const cards = await getTarotCards();
      setDeck(cards);
      fetchHistory();
    };
    loadDeckAndHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('tarot_readings')
      .select(`
        *,
        tarot_results (*)
      `)
      .order('created_at', { ascending: false });

    if (user) {
        query = query.eq('user_id', user.id);
    } else {
        // If no user, maybe show public or local history
        // For now, let's just use local history as fallback below
    }

    const { data, error } = await query;

    if (!error && data) {
      setHistory(data.map(reading => ({
        ...reading,
        cards: reading.tarot_results.map((tr: any) => ({
          cardId: tr.card_id,
          position: tr.position,
          isReversed: tr.is_reversed
        }))
      })));
    } else {
      // Fallback
      const saved = localStorage.getItem('tarot_history');
      if (saved) setHistory(JSON.parse(saved));
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    const { error } = await supabase.from('tarot_readings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) {
      localStorage.removeItem('tarot_history');
      setHistory([]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center opacity-40">
        <HistoryIcon size={48} className="mx-auto mb-4" />
        <p className="text-xl font-serif italic">Your journal of destinies is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-serif text-white italic">บันทึก <span className="text-gold">ดวงชะตา</span></h2>
        <button 
           onClick={clearHistory}
           className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 uppercase tracking-widest font-sans"
        >
            <Trash2 size={12} /> ล้างประวัติทั้งหมด
        </button>
      </div>

      <div className="space-y-6">
        {history.map((record: any) => (
          <div 
            key={record.id} 
            className="bg-cosmic-dark/40 border border-white/5 rounded-2xl p-6 hover:border-cosmic-purple/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-sans uppercase tracking-[0.2em] flex items-center gap-1">
                  <Clock size={10} /> {new Date(record.created_at || record.createdAt).toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <h3 className="text-xl font-serif text-white group-hover:text-gold transition-colors">"{record.question}"</h3>
                <span className="text-xs text-cosmic-purple font-sans font-bold uppercase tracking-widest">{record.spread_type || record.spreadType}</span>
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4">
              {record.cards.map((dc: any, idx: number) => {
                const card = deck.find(c => c.id === dc.cardId);
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-16 h-28 rounded-lg overflow-hidden border border-white/10">
                      <img src={card?.image_url} alt="" className="w-full h-full object-cover grayscale opacity-50" />
                    </div>
                    <span className="text-[8px] text-gray-500 uppercase text-center w-16 truncate">{card?.name_th}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
