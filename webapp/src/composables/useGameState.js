import { ref, reactive, computed } from 'vue';

// Константи
export const GAME_CONSTANTS = {
  STARTING_BALANCE: 100,
  BET_AMOUNT: 1,
  GAME_STATES: {
    READY: 'ready',
    DEALT: 'dealt', 
    FINISHED: 'finished',
    WON: 'won',
    DOUBLING: 'doubling',
    DOUBLE_WON: 'double-won'
  }
};

export function useGameState() {
  // Основний стан гри
  const deck = ref([]);
  const hand = reactive(Array(5).fill(null));
  const held = reactive(Array(5).fill(false));
  const balance = ref(GAME_CONSTANTS.STARTING_BALANCE);
  const gameState = ref(GAME_CONSTANTS.GAME_STATES.READY);
  const message = ref('press DEAL to start');
  const winningCombo = ref(null);

  // Стан для подвоєння
  const currentWinnings = ref(0);
  const revealedCard = ref(null);
  const hiddenCards = ref([]);
  const selectedCardIndex = ref(null);

  // Стан для анімації карт
  const flippingCards = ref(new Set());
  const flippedCards = ref(new Set());

  // Обчислювані властивості
  const isDrawButtonDisabled = computed(() => {
    return (gameState.value === GAME_CONSTANTS.GAME_STATES.READY && balance.value < GAME_CONSTANTS.BET_AMOUNT) ||
           gameState.value === GAME_CONSTANTS.GAME_STATES.DOUBLING;
  });

  const canToggleHold = computed(() => {
    return gameState.value === GAME_CONSTANTS.GAME_STATES.DEALT;
  });

  const isInDoublingMode = computed(() => {
    return gameState.value === GAME_CONSTANTS.GAME_STATES.DOUBLING;
  });

  // Функції для скидання стану
  const resetGameState = () => {
    gameState.value = GAME_CONSTANTS.GAME_STATES.READY;
    hand.fill(null);
    held.fill(false);
    flippingCards.value.clear();
    flippedCards.value.clear();
    winningCombo.value = null;
    currentWinnings.value = 0;
    message.value = 'press DEAL to start';
  };

  const resetHand = () => {
    hand.fill(null);
    held.fill(false);
    flippingCards.value.clear();
    flippedCards.value.clear();
  };

  return {
    // Стан
    deck,
    hand,
    held,
    balance,
    gameState,
    message,
    winningCombo,
    currentWinnings,
    revealedCard,
    hiddenCards,
    selectedCardIndex,
    flippingCards,
    flippedCards,
    
    // Обчислювані властивості
    isDrawButtonDisabled,
    canToggleHold,
    isInDoublingMode,
    
    // Функції
    resetGameState,
    resetHand
  };
} 