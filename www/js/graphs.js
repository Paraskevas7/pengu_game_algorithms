/* Maps made of places (nodes) and paths (lines): BFS, DFS and Dijkstra turned into explained lesson frames.
   Pure logic, no DOM. Works in the browser (window.Graphs) and in Node (tests). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./i18n.js'));
  else root.Graphs = factory(root.I18n);
})(typeof self !== 'undefined' ? self : this, function (I18n) {
  'use strict';
  var t = I18n.t;

  /* ---------- Maps ---------- */
  var PLAIN = {
    view: [330, 292],
    nodes: { A: [58, 70], B: [168, 50], C: [286, 78], D: [40, 172], E: [160, 150], F: [276, 178], G: [96, 248], H: [226, 250] },
    edges: [['A', 'B'], ['A', 'D'], ['B', 'C'], ['B', 'E'], ['C', 'F'], ['D', 'E'], ['D', 'G'], ['E', 'F'], ['F', 'H'], ['G', 'H']],
    examples: [
      { start: 'A', goal: 'H', key: 'ex.fishAt', vars: { g: 'H' } },
      { start: 'A', goal: 'F', key: 'ex.fishAt', vars: { g: 'F' } },
      { start: 'C', goal: 'G', key: 'ex.startFishAt', vars: { s: 'C', g: 'G' } }
    ]
  };

  var WEIGHTED = {
    view: [372, 266],
    nodes: { A: [40, 144], B: [130, 64], C: [130, 226], D: [240, 86], E: [240, 216], F: [330, 148] },
    edges: [['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['B', 'D', 5], ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 2], ['D', 'F', 6], ['E', 'F', 3]],
    examples: [
      { start: 'A', goal: 'F', key: 'ex.fromTo', vars: { s: 'A', g: 'F' } },
      { start: 'A', goal: 'E', key: 'ex.fromTo', vars: { s: 'A', g: 'E' } },
      { start: 'C', goal: 'F', key: 'ex.fromTo', vars: { s: 'C', g: 'F' } }
    ]
  };

  /* A map for the spanning-tree lessons (Prim and Kruskal). All prices are different, so there are no ties. */
  var MST = {
    view: [372, 266],
    nodes: { A: [40, 144], B: [130, 64], C: [130, 226], D: [240, 86], E: [240, 216], F: [330, 148] },
    edges: [['A', 'B', 4], ['A', 'C', 3], ['B', 'C', 2], ['B', 'D', 9], ['C', 'D', 6], ['C', 'E', 8], ['D', 'E', 7], ['D', 'F', 10], ['E', 'F', 5]],
    examples: [
      { start: 'A', goal: null, key: 'ex.startAt', vars: { s: 'A' } },
      { start: 'D', goal: null, key: 'ex.startAt', vars: { s: 'D' } },
      { start: 'F', goal: null, key: 'ex.startAt', vars: { s: 'F' } }
    ]
  };

  /* A directed map for Topological Sort: arrows say "this must happen before that". */
  var DAG = {
    view: [372, 266], directed: true,
    nodes: { A: [40, 144], B: [130, 64], C: [130, 226], D: [240, 86], E: [240, 216], F: [330, 148] },
    edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F']],
    examples: [{ start: null, goal: null, key: 'ex.thisMap', vars: {} }]
  };

  /* A directed map with one negative cost for Bellman-Ford. The edge order is fixed and a little unlucky on purpose,
     so the lesson needs several passes. */
  var NEG = {
    view: [372, 266], directed: true,
    nodes: { A: [40, 144], B: [130, 64], C: [130, 226], D: [250, 86], E: [330, 190] },
    edges: [['D', 'E', 2], ['C', 'D', 3], ['B', 'C', -2], ['A', 'C', 5], ['A', 'B', 4], ['B', 'D', 6], ['C', 'E', 7]],
    examples: [{ start: 'A', goal: null, key: 'ex.startAt', vars: { s: 'A' } }]
  };

  /* The pseudocode lines are translated, so they are looked up when needed. */
  function pseudo(kind) { return t('pseudo.' + kind); }

  var KRUSKAL_EXAMPLES = [{ start: null, goal: null, key: 'ex.thisMap', vars: {} }];
  function graphFor(kind) {
    if (kind === 'kruskal') return Object.assign({}, MST, { examples: KRUSKAL_EXAMPLES });
    if (kind === 'topo') return DAG;
    if (kind === 'bf') return NEG;
    return kind === 'dij' ? WEIGHTED : kind === 'prim' ? MST : PLAIN;
  }

  function ids(g) { return Object.keys(g.nodes).sort(); }

  function adjacency(g) {
    var adj = {};
    ids(g).forEach(function (k) { adj[k] = []; });
    g.edges.forEach(function (e) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    Object.keys(adj).forEach(function (k) { adj[k].sort(); });
    return adj;
  }

  function weightOf(g, a, b) {
    for (var i = 0; i < g.edges.length; i++) {
      var e = g.edges[i];
      if ((e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)) return e[2] === undefined ? 1 : e[2];
    }
    return null;
  }

  function buildPath(parent, start, goal) {
    if (goal !== start && !(goal in parent)) return null;
    var p = [goal], c = goal;
    while (c !== start) { c = parent[c]; p.push(c); }
    return p.reverse();
  }

  /* ---------- Traces ---------- */
  /** BFS: neighbours are added in alphabetical order. */
  function bfsTrace(g, start, goal) {
    var adj = adjacency(g), queue = [start], seen = {}, parent = {}, order = [], steps = [];
    seen[start] = true;
    while (queue.length) {
      var frontier = queue.slice(), cur = queue.shift(), visitedBefore = order.slice(), discovered = [];
      order.push(cur);
      adj[cur].forEach(function (n) {
        if (!seen[n]) { seen[n] = true; parent[n] = cur; queue.push(n); discovered.push(n); }
      });
      steps.push({ frontier: frontier, answer: cur, visitedBefore: visitedBefore, discovered: discovered, found: cur === goal });
      if (cur === goal) break;
    }
    var found = order.length > 0 && order[order.length - 1] === goal;
    return { steps: steps, order: order, parent: parent, found: found, path: found ? buildPath(parent, start, goal) : null };
  }

  /** DFS: neighbours are pushed so that the alphabetically first one is taken first. */
  function dfsTrace(g, start, goal) {
    var adj = adjacency(g), stack = [{ id: start, from: null }], visited = {}, order = [], parent = {}, steps = [];
    while (stack.length) {
      while (stack.length && visited[stack[stack.length - 1].id]) stack.pop();
      if (!stack.length) break;
      var frontier = [], inF = {};
      for (var i = stack.length - 1; i >= 0; i--) {
        var sid = stack[i].id;
        if (!visited[sid] && !inF[sid]) { inF[sid] = true; frontier.unshift(sid); }
      }
      var top = stack.pop(), cur = top.id, visitedBefore = order.slice();
      visited[cur] = true; order.push(cur);
      if (top.from !== null) parent[cur] = top.from;
      var ns = adj[cur].filter(function (n) { return !visited[n]; });
      for (var j = ns.length - 1; j >= 0; j--) stack.push({ id: ns[j], from: cur });
      steps.push({ frontier: frontier, answer: cur, visitedBefore: visitedBefore, discovered: ns, found: cur === goal });
      if (cur === goal) break;
    }
    var found = order.length > 0 && order[order.length - 1] === goal;
    return { steps: steps, order: order, parent: parent, found: found, path: found ? buildPath(parent, start, goal) : null };
  }

  /** Dijkstra's cheapest costs from start to every place (used by tests and the lesson). */
  function dijkstraCosts(g, start) {
    var adj = adjacency(g), dist = {}, from = {}, done = {};
    ids(g).forEach(function (k) { dist[k] = null; });
    dist[start] = 0;
    for (;;) {
      var u = null;
      ids(g).forEach(function (k) { if (!done[k] && dist[k] !== null && (u === null || dist[k] < dist[u])) u = k; });
      if (u === null) break;
      done[u] = true;
      adj[u].forEach(function (v) {
        if (done[v]) return;
        var c = dist[u] + weightOf(g, u, v);
        if (dist[v] === null || c < dist[v]) { dist[v] = c; from[v] = u; }
      });
    }
    return { dist: dist, from: from };
  }

  /* ---------- Lesson frames ---------- */
  function blank(o) {
    return Object.assign({
      type: 'graph', line: [], text: '', ms: false,
      visited: [], current: null, list: [], taken: null, added: [], active: [], tree: [],
      dist: null, from: null, done: null, path: null, update: null, rejected: [], elist: null, quiz: null
    }, o);
  }

  function searchFrames(kind, g, start, goal) {
    var isQ = kind === 'bfs';
    var tr = isQ ? bfsTrace(g, start, goal) : dfsTrace(g, start, goal), frames = [];
    function tree(visited) { return visited.slice(1).map(function (v) { return [tr.parent[v], v]; }); }
    frames.push(blank({
      line: [0], ms: true, current: start, list: [start],
      text: t(isQ ? 'g.s.start.q' : 'g.s.start.s', { s: start })
    }));
    tr.steps.forEach(function (s, i) {
      var visited = s.visitedBefore.concat([s.answer]);
      frames.push(blank({
        line: [2], visited: visited, current: s.answer, list: s.frontier, taken: s.answer, tree: tree(visited),
        text: t(isQ ? 'g.s.take.q' : 'g.s.take.s', { p: s.answer })
      }));
      if (s.found) {
        frames.push(blank({
          line: [3], ms: true, visited: visited, current: s.answer, tree: tree(visited),
          list: s.frontier.filter(function (x) { return x !== s.answer; }),
          text: t('g.s.found', { p: s.answer, n: visited.length })
        }));
      } else {
        var next = tr.steps[i + 1], text;
        if (s.discovered.length) {
          text = isQ ? t('g.s.add.q', { list: s.discovered.join(', ') }) : t('g.s.add.s', { list: s.discovered.join(', '), first: s.discovered[0] });
        } else {
          text = t(isQ ? 'g.s.none.q' : 'g.s.none.s');
        }
        frames.push(blank({
          line: [4, 5], ms: true, visited: visited, current: s.answer, tree: tree(visited),
          list: next ? next.frontier : [], added: s.discovered,
          active: s.discovered.map(function (n) { return [s.answer, n]; }), text: text
        }));
      }
    });
    if (tr.found) {
      var hops = tr.path.length - 1, text2;
      if (isQ) {
        text2 = t('g.s.end.q', { h: hops });
      } else {
        var best = bfsTrace(g, start, goal).path.length - 1;
        text2 = hops > best ? t('g.s.end.long', { h: hops, b: best }) : t('g.s.end.same', { h: hops });
      }
      frames.push(blank({ ms: true, visited: tr.order, current: goal, tree: tree(tr.order), path: tr.path, text: text2 }));
    } else {
      frames.push(blank({ ms: true, visited: tr.order, text: t('g.s.noway') }));
    }
    return { kind: kind, graph: g, start: start, goal: goal, frames: frames, pseudo: pseudo(kind), trace: tr };
  }

  function dijkstraFrames(g, start, goal) {
    var adj = adjacency(g), all = ids(g), dist = {}, from = {}, doneSet = {}, doneList = [], frames = [];
    all.forEach(function (k) { dist[k] = null; });
    dist[start] = 0;
    function snap(o) {
      return blank(Object.assign({
        dist: Object.assign({}, dist), from: Object.assign({}, from), done: doneList.slice(),
        tree: Object.keys(from).map(function (v) { return [from[v], v]; })
      }, o));
    }
    frames.push(snap({
      line: [0], ms: true, current: start,
      text: t('g.d.start', { s: start })
    }));
    for (;;) {
      var u = null;
      all.forEach(function (k) { if (!doneSet[k] && dist[k] !== null && (u === null || dist[k] < dist[u])) u = k; });
      if (u === null) break;
      var pickFrame = snap({
        line: [2], current: u,
        text: t('g.d.pick', { u: u, c: dist[u] })
      });
      var open = all.filter(function (k) { return !doneSet[k]; });
      if (open.filter(function (k) { return dist[k] !== null; }).length > 1) {
        pickFrame.quiz = {
          view: frames[frames.length - 1],
          q: t('g.d.q'),
          options: open.map(function (k) { return { id: k, label: k + (dist[k] === null ? ' (∞)' : ' (' + dist[k] + ')') }; }),
          answer: u,
          why: t('g.d.why', { u: u, c: dist[u] })
        };
      }
      frames.push(pickFrame);
      if (u === goal) {
        doneSet[u] = true; doneList.push(u);
        frames.push(snap({
          line: [], ms: true, current: u,
          text: t('g.d.goal', { u: u, c: dist[u] })
        }));
        break;
      }
      adj[u].forEach(function (v) {
        if (doneSet[v]) return;
        var w = weightOf(g, u, v), cand = dist[u] + w, old = dist[v], better = old === null || cand < old, text;
        var du = dist[u], vars = { u: u, v: v, w: w, du: du, c: cand, old: old };
        if (better) { dist[v] = cand; from[v] = u; }
        text = t(better ? (old === null ? 'g.d.upNew' : 'g.d.upBetter') : 'g.d.upNo', vars);
        frames.push(snap({ line: better ? [3, 4, 5] : [3, 4], current: u, active: [[u, v]], update: better ? v : null, text: text }));
      });
      doneSet[u] = true; doneList.push(u);
      frames.push(snap({
        line: [6], ms: true, current: u,
        text: t('g.d.done', { u: u, c: dist[u] })
      }));
    }
    var path = dist[goal] !== null ? buildPath(from, start, goal) : null;
    if (path) {
      var hopsPath = bfsTrace(g, start, goal).path, hopCost = 0;
      for (var i = 1; i < hopsPath.length; i++) hopCost += weightOf(g, hopsPath[i - 1], hopsPath[i]);
      var text3 = t('g.d.final', { path: path.join(' → '), c: dist[goal] });
      if (hopCost > dist[goal]) text3 += t('g.d.fewest', { path: hopsPath.join(' → '), c2: hopCost });
      frames.push(snap({ ms: true, current: goal, path: path, text: text3 }));
    } else {
      frames.push(snap({ ms: true, text: t('g.d.noway') }));
    }
    return { kind: 'dij', graph: g, start: start, goal: goal, frames: frames, pseudo: pseudo('dij'), trace: { dist: dist, from: from, path: path, order: doneList } };
  }

  function edgeName(e) { return e[0] + '–' + e[1]; }
  function sortedEdges(g) {
    return g.edges.slice().sort(function (x, y) { return x[2] - y[2] || (x[0] + x[1] < y[0] + y[1] ? -1 : 1); });
  }
  function treeCost(tree) { return tree.reduce(function (s, e) { return s + e[2]; }, 0); }

  /** Prim: grow one tree from the start by always taking the cheapest path that leaves it. */
  function primFrames(g, start) {
    var all = ids(g), inT = {}, tree = [], visited = [start], frames = [], skipped = [];
    inT[start] = true;
    function leaving() {
      return sortedEdges(g).filter(function (e) { return !!inT[e[0]] !== !!inT[e[1]]; });
    }
    function el(list, chosen) {
      return list.map(function (e) { return { a: e[0], b: e[1], w: e[2], state: chosen && chosen === e ? 'take' : 'wait' }; });
    }
    function snapT(o) {
      return blank(Object.assign({
        visited: visited.slice(), tree: tree.map(function (e) { return [e[0], e[1]]; }), rejected: skipped.slice()
      }, o));
    }
    var c0 = leaving();
    frames.push(snapT({
      line: [0], ms: true, current: start, elist: el(c0),
      text: t('g.p.start', { s: start, n: all.length })
    }));
    while (visited.length < all.length) {
      var cand = leaving(), pick = cand[0], newNode = inT[pick[0]] ? pick[1] : pick[0];
      var pre = snapT({ current: null, elist: el(cand), active: cand.map(function (e) { return [e[0], e[1]]; }) });
      inT[newNode] = true; visited.push(newNode); tree.push(pick);
      var made = sortedEdges(g).filter(function (e) {
        return inT[e[0]] && inT[e[1]] && !tree.some(function (t) { return t === e; }) && !skipped.some(function (s) { return s[0] === e[0] && s[1] === e[1]; }) &&
          (e[0] === newNode || e[1] === newNode);
      });
      var f = snapT({
        line: [2, 3, 4], ms: true, current: newNode, elist: el(cand, pick),
        active: [[pick[0], pick[1]]],
        text: t('g.p.step', { list: cand.map(function (e) { return edgeName(e) + ' (' + e[2] + ')'; }).join(', '), e: edgeName(pick), w: pick[2], v: newNode }) +
          (made.length ? t('g.p.loop', { list: made.map(function (e) { return edgeName(e) + ' (' + e[2] + ')'; }).join(t('and')) }) : '')
      });
      if (cand.length > 1) {
        f.quiz = {
          view: pre,
          q: t('g.p.q'),
          options: cand.map(function (e) { return { id: edgeName(e), label: edgeName(e) + ' (' + e[2] + ')' }; }),
          answer: edgeName(pick),
          why: t('g.p.why', { e: edgeName(pick), w: pick[2] })
        };
      }
      frames.push(f);
    }
    frames.push(snapT({
      ms: true, elist: [], current: null,
      text: t('g.p.end', { n: all.length, m: tree.length, c: treeCost(tree) })
    }));
    return { kind: 'prim', graph: g, start: start, goal: null, frames: frames, pseudo: pseudo('prim'), trace: { tree: tree, cost: treeCost(tree), order: visited } };
  }

  /** Kruskal: look at paths from cheapest to most expensive; take a path unless it would make a loop. */
  function kruskalFrames(g) {
    var all = ids(g), sorted = sortedEdges(g), comp = {}, tree = [], rejected = [], frames = [], status = {};
    all.forEach(function (k) { comp[k] = k; });
    function find(x) { while (comp[x] !== x) x = comp[x]; return x; }
    function list(cur, curState) {
      return sorted.map(function (e) {
        var k = edgeName(e), st = status[k] || 'wait';
        if (cur && cur === e) st = curState;
        return { a: e[0], b: e[1], w: e[2], state: st };
      });
    }
    function snapK(o) {
      return blank(Object.assign({
        tree: tree.map(function (e) { return [e[0], e[1]]; }), rejected: rejected.map(function (e) { return [e[0], e[1]]; }),
        visited: []
      }, o));
    }
    frames.push(snapK({
      line: [0], ms: true, elist: list(),
      text: t('g.k.start', { n: sorted.length, list: sorted.map(function (e) { return edgeName(e) + ' (' + e[2] + ')'; }).join(', ') })
    }));
    for (var i = 0; i < sorted.length && tree.length < all.length - 1; i++) {
      var e = sorted[i], ra = find(e[0]), rb = find(e[1]), take = ra !== rb, name = edgeName(e);
      var pre = snapK({ elist: list(e, 'cur'), active: [[e[0], e[1]]] });
      if (take) { comp[ra] = rb; tree.push(e); status[name] = 'take'; } else { rejected.push(e); status[name] = 'skip'; }
      var f = snapK({
        line: take ? [1, 2, 3] : [1, 2, 4], ms: take || i < 6, elist: list(), active: [[e[0], e[1]]],
        text: t(take ? 'g.k.take' : 'g.k.skip', { e: name, w: e[2], a: e[0], b: e[1] })
      });
      f.quiz = {
        view: pre,
        q: t('g.k.q', { e: name, w: e[2] }),
        options: [{ id: 'take', label: t('g.k.optTake') }, { id: 'skip', label: t('g.k.optSkip') }],
        answer: take ? 'take' : 'skip',
        why: t(take ? 'g.k.whyTake' : 'g.k.whySkip', { a: e[0], b: e[1] })
      };
      frames.push(f);
    }
    frames.push(snapK({
      ms: true, elist: list(),
      text: t('g.k.end', { m: tree.length, n: all.length, c: treeCost(tree) })
    }));
    return { kind: 'kruskal', graph: g, start: null, goal: null, frames: frames, pseudo: pseudo('kruskal'), trace: { tree: tree, cost: treeCost(tree), rejected: rejected } };
  }

  /** Topological sort (Kahn): put a place in the line only when no arrow still points into it. */
  function topoOrder(g) {
    var all = ids(g), indeg = {}, out = {}, queue = [], order = [];
    all.forEach(function (k) { indeg[k] = 0; out[k] = []; });
    g.edges.forEach(function (e) { indeg[e[1]]++; out[e[0]].push(e[1]); });
    all.forEach(function (k) { out[k].sort(); if (!indeg[k]) queue.push(k); });
    while (queue.length) {
      var u = queue.shift(); order.push(u);
      out[u].forEach(function (v) { if (--indeg[v] === 0) queue.push(v); });
    }
    return order;
  }

  function topoFrames(g) {
    var all = ids(g), indeg = {}, out = {}, queue = [], order = [], placed = {}, frames = [];
    all.forEach(function (k) { indeg[k] = 0; out[k] = []; });
    g.edges.forEach(function (e) { indeg[e[1]]++; out[e[0]].push(e[1]); });
    all.forEach(function (k) { out[k].sort(); if (!indeg[k]) queue.push(k); });
    function snap(o) {
      return blank(Object.assign({ visited: order.slice(), list: queue.slice(), indeg: Object.assign({}, indeg), done: order.slice() }, o));
    }
    frames.push(snap({ line: [0, 1], ms: true, added: queue.slice(), text: t('g.t.start', { n: all.length, list: queue.join(', ') }) }));
    var step = 0;
    while (queue.length) {
      var u = queue[0];
      var blocked = all.filter(function (k) { return !placed[k] && indeg[k] > 0; });
      var askBlocked = step % 2 === 0 && blocked.length > 0, x = askBlocked ? blocked[0] : u;
      var pre = snap({ current: x, taken: null });
      queue.shift(); order.push(u); placed[u] = true;
      var f = snap({
        line: [2, 3], current: u, taken: u, list: [u].concat(queue),
        text: t('g.t.take', { p: u, k: order.length })
      });
      f.quiz = {
        view: pre,
        q: t('g.t.q', { x: x }),
        options: [{ id: 'yes', label: t('g.t.optYes') }, { id: 'no', label: t('g.t.optNo') }],
        answer: askBlocked ? 'no' : 'yes',
        why: askBlocked ? t('g.t.whyNo', { x: x, n: indeg[x] }) : t('g.t.whyYes', { x: x })
      };
      frames.push(f);
      var freed = [];
      out[u].forEach(function (v) { indeg[v]--; if (indeg[v] === 0) { queue.push(v); freed.push(v); } });
      frames.push(snap({
        line: [4, 5], ms: true, current: u, added: freed, active: out[u].map(function (v) { return [u, v]; }),
        text: out[u].length ? t(freed.length ? 'g.t.free' : 'g.t.wait', { p: u, list: freed.join(', ') }) : t('g.t.last', { p: u })
      }));
      step++;
    }
    frames.push(snap({ ms: true, text: t('g.t.end', { order: order.join(' → ') }) }));
    return { kind: 'topo', graph: g, start: null, goal: null, frames: frames, pseudo: pseudo('topo'), trace: { order: order } };
  }

  /** Bellman-Ford: go through every road again and again; stop when a whole pass changes nothing. */
  function bellmanFrames(g, start) {
    var all = ids(g), dist = {}, from = {}, frames = [], passes = 0, changes = 0;
    all.forEach(function (k) { dist[k] = null; });
    dist[start] = 0;
    function snap(o) {
      return blank(Object.assign({
        dist: Object.assign({}, dist), from: Object.assign({}, from), done: [],
        tree: Object.keys(from).map(function (v) { return [from[v], v]; })
      }, o));
    }
    frames.push(snap({ line: [0], ms: true, current: start, text: t('g.b.start', { s: start }) }));
    var changed = true;
    while (changed && passes < all.length) {
      changed = false; passes++;
      frames.push(snap({ line: [1], ms: true, text: t('g.b.pass', { p: passes }) }));
      g.edges.forEach(function (e) {
        var u = e[0], v = e[1], w = e[2], pre = snap({ active: [[u, v]] });
        if (dist[u] === null) {
          frames.push(snap({ line: [2], active: [[u, v]], text: t('g.b.skip', { u: u, v: v }) }));
          return;
        }
        var cand = dist[u] + w, old = dist[v], better = old === null || cand < old, vars = { u: u, v: v, w: w, du: dist[u], c: cand, old: old };
        if (better) { dist[v] = cand; from[v] = u; changed = true; changes++; }
        var f = snap({
          line: better ? [2, 3, 4] : [2, 3], active: [[u, v]], update: better ? v : null,
          text: t(better ? (old === null ? 'g.b.upNew' : 'g.b.upBetter') : 'g.b.upNo', vars)
        });
        f.quiz = {
          view: pre,
          q: t('g.b.q', { u: u, v: v, w: w }),
          options: [{ id: 'yes', label: t('g.b.optYes') }, { id: 'no', label: t('g.b.optNo') }],
          answer: better ? 'yes' : 'no',
          why: t(better ? 'g.b.whyYes' : 'g.b.whyNo', vars)
        };
        frames.push(f);
      });
      frames.push(snap({ line: [5], ms: true, text: t(changed ? 'g.b.again' : 'g.b.stop', { p: passes }) }));
    }
    frames.push(snap({
      ms: true, text: t('g.b.end', { list: all.map(function (k) { return k + '=' + (dist[k] === null ? '∞' : dist[k]); }).join(', '), p: passes })
    }));
    return { kind: 'bf', graph: g, start: start, goal: null, frames: frames, pseudo: pseudo('bf'), trace: { dist: dist, from: from, passes: passes } };
  }

  function graphFrames(kind, g, start, goal) {
    if (kind === 'topo') return topoFrames(g);
    if (kind === 'bf') return bellmanFrames(g, start);
    if (kind === 'dij') return dijkstraFrames(g, start, goal);
    if (kind === 'prim') return primFrames(g, start);
    if (kind === 'kruskal') return kruskalFrames(g);
    return searchFrames(kind, g, start, goal);
  }

  return {
    PLAIN: PLAIN, WEIGHTED: WEIGHTED, MST: MST, DAG: DAG, NEG: NEG, topoOrder: topoOrder, pseudo: pseudo, graphFor: graphFor, adjacency: adjacency, weightOf: weightOf,
    bfsTrace: bfsTrace, dfsTrace: dfsTrace, dijkstraCosts: dijkstraCosts, graphFrames: graphFrames
  };
});
