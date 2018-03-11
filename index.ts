import defaults = require("defaults");

export { defaults };

export interface Point {
    x?: number;
    y?: number;
}


export interface Cell extends Point {
    width?: number;
    height?: number;
}


export interface Grid extends Cell {
    columns: number;
    rows: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    outerPadding?: boolean;
    rowMajor?:boolean;
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


/**
 * Module for generating uniform grids.
 * Given a set of parameters, generate an object for every cell within the grid.
 * Perform operations on the grid such as finding the closest cell to a point or
 * shifting all cells in any vector.
 */

// the grid `struct`
//the defaults of every grid,
//only `{ columns, rows }` is required for any operation
const gridDefaults= {
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



export const scale = (grid: Grid, scaleX: number, scaleY: number, scaledGrid: Grid = null) : Grid =>{
    scaledGrid = (<any>Object).assign(scaledGrid || {}, grid);

    scaledGrid.width = val(grid, 'width') * scaleX;
    scaledGrid.height = val(grid, 'height') * scaleY;

    const makeScaler = (scale)=>
        (property)=>_isFinite(grid[property]) && (scaledGrid[property] *= scale);

    //scale all the other properties
    //but only if they have already been defined
    ['x', 'paddingLeft', 'paddingRight'].forEach(makeScaler(scaleX));
    ['y', 'paddingBottom', 'paddingTop'].forEach(makeScaler(scaleY));

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
 * @param {{ x, y, columns, rows, width, height }} grid
 * @param {Array} [arr] optionally provide an array to populate
 * @returns {Array}
 */
export const cells = function( grid: Grid, arr: Cell[] = [] ): Cell[] {
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
};


/**
 * Compute the boundaries of the cells provided
 * @param {Object|Array} grid or the cells array
 * @param {Object} [bounds] optionally provide a rect object to be reused
 * @returns {{
 *      x:Number,
 *      y:Number,
 *      width:Number,
 *      height:Number
 * }}
 */

 //TODO: this should be receiving Cell[] not a Grid
export const cellBounds = function(grid: Grid) : Cell {

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

    return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top
    };
};


/**
 * create a rectangle at the given grid index
 * @param {object} grid
 * @param {Number} index
 * @returns {{
 *      column : Number,
 *      row    : Number,
 *      x      : Number,
 *      y      : Number,
 *      width  : Number,
 *      height : Number
 *  }}
 */
export const cellForIndex = (grid: Grid, index: number, cell?: Cell)=>
    cellForPosition(grid, cellPosition(grid, index), cell);

/**
 * create a rectangle at the given column and row
 * @param {Object} grid
 * @param {Number} c column position
 * @param {Number} r row position
 * @param {Object} [cell] optionally mutate an existing object
 * @returns {{
 *      column : Number,
 *      row    : Number,
 *      x      : Number,
 *      y      : Number,
 *      width  : Number,
 *      height : Number
 * }}
 */
export const cellForPosition = function( grid: Grid, c: number | Position, r?: number | Cell, cell?: Cell ) : Cell {

    if( isPosition(c) ){
        //accept { column:Number, row:Number }
        cell = (<Cell>r);
        r = (<Position>c).row;
        c = (<Position>c).column;
    }

    cell = cell || { x: 0, y: 0, width: 0, height: 0 };

    cell.x = xForColumn( grid, (<number>c) );
    cell.y = yForRow( grid, (<number>r) );
    cell.width = cellWidth( grid );
    cell.height = cellHeight( grid );

    return cell;
};



/**
 * Find the closest cell to the postion vector
 * @param {Grid} grid
 * @param {Position} pos the position vector
 * @returns {{
 *      x      : Number,
 *      y      : Number,
 *      width  : Number,
 *      height : Number,
 *      column : Number,
 *      rows   : Number
 * }}
 */
export const closestCell = (grid: Grid, point: Point) : Cell =>
    cellForPosition(grid, closestCellPosition(grid, point));

/**
 * closest cell `position` to `point`
 * @param {grid} [grid]
 * @param {point} [point]
 * @returns {position}
 */
export const closestCellPosition = function(grid: Grid, point: Point) : Position {
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
};

/**
 * closest cell index to `point`
 * @param {grid} [grid]
 * @param {point} [point]
 * @returns {position}
 */
export const closestCellIndex = (grid: Grid, point: Point) : number =>
    cellIndex(grid, closestCellPosition(grid, point));


/**
 * Does the grid (or cell) contain this position?
 * @param {{ x, y, width, height }} grid the grid or cell to test
 * @param {{ x, y }} pos the vector of the position
 * @returns {Boolean} true if the point is inside
 */
export const contains = (cell: Cell | Grid, point: Point) : boolean =>
    point.x >= val(cell,'x') && point.x <= val(cell,'x') + val(cell,'width') &&
    point.y >= val(cell,'y') && point.y <= val(cell,'y') + val(cell,'height');


/**
 * Get the bottom-left vertex
 * @param {{ x, y, height }} grid
 * @returns {{
 *      x : Number,
 *      y : Number
 * }}
 */
export const bottomLeft = function(cell: Cell) : Point {
    return {
        x: val(cell, 'x'),
        y: val(cell,'y') + val(cell,'height')
    };
};

/**
 * Get the bottom-right vertex of the grid or cell
 * @param {{ x, y, width, height }} grid the grid or cell
 * @returns {{
 *      x : Number,
 *      y : Number
 * }}
 */
export const bottomRight = function(cell: Cell) : Point {
    return {
        x: val(cell,'x') + val(cell,'width'),
        y: val(cell,'y') + val(cell,'height')
    };
};


/**
 * Get the index of the cell at `c`, `r`
 * @param {Object} grid
 * @param {Number} c the column
 * @param {Number} r the row
 * @returns {Number} index
 */
export const cellIndex = function( grid: Grid, c : number | Position, r?: number ) : number {
    if(isPosition(c)){
        r = (<Position>c).row;
        c = (<Position>c).column;
    }

    if(val(grid, 'rowMajor')){
        return (grid.columns * (<number>r)) + (<number>c);
    }

    return (grid.rows * (<number>c)) + (<number>r);
};

/**
 * Provides the column and row for the provided index
 * @param {{ columns:Number }} grid
 * @param {Number | Cell} i the index, or a Cell
 * @returns {{
 *      column : Number,
 *      row    : Number
 * }}
 */
export function cellPosition( grid : Grid, i: number | Cell ) : Position {
    if( i === 0 ) {
        return {
            column: 0,
            row: 0
        };
    }


    //if first param is a Grid and second param is a Cell
    if(typeof i === 'object' && typeof grid === 'object'){
        const cell = <Cell>i;
        const g = <Grid>grid;

        let column = -1;
        let row = -1;
        //its a cell, find the the column and row for it
        for(let c : number = 0; c < g.columns; c++){
            if(xForColumn(grid, c) === cell.x){
                console.log(`column ${c}`)
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
};

/**
 * Get the width for a cell in the grid
 * @param {Object} grid
 * @returns {Number} width
 */
export const cellWidth = function(grid: Grid) : number {
    var pl = val(grid,'paddingLeft'),
        pr = val(grid,'paddingRight'),
        totalPadding = (pl+pr) * grid.columns;
    if( !val(grid,'outerPadding') ){
        totalPadding -= pl + pr;
    }
    return (val(grid,'width') - totalPadding)  / grid.columns;
};

/**
 * Get the height for a cell in the grid
 * @param {Object} grid
 * @returns {Number} height
 */
export const cellHeight = function(grid : Grid) : number {
    var pt = val(grid,'paddingTop'),
        pb = val(grid,'paddingBottom'),
        totalPadding = (pt+pb) * grid.rows;
    if( !val(grid,'outerPadding') ){
        totalPadding -= pt + pb;
    }
    return (val(grid,'height') - totalPadding) / grid.rows;
};

/**
 * Center the center vector of the grid or cell
 * @param {{ x, y, width, height }} grid the grid or cell to get center of
 * @returns {{
 *      x : Number,
 *      y : Number
 * }}
 */
export const center = function(cell: Cell) : Point {
    return {
        x: val(cell,'x') + val(cell,'width') / 2,
        y: val(cell,'y') + val(cell,'height') / 2
    };
};


/**
 * Get the vector for the top-left vertex
 * @param {{ x, y, width }} grid
 * @returns {{
 *      x:Number,
 *      y:Number
 * }}
 */
export const topLeft = function( cell: Cell ) : Point {
    return {
        x: val(cell,'x'),
        y: val(cell,'y')
    };
};

/**
 * Get the vector for the top-right vertex
 * @param {{ x, y, width }} grid
 * @returns {{
 *      x:Number,
 *      y:Number
 * }}
 */
export const topRight = function( cell: Cell ) : Point {
    return {
        x: val(cell,'x') + val(cell,'width'),
        y: val(cell,'y')
    };
};

/**
 * Get the x-position for the `nth` column of the grid
 * @param {Object} grid
 * @param {Number} n the column
 * @returns {Number} x
 */
export const xForColumn = function( grid: Grid, n: number ) : number {
    const pl = val(grid,'paddingLeft'),
        pr = val(grid,'paddingRight'),
        paddingSum = ( (pl+pr) * n );

    let x = val(grid,'x') + pl + ( cellWidth(grid) * n ) + paddingSum;

    if( !val(grid,'outerPadding') ){
        x -= pl;
    }

    return x;
};

/**
 * Get the y-position for the `nth` row of the grid
 * @param {Object} grid
 * @param {Number} n the row
 * @returns {Number} y
 */
export const yForRow = function( grid: Grid, n: number ) : number {
    const pt = val(grid,'paddingTop'),
        pb = val(grid,'paddingBottom'),
        paddingSum = ( (pt+pb) * n );

    let y = val(grid,'y') + pt + ( cellHeight(grid) * n ) + paddingSum;

    if( !val(grid,'outerPadding') ){
        y -= pt;
    }

    return y;
};

/**
 * Get the cell that is intersected by the provided point, undefined if none
 * @param {Object} grid
 * @param {{ x,y }} point the point vector
 * @returns {Object|undefined} the cell intersected or undefined
 */
export const intersectsCell = (grid: Grid, point: Point) : Cell =>
    cellForPosition(grid, intersectsCellPosition(grid, point));

export const intersectsCellPosition = function( grid: Grid, point: Point ) : Position {

    var cell = { x: 0, y: 0, width: 0, height: 0 };

    for( let column=0; column<grid.columns; column++ ){
        for( let row=0; row<grid.rows; row++ ){

            //mutate cell instead of creating a new one
            cellForPosition(grid, column, row, cell);

            if(contains(cell, point)){
                return { column, row }
            }
        }
    }
};

export const intersectsCellIndex = (grid: Grid, point: Point) : number =>
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
export const cellsRange = function( grid: Grid, posStart_columnStart: Position | number, posStop_columnStop: Position | number, rowStart?: number, rowStop?: number ) : Cell[] {
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

    var cells = [];

    for(; c1 <= c2; c1++){
        for(let r = r1; r<=r2; r++){
            cells.push(cellForPosition(grid, c1, r));
        }
    }

    return cells;
};




/**
 * shift all cells over
 * @param {Object} grid
 * @param {Object} params the parameters of how to shift
 * @param {Number} [params.columns] number of columns to shift right
 * @param {Number} [params.rows] number of rows to shift down
 * @param {Boolean} [params.wrap] true if cells pushed off should be wrapped
 * @returns {Array} cells
 */
export const shiftCells = function(grid, params ){
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
};

/**
 * Comparator to sort an array of cells by
 * their position within the grid
 * @param {{ column:Number, row:Number}} a
 * @param {{ column:Nunber, row:Number}} b
 * @returns {Number}
 */
export const sortByGridPosition = function( a: Position, b: Position ) : number {
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
};


