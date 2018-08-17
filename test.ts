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

	let i : Number = grid2d.cellIndex(grid, p);
	t.equals(i, grid.columns * p.row + p.column, 'cellIndex');

	//look up the index if its set to column-major
	grid.rowMajor = false;
	i = grid2d.cellIndex(grid, p);
{}	t.equals(i, grid.rows * p.column + p.row, 'cellIndex with { rowMajor: false }');
});

test('cellWidth with minimal information', (t)=>{
    t.plan(2);
    let w : number = grid2d.cellWidth({ columns: 4, rows: 3 });
    t.equal(w, 0.25, 'cellWidth');

    w = grid2d.cellWidth({ columns: 4, rows: 3, width: 4 });
    t.equal(w, 1, 'cellWidth with grid.width');
});

test('closestCellPosition', (t)=>{
	t.plan(3);


    const grid : Grid = {
        columns: 11,
        rows: 5
    };

    let position = grid2d.closestCellPosition(grid, { x: 0, y: 0 });
    t.ok(position.column === 0 && position.row === 0, 'closestCellPosition at (0,0)');

    position = grid2d.closestCellPosition(grid, { x: 0.5, y: 0.5 });
    t.ok(position.column === 5 && position.row === 2, 'closestCellPosition at (5,2)');

    position = grid2d.closestCellPosition(grid, { x: 2, y: 2});
    t.ok(position.column === grid.columns-1 && position.row === grid.rows-1, 'closestCellPosition at far corner');
});


test('intersectsCellPosition', (t)=>{
    t.plan(3);

    const grid : Grid = {
        columns: 11,
        rows: 5
    };

	let position = grid2d.intersectsCellPosition(grid, { x: 0, y: 0 });
    t.ok(position.column === 0 && position.row === 0, 'intersectsCellPosition (0,0)');

    position = grid2d.intersectsCellPosition(grid, { x: 0.5, y: 0.5 });
    t.ok(position.column === 5 && position.row === 2, 'intersectsCellPosition (5,2)');

    position = grid2d.intersectsCellPosition(grid, { x: 2, y: 2});
    t.equals(position, undefined, 'intersectsCellPosotion undefined');
});

test('xForColumn with minimal object', (t)=>{
    t.plan(2);
    let x : number = grid2d.xForColumn({ columns: 4, rows: 1 }, 2);
    t.equal(x, 0.5, 'xForColumn');

    x = grid2d.xForColumn({ columns: 4, rows: 1, width: 2 }, 2);
    t.equal(x, 1, 'xForColumn with grid.width');
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

	const cells: Cell[] = grid2d.cells(grid);
	t.equals(cells.length, grid.columns * grid.rows, 'cells length should each columns*rows');

	const cell = cells[grid2d.cellIndex(grid, 3, 2)];
	t.ok(cell.x === grid.width / grid.columns * 3 && cell.y === grid.height / grid.rows * 2, 'cellIndex');

});


test('scale grid', (t)=>{

	t.plan(13);

	const grid : Grid = {
		columns: 10,
		rows: 10
	};

	let scaled = grid2d.scale({
		columns: 10,
		rows: 10
	}, 100, 200);

	t.equals(scaled.columns, 10, 'scale columns remain the same');
	t.equals(scaled.rows, 10, 'scale rows remain the same');
	t.equals(scaled.x, undefined, 'scale x remainds undefined');
	t.equals(scaled.width, 100, 'scale width multiplies');
	t.equals(scaled.height, 200, 'scale height multiplies');


	scaled = grid2d.scale({
		columns: 10,
		rows: 10,
		x: 2,
		y: 2,
		width: 10,
		height: 5,
		paddingLeft: 5
	}, 100, 200);


	t.equals(scaled.columns, 10, 'scale columns remain the same');
	t.equals(scaled.rows, 10, 'scale rows remain the same');
	t.equals(scaled.x, 200, 'scale x multiplies');
	t.equals(scaled.y, 400, 'scale y multiplies');
	t.equals(scaled.width, 1000, 'scale width multiplies');
	t.equals(scaled.height, 1000, 'scale heigth multiplies');
	t.equals(scaled.paddingLeft, 500, 'scale paddingLeft multiplies');
	t.equals(scaled.paddingRight, undefined, 'scale paddingRigth remains undefined');

});


test('cellPosition', (t)=>{
	t.plan(6);

	const grid : Grid = { columns: 4, rows: 3 };

	let p:Position = grid2d.cellPosition(grid, 6);
	t.equals(p.column, 2, 'cellPosition column correct');
	t.equals(p.row, 1, 'cellPosition row correct');

	const cell = grid2d.cellForPosition(grid, 3, 1);
	p = grid2d.cellPosition(grid, cell);
	t.equals(p.column, 3, 'cellForPosition creates cell at correct position');
	t.equals(p.row, 1, 'cellForPosition creates cell at correct position');


	grid.rowMajor = false;
	p = grid2d.cellPosition(grid, 6);
	t.equals(p.column, 2, 'cellPosition creates Position');
	t.equals(p.row, 0, 'cellPosition creates Position');

});


test('cell', function(t){
	t.plan(5);

	const g: Grid = { columns: 6, rows: 4 };

	const o:object = {};
	let result:Cell = grid2d.cell(g, 4, o)
	t.equal(o, result, 'cell with index, should be the original object returned, but with Cell data');
	t.ok(result.x >= 0 && result.y >= 0 && result.width > 0 && result.height > 0, 'cell with index, should be filled in with Cell properties');

	result = grid2d.cell(g, { column: 1, row: 2}, o);
	t.equal(o, result, 'cell with Position, should be the original object returned, but with Cell data');
	t.ok(result.x >= 0 && result.y >= 0 && result.width > 0 && result.height > 0, 'cell with Position, should be filled in with Cell properties');


	result = grid2d.cell(g, { column: 1, row: 2});
	t.ok(result.x >= 0 && result.y >= 0 && result.width > 0 && result.height > 0, 'cell should filled new object with Cell properties');
});


test('bounds', function(t){

	t.plan(4);

	const g: Grid = { columns: 4, rows: 4 };

	const o:object = {};
	const cells:Cell[] = grid2d.cellsRange(g, { column: 0, row: 0 }, { column: 2, row: 2 });
	let result:Cell = grid2d.bounds(cells, o);

	t.equal(o, result, 'bounds with Cell[], should mutate provided object');
	t.ok(result.x >= 0 && result.y >= 0 && result.width > 0 && result.height > 0, 'bounds with Cell[] should fill with Cell properties');


	result = grid2d.bounds(g, o);
	t.equal(o, result, 'bounds with Grid, should mutate provided object');
	t.ok(result.x === 0 && result.y === 0 && result.width === 1 && result.height === 1, `bounds with Grid should fill with Cell properties`);

});

test('cellsIntersect', function(t){

    t.plan(4);

    const a:Cell = { x: 0, y: 0, width: 10, height: 10 };
    const b:Cell = { x: 3, y: -3, width: 4, height: 20 }


    t.ok(grid2d.cellsIntersect(a, b), 'should intersect with y < and height >');
    t.ok(grid2d.cellsIntersect(b, a), 'order shouldnt matter');


    a.x = 100;
    t.notOk(grid2d.cellsIntersect(a, b), 'should not intersect, a.x is too great');

    a.x = 0;
    b.height = 1;
    t.notOk(grid2d.cellsIntersect(a, b), 'should not intersect, b height is too little');

});

test('isInRange', function(t){

    t.plan(4);


    const grid : Grid = { columns: 4, rows: 6 };

    const a : Position = { column: 1, row: 0 };
    const b : Position = { column: 2, row: 4 };

    t.ok(grid2d.isInRange({ column: 1, row: 2 }, a, b), 'should be in range');
    t.ok(grid2d.isInRange({ column: 1, row: 0 }, a, b), 'should be in range');
    t.notOk(grid2d.isInRange({ column: 0, row: 2 }, a, b), 'should not be in range');
    t.notOk(grid2d.isInRange({ column: 1, row: 5 }, a, b), 'should not be in range');
6
});

test('numCellsInRange', function(t){
    t.plan(2);

    let v = grid2d.numCellsInRange({ column: 2, row: 0 }, { column: 4, row: 6 });
    t.equals(v, 21, 'should be 21 cells');

    v = grid2d.numCellsInRange({ column: 5, row: 4 }, { column: 3, row: 1    });
    t.equals(v, 12, 'should be 12 cells');
});


test('cellsRange', function(t){
    t.plan(1);

    const a:Position = { column: 1, row: 0 };
    const b:Position = { column: 3, row: 4 };
    const num = grid2d.numCellsInRange(a, b);

    const cells = grid2d.cellsRange({ columns: 4, rows: 4 }, a, b);

    t.equals(cells.length, num, 'should generate number of cells as numCellsInRange returns');
});


test('equals', function(t){

    t.plan(4);

    const a:Grid = {
        columns: 4,
        rows: 4,
        width: 10,
        paddingLeft: 5,
        outerPadding: false
    };

    const b:Grid = (<any>Object).assign({}, a);


    t.ok( grid2d.equals(a, b), 'should be equal grids');
    b.paddingRight = 10;
    t.notOk( grid2d.equals(a, b), 'should not be equal, paddingRight is different');


    const ca:Cell = {
        x: 10,
        y: 10,
        width: 100,
        height: 100
    };

    const cb:Cell = (<any>Object).assign({}, ca);

    t.ok(grid2d.equals(ca, cb), 'should be equal cells');

    cb.x = 11;
    t.notOk(grid2d.equals(ca, cb), 'should not be equal, x is different');

});