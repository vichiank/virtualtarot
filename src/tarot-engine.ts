import { TarotCard, DrawnCard, SpreadType, SPREADS } from './types';

export function shuffleDeck(deck: TarotCard[]): TarotCard[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function drawCards(deck: TarotCard[], count: number): DrawnCard[] {
  const shuffled = shuffleDeck(deck);
  return shuffled.slice(0, count).map(card => ({
    cardId: card.id,
    position: '', // To be assigned by spread
    isReversed: Math.random() > 0.8, // 20% chance of reversal
  }));
}

export function createSpread(deck: TarotCard[], type: SpreadType): DrawnCard[] {
  const positions = SPREADS[type];
  const cards = drawCards(deck, positions.length);
  return cards.map((card, idx) => ({
    ...card,
    position: positions[idx],
  }));
}
