"use strict";

// ONCONTEXTMENU:
// oncontextmenu="return false" disable the right-click menu when clicking the mouse's right button

function buildBoard(size) {
  // Builds the board; Set mines at random locations; Call setMinesNegsCount(); Return the created board
  var board = [];
  for (var i = 0; i < size; i++) {
    board.push([]);
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        // individual cell object (instead of const cell, to prevent many pointers to one global variable):
        minesAroundCount: 0,
        isShown: false, // revealed or covered cell
        isMine: false, // contains a mine or not
        isMarked: false, // marked with flag
      };
    }
  }
  placeMines(board);

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
  return location; // an object with cell coordinates {i: [i], j :[j]}
}

// TIMER:
function startTimer(){
  
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}