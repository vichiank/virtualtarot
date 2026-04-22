import { TarotCard } from './types';
import { supabase } from './lib/supabase';

// High-resolution local image fallbacks for standard deck
const MAJOR_IMAGES: Record<number, string> = {
    1: '/tarot/the-fool.jpg',
    2: '/tarot/the-magician.jpg',
    3: '/tarot/high-priestess.jpg',
    4: '/tarot/empress.jpg',
    5: '/tarot/emperor.jpg',
    6: '/tarot/hierophant.jpg',
    7: '/tarot/lovers.jpg',
    8: '/tarot/chariot.jpg',
    9: '/tarot/strength.jpg',
    10: '/tarot/hermit.jpg',
    11: '/tarot/wheel-of-fortune.jpg',
    12: '/tarot/justice.jpg',
    13: '/tarot/hanged-man.jpg',
    14: '/tarot/death.jpg',
    15: '/tarot/temperance.jpg',
    16: '/tarot/devil.jpg',
    17: '/tarot/tower.jpg',
    18: '/tarot/star.jpg',
    19: '/tarot/moon.jpg',
    20: '/tarot/sun.jpg',
    21: '/tarot/judgement.jpg',
    22: '/tarot/world.jpg',
};

let cachedCards: TarotCard[] | null = null;

export const getTarotCards = async (): Promise<TarotCard[]> => {
  if (cachedCards) return cachedCards;

  try {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      cachedCards = data.map(card => ({
        ...card,
        // Ensure image_url follows the requested format if not provided by DB
        image_url: card.image_url || MAJOR_IMAGES[card.id] || `/tarot/card-${card.id}.jpg`
      }));
      return cachedCards;
    }
  } catch (err) {
    console.error('Failed to fetch tarot cards from Supabase:', err);
  }

  // Fallback to minimal local structure or empty if absolutely necessary
  // In a real app, you would import a local JSON here
  return [];
};
