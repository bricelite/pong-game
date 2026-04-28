// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
const gameState = {
    isRunning: false,
    playerScore: 0,
    computerScore: 0
};

// Paddles
const paddle = {
    width: 10,
    height: 80,
    speed: 6,
    player: {
        x: 10,
        y: canvas.height / 2 - 40
    },
    computer: {
        x: canvas.width - 20,
        y: canvas.height / 2 - 40
    }
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 7,
    speedX: 5,
    speedY: 5,
    maxSpeed: 8
};

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

// Keyboard input
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        if (!gameState.isRunning) {
            startGame();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Mouse input
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Game functions
function startGame() {
    gameState.isRunning = true;
    resetBall();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speedY = (Math.random() - 0.5) * 8;
}

function updatePlayerPaddle() {
    // Arrow keys control
    if (keys['arrowup'] && paddle.player.y > 0) {
        paddle.player.y -= paddle.speed;
    }
    if (keys['arrowdown'] && paddle.player.y < canvas.height - paddle.height) {
        paddle.player.y += paddle.speed;
    }
    
    // Mouse control
    const targetY = mouseY - paddle.height / 2;
    if (Math.abs(targetY - paddle.player.y) > 2) {
        paddle.player.y += (targetY - paddle.player.y) * 0.15;
    }
    
    // Keep paddle in bounds
    paddle.player.y = Math.max(0, Math.min(canvas.height - paddle.height, paddle.player.y));
}

function updateComputerPaddle() {
    // AI: Follow the ball with slight imperfection
    const paddleCenter = paddle.computer.y + paddle.height / 2;
    const difficulty = 0.08; // Lower = harder AI (0-1)
    
    if (ball.speedX > 0) { // Only move when ball is coming towards computer
        if (paddleCenter < ball.y - 35) {
            paddle.computer.y += paddle.speed * (0.5 + difficulty);
        } else if (paddleCenter > ball.y + 35) {
            paddle.computer.y -= paddle.speed * (0.5 + difficulty);
        }
    }
    
    // Keep paddle in bounds
    paddle.computer.y = Math.max(0, Math.min(canvas.height - paddle.height, paddle.computer.y));
}

function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.speedY = -ball.speedY;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }
    
    // Paddle collision - Player
    if (
        ball.x - ball.radius < paddle.player.x + paddle.width &&
        ball.y > paddle.player.y &&
        ball.y < paddle.player.y + paddle.height &&
        ball.speedX < 0
    ) {
        ball.speedX = -ball.speedX;
        const deltaY = ball.y - (paddle.player.y + paddle.height / 2);
        ball.speedY = (deltaY / (paddle.height / 2)) * ball.maxSpeed;
        ball.x = paddle.player.x + paddle.width + ball.radius;
    }
    
    // Paddle collision - Computer
    if (
        ball.x + ball.radius > paddle.computer.x &&
        ball.y > paddle.computer.y &&
        ball.y < paddle.computer.y + paddle.height &&
        ball.speedX > 0
    ) {
        ball.speedX = -ball.speedX;
        const deltaY = ball.y - (paddle.computer.y + paddle.height / 2);
        ball.speedY = (deltaY / (paddle.height / 2)) * ball.maxSpeed;
        ball.x = paddle.computer.x - ball.radius;
    }
    
    // Scoring
    if (ball.x - ball.radius < 0) {
        gameState.computerScore++;
        updateScore();
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        gameState.playerScore++;
        updateScore();
        resetBall();
    }
}

function updateScore() {
    document.getElementById('playerScore').textContent = gameState.playerScore;
    document.getElementById('computerScore').textContent = gameState.computerScore;
}

function drawCourt() {
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Center line
    ctx.strokeStyle = '#00ff00';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Top and bottom border
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function drawPaddles() {
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
    ctx.shadowBlur = 10;
    
    // Player paddle
    ctx.fillRect(paddle.player.x, paddle.player.y, paddle.width, paddle.height);
    
    // Computer paddle
    ctx.fillRect(paddle.computer.x, paddle.computer.y, paddle.width, paddle.height);
    
    ctx.shadowColor = 'transparent';
}

function drawBall() {
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

function gameLoop() {
    if (gameState.isRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
    
    drawCourt();
    drawPaddles();
    drawBall();
    
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
