

# grid2d
[![Build Status](https://travis-ci.org/hapticdata/animitter.png?branch=master)](https://travis-ci.org/hapticdata/animitter)

[![NPM](https://nodei.co/npm/grid2d.png)](https://npmjs.org/package/grid2d)

Calculate and manipulate 2-dimensional grids in node and browser.




## Usage

`grid2d` provides utilities for working with grids as plain-objects. This library is written in [TypeScript](http://typescriptlang.org) to be self-documenting.


```js
import * as grid2d from 'grid2d';

//Grid, Cell, Point and Position are plain-object structs
//If you are writing javascript, just leave out the ": <type>" parts:
let grid : Grid = {
	columns: 4,
	rows: 3
};

const p : Position = {
	column: 3,
	row: 2
};

//grids are row-major by default
let i : number = grid2d.cellIndex(grid, p); //<- 11

//a grid without a width or height will default to 1
const x : number = grid2d.xForColumn(grid, 2); //<- 0.5


//this will create Cells for the selected columns (2-4) and rows (1-2)
const cells: Cell[] = grid2d.createCellsBetween({ columns: 4, rows: 5 }, { column: 2, row: 1 }, { column: 4, row: 2 });
// result is:
// [ { x: 0.5, y: 0.2, width: 0.25, height: 0.2 },
//  { x: 0.5, y: 0.4, width: 0.25, height: 0.2 },
//   { x: 0.75, y: 0.2, width: 0.25, height: 0.2 },
//   { x: 0.75, y: 0.4, width: 0.25, height: 0.2 },
//   { x: 1, y: 0.2, width: 0.25, height: 0.2 },
//   { x: 1, y: 0.4, width: 0.25, height: 0.2 } ]

```


## API

`cellBounds(grid: Grid) => Cell;`

`createCells((grid: Grid, arr?: Cell[]) => Cell[];`

`createCellsBetween(grid: Grid, posStart_columnStart: Position | number, posStop_columnStop: Position | number, [rowStart: number, rowStop: number]) => Cell[];`

`createCellForIndex(grid: Grid, index: number, cell?: Cell) => Cell;`

`createCellForPosition(grid: Grid, c: number | Position, r?: number | Cell, cell?: Cell) => Cell;`

`closestCell(grid: Grid, point: Point) => Cell;`

`closestCellPosition(grid: Grid, point: Point) => Position;`

`closestCellIndex(grid: Grid, point: Point) => number;`

`contains(cell: Cell | Grid, point: Point) => boolean;`

`bottomLeft(cell: Cell) => Point;`

`bottomRight(cell: Cell) => Point;`

`cellIndex(grid: Grid, c: number | Position, r?: number) => number;`

`cellPosition(grid: Grid, i: number | Cell): Position;`

`cellWidth(grid: Grid) => number;`

`cellHeight(grid: Grid) => number;`

`center(cell: Cell) => Point;`

`topLeft(cell: Cell) => Point;`

`topRight(cell: Cell) => Point;`

`xForColumn(grid: Grid, n: number) => number;`

`yForRow(grid: Grid, n: number) => number;`

`intersectsCell(grid: Grid, point: Point) => Cell;`

`intersectsCellPosition(grid: Grid, point: Point) => Position;`

`intersectsCellIndex(grid: Grid, point: Point) => number;`

`scale(grid: Grid, scaleX: number, scaleY: number, scaledGrid?: Grid) => Grid;`

`shiftCells(grid: any, params: any) => any;`

`sortByGridPosition(a: Position, b: Position) => number;`





## License

MIT, see [LICENSE.md](http://github.com/hapticdata/change-keys/blob/master/LICENSE.md) for details.
