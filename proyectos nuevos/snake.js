// Obtener el canvas y su contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajustar el tamaño del canvas para dispositivos móviles
function resizeCanvas() {
    const container = document.getElementById('game-container');
    const containerWidth = container.clientWidth;
    canvas.width = containerWidth;
    canvas.height = containerWidth;
}

// Llamar a resizeCanvas cuando la ventana cambie de tamaño
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Tamaño de cada celda del juego
const gridSize = 20;
let tileCount;

function updateTileCount() {
    tileCount = Math.floor(canvas.width / gridSize);
}
updateTileCount();

// Inicializar variables del juego
let snake = [
    { x: 10, y: 10 }
];
let food = { x: 15, y: 15 };
let dx = 1;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameOver = false;
let isPaused = false;
let gameLoop;

// Velocidad del juego (ms)
const gameSpeed = 100;

// Colores
const snakeColor = '#27ae60';
const foodColor = '#e74c3c';

// Sonidos
const eatSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
const gameOverSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');

// Función para dibujar un cuadrado
function drawSquare(x, y, color) {
    const size = canvas.width / tileCount;
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size - 2, size - 2);
}

// Función para generar comida en posición aleatoria
function generateFood() {
    let newFood;
    let isOnSnake;
    
    do {
        isOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                isOnSnake = true;
                break;
            }
        }
    } while (isOnSnake);
    
    food = newFood;
}

// Función principal del juego
function gameUpdate() {
    if (gameOver || isPaused) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
        }
        document.getElementById('score').textContent = `Puntuación: ${score} | Récord: ${highScore}`;
        eatSound.play().catch(() => {});
        generateFood();
    } else {
        snake.pop();
    }

    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach(segment => drawSquare(segment.x, segment.y, snakeColor));
    drawSquare(food.x, food.y, foodColor);

    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSA', canvas.width/2, canvas.height/2);
    }
}

// Función para cambiar la dirección
function changeDirection(newDx, newDy) {
    // Evitar que la serpiente vaya en dirección opuesta
    if (newDx !== -dx && newDy !== -dy) {
        dx = newDx;
        dy = newDy;
    }
}

// Control de teclas
document.addEventListener('keydown', (event) => {
    if (gameOver) return;

    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            changeDirection(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            changeDirection(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            changeDirection(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            changeDirection(1, 0);
            break;
        case ' ':
            togglePause();
            break;
    }
});

// Controles táctiles
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const pauseBtn = document.getElementById('pauseBtn');

upBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    changeDirection(0, -1);
});

downBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    changeDirection(0, 1);
});

leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    changeDirection(-1, 0);
});

rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    changeDirection(1, 0);
});

pauseBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    togglePause();
});

// Función para alternar pausa
function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pause-message').style.display = isPaused ? 'block' : 'none';
}

// Función para terminar el juego
function endGame() {
    gameOver = true;
    clearInterval(gameLoop);
    gameOverSound.play().catch(() => {});
    document.getElementById('final-score').textContent = score;
    document.getElementById('high-score').textContent = highScore;
    document.getElementById('game-over').style.display = 'block';
}

// Función para reiniciar el juego
function resetGame() {
    resizeCanvas();
    updateTileCount();
    
    snake = [{ x: Math.floor(tileCount/4), y: Math.floor(tileCount/2) }];
    food = { x: Math.floor(tileCount*3/4), y: Math.floor(tileCount/2) };
    dx = 1;
    dy = 0;
    score = 0;
    gameOver = false;
    isPaused = false;
    document.getElementById('score').textContent = `Puntuación: ${score} | Récord: ${highScore}`;
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('pause-message').style.display = 'none';
    clearInterval(gameLoop);
    gameLoop = setInterval(gameUpdate, gameSpeed);
}

// Prevenir el scroll en dispositivos móviles cuando se toca el canvas
canvas.addEventListener('touchstart', (e) => e.preventDefault());
canvas.addEventListener('touchmove', (e) => e.preventDefault());
canvas.addEventListener('touchend', (e) => e.preventDefault());

// Iniciar el juego
document.getElementById('score').textContent = `Puntuación: ${score} | Récord: ${highScore}`;
gameLoop = setInterval(gameUpdate, gameSpeed); 