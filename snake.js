var snakeGame = function(element, options) {

    // get options or set defaults
    var options = options || {},
        boardSize = options.boardSize || 20,
        gameMode = options.gameMode || "normal",
        gameSpeed = options.gameSpeed || 70;

    var numSquares = boardSize * boardSize;

    // board will be filled with "o" for open, "s" for snake, "f" for food
    var board = new Array(numSquares).fill("o"),
        gameStarted = false,
        gameOver = false,
        intervalId;

    // snake variables
    // snakeArray is array of indexes of positions on the board which the snake occupies
    var snakeArray = [ ],
        snakeLength = 1,
        // snakeMoving is the direction the snake is moving in
        snakeMoving = null,
        // snakeFacing is the direction the snake will move in next
        snakeFacing = "up",
        snakeHead,
        snakeTail,
        nextSquare;


    // create DOM elements
    var DOM_board_container = quickCreateElement("div", "board"),
        DOM_gameMessage = quickCreateElement("div", "message"),
        DOM_board = [ ];

    // css- could do more of this
    DOM_board_container.style.width = "" + (boardSize * 20) + "px";
    DOM_board_container.style.height = "" + (boardSize * 20) + "px";

    for (var i=0; i<numSquares; i++) {
        DOM_board.push(quickCreateElement("div", "square", "square" + i));
    }

    // organise DOM elements: add squares to board (could be combined with above loop)
    for (var i=0; i<numSquares; i++) {
        DOM_board_container.appendChild(DOM_board[i]);
    }

    // put snake on board
    var startPoint;
    if (boardSize % 2 === 0) {
        startPoint = Math.floor(numSquares/2 + boardSize/2);
    }
    else {
        startPoint = Math.floor(numSquares/2);
    }

    snakeArray.push(startPoint);
    snakeHead = startPoint;
    board[startPoint] = "s";
    DOM_board[startPoint].classList.add("snake");

    // add arrow button event listeners
    document.addEventListener("keydown", function(e) {
        switch(e.code) {
            case "ArrowLeft": // left
                if (snakeMoving != "right") {
                    snakeFacing = "left";
                }
                break;
            case "ArrowUp": // up
                if (snakeMoving != "down") {
                    snakeFacing = "up";
                }
                break;
            case "ArrowRight": // right
                if (snakeMoving != "left") {
                    snakeFacing = "right";
                }
                break;
            case "ArrowDown": // down
                if (snakeMoving != "up") {
                    snakeFacing = "down";
                }
                break;
            // exit this handler for other keys
            default: return;
        }
        // prevent the default action e.g. scrolling
        e.preventDefault();
        if (!gameStarted) {
            startGame();
            if (gameMode === "autopilot") {
                fireAutoKeydown();
            }
        }
    });

    // HELPER FUNCTIONS

    // function to quick create a DOM element with certain type, class, id
    function quickCreateElement(type, cls, id) {
        var ret = document.createElement(type);
        if (cls) { ret.classList.add(cls); }
        if (id) { ret.id = id; }
        return ret
    }

    // PROCESS FUNCTIONS

    function resetDOM () {
        // good way to remove all children (credit SO)
        while (element.lastChild) {
            element.removeChild(element.firstChild);
        }
    };

    function loadInitialDOM() {
        element.appendChild(DOM_board_container);
        element.appendChild(DOM_gameMessage);
    };

    function getNextSquare() {
        snakeHead = snakeArray[snakeLength - 1];
        snakeMoving = snakeFacing;
        if (snakeFacing === "left") {
            if (snakeHead % boardSize === 0) {
                return "out of bounds"
            }
            else {
                return snakeHead - 1;
            }
        }
        else if (snakeFacing === "right") {
            if (snakeHead % boardSize === boardSize - 1) {
                return "out of bounds"
            }
            else {
                return snakeHead + 1;
            }
        }
        else if (snakeFacing === "up") {
            if (snakeHead < boardSize) {
                return "out of bounds"
            }
            else {
                return snakeHead - boardSize;
            }
        }
        else if (snakeFacing === "down") {
            if (snakeHead >= boardSize * (boardSize - 1)) {
                return "out of bounds"
            }
            else {
                return snakeHead + boardSize;
            }
        }
    };

    function moveSnakeToNextSquare() {
        if (nextSquare === "out of bounds") {
            // die
            window.clearInterval(intervalId);
            gameOver = true;
            // console.log("died out of bounds");
        }
        else if (board[nextSquare] === "o") {
            // move to open square
            snakeTail = snakeArray.shift();
            // update board and snake variable
            snakeArray.push(nextSquare);
            board[nextSquare] = "s";
            board[snakeTail] = "o";
            // update DOM
            DOM_board[nextSquare].classList.add("snake");
            DOM_board[snakeTail].classList.remove("snake");
        }
        else if (board[nextSquare] === "f") {
            // eat food
            // update board and snake variable
            snakeArray.push(nextSquare);
            board[nextSquare] = "s";
            // update DOM
            DOM_board[nextSquare].classList.add("snake");
            DOM_board[nextSquare].classList.remove("food");

            snakeLength += 1;
            generateFood();
            if (gameMode === "greedy" && snakeLength % 5 === 0) {
                generateFood();
            }
            // console.log("ate food");
        }
        else if (board[nextSquare] === "s") {
            // die
            window.clearInterval(intervalId);
            gameOver = true;
            // console.log("died hitting itself");
        }
        updateGameMessage();
    };

    function generateFood() {
        // TODO: change becuase potentially problematic when snake gets biiiig
        var randomIndex = Math.floor(Math.random() * numSquares);
        while (board[randomIndex] != "o") {
            randomIndex = Math.floor(Math.random() * numSquares);
        }
        board[randomIndex] = "f";
        DOM_board[randomIndex].classList.add("food");
    };

    function updateGameMessage() {
        var message = "";
        if (!gameStarted) {
            message += "Use arrow keys to move. Press any key to start."
        }
        else {
            if (gameOver) {
                message += "Game Over! ";
            }
            message += "Score: " + snakeLength;
        }
        DOM_gameMessage.innerHTML = message;
    };

    function startGame () {
        gameStarted = true;
        generateFood();
        if (gameMode === "greedy") {
           generateFood();
           generateFood();
        }
        intervalId = window.setInterval(continueGame, gameSpeed);
    };

    function continueGame() {
        // to track time (currently unused)
        // var timeLog = Date.now();
        nextSquare = getNextSquare();
        moveSnakeToNextSquare();
        if (gameMode === "autopilot") {
            fireAutoKeydown();
        }
    };

    function fireAutoKeydown () {
        // TODO: only works for even numbers right now
        snakeHead = snakeArray[snakeLength - 1];
        var requiredDirection;
        var arrowKeyCodes = {
            "left": "ArrowLeft",
            "up": "ArrowUp",
            "right": "ArrowRight",
            "down": "ArrowDown"
        };
        if (snakeHead < boardSize) {
            // top row
            requiredDirection = snakeHead % 2 === 0 ? "right" : "down";
        }
        else if (snakeHead < (boardSize * (boardSize - 2))) {
            // between top row and 2nd last row (exclusive)
            requiredDirection = snakeHead % 2 === 0 ? "up" : "down";
        }
        else if (snakeHead < (boardSize * (boardSize - 1))) {
            // 2nd last row
            requiredDirection = snakeHead % 2 === 0 ? "up" : "right";
            if (snakeHead === (boardSize * (boardSize - 1)) - 1) {
                // last position in 2nd last row
                requiredDirection = "down";
            }
        }
        else if (snakeHead === (boardSize * (boardSize - 1))) {
            // last row first position
            requiredDirection = "up";
        }
        else {
            // rest of last row
            requiredDirection = "left";
        }

        var opts = {
            code: arrowKeyCodes[requiredDirection]
        };
        var autoKeydown = new KeyboardEvent("keydown", opts);
        document.dispatchEvent(autoKeydown);
    }

    // INITIALISE GAME
    resetDOM();
    loadInitialDOM();
    updateGameMessage();
    // await key press to start game

};
