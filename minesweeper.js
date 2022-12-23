const cols = 20;
const rows = 20;
let board = [];

const mines = 80;
let remainingFlags = mines;

let tilesDiscovered = 0;
let gameOver = false;

window.onload = function() {
    setupGame();
    document.addEventListener("contextmenu", (event) => event.preventDefault());
}

function create2DArray(cols, rows) {
    var arr = new Array(cols);
    for(var c = 0; c < cols; c++) {
        arr[c] = new Array(rows);
        for(var r = 0; r < rows; r++) { 
            arr[c][r] = new Tile(c, r);
        }
    }
    return arr; 
}

function setupGame() {
    board = create2DArray(cols, rows);
    for(var c = 0; c < cols; c++) {
        for(var r = 0; r < rows; r++) {
            let tile = document.createElement("div");
            tile.id = c.toString() + "-" + r.toString();
            tile.addEventListener("click", clickTile);
            tile.addEventListener("contextmenu", rightClick);
            document.getElementById("board").append(tile);
        }
    }
    placeBombs();
    checkNeighbors();
}

function placeBombs() {
    document.getElementById("flags-count").innerHTML = remainingFlags;
    let minesLeft = mines;
    while (minesLeft > 0) {
        let x = Math.floor(Math.random() * cols);
        let y = Math.floor(Math.random() * rows);
        if (!board[x][y].bomb) {
            board[x][y].bomb = true;
            minesLeft -= 1;
        }
    }
}

class Tile{
    constructor(col, row) {
        this.col = col;
        this.row = row;
        this.bomb = false;
        this.revealed = false;
        this.flagged = false;
        this.neighborBombs = 0;
    }
}

function checkNeighbors() {
    for(var i = 0; i < cols; i++) {
        for(var j = 0; j < rows; j++) {
                board[i][j].neighborBombs += calculateNeighbors(board[i][j]);
            }
        }
    }

function calculateNeighbors(tile) {
    let c = tile.col;
    let r = tile.row;

    let neighbors = 0;

    neighbors += checkNeighborTiles(c-1,r-1);     // top left
    neighbors += checkNeighborTiles(c,r-1);       // top 
    neighbors += checkNeighborTiles(c+1,r-1);     // top right

    neighbors += checkNeighborTiles(c-1,r);       // left
    neighbors += checkNeighborTiles(c+1,r);       // right

    neighbors += checkNeighborTiles(c-1,r+1);     // bottom left
    neighbors += checkNeighborTiles(c,r+1);       // bottom
    neighbors += checkNeighborTiles(c+1,r+1);     // bottom right

    return neighbors;
}

function checkNeighborTiles(colPos, rowPos) {
    if (colPos < 0 || colPos >= cols || rowPos < 0 || rowPos >= rows) {
        return 0;
    }
    if (board[colPos][rowPos].bomb == true) {
        return 1;
    }
    return 0;
}

function clickTile() {
    let coords = this.id.split("-"); 
    let c = parseInt(coords[0]);
    let r = parseInt(coords[1]);

    if (board[c][r].revealed == true || board[c][r].flagged == true || gameOver == true) {
        return;
    }
    revealTile(this, board[c][r]);
}

function revealTile(element, tile) {
    if(tile.bomb == true) {
        element.innerHTML = "💣"
        endGame("LIXO RUIM SKILL ISSUE");
    }
    else {
        element.innerHTML = tile.neighborBombs;
        element.classList.add('x' + tile.neighborBombs);
    }

    tile.revealed = true;
    element.classList.add("clicked");
    tilesDiscovered += 1;
    
    if(tile.neighborBombs == 0 && !tile.bomb) {
        element.innerHTML = "";
        revealNeighbors(tile);
    }
    if(tilesDiscovered >= cols * rows - mines) {
        endGame("PISA MENOS");
    }  
}

function revealNeighbors(tile) {
    let c = tile.col;
    let r = tile.row;

    revealIfValid(c-1,r-1);     // top left
    revealIfValid(c,r-1);       // top 
    revealIfValid(c+1,r-1);     // top right

    revealIfValid(c-1,r);       // left
    revealIfValid(c+1,r);       // right

    revealIfValid(c-1,r+1);     // bottom left
    revealIfValid(c,r+1);       // bottom
    revealIfValid(c+1,r+1);     // bottom right
}

function revealIfValid(colPos, rowPos) {
    if (colPos < 0 || colPos >= cols || rowPos < 0 || rowPos >= rows || board[colPos][rowPos].revealed == true || board[colPos][rowPos].flagged == true) {
        return;
    }
    let element = document.getElementById(colPos.toString() + "-" + rowPos.toString());
    revealTile(element, board[colPos][rowPos]);
}

function rightClick() {
    let coords = this.id.split("-"); 
    let c = parseInt(coords[0]);
    let r = parseInt(coords[1]);

    if (board[c][r].revealed == true || gameOver == true) {
        return;
    }
    if (board[c][r].flagged == true) {
        setFlag(this, board[c][r], false);
    }
    else if (remainingFlags > 0) {
        setFlag(this, board[c][r], true);
    } 
}

function setFlag(element, tile, state) {
    tile.flagged = state;

    if(tile.flagged == true) {
        element.innerHTML = "🚩";
        remainingFlags -= 1;
        document.getElementById("flags-count").innerHTML = remainingFlags;
    }
    else {
        element.innerHTML = "";
        remainingFlags += 1;
        document.getElementById("flags-count").innerHTML = remainingFlags;
    }
}

function endGame(msg) {
    gameOver = true;
    document.getElementById("game-result").innerHTML = msg;
}