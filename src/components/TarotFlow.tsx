import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, History, Calendar, Moon, Star, Map, ChevronRight, Wand2, ArrowLeft, Send, Share2, Info, X } from 'lucide-react';
import { SpreadType, SPREADS, DrawnCard, THAI_CATEGORIES, Category, TarotCard as TarotCardType } from '../types';
import { createSpread } from '../tarot-engine';
import { getTarotCards } from '../tarot-data';
import TarotCard from './TarotCard';
import ReactMarkdown from 'react-markdown';
import { cn, formatBaht } from '../lib/utils';
import { supabase } from '../lib/supabase';
import ShareCard from './ShareCard';

type Step = 'category' | 'question' | 'spread' | 'shuffle' | 'draw' | 'reveal' | 'interpretation';

export default function TarotFlow() {
  const [deck, setDeck] = useState<TarotCardType[]>([]);
  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [question, setQuestion] = useState('');
  const [spreadType, setSpreadType] = useState<SpreadType>('One Card');
  const [drawnCards, setDrawnCards] = useState<(DrawnCard & { isRevealed?: boolean })[]>([]);
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [tipAmount, setTipAmount] = useState<string>('20');
  const [previewCategory, setPreviewCategory] = useState<Category | null>(null);

  useEffect(() => {
    const loadDeck = async () => {
      const cards = await getTarotCards();
      setDeck(cards);
    };
    loadDeck();
  }, []);

  const selectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setPreviewCategory(null);
    setStep('question');
  };

  const selectQuestion = (q: string) => {
    setQuestion(q);
    setStep('spread');
  };

  const selectSpread = (type: SpreadType) => {
    setSpreadType(type);
    setStep('shuffle');
  };

  const handleShuffleComplete = () => {
    if (deck.length === 0) return;
    const cards = createSpread(deck, spreadType);
    setDrawnCards(cards.map(c => ({ ...c, isRevealed: false })));
    setStep('draw');
  };

  const revealCards = async () => {
    setDrawnCards(prev => prev.map(c => ({ ...c, isRevealed: true })));
    setStep('interpretation');
    setLoading(true);

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          spread: spreadType,
          cards: drawnCards.map(dc => {
            const cardInfo = deck.find(c => c.id === dc.cardId);
            return {
              name_en: cardInfo?.name_en,
              name_th: cardInfo?.name_th,
              keywords: cardInfo?.keywords,
              meaning_upright: cardInfo?.meaning_upright,
              meaning_reversed: cardInfo?.meaning_reversed,
              position: dc.position,
              isReversed: dc.isReversed
            };
          })
        })
      });
      const data = await response.json();
      setInterpretation(data.interpretation);
      
      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();

      const { data: reading, error: readingError } = await supabase
        .from('tarot_readings')
        .insert([{
          question,
          spread_type: spreadType,
          interpretation: data.interpretation,
          user_id: user?.id || null
        }])
        .select()
        .single();

      if (!readingError && reading) {
        await supabase.from('tarot_results').insert(
          drawnCards.map(dc => ({
            reading_id: reading.id,
            card_id: dc.cardId,
            position: dc.position,
            is_reversed: dc.isReversed
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <AnimatePresence mode="wait">
        {step === 'category' && (
          <motion.div
            key="category"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-12"
          >
            <div className="space-y-4">
                <h1 className="text-5xl font-serif leading-tight text-white">อยากดูดวง <span className="text-gold italic">เรื่องอะไร?</span></h1>
                <p className="text-gray-400 font-sans">เลือกหมวดหมู่ที่ต้องการค้นหาคำตอบ</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {THAI_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setPreviewCategory(cat)}
                  className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-cosmic-purple hover:bg-cosmic-purple/10 hover:shadow-glow-purple transition-all group flex flex-col items-center gap-4 relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
                    <Info size={14} className="text-white" />
                  </div>
                  <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <div className="text-center">
                    <span className="font-sans font-bold text-lg text-white block mb-1">{cat.name}</span>
                    <p className="text-[10px] text-gray-400 font-sans leading-tight opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      {cat.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Category Details Modal */}
            <AnimatePresence>
              {previewCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setPreviewCategory(null)}
                    className="absolute inset-0 bg-cosmic-dark/90 backdrop-blur-md"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-cosmic-dark border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cosmic-purple to-transparent" />
                    
                    <button 
                      onClick={() => setPreviewCategory(null)}
                      className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-gray-500"
                    >
                      <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-cosmic-purple/20 flex items-center justify-center text-5xl">
                        {previewCategory.icon}
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-serif text-white italic">เกี่ยวกับ <span className="text-gold">{previewCategory.name}</span></h2>
                        <p className="text-gray-400 font-sans">{previewCategory.description}</p>
                      </div>

                      <div className="w-full space-y-4 pt-4">
                        <p className="text-[10px] text-gray-500 font-sans uppercase tracking-[0.2em] font-bold">คำถามที่พบบ่อย</p>
                        <div className="space-y-2">
                          {previewCategory.questions.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setQuestion(q);
                                setSelectedCategory(previewCategory);
                                setPreviewCategory(null);
                                setStep('spread');
                              }}
                              className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-left text-sm text-gray-300 hover:bg-cosmic-purple/20 hover:border-cosmic-purple/40 hover:shadow-glow-purple/20 transition-all flex justify-between items-center group"
                            >
                              {q}
                              <ChevronRight size={14} className="text-cosmic-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => selectCategory(previewCategory)}
                        className="w-full py-4 rounded-2xl bg-gold text-cosmic-dark font-sans font-bold tracking-widest hover:scale-[1.02] hover:shadow-glow-gold transition-all shadow-xl shadow-gold/20"
                      >
                        เริ่มคำทำนาย {previewCategory.name}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {step === 'question' && (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <button 
                onClick={() => setStep('category')}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
            >
                <ArrowLeft size={16} /> กลับไปเลือกหมวดหมู่
            </button>

            <div className="space-y-2">
                <h2 className="text-3xl font-serif text-white">หัวข้อที่คุณต้องการถาม...</h2>
                <p className="text-gray-400">เลือกคำถามยอดนิยม หรือพิมพ์คำถามของคุณเองด้านล่าง</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedCategory?.questions.map((q, i) => (
                    <button
                        key={i}
                        onClick={() => selectQuestion(q)}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 text-left text-sm text-gray-300 hover:bg-cosmic-purple/20 hover:border-cosmic-purple/40 transition-all flex justify-between items-center group"
                    >
                        {q}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                ))}
            </div>

            <div className="pt-8 space-y-4">
                <div className="relative">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="พิมพ์ระบุคำถามของคุณที่นี่..."
                        className="w-full h-32 bg-cosmic-dark border-2 border-white/10 rounded-2xl p-6 text-lg font-sans focus:border-cosmic-purple focus:ring-0 transition-all placeholder:text-gray-600"
                    />
                </div>
                <button
                    onClick={() => step !== 'question' || question.trim() && setStep('spread')}
                    disabled={!question.trim()}
                    className="w-full py-4 rounded-2xl bg-cosmic-purple text-white text-lg font-sans font-bold tracking-widest hover:bg-cosmic-purple/80 hover:shadow-glow-purple disabled:opacity-50 transition-all animate-shine"
                >
                    ตกลง
                </button>
            </div>
          </motion.div>
        )}

        {step === 'spread' && (
          <motion.div
            key="spread"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-12"
          >
            <div className="text-center">
              <h2 className="text-4xl font-serif text-white italic">เลือก <span className="text-gold">รูปแบบการวางไพ่</span></h2>
              <p className="text-gray-400 mt-2">รูปแบบการวางไพ่จะส่งผลต่อความลึกซึ้งของคำทำนาย</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                  { id: 'One Card', label: 'ไพ่ 1 ใบ', desc: 'เจาะลึกคำตอบที่รวดเร็วและตรงไปตรงมา' },
                  { id: 'Three Cards', label: 'ไพ่ 3 ใบ', desc: 'อดีต ปัจจุบัน และอนาคต ของเรื่องที่คุณกังวล' },
                  { id: 'Love Spread', label: 'ดวงความรัก', desc: 'วิเคราะห์ความสัมพันธ์และแนวโน้มหัวใจ' },
                  { id: 'Career Spread', label: 'ดวงการงาน', desc: 'ความก้าวหน้า อุปสรรค และความสำเร็จ' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => selectSpread(type.id as SpreadType)}
                  className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 text-left hover:border-gold/50 hover:shadow-glow-gold transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-serif font-bold text-gold">{type.label}</h3>
                        <p className="text-xs text-gray-500 font-sans uppercase tracking-widest mb-2">{type.id}</p>
                        <p className="text-sm text-gray-400 font-sans">{type.desc}</p>
                    </div>
                    <ChevronRight className="text-white/20 group-hover:text-gold transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'shuffle' && (
            <motion.div
              key="shuffle"
              className="flex flex-col items-center justify-center space-y-12 py-20"
            >
                <div className="relative flex items-center justify-center h-40">
                   {[...Array(5)].map((_, i) => (
                       <motion.div
                        key={i}
                        animate={{ 
                            x: [0, (i-2) * 50, 0],
                            rotate: [0, (i-2) * 10, 0],
                            y: [0, i % 2 === 0 ? 20 : -20, 0]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.1 }}
                        className="absolute w-24 h-40 bg-cosmic-purple/30 border-2 border-gold/40 rounded-xl shadow-2xl backdrop-blur-sm"
                       />
                   ))}
                </div>
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-serif italic text-white">กำลังล้างไพ่และรวบรวมสมาธิ...</h2>
                    <p className="text-gray-400">กรุณาตั้งจิตอธิษฐานถึงคำถามของคุณให้มั่นคง</p>
                </div>
                <button
                  onClick={handleShuffleComplete}
                  className="px-12 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-sans font-bold tracking-widest text-white transition-all animate-pulse"
                >
                    ดึงไพ่
                </button>
            </motion.div>
        )}

        {step === 'draw' && (
            <motion.div
              key="draw"
              className="space-y-12"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-serif text-gold italic uppercase tracking-widest">{spreadType}</h2>
                    <p className="text-gray-400 mt-2">จักรวาลได้เลือกไพ่เหล่านี้มาเพื่อคุณโดยเฉพาะ</p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 py-8">
                    {drawnCards.map((dc, i) => (
                        <div key={i} className="flex flex-col items-center space-y-4">
                            <span className="text-xs font-sans font-bold tracking-widest text-gold/60 uppercase bg-gold/5 px-3 py-1 rounded-full border border-gold/10">
                                {dc.position}
                            </span>
                            <TarotCard />
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <button
                        onClick={revealCards}
                        className="px-12 py-4 rounded-full bg-gold text-cosmic-dark font-sans font-bold tracking-widest hover:scale-105 hover:shadow-glow-gold transition-all shadow-2xl shadow-gold/30"
                    >
                        เปิดคำทำนาย
                    </button>
                </div>
            </motion.div>
        )}

        {step === 'interpretation' && (
            <motion.div
              key="interpretation"
              className="space-y-12"
            >
                <div className="flex flex-wrap justify-center gap-6">
                    {drawnCards.map((dc, i) => (
                        <div key={i} className="flex flex-col items-center space-y-4">
                            <span className="text-[10px] font-sans font-bold tracking-widest text-gold uppercase bg-gold/10 px-2 py-0.5 rounded border border-gold/20">{dc.position}</span>
                            <TarotCard 
                                isRevealed 
                                isReversed={dc.isReversed}
                                card={deck.find(c => c.id === dc.cardId)}
                            />
                        </div>
                    ))}
                </div>

                <div className="bg-cosmic-dark/80 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Wand2 size={120} />
                    </div>
                    
                    {loading ? (
                        <div className="flex flex-col items-center space-y-6 py-20 text-center">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles size={20} className="text-gold animate-pulse" />
                                </div>
                            </div>
                            <p className="text-gold font-serif italic text-2xl">กำลังถอดรหัสคำทำนายจากเบื้องบน...</p>
                        </div>
                    ) : (
                        <div className="markdown-body prose prose-invert max-w-none">
                            <ReactMarkdown>{interpretation}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Tip the Master Section */}
                {!loading && interpretation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-[2rem] bg-gold/5 border border-gold/20 flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                        <Wand2 className="text-gold" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xl font-serif font-bold text-white">เลี้ยงกาแฟอาจารย์</h4>
                        <p className="text-xs text-gray-500">หากคุณพึงพอใจในคำทำนาย สามารถสนับสนุนเราได้ที่นี่</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="relative flex-grow md:flex-grow-0">
                        <input 
                          type="number" 
                          value={tipAmount}
                          onChange={(e) => setTipAmount(e.target.value)}
                          className="w-full md:w-32 bg-cosmic-dark border-2 border-white/10 rounded-xl px-4 py-2 font-sans font-bold text-white focus:border-gold focus:ring-0 transition-all text-center"
                          placeholder="จำนวน"
                        />
                      </div>
                      <button className="px-6 py-2 rounded-xl bg-gold text-cosmic-dark font-sans font-bold text-sm hover:scale-105 hover:shadow-glow-gold transition-all shadow-lg shadow-gold/20 whitespace-nowrap">
                        สนับสนุน {formatBaht(Number(tipAmount) || 0)}
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col items-center gap-6">
                    <button 
                        className="flex items-center gap-2 text-gold/80 hover:text-gold hover:shadow-glow-gold/20 transition-all px-4 py-2 rounded-lg text-sm font-sans"
                        onClick={() => setShowShareCard(true)}
                    >
                        <Share2 size={16} /> แชร์คำทำนายลงโซเชียล
                    </button>
                    <button
                        onClick={() => {
                            setStep('category');
                            setQuestion('');
                            setInterpretation('');
                        }}
                        className="px-8 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-glow-purple/20 transition-all text-sm font-sans"
                    >
                        ←เริ่มดูดวงใหม่อีกครั้ง
                    </button>
                </div>

                {showShareCard && (
                    <ShareCard 
                        title={question}
                        cards={drawnCards}
                        interpretationSnippet={interpretation}
                        onClose={() => setShowShareCard(false)}
                    />
                )}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
