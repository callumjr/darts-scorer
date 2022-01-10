//PURE CODE

const selectElement = (enviroment, element) => {
	return enviroment.querySelector(element);
};

const selectAllElements = (enviroment, element) => {
	return enviroment.querySelectorAll(element);
};

const scoreElement = selectElement(document, '.score');
const outputElement = selectElement(document, '.output');
const checkoutElement = selectElement(document, '.checkout');

const numBtns = selectAllElements(document, '.number');
const confirmBtn = selectElement(document, '.confirm');
const deleteBtn = selectElement(document, '.delete');
const bustBtn = selectElement(document, '.bust');
const playerBtns = selectAllElements(document, '.players');
const gameBtns = selectAllElements(document, '.game');

const chooseBox = selectElement(document, '.choose');
const playersDiv = selectElement(document, '.choose-players');
const gameDiv = selectElement(document, '.choose-game');
const scorerDiv = selectElement(document, '.scorer');
const statsDiv = selectElement(document, '.game-stats');
const averageDiv = selectElement(document, '.avg');
const dartsDiv = selectElement(document, '.darts');
const lastDartsDiv = selectElement(document, '.how-many-darts');
const dartsBtns = selectAllElements(document, '.darts-button');

//game-stats
//avg
//darts

const addEvent = (element, event, func) => {
	return element.addEventListener(event, func);
};

const changeHtml = func => {
	return function(...args) {
		return func.apply(this, args);
	};
};

const appendNumber = (num, output, score) => {
	if (output.length > 2) return;
	if (parseFloat(output + num) > parseFloat(score)) return;
	if (num === '0' && output.length === 0) return;
	if (parseFloat(output + num) > 180) return;
	return (output += num);
};

const getJson = async url => {
	try {
		const json = await axios.get(url);
		return json.data;
	} catch (err) {
		console.log(`Cannot retrieve checkout data, ${err}`);
	}
};

const deleteNum = changeHtml(htmlEl => {
	return (htmlEl.innerHTML = htmlEl.innerHTML.slice(0, -1));
});

const newNum = changeHtml(clickedVal => {
	if (appendNumber(clickedVal, outputElement.innerHTML, scoreElement.innerHTML) !== undefined) {
		return (outputElement.innerHTML = appendNumber(clickedVal, outputElement.innerHTML, scoreElement.innerHTML));
	}
});

numBtns.forEach(el => {
	return addEvent(el, 'click', e => {
		return newNum(e.target.innerHTML);
	});
});

addEvent(deleteBtn, 'click', () => {
	return deleteNum(outputElement);
});

const clearOutput = changeHtml(htmlEl => {
	return (htmlEl.innerHTML = '');
});

const subtractableScore = (output, score) => {
	if (output.innerHTML.length < 1) return parseFloat(score.innerHTML);
	if (parseFloat(score.innerHTML) - parseFloat(output.innerHTML) < 0) return parseFloat(score.innerHTML);
	return parseFloat(score.innerHTML) - parseFloat(output.innerHTML);
};

const changeScore = changeHtml(htmlEl => {
	const val = subtractableScore(outputElement, scoreElement);
	if (val != undefined) {
		return (htmlEl.innerHTML = val);
	} else {
		return;
	}
});

addEvent(confirmBtn, 'click', () => {
	return changeScore(scoreElement);
});

getJson('../checkouts.json').then(result => {
	if (result !== undefined) {
		addEvent(document, 'click', () => {
			checkoutElement.innerHTML = '';
			Object.keys(result).forEach(v => {
				if (scoreElement.innerHTML === v) {
					result[v].forEach(v => {
						checkoutElement.innerHTML += `<h2>${v}</h2>`;
					});
				}
			});
		});
	} else return;
});

gameBtns.forEach(el => {
	return addEvent(el, 'click', e => {
		scoreElement.innerHTML = e.target.innerHTML;
	});
});

let object = {};

const playerSelect = players => {
	if (players === '1') {
		object = {
			player1 : {
				scores : [],
				darts  : 0,
				avg    : 0
			}
		};
		return object;
	} else {
		return;
	}
};

//Display stats at 0

const choosePlayers = (object, output, score) => {
	addEvent(bustBtn, 'click', () => {
		if (Object.keys(object).length === 1) {
			return onePlayerGame(object, 0, statsDiv, averageDiv, dartsDiv, undefined, () => {
				return clearOutput(output);
			});
		}
	});
	addEvent(confirmBtn, 'click', () => {
		if (parseFloat(score.innerHTML) === 0) {
			lastDartsDiv.classList.remove('hidden');
			return dartsBtns.forEach(v => {
				addEvent(v, 'click', e => {
					onePlayerGame(object, output, statsDiv, averageDiv, dartsDiv, e.target.innerHTML, () => {
						return clearOutput(output);
					});
				});
			});
		} else {
			if (output.innerHTML !== '') {
				if (Object.keys(object).length === 1) {
					return onePlayerGame(object, output, statsDiv, averageDiv, dartsDiv, undefined, () => {
						return clearOutput(output);
					});
				} else {
				}
			}
		}
	});
};

const onePlayerGame = (object, output, stats, average, darts, finalDarts, fn) => {
	stats.classList.remove('hidden');

	if (typeof output === 'number') {
		object.player1.scores = [ ...object.player1.scores, 0 ];
	} else {
		object.player1.scores = [ ...object.player1.scores, parseFloat(output.innerHTML) ];
	}
	if (finalDarts !== undefined) {
		object.player1.darts += parseFloat(finalDarts);
	} else {
		object.player1.darts += 3;
	}
	if (object.player1.scores.length === 1) {
		object.player1.avg = object.player1.scores[0];
	} else {
		object.player1.avg =
			Math.round(
				object.player1.scores.reduce((total, curr) => {
					return total + curr;
				}, 0) /
					object.player1.darts *
					3 *
					10
			) / 10;
	}
	average.innerHTML = `<p>${object.player1.avg}</p>`;
	darts.innerHTML = `<p>${object.player1.darts}</p>`;

	fn();
};

playerBtns.forEach(el => {
	return addEvent(el, 'click', e => {
		return choosePlayers(playerSelect(e.target.innerHTML), outputElement, scoreElement);
	});
});

const toggleHidden = htmlEl => {
	htmlEl.classList.toggle('hidden');
};

playerBtns.forEach(el => {
	return addEvent(el, 'click', e => {
		return toggleHidden(playersDiv);
	});
});

gameBtns.forEach(el => {
	return addEvent(el, 'click', e => {
		return toggleHidden(gameDiv);
	});
});

const isGameReady = (playersDiv, gameDiv) => {
	if (gameDiv.classList.contains('hidden') && playersDiv.classList.contains('hidden')) {
		return true;
	}
};

addEvent(chooseBox, 'click', () => {
	if (isGameReady(playersDiv, gameDiv)) {
		return toggleHidden(scorerDiv);
	}
});

if (scoreElement.innerHTML === '0') {
	//call chooseplayers with darts
}

dartsBtns.forEach(v => {
	addEvent(v, 'click', () => {
		lastDartsDiv.classList.add('hidden');
	});
});
