'use strict';
const test = require('node:test'), assert = require('node:assert');
const G = require('../www/js/games-logic.js');
const Content = require('../www/js/content.js');

test('every topic holds each lesson exactly once', () => {
  const seen = {};
  Content.books.forEach((b) => b.kinds.forEach((k) => { seen[k] = (seen[k] || 0) + 1; }));
  Content.order.forEach((k) => assert.strictEqual(seen[k], 1, k));
  assert.strictEqual(Object.keys(seen).length, Content.order.length);
});
test('level ids are unique', () => {
  const ids = G.LEVELS.map((l) => l.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});
test('bits targets are reachable', () => {
  G.LEVELS.filter((l) => l.algo === 'bits').forEach((l) => {
    let ok = false;
    for (let m = 0; m < 1 << l.cards.length; m++) { const on = l.cards.map((_, i) => !!(m >> i & 1)); if (G.cardsSum(l, on) === l.target) ok = true; }
    assert.ok(ok, l.id);
  });
});
test('cipher levels decode', () => {
  G.LEVELS.filter((l) => l.algo === 'cipher').forEach((l) => assert.strictEqual(G.shiftText(G.shiftText(l.plain, l.shift), -l.shift), l.plain));
});
test('ordering levels are permutations', () => {
  G.LEVELS.filter((l) => (l.algo === 'net' || l.algo === 'algo')).forEach((l) => {
    const n = l.order ? l.order.length : l.n;
    assert.deepStrictEqual(l.perm.slice().sort(), Array.from({ length: n }, (_, i) => i), l.id);
    assert.notDeepStrictEqual(l.perm, Array.from({ length: n }, (_, i) => i), l.id);
  });
});
test('every bin item fits one of its bins', () => {
  G.LEVELS.filter((l) => l.bins).forEach((l) => l.items.forEach((it) => assert.ok(l.bins.includes(it[2]), l.id + it[1])));
});
test('folder quest files exist', () => {
  G.LEVELS.filter((l) => l.algo === 'os').forEach((l) => assert.ok(G.holds(G.TREES[l.tree], l.file), l.id));
});
test('detective solutions give the target', () => {
  G.LEVELS.filter((l) => l.algo === 'db').forEach((l) => {
    assert.deepStrictEqual(G.pick(l.sol), l.target, l.id);
    assert.strictEqual(l.sol.length, l.conds, l.id);
    assert.ok(l.target.length > 0, l.id);
  });
});
test('phishing levels have valid clues', () => {
  G.LEVELS.filter((l) => l.algo === 'sec').forEach((l) => l.clues.forEach((c) => assert.ok(['from', 'hurry', 'secret', 'link'].includes(c), l.id)));
});
test('formula targets can be built from the tokens', () => {
  G.LEVELS.filter((l) => l.algo === 'sheet').forEach((l) => {
    let found = false;
    const T = l.tokens;
    (function go(cur, depth) {
      if (found || depth > 5) return;
      if (cur.length % 2 === 1 && G.evalTokens(cur, l.cells) === l.target) { found = true; return; }
      T.forEach((t) => go(cur.concat(t), depth + 1));
    })([], 0);
    assert.ok(found, l.id);
  });
});
test('bubble levels start unsorted', () => {
  G.LEVELS.filter((l) => l.algo === 'bs').forEach((l) => assert.ok(!G.isSorted(l.data), l.id));
});
test('higher-or-lower: guessing the middle always earns 3 stars', () => {
  G.LEVELS.filter((l) => l.algo === 'bin').forEach((l) => {
    for (let secret = 1; secret <= l.max; secret++) {
      let lo = 1, hi = l.max, n = 0;
      for (;;) { const g = Math.floor((lo + hi) / 2); n++; if (g === secret) break; if (g < secret) lo = g + 1; else hi = g - 1; }
      assert.strictEqual(G.binStars(l, n), 3, l.id + ' secret ' + secret);
    }
  });
});
