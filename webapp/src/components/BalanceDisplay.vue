<template>
  <div class="balance-container-wrapper">
    <div class="balance-container">
      <div class="currentWinnings">WIN {{ currentWinnings }}</div>
      <div class="balance">CREDITS {{ balance }}</div>
    </div>
    <div class="bet-container">
      <div class="bet">BET {{ betAmount }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  balance: {
    type: Number,
    required: true
  },
  currentWinnings: {
    type: Number,
    default: 0
  },
  betAmount: {
    type: Number,
    required: true
  }
});
</script>

<style scoped>
.balance-container,
.bet-container {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;

  font-size: 2em;
  font-weight: bold;
  line-height: 1.2;
}


.currentWinnings {
  color: red;
  text-shadow: -2px -2px 0 #ffc107, 2px -2px 0 #ffc107, -2px 2px 0 #ffc107, 2px 2px 0 #ffc107;
}

.bet {}

.balance {
  color: red;
  text-shadow: -2px -2px 0 #ffc107, 2px -2px 0 #ffc107, -2px 2px 0 #ffc107, 2px 2px 0 #ffc107;
}
</style>