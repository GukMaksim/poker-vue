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
  balance,
  animateCardReveal
) {
  
  const startDouble = () => {
    // Створюємо нову колоду для подвоєння
    const newDeck = shuffleDeck(createDeck());

    // Перша карта відкрита
    revealedCard.value = newDeck[0];

    // Інші 4 карти закриті
    hiddenCards.value = newDeck.slice(1, 5);

    // Оновлюємо руку (1-а відкрита, інші приховані)
    hand[0] = { ...revealedCard.value, isHidden: false };
    for (let i = 1; i < 5; i++) {
      hand[i] = { ...hiddenCards.value[i - 1], isHidden: true };
    }

    gameState.value = GAME_CONSTANTS.GAME_STATES.DOUBLING;
    // message.value = `choose a card higher than ${revealedCard.value.rank}`;
  };

  const selectCard = async (index) => {
    if (gameState.value !== GAME_CONSTANTS.GAME_STATES.DOUBLING || index === 0) return;

    selectedCardIndex.value = index;
    const selectedCard = hand[index];

    // 1) Відкриваємо обрану карту з анімацією
    await animateCardReveal(index, { ...selectedCard, isHidden: false }, 0);

    // 2) Порівнюємо після відкриття
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
      // message.value = `Нічия! ${selectedCard.rank}${selectedCard.suit} дорівнює ${revealedCard.value.rank}${revealedCard.value.suit}. Виграш залишається: $${currentWinnings.value}`;

      setTimeout(() => {
        gameState.value = GAME_CONSTANTS.GAME_STATES.DOUBLE_WON;
        hand.fill(null);
        message.value = `Double to ${currentWinnings.value * 2}?`;
      }, 2000);
    }

    // 3) Показуємо інші карти по черзі для наочності (анімовано)
    const order = [1, 2, 3, 4].filter((i) => i !== index);
    for (let step = 0; step < order.length; step++) {
      const idx = order[step];
      const cardToReveal = { ...hand[idx], isHidden: false };
      await animateCardReveal(idx, cardToReveal, step * 50);
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

  const continueDouble = async () => {
    // Створюємо нову колоду для наступного подвоєння
    const newDeck = shuffleDeck(createDeck());

    // Перша карта відкрита
    revealedCard.value = newDeck[0];

    // Інші 4 карти закриті
    hiddenCards.value = newDeck.slice(1, 5);

    // Оновлюємо руку (1-а відкрита, інші приховані)
    hand[0] = { ...revealedCard.value, isHidden: false };
    hand[1] = { ...hiddenCards.value[0], isHidden: true };
    hand[2] = { ...hiddenCards.value[1], isHidden: true };
    hand[3] = { ...hiddenCards.value[2], isHidden: true };
    hand[4] = { ...hiddenCards.value[3], isHidden: true };

    // Повертаємося до стану подвоєння (відкриватимемо після вибору гравця)
    gameState.value = GAME_CONSTANTS.GAME_STATES.DOUBLING;
  };

  return {
    startDouble,
    selectCard,
    collectWinnings,
    continueDouble
  };
} 