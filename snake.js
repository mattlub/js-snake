var snakeGame = function(element, options) {
    
    // get options or set defaults
    var options = options || {} ;
    options.boardSize = options.boardSize || 20;
    
    var numSquares = options.boardSize * options.boardSize;
    
    // declare variables (positions are indexes on the board)
    var snakeArray = [ ],
        freeSquares = [ ],
        snakeLength = 1,
        snakeMoving = null,
        snakeFacing = "up",
        snakeHead,
        snakeTail,
        
        // board is filled with "o" for open, "s" for snake, "f" for food
        board = new Array(numSquares).fill("o"),
        gameStarted = false,
        gameOver = false,
        nextSquare,
        intervalId;
        
    var canContinue = true,
        timeLog;
    
    // create DOM elements
    var DOM_board_container = quickCreateElement("div", "board"),
        DOM_gameMessage = quickCreateElement("div", "message"),  
        DOM_board = [ ];
    for (var i=0; i<numSquares; i++) {
        DOM_board.push(quickCreateElement("div", "square", "square" + i));
    }   
    
    // organise DOM elements: add 9 squares to board    
    for (var i=0; i<numSquares; i++) {
        DOM_board_container.appendChild(DOM_board[i]);
    }      
    
    // put snake on board
    var startPoint;
    if (options.boardSize % 2 === 0) {
        startPoint = Math.floor(numSquares/2 + options.boardSize/2);
    }
    else {
        startPoint = Math.floor(numSquares/2);
    }
    
    snakeArray.push(startPoint);
    snakeHead = startPoint;
    board[startPoint] = "s";
    DOM_board[startPoint].classList.add("snake");
        
    // arrow button event listeners
    
    document.addEventListener("keydown", function(e) {
        if (!gameStarted) {
            gameStarted = true;
            startGame();
        }
        switch(e.which) {
            case 37: // left
            if (snakeMoving != "right") {
                snakeFacing = "left";
            }
            break;

            case 38: // up
            if (snakeMoving != "down") {
                snakeFacing = "up";
            }
            break;

            case 39: // right
            if (snakeMoving != "left") {
                snakeFacing = "right";
            }
            break;

            case 40: // down
            if (snakeMoving != "up") {
                snakeFacing = "down";
            }
            break;

            default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
      
    // HELPER FUNCTIONS
    
    // function to quick create a DOM element with certain type, class, id
    function quickCreateElement(type, cls, id) {
        var ret = document.createElement(type);
        if (cls) { ret.classList.add(cls); }
        if (id) { ret.id = id; }
        return ret
    }
    
    // function to check if an array contains an element
    function contains(arr, el) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == el) { return true }
        }
        return false
    };
    

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
            if (snakeHead % options.boardSize === 0) {
                return "out of bounds"
            }
            else {
                return snakeHead - 1;
            }
        }
        else if (snakeFacing === "right") {
            if (snakeHead % options.boardSize === options.boardSize - 1) {
                return "out of bounds"
            }
            else {
                return snakeHead + 1;
            }
        }
        else if (snakeFacing === "up") {
            if (snakeHead < options.boardSize) {
                return "out of bounds"
            }
            else {
                return snakeHead - options.boardSize;
            }
        }
        else if (snakeFacing === "down") {
            if (snakeHead >= options.boardSize * (options.boardSize - 1)) {
                return "out of bounds"
            }
            else {
                return snakeHead + options.boardSize;
            }
        }
    }
    
    function moveSnake() {
        if (nextSquare === "out of bounds") {
            window.clearInterval(intervalId);
            gameOver = true;
            console.log("died out of bounds");
        }
        else if (board[nextSquare] === "o") {
            // move
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
            // eat
            // update board and snake variable
            snakeArray.push(nextSquare);
            board[nextSquare] = "s";
            // update DOM
            DOM_board[nextSquare].classList.add("snake");
            DOM_board[nextSquare].classList.remove("food");
            
            snakeLength += 1;
            generateFood();
            console.log("ate food");
        }
        else if (board[nextSquare] === "s") {
            // die
            window.clearInterval(intervalId);
            gameOver = true;
            console.log("died hitting itself");
            
        }
        updateGameMessage();
    }
     
    function generateFood() {
        // TODO: change becuase problematic when snake gets biiiig
        var random = Math.floor(Math.random() * numSquares);
        while (board[random] != "o") {
            random = Math.floor(Math.random() * numSquares);
        }
        board[random] = "f";
        DOM_board[random].classList.add("food");
    }
    
    function updateGameMessage() {
        var message = "";
        if (gameOver) {
            message += "Game Over! ";
        }
        message += "Score: " + snakeLength;
        DOM_gameMessage.innerHTML = message;
    }
    
    function startGame () {
        generateFood();
        intervalId = window.setInterval(continueGame, 80);
    }
    
    function continueGame() {
        timeLog = Date.now();
        nextSquare = getNextSquare();
        moveSnake();
    }
    
    // START GAME
    resetDOM();
    loadInitialDOM();
    updateGameMessage();
    // await key press

};




