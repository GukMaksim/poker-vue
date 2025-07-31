<template>
	<div id="app-container">
		<header class="payout-table">
			<!-- <h3>Таблиця виплат (ставка {{ BET_AMOUNT }})</h3> -->
			<ul>
				<li v-for="([combo, multiplier]) in Object.entries(PAYOUTS)" :key="combo">
					<span>{{ combo }}</span>
					<span>{{ multiplier * BET_AMOUNT }}</span>
				</li>
			</ul>
		</header>

		<div class="message-board">
			{{ message }}
		</div>

		<div class="hand-container">
			<template v-for="(card, index) in hand" :key="index">
				<Card v-if="card" :rank="card.rank" :suit="card.suit" :is-held="held[index]" :is-hidden="isCardHidden(index)"
					:is-selectable="isCardSelectable(index)" :is-flipping="isCardFlipping(index)"
					:is-flipped="isCardFlipped(index)" @toggle-hold="toggleHold(index)" @card-select="selectCard(index)" />
				<div v-else class="card-placeholder" />
			</template>
		</div>

		<div class="balance-container">
			<div>BET {{ BET_AMOUNT }}</div>
			<div class="balance">CREDITS {{ balance }}</div>
		</div>

		<div class="controls">
			<!-- Кнопка для основної гри -->
			<button v-if="gameState === 'ready' || gameState === 'dealt' || gameState === 'finished'" @click="handleDealDraw"
				:disabled="isDrawButtonDisabled">
				<span v-if="gameState === 'ready'">Deal</span>
				<span v-else-if="gameState === 'dealt'">Change</span>
				<span v-else-if="gameState === 'finished'">New Game</span>
			</button>

			<!-- Кнопка подвоєння -->

			<!-- Кнопки для режиму подвоєння -->
			<div v-if="gameState === 'won'" class="double-controls">
				<button @click="collectWinnings" class="collect-button">
					Take (${{ currentWinnings }})
				</button>
				<button @click="startDouble" class="double-button">
					Double (x2)
				</button>
			</div>

			<!-- Кнопки після успішного подвоєння -->
			<div v-if="gameState === 'double-won'" class="double-controls">
				<button @click="collectWinnings" class="collect-button">
					Take (${{ currentWinnings }})
				</button>
				<button @click="continueDouble" class="continue-double-button">
					Double (x2)
				</button>
			</div>
		</div>


	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import Card from './components/Card.vue';
import { createDeck, shuffleDeck, evaluateHand, PAYOUTS, compareCards } from './logic/pokerLogic';

// Початкові значення
const STARTING_BALANCE = 100;
const BET_AMOUNT = 10;

// Реактивний стан
const deck = ref([]);
const hand = reactive(Array(5).fill(null));
const held = reactive(Array(5).fill(false));
const balance = ref(STARTING_BALANCE);
const gameState = ref('ready'); // 'ready', 'dealt', 'finished', 'won', 'doubling', 'double-won'
const message = ref('press DRAW to start');

// Стан для подвоєння
const currentWinnings = ref(0);
const revealedCard = ref(null);
const hiddenCards = ref([]);
const selectedCardIndex = ref(null);

// Стан для анімації карт
const flippingCards = ref(new Set());
const flippedCards = ref(new Set());

// Ініціалізація колоди при завантаженні компонента
onMounted(() => {
	deck.value = shuffleDeck(createDeck());
});

// Обчислювані властивості
const isDrawButtonDisabled = computed(() => {
	return (gameState.value === 'ready' && balance.value < BET_AMOUNT) ||
		gameState.value === 'doubling';
});

// Функції для роботи з картами
const isCardHidden = (index) => {
	if (gameState.value === 'doubling') {
		return index !== 0; // Перша карта відкрита, інші закриті
	}

	// Для початкової роздачі показуємо карти як закриті до анімації
	if (gameState.value === 'dealt' && hand[index] && hand[index].isHidden) {
		return true;
	}

	return false;
};

const isCardSelectable = (index) => {
	return gameState.value === 'doubling' && index > 0;
};

const isCardFlipping = (index) => {
	return flippingCards.value.has(index);
};

const isCardFlipped = (index) => {
	return flippedCards.value.has(index);
};

// Функції гри
const handleDealDraw = () => {
	if (balance.value < BET_AMOUNT && gameState.value === 'ready') {
		message.value = 'Недостатньо коштів!';
		return;
	}

	if (gameState.value === 'ready') {
		// Нова роздача з анімацією
		balance.value -= BET_AMOUNT;
		const newDeck = shuffleDeck(createDeck());
		const newHand = newDeck.slice(0, 5);

		deck.value = newDeck.slice(5);

		// Спочатку показуємо всі карти закритими
		hand.fill({ rank: '', suit: '', isHidden: true });
		held.fill(false);
		flippingCards.value.clear();
		flippedCards.value.clear();
		gameState.value = 'dealt';
		message.value = 'dealing cards...';

		// Анімація відкриття карт по черзі
		newHand.forEach((card, index) => {
			setTimeout(() => {
				flippingCards.value.add(index);

				setTimeout(() => {
					flippingCards.value.delete(index);
					flippedCards.value.add(index);
					hand[index] = card;

					setTimeout(() => {
						flippedCards.value.delete(index);
					}, 100);
				}, 300);
			}, index * 300); // Затримка між картами
		});

		// Оновлюємо повідомлення після завершення анімації
		setTimeout(() => {
			message.value = 'Choose cards to hold';
		}, newHand.length * 300 + 400);

	} else if (gameState.value === 'dealt') {
		// Заміна карт з анімацією
		let currentDeck = [...deck.value];
		const cardsToReplace = [];

		// Визначаємо які карти потрібно замінити
		hand.forEach((card, index) => {
			if (!held[index]) {
				cardsToReplace.push(index);
			}
		});

		// Запускаємо анімацію перевертання для кожної карти окрім утриманих
		cardsToReplace.forEach((index, delay) => {
			setTimeout(() => {
				flippingCards.value.add(index);

				// Після завершення анімації показуємо нову карту
				setTimeout(() => {
					flippingCards.value.delete(index);
					flippedCards.value.add(index);

					// Замінюємо карту
					hand[index] = currentDeck.shift();

					// Через невелику затримку прибираємо статус перевернутої
					setTimeout(() => {
						flippedCards.value.delete(index);
					}, 100);
				}, 300); // Половина часу анімації
			}, delay * 200); // Затримка між картами
		});

		deck.value = currentDeck;

		// Скидаємо статус held на всіх картах після завершення всіх анімацій
		setTimeout(() => {
			held.fill(false);
			gameState.value = 'finished';

			// Перевірка результату
			const result = evaluateHand(hand);
			if (result) {
				const payout = PAYOUTS[result] * BET_AMOUNT;
				currentWinnings.value = payout;
				message.value = `${result}`;
				gameState.value = 'won';
			} else {
				message.value = 'YOU LOSE';
			}
		}, cardsToReplace.length * 200 + 600); // Затримка для всіх анімацій
	} else if (gameState.value === 'finished') {
		// Почати нову гру
		gameState.value = 'ready';
		hand.fill(null);
		flippingCards.value.clear();
		flippedCards.value.clear();
		message.value = 'press DRAW to start';
	}
};

const toggleHold = (index) => {
	if (gameState.value !== 'dealt') return;
	held[index] = !held[index];
};

// Функції для подвоєння
const startDouble = () => {
	// Створюємо нову колоду для подвоєння
	const newDeck = shuffleDeck(createDeck());

	// Перша карта відкрита
	revealedCard.value = newDeck[0];

	// Інші 4 карти закриті
	hiddenCards.value = newDeck.slice(1, 5);

	// Оновлюємо руку
	hand[0] = revealedCard.value;
	for (let i = 1; i < 5; i++) {
		hand[i] = hiddenCards.value[i - 1];
	}

	gameState.value = 'doubling';
	message.value = `You can win: ${currentWinnings.value * 2}. Choose a card.`;
};

const selectCard = (index) => {
	if (gameState.value !== 'doubling' || index === 0) return;

	selectedCardIndex.value = index;
	const selectedCard = hand[index];
	const comparison = compareCards(selectedCard, revealedCard.value);

	if (comparison > 0) {
		// Виграш - подвоюємо
		currentWinnings.value *= 2;
		message.value = `YOU WIN ${currentWinnings.value}!`;

		// Переходимо до стану вибору дії
		gameState.value = 'double-won';

		// Пропонуємо подвоїти ще раз або забрати
		setTimeout(() => {
			message.value = `your winnings: ${currentWinnings.value}. Double to ${currentWinnings.value * 2}?`;
		}, 2000);

	} else if (comparison < 0) {
		// Програш - втрачаємо все
		currentWinnings.value = 0;
		message.value = `YOU LOSE`;
		gameState.value = 'ready'; //TODO: DELETE IT

	} else {
		// Нічия - залишаємо поточний виграш
		message.value = `Нічия! ${selectedCard.rank}${selectedCard.suit} дорівнює ${revealedCard.value.rank}${revealedCard.value.suit}. Виграш залишається: $${currentWinnings.value}`;

		setTimeout(() => {
			gameState.value = 'ready';
			hand.fill(null);
			message.value = 'press DRAW to start';
		}, 2000);
	}
};

const collectWinnings = () => {
	balance.value += currentWinnings.value;
	message.value = `Виграш $${currentWinnings.value} додано до балансу!`;

	setTimeout(() => {
		gameState.value = 'ready';
		hand.fill(null);
		currentWinnings.value = 0;
		message.value = 'press DRAW to start';
	}, 100);
};

const continueDouble = () => {
	// Створюємо нову колоду для наступного подвоєння
	const newDeck = shuffleDeck(createDeck());

	// Перша карта відкрита
	revealedCard.value = newDeck[0];

	// Інші 4 карти закриті
	hiddenCards.value = newDeck.slice(1, 5);

	// Оновлюємо руку
	hand[0] = revealedCard.value;
	for (let i = 1; i < 5; i++) {
		hand[i] = hiddenCards.value[i - 1];
	}

	// Повертаємося до стану подвоєння
	gameState.value = 'doubling';
	message.value = `Відкрита карта: ${revealedCard.value.rank}${revealedCard.value.suit}. Виберіть карту більшу за неї!`;
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

/* Глобальні стилі - можна винести в окремий css файл, але для простоти залишимо тут */
body {
	background-color: #0d3b0d;
	color: white;
	font-family: 'Kanit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	min-height: 100vh;
	margin: 0;
}

#app-container {
	width: 100vw;
	max-width: 500px;
	height: 100vh;
	background-color: #0025aa;
	border-radius: 15px;
	padding: 10px;
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
	display: flex;
	flex-direction: column;
	gap: 20px;
	box-sizing: border-box;
}

.header {
	text-align: center;
	border-bottom: 2px solid #ffc107;
	padding-bottom: 10px;
}

.balance-container {
	display: flex;
	justify-content: space-between;
	padding: 0 10px;
	color: red;
	font-size: 2em;
	font-weight: bold;
	text-shadow: -2px -2px 0 #ffc107, 2px -2px 0 #ffc107, -2px 2px 0 #ffc107, 2px 2px 0 #ffc107;
}

.balance {
	
}

.message-board {
	padding: 15px;
	text-align: center;
	color: red;
	font-size: 2em;
	font-weight: bold;
	text-shadow: -2px -2px 0 #ffc107, 2px -2px 0 #ffc107, -2px 2px 0 #ffc107, 2px 2px 0 #ffc107;
	min-height: 50px;
}

.hand-container {
	display: flex;
	justify-content: center;
	gap: 10px;
	min-height: 100px;
}

.card-placeholder {
	width: 80px;
	height: 15vh;
	border: 2px dashed #fff;
	border-radius: 8px;
}

.controls button {
	width: 100%;
	padding: 15px;
	font-size: 1.5em;
	font-weight: bold;
	cursor: pointer;
	background-color: #ffc107;
	color: #333;
	border: none;
	border-radius: 8px;
	transition: background-color 0.2s;
}

.controls button:hover:not(:disabled) {
	background-color: #ffda70;
}

.controls button:disabled {
	background-color: #555;
	cursor: not-allowed;
}

.double-button {
	background-color: #ff6b6b !important;
	color: white !important;
}

.double-button:hover {
	background-color: #ff5252 !important;
}

.double-controls {
	display: flex;
	gap: 10px;
}

.double-controls button {
	flex: 1;
	font-size: 1.2em;
	padding: 12px;
}

.collect-button {
	background-color: #4caf50 !important;
	color: white !important;
}

.collect-button:hover {
	background-color: #45a049 !important;
}

.continue-double-button {
	background-color: #ff9800 !important;
	color: white !important;
}

.continue-double-button:hover {
	background-color: #f57c00 !important;
}

.double-info {
	background-color: rgba(255, 107, 107, 0.1);
	border: 1px solid #ff6b6b;
	border-radius: 8px;
	padding: 15px;
	text-align: center;
}

.double-info p {
	margin: 5px 0;
	font-size: 1.1em;
}

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
	;
}

.payout-table li:last-child {
	border-bottom: none;
}
</style>