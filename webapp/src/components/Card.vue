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
        <div class="rank">{{ rank }}</div>
        <div class="suit">{{ suit }}</div>
      </div>
      <div class="card-back" v-else>
        <div class="card-back-pattern">♠</div>
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
  height: 120px;
  border: 3px solid #333;
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
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card-flipping .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* padding: 1px 4px; */
  font-size: 30px;
  font-weight: bold;
}

.card-back {
  /* transform: rotateY(180deg); */
  background: url('../assets/card-back.png') center no-repeat #1a1a1a;
  background-size: cover;
  /* background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%); */
  width: 100%;
  height: 100%;
  /* border: 2px solid #666; */
  align-items: center;
  justify-content: center;
  color: #000000;
}

/* .card:hover {
  transform: translateY(-5px);
} */

.card.held {
  position: relative;
  border: 3px solid #ffc107;
  /* transform: translateY(-10px); */
  box-shadow: 0px 10px 15px rgba(255, 193, 7, 0.4);
}

.card.held:after {
  content: 'HOLD';
  position: relative;
  font-size: 24px;
  font-weight: bold;
  color: red;
  align-self: center;
  justify-self: center;
  top: -65%;
  left: 0;
  width: 100%;
  height: 100%;
}

.card.card-hidden {
  background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%);
  border: 2px solid #666;
}

.card.card-selectable:hover {
  /* transform: translateY(-8px); */
  box-shadow: 0px 10px 10px rgb(255 193 7);
}

.card .rank {
  align-self: flex-start;
  padding-left: 8px;
}

.card .suit {
  align-self: flex-end;
  padding-right: 8px;
}

.card-back-pattern {
  font-size: 32px;
  opacity: 0.7;
}
</style>