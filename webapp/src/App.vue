<template>
  <div id="app-container">
    <PayoutTable :winning-combo="winningCombo" :bet-amount="betAmount" />

    <MessageBoard :message="message" />

    <HandDisplay :hand="hand" :held="held" :is-card-hidden="isCardHidden" :is-card-selectable="isCardSelectable"
      :is-card-flipping="isCardFlipping" :is-card-flipped="isCardFlipped" @toggle-hold="toggleHold"
      @card-select="selectCard" />

    <BalanceDisplay :balance="balance" :current-winnings="currentWinnings" :bet-amount="betAmount" />

    <GameControls :game-state="gameState" :current-winnings="currentWinnings" :is-animating="isAnimating" @deal-draw="handleDealDrawOrTake"
      @double="handleDouble" @bet-one="handleBetOne" />
      
    <Advertising />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { createDeck, shuffleDeck } from './logic/pokerLogic.js';

// Компоненти
import PayoutTable from './components/PayoutTable.vue';
import MessageBoard from './components/MessageBoard.vue';
import HandDisplay from './components/HandDisplay.vue';
import BalanceDisplay from './components/BalanceDisplay.vue';
import GameControls from './components/GameControls.vue';

// Composables
import { useGameState } from './composables/useGameState.js';
import { ref } from 'vue';
import { useCardLogic } from './composables/useCardLogic.js';
import { useGameLogic } from './composables/useGameLogic.js';
import { useDoubleLogic } from './composables/useDoubleLogic.js';
import Advertising from './components/Advertising.vue';

// Константи для ставок
const MAX_BET = 10;
const MIN_BET = 1;

// Реактивна ставка
const betAmount = ref(MIN_BET);

// Ініціалізація стану гри
const {
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
  isAnimating,
  isDrawButtonDisabled,
  canToggleHold,
  isInDoublingMode,
  resetGameState,
  resetHand
} = useGameState();

// Логіка карт
const {
  isCardHidden,
  isCardSelectable,
  isCardFlipping,
  isCardFlipped,
  toggleHold,
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
} = useCardLogic(gameState, hand, held, flippingCards, flippedCards, isAnimating);

// Основна логіка гри
const {
  handleDealDraw
} = useGameLogic(
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
);

// Логіка подвоєння
const {
  startDouble,
  selectCard,
  collectWinnings,
  continueDouble
} = useDoubleLogic(
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
);

// Нові методи для управління ставками
const handleBetOne = () => {
  if (betAmount.value >= MAX_BET) {
    betAmount.value = MIN_BET; // Повертаємося до мінімальної ставки
  } else {
    const newBet = betAmount.value + 1;
    if (balance.value >= newBet) {
      betAmount.value = newBet;
    }
  }
};

const handleMaxBet = () => {
  if (balance.value >= MAX_BET) {
    betAmount.value = MAX_BET;
  }
};

// Оновлений метод для обробки подвоєння
const handleDouble = async (action) => {
  if (action === 'start') {
    await startDouble();
  } else if (action === 'continue') {
    await continueDouble();
  }
};

// DEAL кнопка у стані double-won працює як TAKE
const handleDealDrawOrTake = async () => {
  if ((gameState.value === 'double-won' && currentWinnings.value > 0) || gameState.value === 'won') {
    collectWinnings();
    return;
  }
  await handleDealDraw();
};

// Ініціалізація колоди при завантаженні компонента
onMounted(() => {
  deck.value = shuffleDeck(createDeck());
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

/* Глобальні стилі */
body {
  background-color: #0d3b0d;
  color: white;
  font-family: 'Kanit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  margin: 0;
}

#app-container {
  width: 100vw;
  max-width: 500px;
  height: 100vh;
  background-color: #0025aa;
  /* border-radius: 15px; */
  padding: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}
</style>