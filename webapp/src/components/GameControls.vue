<template>
  <div class="controls">
    <div class="button-grid">
      <button @click="handleDealDraw" :disabled="!canDealDraw" class="main-button">
        {{ dealDrawButtonText }}
      </button>

      <button @click="handleDouble" :disabled="!canDouble" class="double-button">
        DOUBLE UP
      </button>

      <button @click="handleBetOne" :disabled="!canChangeBet" class="bet-button">
        BET ONE
      </button>

      <button @click="handleMaxBet" :disabled="!canChangeBet" class="bet-button">
        MAX BET
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { GAME_CONSTANTS } from '../composables/useGameState.js';

const props = defineProps({
  gameState: {
    type: String,
    required: true
  },
  currentWinnings: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits([
  'deal-draw',
  'double',
  'bet-one',
  'max-bet'
]);

// Вычисляемые свойства для управления состоянием кнопок
const canDealDraw = computed(() => {
  return ['ready', 'dealt', 'finished'].includes(props.gameState);
});

const canDouble = computed(() => {
  return ['won', 'double-won'].includes(props.gameState) && props.currentWinnings > 0;
});

const canChangeBet = computed(() => {
  return ['ready', 'finished'].includes(props.gameState);
});

const dealDrawButtonText = computed(() => {
  if (props.gameState === 'dealt') return 'DRAW';
  return 'DEAL';
});

// Обработчики событий
const handleDealDraw = () => {
  emit('deal-draw');
};

const handleDouble = () => {
  if (props.gameState === 'won') {
    emit('double', 'start');
  } else if (props.gameState === 'double-won') {
    emit('double', 'continue');
  }
};

const handleBetOne = () => {
  emit('bet-one');
};

const handleMaxBet = () => {
  emit('max-bet');
};
</script>

<style scoped>
.button-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}

.controls button {
  padding: 15px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  border: 2px solid #ffc107;
  border-radius: 8px;
  transition: all 0.2s;
  background-color: #2c3e50;
  color: #ffc107;
}

.controls button:hover:not(:disabled) {
  background-color: #ffc107;
  color: #2c3e50;
}

.controls button:disabled {
  background-color: #1a1a1a;
  border-color: #666;
  color: #666;
  cursor: not-allowed;
}

.main-button {
  background-color: #2c3e50 !important;
}

.double-button {
  background-color: #c0392b !important;
  border-color: #e74c3c !important;
  color: #fff !important;
}

.double-button:hover:not(:disabled) {
  background-color: #e74c3c !important;
  color: #fff !important;
}

.bet-button {
  background-color: #27ae60 !important;
  border-color: #2ecc71 !important;
  color: #fff !important;
}

.bet-button:hover:not(:disabled) {
  background-color: #2ecc71 !important;
  color: #fff !important;
}

/* color: white !important;
} */

.double-button:hover {
  background-color: #ff5252 !important;
}

.double-controls {
  display: flex;
  gap: 10px;
}

.double-controls button {
  flex: 1;
  font-size: 1.2em;
  padding: 12px;
}

.collect-button {
  background-color: #4caf50 !important;
  color: white !important;
}

.collect-button:hover {
  background-color: #45a049 !important;
}

.continue-double-button {
  background-color: #ff9800 !important;
  color: white !important;
}

.continue-double-button:hover {
  background-color: #f57c00 !important;
}
</style>