var GameOfLife = (function () {

    var canvas = null,
        gcanvas = null,
        context = null,
        gcontext = null,
        vpWidth = 0,
        vpHeight = 0,
        tileSize = 10;
        rows = 160;
        columns = 160,
        map = [],
        then = Date.now(),
        fps = 50,
        showGrid = true,
        gridOffset = 0,
        tileOffset = 0;

    /**
     * Iniitialize game
     */
    function initialize() {
        vpWidth = window.innerWidth;
        vpHeight = window.innerHeight;

        gcanvas = document.createElement('canvas');
        gcontext = gcanvas.getContext('2d');
        gcanvas.width = vpWidth
        gcanvas.height = vpHeight
        document.body.appendChild(gcanvas);

        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');
        canvas.width = vpWidth;
        canvas.height = vpHeight;
        document.body.appendChild(canvas);

        map = grid();

        if (showGrid) {
            gridlines();
        }

        //var glidergun = new Glidergun(20, 40);
        //loadObject(glidergun);

        canvas.addEventListener('click', onclick);
        window.addEventListener('keypress', onkeypress);

        render();
    }

    /**
     * Create grid
     */
    function grid() {
        let grid = [];
        for (var row = 0; row < rows; row++) {
            grid[row] = [];
            for (var col = 0; col < columns; col++) {
                grid[row][col] = null;
            }
        }
        return grid;
    }

    /**
     * draw gridlines
     */
    function gridlines() {
        gcontext.strokeStyle = "#ccc";
        gcontext.lineWidth = 1;
        gridOffset = 0.5;
        tileOffset = 1;

        let lastRow = null;
        loop(function (row, col) {
            if (row != lastRow) {
                gcontext.moveTo(0, (row * tileSize) + gridOffset);
                gcontext.lineTo(columns * tileSize, (row * tileSize) + gridOffset);
                gcontext.stroke();
                lastRow = row;
            }

            if (row == 0) {
                gcontext.moveTo((col * tileSize) + gridOffset, 0);
                gcontext.lineTo((col * tileSize) + gridOffset, rows * tileSize);
                gcontext.stroke();
            }
        });
    }

    /**
     * Render whats in the grid
     */
    function render() {
        loop(function (row, col) {
            x = (col * tileSize);
            y = (row * tileSize);

            // draw placements
            if (map[row][col] == 1) {
                context.fillStyle = "#aa0000";
                context.fillRect(x + tileOffset, y + tileOffset, tileSize - tileOffset, tileSize - tileOffset);
            }
        });
    }

    /**
     * Main render loop
     */
    function loop(callback) {
        // loop over the map to render the tiles
        for (var row in map) {
            if (map.hasOwnProperty(row)) {
                for (var col in map[row]) {
                    if (map[row].hasOwnProperty(col)) {
                        callback(row, col);
                    }
                }
            }
        }
    }

    /**
     * Applys rules to the state
     */
    function applyRules() {
        let work = map.slice(0);
        map = grid();

        for (var row in map) {
            if (map.hasOwnProperty(row)) {
                for (var col in map[row]) {
                    if (map[row].hasOwnProperty(col)) {

                        //map[row][col] = null;

                        let tile = work[row][col];
                        let n = getNeighbors(work, row, col);
                        let totalNeigbors = n.reduce(function (total, sum) {
                            return (total || 0) + (sum || 0);
                        });

                        if (tile === 1) {

                            // Any live cell with fewer than two live neighbors dies, as if by underpopulation.
                            if (totalNeigbors < 2) {
                                map[row][col] = 0;
                            }
                            // Any live cell with two or three live neighbors lives on to the next generation.
                            else if (totalNeigbors == 2 || totalNeigbors == 3) {
                                map[row][col] = 1;
                            }
                            // Any live cell with more than three live neighbors dies, as if by overpopulation.
                            else if (totalNeigbors > 3) {
                                map[row][col] = 0;
                            }

                        } else {

                            // Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
                            if (totalNeigbors == 3) {
                                map[row][col] = 1;
                            }

                        }

                    }
                }
            }
        }
    }

    /**
     * Fetch all neighbors in a flat array
     */
    function getNeighbors(grid, row, col) {
        let neighbors = [];
        let lbound = (parseInt(col) - 1 < 0) ? 0 : parseInt(col) - 1;
        let rbound = (parseInt(col) + 1 > columns) ? columns : parseInt(col) + 2;
        let current = [];

        if (row > 0) {
            current = grid[parseInt(row)-1].slice(lbound, rbound);
            neighbors = neighbors.concat(current);
        }

        current = grid[parseInt(row)].slice(lbound, rbound);
        current.splice(1,1);
        neighbors = neighbors.concat(current);

        if (row < rows-1) {
            current = grid[parseInt(row)+1].slice(lbound, rbound);
            neighbors = neighbors.concat(current);
        }

        return neighbors;
    }

    /**
     * Load object in to the game map
     */
    function loadObject(object) {
        let grid = resolveObject(object);

        for (var row in grid) {
            if (grid.hasOwnProperty(row)) {
                for (var col in grid[row]) {
                    if (grid[row].hasOwnProperty(col)) {
                        map[row][col] = grid[row][col];
                    }
                }
            }
        }
    }

    /**
     * Take an object map and resolve it as a grid array
     */
    function resolveObject(object) {
        let grid = [];
        let x = object.x;
        let y= object.y;
        let map = object.map;

        for (var row = 0; row < map.length; row++) {
            grid[x + row] = [];
            for (var col = 0; col < map[row].length; col++) {
                grid[x + row][y + col] = map[row][col];
            }
        }
        return grid;
    }

    /**
     * Main loop
     */
    function update() {

        requestAnimFrame(update);

        let now = Date.now();
        let elapsed = now - then;

        if (elapsed > fps) {
            then = now - (elapsed % fps);

            clearContext();
            applyRules();
            render();
        }
    }

    function onclick(e) {
        let cx = e.clientX;
        let cy = e.clientY;

        let column = Math.floor( cx / tileSize );
        let row = Math.floor( cy / tileSize );

        map[row][column] = 1;

        clearContext();
        render();
    }

    function onkeypress(e) {
        if (e.keyCode === 13) {
            update();
        }
    }

    /**
     * Scrubs game board
     */
    function clearContext() {
        context.clearRect(0, 0, vpWidth, vpHeight);
    }

    // return
    return {
        initialize: initialize
    };

})();

var Pulsar = function (x, y) {
    this.x = x;
    this.y = y;
    this.map = [
        [0,0,1,1,1,0,0,0,1,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [0,0,1,1,1,0,0,0,1,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,1,0,0,0,1,1,1,0,0],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,1,0,0,0,1,1,1,0,0]
    ];
}

/**
 * Methuselahs
 */
var Acorn = function (x, y) {
    this.x = x;
    this.y = y;
    this.map = [
        [0,1,0,0,0,0,0],
        [0,0,0,1,0,0,0],
        [1,1,0,0,1,1,1]
    ];
}

var Glidergun = function (x, y) {
    this.x = x;
    this.y = y;
    this.map = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    ];
}



window.onload = function() {
    GameOfLife.initialize();
};
