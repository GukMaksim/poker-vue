import { GAME_CONSTANTS } from './useGameState.js';

// Константи для анімації
export const ANIMATION_CONSTANTS = {
  FLIP_DURATION: 300,    // Тривалість перевертання (ms)
  REVEAL_DELAY: 500,     // Затримка після відкриття (ms)
  DEAL_DELAY: 300,       // Затримка між картами при роздачі (ms)
  DOUBLE_DELAY: 200,     // Затримка між картами в подвоєнні (ms)
  DRAW_DELAY: 300,       // Затримка між картами при заміні (ms)
  EXTRA_FLIP_DELAY: 500, // Додаткова затримка для ефектів (ms)
  TIE_FLIP_DELAY: 300    // Затримка для нічиї (ms)
};

export function useCardAnimation(flippingCards, flippedCards, hand, isAnimating) {
  
  /**
   * Уніфікована функція для перевертання карти
   * @param {number} index - індекс карти
   * @param {number} delay - затримка перед початком анімації
   * @returns {Promise} - Promise, який вирішується після завершення анімації
   */
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
          }, ANIMATION_CONSTANTS.REVEAL_DELAY);
        }, ANIMATION_CONSTANTS.FLIP_DURATION);
      }, delay);
    });
  };

  /**
   * Уніфікована функція для відкриття карти з заміною даних
   * @param {number} index - індекс карти
   * @param {Object} card - об'єкт карти { rank, suit, isHidden }
   * @param {number} delay - затримка перед початком анімації
   * @returns {Promise} - Promise, який вирішується після завершення анімації
   */
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
          }, ANIMATION_CONSTANTS.REVEAL_DELAY);
        }, ANIMATION_CONSTANTS.FLIP_DURATION);
      }, delay);
    });
  };

  /**
   * Анімація роздачі початкової руки (DEAL)
   * @param {Array} newHand - масив нових карт
   * @returns {Promise} - Promise, який вирішується після завершення всіх анімацій
   */
  const animateDeal = async (newHand) => {
    isAnimating.value = true;
    const animationPromises = newHand.map((card, index) =>
      animateCardReveal(index, card, index * ANIMATION_CONSTANTS.DEAL_DELAY)
    );
    await Promise.all(animationPromises);
    isAnimating.value = false;
  };

  /**
   * Анімація заміни карт (DRAW)
   * @param {Array} cardsToReplace - масив індексів карт для заміни
   * @param {Array} newCards - масив нових карт
   * @returns {Promise} - Promise, який вирішується після завершення всіх анімацій
   */
  const animateDraw = async (cardsToReplace, newCards) => {
    isAnimating.value = true;
    const animationPromises = cardsToReplace.map((index, delay) =>
      animateCardReveal(index, newCards[delay], delay * ANIMATION_CONSTANTS.DRAW_DELAY)
    );
    await Promise.all(animationPromises);
    isAnimating.value = false;
  };

  /**
   * Анімація появи карт для подвоєння (DOUBLE UP)
   * @param {Array} doubleCards - масив карт для подвоєння
   * @returns {Promise} - Promise, який вирішується після завершення всіх анімацій
   */
  const animateDoubleUp = async (doubleCards) => {
    isAnimating.value = true;
    // Перша карта відкрита одразу
    await animateCardReveal(0, doubleCards[0], 0);
    
    // Інші карти по черзі
    for (let i = 1; i < 5; i++) {
      await animateCardReveal(i, doubleCards[i], i * ANIMATION_CONSTANTS.DOUBLE_DELAY);
    }
    isAnimating.value = false;
  };

  /**
   * Анімація вибору карти в подвоєнні
   * @param {number} index - індекс обраної карти
   * @param {Object} selectedCard - обрана карта
   * @returns {Promise} - Promise, який вирішується після завершення анімації
   */
  const animateCardSelection = async (index, selectedCard) => {
    isAnimating.value = true;
    await animateCardReveal(index, { ...selectedCard, isHidden: false }, 0);
    isAnimating.value = false;
  };

  /**
   * Анімація ефекту виграшу
   * @param {number} index - індекс виграшної карти
   * @returns {Promise} - Promise, який вирішується після завершення анімації
   */
  const animateWinEffect = async (index) => {
    isAnimating.value = true;
    await animateCardFlip(index, ANIMATION_CONSTANTS.EXTRA_FLIP_DELAY);
    isAnimating.value = false;
  };

  /**
   * Анімація ефекту програшу
   * @param {number} index - індекс програшної карти
   * @returns {Promise} - Promise, який вирішується після завершення анімації
   */
  const animateLoseEffect = async (index) => {
    isAnimating.value = true;
    await animateCardFlip(index, ANIMATION_CONSTANTS.EXTRA_FLIP_DELAY);
    isAnimating.value = false;
  };

  /**
   * Анімація ефекту нічиї
   * @param {number} index - індекс карти нічиї
   * @returns {Promise} - Promise, який вирішується після завершення анімації
   */
  const animateTieEffect = async (index) => {
    isAnimating.value = true;
    await animateCardFlip(index, ANIMATION_CONSTANTS.TIE_FLIP_DELAY);
    isAnimating.value = false;
  };

  /**
   * Анімація показу інших карт після вибору в подвоєнні
   * @param {Array} order - порядок показу карт
   * @param {Array} hand - поточна рука
   * @returns {Promise} - Promise, який вирішується після завершення всіх анімацій
   */
  const animateShowOtherCards = async (order, hand) => {
    isAnimating.value = true;
    for (let step = 0; step < order.length; step++) {
      const idx = order[step];
      const cardToReveal = { ...hand[idx], isHidden: false };
      await animateCardReveal(idx, cardToReveal, step * 100);
    }
    isAnimating.value = false;
  };

  return {
    // Базові функції анімації
    animateCardFlip,
    animateCardReveal,
    
    // Спеціалізовані функції для різних сценаріїв
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
