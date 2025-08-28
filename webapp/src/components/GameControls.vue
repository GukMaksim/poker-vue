<template>
  <div class="controls">
    <div class="button-grid">
      <button disabled>
        MENU
      </button>
      
      <button @click="handleBetOne" :disabled="!canChangeBet" class="bet-button">
        BET ONE
      </button>
     
      <button @click="handleDouble" :disabled="!canDouble" class="double-button">
        DOUBLE UP
      </button>

      <button @click="handleDealDraw" :disabled="!canDealDraw" class="main-button">
        {{ dealDrawButtonText }}
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
  },
  isAnimating: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'deal-draw',
  'double',
  'bet-one'
]);

// Вычисляемые свойства для управления состоянием кнопок
const canDealDraw = computed(() => {
  return ['ready', 'dealt', 'finished', 'won', 'double-won'].includes(props.gameState) && !props.isAnimating;
});

const canDouble = computed(() => {
  return ['won', 'double-won'].includes(props.gameState) && props.currentWinnings > 0 && !props.isAnimating;
});

const canChangeBet = computed(() => {
  return ['ready', 'finished'].includes(props.gameState) && !props.isAnimating;
});

const dealDrawButtonText = computed(() => {
  if (props.gameState === 'dealt') return 'DRAW';
  if (props.gameState === 'won') return 'TAKE';
  if (props.gameState === 'double-won' && props.currentWinnings > 0) return 'TAKE';
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

</script>

<style scoped>
.button-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  justify-items: center;
  gap: 5px;
  padding: 10px;
}

.controls button {
  --size: 80px; /* розмір кнопки */
  --face: #f4f4f4; /* колір верхньої панелі */
  --border: #111; /* корпус */
  --shadow: #444; /* тінь */
  --text: #111; /* напис */
  --glow: #ffed4d; /* підсвітка */

  inline-size: var(--size);
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;

  font: bold 14px/1.2 Arial, sans-serif;
  text-transform: uppercase;
  color: var(--text);

  background: var(--face);
  border: 4px solid var(--border);
  border-radius: 6px;
  box-shadow:
    0 2px 0 var(--shadow) inset,
    0 6px 10px rgba(0, 0, 0, 0.6),
    0 0 12px 2px var(--glow) inset;
  cursor: pointer;
  user-select: none;
  transition: transform .1s, box-shadow .2s, filter .2s;
}

.controls button:hover:not(:disabled) {
  /* background: #fff6a0; */
}

.controls button:active {
  transform: translateY(3px);
  box-shadow:
    0 1px 0 var(--shadow) inset,
    0 3px 6px rgba(0, 0, 0, 0.6),
    0 0 6px 1px var(--glow) inset;
}

.controls button:disabled {
  background: #bbb;
  color: #666;
  border-color: #444;
  cursor: not-allowed;
  box-shadow:
    0 2px 0 #555 inset,
    0 4px 6px rgba(0, 0, 0, 0.5);
  filter: grayscale(0.5) brightness(0.9);
}
</style>