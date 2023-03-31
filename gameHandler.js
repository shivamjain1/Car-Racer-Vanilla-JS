const score = document.querySelector('.score');
const coins = document.querySelector('.coins');
const startScreen = document.querySelector('.startScreen');
const gameArea = document.querySelector('.gameArea');
const startGameButton = document.querySelector('.startGameButton');
const screenHeight = window.innerHeight;
const road = gameArea.getBoundingClientRect();
let playerCar = false;

// GAME SETTINGS
const gameSettings = {
    coinsCount: 5,
    enemyCarsCount: 3,
    roadLinesCount: 5,
};

// KEYS PRESSED
let keys = {
    ArrowLeft: false,
    ArrowRight: false
}

// PLAYER
let player = { speed: 7, score: 0, coins: 0 };

// INCREASE DIFFICULTY
function increaseLevel() {
    if (player.score % 1000 === 0) {
        player.speed++;
    }
}

// CONTROL PLAYER CAR WITH KEYS
function movePlayerByKeys(key) {
    if (playerCar) {
        let x = playerCar.offsetLeft;
        if (key === 1 && x < road.width - 60) playerCar.style.left = `${x += player.speed}px`
        if (key === -1 && x > 0) playerCar.style.left = `${x -= player.speed}px`
    }
};

// CREATE COIN
function createCoin(i) {
    let coin = document.createElement('div');
    coin.setAttribute('class', 'coin');
    coin.y = ((i + 1) * 350) * - 1;
    coin.style.top = '0px';
    coin.style.left = Math.floor(Math.random() * 350) + "px";
    gameArea.appendChild(coin);
}

// REPOSITION COIN
function repositionCoin(coin) {
    coin.y = -300;
    coin.style.left = Math.floor(Math.random() * 350) + "px";
};

// CREATE ROAD LINES
function createRoadLine(i) {
    let roadLineElement = document.createElement('div');
    roadLineElement.setAttribute('class', 'roadLines');
    roadLineElement.y = (i * 250);
    roadLineElement.style.transform = `translateY(${roadLineElement.y}px)`;
    gameArea.appendChild(roadLineElement);
}

// CREATE ENEMY CARS
function createEnemyCar(i) {
    let enemyCar = document.createElement('div');
    enemyCar.setAttribute('class', 'enemyCar');
    enemyCar.y = ((i + 1) * 350) * - 1;
    enemyCar.style.top = enemyCar.y + "px";
    enemyCar.style.backgroundColor = randomColor();
    enemyCar.style.left = Math.floor(Math.random() * 350) + "px";
    gameArea.appendChild(enemyCar);
}

// CREATE PLAYER CAR
function createPlayerCar() {
    let playerCarElement = document.createElement('div');
    playerCarElement.setAttribute('class', 'car');
    gameArea.appendChild(playerCarElement);
    player.x = playerCarElement.offsetLeft;
    player.y = playerCarElement.offsetTop;
    playerCar = document.querySelector('.car');
}

// DISABLE KEYS AND REMOVE EVENT LISTENERS
function disableKeys() {
    Object.keys(keys).forEach((key) => {
        keys[key] = false;
    });

    document.removeEventListener('keydown', keyDown);
    document.removeEventListener('keyup', keyUp);
    document.removeEventListener('touchmove', touchMove);
};

// ADD COIN SCORE AND REPOSITION COIN
function addCoin(coinItem) {
    player.coins++;
    coins.innerText = `Монетки: ${player.coins}`;
    repositionCoin(coinItem);
}

// INITIAL GAME START
function startGame() {
    document.addEventListener('touchmove', touchMove);
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    startScreen.close();
    gameArea.innerHTML = "";

    player.start = true;
    player.score = 0;
    player.coins = 0;
    player.speed = 7;
    coins.innerText = `Очки: ${player.score}`;
    coins.innerText = `Монетки: ${player.coins}`;

    for (let i = 0; i < gameSettings.roadLinesCount; i++) createRoadLine(i);
    createPlayerCar();
    for (let i = 0; i < gameSettings.coinsCount; i++) createCoin(i);
    for (let i = 0; i < gameSettings.enemyCarsCount; i++) createEnemyCar(i);

    window.requestAnimationFrame(gamePlay);
}

// RANDOMIZE COLOR
function randomColor() {
    function c() {
        let hex = Math.floor(Math.random() * 256).toString(16);
        return ("0" + String(hex)).substr(-2);
    }
    return "#" + c() + c() + c();
}

// COLLISION DETECTION
function hasCollision(a, b) {
    aRect = a.getBoundingClientRect();
    bRect = b.getBoundingClientRect();

    return !((aRect.top > bRect.bottom) || (aRect.bottom < bRect.top) ||
        (aRect.right < bRect.left) || (aRect.left > bRect.right));
}

// GAME OVER
function gameOver() {
    disableKeys();
    player.start = false;
    startScreen.showModal();
    startScreen.innerHTML = `
        <h1>Игра окончена!</h1>
        <p>Результат: <span class="scoreNumber">${player.score}</span> очков</p>
        <p>Собрано монет: <span class="scoreNumber">${player.coins}</span></p>
        `;

    const startGameButton = document.createElement('button');
    startGameButton.classList.add('startGameButton');
    startGameButton.innerText = 'Поехали';
    startScreen.appendChild(startGameButton);
    startGameButton.onclick = startGame;
}

// MOVING ROAD LINES
function moveRoadLines() {
    let roadLines = document.querySelectorAll('.roadLines');
    roadLines.forEach((item) => {
        const itemHeight = item.clientHeight;
        if (item.y >= screenHeight - (itemHeight / 3)) item.y -= screenHeight;
        item.y += player.speed;
        item.style.transform = `translateY(${item.y}px)`;
    });
}

// ENEMY CARS LOGIC
function moveEnemyCars(carElement) {
    let enemyCars = document.querySelectorAll('.enemyCar');
    enemyCars.forEach((item) => {
        if (hasCollision(carElement, item)) gameOver();

        if (item.y >= screenHeight) {
            item.y = -300;
            item.style.left = Math.floor(Math.random() * 350) + "px";
        }

        item.y += player.speed;
        item.style.top = item.y + "px";
    });
}

// COINS LOGIC
function moveCoins(coinElement) {
    let coins = document.querySelectorAll('.coin');
    coins.forEach((coin) => {
        if (hasCollision(coinElement, coin)) addCoin(coin);
        if (coin.y >= screenHeight) repositionCoin(coin);
        coin.y += player.speed;
        coin.style.top = coin.y + "px";
    });
}

// PLAYING GAME
function gamePlay() {
    if (player.start) {
        moveRoadLines();
        moveEnemyCars(playerCar);
        moveCoins(playerCar);

        if (keys.ArrowLeft) movePlayerByKeys(-1);
        if (keys.ArrowRight) movePlayerByKeys(1);

        window.requestAnimationFrame(gamePlay);
        player.score++;
        increaseLevel();
        const ps = player.score - 1;
        score.innerText = 'Очки: ' + ps;
    }
}

// GLOBAL LISTENERS
startGameButton.onclick = startGame;

// EVENT HANDLERS
function keyDown(e) {
    if (Object.keys(keys).includes(e.key)) {
        e.preventDefault();
        keys[e.key] = true
    };
}

function keyUp(e) {
    if (Object.keys(keys).includes(e.key)) {
        e.preventDefault();
        keys[e.key] = false;
    }
}

function touchMove(e) {
    const x = e.touches[0].clientX - 35;
    if (playerCar && x > 0 && x < (road.width - 60)) playerCar.style.left = `${x}px`;
}
