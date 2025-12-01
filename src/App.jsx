import { useEffect, useState } from 'react';
import './App.css'; // Assuming you have this CSS file

const SIZE = 4;

function getEmptyBoard() {
  return Array(SIZE).fill().map(() => Array(SIZE).fill(0));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function addRandomTile(board) {
  const emptyTiles = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) emptyTiles.push([r, c]);
    }
  }
  if (emptyTiles.length === 0) return board; // Should ideally not happen if game over logic is correct before calling this
  
  // Create a new board copy to avoid mutating the previous state directly before setting it
  const newBoard = board.map(row => [...row]); 
  const [r, c] = emptyTiles[getRandomInt(emptyTiles.length)];
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

function transpose(board) {
  const newBoard = getEmptyBoard(); // Or create a new board of the correct size
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      newBoard[c][r] = board[r][c];
    }
  }
  return newBoard;
}

function reverse(board) {
  return board.map(row => [...row].reverse());
}

function compress(board) {
  // Create a new board to ensure immutability for state updates
  const newBoard = board.map(row => {
    let newRow = row.filter(val => val !== 0);
    while (newRow.length < SIZE) {
      newRow.push(0);
    }
    return newRow;
  });
  return newBoard;
}

function merge(board) {
  const newBoard = board.map(row => [...row]); // Create a copy
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE - 1; c++) {
      if (newBoard[r][c] !== 0 && newBoard[r][c] === newBoard[r][c + 1]) {
        newBoard[r][c] *= 2;
        newBoard[r][c + 1] = 0;
      }
    }
  }
  return newBoard;
}


function moveLeft(board) {
  let boardCopy = board.map(row => [...row]); // Start with a fresh copy
  boardCopy = compress(boardCopy);
  boardCopy = merge(boardCopy);       // merge now returns a new board
  boardCopy = compress(boardCopy);
  return boardCopy;
}

function moveRight(board) {
  let boardCopy = board.map(row => [...row]);
  boardCopy = reverse(boardCopy);
  boardCopy = moveLeft(boardCopy); // moveLeft handles its own copies
  return reverse(boardCopy);
}

function moveUp(board) {
  let boardCopy = board.map(row => [...row]);
  boardCopy = transpose(boardCopy);
  boardCopy = moveLeft(boardCopy);
  return transpose(boardCopy);
}

function moveDown(board) {
  let boardCopy = board.map(row => [...row]);
  boardCopy = transpose(boardCopy);
  boardCopy = moveRight(boardCopy); // moveRight handles its own copies
  return transpose(boardCopy);
}

function isGameOver(board) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return false;
      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return false;
      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
}

function App() {
  const [board, setBoard] = useState(() => {
    let newBoard = getEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    return newBoard;
  });

  const [gameOver, setGameOver] = useState(false);

  const handleKeyDown = (e) => {
    if (gameOver) return;

    let processedBoard;
    const currentBoardCopy = board.map(row => [...row]); 

    if (e.key === 'ArrowLeft') processedBoard = moveLeft(currentBoardCopy);
    else if (e.key === 'ArrowRight') processedBoard = moveRight(currentBoardCopy);
    else if (e.key === 'ArrowUp') processedBoard = moveUp(currentBoardCopy);
    else if (e.key === 'ArrowDown') processedBoard = moveDown(currentBoardCopy);
    else return; // No relevant key pressed

    if (JSON.stringify(board) !== JSON.stringify(processedBoard)) {
      const boardWithNewTile = addRandomTile(processedBoard);
      setBoard(boardWithNewTile);
      
      if (isGameOver(boardWithNewTile)) {
        setGameOver(true);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, gameOver]); // Rerun effect if board or gameOver changes

  // --- Solution for Restart Game ---
  const restartGame = () => {
    let newBoard = getEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setGameOver(false); // Reset the game over state
  };
  // --- End Solution ---

  return (
    <div className="container">
      <h1>2048 Game</h1>
      <div className="board-container">
        <div className="board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex} className={`cell cell-${cell}`}>{cell !== 0 ? cell : ''}</div>
              ))}
            </div>
          ))}
        </div>
        {gameOver && <div className="game-over">Game Over</div>}
      </div>
      {/* --- Solution for Restart Button --- */}
      <div>
        <button onClick={restartGame} className="restart">
          Restart
        </button>
      </div>
      
      {/* --- End Solution --- */}
    </div>
  );
}

export default App;