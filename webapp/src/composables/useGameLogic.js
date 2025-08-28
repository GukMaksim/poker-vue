import { GAME_CONSTANTS } from './useGameState.js';
import { createDeck, shuffleDeck, evaluateHand, PAYOUTS } from '../logic/pokerLogic.js';

export function useGameLogic(
  deck,
  hand,
  held,
  balance,
  gameState,
  message,
  winningCombo,
  currentWinnings,
  animateDeal,
  animateDraw,
  betAmount
) {

  const dealInitialHand = async () => {
    if (balance.value < betAmount.value) {
      message.value = 'Недостатньо коштів!';
      return;
    }

    // Списуємо ставку
    balance.value -= betAmount.value;

    // Створюємо нову колоду та роздаємо карти
    const newDeck = shuffleDeck(createDeck());
    const newHand = newDeck.slice(0, 5);
    deck.value = newDeck.slice(5);

    // Скидаємо стан
    hand.fill({ rank: '', suit: '', isHidden: true });
    held.fill(false);
    winningCombo.value = null;
    gameState.value = GAME_CONSTANTS.GAME_STATES.DEALT;
    message.value = 'dealing cards...';

    // Уніфікована анімація роздачі карт
    await animateDeal(newHand);
    message.value = 'Choose cards to hold';
  };

  const replaceCards = async () => {
    let currentDeck = [...deck.value];
    const cardsToReplace = [];

    // Визначаємо які карти потрібно замінити
    hand.forEach((card, index) => {
      if (!held[index]) {
        cardsToReplace.push(index);
      }
    });

    // Підготовка нових карт для заміни
    const newCards = cardsToReplace.map(() => currentDeck.shift());

    // Уніфікована анімація заміни карт
    await animateDraw(cardsToReplace, newCards);
    deck.value = currentDeck;

    // Скидаємо статус held та перевіряємо результат
    held.fill(false);
    gameState.value = GAME_CONSTANTS.GAME_STATES.FINISHED;

    // Перевірка результату
    const result = evaluateHand(hand);
    if (result) {
      const payout = PAYOUTS[result] * betAmount.value;
      currentWinnings.value = payout;
      message.value = `${result}`;
      gameState.value = GAME_CONSTANTS.GAME_STATES.WON;
      winningCombo.value = result;
    } else {
      message.value = 'YOU LOSE';
    }
  };

  const startNewGame = () => {
    gameState.value = GAME_CONSTANTS.GAME_STATES.READY;
    hand.fill(null);
    message.value = 'press DEAL to start';
  };

  const handleDealDraw = async () => {
    switch (gameState.value) {
      case GAME_CONSTANTS.GAME_STATES.READY:
        await dealInitialHand();
        break;
      case GAME_CONSTANTS.GAME_STATES.DEALT:
        await replaceCards();
        break;
      case GAME_CONSTANTS.GAME_STATES.FINISHED:
        await dealInitialHand();
        break;
      case GAME_CONSTANTS.GAME_STATES.WON:
        // У стані WON кнопка DEAL працює як TAKE
        // Ця логіка обробляється в App.vue через handleDealDrawOrTake
        break;
    }
  };

  return {
    dealInitialHand,
    replaceCards,
    startNewGame,
    handleDealDraw
  };
} 