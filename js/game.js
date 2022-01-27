'use strict';

// ONCONTEXTMENU:
// oncontextmenu="return false" disable the right-click menu when clicking the mouse's right button

// THE MODEL:
var gBoard = null; // A Matrix containing cell objects: Each cell: { minesAroundCount: 4, isShown: true, isMine: false, isMarked: true }

const gLevel = {
  size: 4, // number of cells in a row (4*4)
  mines: 2, // number of mines on the board
};

// const cell = {
//   minesAroundCount: 0,
//   isShown: false, // revealed or covered cell
//   isMine: false, // contains a mine or not
//   isMarked: false, // marked with flag
// };

const gGame = {
  isOn: false, // game is on Boolean, when true we let the user play
  shownCount: 0, // How many cells are shown
  markedCount: 0, // How many cells are marked with a flag
  secsPassed: 0, // How many seconds passed
  isFirstClick: false,
};

// DOM:
// const MINE = '<img src="img/mine.png">';
const MINE = '💣';
const FLAG = '🚩';

function initGame() {
  gGame.isOn = true;
  // This is called when page loads
  gBoard = buildBoard(gLevel.size);
  // console.log('gBoard', gBoard);
  renderBoard(gBoard, ".board-container");
  // console.table(gBoard);
  gGame.isFirstClick = true;
}

function placeMines(board){
  for (var i = 0; i < gLevel.mines; i++){
    const location = getRandomCell(board); // an object with cell coordinates {i: [i], j :[j]}
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
      // console.log(`board[${i}][${j}]minesAroundCount`, board[i][j].minesAroundCount);
    }
  }
}

function cellClicked(event, i, j) {
  // console.log('event',event);
  // Called when a cell (td) is clicked
  if (!gGame.isOn) return;
  if (gBoard[i][j].isShown) return;
  if(gGame.isFirstClick){
    //if it's the player first move:
    gGame.isFirstClick = false;
    startTimer();
  }
  const elCell = document.querySelector(`.cell-${i}-${j}`);

  if(event.button === 0){
    if (gBoard[i][j].isMine){
      // UPDATE DOM:
      elCell.innerText = MINE;
      // UPDATE MODEL:
      checkGameOver(i, j); // PLAYER LOSE
    } else {
      // isMine === false
      gGame.shownCount++; // How many cells are shown
      // console.log('gGame.shownCount', gGame.shownCount);
      elCell.innerText = `${gBoard[i][j].minesAroundCount}`;
    }
  // } else if (event.button === 2){
  }
  cellMarked(event, i, j);

  checkGameOver(i, j); // CHECK IF PLAYER WINS
  // if(event.mousedown.button === 2){
  //   // FLAG CELL
  //   // window.event.preventDefault(); // prevent menu opening
  //   elCell.classList.toggle('cell-marked');
  // }
}

function cellMarked(event, i, j) {
  // Called on ***right click*** to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
  // window.event.preventDefault();
  // console.log('right i = ', i, 'j =',j);
  // elCell.classList.toggle('cell-marked');

  // if(event.mousedown.button === 2){
    // FLAG CELL
    // window.event.preventDefault(); // prevent menu opening
    // elCell.classList.toggle('cell-marked');

    const elCell = document.querySelector(`.cell-${i}-${j}`);

    if (event.button === 2){
      if(gBoard[i][j].isMarked){
        // console.log('gBoard[i][j].isMarked', gBoard[i][j].isMarked);
        // UPDATE DOM:
        elCell.innerText = '';
        
        // UPDATE MODEL:
        gBoard[i][j].isMarked = false;
        // console.log('gBoard[i][j].isMarked', gBoard[i][j].isMarked);
      } else {
        // console.log('gBoard[i][j].isMarked', gBoard[i][j].isMarked);
        // UPDATE DOM:
        elCell.innerText = FLAG;
        // UPDATE MODEL:
        gBoard[i][j].isMarked = true;
        // isMarked === false
        // console.log('gBoard[i][j].isMarked', gBoard[i][j].isMarked);
      }
    }
}

function checkGameOver(i, j) {
  // Game ends when all mines are marked, and all the other cells are shown
  if((gGame.shownCount === ((gLevel.size ** 2) - gLevel.mines)) && (gGame.markedCount === gLevel.mines)){
    console.log('PLAYER WINS');
    gGame.isOn = false;
  } else if(gBoard[i][j].isMine){

      // UPDATE DOM:
      elCell.innerText = MINE;
      // UPDATE MODEL:
    console.log('PLAYER LOSES');


    gGame.isOn = false;
  }
}