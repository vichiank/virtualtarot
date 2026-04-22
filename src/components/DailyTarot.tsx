import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, RefreshCcw, Share2 } from 'lucide-react';
import { drawCards } from '../tarot-engine';
import { getTarotCards } from '../tarot-data';
import TarotCard from './TarotCard';
import { TarotCard as TarotCardType } from '../types';
import ShareCard from './ShareCard';

import { supabase } from '../lib/supabase';

export default function DailyTarot() {
  const [deck, setDeck] = useState<TarotCardType[]>([]);
  const [dailyCard, setDailyCard] = useState<{ 
    card: TarotCardType; 
    isReversed: boolean;
    luckyNumbers: string[];
    luckyColors: string[];
  } | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showShareCard, setShowShareCard] = useState(false);

  const LUNAR_COLORS = ["ทอง", "ม่วง", "ขาว", "เเดง", "ชมพู", "เขียว", "ส้ม", "ฟ้า", "ดำ"];

  useEffect(() => {
    const loadDeck = async () => {
      const cards = await getTarotCards();
      setDeck(cards);
      checkDaily(cards);
    };
    loadDeck();
  }, []);

  const checkDaily = async (currentDeck: TarotCardType[]) => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    // Check Supabase first
    const { data, error } = await supabase
      .from('daily_tarot')
      .select('*')
      .eq('date', today)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const card = currentDeck.find(c => c.id === data.card_id);
      if (card) {
        setDailyCard({ 
            card, 
            isReversed: data.is_reversed || false,
            luckyNumbers: data.lucky_numbers || [],
            luckyColors: data.lucky_colors || []
        });
        setIsRevealed(true);
      }
    }
    setLoading(false);
  };

  const drawDaily = async () => {
    if (deck.length === 0) return;
    const cardDraw = drawCards(deck, 1)[0];
    const card = deck.find(c => c.id === cardDraw.cardId);
    if (!card) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Generate Luck
    const luckyNumbers = [
        Math.floor(Math.random() * 99).toString().padStart(2, '0'),
        Math.floor(Math.random() * 99).toString().padStart(2, '0'),
        Math.floor(Math.random() * 99).toString().padStart(2, '0')
    ];
    const luckyColors = [
        LUNAR_COLORS[Math.floor(Math.random() * LUNAR_COLORS.length)],
        LUNAR_COLORS[Math.floor(Math.random() * LUNAR_COLORS.length)]
    ].filter((v, i, a) => a.indexOf(v) === i);

    // Save to Supabase
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('daily_tarot').insert({
      card_id: card.id,
      date: today,
      is_reversed: cardDraw.isReversed,
      lucky_numbers: luckyNumbers,
      lucky_colors: luckyColors,
      user_id: user?.id || null
    });

    setDailyCard({ 
        card, 
        isReversed: cardDraw.isReversed,
        luckyNumbers,
        luckyColors
    });
    setIsRevealed(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center flex flex-col items-center">
      <div className="space-y-4 mb-12">
        <h2 className="text-4xl font-serif text-white">ดวงประจำวัน</h2>
        <p className="text-gray-400">เปิดไพ่หนึ่งใบ เพื่อรับคำชี้แนะจากจักรวาลในอีก 24 ชั่วโมงข้างหน้า</p>
      </div>

      <div className="relative mb-12">
        <TarotCard 
          isRevealed={isRevealed}
          isReversed={dailyCard?.isReversed}
          card={dailyCard?.card}
          onClick={!isRevealed ? drawDaily : undefined}
          className="w-[200px] h-[340px]"
        />
      </div>

      <AnimatePresence>
        {isRevealed && dailyCard && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-lg w-full"
          >
            <div className="space-y-2">
                <h3 className="text-3xl font-serif font-bold text-gold uppercase tracking-widest">{dailyCard.card.name_th}</h3>
                <p className="text-[10px] text-gray-500 font-sans uppercase tracking-[0.2em]">{dailyCard.card.name_en}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                <div className="space-y-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-sans">เลขมงคล</span>
                    <div className="flex justify-center gap-2">
                        {dailyCard.luckyNumbers.map(num => (
                            <span key={num} className="w-10 h-10 rounded-full bg-cosmic-purple/20 border border-gold/30 flex items-center justify-center text-gold font-bold">{num}</span>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-sans">สีมงคล</span>
                    <div className="flex justify-center gap-2">
                        {dailyCard.luckyColors.map(col => (
                            <span key={col} className="px-4 py-2 rounded-xl bg-gold text-cosmic-dark font-bold text-xs">{col}</span>
                        ))}
                    </div>
                </div>
            </div>

            <p className="text-gray-300 leading-relaxed italic text-sm">
                วันนี้ {dailyCard.card.name_th} บ่งบอกถึงพลังงานที่ส่งผลต่อชีวิตคุณ: {dailyCard.isReversed ? dailyCard.card.meaning_reversed : dailyCard.card.meaning_upright}
            </p>
            
            <button 
                className="flex items-center gap-2 text-gold/60 hover:text-gold transition-colors text-xs font-sans mx-auto pt-4"
                onClick={() => setShowShareCard(true)}
            >
                <Share2 size={14} /> แชร์ดวงวันนี้ของฉัน
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showShareCard && dailyCard && (
          <ShareCard 
            title="ดวงประจำวัน"
            cards={[{ cardId: dailyCard.card.id, position: 'Daily', isReversed: dailyCard.isReversed }]}
            interpretationSnippet={`วันนี้คุณได้ไพ่ ${dailyCard.card.name_th} (${dailyCard.card.name_en}) เลขมงคล: ${dailyCard.luckyNumbers.join(', ')}`}
            onClose={() => setShowShareCard(false)}
          />
      )}

      {!isRevealed && !loading && (
        <button
          onClick={drawDaily}
          className="px-10 py-4 rounded-2xl bg-cosmic-purple text-white font-sans font-bold tracking-widest hover:bg-cosmic-purple/80 transition-all shadow-xl shadow-cosmic-purple/20"
        >
          เปิดไพ่ประจำวัน
        </button>
      )}
    </div>
  );
}
