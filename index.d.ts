declare const defaults: any;
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
    rowMajor?: boolean;
}
export interface Position {
    column: number;
    row: number;
}
/**
 * fill in all parameters of the grid, including defaults
 * @param g the Grid to fill in with all defaults
 * @param result optionally provide the object, otherwise a new one is created
 */
export declare function grid(g: Grid, result?: object): Grid;
export declare function equals(a: Cell, b: Cell): boolean;
export declare function scale(grid: Grid, scaleX: number, scaleY: number, scaledGrid?: Grid): Grid;
/**
 * Generate the cells for a provided grid
 * @param {Grid} grid
 * @param {Cell[]} [arr] optionally provide an array to populate
 * @returns {Cell[]}
 */
export declare function cells(grid: Grid, arr?: Cell[]): Cell[];
/**
 * Compute the boundaries of the cells provided
 * @param {Grid | Cell[]} grid or the cells array
 * @param {object} [bounds] optionally provide a rect object to be reused
 * @returns {Cell}
 */
export declare function bounds(grid: Grid | Cell[], result?: object): Cell;
/**
 * create a Cell at the given grid index
 * @param {Grid} grid
 * @param {number} index
 * @returns {Cell}
 */
export declare const cellForIndex: (grid: Grid, index: number, cell?: object) => Cell;
/**
 * create a Cell at the given column and row
 * @param {Grid} grid
 * @param {number | Position} c column position
 * @param {number | Cell} [r] row position
 * @param {object} [cell] optionally mutate an existing object
 * @returns {Cell}
 */
export declare function cellForPosition(grid: Grid, c: number | Position, r?: number | Cell, cell?: object): Cell;
export declare function cell(grid: Grid, i: number | Position, cell?: object): Cell;
/**
 * Find the closest cell to the postion vector
 * @param {Grid} grid
 * @param {Point} pos the point vector
 * @returns {Cell}
 */
export declare const closestCell: (grid: Grid, point: Point) => Cell;
/**
 * closest cell `position` to `point`
 * @param {Grid} grid
 * @param {Point} point
 * @returns {Position}
 */
export declare function closestCellPosition(grid: Grid, point: Point): Position;
/**
 * closest cell index to `point`
 * @param {Grid} grid
 * @param {Point} point
 * @returns {number}
 */
export declare const closestCellIndex: (grid: Grid, point: Point) => number;
/**
 * Does the grid (or cell) contain this point?
 * @param {Cell | Grid} grid the grid or cell to test
 * @param {Point} pos the vector of the position
 * @returns {boolean} true if the point is inside
 */
export declare const contains: (cell: Cell | Grid, point: Point) => boolean;
/**
 * Get the bottom-left vertex
 * @param {Cell | Grid} cell
 * @returns {Point}
 */
export declare function bottomLeft(cell: Cell | Grid): Point;
/**
 * Get the bottom-right vertex of the grid or cell
 * @param {Cell | Grid} cell
 * @returns {Point}
 */
export declare function bottomRight(cell: Cell | Grid): Point;
/**
 * Get the index of the cell at `c`, `r`
 * @param {Grid} grid
 * @param {number|Position} c the column
 * @param {number} [r] the row
 * @returns {number} index
 */
export declare function cellIndex(grid: Grid, c: number | Position, r?: number): number;
/**
 * Provides the column and row for the provided index
 * @param {Grid} grid
 * @param {number|Cell} i the index, or a Cell
 * @returns {Position}
 */
export declare function cellPosition(grid: Grid, i: number | Cell): Position;
/**
 * Get the width for a cell in the grid
 * @param {Grid} grid
 * @returns {number} width
 */
export declare function cellWidth(grid: Grid): number;
/**
 * Get the height for a cell in the grid
 * @param {Grid} grid
 * @returns {number} height
 */
export declare function cellHeight(grid: Grid): number;
/**
 * Center the center vector of the grid or cell
 * @param { Cell | Grid } cell the grid or cell to get center of
 * @returns {Point}
 */
export declare function center(cell: Cell | Grid): Point;
/**
 * Get the vector for the top-left vertex
 * @param {Cell | Grid} cell
 * @returns {Point}
 */
export declare function topLeft(cell: Cell | Grid): Point;
/**
 * Get the vector for the top-right vertex
 * @param {Cell | Grid} cell
 * @returns {Point}
 */
export declare function topRight(cell: Cell | Grid): Point;
/**
 * Get the x-position for the `nth` column of the grid
 * @param {Grid} grid
 * @param {number} n the column
 * @returns {number} x
 */
export declare function xForColumn(grid: Grid, n: number): number;
/**
 * Get the y-position for the `nth` row of the grid
 * @param {Grid} grid
 * @param {number} n the row
 * @returns {number} y
 */
export declare function yForRow(grid: Grid, n: number): number;
/**
 * Do the two provided cells intersect each other?
 * @param a
 * @param b
 * @returns true if they intersect
 */
export declare function cellsIntersect(a: Cell, b: Cell): boolean;
/**
 * Get the cell that is intersected by the provided point, undefined if none
 * @param {Grid | Cell[]} grid
 * @param {Point} point the point vector
 * @returns {Cell|undefined} the cell intersected or undefined
 */
export declare const intersectsCell: (grid: Grid | Cell[], point: Point) => Cell;
export declare function intersectsCellPosition(grid: Grid, point: Point): Position;
export declare const intersectsCellIndex: (grid: Grid | Cell[], point: Point) => number;
/**
 * Select a range of cells from the grid
 * @param {Cell[]} grid the grid
 * @param {Position | Number} posStart_columnStart the first column index
 * @param {Position | Number} posStop_columnStop the first row index
 * @param {Number} [rowStart] the second column index
 * @param {Number} [rowStop] the second row index
 * @returns {Cell:[]} cells
 */
export declare function cellsRange(grid: Grid, posStart_columnStart: Position | number, posStop_columnStop: Position | number, rowStart?: number, rowStop?: number): Cell[];
/**
 * Is the position within the provided range? (inclusive of maximum range)
 * @param v the position to test
 * @param a minimum cell boundary
 * @param b maximum cell boundary
 */
export declare function isInRange({column, row}: Position, a: Position, b: Position): boolean;
/**
 * number of cells that exist within the provided boundary positions. (inclusive of maximum range)
 * @param a cell boundary
 * @param b  cell boundary
 */
export declare function numCellsInRange(a: Position, b: Position): number;
/**
 * Merge the given Cell[] or Grid with `posStart` and `posStop` provided into a single Cell
 * @param {Grid | Cell[]} grid
 * @param {Position} [posStart]
 * @param {Position} [posStop]
 * @param {object} [result]
 * @returns {Cell}
 */
export declare function cellsMerged(grid: Grid | Cell[], posStart?: Position, posStop?: Position, result?: object): Cell;
/**
 * shift all cells over
 * @param {Object} grid
 * @param {Object} params the parameters of how to shift
 * @param {Number} [params.columns] number of columns to shift right
 * @param {Number} [params.rows] number of rows to shift down
 * @param {Boolean} [params.wrap] true if cells pushed off should be wrapped
 * @returns {Array} cells
 */
export declare function shiftCells(grid: any, params: any): any;
/**
 * Comparator to sort an array of cells by
 * their position within the grid
 * @param {Position} a
 * @param {Position} b
 * @returns {number}
 */
export declare function sortByGridPosition(a: Position, b: Position): number;
