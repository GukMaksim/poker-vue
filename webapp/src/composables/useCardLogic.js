import { GAME_CONSTANTS } from './useGameState.js';
import { useCardAnimation } from './useCardAnimation.js';

export function useCardLogic(gameState, hand, held, flippingCards, flippedCards, isAnimating) {
  // Ініціалізуємо уніфіковану систему анімації
  const {
    animateCardFlip,
    animateCardReveal,
    animateDeal,
    animateDraw,
    animateDoubleUp,
    animateCardSelection,
    animateWinEffect,
    animateLoseEffect,
    animateTieEffect,
    animateShowOtherCards,
    ANIMATION_CONSTANTS
  } = useCardAnimation(flippingCards, flippedCards, hand, isAnimating);

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

  return {
    // Функції для роботи з картами
    isCardHidden,
    isCardSelectable,
    isCardFlipping,
    isCardFlipped,
    toggleHold,
    
    // Уніфіковані функції анімації
    animateCardFlip,
    animateCardReveal,
    animateDeal,
    animateDraw,
    animateDoubleUp,
    animateCardSelection,
    animateWinEffect,
    animateLoseEffect,
    animateTieEffect,
    animateShowOtherCards,
    
    // Константи для налаштування
    ANIMATION_CONSTANTS
  };
} 