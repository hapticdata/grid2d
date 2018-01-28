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
    rowMajor?: boolean;
}
export interface Position {
    column: number;
    row: number;
}
export declare const scale: (grid: Grid, scaleX: number, scaleY: number, scaledGrid?: Grid) => Grid;
/**
 * Generate the cells for a provided grid
 * @param {{ x, y, columns, rows, width, height }} grid
 * @param {Array} [arr] optionally provide an array to populate
 * @returns {Array}
 */
export declare const createCells: (grid: Grid, arr?: Cell[]) => Cell[];
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
export declare const cellBounds: (grid: Grid) => Cell;
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
export declare const createCellForIndex: (grid: Grid, index: number, cell?: Cell) => Cell;
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
export declare const createCellForPosition: (grid: Grid, c: number | Position, r?: number | Cell, cell?: Cell) => Cell;
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
export declare const closestCell: (grid: Grid, point: Point) => Cell;
/**
 * closest cell `position` to `point`
 * @param {grid} [grid]
 * @param {point} [point]
 * @returns {position}
 */
export declare const closestCellPosition: (grid: Grid, point: Point) => Position;
/**
 * closest cell index to `point`
 * @param {grid} [grid]
 * @param {point} [point]
 * @returns {position}
 */
export declare const closestCellIndex: (grid: Grid, point: Point) => number;
/**
 * Does the grid (or cell) contain this position?
 * @param {{ x, y, width, height }} grid the grid or cell to test
 * @param {{ x, y }} pos the vector of the position
 * @returns {Boolean} true if the point is inside
 */
export declare const contains: (cell: Cell | Grid, point: Point) => boolean;
/**
 * Get the bottom-left vertex
 * @param {{ x, y, height }} grid
 * @returns {{
 *      x : Number,
 *      y : Number
 * }}
 */
export declare const bottomLeft: (cell: Cell) => Point;
/**
 * Get the bottom-right vertex of the grid or cell
 * @param {{ x, y, width, height }} grid the grid or cell
 * @returns {{
 *      x : Number,
 *      y : Number
 * }}
 */
export declare const bottomRight: (cell: Cell) => Point;
/**
 * Get the index of the cell at `c`, `r`
 * @param {Object} grid
 * @param {Number} c the column
 * @param {Number} r the row
 * @returns {Number} index
 */
export declare const cellIndex: (grid: Grid, c: number | Position, r?: number) => number;
/**
 * Provides the column and row for the provided index
 * @param {{ columns:Number }} grid
 * @param {Number | Cell} i the index, or a Cell
 * @returns {{
 *      column : Number,
 *      row    : Number
 * }}
 */
export declare function cellPosition(grid: Grid, i: number | Cell): Position;
/**
 * Get the width for a cell in the grid
 * @param {Object} grid
 * @returns {Number} width
 */
export declare const cellWidth: (grid: Grid) => number;
/**
 * Get the height for a cell in the grid
 * @param {Object} grid
 * @returns {Number} height
 */
export declare const cellHeight: (grid: Grid) => number;
/**
 * Center the center vector of the grid or cell
 * @param {{ x, y, width, height }} grid the grid or cell to get center of
 * @returns {{
 *      x : Number,
 *      y : Number
 * }}
 */
export declare const center: (cell: Cell) => Point;
/**
 * Get the vector for the top-left vertex
 * @param {{ x, y, width }} grid
 * @returns {{
 *      x:Number,
 *      y:Number
 * }}
 */
export declare const topLeft: (cell: Cell) => Point;
/**
 * Get the vector for the top-right vertex
 * @param {{ x, y, width }} grid
 * @returns {{
 *      x:Number,
 *      y:Number
 * }}
 */
export declare const topRight: (cell: Cell) => Point;
/**
 * Get the x-position for the `nth` column of the grid
 * @param {Object} grid
 * @param {Number} n the column
 * @returns {Number} x
 */
export declare const xForColumn: (grid: Grid, n: number) => number;
/**
 * Get the y-position for the `nth` row of the grid
 * @param {Object} grid
 * @param {Number} n the row
 * @returns {Number} y
 */
export declare const yForRow: (grid: Grid, n: number) => number;
/**
 * Get the cell that is intersected by the provided point, undefined if none
 * @param {Object} grid
 * @param {{ x,y }} point the point vector
 * @returns {Object|undefined} the cell intersected or undefined
 */
export declare const intersectsCell: (grid: Grid, point: Point) => Cell;
export declare const intersectsCellPosition: (grid: Grid, point: Point) => Position;
export declare const intersectsCellIndex: (grid: Grid, point: Point) => number;
/**
 * Select a range of cells from the grid
 * @param {Cell[]} grid the grid
 * @param {Position | Number} posStart_columnStart the first column index
 * @param {Position | Number} posStop_columnStop the first row index
 * @param {Number} [rowStart] the second column index
 * @param {Number} [rowStop] the second row index
 * @returns {Cell:[]} cells
 */
export declare const createCellsBetween: (grid: Grid, posStart_columnStart: number | Position, posStop_columnStop: number | Position, rowStart: number, rowStop: number) => Cell[];
/**
 * shift all cells over
 * @param {Object} grid
 * @param {Object} params the parameters of how to shift
 * @param {Number} [params.columns] number of columns to shift right
 * @param {Number} [params.rows] number of rows to shift down
 * @param {Boolean} [params.wrap] true if cells pushed off should be wrapped
 * @returns {Array} cells
 */
export declare const shiftCells: (grid: any, params: any) => any;
/**
 * Comparator to sort an array of cells by
 * their position within the grid
 * @param {{ column:Number, row:Number}} a
 * @param {{ column:Nunber, row:Number}} b
 * @returns {Number}
 */
export declare const sortByGridPosition: (a: Position, b: Position) => number;
