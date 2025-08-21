<template>
  <div class="hand-container">
    <template v-for="(card, index) in hand" :key="index">
      <Card 
        v-if="card" 
        :rank="card.rank" 
        :suit="card.suit" 
        :is-held="held[index]" 
        :is-hidden="isCardHidden(index)"
        :is-selectable="isCardSelectable(index)" 
        :is-flipping="isCardFlipping(index)"
        :is-flipped="isCardFlipped(index)" 
        @toggle-hold="toggleHold(index)" 
        @card-select="selectCard(index)" 
      />
      <div v-else class="card-placeholder" />
    </template>
  </div>
</template>

<script setup>
import Card from './Card.vue';

defineProps({
  hand: {
    type: Array,
    required: true
  },
  held: {
    type: Array,
    required: true
  },
  isCardHidden: {
    type: Function,
    required: true
  },
  isCardSelectable: {
    type: Function,
    required: true
  },
  isCardFlipping: {
    type: Function,
    required: true
  },
  isCardFlipped: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['toggle-hold', 'card-select']);

const toggleHold = (index) => {
  emit('toggle-hold', index);
};

const selectCard = (index) => {
  emit('card-select', index);
};
</script>

<style scoped>
.hand-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  min-height: 100px;
}

 .card-placeholder {
  background: url('../assets/card-back.png') center no-repeat #1a1a1a;
  background-size: cover;
  width: 80px;
  height: 15vh;
  align-items: center;
  justify-content: center;
  color: #000000;
 }
</style> 