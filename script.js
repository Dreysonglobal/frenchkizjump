// Select elements 
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverModal = document.getElementById("gameOverModal");
const retryButton = document.getElementById("retryButton");
const finalScoreDisplay = document.getElementById("finalScore");
const startMessage = document.getElementById("startMessage");

// Set canvas size
canvas.width = 400;
canvas.height = 500;

// Load images (Updated with provided URLs)
const bgImage = new Image();
bgImage.src = "https://i.postimg.cc/L8XRK2Vk/download.jpg"; // Background

const birdImage = new Image();
birdImage.src = "https://i.postimg.cc/MZfRz3kM/IMG-1717.jpg"; // Bird

const pipeImage = new Image();
pipeImage.src = "https://i.postimg.cc/GTK3sF1R/pipe.jpg"; // Pipes

// Load sound effects
const flapSound = new Audio('jumpsound.aac');
const hitSound = new Audio('jumpsound.aac');
const pointSound = new Audio('');
const gameOverSound = new Audio('gameover.aac');

// Game variables
let bird, pipes, gameStarted, gameOver;
const gravity = 0.5;
const pipeWidth = 50;
const pipeGap = 120;
const pipeSpeed = 2;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0; // Retrieve highest score

// Reset game function
function resetGame() {
    bird = { x: 50, y: 150, width: 34, height: 24, velocity: 0, jump: -8 };
    pipes = [];
    score = 0;
    gameStarted = false;
    gameOver = false;
    gameOverModal.style.display = "none";
    startMessage.style.display = "block";
}

// Jump function
function jump() {
    if (!gameOver) {
        if (!gameStarted) {
            gameStarted = true;
            startMessage.style.display = "none";
        }
        bird.velocity = bird.jump;
        flapSound.play(); // Play flap sound
    }
}

// Keyboard and touch event listeners
document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        jump();
    }
});

// Add touch event for mobile users
canvas.addEventListener("click", jump);
canvas.addEventListener("touchstart", function (event) {
    event.preventDefault(); // Prevent unwanted scrolling
    jump();
});

// Retry button click
retryButton.addEventListener("click", function () {
    resetGame();
    gameLoop();
});

// Function to create pipes
function createPipe() {
    let pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 50)) + 20;
    pipes.push({ x: canvas.width, y: pipeHeight });
}

// Update game
function update() {
    if (!gameStarted || gameOver) return;

    bird.velocity += gravity;
    bird.y += bird.velocity;

    // Prevent bird from leaving the canvas
    if (bird.y <= 0 || bird.y + bird.height >= canvas.height) {
        hitSound.play(); // Play hit sound
        endGame();
    }

    // Move pipes and detect collision
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeSpeed;

        // Check for collision with pipes
        if (
            bird.x < pipes[i].x + pipeWidth &&
            bird.x + bird.width > pipes[i].x &&
            (bird.y < pipes[i].y || bird.y + bird.height > pipes[i].y + pipeGap)
        ) {
            hitSound.play(); // Play hit sound
            endGame();
        }

        // Score update
        if (pipes[i].x + pipeWidth < bird.x && !pipes[i].passed) {
            score++;
            pipes[i].passed = true;
            pointSound.play(); // Play point sound when passing a pipe
        }
    }

    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x > -pipeWidth);

    // Generate new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        createPipe();
    }
}

// Draw game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Draw pipes
    for (let i = 0; i < pipes.length; i++) {
        ctx.drawImage(pipeImage, pipes[i].x, 0, pipeWidth, pipes[i].y);
        ctx.drawImage(pipeImage, pipes[i].x, pipes[i].y + pipeGap, pipeWidth, canvas.height - pipes[i].y - pipeGap);
    }

    // Draw bird
    ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, canvas.width - 120, 30);
    ctx.fillText(`Best run: ${highScore}`, canvas.width - 120, 55);
}

// End game function
function endGame() {
    gameOver = true;
    gameOverSound.play(); // Play game over sound

    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    gameOverModal.style.display = "block";
    finalScoreDisplay.textContent = `Final Score: ${score}`;
}

// Main game loop
function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Initialize game
resetGame();
gameLoop();
