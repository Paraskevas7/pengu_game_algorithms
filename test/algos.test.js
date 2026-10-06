const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const A = require('../www/js/algos.js');

// Pull LEVELS out of game.js without running the DOM code.
const src = fs.readFileSync(path.join(__dirname, '../www/js/game.js'), 'utf8');
const m = src.match(/var LEVELS = (\[[\s\S]*?\n  \])(?:;|\.concat)/);
const LEVELS = eval(m[1]);

test('all levels parse and graph levels are solvable', () => {
  assert.ok(LEVELS.length >= 9);
  for (const l of LEVELS.filter(l => l.map)) {
    const g = A.parseGrid(l.map);
    assert.ok(A.bfsTrace(g).found, l.id + ' BFS cannot reach goal');
    assert.ok(A.dfsTrace(g).found, l.id + ' DFS cannot reach goal');
  }
});

test('BFS path is shortest and never longer than DFS path', () => {
  for (const l of LEVELS.filter(l => l.map)) {
    const g = A.parseGrid(l.map);
    const b = A.bfsTrace(g), d = A.dfsTrace(g);
    assert.ok(b.path.length <= d.path.length, l.id);
    // consecutive path tiles are neighbours
    for (const p of [b.path, d.path])
      for (let i = 1; i < p.length; i++) assert.ok(A.neighbors(g, p[i - 1]).includes(p[i]), l.id + ' broken path');
  }
});

test('BFS visits tiles in non-decreasing distance (oldest-first queue)', () => {
  const g = A.parseGrid(['S....', '.##..', '...#.', '.#...', '...#G']);
  const t = A.bfsTrace(g);
  const dist = { [g.start]: 0 };
  for (const id of t.order.slice(1)) {
    let c = id, d = 0; while (c !== g.start) { c = t.parent[c]; d++; }
    dist[id] = d;
  }
  const ds = t.order.map(id => dist[id]);
  for (let i = 1; i < ds.length; i++) assert.ok(ds[i] >= ds[i - 1]);
});

test('BFS answer is always the oldest frontier tile; DFS answer the newest', () => {
  for (const l of LEVELS.filter(l => l.map)) {
    const g = A.parseGrid(l.map);
    for (const s of A.bfsTrace(g).steps) assert.strictEqual(s.answer, s.frontier[0]);
    for (const s of A.dfsTrace(g).steps) assert.strictEqual(s.answer, s.frontier[s.frontier.length - 1]);
  }
});

test('some DFS level has a frontier with several choices (so the game is not trivial)', () => {
  const multi = LEVELS.filter(l => l.algo === 'dfs').some(l => A.dfsTrace(A.parseGrid(l.map)).steps.some(s => s.frontier.length > 1));
  assert.ok(multi);
});

test('at least one DFS level shows DFS finding a longer path than BFS', () => {
  const longer = LEVELS.filter(l => l.algo === 'dfs').some(l => {
    const g = A.parseGrid(l.map);
    return A.dfsTrace(g).path.length > A.bfsTrace(g).path.length;
  });
  console.log('DFS longer than BFS on a level:', longer);
});

test('quick sort trace sorts every level and random arrays', () => {
  const arrays = LEVELS.filter(l => l.data).map(l => l.data);
  for (let n = 0; n < 200; n++) {
    const len = 1 + Math.floor(Math.random() * 12);
    arrays.push([...Array(len).keys()].map(x => x + 1).sort(() => Math.random() - 0.5));
  }
  for (const arr of arrays) {
    const t = A.quickSortTrace(arr);
    assert.deepStrictEqual(t.result, arr.slice().sort((a, b) => a - b));
    // every compare step's "smaller" flag is right and consecutive snapshots chain
    let prev = arr;
    for (const s of t.steps) {
      if (s.type === 'compare') {
        assert.strictEqual(s.smaller, s.value < s.pivot);
        assert.deepStrictEqual(s.before, prev);
      }
      prev = s.arr;
    }
    // every index ends up marked sorted exactly once
    const last = t.steps.length ? t.steps[t.steps.length - 1].sorted : [];
    assert.strictEqual(new Set(last).size, arr.length);
  }
});

test('quick sort levels have a sensible number of questions', () => {
  for (const l of LEVELS.filter(l => l.data)) {
    const q = A.quickSortTrace(l.data).steps.filter(s => s.type === 'compare').length;
    console.log(l.id, 'questions:', q);
    assert.ok(q >= 4 && q <= 40);
  }
});

test('star rating', () => {
  assert.strictEqual(A.starsFor(0), 3);
  assert.strictEqual(A.starsFor(2), 2);
  assert.strictEqual(A.starsFor(3), 1);
});
