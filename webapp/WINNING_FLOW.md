# Потік виграшу в грі

## Огляд

Після того, як гравець збирає виграшну комбінацію, він може або забрати виграш, або подвоїти його.

## Стани гри

### 1. Стан WON
- **Коли встановлюється**: Після збору виграшної комбінації в основній грі
- **Доступні кнопки**: 
  - `TAKE` - забрати виграш
  - `DOUBLE UP` - подвоїти виграш
- **Повідомлення**: `"{COMBO} - TAKE or DOUBLE UP?"`

### 2. Стан DOUBLE_WON
- **Коли встановлюється**: Після виграшу в режимі подвоєння
- **Доступні кнопки**:
  - `TAKE` - забрати виграш
  - `DOUBLE UP` - подвоїти виграш ще раз
- **Повідомлення**: `"YOU WIN! Double to {amount} or TAKE?"`

## Логіка кнопок

### Кнопка TAKE
```javascript
// В App.vue
const handleDealDrawOrTake = async () => {
  if ((gameState.value === 'double-won' && currentWinnings.value > 0) || gameState.value === 'won') {
    collectWinnings(); // Забирає виграш
    return;
  }
  await handleDealDraw();
};
```

### Кнопка DOUBLE UP
```javascript
// В GameControls.vue
const handleDouble = () => {
  if (props.gameState === 'won') {
    emit('double', 'start'); // Почати подвоєння
  } else if (props.gameState === 'double-won') {
    emit('double', 'continue'); // Продовжити подвоєння
  }
};
```

## Функція collectWinnings

```javascript
const collectWinnings = () => {
  balance.value += currentWinnings.value; // Додає виграш до балансу
  message.value = `Виграш $${currentWinnings.value} додано до балансу!`;

  setTimeout(() => {
    gameState.value = GAME_CONSTANTS.GAME_STATES.READY; // Повертає до початкового стану
    hand.fill(null);
    currentWinnings.value = 0;
    winningCombo.value = null;
    message.value = 'press DEAL to start';
  }, 100);
};
```

## Послідовність дій

1. **Гравець виграє** → стан `WON`
2. **Вибір гравця**:
   - **TAKE** → виграш додається до балансу, гра скидається
   - **DOUBLE UP** → перехід до режиму подвоєння
3. **В режимі подвоєння**:
   - **Виграш** → стан `DOUBLE_WON`, можна подвоїти ще раз або забрати
   - **Програш** → втрата всього виграшу
   - **Нічия** → виграш залишається, можна подвоїти ще раз або забрати

## Приклади повідомлень

- `"ROYAL FLUSH - TAKE or DOUBLE UP?"` - після виграшу в основній грі
- `"YOU WIN! Double to 100 or TAKE?"` - після виграшу в подвоєнні
- `"TIE! Double to 50 or TAKE?"` - після нічиї в подвоєнні
- `"Виграш $25 додано до балансу!"` - після забирання виграшу
