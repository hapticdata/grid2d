"use strict";
var defaults = require('object-defaults'),
    sortBy = require('sort-by');


/**
 * a `grid` struct is:
 *
 * {
 *      columns:Number,
 *      rows:Number
 *      [x:Number], (default 0)
 *      [y:Number], (default 0)
 *      [width:Number], (default 1)
 *      [height:Number], (default 1)
 *      [paddingLeft:Number], (default 0)
 *      [paddingRight:Number], (default 0)
 *      [paddingTop:Number], (default 0)
 *      [paddingBottom:Number], (default 0),
 *      [outerPadding:Boolean], (default true)
 * }
 */

/**
 * a `cell` struct is:
 *
 * {
 *      x:Number,
 *      y:Number,
 *      width:Number,
 *      height:Number,
 * }
 */

/**
 * a `point` struct is:
 *
 * {
 *      x:Number,
 *      y:Number
 * }
 */

/**
 * a `position` struct is:
 *
 * {
 *      column:Number,
 *      row:Number
 * }
 */


const isFinite = (n)=> typeof n === 'number' && !isNaN(n);

const val = (grid, prop)=> (typeof grid[prop] === 'boolean' || isFinite(grid[prop])) ? grid[prop] : gridDefaults[prop];


/**
 * Module for generating uniform grids.
 * Given a set of parameters, generate an object for every cell within the grid.
 * Perform operations on the grid such as finding the closest cell to a point or
 * shifting all cells in any vector.
*/

// the grid `struct`
//the defaults of every grid,
//only `{ columns, rows }` is required for any operation
const gridDefaults = {
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
    outerPadding   : true //left-pad the first column, right-pad the last column, top-pad first row etc
};




//default parameters for `shiftCells` function
const shiftCellsDefaults = {
    columns : 0,
    rows    : 0,
    wrap    : false,
    sort    : true
};



/**
 * Generate a new grid,
 * @param {Object} [grid]
 * @returns {{
 *      cells         : Array,
 *      x             : Number,
 *      y             : Number,
 *      width         : Number,
 *      height        : Number,
 *      columns       : Number,
 *      rows          : Number,
 *      paddingLeft   : 0,
 *      paddingRight  : 0,
 *      paddingBottom : 0,
 *      paddingTop    : 0
* }}
*/
const createGrid = (grid)=>defaults(grid||{}, gridDefaults);


/**
 * Generate the cells for a provided grid
 * @param {{ x, y, columns, rows, width, height }} grid
 * @param {Array} [arr] optionally provide an array to populate
 * @returns {Array}
 */
const createCells = function(grid, arr){
    arr = arr || [];
    var r = 0,
        c = 0,
        i = 0;

    while( arr.length > grid.rows * grid.columns ){
        //don't want left-over cells from a previous grid
        arr.pop();
    }

    for(r=0; r<grid.rows; r++){
        for(c=0; c<grid.columns; c++){
            arr[i++] = createCellForPosition(grid, c, r);
        }
    }

    return arr.sort(sortByGridPosition);
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
const cellBounds = function(grid){

    let left = val(grid,'x'),
        right = left + val(grid,'width'),
        top = val(grid,'y'),
        bottom = top + val(grid,'height');

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
const createCellForIndex = (grid, index, cell)=> createCellForPosition(grid, cellPosition(grid, index), cell);

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
const createCellForPosition = function( grid, c, r, cell ){

    if( typeof c.column === 'number' ){
        //accept { column:Number, row:Number }
        cell = r;
        r = c.row;
        c = c.column;
    }

    cell = cell || { x: 0, y: 0, width: 0, height: 0 };

    cell.column = c;
    cell.row = r;
    cell.x = xForColumn( grid, c );
    cell.y = yForRow( grid, r );
    cell.width = cellWidth( grid );
    cell.height = cellHeight( grid );

    return cell;
};



/**
 * Find the closest cell to the postion vector
 * @param {Object} grid
 * @param {Object} pos the position vector
 * @returns {{
 *      x      : Number,
 *      y      : Number,
 *      width  : Number,
 *      height : Number,
 *      column : Number,
 *      rows   : Number
 * }}
 */
const closestCell = (grid, point)=> createCellForPosition(grid, closestCellPosition(grid, point));

/**
 * closest cell `position` to `point`
 * @param {grid} [grid]
 * @param {point} [point]
 * @returns {position}
 */
const closestCellPosition = function(grid, point){
    var column,
        row,
        minDistanceX = Number.MAX_VALUE,
        minDistanceY = Number.MAX_VALUE,
        i = 0;

    for(i=0; i<grid.columns; i++){
        let dist = Math.abs(point.x - xForColumn(grid,i));
        if(dist < minDistanceX){
            minDistanceX = dist;
            column = i;
        }
    }
    for(i=0; i<grid.rows; i++){
        let dist = Math.abs(point.y - yForRow(grid,i));
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
const closestCellIndex = (grid, point)=> cellIndex(grid, closestCellPosition(grid, point));


/**
 * Does the grid (or cell) contain this position?
 * @param {{ x, y, width, height }} grid the grid or cell to test
 * @param {{ x, y }} pos the vector of the position
 * @returns {Boolean} true if the point is inside
 */
const contains = (grid, point)=>
    point.x >= val(grid,'x') && point.x <= val(grid,'x') + val(grid,'width') &&
    point.y >= val(grid,'y') && point.y <= val(grid,'y') + val(grid,'height');


/**
 * Draw a grid on to a canvas context
 * @param {Object} grid
 * @param {CanvasRenderingContext2D} ctx
 * @param {Boolean} shouldFillRect should the whole grid get a base fill?
 */
exports.drawToCanvas = function( grid, ctx, shouldFillRect ){
    shouldFillRect = !!shouldFillRect;
    var cells = grid.cells;

    if( shouldFillRect ){
        ctx.fillRect(grid.x, grid.y, grid.width, grid.height);
    }

    var cell;

    for( var i=0; i<cells.length; i++ ){
        cell = cells[i];
        ctx.strokeRect( cell.x, cell.y, cell.width, cell.height );
    }
};

/**
 * Get the bottom-left vertex
 * @param {{ x, y, height }} grid
 * @returns {{
 *      x : Number,
 *      y : Number
 * }}
 */
const bottomLeft = function(grid){
    return {
        x: val(grid, 'x'),
        y: val(grid,'y') + val(grid,'height')
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
const bottomRight = function(grid){
    return {
        x: val(grid,'x') + val(grid,'width'),
        y: val(grid,'y') + val(grid,'height')
    };
};

/**
 * Get the cell from the grid at `c`, `r`
 * @param {Object} grid
 * @param {Number} c the column
 * @param {Number} r the row
 * @returns {{
 *      x      : Number,
 *      y      : Number,
 *      width  : Number,
 *      height : Number,
 *      column : Number,
 *      row    : Number
 * }}
 */
const getCell = function( grid, c, r ){

    //TODO determine if this should exist, because if you have a cells
    //array you can use `getCellIndex`, if you dont you can
    //use `createCellForPosition`

    if(Array.isArray(grid)){
        if( arguments.length === 2 && c.column ){
            //if it was passed in as { column:Number, row:Number }
            r = c.row;
            c = c.column;
        }
        //then grid was actually the array of cells
        let cells = grid;
        return cells[exports.getCellIndex(grid, c,r)];
    }

    return exports.createCellForPosition(grid, c, r);


};

/**
 * Get the index of the cell at `c`, `r`
 * @param {Object} grid
 * @param {Number} c the column
 * @param {Number} r the row
 * @returns {Number} index
 */
const cellIndex = function( grid, c, r ){
    if(c.column){
        r = c.row;
        c = c.column;
    }
    return (grid.columns * r) + c;
};

/**
 * Provides the column and row for the provided index
 * @param {{ columns:Number }} grid
 * @param {Number} i the index
 * @returns {{
 *      column : Number,
 *      row    : Number
 * }}
 */
const cellPosition = function ( grid, i ){
    let columns = typeof grid === 'number' ? grid : grid.columns;
    if( i === 0 ) {
        return {
            column: 0,
            row: 0
        };
    }

    return {
        row: Math.floor(i / columns),
        column: ( i % columns )
    };
};

/**
 * Get the width for a cell in the grid
 * @param {Object} grid
 * @returns {Number} width
 */
const cellWidth = function(grid) {
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
const cellHeight = function(grid){
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
const center = function(grid){
    return {
        x: grid.x + (grid.width/2),
        y: grid.y + (grid.height/2)
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
const topLeft = function( grid ){
    return {
        x: val(grid,'x'),
        y: val(grid,'y')
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
const topRight = function( grid ){
    return {
        x: val(grid,'x') + val(grid,'width'),
        y: val(grid,'y')
    };
};

/**
 * Get the x-position for the `nth` column of the grid
 * @param {Object} grid
 * @param {Number} n the column
 * @returns {Number} x
 */
const xForColumn = function( grid, n ){
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
const yForRow = function( grid, n ){
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
const intersectsCell = (grid, point)=> createCellForPosition(grid, intersectsCellPosition(grid, point));

const intersectsCellPosition = function( grid, point ){

    var cell = { x, y, width, height };

    for( let column=0; column<grid.columns; column++ ){
        for( let row=0; row<grid.rows; row++ ){

            //mutate cell instead of creating a new one
            createCellForPosition(grid, column, row, cell);

            if(contains(cell, point)){
                return { column, row };
            }
        }
    }
};

const intersectsCellIndex = (grid, point)=> cellIndex(grid, intersectsCellPosition(grid, point));

/**
 * Select a range of cells from the grid
 * @param {{ cells:Array }} grid the grid
 * @param {Number} c1 the first column index
 * @param {Number} r1 the first row index
 * @param {Number} c2 the second column index
 * @param {Number} r2 the second row index
 * @returns {Array} cells
 */
const selectCells = function( grid, c1, r1, c2, r2 ){
    //maybe it was passed in as 2 position objects instead
    if(c1.column && r1.column){
        r2 = r1.row;
        c2 = r1.column;
        r1 = c1.row;
        c1 = c1.column;
    }

    var cells = [];

    for(; c1 <= c2; c++){
        for(let r = r1; r<=r2; r++){
            cells.push(createCellForPosition(grid, c1, r));
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
const shiftCells = function(grid, params ){
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
            cellsCache[c][r] = exports.getCell( grid, c, r );
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
                    cell = exports.createCellForPosition(grid, newC, newR);
                    cellsToAdd.push(cell);
                } else {
                    //overwrite the current cell object with new data
                    exports.createCellForPosition(grid, newC, newR, cell);
                }
            } else {
                //overwise the current cell object with new data
                exports.createCellForPosition(grid, newC, newR, cell);
            }
        }
    }
    grid.cells = cells = cells.concat(cellsToAdd);

    //make sure the cells all retain relevant order in the collection
    if( params.sort ){
        grid.cells.sort(exports.sortByGridPosition);
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
const sortByGridPosition = function( a, b ){
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



module.exports = exports = {
    bottomLeft,
    bottomRight,
    cellBounds,
    cellHeight,
    cellIndex,
    cellPosition,
    cellWidth,
    closestCell,
    closestCellIndex,
    closestCellPosition,
    contains,
    createGrid,
    createCells,
    createCellForIndex,
    createCellForPosition,
    intersectsCell,
    intersectsCellIndex,
    intersectsCellPosition,
    selectCells,
    shiftCells,
    sortByGridPosition,
    topLeft,
    topRight,
    xForColumn,
    yForRow
};

/**
 * the above grid functions with the grid parameter
 * already partially-applicated
 * @param {Object} grid
 * @returns {Object}
 */
exports.partial = function( grid ){
    grid = createGrid(grid);

    //dont want these functions in the chain
    var exclude = [ 'partial', 'create' ];

    var mem = { attributes: grid };

    for( var key in exports ){
        if( exclude.indexOf(key) < 0 && typeof exports[key] === 'function' ){
            mem[key] = quickPartial(exports[key], grid);
        }
    }

    return mem;
};



/**
 * @private
 * a quick partial-application only useful for a single arg applied upfront
 */
function quickPartial(fn, vec){

    return function(args){
        var a = arguments;
        //avoid using apply on small args, faster
        switch(a.length){
            case 1:
                return fn(vec, args);
            case 2:
                return fn(vec, a[0], a[1]);
            case 3:
                return fn(vec, a[0], a[1], a[2]);
            case 4:
                return fn(vec, a[0], a[1], a[2], a[3]);
            case 5:
                return fn(vec, a[0], a[1], a[2], a[3], a[4]);
        }

        return fn.apply([vec].concat(arguments));
    };
}



function pipe(grid, fns){

    grid = createGrid(grid);

    fns = Array.prototype.slice.call(arguments, 1);


    return function(args){

        var result = Array.prototype.slice(arguments, 0);
        result.unshift(grid);

        result = fns[0].apply(null, arguments);

        for(let i=1; i<fns.length; i++){

            console.log('result: ', result);
            result = fns[i](grid, result);
        }

        return result;
    };
};

