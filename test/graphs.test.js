const test = require('node:test');
const assert = require('node:assert');
const G = require('../www/js/graphs.js');

const maps = { bfs: G.PLAIN, dfs: G.PLAIN, dij: G.WEIGHTED };

test('maps are connected, planar-looking data is well formed', () => {
  for (const g of [G.PLAIN, G.WEIGHTED]) {
    const adj = G.adjacency(g), ids = Object.keys(g.nodes);
    const seen = new Set(['A']), q = ['A'];
    while (q.length) for (const n of adj[q.shift()]) if (!seen.has(n)) { seen.add(n); q.push(n); }
    assert.strictEqual(seen.size, ids.length, 'connected');
    g.edges.forEach(e => assert.ok(g.nodes[e[0]] && g.nodes[e[1]]));
    ids.forEach(k => { const [x, y] = g.nodes[k]; assert.ok(x > 20 && x < g.view[0] - 20 && y > 40 && y < g.view[1] - 20, k + ' inside view'); });
  }
});

test('BFS finds a shortest path; the queue front is always taken', () => {
  for (const ex of G.PLAIN.examples) {
    const t = G.bfsTrace(G.PLAIN, ex.start, ex.goal);
    assert.ok(t.found);
    // brute-force shortest hop count
    const adj = G.adjacency(G.PLAIN), dist = { [ex.start]: 0 }, q = [ex.start];
    while (q.length) { const u = q.shift(); for (const v of adj[u]) if (!(v in dist)) { dist[v] = dist[u] + 1; q.push(v); } }
    assert.strictEqual(t.path.length - 1, dist[ex.goal]);
    t.steps.forEach(s => assert.strictEqual(s.answer, s.frontier[0]));
  }
});

test('DFS takes the newest place and finds a path; on the first example it is much longer than BFS', () => {
  for (const ex of G.PLAIN.examples) {
    const t = G.dfsTrace(G.PLAIN, ex.start, ex.goal);
    assert.ok(t.found);
    t.steps.forEach(s => assert.strictEqual(s.answer, s.frontier[s.frontier.length - 1]));
    const adj = G.adjacency(G.PLAIN);
    for (let i = 1; i < t.path.length; i++) assert.ok(adj[t.path[i - 1]].includes(t.path[i]));
  }
  const ex = G.PLAIN.examples[0];
  assert.ok(G.dfsTrace(G.PLAIN, ex.start, ex.goal).path.length > G.bfsTrace(G.PLAIN, ex.start, ex.goal).path.length + 2);
});

test('Dijkstra costs match brute force for every start', () => {
  const g = G.WEIGHTED, all = Object.keys(g.nodes);
  for (const s of all) {
    const { dist } = G.dijkstraCosts(g, s);
    // Bellman-Ford style relaxation as the check
    const d = {}; all.forEach(k => d[k] = Infinity); d[s] = 0;
    for (let i = 0; i < all.length; i++) g.edges.forEach(([a, b, w]) => {
      if (d[a] + w < d[b]) d[b] = d[a] + w;
      if (d[b] + w < d[a]) d[a] = d[b] + w;
    });
    all.forEach(k => assert.strictEqual(dist[k], d[k], s + '->' + k));
  }
  assert.strictEqual(G.dijkstraCosts(g, 'A').dist.F, 13);
});

test('Dijkstra lesson: the cheapest path beats the fewest-stops path on example 1', () => {
  const ex = G.WEIGHTED.examples[0];
  const d = G.graphFrames('dij', G.WEIGHTED, ex.start, ex.goal);
  assert.strictEqual(d.trace.dist[ex.goal], 13);
  assert.deepStrictEqual(d.trace.path, ['A', 'C', 'B', 'D', 'E', 'F']);
  assert.match(d.frames[d.frames.length - 1].text, /fewest stops/);
});

test('frames: every kind and example has valid, explained frames', () => {
  for (const kind of ['bfs', 'dfs', 'dij']) {
    const g = maps[kind];
    for (const ex of g.examples) {
      const d = G.graphFrames(kind, g, ex.start, ex.goal);
      assert.ok(d.frames.length > 4);
      let msCount = 0;
      for (const f of d.frames) {
        assert.ok(f.text.length > 8);
        f.line.forEach(i => assert.ok(i >= 0 && i < d.pseudo.length));
        [...f.visited, ...f.list, ...f.added, ...(f.done || [])].forEach(id => assert.ok(g.nodes[id], id));
        f.active.concat(f.tree).forEach(([a, b]) => assert.ok(g.nodes[a] && g.nodes[b]));
        if (f.ms) msCount++;
      }
      assert.ok(msCount >= 3);
      const last = d.frames[d.frames.length - 1];
      assert.ok(last.path && last.path[0] === ex.start && last.path[last.path.length - 1] === ex.goal);
      assert.strictEqual(last.ms, true);
    }
  }
});

test('search frames: the taken place is the front (BFS) or top (DFS); new places appear in the list', () => {
  for (const kind of ['bfs', 'dfs']) for (const ex of G.PLAIN.examples) {
    const d = G.graphFrames(kind, G.PLAIN, ex.start, ex.goal);
    d.frames.filter(f => f.taken).forEach(f => assert.strictEqual(f.taken, kind === 'bfs' ? f.list[0] : f.list[f.list.length - 1]));
    d.frames.filter(f => f.added.length).forEach(f => f.added.forEach(id => assert.ok(f.list.includes(id))));
  }
});

test('Dijkstra frames: costs never go up, done places stay done, updates show an arrow back', () => {
  const ex = G.WEIGHTED.examples[0];
  const d = G.graphFrames('dij', G.WEIGHTED, ex.start, ex.goal);
  let prev = null;
  d.frames.forEach(f => {
    if (prev) Object.keys(f.dist).forEach(k => { if (prev.dist[k] !== null) assert.ok(f.dist[k] !== null && f.dist[k] <= prev.dist[k]); });
    if (prev) prev.done.forEach(k => assert.ok(f.done.includes(k)));
    if (f.update) assert.ok(f.from[f.update]);
    prev = f;
  });
});

/* ---------- Prim and Kruskal ---------- */
function bruteMst(g) {
  const ids = Object.keys(g.nodes), E = g.edges;
  let best = Infinity;
  const n = ids.length;
  (function pick(i, chosen) {
    if (chosen.length === n - 1) {
      const comp = {}; ids.forEach(k => comp[k] = k);
      const f = x => comp[x] === x ? x : (comp[x] = f(comp[x]));
      chosen.forEach(([a, b]) => { comp[f(a)] = f(b); });
      if (new Set(ids.map(f)).size === 1) best = Math.min(best, chosen.reduce((s, e) => s + e[2], 0));
      return;
    }
    if (i === E.length) return;
    pick(i + 1, chosen.concat([E[i]])); pick(i + 1, chosen);
  })(0, []);
  return best;
}

test('MST map: distinct prices, connected, cheapest tree costs 23', () => {
  const w = G.MST.edges.map(e => e[2]);
  assert.strictEqual(new Set(w).size, w.length);
  assert.strictEqual(bruteMst(G.MST), 23);
});

test('Prim: same cost from every start, tree has V-1 paths and no loops', () => {
  for (const s of Object.keys(G.MST.nodes)) {
    const d = G.graphFrames('prim', G.MST, s);
    assert.strictEqual(d.trace.cost, 23);
    assert.strictEqual(d.trace.tree.length, 5);
    assert.strictEqual(new Set(d.trace.order).size, 6);
    assert.strictEqual(d.trace.order[0], s);
  }
});

test('Prim frames: each step takes the cheapest leaving path and has a valid quiz', () => {
  const d = G.graphFrames('prim', G.MST, 'A');
  d.frames.forEach(f => {
    assert.ok(f.text.length > 8);
    f.line.forEach(i => assert.ok(i >= 0 && i < d.pseudo.length));
    if (f.quiz) {
      assert.ok(f.quiz.options.some(o => o.id === f.quiz.answer));
      const min = Math.min(...f.quiz.options.map(o => +o.label.match(/\((\d+)\)/)[1]));
      assert.strictEqual(+f.quiz.options.find(o => o.id === f.quiz.answer).label.match(/\((\d+)\)/)[1], min);
      assert.ok(f.quiz.view.elist.length === f.quiz.options.length);
    }
  });
  assert.ok(d.frames.filter(f => f.quiz).length >= 3);
  assert.ok(d.frames[d.frames.length - 1].ms);
  assert.match(d.frames[d.frames.length - 1].text, /23/);
  // the loop warning appears once a path joins two places already in the tree
  assert.ok(d.frames.some(f => /make a loop/.test(f.text)));
});

test('Kruskal: cost 23, skips exactly the loop path A-B, quiz answers match', () => {
  const d = G.graphFrames('kruskal', G.MST);
  assert.strictEqual(d.trace.cost, 23);
  assert.deepStrictEqual(d.trace.rejected.map(e => e[0] + e[1]), ['AB']);
  const qs = d.frames.filter(f => f.quiz);
  assert.strictEqual(qs.length, 6);
  assert.deepStrictEqual(qs.map(f => f.quiz.answer), ['take', 'take', 'skip', 'take', 'take', 'take']);
  qs.forEach(f => { assert.strictEqual(f.quiz.view.elist.filter(e => e.state === 'cur').length, 1); });
  const last = d.frames[d.frames.length - 1];
  assert.ok(last.ms && last.rejected.length === 1);
});

test('Dijkstra quiz: answers are the cheapest not-done place', () => {
  const d = G.graphFrames('dij', G.WEIGHTED, 'A', 'F');
  const qs = d.frames.filter(f => f.quiz);
  assert.ok(qs.length >= 3);
  qs.forEach(f => {
    const v = f.quiz.view, open = Object.keys(v.dist).filter(k => !v.done.includes(k) && v.dist[k] !== null);
    const min = Math.min(...open.map(k => v.dist[k]));
    assert.strictEqual(v.dist[f.quiz.answer], min);
    assert.ok(f.quiz.options.some(o => o.id === f.quiz.answer));
  });
});

test('topological sort: every arrow points forward, quizzes are right, every frame is explained', () => {
  const g = G.DAG, d = G.graphFrames('topo', g);
  const order = d.trace.order, pos = (x) => order.indexOf(x);
  assert.strictEqual(order.length, Object.keys(g.nodes).length);
  g.edges.forEach(([a, b]) => assert.ok(pos(a) < pos(b), a + ' before ' + b));
  assert.deepStrictEqual(G.topoOrder(g), order);
  d.frames.forEach((f) => {
    assert.ok(f.text && !/\{\w+\}/.test(f.text), f.text);
    if (f.quiz) assert.ok(['yes', 'no'].includes(f.quiz.answer) && f.quiz.view);
  });
  assert.ok(d.frames.some((f) => f.quiz && f.quiz.answer === 'no'), 'a "must wait" question exists');
  assert.ok(d.frames.some((f) => f.quiz && f.quiz.answer === 'yes'));
});

test('Bellman-Ford: finds the true cheapest costs with a negative road, needs several passes', () => {
  const g = G.NEG, d = G.graphFrames('bf', g, 'A');
  const dist = d.trace.dist;
  assert.deepStrictEqual(dist, { A: 0, B: 4, C: 2, D: 5, E: 7 });
  assert.ok(d.trace.passes >= 3 && d.trace.passes <= Object.keys(g.nodes).length);
  d.frames.forEach((f) => {
    assert.ok(f.text && !/\{\w+\}/.test(f.text), f.text);
    if (f.quiz) {
      assert.ok(['yes', 'no'].includes(f.quiz.answer));
      assert.ok(f.quiz.view);
    }
  });
  assert.ok(d.frames.some((f) => f.quiz && f.quiz.answer === 'yes') && d.frames.some((f) => f.quiz && f.quiz.answer === 'no'));
});
