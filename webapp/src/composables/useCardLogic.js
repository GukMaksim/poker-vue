import { GAME_CONSTANTS } from './useGameState.js';

export function useCardLogic(gameState, hand, held, flippingCards, flippedCards) {
  // Функції для роботи з картами
  const isCardHidden = (index) => {
    if (gameState.value === GAME_CONSTANTS.GAME_STATES.DOUBLING) {
      if (index === 0) return false;
      // У режимі подвоєння керуємо прихованістю прапорцем isHidden на самій карті
      const card = hand[index];
      return !card || card.isHidden === true;
    }

    // Для початкової роздачі показуємо карти як закриті до анімації
    if (gameState.value === GAME_CONSTANTS.GAME_STATES.DEALT && hand[index] && hand[index].isHidden) {
      return true;
    }

    return false;
  };

  const isCardSelectable = (index) => {
    return gameState.value === GAME_CONSTANTS.GAME_STATES.DOUBLING && index > 0;
  };

  const isCardFlipping = (index) => {
    return flippingCards.value.has(index);
  };

  const isCardFlipped = (index) => {
    return flippedCards.value.has(index);
  };

  const toggleHold = (index) => {
    if (gameState.value !== GAME_CONSTANTS.GAME_STATES.DEALT) return;
    held[index] = !held[index];
  };

  // Функції для анімації карт
  const animateCardFlip = (index, delay = 0) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        flippingCards.value.add(index);

        setTimeout(() => {
          flippingCards.value.delete(index);
          flippedCards.value.add(index);

          setTimeout(() => {
            flippedCards.value.delete(index);
            resolve();
          }, 100);
        }, 300);
      }, delay);
    });
  };

  const animateCardReveal = (index, card, delay = 0) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        flippingCards.value.add(index);

        setTimeout(() => {
          flippingCards.value.delete(index);
          flippedCards.value.add(index);
          hand[index] = card;

          setTimeout(() => {
            flippedCards.value.delete(index);
            resolve();
          }, 100);
        }, 300);
      }, delay);
    });
  };

  return {
    isCardHidden,
    isCardSelectable,
    isCardFlipping,
    isCardFlipped,
    toggleHold,
    animateCardFlip,
    animateCardReveal
  };
} 