const games = {};
const boardSize = 8;
const emptyDisc = 0;

const directions = [
    [1, 0],      // Right
    [1, 1],      // Down right
    [1, -1],     // Up right
    [-1, 0],     // Left
    [-1, 1],     // Down left
    [-1, -1],    // Up left
    [0, 1],      // Down
    [0, -1]      // Up
];

const newGame = function (player1) {
    let game = {
        id: 'asca',
        player1: player1,
        player2: null,
        turn: 1,
        board: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, -1, 0, 0, 0],
            [0, 0, 0, -1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]
    };

    games[game.id] = game;
    return state(game.id);
};

const state = function (id) {
    const game = games[id];
    if (!game) {
        return { board: null, err: 'Game not found' };
    }
    return { state: game, err: null };
};

const colorHasMove = function(id, color) {
    const game = games[id];
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            let discsToFlip = checkDiscsToFlip(game, { x: x, y: y, color: color });
            if (discsToFlip.length > 0) {
                return true;
            }
        }
    }
    return false;
};

const makeMove = function (id, move) {
    const game = games[id];
    if (!game) {
        return { discsToFlip: null, err: 'Game not found' };
    }

    const { x, y, color } = move;
    const discsToFlip = checkDiscsToFlip(game, move) || [];

    if (discsToFlip.length > 0) {
        discsToFlip.push({ x, y });
    }

    discsToFlip.forEach(({ x, y }) => {
        game.board[y][x] = color;
    });

    return { discsToFlip: discsToFlip, err: null };
};

const checkDiscsToFlip = function (game, move) {
    let discsToFlip = [];
    directions.forEach(direction => {
        let discstoFlipInDirection = [];
        let board = game.board;
        let dX = direction[0];
        let dY = direction[1];
        let xPos = move.x;
        let yPos = move.y;
        for (let i = 0; i < board.length; i++) {
            xPos += dX;
            yPos += dY;
            if (!isPositionWithinBoundaries(xPos, yPos) || board[yPos][xPos] === emptyDisc) {
                discstoFlipInDirection = [];
                break;
            }
            if (board[yPos][xPos] === move.color) {
                break;
            }
            discstoFlipInDirection.push({ x: xPos, y: yPos });
        }
        discsToFlip = [...discsToFlip, ...discstoFlipInDirection];
    });
    return discsToFlip;
};

const isPositionWithinBoundaries = function(x, y) {
    return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
};

module.exports.newGame = newGame;
module.exports.makeMove = makeMove;
module.exports.state = state;
