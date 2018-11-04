const games = require('./game');

test('can create a new game', () => {
    let { state, err } = games.newGame({ name: 'Arne' });
    expect(err).toBeNull();
    expect(state.player1.name).toBe('Arne');
});

test('can make opening move', () => {
    let { state, err } = games.newGame({ name: 'Arne' });
    let moveResult = games.makeMove(state.id, { x: 4, y: 5, color: -1 });

    expect(err).toBeNull();
    expect(moveResult.err).toBeNull();
    expect(moveResult.discsToFlip).toMatchObject([{ x: 4, y: 4 }, { x: 4, y: 5 }]);
    expect(state.board).toMatchObject(fromPrettyBoard(
        [
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 2
            [' ', ' ', ' ', 'O', 'X', ' ', ' ', ' '], // 3
            [' ', ' ', ' ', 'X', 'X', ' ', ' ', ' '], // 4
            [' ', ' ', ' ', ' ', 'X', ' ', ' ', ' '], // 5
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']  // 7
        ]//   0    1    2    3    4    5    6    7
    ));
});

test('cannot make simple invalid move', () => {
    let { state, err } = games.newGame({ name: 'Arne' });
    let moveResult = games.makeMove(state.id, { x: 4, y: 6, color: -1 });
    ({ state, err } = games.state(state.id));

    expect(err).toBeNull();
    expect(moveResult.discsToFlip).toMatchObject([]);
    expect(state.board).toMatchObject(fromPrettyBoard(
        [
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 2
            [' ', ' ', ' ', 'O', 'X', ' ', ' ', ' '], // 3
            [' ', ' ', ' ', 'X', 'O', ' ', ' ', ' '], // 4
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']  // 7
        ])//  0    1    2    3    4    5    6    7
    );
});

test('multi moves', () => {
    let { state, err } = games.newGame({ name: 'Arne' });
    games.makeMove(state.id, { x: 4, y: 5, color: -1 });
    let moveResult = games.makeMove(state.id, { x: 5, y: 3, color: 1 });
    ({ state, err } = games.state(state.id));

    expect(err).toBeNull();
    expect(moveResult.discsToFlip).toMatchObject([{ x: 4, y: 3 }, { x: 5, y: 3 }]);
    expect(state.board).toMatchObject(fromPrettyBoard(
        [
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 2
            [' ', ' ', ' ', 'O', 'O', 'O', ' ', ' '], // 3
            [' ', ' ', ' ', 'X', 'X', ' ', ' ', ' '], // 4
            [' ', ' ', ' ', ' ', 'X', ' ', ' ', ' '], // 5
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']  // 7
        ])//  0    1    2    3    4    5    6    7
    );

    moveResult = games.makeMove(state.id, { x: 4, y: 2, color: -1 });
    ({ state, err } = games.state(state.id));

    expect(err).toBeNull();
    expect(moveResult.discsToFlip).toMatchObject([{ x: 4, y: 3 }, { x: 4, y: 2 }]);
    expect(state.board).toMatchObject(fromPrettyBoard(
        [
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
            [' ', ' ', ' ', ' ', 'X', ' ', ' ', ' '], // 2
            [' ', ' ', ' ', 'O', 'X', 'O', ' ', ' '], // 3
            [' ', ' ', ' ', 'X', 'X', ' ', ' ', ' '], // 4
            [' ', ' ', ' ', ' ', 'X', ' ', ' ', ' '], // 5
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']  // 7
        ])//  0    1    2    3    4    5    6    7
    );
});

const toPrettyBoard = function (arr) {
    let prettyBoard = [];
    for (let i = 0; i < arr.length; i++) {
        prettyBoard[i] = [];
        for (let j = 0; j < arr.length; j++) {
            switch (arr[i][j]) {
                case 0:
                    prettyBoard[i][j] = ' ';
                    break;
                case 1:
                    prettyBoard[i][j] = 'O';
                    break;
                case -1:
                    prettyBoard[i][j] = 'X';
                    break;
            }
        }
    }
    return prettyBoard;
};

const fromPrettyBoard = function (arr) {
    let unprettyBoard = [];
    for (let i = 0; i < arr.length; i++) {
        unprettyBoard[i] = [];
        for (let j = 0; j < arr.length; j++) {
            switch (arr[i][j]) {
                case ' ':
                    unprettyBoard[i][j] = 0;
                    break;
                case 'O':
                    unprettyBoard[i][j] = 1;
                    break;
                case 'X':
                    unprettyBoard[i][j] = -1;
                    break;
            }
        }
    }
    return unprettyBoard;
};