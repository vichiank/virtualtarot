import { motion, AnimatePresence } from 'motion/react';
import { TarotCard as TarotCardType } from '../types';
import { cn } from '../lib/utils';

interface TarotCardProps {
  card?: TarotCardType;
  index?: number;
  isRevealed?: boolean;
  isReversed?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  showDetails?: boolean;
}

export default function TarotCard({
  card,
  isRevealed = false,
  isReversed = false,
  isSelected = false,
  onClick,
  className,
  showDetails = false,
}: TarotCardProps) {
  return (
    <div 
      className={cn(
        "relative w-[120px] h-[200px] cursor-pointer perspective-1000",
        className
      )}
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Card Back */}
        <div className="absolute inset-0 backface-hidden rounded-xl bg-cosmic-purple/10 border-2 border-gold/30 flex items-center justify-center p-2 tarot-card-shading overflow-hidden hover:shadow-glow-gold transition-all duration-300">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
            <div className="w-20 h-20 border-2 border-gold rotate-45 rounded-sm" />
            <div className="absolute w-28 h-28 border border-gold/50 rounded-full" />
          </div>
          <div className="relative z-10 text-gold/40 flex flex-col items-center">
            <span className="font-display text-[8px] tracking-[0.2em] uppercase">VirtualTarot</span>
          </div>
          
          {/* Shine Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="w-full h-full animate-shine" />
          </div>
        </div>

        {/* Card Front */}
        <div 
          className={cn(
            "absolute inset-0 backface-hidden rounded-xl bg-cosmic-dark border-2 border-gold shadow-2xl overflow-hidden hover:shadow-glow-gold transition-shadow duration-300",
            isReversed && "rotate-180" // Visual feedback for reversal
          )}
          style={{ transform: "rotateY(180deg)" }}
        >
          {card ? (
            <>
              <img 
                src={card.image_url} 
                alt={card.name_th || card.name_en}
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cosmic-dark via-transparent to-transparent" />
              <div className="absolute bottom-2 left-0 right-0 text-center px-1">
                <span className="font-display text-[10px] text-gold uppercase tracking-tighter line-clamp-1">
                  {card.name_th}
                </span>
                <span className="block text-[8px] text-white/40 uppercase tracking-widest font-sans scale-90">
                  {card.name_en}
                </span>
              </div>
            </>
          ) : (
             <div className="w-full h-full bg-cosmic-dark flex items-center justify-center">
                <span className="text-gold/20 font-serif">Mysterious</span>
             </div>
          )}
        </div>
      </motion.div>

      {/* Selection Glow */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -inset-2 rounded-2xl border border-gold/50 pointer-events-none gold-glow"
          />
        )}
      </AnimatePresence>

      {/* Reversal Marker */}
      {isRevealed && isReversed && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-cosmic-purple text-gold text-[8px] px-1.5 py-0.5 rounded-full z-20 font-bold uppercase tracking-wider shadow-lg">
          Reversed
        </div>
      )}
    </div>
  );
}
