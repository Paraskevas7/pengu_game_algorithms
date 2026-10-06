/* "Program the Penguin": the rules and levels of the robot game. Pure logic, no DOM (browser and Node). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Robot = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], N = 5;

  /* A level: a 5 x 5 map (S start, G fish, # wall), the way the penguin first looks, the most times one block
     may repeat, and a model answer (sol). The model answer sets the "par" number of blocks. */
  var LEVELS = [
    { id: 'rb1', algo: 'robot', dir: 1, maxRep: 1, map: ['.....', '.....', 'S.G..', '.....', '.....'], sol: [{ c: 'F', n: 1 }, { c: 'F', n: 1 }] },
    { id: 'rb2', algo: 'robot', dir: 0, maxRep: 1, map: ['.....', '.....', '..G..', '.....', 'S....'], sol: [{ c: 'F', n: 1 }, { c: 'F', n: 1 }, { c: 'R', n: 1 }, { c: 'F', n: 1 }, { c: 'F', n: 1 }] },
    { id: 'rb3', algo: 'robot', dir: 0, maxRep: 4, map: ['....G', '.....', '.....', '.....', 'S....'], sol: [{ c: 'F', n: 4 }, { c: 'R', n: 1 }, { c: 'F', n: 4 }] },
    { id: 'rb4', algo: 'robot', dir: 0, maxRep: 4, map: ['##..G', '##.##', '...##', '.####', 'S####'], sol: [{ c: 'F', n: 2 }, { c: 'R', n: 1 }, { c: 'F', n: 2 }, { c: 'L', n: 1 }, { c: 'F', n: 2 }, { c: 'R', n: 1 }, { c: 'F', n: 2 }] }
  ];

  function parse(level) {
    var start = null, goal = null, walls = [];
    level.map.forEach(function (row, y) { row.split('').forEach(function (ch, x) {
      if (ch === 'S') start = { x: x, y: y, d: level.dir }; else if (ch === 'G') goal = { x: x, y: y }; else if (ch === '#') walls.push([x, y]);
    }); });
    return { start: start, goal: goal, walls: walls };
  }
  function isWall(L, x, y) { return L.walls.some(function (w) { return w[0] === x && w[1] === y; }); }

  /** Run a program (a list of blocks { c: 'F' | 'L' | 'R', n: times }). Returns every small step the penguin makes. */
  function run(level, prog) {
    var L = parse(level), s = { x: L.start.x, y: L.start.y, d: L.start.d }, steps = [], bumps = 0, won = false, i, k;
    for (i = 0; i < prog.length && !won; i++) {
      for (k = 0; k < prog[i].n && !won; k++) {
        var bump = false;
        if (prog[i].c === 'F') {
          var nx = s.x + DX[s.d], ny = s.y + DY[s.d];
          if (nx < 0 || ny < 0 || nx >= N || ny >= N || isWall(L, nx, ny)) { bump = true; bumps++; } else { s.x = nx; s.y = ny; }
        } else s.d = (s.d + (prog[i].c === 'R' ? 1 : 3)) % 4;
        won = s.x === L.goal.x && s.y === L.goal.y;
        steps.push({ x: s.x, y: s.y, d: s.d, bump: bump, block: i });
      }
    }
    return { steps: steps, final: { x: s.x, y: s.y, d: s.d }, won: won, bumps: bumps, goal: L.goal };
  }
  function par(level) { return level.sol.length; }
  function starsFor(level, blocks) { var p = par(level); return blocks <= p ? 3 : blocks <= p + 2 ? 2 : 1; }

  return { LEVELS: LEVELS, parse: parse, run: run, par: par, starsFor: starsFor, N: N };
});
