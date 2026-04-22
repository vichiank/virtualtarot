import React from 'react';
import { motion } from 'motion/react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { DrawnCard, TarotCard as TarotCardType } from '../types';
import { getTarotCards } from '../tarot-data';

interface ShareCardProps {
  title: string;
  cards: DrawnCard[];
  interpretationSnippet: string;
  onClose: () => void;
}

export default function ShareCard({ title, cards, interpretationSnippet, onClose }: ShareCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [deck, setDeck] = React.useState<TarotCardType[]>([]);

  React.useEffect(() => {
    const loadDeck = async () => {
      const cards = await getTarotCards();
      setDeck(cards);
    };
    loadDeck();
  }, []);

  const shareText = `🔮 ผลการดูดวงจาก VirtualTarot\nหัวข้อ: ${title}\nไพ่ที่ได้: ${cards.map(c => {
    const tc = deck.find(t => t.id === c.cardId);
    return tc ? `${tc.name_th} (${tc.name_en})` : 'Unknown';
  }).join(', ')}\n\n"${interpretationSnippet.slice(0, 100).replace(/[#*`]/g, '')}..."\n\nดูดวงของคุณได้ที่: ${window.location.origin}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ผลการดูดวง VirtualTarot',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-cosmic-dark border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-serif text-white italic">แชร์ <span className="text-gold">โชคชะตา</span> ของคุณ</h3>
            <p className="text-xs text-gray-400 font-sans">ส่งต่อพลังงานดีๆ ให้เพื่อนหรือเก็บไว้เตือนสติ</p>
          </div>

          {/* Preview Card */}
          <div className="bg-gradient-to-br from-cosmic-purple/20 to-cosmic-dark border border-gold/20 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-center -space-x-4">
              {cards.map((c, i) => (
                <div key={i} className="w-16 h-28 rounded-lg overflow-hidden border-2 border-gold/30 shadow-lg transform rotate-[-5deg] odd:rotate-[5deg]">
                  <img 
                    src={deck.find(tc => tc.id === c.cardId)?.image_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-gold font-serif font-bold text-lg">{title}</p>
              <div className="h-px bg-gold/20 w-12 mx-auto" />
              <p className="text-gray-300 text-xs italic font-sans px-4 line-clamp-3">
                {interpretationSnippet.replace(/[#*`]/g, '')}
              </p>
            </div>

            <div className="flex justify-between items-center px-4 pt-4 border-t border-white/5 opacity-40">
              <span className="text-[10px] font-sans tracking-widest text-white uppercase italic">VirtualTarot AI</span>
              <span className="text-[10px] font-sans text-white uppercase tracking-widest">2024</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-sans"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gold text-cosmic-dark font-sans font-bold hover:scale-105 transition-all text-sm"
            >
              <Share2 size={16} /> แชร์เลย
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
