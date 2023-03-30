const score = document.querySelector('.score');
const coins = document.querySelector('.coins');
const startScreen = document.querySelector('.startScreen');
const gameArea = document.querySelector('.gameArea');
const level = document.querySelector('.level');


const levelSpeed = { easy: 7, moderate: 10, difficult: 14 };
const gameSettings = {
    coinsCount: 5,
    enemyCarsCount: 3,
    roadLinesCount: 5,
};

let keys = {
    ArrowLeft: false,
    ArrowRight: false
}

let player = { speed: 7, score: 0, coins: 0 };

function createCoin(i) {
    let coin = document.createElement('div');
    coin.setAttribute('class', 'coin');
    coin.y = ((i + 1) * 350) * - 1;
    coin.style.top = '0px';
    coin.style.left = Math.floor(Math.random() * 350) + "px";
    gameArea.appendChild(coin);
}

function createRoadLine(i) {
    let roadLineElement = document.createElement('div');
    roadLineElement.setAttribute('class', 'roadLines');
    roadLineElement.y = (i * 250);
    roadLineElement.style.transform = `translateY(${roadLineElement.y}px)`;
    gameArea.appendChild(roadLineElement);
}

function createEnemyCar(i) {
    let enemyCar = document.createElement('div');
    enemyCar.setAttribute('class', 'enemyCar');
    enemyCar.y = ((i + 1) * 350) * - 1;
    enemyCar.style.top = enemyCar.y + "px";
    enemyCar.style.backgroundColor = randomColor();
    enemyCar.style.left = Math.floor(Math.random() * 350) + "px";
    gameArea.appendChild(enemyCar);
}


function createPlayerCar() {
    let playerCar = document.createElement('div');
    playerCar.setAttribute('class', 'car');
    gameArea.appendChild(playerCar);
    player.x = playerCar.offsetLeft;
    player.y = playerCar.offsetTop;
}

function addCoin(coinItem) {
    player.coins++;
    coins.innerText = `Монетки: ${player.coins}`;
    coinItem.remove();
    createCoin(1);
}

function startGame(e) {
    player.speed = levelSpeed[e.target.id];
    startScreen.close();
    gameArea.innerHTML = "";

    player.start = true;
    player.score = 0;
    player.coins = 0;
    coins.innerText = `Очки: ${player.score}`;
    coins.innerText = `Монетки: ${player.coins}`;
    window.requestAnimationFrame(gamePlay);

    for (let i = 0; i < gameSettings.roadLinesCount; i++) createRoadLine(i);

    createPlayerCar();

    for (let i = 0; i < gameSettings.coinsCount; i++) createCoin(i);
    for (let i = 0; i < gameSettings.enemyCarsCount; i++) createEnemyCar(i);
}

function randomColor() {
    function c() {
        let hex = Math.floor(Math.random() * 256).toString(16);
        return ("0" + String(hex)).substr(-2);
    }
    return "#" + c() + c() + c();
}

function onCollision(a, b) {
    aRect = a.getBoundingClientRect();
    bRect = b.getBoundingClientRect();

    return !((aRect.top > bRect.bottom) || (aRect.bottom < bRect.top) ||
        (aRect.right < bRect.left) || (aRect.left > bRect.right));
}

function onGameOver() {
    player.start = false;
    startScreen.showModal();
    startScreen.innerHTML = `
        <h1>Игра окончена!</h1>
        <p>Результат: <span class="scoreNumber">${player.score}</span> очков</p>
        <p>Собрано монет: <span class="scoreNumber">${player.coins}</span></p>
        <p>Чтобы начать заново, выбери уровень сложности:</p>
        `;
    const level = document.createElement('fieldset');
    const easy = document.createElement('button');
    const moderate = document.createElement('button');
    const difficult = document.createElement('button');
    easy.id = 'easy';
    moderate.id = 'moderate';
    difficult.id = 'difficult';
    easy.innerText = 'Ученик';
    moderate.innerText = 'Таксист';
    difficult.innerText = 'Гонщик';
    level.appendChild(easy);
    level.appendChild(moderate);
    level.appendChild(difficult);
    startScreen.appendChild(level);
    level.classList.add('level');

    level.onclick = startGame;
}

// MOVING ROAD LINES
function moveRoadLines() {
    let roadLines = document.querySelectorAll('.roadLines');
    roadLines.forEach((item) => {
        if (item.y >= 700) {
            item.y -= 750;
        }
        item.y += player.speed;
        item.style.transform = `translateY(${item.y}px)`;
    });
}

// ENEMY CARS LOGIC
function moveEnemyCars(carElement) {
    let enemyCars = document.querySelectorAll('.enemyCar');
    enemyCars.forEach((item) => {

        if (onCollision(carElement, item)) onGameOver();

        if (item.y >= 750) {
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
    coins.forEach((item) => {

        if (onCollision(coinElement, item)) addCoin(item);

        if (item.y >= 750) {
            item.y = -300;
            // item.style.transform = `translateX(${Math.floor(Math.random() * 350)}px)`;
            item.style.left = Math.floor(Math.random() * 350) + "px";
        }
        item.y += player.speed;
        // item.style.transform = `translateY(${item.y}px)`;
        item.style.top = item.y + "px";
    });
}

// PLAYING GAME
function gamePlay() {
    let playerCar = document.querySelector('.car');
    let road = gameArea.getBoundingClientRect();

    if (player.start) {
        moveRoadLines();
        moveEnemyCars(playerCar);
        moveCoins(playerCar);

        if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
        if (keys.ArrowRight && player.x < (road.width - 65)) player.x += player.speed;

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const x = e.touches[0].clientX - 35;
            if (x > 0 && x < (road.width - 60)) {
                player.x = x;
            }
        });

        playerCar.style.left = player.x + "px";

        window.requestAnimationFrame(gamePlay);

        player.score++;
        const ps = player.score - 1;
        score.innerText = 'Очки: ' + ps;
    }
}

// GLOBASL LISTENERS
level.onclick = startGame;

document.onkeydown = (e) => {
    if (Object.keys(keys).includes(e.key)) {
        e.preventDefault();
        keys[e.key] = true;
    }
};

document.onkeyup = (e) => {
    if (Object.keys(keys).includes(e.key)) {
        e.preventDefault();
        keys[e.key] = false;
    }
};
