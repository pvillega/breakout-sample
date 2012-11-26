// Select canvas
var canvas = $('#canvas')[0];

// State vars

// colors
var ballr = 10;
var rowcolors = ["#FF1C0A", "#FFFD0A", "#00A308", "#0008DB", "#EB0093"];
var paddlecolor = "#FFFFFF";
var ballcolor = "#FFFFFF";
var backcolor = "#000000";

// initial ball position
var x = 150;
var y = 150;
// acceleration
var dx = 1.5;
var dy = 2.5;

// paddle
var paddlex;
var paddleh = 10;
var paddlew = 75;
var paddleMove = 5;

// Bricks at top
var bricks;
var NROWS = 5;
var NCOLS = 5;
var BRICKWIDTH;
var BRICKHEIGHT = 15;
var PADDING = 1;
var rowheight;
var colwidth;

// Keyboard events
var rightDown = false;
var leftDown = false;

// canvas size and context
var WIDTH;
var HEIGHT;
var canvasMinX = 0;
var canvasMaxX = 0;
var ctx;

// drawing cycle
var intervalId = 0;

function init() {
  ctx = canvas.getContext("2d");
  WIDTH = $("#canvas").width();
  HEIGHT = $("#canvas").height();
  canvasMinX = canvas.offsetLeft;
  canvasMaxX = canvasMinX + WIDTH;

  //starting paddle position
  paddlex = WIDTH / 2;

  //set rightDown or leftDown if the right or left keys are down
  $(document).keydown(onKeyDown);
  //and unset them when the right or left key is released
  $(document).keyup(onKeyUp);

  //accept control by mouse
  $(document).mousemove(onMouseMove);

  //generate bricks at top
  BRICKWIDTH = (WIDTH/NCOLS) - 1;
  rowheight = BRICKHEIGHT + PADDING;
  colwidth = BRICKWIDTH + PADDING;
  initbricks();

  //launch cycle
  intervalId = setInterval(draw, 10); //repeat draw every 10ms
  return intervalId;
}

// Support

function clear() {
  ctx.fillStyle = backcolor;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  rect(0,0,WIDTH,HEIGHT);
}

function circle(x,y,r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
}

function rect(x,y,w,h) {
  ctx.beginPath();
  ctx.rect(x,y,w,h);
  ctx.closePath();
  ctx.fill();
}

function initbricks() {
    bricks = new Array(NROWS);
    for (i=0; i < NROWS; i++) {
        bricks[i] = new Array(NCOLS);
        for (j=0; j < NCOLS; j++) {
            bricks[i][j] = 1;
        }
    }
}

function drawbricks() {
  for (i=0; i < NROWS; i++) {

    ctx.fillStyle = rowcolors[i];

    for (j=0; j < NCOLS; j++) {
      if (bricks[i][j] == 1) {
        rect((j * (BRICKWIDTH + PADDING)) + PADDING,
             (i * (BRICKHEIGHT + PADDING)) + PADDING,
             BRICKWIDTH, BRICKHEIGHT);
      }
    }

  }
}

function isWin() {
  var win = true;
  for (i=0; i < NROWS && win; i++) {
    for (j=0; j < NCOLS && win; j++) {
      if (bricks[i][j] == 1) {
        win = false;
      }
    }
  }
  return win;
}

function showText(s) {
  ctx.font = "20pt Arial";
  ctx.fillStyle = "Red";
  var len = ctx.measureText(s).width;
  ctx.fillText(s, (WIDTH - len)/2, HEIGHT/2);
}

function onKeyDown(evt) {
  if (evt.keyCode == 39) rightDown = true;
  else if (evt.keyCode == 37) leftDown = true;
}

function onKeyUp(evt) {
  if (evt.keyCode == 39) rightDown = false;
  else if (evt.keyCode == 37) leftDown = false;
}

function onMouseMove(evt) {
  if (evt.pageX > canvasMinX && evt.pageX < canvasMaxX) {
    paddlex = Math.max(evt.pageX - canvasMinX - (paddlew/2), 0);
    paddlex = Math.min(WIDTH - paddlew, paddlex);
  }
}

// Main game cycle
function draw() {
  clear();

  //draw ball on current position
  ctx.fillStyle = ballcolor;
  circle(x, y, 10);

  //move and draw paddle
  if (rightDown) paddlex += paddleMove;
  if (leftDown) paddlex -= paddleMove;

  if(paddlex + paddlew > WIDTH) paddlex = WIDTH - paddlew;
  if(paddlex < 0) paddlex = 0;

  ctx.fillStyle = paddlecolor;
  rect(paddlex, HEIGHT-paddleh, paddlew, paddleh);

  //draw bricks
  drawbricks();

  //no bricks left, then win
  if(isWin()) {
    clearInterval(intervalId);
    showText("VICTORY!");
  }

  // bounce on bricks
  row = Math.floor(y/rowheight);
  col = Math.floor(x/colwidth);
  if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] == 1) {
      //bounce and break bricks
      dy = -dy;
      bricks[row][col] = 0;
  }

  //bounce on limits
  if (x + dx + ballr > WIDTH || x + dx - ballr < 0) dx = -dx;

  if (y + dy - ballr < 0) {
    dy = -dy;
  } else if (y + dy + ballr > HEIGHT - paddleh) {
    //if we hit bottom, see if we hit paddle or floor
    if (x > paddlex && x < paddlex + paddlew){
      //move the ball differently based on where it hit the paddle
      dx = 8 * ((x-(paddlex+paddlew/2))/paddlew);
      dy = -dy;
    } else if (y + dy + ballr > HEIGHT) {
      //game over, stop the animation
      clearInterval(intervalId);
      showText("DEFEAT");
    }
  }

  //move ball
  x += dx;
  y += dy;
}

// check if supported
if (canvas.getContext) {
    init();
} else {
    $('#noCanvas').show();
}

