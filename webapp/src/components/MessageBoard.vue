<template>
  <div class="message-board">
    {{ message }}
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.message-board {
  /* padding: 15px; */
  text-align: center;
  color: red;
  font-size: 2em;
  font-weight: bold;
  text-shadow: -2px -2px 0 #ffc107, 2px -2px 0 #ffc107, -2px 2px 0 #ffc107, 2px 2px 0 #ffc107;
  min-height: 50px;
}
</style> 