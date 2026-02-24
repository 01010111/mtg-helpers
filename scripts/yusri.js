// Elements
const pref_button = document.getElementById("preferred");
const button_thumb = document.getElementById("thumb");
const button_minotaur = document.getElementById("minotaur");
const button_edgar = document.getElementById("edgar");
const button_scoundrel = document.getElementById("scoundrel");
const button_chance = document.getElementById("chance");
const button_my_turn = document.getElementById("my-turn");
const button_opponent_turn = document.getElementById("opponent-turn");
const coin = document.getElementById("coin");

// Sounds
const sounds = {
	fall: new Howl({ src: ['assets/fall.wav'] }),
	win: new Howl({ src: ['assets/win.wav'] }),
	yay: new Howl({ src: ['assets/yay.wav'] }),
	minotaur: new Howl({ src: ['assets/minotaur.wav'] }),
	ping: new Howl({ src: ['assets/ping.wav'] }),
	treasure: new Howl({ src: ['assets/treasure.wav'] }),
}

// State
var preferred_heads = true;
var current_flips = []; // Array of booleans
var flip_history = []; // Array of arrays, each inner array is a turn's flips - true or false
var thumb_active = false;
var minotaur_active = false;
var edgar_active = false;
var scoundrel_active = false;
var chance_active = false;
var first_flip = true;

var minotaur_cumulative_upkeep = 0;
var chance_luck_counters = 0;

// Preferred button
pref_button.addEventListener("click", () => {
	pref_button.classList.toggle("tails");
	pref_button.classList.toggle("heads");
	preferred_heads = !preferred_heads;
});

// Stats
function update_stats() {
	const turn_flips = document.getElementById("turn-flips");
	const luck = document.getElementById("luck");

	var total_turn_count = current_flips.length;
	var total_turn_win_count = current_flips.filter(flip => flip === true).length;

	var total_flips = total_turn_count;
	var total_wins = total_turn_win_count;

	flip_history.forEach(turn => {
		total_flips += turn.length;
		total_wins += turn.filter(flip => flip === true).length;
	});

	console.log(`Updating stats: ${total_turn_win_count}/${total_turn_count} turns won, ${total_wins}/${total_flips} flips won`);

	turn_flips.textContent = `${total_turn_win_count}/${total_turn_count}`;
	luck.textContent = total_flips > 0 ? `🍀 ${Math.round((total_wins / total_flips) * 100)}%` : "🍀 N/A";
}

update_stats();

// Buttons
button_thumb.addEventListener("click", () => {
	thumb_active = !thumb_active;
	button_thumb.classList.toggle("active");
});

var minotaur_timestamp;
button_minotaur.addEventListener("pointerdown", () => {
	console.log("Minotaur upkeep triggered");
	minotaur_timestamp = Date.now();
});
button_minotaur.addEventListener("pointerup", () => {
	if (!minotaur_active) {
		minotaur_active = true;
		button_minotaur.classList.add("active");
		return;
	}
	minotaur_time = Date.now() - minotaur_timestamp;
	console.log(`Minotaur upkeep time: ${minotaur_time}ms`);
	if (minotaur_time < 500) {
		flip(minotaur_cumulative_upkeep);
	}
	else {
		minotaur_active = false;
		minotaur_cumulative_upkeep = 0;
		button_minotaur.setAttribute('data-notify', '');
		button_minotaur.classList.remove("active");
	}
});

button_edgar.addEventListener("click", () => {
	edgar_active = !edgar_active;
	button_edgar.classList.toggle("active");
});

button_scoundrel.addEventListener("click", () => {
	scoundrel_active = !scoundrel_active;
	button_scoundrel.classList.toggle("active");
});

button_chance.addEventListener("click", () => {
	chance_active = !chance_active;
	button_chance.classList.toggle("active");
	if (!chance_active) {
		chance_luck_counters = 0;
		button_chance.setAttribute('data-notify', '');
	}
});
function add_luck_counter() {
	chance_luck_counters++;
	console.log(`Added a luck counter. Total: ${chance_luck_counters}`);
	button_chance.setAttribute('data-notify', chance_luck_counters);
}

// Turn Buttons
button_my_turn.addEventListener("click", () => {
	turn_reset();
	if (minotaur_active) {
		minotaur_cumulative_upkeep++;
		button_minotaur.setAttribute('data-notify', minotaur_cumulative_upkeep);
		console.log(`Minotaur upkeep increased. Total flips on upkeep: ${minotaur_cumulative_upkeep}`);
	}
	if (chance_active && chance_luck_counters >= 10) {
		sounds.yay.play();
	}
});
button_opponent_turn.addEventListener("click", () => {
	turn_reset();
});
function turn_reset() {
	flip_history.push(current_flips);
	current_flips = [];
	first_flip = true;
	update_stats();
}

// Coin
coin.addEventListener("click", () => {
	flip(1);
	console.log("Coin clicked, flipping 1 time");
});

// Flip
var last_flip_time = 0;
var can_flip = true;
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function flip(flips = 1) {
    if (!can_flip) return;
    can_flip = false;

	var is_first_flip = first_flip;
	var delay_since_last_flip = Date.now() - last_flip_time;
	last_flip_time = Date.now();

	if (first_flip && current_flips.length > 0 && delay_since_last_flip > 3000) {
		is_first_flip = false;
	}

    const coinEl = document.getElementById("coin");

    for (let i = 0; i < flips; i++) {
		sounds.ping.play();
        let isHeads = Math.random() < 0.5;

		if (is_first_flip) {
			if (edgar_active) {
				isHeads = preferred_heads;
				console.log("Edgar active: Forcing first flip to be a win");
			}
		}

        let isWin = isHeads === preferred_heads;
		if (thumb_active) {
			if (!isWin) {
				isHeads = Math.random() < 0.5; // Reroll once
				isWin = isHeads === preferred_heads;
				if (isWin) {
					console.log("Thumb activated: Reroll successful!");
				}
			}
		}

        // Reset
        coinEl.classList.remove("animate-spin-heads", "animate-spin-tails");
        void coinEl.offsetWidth;
        coinEl.classList.add(isHeads ? "animate-spin-heads" : "animate-spin-tails");

        await delay(500);

        update_flip_state(isWin);

        if (flips > 1) await delay(100);
    }

    can_flip = true;
}

// History
var last = Date.now();
function update_flip_state(flip_result) {
	const delay = Date.now() - last;
	last = Date.now();

	if (chance_active && flip_result) add_luck_counter();
	current_flips.push(flip_result);

	update_history(flip_result, delay);
	update_stats();
}

function update_history(flip_result, delay) {
	if (flip_result) {
		if (scoundrel_active) sounds.treasure.play();
		else sounds.win.play();
	}
	else {
		if (minotaur_active) sounds.minotaur.play();
		else sounds.fall.play();
	}

	let log_current = document.querySelector(".log-group.current");
	if (!log_current) {
		delay = 0;
		log_current = document.createElement('span');
		log_current.classList.add('log-group', 'current');
		document.querySelector('.history').append(log_current);
	}

	if (delay > 3000) {
		let new_log = document.createElement("span");
		new_log.classList.add("log-group", "current");

		log_current.classList.remove("current");

		let separator = document.createElement('span');
		separator.classList.add('log-group');
		separator.textContent = "|";
		document.querySelector(".history").prepend(separator);

		document.querySelector(".history").prepend(new_log);
		log_current = new_log;
	}

	log_current.innerHTML = (flip_result ? "✅" : "❌") + log_current.innerHTML;
}