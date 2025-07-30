<template>
	<div id="app-container">
		<header class="header">
			<h1>Pocker Machine</h1>
			<div class="balance">Balance: ${{ balance }}</div>
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

		<!-- Інформація про подвоєння -->
		<div v-if="gameState === 'doubling' || gameState === 'double-won'" class="double-info">
			<p v-if="gameState === 'doubling'">Виберіть карту, яка більша за {{ revealedCard.rank }}{{ revealedCard.suit }}
			</p>
			<p v-if="gameState === 'double-won'">Виберіть дію для виграшу ${{ currentWinnings }}</p>
			<p>Виграш: ${{ currentWinnings }}</p>
		</div>

		<!--     <footer class="payout-table">
			<h3>Таблиця виплат (ставка {{ BET_AMOUNT }})</h3>
			<ul>
				<li v-for="([combo, multiplier]) in Object.entries(PAYOUTS)" :key="combo">
					<span>{{ combo }}</span>
					<span>${{ multiplier * BET_AMOUNT }}</span>
				</li>
			</ul>
		</footer> -->
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
const message = ref('Натисніть "Роздати", щоб почати!');

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
		message.value = 'Роздаю карти...';

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
			}, index * 500); // Затримка між картами
		});

		// Оновлюємо повідомлення після завершення анімації
		setTimeout(() => {
			message.value = 'Виберіть карти для утримання';
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
				// balance.value += payout;
				currentWinnings.value = payout;
				message.value = `Вітаємо! У вас ${result}. Виграш: ${payout}`;
				gameState.value = 'won';
			} else {
				message.value = 'Цього разу не пощастило. Спробуйте ще!';
			}
		}, cardsToReplace.length * 200 + 600); // Затримка для всіх анімацій
	} else if (gameState.value === 'finished') {
		// Почати нову гру
		gameState.value = 'ready';
		hand.fill(null);
		flippingCards.value.clear();
		flippedCards.value.clear();
		message.value = 'Натисніть "Роздати", щоб почати!';
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
	message.value = `Відкрита карта: ${revealedCard.value.rank}${revealedCard.value.suit}. Виберіть карту більшу за неї!`;
};

const selectCard = (index) => {
	if (gameState.value !== 'doubling' || index === 0) return;

	selectedCardIndex.value = index;
	const selectedCard = hand[index];
	const comparison = compareCards(selectedCard, revealedCard.value);

	if (comparison > 0) {
		// Виграш - подвоюємо
		currentWinnings.value *= 2;
		message.value = `Вітаємо! ${selectedCard.rank}${selectedCard.suit} більша за ${revealedCard.value.rank}${revealedCard.value.suit}. Виграш подвоєно: $${currentWinnings.value}`;

		// Переходимо до стану вибору дії
		gameState.value = 'double-won';

		// Пропонуємо подвоїти ще раз або забрати
		setTimeout(() => {
			message.value = 'Бажаєте подвоїти ще раз або забрати виграш?';
		}, 2000);

	} else if (comparison < 0) {
		// Програш - втрачаємо все
		currentWinnings.value = 0;
		message.value = `На жаль! ${selectedCard.rank}${selectedCard.suit} менша за ${revealedCard.value.rank}${revealedCard.value.suit}. Виграш втрачено.`;

		setTimeout(() => {
			gameState.value = 'ready';
			hand.fill(null);
			currentWinnings.value = 0;
			message.value = 'Натисніть "Роздати", щоб почати!';
		}, 2000);

	} else {
		// Нічия - залишаємо поточний виграш
		message.value = `Нічия! ${selectedCard.rank}${selectedCard.suit} дорівнює ${revealedCard.value.rank}${revealedCard.value.suit}. Виграш залишається: $${currentWinnings.value}`;

		setTimeout(() => {
			gameState.value = 'ready';
			hand.fill(null);
			message.value = 'Натисніть "Роздати", щоб почати!';
		}, 100);
	}
};

const collectWinnings = () => {
	balance.value += currentWinnings.value;
	message.value = `Виграш $${currentWinnings.value} додано до балансу!`;

	setTimeout(() => {
		gameState.value = 'ready';
		hand.fill(null);
		currentWinnings.value = 0;
		message.value = 'Натисніть "Роздати", щоб почати!';
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
/* Глобальні стилі - можна винести в окремий css файл, але для простоти залишимо тут */
body {
	background-color: #0d3b0d;
	color: white;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	margin: 0;
}

#app-container {
	width: 100%;
	max-width: 500px;
	background-color: #001a00;
	border-radius: 15px;
	padding: 20px;
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.header {
	text-align: center;
	border-bottom: 2px solid #ffc107;
	padding-bottom: 10px;
}

.header h1 {
	margin: 0;
}

.balance {
	font-size: 1.2em;
	font-weight: bold;
}

.message-board {
	background-color: rgba(0, 0, 0, 0.3);
	padding: 15px;
	border-radius: 8px;
	text-align: center;
	font-size: 1.1em;
	min-height: 50px;
}

.hand-container {
	display: flex;
	justify-content: center;
	gap: 10px;
	min-height: 120px;
}

.card-placeholder {
	width: 80px;
	height: 120px;
	border: 2px dashed #444;
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
	background-color: rgba(0, 0, 0, 0.2);
	padding: 15px;
	border-radius: 8px;
}

.payout-table h3 {
	text-align: center;
	margin-top: 0;
}

.payout-table ul {
	list-style: none;
	padding: 0;
	margin: 0;
}

.payout-table li {
	display: flex;
	justify-content: space-between;
	padding: 5px 0;
	border-bottom: 1px solid #444;
}

.payout-table li:last-child {
	border-bottom: none;
}
</style>