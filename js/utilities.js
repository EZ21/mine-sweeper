"use strict";

// ONCONTEXTMENU:
// oncontextmenu="return false" disable the right-click menu when clicking the mouse's right button

function getLevel(size, mines) {
  gLevel.size = size;
  gLevel.mines = mines;
  clearInterval(gGame.timerInterval);
  gGame.timerInterval = null;
  const elTimerSpan = document.querySelector(".timer span");
  elTimerSpan.innerText = '0'
  initGame();
  return gLevel;
}

function buildBoard(size) {
  // Builds the board; Set mines at random locations; Call setMinesNegsCount(); Return the created board
  var board = [];
  for (var i = 0; i < size; i++) {
    board.push([]);
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false, // revealed or covered cell
        isMine: false, // contains a mine or not
        isMarked: false, // marked with flag
      };
    }
  }
  return board;
}

function renderBoard(board) {
  // Render the board as a <table> to the page
  var strHTML = '<table><tbody>';

  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < board[i].length; j++) {
      const currCell = (board[i][j].isShown) ? board[i][j].minesAroundCount: '';
      strHTML += `<td class="cell cell-${i}-${j}" onmousedown="cellClicked(event, ${i}, ${j})"></td>`;
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector('.board-container');
  elContainer.innerHTML = strHTML;
}

// RANDOME CELL TO PLACE A MINE:
function getRandomCell(board){
  const location = {
    i: getRandomIntInclusive(0, board.length-1),
    j: getRandomIntInclusive(0, board.length-1),
  }
  return location;
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// TIMER:
function presentTimer() {
  gGame.secsPassed = (Date.now() - gGame.timeStart) / 1000;
  const elTimerSpan = document.querySelector(".timer span");
  elTimerSpan.innerText = `${gGame.secsPassed.toFixed(0)}`;
}

function startTimer() {
  gGame.timeStart = Date.now();
  gGame.timerInterval = setInterval(presentTimer, 1000);
}