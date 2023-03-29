const score = document.querySelector('.score');
const startScreen = document.querySelector('.startScreen');
const gameArea = document.querySelector('.gameArea');
const level = document.querySelector('.level');


const levelSpeed = {easy: 7, moderate: 10, difficult: 14};

let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
}
let player = { speed: 7, score: 0 };

function startGame(e) {
    player.speed = levelSpeed[e.target.id];
    startScreen.close();
    gameArea.innerHTML = "";

    player.start = true;
    player.score = 0;
    window.requestAnimationFrame(gamePlay);

    for(let i=0; i<5; i++){
        let roadLineElement = document.createElement('div');
        roadLineElement.setAttribute('class', 'roadLines');
        roadLineElement.y = (i*150);
        roadLineElement.style.top = roadLineElement.y + "px";
        gameArea.appendChild(roadLineElement);
    }

    let carElement = document.createElement('div');
    carElement.setAttribute('class', 'car');
    gameArea.appendChild(carElement);

    player.x = carElement.offsetLeft;
    player.y = carElement.offsetTop  ;

    for(let i=0; i<3; i++){
        let enemyCar = document.createElement('div');
        enemyCar.setAttribute('class', 'enemyCar');
        enemyCar.y = ((i+1) * 350) * - 1;
        enemyCar.style.top = enemyCar.y + "px";
        enemyCar.style.backgroundColor = randomColor();
        enemyCar.style.left = Math.floor(Math.random() * 350) + "px";
        gameArea.appendChild(enemyCar);
    }
}

level.addEventListener('click', (e)=> {
    startGame(e);
});

function randomColor(){
    function c(){
        let hex = Math.floor(Math.random() * 256).toString(16);
        return ("0"+ String(hex)).substr(-2);
    }
    return "#"+c()+c()+c();
}

function onCollision(a,b){
    aRect = a.getBoundingClientRect();
    bRect = b.getBoundingClientRect();

    return !((aRect.top >  bRect.bottom) || (aRect.bottom <  bRect.top) ||
        (aRect.right <  bRect.left) || (aRect.left >  bRect.right));
}

function onGameOver() {
    player.start = false;
    startScreen.showModal();
    startScreen.innerHTML = `
        <h1>Игра окончена!</h1>
        <p>Результат: <span class="scoreNumber">${player.score}</span> очков</p>
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

    level.addEventListener('click', (e)=> {
        startGame(e);
    });
}

function moveRoadLines(){
    let roadLines = document.querySelectorAll('.roadLines');
    roadLines.forEach((item)=> {
        if(item.y >= 700){
            item.y -= 750;
        }
        item.y += player.speed;
        item.style.top = item.y + "px";
    });
}

function moveEnemyCars(carElement){
    let enemyCars = document.querySelectorAll('.enemyCar');
    enemyCars.forEach((item)=> {

        if(onCollision(carElement, item)){
            onGameOver();
        }
        if(item.y >= 750){
            item.y = -300;
            item.style.left = Math.floor(Math.random() * 350) + "px";
        }
        item.y += player.speed;
        item.style.top = item.y + "px";
    });
}

function gamePlay() {
    let carElement = document.querySelector('.car');
    let road = gameArea.getBoundingClientRect();

    if(player.start){
        moveRoadLines();
        moveEnemyCars(carElement);

        if(keys.ArrowUp && player.y > (road.top + 70)) player.y -= player.speed;
        if(keys.ArrowDown && player.y < (road.bottom - 85)) player.y += player.speed;
        if(keys.ArrowLeft && player.x > 0) player.x -= player.speed;
        if(keys.ArrowRight && player.x < (road.width - 65)) player.x += player.speed;

        document.addEventListener('touchmove', (e)=>{
            // Buggy
            e.preventDefault();
            const x = e.touches[0].clientX - 35;
            const y = e.touches[0].clientY - 35;
            if(y > (road.top + 70) && y < (road.bottom - 85)) {
                player.y = y;
            }
            if(x > 0 && x < (road.width - 60)) {
                player.x = x;
            }
        });

        carElement.style.top = player.y + "px";
        carElement.style.left = player.x + "px";

        window.requestAnimationFrame(gamePlay);

        player.score++;
        const ps = player.score - 1;
        score.innerHTML = 'Очки: ' + ps;
    }
}
document.addEventListener('keydown', (e)=>{
    e.preventDefault();
    if(Object.keys(keys).includes(e.key)) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e)=>{
    e.preventDefault();
    if(Object.keys(keys).includes(e.key)) {
        keys[e.key] = false;
    }
});
