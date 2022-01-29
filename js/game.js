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
  life: 0,
  timeStart: null,
  timerInterval: null,
};

// DOM:
const MINE = '💣';
const FLAG = '🚩';
const PLAYER = '🤔';
const LOSE = '💀';
const WIN = '😎';

const gExplosion = new Audio('sound/mine.wav');

function initGame() {
  gGame.isOn = true;
  gGame.markedCount = 0;
  gGame.shownCount = 0;
  gGame.life = (gLevel.size === 4) ? (1) : (3);
  presentLifeCounter(gGame.life);

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
    const location = getRandomCell(board);
    if((location.i === rowIdx) && (location.j === colIdx)) continue;
      board[location.i][location.j].isMine = true;
      setMineNegsCount(board, location.i, location.j);
  }
}

function setMineNegsCount(board, rowIdx, colIdx) {
  // Count mines around each cell and set the cell's minesAroundCount.
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > board.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > board[i].length - 1) continue;
      if (i === rowIdx && j === colIdx) continue;
      board[i][j].minesAroundCount++;
    }
  }
}

function cellClicked(event, i, j) {
  // Called when a cell (td) is clicked
  const elCell = document.querySelector(`.cell-${i}-${j}`);
  if ((!gGame.isOn) || (gBoard[i][j].isShown)) return;

  if(event.button === 0){

    if(gGame.isFirstClick){
      gGame.isFirstClick = false;
      placeMines(gBoard, i, j);
      startTimer();
    }
    if(gBoard[i][j].isMarked) return;

    if (gBoard[i][j].isMine){
      // UPDATE MODEL:
      gGame.life--;
      gBoard[i][j].isShown = true;
      
      // UPDATE DOM:
      elCell.classList.add('expand');
      elCell.innerText = MINE;
      gExplosion.play();
      presentLifeCounter(gGame.life);
      checkGameOver(i, j); // PLAYER LOSE
    } else {
      gBoard[i][j].isShown = true;
      gGame.shownCount++;

      if((!gBoard[i][j].isMine) && (gBoard[i][j].minesAroundCount === 0)){
        elCell.classList.add('expand');
        elCell.innerText = '';
        expandCellNeighbors(gBoard, i, j);
      } else {
        elCell.classList.add('expand');
        elCell.innerText = `${gBoard[i][j].minesAroundCount}`;
        elCell.style.color = textColor(gBoard[i][j].minesAroundCount);
      }
      checkGameOver(i, j); // CHECK IF PLAYER WINS
    }
  }

  if (event.button === 2){
    if(gBoard[i][j].isMarked){      
    // UPDATE MODEL:
      gGame.markedCount--;
      gBoard[i][j].isMarked = false;

      // UPDATE DOM:
      elCell.innerText = '';
    } else {
      // UPDATE MODEL:
      gGame.markedCount++;
      gBoard[i][j].isMarked = true;

      // UPDATE DOM:
      elCell.innerText = FLAG;
      checkGameOver(i, j); // CHECK IF PLAYER WINS
    }
  }
}

// EXPAND EMPTY CELL'S NEIGHBOR CELLS:
function expandCellNeighbors(board, rowIdx, colIdx) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if ((i < 0) || (i >= board.length)) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if ((j < 0) || (j >= board[0].length)) continue;
      if ((i === rowIdx) && (j === colIdx)) continue;

      if((!board[i][j].isShown) && (0 === board[i][j].minesAroundCount)){
        board[i][j].isShown = true;
        gGame.shownCount++;
        expandCellNeighbors(gBoard, i, j);
      }
      // update MODEL:
      if (!board[i][j].isShown){
        board[i][j].isShown = true;
        gGame.shownCount++;
      }
      // update DOM:
      const elCell = document.querySelector(`.cell-${i}-${j}`);
      elCell.classList.add('expand');
      elCell.innerText = (0 === board[i][j].minesAroundCount) ? '' : board[i][j].minesAroundCount;
      elCell.style.color = textColor(board[i][j].minesAroundCount);
    }
  }
}


function checkGameOver(i, j) {
  const elResetBtn = document.querySelector('.reset');
  // Game ends when all mines are marked, and all the other cells are shown
  if((gGame.shownCount === ((gLevel.size ** 2) - gLevel.mines)) && (gGame.markedCount === gLevel.mines)){
    clearInterval(gGame.timerInterval);
    elResetBtn.innerText = WIN;
    gGame.isOn = false;
  } else if((gBoard[i][j].isMine) && (gGame.life === 0)){
    clearInterval(gGame.timerInterval);
    showAllMineLocations(gBoard);
    elResetBtn.innerText = LOSE;
    gGame.isOn = false;
  }
}

function restGame(){
  clearInterval(gGame.timerInterval);
  gGame.timerInterval = null;
  gGame.markedCount = 0;
  gGame.shownCount = 0;
  const elTimerSpan = document.querySelector(".timer span");
  elTimerSpan.innerText = '0'
  presentLifeCounter(gGame.life);
  initGame();
}

function showAllMineLocations(board){
  for (var i = 0; i < board.length; i++){
    for (var j = 0; j < board[i].length; j++){
      if(board[i][j].isMine){
        const elCell = document.querySelector(`.cell-${i}-${j}`);
        elCell.classList.add('expand');
        elCell.innerText = MINE;
      }
    }
  }
  gExplosion.play();
}

function presentLifeCounter(life){
  const LIFE = '🪖';
  const elLifeCounter = document.querySelector('.life span');
  elLifeCounter.innerText = (life > 0) ? (LIFE.repeat(life)) : ('');
}

function textColor(minesAroundCount){
  var color = null;
  switch (minesAroundCount){
    case 1:
      color = '#0000ff';
      break;
    case 2:
      color = '#008000';
      break;
    case 3:
      color = '#ff0000';
      break;
    case 4:
      color = '#00008b';
      break;
  }
  return color;
}