import { GAME_CONSTANTS } from './useGameState.js';
import { createDeck, shuffleDeck, compareCards } from '../logic/pokerLogic.js';

export function useDoubleLogic(
  gameState, 
  hand, 
  message, 
  currentWinnings, 
  revealedCard, 
  hiddenCards, 
  selectedCardIndex,
  balance
) {
  
  const startDouble = () => {
    // Створюємо нову колоду для подвоєння
    const newDeck = shuffleDeck(createDeck());

    // Перша карта відкрита
    revealedCard.value = newDeck[0];

    // Інші 4 карти закриті
    hiddenCards.value = newDeck.slice(1, 5);

    // Оновлюємо руку
    hand[0] = revealedCard.value;
    for (let i = 1; i < 5; i++) {
      hand[i] = hiddenCards.value[i - 1];
    }

    gameState.value = GAME_CONSTANTS.GAME_STATES.DOUBLING;
    message.value = `choose a card higher than ${revealedCard.value.rank}`;
  };

  const selectCard = (index) => {
    if (gameState.value !== GAME_CONSTANTS.GAME_STATES.DOUBLING || index === 0) return;

    selectedCardIndex.value = index;
    const selectedCard = hand[index];
    const comparison = compareCards(selectedCard, revealedCard.value);

    if (comparison > 0) {
      // Виграш - подвоюємо
      currentWinnings.value *= 2;
      message.value = `YOU WIN ${currentWinnings.value} !`;

      // Переходимо до стану вибору дії
      gameState.value = GAME_CONSTANTS.GAME_STATES.DOUBLE_WON;

      // Пропонуємо подвоїти ще раз або забрати
      setTimeout(() => {
        message.value = `Double to ${currentWinnings.value * 2} ?`;
      }, 2000);

    } else if (comparison < 0) {
      // Програш - втрачаємо все
      currentWinnings.value = 0;
      message.value = `YOU LOSE`;
      gameState.value = GAME_CONSTANTS.GAME_STATES.READY;

    } else {
      // Нічия - залишаємо поточний виграш
      message.value = `Нічия! ${selectedCard.rank}${selectedCard.suit} дорівнює ${revealedCard.value.rank}${revealedCard.value.suit}. Виграш залишається: $${currentWinnings.value}`;

      setTimeout(() => {
        gameState.value = GAME_CONSTANTS.GAME_STATES.DOUBLE_WON;
        hand.fill(null);
        message.value = `Double to ${currentWinnings.value * 2}?`;
      }, 2000);
    }
  };

  const collectWinnings = () => {
    balance.value += currentWinnings.value;
    message.value = `Виграш $${currentWinnings.value} додано до балансу!`;

    setTimeout(() => {
      gameState.value = GAME_CONSTANTS.GAME_STATES.READY;
      hand.fill(null);
      currentWinnings.value = 0;
      message.value = 'press DEAL to start';
    }, 100);
  };

  const continueDouble = () => {
    // Створюємо нову колоду для наступного подвоєння
    const newDeck = shuffleDeck(createDeck());

    // Перша карта відкрита
    revealedCard.value = newDeck[0];

    // Інші 4 карти закриті
    hiddenCards.value = newDeck.slice(1, 5);

    // Оновлюємо руку
    hand[0] = revealedCard.value;
    for (let i = 1; i < 5; i++) {
      hand[i] = hiddenCards.value[i - 1];
    }

    // Повертаємося до стану подвоєння
    gameState.value = GAME_CONSTANTS.GAME_STATES.DOUBLING;
    message.value = `choose a card higher than ${revealedCard.value.rank}`;
  };

  return {
    startDouble,
    selectCard,
    collectWinnings,
    continueDouble
  };
} 