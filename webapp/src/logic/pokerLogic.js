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

// Отримання значення карти
export function getCardValue(card) {
  return RANK_VALUES[card.rank];
}

// Порівняння двох карт
export function compareCards(card1, card2) {
  const value1 = getCardValue(card1);
  const value2 = getCardValue(card2);
  
  if (value1 > value2) return 1;  // card1 більша
  if (value1 < value2) return -1; // card2 більша
  return 0; // карти рівні
}

// Таблиця виплат (коефіцієнти)
export const PAYOUTS = {
  "ROYAL FLUSH": 250,
  "STRAIGHT FLUSH": 50,
  "FOUR OF A KIND": 25,
  "FULL HOUSE": 9,
  "FLUSH": 6,
  "STRAIGHT": 4,
  "THREE OF A KIND": 3,
  "TWO PAIR": 2,
  "JACKS OR BETTER": 1,
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

  if (isStraight && isFlush && ranks[4] === 14) return "ROYAL FLUSH";
  if ((isStraight || isAceLowStraight) && isFlush) return "STRAIGHT FLUSH";
  if (counts[0] === 4) return "FOUR OF A KIND";
  if (counts[0] === 3 && counts[1] === 2) return "FULL HOUSE";
  if (isFlush) return "FLUSH";
  if (isStraight || isAceLowStraight) return "STRAIGHT";
  if (counts[0] === 3) return "THREE OF A KIND";
  if (counts[0] === 2 && counts[1] === 2) return "TWO PAIR";
  const pairs = Object.entries(rankCounts)
  .filter(([rank, count]) => count === 2)
  .map(([rank]) => Number(rank));
  if (counts[0] === 2 && pairs.some(r => r >= 11)) return "JACKS OR BETTER";

  return null; // Немає комбінації
}