import { Grid, Cell, Point, Position } from './index';
import * as grid2d from './index';
import test = require('tape');


const eqPosition = (a, b)=> a.column === b.column && a.row === b.row;

test('cellIndex', (t)=>{
	t.plan(2);

	let grid : Grid = {
		columns: 4,
		rows: 3
	};

	const p : Position = {
		column: 3,
		row: 2
	};

	let i = grid2d.cellIndex(grid, p);
	t.equals(i, grid.columns * p.row + p.column);

	//look up the index if its set to column-major
	grid.rowMajor = false;
	i = grid2d.cellIndex(grid, p);
	t.equals(i, grid.rows * p.column + p.row);
});

test('cellWidth with minimal information', (t)=>{
    t.plan(2);
    let w : number = grid2d.cellWidth({ columns: 4, rows: 3 });
    t.equal(w, 0.25);

    w = grid2d.cellWidth({ columns: 4, rows: 3, width: 4 });
    t.equal(w, 1);
});

test('closestCellPosition', (t)=>{
	t.plan(3);


    const grid : Grid = {
        columns: 11,
        rows: 5
    };

    let position = grid2d.closestCellPosition(grid, { x: 0, y: 0 });
    t.ok(position.column === 0 && position.row === 0);

    position = grid2d.closestCellPosition(grid, { x: 0.5, y: 0.5 });
    t.ok(position.column === 5 && position.row === 2);

    position = grid2d.closestCellPosition(grid, { x: 2, y: 2});
    t.ok(position.column === grid.columns-1 && position.row === grid.rows-1);
});


test('intersectsCellPosition', (t)=>{
    t.plan(3);

    const grid : Grid = {
        columns: 11,
        rows: 5
    };

	let position = grid2d.intersectsCellPosition(grid, { x: 0, y: 0 });
    t.ok(position.column === 0 && position.row === 0);

    position = grid2d.intersectsCellPosition(grid, { x: 0.5, y: 0.5 });
    t.ok(position.column === 5 && position.row === 2);

    position = grid2d.intersectsCellPosition(grid, { x: 2, y: 2});
    t.equals(position, undefined);
});

test('xForColumn with minimal object', (t)=>{
    t.plan(2);
    let x : number = grid2d.xForColumn({ columns: 4, rows: 1 }, 2);
    t.equal(x, 0.5);

    x = grid2d.xForColumn({ columns: 4, rows: 1, width: 2 }, 2);
    t.equal(x, 1);
});



test('should generate columns * rows cells', function(t) {
	t.plan(2);

	let grid : Grid = {
		x: 0,
		y: 0,
		width: 4,
		height: 5,
		columns: 4,
		rows: 5
	};

	const cells: Cell[] = grid2d.createCells(grid);
	console.log(cells.length);
	t.equals(cells.length, grid.columns * grid.rows);

	const cell = cells[grid2d.cellIndex(grid, 3, 2)];
	t.ok(cell.x === grid.width / grid.columns * 3 && cell.y === grid.height / grid.rows * 2);

});
