/* Pure algorithm logic: no DOM. Works in the browser (window.Algos) and in Node (tests). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Algos = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // up, right, down, left

  /** rows: array of strings. '#' water, '.' ice, 'S' start, 'G' goal (fish). */
  function parseGrid(rows) {
    var h = rows.length, w = rows[0].length, walls = [], start = -1, goal = -1;
    for (var y = 0; y < h; y++) {
      if (rows[y].length !== w) throw new Error('Ragged map row ' + y);
      for (var x = 0; x < w; x++) {
        var c = rows[y][x], id = y * w + x;
        walls[id] = c === '#';
        if (c === 'S') start = id;
        if (c === 'G') goal = id;
      }
    }
    if (start < 0 || goal < 0) throw new Error('Map needs S and G');
    return { w: w, h: h, walls: walls, start: start, goal: goal };
  }

  function neighbors(g, id) {
    var y = Math.floor(id / g.w), x = id % g.w, out = [];
    for (var i = 0; i < DIRS.length; i++) {
      var ny = y + DIRS[i][0], nx = x + DIRS[i][1];
      if (ny < 0 || nx < 0 || ny >= g.h || nx >= g.w) continue;
      var nid = ny * g.w + nx;
      if (!g.walls[nid]) out.push(nid);
    }
    return out;
  }

  function buildPath(parent, start, goal) {
    if (goal !== start && !(goal in parent)) return null;
    var p = [goal], c = goal;
    while (c !== start) { c = parent[c]; p.push(c); }
    return p.reverse();
  }

  /**
   * BFS with a queue. Each step: the player must pick which frontier tile is visited next.
   * step = { frontier: ids oldest->newest, answer, visitedBefore, discovered, found }
   */
  function bfsTrace(g) {
    var queue = [g.start], seen = {}, parent = {}, order = [], steps = [];
    seen[g.start] = true;
    while (queue.length) {
      var frontier = queue.slice();
      var cur = queue.shift();
      var visitedBefore = order.slice();
      order.push(cur);
      var discovered = [];
      var ns = neighbors(g, cur);
      for (var i = 0; i < ns.length; i++) {
        if (!seen[ns[i]]) { seen[ns[i]] = true; parent[ns[i]] = cur; queue.push(ns[i]); discovered.push(ns[i]); }
      }
      steps.push({ frontier: frontier, answer: cur, visitedBefore: visitedBefore, discovered: discovered, found: cur === g.goal });
      if (cur === g.goal) break;
    }
    var found = order.length && order[order.length - 1] === g.goal;
    return { steps: steps, order: order, parent: parent, found: found, path: found ? buildPath(parent, g.start, g.goal) : null };
  }

  /**
   * DFS with a stack. Neighbours are pushed so that the penguin prefers up, right, down, left.
   * frontier = distinct unvisited tiles on the stack, bottom -> top (answer is always the top).
   */
  function dfsTrace(g) {
    var stack = [{ id: g.start, from: -1 }], visited = {}, order = [], parent = {}, steps = [];
    while (stack.length) {
      while (stack.length && visited[stack[stack.length - 1].id]) stack.pop();
      if (!stack.length) break;
      var frontier = [], inF = {};
      for (var i = stack.length - 1; i >= 0; i--) {
        var sid = stack[i].id;
        if (!visited[sid] && !inF[sid]) { inF[sid] = true; frontier.unshift(sid); }
      }
      var top = stack.pop(), cur = top.id;
      var visitedBefore = order.slice();
      visited[cur] = true; order.push(cur);
      if (top.from >= 0) parent[cur] = top.from;
      var ns = neighbors(g, cur).filter(function (n) { return !visited[n]; });
      for (var j = ns.length - 1; j >= 0; j--) stack.push({ id: ns[j], from: cur });
      steps.push({ frontier: frontier, answer: cur, visitedBefore: visitedBefore, discovered: ns, found: cur === g.goal });
      if (cur === g.goal) break;
    }
    var found = order.length && order[order.length - 1] === g.goal;
    return { steps: steps, order: order, parent: parent, found: found, path: found ? buildPath(parent, g.start, g.goal) : null };
  }

  /**
   * Quick sort (Lomuto partition, pivot = last element of the range).
   * step types:
   *  compare: { lo, hi, j, i, value, pivot, smaller, before, arr, sorted }
   *  place:   { lo, hi, idx, pivot, arr, sorted }  pivot reaches its final position
   *  single:  { lo, hi, idx, arr, sorted }          one-element range is already sorted
   */
  function quickSortTrace(input) {
    var a = input.slice(), steps = [], sorted = [];
    function snap() { return a.slice(); }
    function qs(lo, hi) {
      if (lo > hi) return;
      if (lo === hi) {
        sorted.push(lo);
        steps.push({ type: 'single', lo: lo, hi: hi, idx: lo, arr: snap(), sorted: sorted.slice() });
        return;
      }
      var pivot = a[hi], i = lo - 1;
      for (var j = lo; j < hi; j++) {
        var before = snap(), smaller = a[j] < pivot, value = a[j];
        if (smaller) { i++; var t = a[i]; a[i] = a[j]; a[j] = t; }
        steps.push({ type: 'compare', lo: lo, hi: hi, j: j, i: i, value: value, pivot: pivot, smaller: smaller, before: before, arr: snap(), sorted: sorted.slice() });
      }
      var t2 = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t2;
      sorted.push(i + 1);
      steps.push({ type: 'place', lo: lo, hi: hi, idx: i + 1, pivot: pivot, arr: snap(), sorted: sorted.slice() });
      qs(lo, i);
      qs(i + 2, hi);
    }
    qs(0, a.length - 1);
    return { steps: steps, result: a, initial: input.slice() };
  }

  /**
   * Merge sort for the lessons. rows[r] = the groups after r rounds of cutting in half
   * (a group of one penguin is carried down unchanged). events = every merge, bottom rows first.
   */
  function mergeSortTrace(input) {
    var n = input.length, sortedAll = input.slice().sort(function (a, b) { return a - b; });
    var rows = [[{ lo: 0, hi: n - 1, values: input.slice(), kids: null }]];
    while (rows[rows.length - 1].some(function (g) { return g.hi > g.lo; })) {
      var cur = rows[rows.length - 1], next = [];
      cur.forEach(function (g) {
        if (g.hi > g.lo) {
          var mid = Math.floor((g.lo + g.hi) / 2);
          g.kids = [next.length, next.length + 1];
          next.push({ lo: g.lo, hi: mid, values: input.slice(g.lo, mid + 1), kids: null });
          next.push({ lo: mid + 1, hi: g.hi, values: input.slice(mid + 1, g.hi + 1), kids: null });
        } else {
          g.carry = next.length;
          next.push({ lo: g.lo, hi: g.hi, values: g.values.slice(), kids: null });
        }
      });
      rows.push(next);
    }
    function sortedOf(g) { return input.slice(g.lo, g.hi + 1).sort(function (a, b) { return a - b; }); }
    function merge(l, r) {
      var i = 0, j = 0, out = [], picks = [];
      while (i < l.length && j < r.length) {
        if (l[i] <= r[j]) { out.push(l[i]); picks.push({ v: l[i], from: 'L' }); i++; }
        else { out.push(r[j]); picks.push({ v: r[j], from: 'R' }); j++; }
      }
      while (i < l.length) { out.push(l[i]); picks.push({ v: l[i], from: 'L' }); i++; }
      while (j < r.length) { out.push(r[j]); picks.push({ v: r[j], from: 'R' }); j++; }
      return { out: out, picks: picks };
    }
    var events = [];
    for (var r = rows.length - 2; r >= 0; r--) {
      rows[r].forEach(function (g, idx) {
        if (!g.kids) return;
        var lg = rows[r + 1][g.kids[0]], rg = rows[r + 1][g.kids[1]];
        var left = sortedOf(lg), right = sortedOf(rg), m = merge(left, right);
        events.push({ row: r, idx: idx, leftIdx: g.kids[0], rightIdx: g.kids[1], lo: g.lo, hi: g.hi, left: left, right: right, result: m.out, picks: m.picks });
      });
    }
    return { rows: rows, events: events, result: sortedAll };
  }

  /** 3 stars for a perfect run, 2 for up to 2 mistakes, otherwise 1. */
  function starsFor(mistakes) { return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1; }

  return { parseGrid: parseGrid, neighbors: neighbors, bfsTrace: bfsTrace, dfsTrace: dfsTrace, quickSortTrace: quickSortTrace, mergeSortTrace: mergeSortTrace, starsFor: starsFor };
});
