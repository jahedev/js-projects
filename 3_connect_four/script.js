const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const status = document.querySelector('#status')

// Set Canvas Dimensions to Board Image Size
canvas.width = 640
canvas.height = 480

// Player 1 is red by default
let player1Turn = true

// Checkers cannot be added when game ends
let gameEnded = false

// These are the colors of the checkers
const COLORS = {
  RED: '#D4252E',
  YELLOW: '#F1DE00',
  BLUE: '#1F90FF',
  GREY: '#393e46',
}

// drawing X (col) and Y (row) coordinates of the checkers
let loc_col = [50, 140, 230, 320, 410, 500, 590] // n += 90
let loc_row = [40, 120, 200, 280, 360, 440] // n += 80

// store the empty, red, and yellow checkers
let grid = [
  /* grid[row][col] */
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
]

let lastHover = { row: 0, col: 0 }

class Board {
  draw() {
    c.beginPath()
    c.rect(0, 0, 640, 480)
    c.fillStyle = COLORS.BLUE
    c.fill()

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        const addX = 90 * col
        const addY = 80 * row

        c.beginPath()
        c.arc(50 + addX, 40 + addY, 36, 0, Math.PI * 2, false)
        c.fillStyle = COLORS.GREY
        c.fill()
      }
    }
  }
}

class Checker {
  constructor(x, y, radius, color, alpha = 1.0) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.alpha = alpha
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.globalAlpha = this.alpha
    c.fill()
    c.globalAlpha = 1.0
  }
}

const board = new Board(0, 0)
board.draw()

function changeCurrPlayer() {
  player1Turn = !player1Turn
  status.innerHTML = player1Turn
    ? `<span style="color:red;">Red's</span> Turn`
    : `<span style="color:yellow;">Yellow's</span> Turn`
}

function currPlayerColor() {
  return player1Turn ? 'red' : 'yellow'
}

/* Puts the chekers in to the specified column and returns true.
 * If there is another checkers below, it will be placed on top.
 * If there is no space left to fill, it will return false.
 */
function insertChecker(col) {
  if (isNaN(col) || col < 0 || col > 7) return false

  let emptyRow = -1
  for (let row = 0; row < 6; row++) {
    const grid_loc = grid[row][col]
    // get the lowest empty row
    if (grid_loc === undefined) emptyRow = row
    else if (grid_loc.charAt(0) === '_') {
      /*
       * If the user was already hovering over this column, there is
       * is a _yellow or _red on the top row, denoting a translucent
       * checker. If there is a remaining row, we will move the translucent
       * checker above the row it was previously on.
       */
      if (row - 1 >= 0) {
        let color = currPlayerColor() === 'red' ? 'yellow' : 'red'
        lastHover.row -= 1
        grid[row - 1][col] = '_' + color
      }

      emptyRow = row
    }
  }

  // no rows are empty
  if (emptyRow === -1) return false

  // add checkers to that row
  grid[emptyRow][col] = currPlayerColor()
  changeCurrPlayer()
}

function drawCheckers() {
  const alpha = 0.5

  c.clearRect(0, 0, 640, 480)
  board.draw()
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      switch (grid[row][col]) {
        case undefined:
          continue
        case 'red':
          new Checker(loc_col[col], loc_row[row], 36, COLORS.RED).draw()
          break
        case 'yellow':
          new Checker(loc_col[col], loc_row[row], 36, COLORS.YELLOW).draw()
          break
        case '_red':
          new Checker(loc_col[col], loc_row[row], 36, COLORS.RED, alpha).draw()
          break
        case '_yellow':
          new Checker(
            loc_col[col],
            loc_row[row],
            36,
            COLORS.YELLOW,
            alpha
          ).draw()
          break
      }
    }
  }
}

function getColFromMouseX(X) {
  const splitWidth = canvas.width / 7 // split canvas into 7 columns

  // instead of a bunch of if/else statements, I noticed a pattern
  // which allows me to insert the checker into the correct column
  // using a loop, i.e. columns 0 to 6
  for (let col = 0; col < 7; col++) {
    if (X >= splitWidth * col && X < splitWidth * (col + 1)) {
      return col
    }
  }
  return -1 // did not find
}

/*
 * Draws a translucent checker on a specified column
 * Erases any previous translucent checkers
 */
function drawHoverChecker(col) {
  if (lastHover.col === col) return
  if (lastHover.row !== -1 && lastHover.col !== -1) {
    const lastGridLoc = grid[lastHover.row][lastHover.col]
    if (lastGridLoc !== undefined && lastGridLoc.charAt(0) !== '_') {
      lastHover.row = -1
      lastHover.col = -1
      return
    }

    grid[lastHover.row][lastHover.col] = undefined
  }

  let emptyRow = -1

  for (let row = 0; row < 6; row++) {
    const grid_loc = grid[row][col]
    if (grid_loc === undefined) emptyRow = row
  }

  if (emptyRow === -1) return // no rows are empty

  grid[emptyRow][col] = '_' + currPlayerColor()
  drawCheckers()

  lastHover.row = emptyRow
  lastHover.col = col
}

canvas.addEventListener('click', (e) => {
  const clickX = e.layerX // where user click on canvas/board
  const col = getColFromMouseX(clickX)
  if (col !== -1) {
    insertChecker(col)
    drawCheckers()
  }
})

canvas.addEventListener('mousemove', (e) => {
  const mouseOverX = e.layerX
  const col = getColFromMouseX(mouseOverX)
  if (col === -1) return
  drawHoverChecker(col)
})
