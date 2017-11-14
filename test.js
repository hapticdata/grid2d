var test       = require('tape'),
    grid2d     = require('./index');


test('with minimal information', function(t){

    t.plan(2);

    var w = grid2d.cellWidth({ columns: 4, rows: 3 });
    t.equal(w, 0.25);

    w = grid2d.cellWidth({ columns: 4, rows: 3, width: 4 });
    t.equal(w, 1);
});

test('x for column with minimal object', function(t){

    t.plan(2);

    var x = grid2d.xForColumn({ columns: 4 }, 2);

    t.equal(x, 0.5);


    x = grid2d.xForColumn({ columns: 4, width: 2 }, 2);

    t.equal(x, 1);
});




