<template>
  <div id="app-container">
    <header class="header">
      <h1>Покерний Автомат</h1>
      <div class="balance">Баланс: ${{ balance }}</div>
    </header>

    <div class="message-board">
      {{ message }}
    </div>

    <div class="hand-container">
      <template v-for="(card, index) in hand" :key="index">
        <Card
          v-if="card"
          :rank="card.rank"
          :suit="card.suit"
          :is-held="held[index]"
          @toggle-hold="toggleHold(index)"
        />
        <div v-else class="card-placeholder" />
      </template>
    </div>

    <div class="controls">
      <button @click="handleDealDraw" :disabled="isDrawButtonDisabled">
        <span v-if="gameState === 'ready'">Роздати</span>
        <span v-else-if="gameState === 'dealt'">Замінити</span>
        <span v-else-if="gameState === 'finished'">Нова гра</span>
      </button>
    </div>

<!--     <footer class="payout-table">
      <h3>Таблиця виплат (ставка {{ BET_AMOUNT }})</h3>
      <ul>
        <li v-for="([combo, multiplier]) in Object.entries(PAYOUTS)" :key="combo">
          <span>{{ combo }}</span>
          <span>${{ multiplier * BET_AMOUNT }}</span>
        </li>
      </ul>
    </footer> -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import Card from './components/Card.vue';
import { createDeck, shuffleDeck, evaluateHand, PAYOUTS } from './logic/pokerLogic';

// Початкові значення
const STARTING_BALANCE = 1000;
const BET_AMOUNT = 10;

// Реактивний стан
const deck = ref([]);
const hand = reactive(Array(5).fill(null));
const held = reactive(Array(5).fill(false));
const balance = ref(STARTING_BALANCE);
const gameState = ref('ready'); // 'ready', 'dealt', 'finished'
const message = ref('Натисніть "Роздати", щоб почати!');

// Ініціалізація колоди при завантаженні компонента
onMounted(() => {
  deck.value = shuffleDeck(createDeck());
});

// Функції гри
const handleDealDraw = () => {
  if (balance.value < BET_AMOUNT && gameState.value === 'ready') {
    message.value = 'Недостатньо коштів!';
    return;
  }

  if (gameState.value === 'ready') {
    // Нова роздача
    balance.value -= BET_AMOUNT;
    const newDeck = shuffleDeck(createDeck());
    const newHand = newDeck.slice(0, 5);

    deck.value = newDeck.slice(5);
    Object.assign(hand, newHand); // Оновлюємо реактивний масив
    held.fill(false);
    gameState.value = 'dealt';
    message.value = 'Виберіть карти для утримання';

  } else if (gameState.value === 'dealt') {
    // Заміна карт
    let currentDeck = [...deck.value];
    const newHand = hand.map((card, index) => {
      if (!held[index]) {
        return currentDeck.shift();
      }
      return card;
    });

    Object.assign(hand, newHand);
    deck.value = currentDeck;
    gameState.value = 'finished';

    // Перевірка результату
    const result = evaluateHand(newHand);
    if (result) {
      const payout = PAYOUTS[result] * BET_AMOUNT;
      balance.value += payout;
      message.value = `Вітаємо! У вас ${result}. Виграш: ${payout}`;
    } else {
      message.value = 'Цього разу не пощастило. Спробуйте ще!';
    }
  } else if (gameState.value === 'finished') {
    // Почати нову гру
    gameState.value = 'ready';
    hand.fill(null);
    message.value = 'Натисніть "Роздати", щоб почати!';
  }
};

const toggleHold = (index) => {
  if (gameState.value !== 'dealt') return;
  held[index] = !held[index];
};
</script>

<style>
/* Глобальні стилі - можна винести в окремий css файл, але для простоти залишимо тут */
body {
  background-color: #0d3b0d;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

#app-container {
  width: 100%;
  max-width: 500px;
  background-color: #001a00;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header { text-align: center; border-bottom: 2px solid #ffc107; padding-bottom: 10px; }
.header h1 { margin: 0; }
.balance { font-size: 1.2em; font-weight: bold; }

.message-board {
  background-color: rgba(0,0,0,0.3);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-size: 1.1em;
  min-height: 50px;
}

.hand-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  min-height: 120px;
}

.card-placeholder {
  width: 80px;
  height: 120px;
  border: 2px dashed #444;
  border-radius: 8px;
}

.controls button {
  width: 100%;
  padding: 15px;
  font-size: 1.5em;
  font-weight: bold;
  cursor: pointer;
  background-color: #ffc107;
  color: #333;
  border: none;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.controls button:hover:not(:disabled) {
  background-color: #ffda70;
}

.controls button:disabled {
    background-color: #555;
    cursor: not-allowed;
}

.payout-table { background-color: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; }
.payout-table h3 { text-align: center; margin-top: 0; }
.payout-table ul { list-style: none; padding: 0; margin: 0; }
.payout-table li { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #444; }
.payout-table li:last-child { border-bottom: none; }
</style>