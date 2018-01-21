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
        for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
            for (let columnIndex = 0; columnIndex < 10; columnIndex++) {
                const coordinatesText = rowIndex + 'x' +columnIndex;
                const hasShip = (Math.random() >= 0.8)
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
    }
});

gameElement.appendChild(board.getElement());
