<template>
  <div
    class="card"
    :class="{ held: isHeld }"
    :style="{ color: cardColor }"
    @click="$emit('toggleHold')"
  >
    <div class="rank">{{ rank }}</div>
    <div class="suit">{{ suit }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  rank: String,
  suit: String,
  isHeld: Boolean,
});

defineEmits(['toggleHold']);

const cardColor = computed(() => {
  return (props.suit === '♥' || props.suit === '♦') ? 'red' : 'black';
});
</script>

<style scoped>
.card {
  width: 80px;
  height: 120px;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
}

.card:hover {
  transform: translateY(-5px);
}

.card.held {
  border: 3px solid #ffc107;
  transform: translateY(-10px);
  box-shadow: 0px 10px 15px rgba(255, 193, 7, 0.4);
}

.card .suit {
  align-self: flex-end;
}
</style>