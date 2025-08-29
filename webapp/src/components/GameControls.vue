<template>
  <div class="controls">
    <div class="button-grid">
      <div class="button-frame">
        <button disabled>
          MENU
        </button>
      </div>

      <div class="button-frame">
        <button @click="handleBetOne" :disabled="!canChangeBet" class="bet-button">
          BET ONE
        </button>
      </div>

      <div class="button-frame">
        <button @click="handleDouble" :disabled="!canDouble" class="double-button">
          DOUBLE UP
        </button>
      </div>

      <div class="button-frame">
        <button @click="handleDealDraw" :disabled="!canDealDraw" class="main-button">
          {{ dealDrawButtonText }}
        </button>
      </div>
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
  gap: 1px;
  padding: 10px 4px;
  background: gray;
  border-radius: 10px;
  box-shadow: inset -3px -3px 6px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.1);
}

.button-frame {
  --size: 76px;
  --border: #95949441;

  inline-size: var(--size);
  aspect-ratio: 1/1;
  display: grid;
  place-items: center;
  border: 4px solid var(--border);
  border-radius: 12px;
  background: #111; 
  /* чорна основа */
  box-shadow: 0 4px 8px rgba(0,0,0,0.7);
  position: relative;
  overflow: hidden;
}

.controls button {
  --face: #f4f4f4;        /* жовта поверхня */
  --face-light: #ffed4d;  /* світліший відтінок */
  --text: #222;           /* текст */

  inline-size: 100%;
  block-size: 100%;
  display: grid;
  place-items: center;

  font: bold 16px/1 Arial, sans-serif;
  color: var(--text);
  text-transform: uppercase;
  /* letter-spacing: 1px; */

  background: radial-gradient(circle at 30% 30%, var(--face-light), var(--face));
  border: none;
  border-radius: 6px;
  cursor: pointer;

  box-shadow:
    inset -6px -6px 12px rgba(0,0,0,0.25),
    inset 4px 4px 8px rgba(255,255,255,0.4);

  transition: transform 0.1s, box-shadow 0.1s;
  position: relative;
}

.controls button:before {
  content: "";
  position: absolute;
  inset: 8% 8% auto 8%;
  height: 30%;
  border-radius: 8px 8px 4px 4px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0));
  pointer-events: none;
}

.controls button:active {
  transform: translateY(6px);
  box-shadow:
    inset -4px -4px 8px rgba(0,0,0,0.35),
    inset 2px 2px 6px rgba(255,255,255,0.25);
}

.controls button:disabled {
  background: radial-gradient(circle at 30% 30%, #ddd, #aaa);
  color: #666;
  cursor: not-allowed;
  box-shadow:
    inset -3px -3px 6px rgba(0,0,0,0.3),
    inset 2px 2px 4px rgba(255,255,255,0.1);
}
</style>