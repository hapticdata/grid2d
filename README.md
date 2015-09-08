# grid2d
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

[![NPM](https://nodei.co/npm/grid2d.png)](https://npmjs.org/package/change-keys)

Calculate and manipulate 2-dimensional grids in node and browser.




##Usage

`grid2d()` requires an object with `columns` and `rows` properties, the rest of the parameters have default values, and result with include the calculated cells.
```js
var grid = grid2d({
    columns: 2,
    rows: 4,
    paddingLeft: 5
});
```

would generate the following object:

```js
{ columns: 2,
  rows: 4,
  paddingRight: 0.1,
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  paddingLeft: 0,
  paddingBottom: 0,
  paddingTop: 0,
  noOuterPadding: false,
  cells:
   [ { column: 0, row: 0, x: 0, y: 0, width: 0.4, height: 0.25 },
     { column: 1, row: 0, x: 0.5, y: 0, width: 0.4, height: 0.25 },
     { column: 0, row: 1, x: 0, y: 0.25, width: 0.4, height: 0.25 },
     { column: 1, row: 1, x: 0.5, y: 0.25, width: 0.4, height: 0.25 },
     { column: 0, row: 2, x: 0, y: 0.5, width: 0.4, height: 0.25 },
     { column: 1, row: 2, x: 0.5, y: 0.5, width: 0.4, height: 0.25 },
     { column: 0, row: 3, x: 0, y: 0.75, width: 0.4, height: 0.25 },
     { column: 1, row: 3, x: 0.5, y: 0.75, width: 0.4, height: 0.25 } ] }
     
```

But its capabilities go much beyond that. Look at the documented source to see all of its functionality. One helpful method is `grid2d.selectCells(grid, column1, row1, column2, row2)`

```js
var grid = grid2d({
    columns: 10,
    rows: 8
});

//select the cells in the 5th column between rows 2 and 4
var selected = grid2d.selectCells(grid, 5, 2, 5, 4);
//--> 
//[ { column: 5, row: 2, x: 0.5, y: 0.25, width: 0.1, height: 0.125 },
//  { column: 5, row: 3, x: 0.5, y: 0.375, width: 0.1, height: 0.125 },
//  { column: 5, row: 4, x: 0.5, y: 0.5, width: 0.1, height: 0.125 } ]

//then, if you wished to merge those into one cell:
grid2d.computeCellBounds(selected);
//-> { x: 0.5, y: 0.25, width: 0.1, height: 0.375 }
```




##License

MIT, see [LICENSE.md](http://github.com/hapticdata/change-keys/blob/master/LICENSE.md) for details.
