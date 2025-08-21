<template>
  <header class="payout-table">
    <ul>
      <li v-for="([combo, multiplier]) in Object.entries(PAYOUTS)" :key="combo"
        :class="{ 'highlight-combo': combo === winningCombo }">
        <span>{{ combo }}</span>
        <span>{{ multiplier * betAmount }}</span>
      </li>
    </ul>
  </header>
</template>

<script setup>
import { PAYOUTS } from '../logic/pokerLogic.js';

defineProps({
  winningCombo: {
    type: String,
    default: null
  },
  betAmount: {
    type: Number,
    required: true
  }
});
</script>

<style scoped>
.payout-table {
  background-color: rgba(0, 0, 0, 0.7);
  margin: 0;
  padding: 10px;
  border: #ffc107 1px solid;
  color: #ffc107;
  font-weight: bold;
}

.payout-table h3 {
  text-align: center;
  margin: 0 0 0.7em 0;
  font-size: 1em;
}

.payout-table .highlight-combo {
  color: #fff;
  background: #d32f2f;
  font-weight: bold;
  box-shadow: 0 0 8px #d32f2f;
  transition: background 0.2s;
}

.payout-table ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 1.5em;
}

.payout-table li {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #444;
  font-size: 0.8em;
}

.payout-table li:last-child {
  border-bottom: none;
}
</style>