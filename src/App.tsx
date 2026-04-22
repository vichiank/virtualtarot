import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, History, Moon, Sun, Info, Star, LogIn, LogOut, User } from 'lucide-react';
import TarotFlow from './components/TarotFlow';
import DailyTarot from './components/DailyTarot';
import ReadingHistory from './components/ReadingHistory';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import StarryBackground from './components/StarryBackground';

type View = 'landing' | 'reading' | 'daily' | 'history';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-mystic-bg selection:bg-gold/20">
      <StarryBackground />
      
      {/* Mystical Background Accents */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cosmic-purple/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-cosmic-purple/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 mystic-gradient opacity-30" />
      </div>

      {/* Navigation */}
      <header className="relative z-50 border-b border-white/5 bg-gradient-to-r from-cosmic-purple/10 via-cosmic-dark/40 to-gold/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-2 group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20 group-hover:rotate-12 transition-transform">
              <Sun className="text-cosmic-dark w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-[0.2em] text-white uppercase">Virtual<span className="text-gold">Tarot</span></span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { id: 'daily', icon: Calendar, label: 'ดวงประจำวัน' },
              { id: 'reading', icon: Sparkles, label: 'ดูดวง' },
              { id: 'history', icon: History, label: 'บันทึกดวง' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as View)}
                className={cn(
                  "flex items-center gap-2 font-sans font-medium text-xs tracking-widest uppercase transition-all hover:text-gold hover:shadow-glow-gold/10 px-2 py-1 rounded-lg",
                  view === item.id ? "text-gold" : "text-gray-400"
                )}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </nav>
          
          <button 
            onClick={() => setView('reading')}
            className="bg-gold text-cosmic-dark px-6 py-2 rounded-full font-sans font-bold text-xs tracking-widest hover:scale-105 transition-all shadow-lg shadow-gold/20 mr-4"
          >
            เริ่มดูดวง
          </button>

          {session ? (
            <div className="flex items-center gap-4">
               <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 font-sans uppercase tracking-widest">ยินดีต้อนรับ</span>
                  <span className="text-xs text-white font-medium">{session.user.email}</span>
               </div>
               <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 hover:text-red-400"
                title="ออกจากระบบ"
               >
                 <LogOut size={16} />
               </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-sans font-bold tracking-widest text-white"
            >
              <LogIn size={14} /> เข้าสู่ระบบ
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-8 pb-20">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6"
            >
              <section className="py-20 flex flex-col items-center text-center space-y-12">
                <motion.div
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.2 }}
                   className="space-y-6 max-w-4xl"
                >
                  <p className="text-gold font-sans font-bold tracking-[0.3em] uppercase text-sm animate-pulse">เผยความลับสวรรค์เพียงปลายนิ้วสัมผัส</p>
                  <h1 className="text-7xl md:text-8xl font-serif italic text-white leading-tight">
                    ดูดวงไพ่ยิปซีด้วย <span className="text-gold">AI</span>
                  </h1>
                  <p className="text-xl text-gray-400 font-sans max-w-2xl mx-auto leading-relaxed">
                    เปิดไพ่เพื่อค้นหาคำตอบของชีวิต ด้วยภูมิปัญญาจากไพ่ทาโรต์ผสมผสานกับเทคโนโลยี AI อันล้ำสมัย
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center gap-6"
                >
                  <button 
                    onClick={() => setView('reading')}
                    className="px-10 py-4 rounded-2xl bg-white text-cosmic-dark font-sans font-bold tracking-widest hover:bg-gold transition-all shadow-2xl"
                  >
                    เริ่มดูดวง
                  </button>
                  <button 
                    onClick={() => setView('daily')}
                    className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 font-sans font-bold tracking-widest hover:bg-white/10 transition-all"
                  >
                    เช็กดวงประจำวัน
                  </button>
                </motion.div>

                {/* Pricing Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="w-full pt-20"
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif italic text-white mb-4">เลือก <span className="text-gold">แพ็กเกจมงคล</span></h2>
                    <p className="text-gray-400">ปลดล็อกความลี้ลับของจักรวาลด้วยคำทำนายที่เจาะลึกยิ่งขึ้น</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {[
                      { name: "สายมูเริ่มต้น", price: 0, readings: "3 ครั้ง / วัน", features: ["ดูดวงทั่วไป", "ดวงประจำวัน", "เลขมงคลระดับพื้นฐาน"] },
                      { name: "สายมูตัวจริง", price: 99, readings: "ไม่จำกัด", features: ["ดูดวงทุกหมวดหมู่", "ประวัติการดูดวงถาวร", "เลขมงคลเจาะลึกรายวัน"], popular: true },
                      { name: "สายมู VIP", price: 299, readings: "ไม่จำกัด", features: ["ถาม AI ได้ไม่จำกัด", "วิเคราะห์ดวงรายเดือน", "สีมงคลตามวันเกิด"] },
                    ].map((plan, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "relative p-8 rounded-[2.5rem] bg-white/5 border transition-all hover:scale-105 flex flex-col h-full",
                          plan.popular ? "border-gold bg-gold/5 shadow-2xl shadow-gold/10" : "border-white/10"
                        )}
                      >
                        {plan.popular && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold px-4 py-1 rounded-full text-xs font-bold text-cosmic-dark uppercase tracking-widest">
                            ยอดนิยม
                          </div>
                        )}
                        <h3 className="text-xl font-serif font-bold text-white mb-2">{plan.name}</h3>
                        <div className="mb-6">
                          <span className="text-4xl font-serif font-bold text-gold">
                            {plan.price === 0 ? "ฟรี" : new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(plan.price)}
                          </span>
                          {plan.price > 0 && <span className="text-gray-500 text-sm ml-2">/ เดือน</span>}
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                          {plan.features.map((f, j) => (
                            <li key={j} className="flex items-center gap-3 text-sm text-gray-400 font-sans">
                              <Star size={12} className="text-gold flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button 
                          onClick={() => setView('reading')}
                          className={cn(
                            "w-full py-3 rounded-xl font-sans font-bold text-xs tracking-widest uppercase transition-all shadow-lg",
                            plan.popular 
                              ? "bg-gold text-cosmic-dark hover:bg-gold/80 hover:shadow-glow-gold animate-shine" 
                              : "bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:shadow-glow-purple"
                          )}
                        >
                          {plan.price === 0 ? "เริ่มใช้ฟรี" : "สมัครสมาชิก"}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20 w-full text-left">
                    {[
                      { icon: Moon, title: "แม่นยำลึกซึ้ง", desc: "AI วิเคราะห์สัญลักษณ์ไพ่ให้สอดคล้องกับพฤติกรรมและแนวทางชีวิตของคุณอย่างละเอียด" },
                      { icon: Star, title: "คำแนะนำมงคล", desc: "รับคำทำนายที่เต็มไปด้วยพลังบวกและเข็มทิศในการดำเนินชีวิต" },
                      { icon: Sun, title: "อัปเดตดวงทุกวัน", desc: "ส่องดวงรายวันพร้อมเลขมงคลและสีนำโชคเพื่อสร้างความมั่นใจในทุกย่างก้าว" },
                    ].map((feature, i) => (
                      <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-gold/30 hover:shadow-glow-gold transition-all group">
                        <feature.icon className="text-gold mb-6 group-hover:scale-110 transition-transform" size={32} />
                        <h3 className="text-2xl font-serif font-bold text-white mb-2">{feature.title}</h3>
                        <p className="text-gray-400 font-sans text-sm">{feature.desc}</p>
                      </div>
                    ))}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'reading' && <TarotFlow key="reading" />}
          {view === 'daily' && <DailyTarot key="daily" />}
          {view === 'history' && <ReadingHistory key="history" />}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-500 text-xs font-sans tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <Sun size={16} className="text-gold" />
            <span>&copy; 2024 VirtualTarot</span>
          </div>
          <div className="flex gap-8">
            <button className="hover:text-gold hover:shadow-glow-gold/20 transition-all">Privacy</button>
            <button className="hover:text-gold hover:shadow-glow-gold/20 transition-all">Support</button>
            <button className="hover:text-gold hover:shadow-glow-gold/20 transition-all">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

