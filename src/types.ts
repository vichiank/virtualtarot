export interface TarotCard {
  id: number;
  name_en: string;
  name_th: string;
  arcana: 'Major' | 'Minor';
  suit: 'Cups' | 'Pentacles' | 'Swords' | 'Wands' | null;
  card_number: number | string;
  keywords: string[];
  meaning_upright: string;
  meaning_reversed: string;
  love_meaning: string;
  career_meaning: string;
  finance_meaning: string;
  lucky_numbers: number[];
  lucky_color: string;
  element: string;
  image_url?: string;
}

export interface TarotReading {
  id: string;
  userId: string;
  question: string;
  spreadType: SpreadType;
  createdAt: number;
  cards: DrawnCard[];
  interpretation?: string;
}

export interface DrawnCard {
  cardId: number;
  position: string;
  isReversed: boolean;
}

export type SpreadType = 'One Card' | 'Three Cards' | 'Love Spread' | 'Career Spread';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  questions: string[];
}

export const THAI_CATEGORIES: Category[] = [
  {
    id: 'love',
    name: 'ความรัก',
    description: 'เน้นเรื่องความสัมพันธ์ ความรู้สึก และเนื้อคู่',
    icon: '❤️',
    questions: ['เขาคิดกับเรายังไง', 'คนเก่าจะกลับมาไหม', 'ความสัมพันธ์นี้ควรไปต่อไหม', 'เราจะเจอคนใหม่ไหม']
  },
  {
    id: 'career',
    name: 'การงาน',
    description: 'วิเคราะห์โอกาส อุปสรรค และความก้าวหน้าในอาชีพ',
    icon: '💼',
    questions: ['ควรเปลี่ยนงานไหม', 'ปีนี้มีโอกาสเลื่อนตำแหน่งไหม', 'งานที่ทำอยู่เหมาะกับเราหรือไม่', 'ควรเริ่มธุรกิจไหม']
  },
  {
    id: 'finance',
    name: 'การเงิน',
    description: 'เช็กดวงโชคลาภ รายได้ และการลงทุนทางธุรกิจ',
    icon: '💰',
    questions: ['เดือนนี้การเงินจะดีไหม', 'มีโอกาสได้เงินก้อนหรือไม่', 'การลงทุนนี้ดีไหม']
  },
  {
    id: 'luck',
    name: 'โชคลาภ',
    description: 'เน้นดวงเฮง โชคลาภลอย และเลขนำโชค',
    icon: '🍀',
    questions: ['ช่วงนี้มีดวงโชคลาภไหม', 'ควรเสี่ยงโชคไหม', 'เลขมงคลของฉันคืออะไร']
  },
  {
    id: 'general',
    name: 'ไพ่ยิปซีทั่วไป',
    description: 'ปรึกษาปัญหาชีวิตทั่วไป หรือดวงรอบด้านในช่วงนี้',
    icon: '🔮',
    questions: ['ดวงทั่วไปในช่วงนี้เป็นอย่างไร', 'มีอะไรที่ควรระวังเป็นพิเศษไหม', 'สิ่งที่มุ่งหวังจะสำเร็จหรือไม่']
  }
];

export const SPREADS: Record<SpreadType, string[]> = {
  'One Card': ['คำทำนายหลัก'],
  'Three Cards': ['อดีต', 'ปัจจุบัน', 'อนาคต'],
  'Love Spread': ['อิทธิพลในอดีต', 'สถานะปัจจุบัน', 'แนวโน้มในอนาคต', 'คำแนะนำ'],
  'Career Spread': ['สถานการณ์ปัจจุบัน', 'อุปสรรค', 'ความก้าวหน้า', 'แผนการปฏิบัติ'],
};
