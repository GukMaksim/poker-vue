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
  animateDoubleUp,
  animateCardSelection,
  animateWinEffect,
  animateLoseEffect,
  animateTieEffect,
  animateShowOtherCards
) {
  
  const startDouble = async () => {
    // Створюємо нову колоду для подвоєння
    const newDeck = shuffleDeck(createDeck());

    // Перша карта відкрита
    revealedCard.value = newDeck[0];

    // Інші 4 карти закриті
    hiddenCards.value = newDeck.slice(1, 5);

    // Підготовка карт для подвоєння
    const doubleCards = [
      { ...revealedCard.value, isHidden: false },
      { ...hiddenCards.value[0], isHidden: true },
      { ...hiddenCards.value[1], isHidden: true },
      { ...hiddenCards.value[2], isHidden: true },
      { ...hiddenCards.value[3], isHidden: true }
    ];

    // Оновлюємо руку
    hand[0] = doubleCards[0];
    hand[1] = doubleCards[1];
    hand[2] = doubleCards[2];
    hand[3] = doubleCards[3];
    hand[4] = doubleCards[4];

    gameState.value = GAME_CONSTANTS.GAME_STATES.DOUBLING;
    
    // Уніфікована анімація появи карт для подвоєння
    // await animateDoubleUp(doubleCards);
  };

  const selectCard = async (index) => {
    if (gameState.value !== GAME_CONSTANTS.GAME_STATES.DOUBLING || index === 0) return;

    selectedCardIndex.value = index;
    const selectedCard = hand[index];

    // 1) Уніфікована анімація вибору карти
    await animateCardSelection(index, selectedCard);

    // 2) Порівнюємо після відкриття
    const comparison = compareCards(selectedCard, revealedCard.value);

    if (comparison > 0) {
      // Виграш - подвоюємо
      currentWinnings.value *= 2;
      message.value = `YOU WIN ${currentWinnings.value} !`;

      // Уніфікована анімація ефекту виграшу
      // await animateWinEffect(index);

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
      
      // Уніфікована анімація ефекту програшу
      // await animateLoseEffect(index);
      
      gameState.value = GAME_CONSTANTS.GAME_STATES.READY;

    } else {
      // Нічия - залишаємо поточний виграш
      // Уніфікована анімація ефекту нічиї
      // await animateTieEffect(index);
      
      setTimeout(() => {
        gameState.value = GAME_CONSTANTS.GAME_STATES.DOUBLE_WON;
        hand.fill(null);
        message.value = `TIE! Double to ${currentWinnings.value * 2} ?`;
      }, 2000);
    }

    // 3) Уніфікована анімація показу інших карт
    // const order = [1, 2, 3, 4].filter((i) => i !== index);
    // await animateShowOtherCards(order, hand);
  };

  const collectWinnings = () => {
    balance.value += currentWinnings.value;

    setTimeout(() => {
      gameState.value = GAME_CONSTANTS.GAME_STATES.READY;
      hand.fill(null);
      currentWinnings.value = 0;
      winningCombo.value = null;
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

    // Підготовка карт для подвоєння
    const doubleCards = [
      { ...revealedCard.value, isHidden: false },
      { ...hiddenCards.value[0], isHidden: true },
      { ...hiddenCards.value[1], isHidden: true },
      { ...hiddenCards.value[2], isHidden: true },
      { ...hiddenCards.value[3], isHidden: true }
    ];

    // Оновлюємо руку
    hand[0] = doubleCards[0];
    hand[1] = doubleCards[1];
    hand[2] = doubleCards[2];
    hand[3] = doubleCards[3];
    hand[4] = doubleCards[4];

    // Повертаємося до стану подвоєння
    gameState.value = GAME_CONSTANTS.GAME_STATES.DOUBLING;
    
    // Уніфікована анімація появи нових карт для подвоєння
    // await animateDoubleUp(doubleCards);
  };

  return {
    startDouble,
    selectCard,
    collectWinnings,
    continueDouble
  };
} 