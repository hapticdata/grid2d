var defaults = require('object-defaults'),
    sortBy = require('sort-by'),
    gridDefaults,
    shiftCellsDefaults;



/**
 * Module for generating uniform grids.
 * Given a set of parameters, generate an object for every cell within the grid.
 * Perform operations on the grid such as finding the closest cell to a point or
 * shifting all cells in any vector.
*/

//the defaults of every grid
gridDefaults = {
    x              : 0,
    y              : 0,
    width          : 1,
    height         : 1,
    columns        : 1,
    rows           : 1,
    paddingLeft    : 0,
    paddingRight   : 0,
    paddingBottom  : 0,
    paddingTop     : 0,
    noOuterPadding : false //dont left-pad first column, top-pad first row etc
};


//default parameters for `shiftCells` function
shiftCellsDefaults = {
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
exports.create = function(grid){
    grid = defaults(grid||{}, gridDefaults);
    grid.cells = grid.cells || [];
    exports.createCells(grid, grid.cells);
    return grid;
};


/**
 * Generate the cells for a provided grid
 * @param {{ x, y, columns, rows, width, height }} grid
 * @param {Array} [arr] optionally provide an array to populate
 * @returns {Array}
 */
exports.createCells = function(grid, arr){
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
            arr[i++] = exports.createCellForPosition(grid, c, r);
        }
    }

    return arr.sort(exports.sortByGridPosition);
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
exports.computeCellBounds = function( grid, bounds ){
    var cells = grid.cells || grid;

    bounds = bounds || { x: 0, y: 0, width: 0, height: 0 };

    var minY = Number.MAX_VALUE;
    var maxY = Number.MIN_VALUE;
    var minX = Number.MAX_VALUE;
    var maxX = Number.MIN_VALUE;
    for( var i =0; i<cells.length; i++ ){
        var cell = cells[i],
            x = cell.x,
            y = cell.y;

        minX = Math.min( x, minX );
        minY = Math.min( y, minY );
        maxX = Math.max( x+cell.width, maxX );
        maxY = Math.max( y+cell.height, maxY );
    }

    bounds.x = minX;
    bounds.y = minY;
    bounds.width = maxX - minX;
    bounds.height = maxY - minY;

    return bounds;
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
exports.createCellForIndex = function( grid, index ){
    var pos = exports.getCellPosition(grid, index);
    return exports.createCellForPosition(grid, pos.column, pos.row);
};

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
exports.createCellForPosition = function( grid, c, r, cell ){

    if( typeof c.column === 'number' ){
        //accept { column:Number, row:Number }
        cell = r;
        r = c.row;
        c = c.column;
    }

    cell = cell || { column: 0, row: 0, x: 0, y: 0, width: 0, height: 0 };

    cell.column = c;
    cell.row = r;
    cell.x = exports.getXForColumn( grid, c );
    cell.y = exports.getYForRow( grid, r );
    cell.width = exports.getCellWidth( grid );
    cell.height = exports.getCellHeight( grid );

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
exports.closestCell = function( grid, pos ){
    var cols = exports.getColumns(grid),
        rows = exports.getRows(grid),
        x,
        y;

    x = sortBy(cols, function(x){ return Math.abs(pos.x-x); })[0];
    y = sortBy(rows, function(y){ return Math.abs(pos.y-y); })[0];

    return exports.getCell(grid, cols.indexOf(x), rows.indexOf(y));
};

/**
 * Does the grid (or cell) contain this position?
 * @param {{ x, y, width, height }} grid the grid or cell to test
 * @param {{ x, y }} pos the vector of the position
 * @returns {Boolean} true if the point is inside
 */
exports.contains = function( grid, pos ){
    return (pos.x >= grid.x && pos.x <= grid.x + grid.width) &&
        (pos.y >= grid.y && pos.y <= grid.y + grid.height);
};


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
exports.getBottomLeft = function(grid){
    return {
        x: grid.x,
        y: grid.y + grid.height
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
exports.getBottomRight = function(grid){
    return {
        x: grid.x + grid.width,
        y: grid.y + grid.height
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
exports.getCell = function( grid, c, r ){
    var cells = grid.cells || grid;
    if( arguments.length === 2 && c.column ){
        //if it was passed in as { column:Number, row:Number }
        r = c.row;
        c = c.column;
    }
    return cells[ exports.getCellIndex(grid, c,r) ];
};

/**
 * Get the index of the cell at `c`, `r`
 * @param {Object} grid
 * @param {Number} c the column
 * @param {Number} r the row
 * @returns {Number} index
*/
exports.getCellIndex = function( grid, c, r ){
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
exports.getCellPosition = function ( grid, i ){
    var columns = typeof grid === 'number' ? grid : grid.columns;
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
exports.getCellWidth = function(grid) {
    var pl = grid.paddingLeft || 0,
        pr = grid.paddingRight || 0,
        totalPadding = (pl+pr) * grid.columns;
    if( grid.noOuterPadding ){
        totalPadding -= pl + pr;
    }
    return (grid.width - totalPadding)  / grid.columns;
};

/**
    * Get the height for a cell in the grid
    * @param {Object} grid
    * @returns {Number} height
    */
exports.getCellHeight = function(grid){
    var pt = grid.paddingTop || 0,
        pb = grid.paddingBottom || 0,
        totalPadding = (pt+pb) * grid.rows;
    if( grid.noOuterPadding ){
        totalPadding -= pt + pb;
    }
    return (grid.height - totalPadding) / grid.rows;
};

/**
    * Center the center vector of the grid or cell
    * @param {{ x, y, width, height }} grid the grid or cell to get center of
    * @returns {{
    *      x : Number,
    *      y : Number
    * }}
    */
exports.getCenter = function(grid){
    return {
        x: grid.x + (grid.width/2),
        y: grid.y + (grid.height/2)
    };
};

/**
    * Get the x-position of every column
    * @param {Object} grid
    * @returns {Array}
    */
exports.getColumns = function( grid ){
    var arr = [];
    for( var i=0; i<grid.columns; i ++){
        arr[i] = exports.getXForColumn(grid, i);
    }
    return arr;
};

/**
    * Get the y-position of every row
    * @param {Object} grid
    * @returns {Array}
    */
exports.getRows = function( grid ){
    var arr = [];
    for( var i=0; i<grid.rows; i++){
        arr[i] = exports.getYForRow(grid, i);
    }
    return arr;
};


/**
    * Get the vector for the top-left vertex
    * @param {{ x, y, width }} grid
    * @returns {{
    *      x:Number,
    *      y:Number
    * }}
    */
exports.getTopLeft = function( grid ){
    return {
        x: grid.x,
        y: grid.y
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
exports.getTopRight = function( grid ){
    return {
        x: grid.x + grid.width,
        y: grid.y
    };
};

/**
    * Get the x-position for the `nth` column of the grid
    * @param {Object} grid
    * @param {Number} n the column
    * @returns {Number} x
    */
exports.getXForColumn = function( grid, n ){
    var pl = grid.paddingLeft || 0,
        pr = grid.paddingRight || 0,
        paddingSum = ( (pl+pr) * n ),
        x = grid.x + pl + ( exports.getCellWidth(grid) * n ) + paddingSum;
    if( grid.noOuterPadding ){
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
exports.getYForRow = function( grid, n ){
    var pt = grid.paddingTop || 0,
        pb = grid.paddingBottom || 0,
        paddingSum = ( (pt+pb) * n ),
        y = grid.y + pt + ( exports.getCellHeight(grid) * n ) + paddingSum;
    if( grid.noOuterPadding ){
        y -= pt;
    }
    return y;
};

/**
    * Get the cell that is intersected by the provided position, undefined if none
    * @param {Object} grid
    * @param {{ x,y }} pos the position vector
    * @returns {Object|undefined} the cell intersected or undefined
    */
exports.intersectsCell = function( grid, pos ){
    var cells = grid.cells;

    for( var i=0; i<cells.length; i++ ){
        if(exports.contains(cells[i], pos)){
            return cells[i];
        }
    }
};

/**
 * Select a range of cells from the grid
 * @param {{ cells:Array }} grid the grid
 * @param {Number} c1 the first column index
 * @param {Number} r1 the first row index
 * @param {Number} c2 the second column index
 * @param {Number} r2 the second row index
 * @returns {Array} cells
 */
exports.selectCells = function( grid, c1, r1, c2, r2 ){
    var cells = grid.cells || grid;
    return cells.filter(function( cell ){
        var c  = cell.column,
            r = cell.row;
        return ( c >= c1 && c <= c2 && r >= r1 && r <= r2 );
    });
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
exports.shiftCells = function(grid, params ){
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
exports.sortByGridPosition = function( a, b ){
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

/**
 * the above grid functions with the grid parameter
 * already partially-applicated
 * @param {Object} grid
 * @returns {Object}
 */
exports.partial = function( grid ){
    grid = exports.create(grid);

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
