# Уніфікована система анімації карт

## Огляд

Система анімації карт була повністю уніфікована для забезпечення однакової поведінки в усіх частинах гри: DEAL, DRAW та DOUBLE UP.

## Архітектура

### 1. useCardAnimation.js - Основний composable
Централізований модуль, який містить всі функції анімації та константи.

### 2. useCardLogic.js - Інтеграція
Інтегрує уніфіковану систему анімації з логікою карт.

### 3. Використання в composables
- `useGameLogic.js` - для DEAL та DRAW
- `useDoubleLogic.js` - для DOUBLE UP

## Константи анімації

```javascript
export const ANIMATION_CONSTANTS = {
  FLIP_DURATION: 300,    // Тривалість перевертання (ms)
  REVEAL_DELAY: 100,     // Затримка після відкриття (ms)
  DEAL_DELAY: 300,       // Затримка між картами при роздачі (ms)
  DOUBLE_DELAY: 200,     // Затримка між картами в подвоєнні (ms)
  DRAW_DELAY: 300,       // Затримка між картами при заміні (ms)
  EXTRA_FLIP_DELAY: 500, // Додаткова затримка для ефектів (ms)
  TIE_FLIP_DELAY: 300    // Затримка для нічиї (ms)
};
```

## Функції анімації

### Базові функції

#### animateCardFlip(index, delay)
- **Призначення**: Просте перевертання карти
- **Параметри**: 
  - `index` - індекс карти (0-4)
  - `delay` - затримка перед початком (ms)
- **Використання**: Для ефектів виграшу/програшу

#### animateCardReveal(index, card, delay)
- **Призначення**: Відкриття карти з заміною даних
- **Параметри**:
  - `index` - індекс карти (0-4)
  - `card` - об'єкт карти `{ rank, suit, isHidden }`
  - `delay` - затримка перед початком (ms)
- **Використання**: Для відкриття нових карт

### Спеціалізовані функції

#### animateDeal(newHand)
- **Призначення**: Анімація роздачі початкової руки
- **Параметри**: `newHand` - масив 5 карт
- **Використання**: При натисканні DEAL

#### animateDraw(cardsToReplace, newCards)
- **Призначення**: Анімація заміни карт
- **Параметри**:
  - `cardsToReplace` - масив індексів карт для заміни
  - `newCards` - масив нових карт
- **Використання**: При натисканні DRAW

#### animateDoubleUp(doubleCards)
- **Призначення**: Анімація появи карт для подвоєння
- **Параметри**: `doubleCards` - масив 5 карт для подвоєння
- **Використання**: При натисканні DOUBLE UP

#### animateCardSelection(index, selectedCard)
- **Призначення**: Анімація вибору карти в подвоєнні
- **Параметри**:
  - `index` - індекс обраної карти
  - `selectedCard` - обрана карта
- **Використання**: При виборі карти в режимі подвоєння

### Ефекти

#### animateWinEffect(index)
- **Призначення**: Анімація ефекту виграшу
- **Параметри**: `index` - індекс виграшної карти
- **Використання**: При виграші в подвоєнні

#### animateLoseEffect(index)
- **Призначення**: Анімація ефекту програшу
- **Параметри**: `index` - індекс програшної карти
- **Використання**: При програші в подвоєнні

#### animateTieEffect(index)
- **Призначення**: Анімація ефекту нічиї
- **Параметри**: `index` - індекс карти нічиї
- **Використання**: При нічиї в подвоєнні

#### animateShowOtherCards(order, hand)
- **Призначення**: Показ інших карт після вибору
- **Параметри**:
  - `order` - порядок показу карт
  - `hand` - поточна рука
- **Використання**: Після вибору карти в подвоєнні

## CSS анімація

### Основні стилі
```css
.card-inner {
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-flipping .card-inner {
  transform: rotateY(180deg);
}
```

### Додаткові ефекти
```css
.card-flipping {
  animation: cardShake 0.3s ease-in-out;
}

@keyframes cardShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
```

## Використання в коді

### В useGameLogic.js
```javascript
// Роздача карт
await animateDeal(newHand);

// Заміна карт
await animateDraw(cardsToReplace, newCards);
```

### В useDoubleLogic.js
```javascript
// Початок подвоєння
await animateDoubleUp(doubleCards);

// Вибір карти
await animateCardSelection(index, selectedCard);

// Ефекти
await animateWinEffect(index);
await animateLoseEffect(index);
await animateTieEffect(index);

// Показ інших карт
await animateShowOtherCards(order, hand);
```

## Переваги уніфікації

1. **Консистентність**: Всі анімації працюють однаково
2. **Налаштовуваність**: Легко змінювати тривалість через константи
3. **Підтримуваність**: Централізований код легше підтримувати
4. **Розширюваність**: Легко додавати нові типи анімацій
5. **Тестування**: Можна тестувати анімації окремо

## Налаштування

Для зміни тривалості анімацій відредагуйте константи в `useCardAnimation.js`:

```javascript
export const ANIMATION_CONSTANTS = {
  FLIP_DURATION: 300,    // Змініть на потрібну тривалість
  DEAL_DELAY: 300,       // Змініть затримку між картами
  // ... інші константи
};
```
