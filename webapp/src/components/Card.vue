<template>
  <div
    class="card"
    :class="{ 
      held: isHeld, 
      'card-hidden': isHidden,
      'card-selectable': isSelectable,
      'card-flipping': isFlipping,
      'card-flipped': isFlipped
    }"
    :style="{ color: cardColor }"
    @click="handleClick"
  >
    <div class="card-inner">
      <div class="card-front" v-if="!isHidden">
        <div class="rank">
        <div>{{ rank }}</div>
        <div>{{ suit }}</div>
      </div>
        <div class="suit">{{ suit }}</div>
      </div>
      <div class="card-back" v-else>
        <!-- <div class="card-back-pattern">♠</div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  rank: String,
  suit: String,
  isHeld: Boolean,
  isHidden: {
    type: Boolean,
    default: false
  },
  isSelectable: {
    type: Boolean,
    default: false
  },
  isFlipping: {
    type: Boolean,
    default: false
  },
  isFlipped: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggleHold', 'cardSelect']);

const cardColor = computed(() => {
  return (props.suit === '♥' || props.suit === '♦') ? 'red' : 'black';
});

const handleClick = () => {
  if (props.isSelectable) {
    emit('cardSelect');
  } else {
    emit('toggleHold');
  }
};
</script>

<style scoped>
.card {
  width: 80px;
  height: 15vh;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
  perspective: 1000px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: left;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-flipping .card-inner {
  transform: rotateY(180deg);
}

/* Додаткові ефекти для різних типів анімації */
.card-flipping {
  animation: cardShake 0.3s ease-in-out;
}

@keyframes cardShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 26px;
  line-height: 1;
  font-weight: 500;
}

.card-back {
  background: url('../assets/card-back.png') center no-repeat #1a1a1a;
  background-size: cover;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  /* color: #000000; */
}

.card.held {
  position: relative;
  border: 1px solid #ffc107;
  box-shadow: 0px 10px 15px rgba(255, 193, 7, 0.4);
  background-color: #ededc9;
}

.card.held:after {
  content: 'HOLD';
  position: relative;
  font-size: 100%;
  font-weight: 300;
  color: #fff;
  padding: 0 4px;
  align-self: center;
  justify-self: center;
  top: -120%;
  left: 0;
  width: 100%;
  height: 100%;
}

.card.card-hidden {
  background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%);
  border: 2px solid #666;
}

.card.card-selectable:hover {
  box-shadow: 0px 10px 10px rgb(255 193 7);
}

.card .rank {
  align-self: flex-start;
  padding-left: 5px;
  padding-top: 3px;
  line-height: 0.9;
}

.card .suit {
  align-self: center;
  font-size: 48px;
}

/* .card-back-pattern {
  font-size: 32px;
  opacity: 0.7;
} */
</style>