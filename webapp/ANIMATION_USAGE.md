# Використання анімації карт з useCardLogic.js

## Огляд

Анімація карт в проекті реалізована через `useCardLogic.js` composable, який надає дві основні функції:

- `animateCardFlip(index, delay)` - просте перевертання карти
- `animateCardReveal(index, card, delay)` - відкриття карти з заміною даних

## Як використовувати в інших composables

### 1. Передача функцій анімації як параметрів

```javascript
// В App.vue
const {
  animateCardFlip,
  animateCardReveal
} = useCardLogic(gameState, hand, held, flippingCards, flippedCards);

// Передача в інший composable
const {
  startDouble,
  selectCard
} = useDoubleLogic(
  gameState,
  hand,
  message,
  currentWinnings,
  revealedCard,
  hiddenCards,
  selectedCardIndex,
  balance,
  animateCardReveal,  // ← передаємо функцію
  animateCardFlip     // ← передаємо функцію
);
```

### 2. Використання в composable

```javascript
// useDoubleLogic.js
export function useDoubleLogic(
  gameState, 
  hand, 
  message, 
  currentWinnings, 
  revealedCard, 
  hiddenCards, 
  selectedCardIndex,
  balance,
  animateCardReveal,  // ← отримуємо функцію
  animateCardFlip     // ← отримуємо функцію
) {
  
  const startDouble = async () => {
    // ... логіка створення карт ...
    
    // Анімація появи карт
    await animateCardReveal(0, hand[0], 0);
    for (let i = 1; i < 5; i++) {
      await animateCardReveal(i, hand[i], i * 200);
    }
  };

  const selectCard = async (index) => {
    // Відкриття обраної карти
    await animateCardReveal(index, { ...selectedCard, isHidden: false }, 0);
    
    // Додаткова анімація для ефекту
    await animateCardFlip(index, 500);
    
    // ... логіка порівняння ...
  };
}
```

## Приклади використання

### Просте перевертання карти

```javascript
// Перевернути карту з індексом 2 з затримкою 300ms
await animateCardFlip(2, 300);
```

### Відкриття нової карти

```javascript
// Відкрити нову карту на позиції 1
const newCard = { rank: 'A', suit: '♠', isHidden: false };
await animateCardReveal(1, newCard, 0);
```

### Послідовна анімація карт

```javascript
// Анімація появи всіх карт по черзі
for (let i = 0; i < 5; i++) {
  await animateCardReveal(i, hand[i], i * 150);
}
```

### Анімація з умовою

```javascript
if (isWinner) {
  // Додаткова анімація для виграшної карти
  await animateCardFlip(selectedIndex, 500);
}
```

## Параметри функцій

### animateCardFlip(index, delay)
- `index` (number) - індекс карти в руці (0-4)
- `delay` (number) - затримка перед початком анімації в мілісекундах

### animateCardReveal(index, card, delay)
- `index` (number) - індекс карти в руці (0-4)
- `card` (object) - об'єкт карти `{ rank, suit, isHidden }`
- `delay` (number) - затримка перед початком анімації в мілісекундах

## Важливі моменти

1. **Асинхронність**: Всі функції анімації повертають Promise, тому використовуйте `await`
2. **Стани**: Функції автоматично керують станами `flippingCards` та `flippedCards`
3. **CSS класи**: Анімація працює через CSS класи `card-flipping` та `card-flipped`
4. **Тривалість**: Анімація перевертання триває 300ms + 100ms затримки

## CSS анімація

Анімація реалізована через CSS 3D трансформації:

```css
.card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card-flipping .card-inner {
  transform: rotateY(180deg);
}
```
