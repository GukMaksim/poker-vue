const SUITS = ["♥", "♦", "♣", "♠"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const RANK_VALUES = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
  "J": 11, "Q": 12, "K": 13, "A": 14,
};

// Створення стандартної колоди з 52 карт
export function createDeck() {
  return SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })));
}

// Тасування колоди (алгоритм Фішера-Єйтса)
export function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Таблиця виплат (коефіцієнти)
export const PAYOUTS = {
  "Роял Флеш": 250,
  "Стріт Флеш": 50,
  "Каре": 25,
  "Фул-Хаус": 9,
  "Флеш": 6,
  "Стріт": 4,
  "Трійка": 3,
  "Дві пари": 2,
  "Пара": 1,
};

// Функція для перевірки комбінацій
export function evaluateHand(hand) {
  const ranks = hand.map(card => RANK_VALUES[card.rank]).sort((a, b) => a - b);
  const suits = hand.map(card => card.suit);
  const rankCounts = ranks.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {});
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  const isFlush = new Set(suits).size === 1;
  const isStraight = ranks[4] - ranks[0] === 4 && new Set(ranks).size === 5;
  const isAceLowStraight = JSON.stringify(ranks) === JSON.stringify([2, 3, 4, 5, 14]);

  if (isStraight && isFlush && ranks[4] === 14) return "Роял Флеш";
  if ((isStraight || isAceLowStraight) && isFlush) return "Стріт Флеш";
  if (counts[0] === 4) return "Каре";
  if (counts[0] === 3 && counts[1] === 2) return "Фул-Хаус";
  if (isFlush) return "Флеш";
  if (isStraight || isAceLowStraight) return "Стріт";
  if (counts[0] === 3) return "Трійка";
  if (counts[0] === 2 && counts[1] === 2) return "Дві пари";
  if (counts[0] === 2 && (ranks.some(r => r >= 4))) return "Пара";

  return null; // Немає комбінації
}