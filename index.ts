const defaults = require('defaults');

export { defaults };

export interface Point {
    x: number;
    y: number;
}


export interface Cell extends Point {
    width: number;
    height: number;
}

/**
 * A CompleteGrid is a grid where all properties have values,
 * this is rarely necessary, but can be returned by a function
 */
export interface CompleteGrid extends Cell {
    columns: number;
    rows: number;
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
    outerPadding: boolean;
    rowMajor:boolean;
}

/**
 * A Grid only must have columns and rows, the rest are optional
 */
export interface Grid extends Partial<CompleteGrid> {
    columns: number;
    rows: number;
}

export interface Position {
    column: number;
    row: number;
}

const _isFinite = (n: any): n is number =>
    typeof n === 'number' && !isNaN(n);

const val = (grid: Object, prop: string) : any =>
    (typeof grid[prop] === 'boolean' || _isFinite(grid[prop])) ? grid[prop] : gridDefaults[prop];

const isPosition = (c: any) : c is Position =>
    typeof c === 'object' && typeof c.column === 'number';

const isGrid = (g:any) : g is Grid =>
    typeof g.columns === 'number' && typeof g.rows === 'number';


/**
 * Module for generating uniform grids.
 * Given a set of parameters, generate an object for every cell within the grid.
 * Perform operations on the grid such as finding the closest cell to a point or
 * shifting all cells in any vector.
 */

// the grid `struct`
//the defaults of every grid,
//only `{ columns, rows }` is required for any operation
const gridDefaults: CompleteGrid = {
    columns        : NaN,
    rows           : NaN,
    x              : 0,
    y              : 0,
    width          : 1,
    height         : 1,
    paddingLeft    : 0,
    paddingRight   : 0,
    paddingBottom  : 0,
    paddingTop     : 0,
    rowMajor       : true, // organize an 2d Array for each row
    outerPadding   : true //left-pad the first column, right-pad the last column, top-pad first row etc
};


/**
 * fill in all parameters of the grid, including defaults
 * @param g the Grid to fill in with all defaults
 * @param result optionally provide the object, otherwise a new one is created
 */
export function grid(g:Grid, result?:object): CompleteGrid {
	return (<any>Object).assign(result||{}, gridDefaults, g);
}

const equalCells = (a: Partial<Cell>, b: Partial<Cell>):boolean =>
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

export function equals(a: Partial<Cell>, b: Partial<Cell>):boolean {
    if(!equalCells(a, b)){
        return false;
    } else if(!isGrid(a) || !isGrid(b)){
        return true;
    }

    //its a grid
    return a.columns === b.columns &&
        a.rows === b.rows &&
        a.paddingLeft === b.paddingLeft &&
        a.paddingRight === b.paddingRight &&
        a.paddingTop === b.paddingTop &&
        a.paddingBottom === b.paddingBottom &&
        a.outerPadding === b.outerPadding &&
        a.rowMajor === b.rowMajor;

}


const makeScaler = (grid: Grid, scale: number, scaledGrid: Grid)=>
    (property)=>_isFinite(grid[property]) && (scaledGrid[property] *= scale);


export function scale(grid: Grid, scaleX: number, scaleY: number, scaledGrid: Grid = null) : Grid {
    scaledGrid = (<any>Object).assign(scaledGrid || {}, grid);

    scaledGrid.width = val(grid, 'width') * scaleX;
    scaledGrid.height = val(grid, 'height') * scaleY;

    //scale all the other properties
    //but only if they have already been defined
    ['x', 'paddingLeft', 'paddingRight'].forEach(makeScaler(grid, scaleX, scaledGrid));
    ['y', 'paddingBottom', 'paddingTop'].forEach(makeScaler(grid, scaleY, scaledGrid));

    return scaledGrid;
}


//default parameters for `shiftCells` function
const shiftCellsDefaults = {
    columns : 0,
    rows    : 0,
    wrap    : false,
    sort    : true
};


/**
 * Generate the cells for a provided grid
 * @param {Grid} grid
 * @param {Cell[]} [arr] optionally provide an array to populate
 * @returns {Cell[]}
 */
export function cells( grid: Grid, arr: Cell[] = [] ): Cell[] {
    let r : number = 0,
        c : number = 0,
        i : number = 0;

    const rowMajor : boolean = val(grid, 'rowMajor');

    while( arr.length > grid.rows * grid.columns ){
        //don't want left-over cells from a previous grid
        arr.pop();
    }

    if(rowMajor){
        for(r=0; r<grid.rows; r++){
            for(c=0; c<grid.columns; c++){
                arr[i++] = cellForPosition(grid, c, r);
            }
        }
        return arr;
    }

    for(c=0; c<grid.columns; c++){
        for(r=0; r<grid.rows; r++){
            arr[i++] = cellForPosition(grid, c, r);
        }
    }

    return arr;
}

 function cellBounds(cells:Partial<Cell>[], result?:object): Cell {

    let minX:number = Number.MAX_VALUE;
    let minY:number = Number.MAX_VALUE;
    let maxX:number = Number.MIN_VALUE;
    let maxY:number = Number.MIN_VALUE;

    for(let i:number = 0; i<cells.length; i++){
        const c:Partial<Cell> = cells[i];
        const tl:Point = topLeft(c);
        const br:Point = bottomRight(c);

        minX = Math.min(minX, tl.x, br.x);
        minY = Math.min(minY, tl.y, br.y);
        maxX = Math.max(maxX, tl.x, br.x);
        maxY = Math.max(maxY, tl.y, br.y);
	}

	const r: any = (<any>result || {});

    r.x = minX;
    r.y = minY;
    r.width = maxX - minX;
	r.height = maxY - minY;

	return r as Cell;
 }

/**
 * Compute the boundaries of the cells provided
 * @param {Grid | Cell[]} grid or the cells array
 * @param {object} [bounds] optionally provide a rect object to be reused
 * @returns {Cell}
 */
export function bounds(grid: Grid | Partial<Cell>[], result?:object) : Cell {

    if(Array.isArray(grid)){
        return cellBounds(grid as Partial<Cell>[], result);
    }

    let left : number = val(grid,'x'),
        right : number = left + val(grid,'width'),
        top : number = val(grid,'y'),
        bottom : number = top + val(grid,'height');

    if(val(grid,'outerPadding')){
        left += val(grid,'paddingLeft');
        right -= val(grid,'paddingRight');
        top += val(grid, 'paddingTop');
        bottom -= val(grid,'paddingBottom');
    }

    const r:any = (<any>result || {});
    r.x = left;
    r.y = top;
    r.width = right - left;
	r.height = bottom - top;

    return r as Cell;
}


/**
 * create a Cell at the given grid index
 * @param {Grid} grid
 * @param {number} index
 * @returns {Cell}
 */
export const cellForIndex = (grid: Grid, index: number, cell?: object) : Cell =>
    cellForPosition(grid, cellPosition(grid, index), cell);

/**
 * create a Cell at the given column and row
 * @param {Grid} grid
 * @param {number | Position} c column position
 * @param {number | Cell} [r] row position
 * @param {object} [cell] optionally mutate an existing object
 * @returns {Cell}
 */
export function cellForPosition( grid: Grid, c: number | Position, r?: number | Partial<Cell>, cell?: object ) : Cell {

    if( isPosition(c) ){
        //accept { column:Number, row:Number }
        cell = (<object>r);
        r = (<Position>c).row;
        c = (<Position>c).column;
    }

    const _cell:Cell = (<Cell>defaults(cell || {}, { x: 0, y: 0, width: 0, height: 0 }));

    _cell.x = xForColumn( grid, (<number>c) );
    _cell.y = yForRow( grid, (<number>r) );
    _cell.width = cellWidth( grid );
    _cell.height = cellHeight( grid );

    return _cell;
}


export function cell( grid: Grid, i: number | Position, cell?: object): Cell {
    return isPosition(i) ?
        cellForPosition(grid, i, cell) :
        cellForIndex(grid, i, cell);
}



/**
 * Find the closest cell to the postion vector
 * @param {Grid} grid
 * @param {Point} pos the point vector
 * @returns {Cell}
 */
export const closestCell = (grid: Grid, point: Point) : Cell =>
    cellForPosition(grid, closestCellPosition(grid, point));

/**
 * closest cell `position` to `point`
 * @param {Grid} grid
 * @param {Point} point
 * @returns {Position}
 */
export function closestCellPosition(grid: Grid, point: Point) : Position {
    let column : number,
        row : number,
        minDistanceX : number = Number.MAX_VALUE,
        minDistanceY : number = Number.MAX_VALUE;

    //find minimum distances from the center of each cell
    for(let i=0; i<grid.columns; i++){
        let dist = Math.abs(point.x - (xForColumn(grid,i) + cellWidth(grid) / 2));
        if(dist < minDistanceX){
            minDistanceX = dist;
            column = i;
        }
    }
    for(let i=0; i<grid.rows; i++){
        let dist = Math.abs(point.y - (yForRow(grid,i) + cellHeight(grid) / 2));
        if(dist < minDistanceY){
            minDistanceY = dist;
            row = i;
        }
    }

    return { column, row };
}

/**
 * closest cell index to `point`
 * @param {Grid} grid
 * @param {Point} point
 * @returns {number}
 */
export const closestCellIndex = (grid: Grid, point: Point) : number =>
    cellIndex(grid, closestCellPosition(grid, point));


/**
 * Does the grid (or cell) contain this point?
 * @param {Cell | Grid} grid the grid or cell to test
 * @param {Point} pos the vector of the position
 * @returns {boolean} true if the point is inside
 */
export const contains = (cell: Partial<Cell> | Grid, point: Point) : boolean =>
    point.x >= val(cell,'x') && point.x <= val(cell,'x') + val(cell,'width') &&
    point.y >= val(cell,'y') && point.y <= val(cell,'y') + val(cell,'height');



/**
 * Get the bottom-left vertex
 * @param {Cell | Grid} cell
 * @returns {Point}
 */
export function bottomLeft(cell: Partial<Cell> | Grid) : Point {
    return {
        x: val(cell, 'x'),
        y: val(cell,'y') + val(cell,'height')
    };
}

/**
 * Get the bottom-right vertex of the grid or cell
 * @param {Cell | Grid} cell
 * @returns {Point}
 */
export function bottomRight(cell: Partial<Cell> | Grid) : Point {
    return {
        x: val(cell,'x') + val(cell,'width'),
        y: val(cell,'y') + val(cell,'height')
    };
}


/**
 * Get the index of the cell at `c`, `r`
 * @param {Grid} grid
 * @param {number|Position} c the column
 * @param {number} [r] the row
 * @returns {number} index
 */
export function cellIndex( grid: Grid, c : number | Position, r?: number ) : number {
    if(isPosition(c)){
        r = (<Position>c).row;
        c = (<Position>c).column;
    }

    if(val(grid, 'rowMajor')){
        return (grid.columns * (<number>r)) + (<number>c);
    }

    return (grid.rows * (<number>c)) + (<number>r);
}

/**
 * Provides the column and row for the provided index
 * @param {Grid} grid
 * @param {number|Cell} i the index, or a Cell
 * @returns {Position}
 */
export function cellPosition( grid : Grid, i: number | Partial<Cell> ) : Position {
    if( i === 0 ) {
        return {
            column: 0,
            row: 0
        };
    }


    //if first param is a Grid and second param is a Cell
    if(typeof i === 'object' && typeof grid === 'object'){
        const cell = i as Partial<Cell>;
        const g = <Grid>grid;

        let column = -1;
        let row = -1;
        //its a cell, find the the column and row for it
        for(let c : number = 0; c < g.columns; c++){
            if(xForColumn(grid, c) === cell.x){
                column = c;
                break;
            }
        }
        for(let r : number = 0; r < g.rows; r++){
            if(yForRow(grid, r) === cell.y){
                row = r;
                break;
            }
        }

        return {
            column,
            row
        };
    }

    const p:number = <number>i;

    if(val(grid, 'rowMajor')){
        let columns : number = _isFinite(grid) ? (<number>grid) : (<Grid>grid).columns;

        return {
            row: Math.floor(p / columns),
            column: ( p % columns )
        };
    }


    let rows : number = _isFinite(grid) ? (<number>grid) : (<Grid>grid).rows;
    return {
        row: Math.floor(p % rows ),
        column: Math.floor(p / rows)
    };
}

/**
 * Get the width for a cell in the grid
 * @param {Grid} grid
 * @returns {number} width
 */
export function cellWidth(grid: Grid) : number {
    const pl:number = val(grid,'paddingLeft'),
        pr:number = val(grid,'paddingRight');

    let totalPadding:number = (pl+pr) * grid.columns;
    if( !val(grid,'outerPadding') ){
        totalPadding -= pl + pr;
    }

    return (val(grid,'width') - totalPadding)  / grid.columns;
}

/**
 * Get the height for a cell in the grid
 * @param {Grid} grid
 * @returns {number} height
 */
export function cellHeight(grid : Grid) : number {
    const pt:number = val(grid,'paddingTop'),
        pb:number = val(grid,'paddingBottom');

    let totalPadding:number = (pt+pb) * grid.rows;
    if( !val(grid,'outerPadding') ){
        totalPadding -= pt + pb;
    }

    return (val(grid,'height') - totalPadding) / grid.rows;
}



/**
 * Center the center vector of the grid or cell
 * @param { Cell | Grid } cell the grid or cell to get center of
 * @returns {Point}
 */
export function center(cell: Partial<Cell> | Grid) : Point {
    return {
        x: val(cell,'x') + val(cell,'width') / 2,
        y: val(cell,'y') + val(cell,'height') / 2
    };
}


/**
 * Get the vector for the top-left vertex
 * @param {Cell | Grid} cell
 * @returns {Point}
 */
export function topLeft( cell: Partial<Cell> | Grid ) : Point {
    return {
        x: val(cell,'x'),
        y: val(cell,'y')
    };
}

/**
 * Get the vector for the top-right vertex
 * @param {Cell | Grid} cell
 * @returns {Point}
 */
export function topRight( cell: Partial<Cell> | Grid ) : Point {
    return {
        x: val(cell,'x') + val(cell,'width'),
        y: val(cell,'y')
    };
}

/**
 * Get the x-position for the `nth` column of the grid
 * @param {Grid} grid
 * @param {number} n the column
 * @returns {number} x
 */
export function xForColumn( grid: Grid, n: number ) : number {
    const pl:number = val(grid,'paddingLeft'),
        pr:number = val(grid,'paddingRight'),
        paddingSum:number = ( (pl+pr) * n );

    let x = val(grid,'x') + pl + ( cellWidth(grid) * n ) + paddingSum;

    if( !val(grid,'outerPadding') ){
        x -= pl;
    }

    return x;
}

/**
 * Get the y-position for the `nth` row of the grid
 * @param {Grid} grid
 * @param {number} n the row
 * @returns {number} y
 */
export function yForRow( grid: Grid, n: number ) : number {
    const pt:number = val(grid,'paddingTop'),
        pb:number = val(grid,'paddingBottom'),
        paddingSum:number = ( (pt+pb) * n );

    let y = val(grid,'y') + pt + ( cellHeight(grid) * n ) + paddingSum;

    if( !val(grid,'outerPadding') ){
        y -= pt;
    }

    return y;
}


/**
 * Do the two provided cells intersect each other?
 * @param a
 * @param b
 * @returns true if they intersect
 */
export function cellsIntersect(a: Cell, b: Cell) : boolean {
    const ax2 = a.x + a.width;
    const ay2 = a.y + a.height;

    const bx2 = b.x + b.width;
    const by2 = b.y + b.height;

    return a.x < bx2 && ax2 > b.x &&
        a.y < by2 && ay2 > b.y;
};

/**
 * Get the cell that is intersected by the provided point, undefined if none
 * @param {Grid | Cell[]} grid
 * @param {Point} point the point vector
 * @returns {Cell|undefined} the cell intersected or undefined
 */
export const intersectsCell = (grid: Grid | Cell[], point: Point) : Cell =>
	Array.isArray(grid) ?
	(<Cell[]>grid)[intersectsCellIndexFromArray(grid as Cell[], point)] :
	cellForPosition(grid, intersectsCellPosition(grid, point));


function intersectsCellIndexFromArray( cells: Cell[], point: Point) : number {
	for(let i:number = 0; i< cells.length; i++){
		const cell:Cell = cells[i];
		if(contains(cell, point)){
			return i;
		}
    }
    return -1;
}

export function intersectsCellPosition( grid: Grid, point: Point ) : Position {
    const cell:Cell = { x: 0, y: 0, width: 0, height: 0 };

    for( let column=0; column<grid.columns; column++ ){
        for( let row=0; row<grid.rows; row++ ){
            //mutate cell instead of creating a new one
            cellForPosition(grid, column, row, cell);

            if(contains(cell, point)){
                return { column, row }
            }
        }
    }
}

export const intersectsCellIndex = (grid: Grid | Cell[], point: Point) : number =>
    Array.isArray(grid) ?
    intersectsCellIndexFromArray(grid as Cell[], point) :
    cellIndex(grid, intersectsCellPosition(grid, point));

/**
 * Select a range of cells from the grid
 * @param {Cell[]} grid the grid
 * @param {Position | Number} posStart_columnStart the first column index
 * @param {Position | Number} posStop_columnStop the first row index
 * @param {Number} [rowStart] the second column index
 * @param {Number} [rowStop] the second row index
 * @returns {Cell:[]} cells
 */
export function cellsRange(grid: Grid, posStart_columnStart: Position|number, posStop_columnStop: Position|number, rowStart?: number, rowStop?: number) : Cell[] {
    let c1: number;
    let c2: number;
    let r1: number;
    let r2: number;
    //maybe it was passed in as 2 position objects instead
    if(isPosition(posStart_columnStart) && isPosition(posStop_columnStop)){
        c1 = posStart_columnStart.column;
        r1 = posStart_columnStart.row;
        c2 = posStop_columnStop.column;
        r2 = posStop_columnStop.row;
    }

    const cells:Cell[] = [];

    if(grid.rowMajor){
        for(let c=c1; c <= c2; c++){
            for(let r = r1; r<=r2; r++){
                cells.push(cellForPosition(grid, c, r));
            }
        }
    } else {
        for(let r = r1; r<=r2; r++){
            for(let c=c1; c <= c2; c++){
                cells.push(cellForPosition(grid, c, r));
            }
        }

    }

    return cells;
}


const isLessOrEqual = (a:Position, b:Position): boolean =>
    a.column <= b.column && a.row <= b.row;

const isValidRange = (a:Position, b:Position): boolean =>
    isLessOrEqual(a, b) || isLessOrEqual(b, a);

const rangeComparator = (a:Position, b:Position)=>
    isLessOrEqual(a, b) ? 1 : -1;

const sortRangeTuple = (a:Position, b:Position): Position[] =>
    isLessOrEqual(a, b) ? [a, b] : [b, a];


/**
 * Is the position within the provided range? (inclusive of maximum range)
 * @param v the position to test
 * @param a minimum cell boundary
 * @param b maximum cell boundary
 */
export function isInRange({column, row }:Position, a:Position, b:Position): boolean {
    const minX = Math.min(a.column, b.column);
    const maxX = Math.max(a.column, b.column);
    const minY = Math.min(a.row, b.row);
    const maxY = Math.max(a.row, b.row);
    return column >= minX && column <= maxX && row >= minY && row <= maxY;
}

/**
 * number of cells that exist within the provided boundary positions. (inclusive of maximum range)
 * @param a cell boundary
 * @param b  cell boundary
 */
export function numCellsInRange(a:Position, b:Position): number {
    const minX = Math.min(a.column, b.column);
    const maxX = Math.max(a.column, b.column);
    const minY = Math.min(a.row, b.row);
    const maxY = Math.max(a.row, b.row);
    return ((maxX-minX)+1) * ((maxY-minY)+1);
}


/**
 * Merge the given Cell[] or Grid with `posStart` and `posStop` provided into a single Cell
 * @param {Grid | Cell[]} grid
 * @param {Position} [posStart]
 * @param {Position} [posStop]
 * @param {object} [result]
 * @returns {Cell}
 */
export function cellsMerged(grid: Grid | Partial<Cell>[], posStart?:Position, posStop?:Position, result?:object): Cell {
    return Array.isArray(grid) ?
        cellBounds(grid as Partial<Cell>[], result) :
        cellBounds([ cellForPosition(grid, posStart), cellForPosition(grid, posStop) ], result);
}



/**
 * shift all cells over
 * @param {Object} grid
 * @param {Object} params the parameters of how to shift
 * @param {Number} [params.columns] number of columns to shift right
 * @param {Number} [params.rows] number of rows to shift down
 * @param {Boolean} [params.wrap] true if cells pushed off should be wrapped
 * @returns {Array} cells
 */
export function shiftCells(grid, params ){
    if( typeof params !== 'object' ){
        return grid;
    }
    params = defaults( params, shiftCellsDefaults );

    //for every cell
    var cols = grid.columns,
        rows = grid.rows;

    //cache every cell in a multi-dimensional array so that
    //look-ups in the loops arent incorrect due to previous operations
    var cellsCache = [];
    var c = 0,
        r = 0,
        cells = grid.cells,
        cellsToAdd = [];

    //cache cells
    for(c=0; c < cols; c++){
        cellsCache[c] = [];
        for(r=0; r<rows; r++){
            cellsCache[c][r] = cellForPosition( grid, c, r );
        }
    }

    for(c=0; c<cols; c++){
        for(r=0; r<rows; r++){
            //get the original cell
            var cell = cellsCache[c][r];
            var newC = c + params.columns;
            var newR = r + params.rows;
            //if this cell is beyond the grid limits
            if( newC >= cols || newR >= rows || newC < 0 || newR < 0 ) {
                newC = newC % cols;
                newR = newR % rows;
                if( newC < 0 ){
                    newC = cols + newC;
                }
                if( newR < 0 ){
                    newR = rows + newR;
                }
                //if we can't wrap it, drop the cell and make a new one
                if( !params.wrap ){
                    cells.splice( cells.indexOf(cell), 1 );
                    cell = cellForPosition(grid, newC, newR);
                    cellsToAdd.push(cell);
                } else {
                    //overwrite the current cell object with new data
                    cellForPosition(grid, newC, newR, cell);
                }
            } else {
                //overwise the current cell object with new data
                cellForPosition(grid, newC, newR, cell);
            }
        }
    }
    grid.cells = cells = cells.concat(cellsToAdd);

    //make sure the cells all retain relevant order in the collection
    if( params.sort ){
        grid.cells.sort(sortByGridPosition);
    }

    return grid;
}

/**
 * Comparator to sort an array of cells by
 * their position within the grid
 * @param {Position} a
 * @param {Position} b
 * @returns {number}
 */
export function sortByGridPosition( a: Position, b: Position ) : number {
    var ac = a.column,
        bc = b.column,
        ar = a.row,
        br = b.row;
    //if the row for a is less,
    //or if its the same row, but the column is less
    //its first
    if( ar < br || (ar===br && ac<bc) ){
        return -1;
    } else if( ar > br || (ar===br && ac>bc) ){
        //if a's row is more, or its the same but its column is after
        //it comes after
        return 1;
    }
    return 0;
}


