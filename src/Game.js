import { config_4x4, config_5x5, config_6x6, config_5x5_2 } from "./Configs";

const configs = [ config_5x5, config_4x4, config_6x6, config_5x5_2 ]

export class MoveType {
    constructor(dr, dc) {
        this.deltaRow = dr;
        this.deltaColumn = dc;
    }
}

export const Up = new MoveType(-1, 0);
export const Down = new MoveType(1, 0);
export const Left = new MoveType(0, -1);
export const Right = new MoveType(0, 1);

export class Square {
    constructor(row, column) {
        this.row = row
        this.column = column
    }
}

export class Cat {
    constructor(row, column) {
        this.width = 100;
        this.height = 100;
        this.row = row - 1;
        this.column = column - 1;
    }

    move(direction) {
        this.row += direction.deltaRow;
        this.column += direction.deltaColumn;
    }
}

export class Board {
    constructor (size) {
        this.size = size

        this.grid = Array.from(Array(size), () => new Array(size));

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                this.grid[r][c] = new Square(r,c)
                this.grid[r][c].color = 'lightgray'
            }
        }
    }
}

export function letterToNumber(s) {
    if (s === "A") { return "1"; }
    if (s === "B") { return "2"; }
    if (s === "C") { return "3"; }
    if (s === "D") { return "4"; }
    if (s === "E") { return "5"; }
    if (s === "F") { return "6"; }
    if (s === "G") { return "7"; }
    if (s === "H") { return "8"; }
    if (s === "I") { return "9"; }
    if (s === "J") { return "10"; }
    if (s === "K") { return "11"; }
    if (s === "L") { return "12"; }
}

export default class Model {
    constructor(which) {
        this.config = configs[which]
        
        this.size = Number(this.config.numColumns)
        this.board = new Board(this.size)
        this.nRow = Number(this.config.catRow)
        this.nColumn = Number(letterToNumber(this.config.catColumn))
        this.ns = new Cat(this.nRow, this.nColumn);

        for (let info in this.config.initial) {
            this.board.grid[this.config.initial[info].row - 1][letterToNumber(this.config.initial[info].column) - 1] = new Square((this.config.initial[info].row - 1),(letterToNumber(this.config.initial[info].column) - 1));
            this.board.grid[this.config.initial[info].row - 1][letterToNumber(this.config.initial[info].column) - 1].color = this.config.initial[info].color;
        }
    }

    numMoves = 0;

    pushSquares(direction) {
        var pushList = [];
        this.direction = direction;
        this.s = this.size;
        if(direction === Up) {
            this.leftSide = this.ns.column;
            for(let r = this.ns.row; r <= this.ns.row; r--) {
                if(this.board.grid[((r + this.s) % this.s)][this.leftSide].color === 'lightgray') {
                    break;
                } else {
                    pushList.push(new Square(((r + this.s) % this.s), this.leftSide));
                }
            }
            this.rightSide = (this.ns.column+1);
            for(let r = this.ns.row; r <= this.ns.row; r--) {
                if(this.board.grid[((r + this.s) % this.s)][this.rightSide].color === 'lightgray') {
                    break;
                } else {
                    pushList.push(new Square(((r + this.s) % this.s), this.rightSide));
                }
            }
            for(let p = (pushList.length - 1); p >= 0; p--) {
                this.board.grid[(((pushList[p].row - 1) + this.s) % this.s)][pushList[p].column].color = this.board.grid[pushList[p].row][pushList[p].column].color;
                this.board.grid[pushList[p].row][pushList[p].column].color = 'lightgray';
            }
        }

        if(direction === Down) {
            this.leftSide = this.ns.column;
            for(let r = this.ns.row; r >= this.ns.row; r++) {
                if(this.board.grid[(((r+1) + this.s) % this.s)][this.leftSide].color === 'lightgray') {
                    break;
                } else {
                    pushList.push(new Square((((r+1) + this.s) % this.s), this.leftSide));
                }
            }
            this.rightSide = (this.ns.column+1);
            for(let r = this.ns.row; r >= this.ns.row; r++) {
                if(this.board.grid[(((r+1) + this.s) % this.s)][this.rightSide].color === 'lightgray') {
                    break;
                } else {
                    pushList.push(new Square((((r+1) + this.s) % this.s), this.rightSide));
                }
            }
            for(let p = (pushList.length - 1); p >= 0; p--) {
                this.board.grid[(((pushList[p].row + 1) + this.s) % this.s)][pushList[p].column].color = this.board.grid[pushList[p].row][pushList[p].column].color;
                this.board.grid[pushList[p].row][pushList[p].column].color = 'lightgray';
            }
        }

        if(direction === Left) {
            this.topSide = (this.ns.row+1);
            for(let c = this.ns.column; c <= this.ns.column; c--) {
                if(this.board.grid[this.topSide][((c + this.s) % this.s)].color === 'lightgray') {
                    break;
                } else {
                    pushList.push(new Square(this.topSide, ((c + this.s) % this.s)));
                }
            }
            this.bottomSide = this.ns.row;
            for(let c = this.ns.column; c <= this.ns.column; c--) {
                if(this.board.grid[this.bottomSide][((c + this.s) % this.s)].color === 'lightgray') {
                    break;
                } else {
                    pushList.push(new Square(this.bottomSide, ((c + this.s) % this.s)));
                }
            }
            for(let p = (pushList.length - 1); p >= 0; p--) {
                this.board.grid[pushList[p].row][(((pushList[p].column - 1) + this.s) % this.s)].color = this.board.grid[pushList[p].row][pushList[p].column].color;
                this.board.grid[pushList[p].row][pushList[p].column].color = 'lightgray';
            }
        }

        if(direction === Right) {
            this.topSide = (this.ns.row+1);
            for(let c = this.ns.column; c >= this.ns.column; c++) {
                if(this.board.grid[this.topSide][(((c+1) + this.s) % this.s)].color === 'lightgray') {
                    break;
                } else {
                    pushList.push(new Square(this.topSide, (((c+1) + this.s) % this.s)));
                }
            }
            this.bottomSide = this.ns.row;
            for(let c = this.ns.column; c >= this.ns.column; c++) {
                if(this.board.grid[this.bottomSide][(((c+1) + this.s) % this.s)].color === 'lightgray') {
                    break;
                } else {
                    pushList.push(new Square(this.bottomSide, (((c+1) + this.s) % this.s)));
                }
            }
            for(let p = (pushList.length - 1); p >= 0; p--) {
                this.board.grid[pushList[p].row][(((pushList[p].column + 1) + this.s) % this.s)].color = this.board.grid[pushList[p].row][pushList[p].column].color;
                this.board.grid[pushList[p].row][pushList[p].column].color = 'lightgray';
            }
        }
        return Number(pushList.length);
    }

    ableToRemove = 1;  //if 1, there are no squares that are able to be removed; if 2, there are squares that are able to be removed

    canRemove() {  //checks to see if there are squares that can be removed
        for (let r = 0; r < this.board.size - 1; r++) {
            for (let c = 0; c < this.board.size - 1; c++) {
                if(this.board.grid[r][c].color !== 'lightgray') {
                    if(r < this.board.size && c < this.board.size) {
                        if(this.board.grid[r+1][c].color === this.board.grid[r][c].color && this.board.grid[r][c+1].color === this.board.grid[r][c].color && this.board.grid[r+1][c+1].color === this.board.grid[r][c].color) {
                            this.ableToRemove = 2;
                            return;
                        }
                    }
                }
            }
        }
        this.ableToRemove = 1;
        return;
    }

    victory = 0;  //becomes 1 when victory screen should be shown and when arrow buttons and remove button should be disabled

    removeSquares() {  //if squares can be removed, this removes them
        for (let r = 0; r < this.board.size - 1; r++) {
            for (let c = 0; c < this.board.size - 1; c++) {
                if(this.board.grid[r][c].color !== 'lightgray') {
                    if(this.board.grid[r+1][c].color === this.board.grid[r][c].color && this.board.grid[r][c+1].color === this.board.grid[r][c].color && this.board.grid[r+1][c+1].color === this.board.grid[r][c].color) {
                        this.board.grid[r][c].color = 'lightgray';
                        this.board.grid[r+1][c].color = 'lightgray';
                        this.board.grid[r][c+1].color = 'lightgray';
                        this.board.grid[r+1][c+1].color = 'lightgray';
                        this.numMoves += 1;
                        this.canRemove();
                        if(this.ableToRemove === 1) {
                            if(this.isWon() === true) {
                                this.victory = 1;
                            }
                        }
                        return;
                    }
                }
            }
        }
        this.ableToRemove = 1;
        return;
    }

    isWon() {
        let squareCounter = 0;
        for (let r = 0; r < this.board.size; r++) {
            for (let c = 0; c < this.board.size; c++) {
                if(this.board.grid[r][c].color === 'lightgray') {
                    squareCounter++;
                }
            }
        }
        if(squareCounter === (this.board.size * this.board.size)) {
            return true;
        } else {
            return false;
        }
    }
}
