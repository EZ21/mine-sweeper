'use strict';

// ONCONTEXTMENU:
// oncontextmenu="return false" disable the right-click menu when clicking the mouse's right button

// THE MODEL:
var gBoard = null; // A Matrix containing cell objects: Each cell: { minesAroundCount: 4, isShown: true, isMine: false, isMarked: true }

const gLevel = {
  size: 4, // number of cells in a row (4*4)
  mines: 2, // number of mines on the board
};

const gGame = {
  isOn: false, // game is on Boolean, when true we let the user play
  shownCount: 0, // How many cells are shown
  markedCount: 0, // How many cells are marked with a flag
  secsPassed: 0, // How many seconds passed
  isFirstClick: false,
  life: 3, // player has 3 disqualifications before Game Over
  timeStart: null,
  timerInterval: null,
};

// DOM:
const MINE = '💣';
const FLAG = '🚩';
const PLAYER = '🤔';
const LOSE = '💀';
const WIN = '😎';

function initGame() {
  // This is called when page loads
  gGame.isOn = true;
  gGame.life = 3;
  const elResetBtn = document.querySelector('.reset');
  elResetBtn.innerText = PLAYER;
  gBoard = buildBoard(gLevel.size);
  renderBoard(gBoard, ".board-container");
  const elMinesCounterSpan = document.querySelector('.mines span');
  elMinesCounterSpan.innerText = gLevel.mines;
  gGame.isFirstClick = true;
}

function placeMines(board, rowIdx, colIdx){
  for (var i = 0; i < gLevel.mines; i++){
    const location = getRandomCell(board); // an object with cell coordinates {i: [i], j :[j]}
    if((location.i === rowIdx) && (location.j === colIdx)) continue; // if it's the first cell clicked - don't place a mine in it!

    if(board[location.i][location.j].isMine === false){
      board[location.i][location.j].isMine = true;
      setMineNegsCount(board, location.i, location.j);
    }
  }
}

function setMineNegsCount(board, rowIdx, colIdx) {
  // Count mines around each cell and set the cell's minesAroundCount.
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > board.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > board[i].length - 1) continue;
      if (i === rowIdx && j === colIdx) continue;
      board[i][j].minesAroundCount++; // marks the neighbor cell next to the mine: how many mines near the neighbor cell
    }
  }
}

function cellClicked(event, i, j) {
  // Called when a cell (td) is clicked
  const elCell = document.querySelector(`.cell-${i}-${j}`);
  const elLifeCounter = document.querySelector('.life span');
  if (!gGame.isOn) return;
  if (gBoard[i][j].isShown) return;

  if(event.button === 0){

    if(gGame.isFirstClick){
      //if it's the player first move:
      gGame.isFirstClick = false;
      placeMines(gBoard, i, j);
      startTimer();
    }

    if (gBoard[i][j].isMine){
      // UPDATE MODEL:
      gGame.life--;
      checkGameOver(i, j); // PLAYER LOSE

      // UPDATE DOM:
      elCell.innerText = MINE;
      elLifeCounter.innerText = gGame.life;
    } else {
      // isMine === false
      gBoard[i][j].isShown = true;
      gGame.shownCount++; // How many cells are shown
      if((!gBoard[i][j].isMine) && (gBoard[i][j].minesAroundCount === 0)){
        // if the cell has no mine and no mines around it:
        elCell.classList.add('expand');
        elCell.innerText = '';
        expandCellNeighbors(gBoard, i, j);
      } else {
        elCell.classList.add('expand');
        elCell.innerText = `${gBoard[i][j].minesAroundCount}`;
      }
    }
  }
  cellMarked(event, i, j);

  checkGameOver(i, j); // check if the player wins
}

function cellMarked(event, i, j) {
  // Called on ***right click*** to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
  const elCell = document.querySelector(`.cell-${i}-${j}`);

  if (event.button === 2){
    if(gBoard[i][j].isMarked){
      // UPDATE DOM:
      elCell.innerText = '';
        
      // UPDATE MODEL:
      gBoard[i][j].isMarked = false;
    } else {
      // UPDATE DOM:
      elCell.innerText = FLAG;
      // UPDATE MODEL:
      gBoard[i][j].isMarked = true;
      // isMarked === false
    }
  }
}


// EXPAND EMPTY CELL'S NEIGHBOR CELLS:
function expandCellNeighbors(board, rowIdx, colIdx) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue;
      if (i === rowIdx && j === colIdx) continue;

      // update MODEL:
      if (!board[i][j].isShown) gGame.shownCount++;

      board[i][j].isShown = true;
          // update DOM:
          const elCell = document.querySelector(`.cell-${i}-${j}`);
          elCell.classList.add('expand');
          elCell.innerText = (0 === board[i][j].minesAroundCount) ? '' : board[i][j].minesAroundCount;
    }
  }
}


function checkGameOver(i, j) {
  const elResetBtn = document.querySelector('.reset');
  // Game ends when all mines are marked, and all the other cells are shown
  if((gGame.shownCount === ((gLevel.size ** 2) - gLevel.mines)) && (gGame.markedCount === gLevel.mines)){
    clearInterval(gGame.timerInterval);
    elResetBtn.innerText = WIN;
    console.log('PLAYER WINS');
    gGame.isOn = false;
  } else if((gBoard[i][j].isMine) && (gGame.life === 0)){
    clearInterval(gGame.timerInterval);
    elResetBtn.innerText = LOSE;

    console.log('PLAYER LOSES');
    gGame.isOn = false;
  }
}

function restGame(){
  clearInterval(gGame.timerInterval);
  gGame.timerInterval = null;
  const elTimerSpan = document.querySelector(".timer span");
  elTimerSpan.innerText = '0';
  initGame();
}