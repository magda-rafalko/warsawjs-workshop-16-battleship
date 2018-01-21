'use strict';

// ## Views ##

class ViewComponent {
    constructor () {
        if (new.target === ViewComponent) {
            throw new Error('Abstract class');
        }
    }

    getElement() {
        return this._element;
    }
}

class GameCell extends ViewComponent{
    constructor(handleCellClick, row, column) {
        super();
        this._state = 'unknown';
        this._element = document.createElement('td');
        this._element.addEventListener('click', function() {
            handleCellClick(row, column);
        });
    }
    setState(state) {
       if (state !== 'unknown' && state !== 'miss' && state !== 'hit') {
           throw new Error('Invalid state')
       }
       this._state = state;
       this._element.className = 'cell_' + state;
    }
}

class GameBoard extends ViewComponent {
    constructor(handleCellClick) {
        super();
        this._element = document.createElement('table');
        this._cells = {};

        for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
            const row = document.createElement('tr');

            for (let columnIndex = 0; columnIndex < 10; columnIndex++) {
                const cell = new GameCell(handleCellClick, rowIndex, columnIndex);
                row.appendChild(cell.getElement());
                const coordinatesText = rowIndex + 'x' +columnIndex;
                this._cells[coordinatesText] = cell;
            }
            this._element.appendChild(row);
        }
    }
    setStateAt(row, column, state) {
        const coordinatesText = row + 'x' + column;
        this._cells[coordinatesText].setState(state);
    }
}
class ScoreCounter extends ViewComponent {
    constructor() {
        super();
        this._element = document.createElement('div');
        const scoreText = document.createElement('p');
        scoreText.textContent = 'Your score:';
        this.yourScore = document.createElement('p');
        this.yourScore.textContent = '0';
        this._element.appendChild(scoreText);
        this._element.appendChild(this.yourScore);
    }
    setScore(score) {
        this.yourScore.textContent = score.toString();
    }
}

class GameController {
    constructor(boardModel) {
        this._boardModel = boardModel;
    }
    handleCellClick(row, column) {
        this._boardModel.fireAt(row, column);
    }
}

// ## Model ##

class GameModel {
    constructor() {
        this._cells = {};
        this._observers = [];
        this._score = 0;
        for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
            for (let columnIndex = 0; columnIndex < 10; columnIndex++) {
                const coordinatesText = rowIndex + 'x' +columnIndex;
                const hasShip = (Math.random() >= 0.8);
                this._cells[coordinatesText] = {
                hasShip,
                fireAt: false
                    }
                }
            }
    }
    fireAt(row, column) {
        const coordinatesText = row + 'x' + column;
        const targetCell = this._cells[coordinatesText];

        if (targetCell.fireAt) {
            return;
        }
        targetCell.fireAt = true;
        const result = targetCell.hasShip ? 'hit' : 'miss';
        if (result === 'hit') {
            this._score++;
            this._observers.forEach(observer => observer('scored', {score: this._score}))
        }

        this._observers.forEach(function(observer) {
            observer('firedAt', {result, row, column});
        })
    }
    addObserver(observerFunction) {
    this._observers.push(observerFunction);
    }
}

// ## App init ##

const gameElement = document.getElementById('game');
let board;
let controller;
const counter = new ScoreCounter();


function handleCellClick(row, column) {
    controller.handleCellClick(row, column);
}

board = new GameBoard(handleCellClick);
const model = new GameModel();
controller = new GameController(model);

model.addObserver( function(eventType, params) {
    switch (eventType) {
        case 'firedAt':
            board.setStateAt(params.row, params.column, params.result);
            break;
        case 'scored':
            counter.setScore(params.score);
            break;
    }
});

gameElement.appendChild(board.getElement());
gameElement.appendChild(counter.getElement());