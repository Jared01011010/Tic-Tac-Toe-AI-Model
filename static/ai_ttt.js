const xMark = `<svg class="piece" fill="blue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
  <path d="M342.6 150.6c12.5-12.5 12.5-32.8 
  0-45.3s-32.8-12.5-45.3 0L192 
  210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 
  0s-12.5 32.8 0 45.3L146.7 256 
  41.4 361.4c-12.5 12.5-12.5 32.8 
  0 45.3s32.8 12.5 45.3 0L192 
  301.3 297.4 406.6c12.5 12.5 
  32.8 12.5 45.3 0s12.5-32.8 
  0-45.3L237.3 256 342.6 150.6z"/>
</svg>`;

const oMark = `<svg class="piece" fill="red" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
  <path d="M224 96a160 160 0 1 0 0 
  320 160 160 0 1 0 0-320zM448 
  256A224 224 0 1 1 0 256a224 
  224 0 1 1 448 0z"/>
</svg>`;

const allCells = document.querySelectorAll('.cell');
const result = document.getElementById('result');

let board = Array(9).fill(0);
let gameOver = false;
let aiStarts = false;

// Allow restarting with player or AI first
function startGame(starter) {
    board = Array(9).fill(0);
    gameOver = false;
    result.textContent = '';
    aiStarts = starter === 'ai';

    allCells.forEach(cell => {
        cell.innerHTML = '';
    });

    if (aiStarts) {
        aiMove();
    }
}

function stopGame(message) {
    gameOver = true;
    result.textContent = message;
}

// Check for winner
function winVerifier() {
    const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    for (let [a,b,c] of winPatterns) {
        if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
            stopGame(board[a] === 1 ? 'You win!' : 'AI wins!');
            return true;
        }
    }
    if (!board.includes(0)) {
        stopGame('Draw!');
        return true;
    }
    return false;
}

// AI move
async function aiMove() {
    const response = await fetch('http://localhost:5000/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: board.map(v => v) })
    });

    const data = await response.json();
    const aiMove = data.move;

    if (board[aiMove] === 0 && !gameOver) {
        board[aiMove] = -1;
        const aiCell = document.querySelector(`.cell[cell-id="${aiMove}"]`);
        aiCell.innerHTML = xMark;
        winVerifier();
    }
}

// Handle player click
allCells.forEach(cell => {
    cell.addEventListener('click', async () => {
        if (gameOver || cell.firstChild) return;

        const index = parseInt(cell.getAttribute('cell-id'));
        if (board[index] !== 0) return;

        board[index] = 1;
        cell.innerHTML = oMark;

        if (winVerifier()) return;

        setTimeout(() => {
            aiMove();
        }, 200);  // Small delay to feel natural
    });
});