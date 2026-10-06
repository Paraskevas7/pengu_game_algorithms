/* Lesson frames for the sorting algorithms (quick sort, merge sort).
   Pure logic, no DOM. Works in the browser (window.Frames) and in Node (tests). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./algos.js'), require('./i18n.js'));
  else root.Frames = factory(root.Algos, root.I18n);
})(typeof self !== 'undefined' ? self : this, function (A, I18n) {
  'use strict';
  var t = I18n.t;

  function pseudo(kind) { return t('pseudo.' + kind); }

  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }

  /* ---------- Quick sort (pivot = last penguin of the group) ---------- */
  function sortFrames(arr) {
    var n = arr.length, tr = A.quickSortTrace(arr), frames = [], comparisons = 0;
    function add(o) {
      frames.push(Object.assign({ type: 'sort', line: [], text: '', ms: false, arr: [], lo: 0, hi: n - 1, pivot: -1, cur: -1, left: [], sorted: [] }, o));
    }
    add({
      line: [0], ms: true, arr: arr.slice(),
      text: t('f.qs.start')
    });
    tr.steps.forEach(function (s) {
      if (s.type === 'compare') {
        comparisons++;
        if (s.j === s.lo) {
          add({
            line: [2], ms: true, arr: s.before, lo: s.lo, hi: s.hi, pivot: s.hi, sorted: s.sorted,
            text: t('f.qs.group', { lo: s.lo + 1, hi: s.hi + 1, p: s.pivot })
          });
        }
        add({
          line: [3, 4], arr: s.arr, lo: s.lo, hi: s.hi, pivot: s.hi, cur: s.smaller ? s.i : s.j, left: range(s.lo, s.i), sorted: s.sorted,
          text: t(s.smaller ? 'f.qs.short' : 'f.qs.tall', { v: s.value, p: s.pivot })
        });
      } else if (s.type === 'place') {
        add({
          line: [5], ms: true, arr: s.arr, lo: s.lo, hi: s.hi, pivot: s.idx, sorted: s.sorted,
          text: t('f.qs.place', { p: s.pivot })
        });
      } else {
        add({
          line: [1], arr: s.arr, lo: s.lo, hi: s.hi, cur: s.idx, sorted: s.sorted,
          text: t('f.qs.single', { v: s.arr[s.idx] })
        });
      }
    });
    add({ line: [], ms: true, arr: tr.result, sorted: range(0, n - 1), text: t('f.qs.end', { c: comparisons, n: n }) });
    return { kind: 'qs', arr: arr.slice(), frames: frames, pseudo: pseudo('qs'), trace: tr };
  }

  /* ---------- Merge sort ---------- */
  function mergeFrames(arr) {
    var tr = A.mergeSortTrace(arr), T = tr.rows, S = T.length - 1, n = arr.length, frames = [], shown = [];
    function clone(rows) {
      return rows.map(function (r) {
        return { kind: r.kind, title: r.title, groups: r.groups.map(function (g) { return { values: g.values.slice(), state: g.state, len: g.len }; }) };
      });
    }
    function add(o) { frames.push(Object.assign({ type: 'merge', line: [], text: '', ms: false, rows: [] }, o)); }
    function splitRow(r, title) {
      return { kind: 'split', title: title, groups: T[r].map(function (g) { return { values: g.values.slice(), state: 'plain', len: g.hi - g.lo + 1 }; }) };
    }

    shown.push(splitRow(0, 'The whole line'));
    add({
      line: [0], ms: true, rows: clone(shown),
      text: t('f.ms.start', { n: n })
    });
    for (var r = 1; r <= S; r++) {
      shown.push(splitRow(r, r === 1 ? 'Cut in half' : 'Cut again'));
      var text;
      if (r === S) text = t(r === 1 ? 'f.ms.cutOnly' : 'f.ms.cutEnd');
      else text = t(r === 1 ? 'f.ms.cut1' : 'f.ms.cutN');
      add({ line: r === S ? [1, 2] : [2], ms: true, rows: clone(shown), text: text });
    }

    var byRow = {};
    tr.events.forEach(function (e) { (byRow[e.row] = byRow[e.row] || []).push(e); });
    for (var m = 1; m <= S; m++) {
      var p = S - m, evs = byRow[p] || [];
      var row = {
        kind: 'merge', title: m === 1 ? 'Merge pairs' : 'Merge again',
        groups: T[p].map(function (g) { return g.kids ? { values: [], state: 'ghost', len: g.hi - g.lo + 1 } : { values: g.values.slice(), state: 'sorted', len: 1 }; })
      };
      shown.push(row);
      evs.forEach(function (e, k) {
        var view = clone(shown), src = view[view.length - 2], tgt = view[view.length - 1];
        src.groups[e.leftIdx].state = 'active';
        src.groups[e.rightIdx].state = 'active';
        tgt.groups[e.idx] = { values: e.result.slice(), state: 'active', len: e.result.length };
        var hidden = clone(view);
        hidden[hidden.length - 1].groups[e.idx] = { values: [], state: 'ghost', len: e.result.length };
        var lf = e.left[0], rt = e.right[0], first = Math.min(lf, rt);
        add({
          quiz: {
            view: { type: 'merge', line: [], text: '', ms: false, rows: hidden },
            q: t('f.ms.q'),
            options: [{ id: String(lf), label: t('f.ms.opt', { v: lf }) }, { id: String(rt), label: t('f.ms.opt', { v: rt }) }],
            answer: String(first),
            why: t('f.ms.why', { l: lf, r: rt, m: first })
          },
          line: [5, 6, 7], ms: k === evs.length - 1, rows: view,
          text: t('f.ms.merge', { l: e.left.join(', '), r: e.right.join(', '), order: e.picks.map(function (q) { return q.v; }).join(', ') })
        });
        row.groups[e.idx] = { values: e.result.slice(), state: 'sorted', len: e.result.length };
      });
    }
    add({ line: [], ms: true, rows: clone(shown), text: t('f.ms.end') });
    return { kind: 'ms', arr: arr.slice(), frames: frames, pseudo: pseudo('ms'), trace: tr };
  }

  /* ---------- Bubble sort ---------- */
  function bubbleFrames(arr) {
    var a = arr.slice(), n = a.length, frames = [], sorted = [], swaps = 0, cmps = 0;
    function add(o) {
      frames.push(Object.assign({ type: 'sort', line: [], text: '', ms: false, arr: a.slice(), lo: 0, hi: n - 1, pivot: -1, cur: -1, left: [], sorted: sorted.slice(), pair: null }, o));
    }
    add({ line: [0], ms: true, text: t('f.bs.start') });
    var allSorted = false;
    for (var pass = 1; pass < n && !allSorted; pass++) {
      var hi = n - pass, swapped = false;
      for (var i = 0; i < hi; i++) {
        cmps++;
        var x = a[i], y = a[i + 1], must = x > y;
        add({
          line: [1, 2], lo: 0, hi: hi, pair: [i, i + 1],
          text: t(must ? 'f.bs.cmpYes' : 'f.bs.cmpNo', { x: x, y: y }),
          quiz: {
            q: t('f.bs.q'),
            options: [{ id: 'yes', label: t('f.bs.optYes') }, { id: 'no', label: t('f.bs.optNo') }],
            answer: must ? 'yes' : 'no',
            why: t(must ? 'f.bs.whyYes' : 'f.bs.whyNo', { x: x, y: y })
          }
        });
        if (must) {
          a[i] = y; a[i + 1] = x; swapped = true; swaps++;
          add({ line: [3], lo: 0, hi: hi, pair: [i, i + 1], text: t('f.bs.swap') });
        }
      }
      sorted.push(hi);
      if (!swapped) {
        allSorted = true;
        sorted = range(0, n - 1);
        add({ line: [0], ms: true, text: t('f.bs.noSwap') });
      } else {
        add({ line: [4], ms: true, hi: hi - 1, text: t('f.bs.pass', { p: pass }) });
      }
    }
    sorted = range(0, n - 1);
    add({ line: [], ms: true, text: t('f.bs.end', { c: cmps, s: swaps, n: n }) });
    return { kind: 'bs', arr: arr.slice(), frames: frames, pseudo: pseudo('bs'), trace: { result: a.slice(), comparisons: cmps, swaps: swaps } };
  }

  /* ---------- Selection sort ---------- */
  function selectionFrames(arr) {
    var a = arr.slice(), n = a.length, frames = [], sorted = [], swaps = 0, cmps = 0;
    function add(o) {
      frames.push(Object.assign({ type: 'sort', line: [], text: '', ms: false, arr: a.slice(), lo: 0, hi: n - 1, pivot: -1, cur: -1, left: [], sorted: sorted.slice(), pair: null, tag: 'min' }, o));
    }
    add({ line: [0], ms: true, text: t('f.sel.start') });
    for (var p = 0; p < n - 1; p++) {
      var m = p;
      add({ line: [1], ms: true, lo: p, hi: n - 1, pivot: p, text: t('f.sel.round', { p: p + 1, v: a[p] }) });
      for (var i = p + 1; i < n; i++) {
        cmps++;
        var shorter = a[i] < a[m];
        add({
          line: [2, 3], lo: p, hi: n - 1, pivot: m, cur: i,
          text: t(shorter ? 'f.sel.new' : 'f.sel.keep', { x: a[i], m: a[m] }),
          quiz: {
            q: t('f.sel.q', { m: a[m] }),
            options: [{ id: 'yes', label: t('f.sel.optYes') }, { id: 'no', label: t('f.sel.optNo') }],
            answer: shorter ? 'yes' : 'no',
            why: t(shorter ? 'f.sel.whyYes' : 'f.sel.whyNo', { x: a[i], m: a[m] })
          }
        });
        if (shorter) m = i;
      }
      if (m !== p) {
        var tmp = a[p]; a[p] = a[m]; a[m] = tmp; swaps++;
        add({ line: [4], lo: p, hi: n - 1, pair: [p, m], text: t('f.sel.swap', { v: a[p] }) });
      }
      sorted.push(p);
      add({ line: [5], ms: true, lo: p + 1, hi: n - 1, text: t(m !== p ? 'f.sel.done' : 'f.sel.doneStay', { v: a[p] }) });
    }
    sorted = range(0, n - 1);
    add({ line: [], ms: true, text: t('f.sel.end', { c: cmps, s: swaps, n: n }) });
    return { kind: 'sel', arr: arr.slice(), frames: frames, pseudo: pseudo('sel'), trace: { result: a.slice(), comparisons: cmps, swaps: swaps } };
  }

  /* ---------- Insertion sort ---------- */
  function insertionFrames(arr) {
    var a = arr.slice(), n = a.length, frames = [], sorted = [], steps = 0, cmps = 0;
    function add(o) {
      frames.push(Object.assign({ type: 'sort', line: [], text: '', ms: false, arr: a.slice(), lo: 0, hi: n - 1, pivot: -1, cur: -1, left: [], sorted: sorted.slice(), pair: null, tag: '' }, o));
    }
    add({ line: [0], ms: true, left: [0], text: t('f.ins.start', { v: a[0] }) });
    for (var i = 1; i < n; i++) {
      var key = a[i], j = i;
      add({ line: [1], ms: true, cur: i, left: range(0, i - 1), text: t('f.ins.pick', { v: key }) });
      while (j > 0) {
        cmps++;
        var must = a[j - 1] > a[j];
        add({
          line: [2, 3], pair: [j - 1, j], left: range(0, i),
          text: t(must ? 'f.ins.cmpYes' : 'f.ins.cmpNo', { x: a[j - 1], v: key }),
          quiz: {
            q: t('f.ins.q', { v: key }),
            options: [{ id: 'yes', label: t('f.ins.optYes') }, { id: 'no', label: t('f.ins.optNo') }],
            answer: must ? 'yes' : 'no',
            why: t(must ? 'f.ins.whyYes' : 'f.ins.whyNo', { x: a[j - 1], v: key })
          }
        });
        if (!must) break;
        var tmp = a[j - 1]; a[j - 1] = a[j]; a[j] = tmp; j--; steps++;
        add({ line: [4], pair: [j, j + 1], left: range(0, i), text: t('f.ins.step', { v: key }) });
      }
      add({ line: [5], ms: true, left: range(0, i), text: t(j === 0 ? 'f.ins.front' : 'f.ins.placed', { v: key, k: i + 1 }) });
    }
    sorted = range(0, n - 1);
    add({ line: [], ms: true, text: t('f.ins.end', { c: cmps, s: steps, n: n }) });
    return { kind: 'ins', arr: arr.slice(), frames: frames, pseudo: pseudo('ins'), trace: { result: a.slice(), comparisons: cmps, steps: steps } };
  }

  /* ---------- Stack and queue (the same jobs, two different piles) ---------- */
  var DS_OPS = [['add', 'A'], ['add', 'B'], ['add', 'C'], ['add', 'D'], ['take'], ['take'], ['add', 'E'], ['take'], ['take']];
  function dsFrames() {
    var q = [], st = [], frames = [], takes = 0;
    function add(o) {
      frames.push(Object.assign({ type: 'ds', line: [], text: '', ms: false, queue: q.slice(), stack: st.slice(), outQ: null, outS: null, newId: null }, o));
    }
    add({ line: [], ms: true, text: t('f.sq.start') });
    DS_OPS.forEach(function (op, k) {
      if (op[0] === 'add') {
        q.push(op[1]); st.push(op[1]);
        add({ line: [0, 2], newId: op[1], ms: k === 3, text: t('f.sq.add', { p: op[1] }) });
      } else {
        takes++;
        var askQueue = takes % 2 === 1, pre = frames[frames.length - 1];
        var fromQ = q.shift(), fromS = st.pop();
        var f = {
          line: [1, 3], outQ: fromQ, outS: fromS, ms: true,
          text: t('f.sq.take', { q: fromQ, s: fromS })
        };
        var listBefore = askQueue ? pre.queue : pre.stack;
        f.quiz = {
          view: pre,
          q: t(askQueue ? 'f.sq.qQ' : 'f.sq.qS'),
          options: listBefore.map(function (id) { return { id: id, label: t('f.sq.opt', { p: id }) }; }),
          answer: askQueue ? fromQ : fromS,
          why: t(askQueue ? 'f.sq.whyQ' : 'f.sq.whyS', { p: askQueue ? fromQ : fromS })
        };
        add(f);
      }
    });
    add({ ms: true, text: t('f.sq.end') });
    return { kind: 'sq', frames: frames, pseudo: pseudo('sq'), trace: { takes: takes } };
  }

  /* ---------- Heap (the shortest penguin is always at the top) ---------- */
  function heapFrames(arr) {
    var a = [], frames = [], swaps = 0;
    function add(o) {
      frames.push(Object.assign({ type: 'heap', line: [], text: '', ms: false, arr: a.slice(), cur: -1, pair: null }, o));
    }
    add({ line: [0], ms: true, text: t('f.hp.start', { n: arr.length }) });
    arr.forEach(function (v) {
      a.push(v);
      var i = a.length - 1;
      add({ line: [1], cur: i, text: t(i === 0 ? 'f.hp.root' : 'f.hp.put', { v: v }) });
      while (i > 0) {
        var par = (i - 1) >> 1, must = a[i] < a[par];
        add({
          line: [2], cur: i, pair: [par, i],
          text: t(must ? 'f.hp.cmpYes' : 'f.hp.cmpNo', { v: a[i], p: a[par] }),
          quiz: {
            q: t('f.hp.q', { v: a[i], p: a[par] }),
            options: [{ id: 'yes', label: t('f.hp.optYes') }, { id: 'no', label: t('f.hp.optNo') }],
            answer: must ? 'yes' : 'no',
            why: t(must ? 'f.hp.whyYes' : 'f.hp.whyNo', { v: a[i], p: a[par] })
          }
        });
        if (!must) break;
        var tmp = a[i]; a[i] = a[par]; a[par] = tmp; swaps++; i = par;
        add({ line: [3], cur: i, text: t('f.hp.swapUp', { v: a[i] }) });
      }
      add({ line: [], ms: true, cur: i, text: t('f.hp.settled', { v: v, k: a.length }) });
    });
    var built = a.slice();
    var top = a[0];
    add({ line: [4], ms: true, cur: 0, text: t('f.hp.out', { v: top }) });
    var last = a.pop();
    if (a.length) {
      a[0] = last;
      add({ line: [4], cur: 0, text: t('f.hp.moveLast', { v: last }) });
      var i2 = 0;
      for (;;) {
        var l = 2 * i2 + 1, r = l + 1;
        if (l >= a.length) break;
        var c = r < a.length && a[r] < a[l] ? r : l, must2 = a[c] < a[i2];
        add({
          line: [5], cur: i2, pair: [i2, c],
          text: t(must2 ? 'f.hp.downYes' : 'f.hp.downNo', { v: a[i2], c: a[c] }),
          quiz: {
            q: t('f.hp.qDown', { v: a[i2], c: a[c] }),
            options: [{ id: 'yes', label: t('f.hp.optYes') }, { id: 'no', label: t('f.hp.optNo') }],
            answer: must2 ? 'yes' : 'no',
            why: t(must2 ? 'f.hp.whyDownYes' : 'f.hp.whyDownNo', { v: a[i2], c: a[c] })
          }
        });
        if (!must2) break;
        var tmp2 = a[i2]; a[i2] = a[c]; a[c] = tmp2; swaps++; i2 = c;
        add({ line: [6], cur: i2, text: t('f.hp.swapDown', { v: a[i2] }) });
      }
    }
    add({ line: [], ms: true, text: t('f.hp.end', { top: a.length ? a[0] : top, n: arr.length, out: top }) });
    return { kind: 'heap', arr: arr.slice(), frames: frames, pseudo: pseudo('heap'), trace: { built: built, out: top, rest: a.slice(), swaps: swaps } };
  }

  /* ---------- Beginner lessons: binary numbers, loops, variables ---------- */
  var PROG_EX = {
    bits: [{ key: 'l.exNum', vars: { v: 5 }, n: 5 }, { key: 'l.exNum', vars: { v: 9 }, n: 9 }, { key: 'l.exNum', vars: { v: 13 }, n: 13 }],
    loop: [{ key: 'l.exCount', vars: { v: 3 }, n: 3 }, { key: 'l.exCount', vars: { v: 5 }, n: 5 }, { key: 'l.exCount', vars: { v: 6 }, n: 6 }],
    vars: [
      { key: 'l.exFish', vars: {}, lines: ['fish = 3', 'fish = fish + 2', 'friend = fish', 'fish = fish + 1'] },
      { key: 'l.exSwap', vars: {}, lines: ['a = 3', 'b = 5', 'temp = a', 'a = b', 'b = temp'] }
    ],
    cond: [
      { key: 'l.exTemps', vars: { list: '-5, 6, 15' }, vs: [-5, 6, 15] },
      { key: 'l.exTemps', vars: { list: '10, 0, -3, 7' }, vs: [10, 0, -3, 7] },
      { key: 'l.exTemps', vars: { list: '3, 12, -8' }, vs: [3, 12, -8] }
    ],
    bug: [
      { key: 'l.exBug1', vars: {}, lines: ['total = 0', 'total = total + 1', 'total = total + 2', 'total = total + 2'], bug: 3, fixed: ['total = 0', 'total = total + 1', 'total = total + 2', 'total = total + 3'], expect: { total: 6 }, goal: 'l.bugGoal1' },
      { key: 'l.exBug2', vars: {}, lines: ['a = 3', 'b = 5', 'a = b', 'b = a'], bug: 2, fixed: ['a = 3', 'b = 5', 'temp = a', 'a = b', 'b = temp'], expect: { a: 5, b: 3 }, goal: 'l.bugGoal2' },
      { key: 'l.exBug3', vars: {}, lines: ['fish = 4', 'fish = fish - 1', 'fish = fish - 2'], bug: 2, fixed: ['fish = 4', 'fish = fish - 1', 'fish = fish + 2'], expect: { fish: 5 }, goal: 'l.bugGoal3' }
    ],
    race: [
      { key: 'l.exSizes', vars: { list: '2, 4, 8, 16' }, sizes: [2, 4, 8, 16] },
      { key: 'l.exSizes', vars: { list: '8, 16, 32, 64' }, sizes: [8, 16, 32, 64] },
      { key: 'l.exSizes', vars: { list: '16, 64, 256, 1024' }, sizes: [16, 64, 256, 1024] }
    ],
    rep: [
      { key: 'l.exRepWord', vars: { w: 'ICE' }, mode: 'word', word: 'ICE' },
      { key: 'l.exRepWord', vars: { w: 'FISH' }, mode: 'word', word: 'FISH' },
      { key: 'l.exSmile', vars: {}, mode: 'pix', rows: ['01010', '01010', '00000', '10001', '01110'] },
      { key: 'l.exTee', vars: {}, mode: 'pix', rows: ['11111', '00100', '00100', '00100', '00100'] }
    ],
    net: [
      { key: 'l.exMsg', vars: { m: 'HI FRIEND' }, msg: 'HI FRIEND', size: 3, order: [2, 0, 1], lost: 0 },
      { key: 'l.exMsg', vars: { m: 'WADDLE HOME!' }, msg: 'WADDLE HOME!', size: 3, order: [3, 1, 0, 2], lost: 1 },
      { key: 'l.exMsg', vars: { m: 'SEE YOU SOON' }, msg: 'SEE YOU SOON', size: 4, order: [1, 2, 0], lost: 2 }
    ],
    ai: [
      { key: 'l.exNew', vars: { list: '1, 2, 3' }, tests: [0, 1, 2] },
      { key: 'l.exNew', vars: { list: '4, 5, 6' }, tests: [3, 4, 5] },
      { key: 'l.exNew', vars: { list: '3, 1, 6' }, tests: [2, 0, 5] }
    ],
    data: [
      { key: 'l.exFishDays', vars: { n: 1 }, vals: [4, 7, 3, 9, 7] },
      { key: 'l.exFishDays', vars: { n: 2 }, vals: [2, 6, 3, 5, 4] },
      { key: 'l.exFishDays', vars: { n: 3 }, vals: [6, 10, 4, 8, 7] }
    ],
    cipher: [
      { key: 'l.exWord', vars: { w: 'ICE', s: 3 }, word: 'ICE', shift: 3 },
      { key: 'l.exWord', vars: { w: 'FISH', s: 1 }, word: 'FISH', shift: 1 },
      { key: 'l.exWord', vars: { w: 'SNOW', s: 5 }, word: 'SNOW', shift: 5 }
    ]
  };

  function numOptions(right, old) {
    var set = {};
    [right, old === right ? right + 1 : old, right + 1, right - 1, right + 2].forEach(function (v) { if (v >= 0 && Object.keys(set).length < 3) set[v] = true; });
    set[right] = true;
    return Object.keys(set).map(Number).sort(function (a, b) { return a - b; }).slice(0, 4).map(function (v) { return { id: String(v), label: String(v) }; });
  }

  /** Run a tiny program of "name = expression" lines and return the boxes in the order they were made. */
  function runLines(lines) {
    var boxes = [];
    function val(n) { for (var q = 0; q < boxes.length; q++) if (boxes[q].name === n) return boxes[q].value; return 0; }
    lines.forEach(function (ln) {
      var m = /^(\w+) = (.+)$/.exec(ln), calc = m[2].replace(/[a-z]\w*/g, function (id) { return String(val(id)); });
      var v = Function('"use strict";return (' + calc + ')')(), hit = false;
      boxes.forEach(function (b) { if (b.name === m[1]) { b.value = v; hit = true; } });
      if (!hit) boxes.push({ name: m[1], value: v });
    });
    return boxes;
  }
  function boxText(obj) { return Object.keys(obj).map(function (k) { return k + ' = ' + obj[k]; }).join(', '); }

  /* If / else: three penguins arrive with a temperature and the program decides what to wear. */
  var COND_RULES = [{ lim: 0, act: 'scarf' }, { lim: 10, act: 'hat' }];
  function condRows(cur, res, taken) {
    return COND_RULES.map(function (r, k) { return { c: 'temp < ' + r.lim, lim: r.lim, act: r.act, res: res[k], cur: cur === k }; })
      .concat([{ c: 'else', act: 'swim', res: res[2], cur: cur === 2 }]).map(function (r, k) { r.taken = taken === k; return r; });
  }
  function condFrames(E) {
    var frames = [], first = true;
    function add(o) { frames.push(Object.assign({ type: 'prog', kind: 'cond', line: [], text: '', ms: false }, o)); }
    E.vs.forEach(function (v, who) {
      var res = [null, null, null];
      add({ v: v, rows: condRows(-1, res, -1), line: [], ms: first || who === E.vs.length - 1, text: t(first ? 'f.cond.start' : 'f.cond.next', { v: v }) });
      first = false;
      for (var k = 0; k < COND_RULES.length; k++) {
        var r = COND_RULES[k], yes = v < r.lim, before = res.slice();
        add({
          v: v, rows: condRows(k, before, -1), line: [k * 2], text: t('f.cond.check', { v: v, lim: r.lim }),
          quiz: {
            view: { type: 'prog', kind: 'cond', v: v, rows: condRows(k, before, -1), line: [k * 2], text: '', ms: false },
            q: t('f.cond.q', { v: v, lim: r.lim }),
            options: [{ id: 'yes', label: t('f.cond.optYes') }, { id: 'no', label: t('f.cond.optNo') }],
            answer: yes ? 'yes' : 'no', why: t(yes ? 'f.cond.whyYes' : 'f.cond.whyNo', { v: v, lim: r.lim })
          }
        });
        res[k] = yes;
        if (yes) {
          add({ v: v, rows: condRows(k, res, k), line: [k * 2, k * 2 + 1], ms: true, text: t('f.cond.yes', { v: v, lim: r.lim, act: t('d.cond.' + r.act) }) });
          break;
        }
        add({ v: v, rows: condRows(k, res, -1), line: [k * 2], text: t('f.cond.no', { v: v, lim: r.lim }) });
      }
      if (res[0] !== true && res[1] !== true) {
        res[2] = true;
        add({ v: v, rows: condRows(2, res, 2), line: [4, 5], ms: true, text: t('f.cond.else', { v: v, act: t('d.cond.swim') }) });
      }
    });
    add({ v: E.vs[E.vs.length - 1], rows: condRows(-1, [null, null, null], -1), line: [], ms: true, done: true, text: t('f.cond.end') });
    return { kind: 'cond', frames: frames, pseudo: pseudo('cond'), trace: { acts: E.vs.map(function (v) { return v < 0 ? 'scarf' : v < 10 ? 'hat' : 'swim'; }) } };
  }

  /* Find the bug: run a program that gives the wrong answer, then find the broken line. */
  function bugFrames(E) {
    var frames = [], lines = E.lines, boxes = [], names = [];
    function add(o) { frames.push(Object.assign({ type: 'prog', kind: 'bug', line: [], text: '', ms: false, expect: boxText(E.expect), lines: lines }, o)); }
    function val(n) { for (var q = 0; q < boxes.length; q++) if (boxes[q].name === n) return boxes[q].value; return 0; }
    function snap(ch) { return boxes.map(function (b) { return { name: b.name, value: b.value, changed: b.name === ch }; }); }
    add({ boxes: [], ms: true, text: t('f.bug.start', { goal: t(E.goal), want: boxText(E.expect) }) });
    lines.forEach(function (ln, k) {
      var m = /^(\w+) = (.+)$/.exec(ln), name = m[1], rhs = m[2];
      var calc = rhs.replace(/[a-z]\w*/g, function (id) { return String(val(id)); });
      var value = Function('"use strict";return (' + calc + ')')(), existing = names.indexOf(name) >= 0, oldv = existing ? val(name) : 0, pre = frames[frames.length - 1];
      if (!existing) { names.push(name); boxes.push({ name: name, value: value }); } else boxes.forEach(function (b) { if (b.name === name) b.value = value; });
      var simple = /^\d+$/.test(rhs), f = { boxes: snap(name), line: [k], ms: k === lines.length - 1, text: t(simple ? 'f.var.num' : 'f.var.calc', { name: name, rhs: rhs, calc: calc, v: value }) };
      if (!simple) f.quiz = { view: Object.assign({}, pre, { line: [k], highlight: name }), q: t('f.var.q', { name: name, line: ln }), options: numOptions(value, oldv), answer: String(value), why: t('f.var.why', { name: name, calc: calc, v: value }) };
      add(f);
    });
    var got = boxes.map(function (b) { return [b.name, b.value]; }), gotText = boxes.map(function (b) { return b.name + ' = ' + b.value; }).join(', ');
    var cand = [E.bug].concat(lines.map(function (_, i) { return i; }).filter(function (i) { return i !== E.bug; }).slice(0, 2)).sort(function (a, b) { return a - b; });
    add({
      boxes: snap(null), line: [], ms: true, text: t('f.bug.wrong', { got: gotText, want: boxText(E.expect) }),
      quiz: {
        view: { type: 'prog', kind: 'bug', boxes: snap(null), line: [], lines: lines, expect: boxText(E.expect), text: '', ms: false },
        q: t('f.bug.q', { got: gotText, want: boxText(E.expect) }),
        options: cand.map(function (i) { return { id: String(i), label: lines[i] }; }),
        answer: String(E.bug), why: t('f.bug.why', { line: lines[E.bug] })
      }
    });
    var fixedBoxes = runLines(E.fixed).map(function (b) { return { name: b.name, value: b.value, changed: false }; });
    var fixedText = fixedBoxes.map(function (b) { return b.name + ' = ' + b.value; }).join(', ');
    add({ boxes: fixedBoxes, lines: E.fixed, line: [], badLine: -1, fixedRun: true, ms: true, text: t('f.bug.fixed', { fix: E.fixed.join(' / '), list: fixedText }) });
    frames[frames.length - 2].badLine = E.bug;
    return { kind: 'bug', frames: frames, pseudo: lines, trace: { got: got, bug: E.bug, fixedOk: Object.keys(E.expect).every(function (k) { return fixedBoxes.some(function (b) { return b.name === k && b.value === E.expect[k]; }); }) } };
  }

  /* Speed race: how many steps do three different penguins need as the pile gets bigger? */
  function raceSteps(n) { return { walk: n, wad: n * n, slide: Math.ceil(Math.log2(n)) }; }
  function raceFrames(E) {
    var frames = [], ids = ['walk', 'wad', 'slide'];
    function add(o) { frames.push(Object.assign({ type: 'prog', kind: 'race', line: [], text: '', ms: false }, o)); }
    function rows(n, hide) { var s = raceSteps(n); return ids.map(function (id) { return { id: id, steps: s[id], hide: hide === id }; }); }
    add({ n: 0, rows: ids.map(function (id) { return { id: id, steps: 0, hide: false }; }), line: [0], ms: true, text: t('f.race.start') });
    E.sizes.forEach(function (n, k) {
      var s = raceSteps(n), ask = ids[k % 3], right = s[ask], set = {};
      [s.walk, s.wad, s.slide, right * 2].forEach(function (v) { set[v] = true; });
      var opts = Object.keys(set).map(Number).sort(function (a, b) { return a - b; }).slice(0, 4);
      if (opts.indexOf(right) < 0) opts[opts.length - 1] = right;
      opts.sort(function (a, b) { return a - b; });
      add({
        n: n, rows: rows(n, null), line: [1, 2], ms: k === 0 || k === E.sizes.length - 1,
        text: t('f.race.size', { n: n, walk: s.walk, wad: s.wad, slide: s.slide }),
        quiz: {
          view: { type: 'prog', kind: 'race', n: n, rows: rows(n, ask), line: [1, 2], text: '', ms: false },
          q: t('f.race.q', { n: n, who: t('d.who.' + ask) }),
          options: opts.map(function (v) { return { id: String(v), label: String(v) }; }),
          answer: String(right), why: t('f.race.why.' + ask, { n: n, v: right })
        }
      });
    });
    var big = E.sizes[E.sizes.length - 1], b = raceSteps(big);
    add({ n: big, rows: rows(big, null), line: [3], ms: true, text: t('f.race.end', { n: big, walk: b.walk, wad: b.wad, slide: b.slide }) });
    return { kind: 'race', frames: frames, pseudo: pseudo('race'), trace: { last: b } };
  }

  /* Secret messages: the Caesar cipher moves every letter forward along the alphabet. */
  var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function shiftLetter(ch, s) { return ABC[(ABC.indexOf(ch) + s) % 26]; }
  function cipherFrames(E) {
    var frames = [], out = [];
    function add(o) { frames.push(Object.assign({ type: 'prog', kind: 'cipher', word: E.word, shift: E.shift, line: [], text: '', ms: false, out: out.slice(), from: '', to: '' }, o)); }
    add({ line: [0], ms: true, text: t('f.cip.start', { w: E.word, s: E.shift }) });
    E.word.split('').forEach(function (ch, k) {
      var to = shiftLetter(ch, E.shift), wrap = ABC.indexOf(ch) + E.shift >= 26, pre = out.slice();
      var set = {}; [to, shiftLetter(to, 1), shiftLetter(to, 25), ch].forEach(function (x) { set[x] = true; });
      var opts = Object.keys(set).sort();
      out.push(to);
      add({
        out: out.slice(), idx: k, from: ch, to: to, line: wrap ? [1, 2, 3] : [1, 3], ms: k === 0 || k === E.word.length - 1 || wrap,
        text: t(wrap ? 'f.cip.wrap' : 'f.cip.move', { from: ch, to: to, s: E.shift }),
        quiz: {
          view: { type: 'prog', kind: 'cipher', word: E.word, shift: E.shift, out: pre, idx: k, from: ch, to: '', line: [1], text: '', ms: false },
          q: t('f.cip.q', { from: ch, s: E.shift }),
          options: opts.map(function (v) { return { id: v, label: v }; }),
          answer: to, why: t(wrap ? 'f.cip.whyWrap' : 'f.cip.why', { from: ch, to: to, s: E.shift })
        }
      });
    });
    add({ out: out.slice(), idx: -1, line: [], ms: true, text: t('f.cip.end', { w: E.word, c: out.join(''), s: E.shift }) });
    return { kind: 'cipher', frames: frames, pseudo: pseudo('cipher'), trace: { cipher: out.join('') } };
  }

  /* Letters and pictures as numbers: a letter is its place in the alphabet, a picture is a grid of 0s and 1s. */
  function bin5(n) { return ('00000' + n.toString(2)).slice(-5); }
  function flipBit(str, k) { return str.slice(0, k) + (str[k] === '1' ? '0' : '1') + str.slice(k + 1); }
  function repFrames(E) {
    var frames = [];
    function add(o) { frames.push(Object.assign({ type: 'prog', kind: 'rep', mode: E.mode, line: [], text: '', ms: false }, o)); }
    if (E.mode === 'word') {
      var codes = [], last = E.word.length - 1;
      add({ word: E.word, codes: [], idx: -1, line: [0], ms: true, text: t('f.rep.wstart', { w: E.word }) });
      E.word.split('').forEach(function (ch, k) {
        var n = ABC.indexOf(ch) + 1, b = bin5(n);
        var view = { type: 'prog', kind: 'rep', mode: 'word', word: E.word, codes: codes.slice(), idx: k, hide: true, line: [1], text: '', ms: false };
        codes.push({ n: n, bin: b });
        add({ word: E.word, codes: codes.slice(), idx: k, line: [1, 2], ms: k === 0 || k === last, text: t('f.rep.letter', { c: ch, n: n, bin: b }),
          quiz: { view: view, q: t('f.rep.q', { c: ch }), options: numOptions(n, n - 1 > 0 ? n - 1 : n + 3), answer: String(n), why: t('f.rep.why', { c: ch, n: n }) } });
      });
      add({ word: E.word, codes: codes.slice(), idx: -1, line: [], ms: true, text: t('f.rep.wend', { w: E.word, list: codes.map(function (c) { return c.n; }).join(', ') }) });
      return { kind: 'rep', frames: frames, pseudo: pseudo('rep'), trace: { nums: codes.map(function (c) { return c.n; }), bins: codes.map(function (c) { return c.bin; }) } };
    }
    var done = [], rows = E.rows;
    add({ rows: rows, done: [], idx: -1, line: [3], ms: true, text: t('f.rep.pstart') });
    rows.forEach(function (r, k) {
      var opts = [r, flipBit(r, k % 5), r.split('').map(function (c) { return c === '1' ? '0' : '1'; }).join('')];
      opts = opts.filter(function (v, i) { return opts.indexOf(v) === i; }).sort();
      var view = { type: 'prog', kind: 'rep', mode: 'pix', rows: rows, done: done.slice(), idx: k, hide: true, line: [3], text: '', ms: false };
      done.push(r);
      add({ rows: rows, done: done.slice(), idx: k, line: [3], ms: k === 0 || k === rows.length - 1, text: t('f.rep.row', { k: k + 1, bits: r }),
        quiz: { view: view, q: t('f.rep.pq', { k: k + 1 }), options: opts.map(function (v) { return { id: v, label: v }; }), answer: r, why: t('f.rep.pwhy', { k: k + 1, bits: r }) } });
    });
    add({ rows: rows, done: done.slice(), idx: -1, line: [], ms: true, text: t('f.rep.pend') });
    return { kind: 'rep', frames: frames, pseudo: pseudo('rep'), trace: { rows: rows.slice() } };
  }

  /* The internet: a message is cut into numbered packets, they travel separately and are put back in order. */
  function netPackets(E) {
    var out = [];
    for (var i = 0; i < E.msg.length; i += E.size) out.push({ n: out.length + 1, txt: E.msg.slice(i, i + E.size) });
    return out;
  }
  function netFrames(E) {
    var frames = [], pk = netPackets(E), where = pk.map(function () { return 's'; }), recv = [];
    function add(o) { frames.push(Object.assign({ type: 'prog', kind: 'net', line: [], text: '', ms: false, msg: E.msg, pk: pk, where: where.slice(), recv: recv.slice(), sorted: false, split: true }, o)); }
    var ROUTES = ['A', 'B', 'C'];
    add({ split: false, line: [], ms: true, text: t('f.net.start', { m: E.msg }) });
    var cnt = {}; [pk.length, pk.length + 1, pk.length - 1, pk.length + 2].forEach(function (v) { if (v > 0) cnt[v] = true; });
    var nopts = Object.keys(cnt).map(Number).sort(function (a, b) { return a - b; }).slice(0, 4);
    if (nopts.indexOf(pk.length) < 0) nopts[0] = pk.length;
    add({ line: [0, 1], ms: true, text: t('f.net.split', { size: E.size, n: pk.length }),
      quiz: { view: { type: 'prog', kind: 'net', msg: E.msg, pk: pk, where: where.slice(), recv: [], sorted: false, split: false, line: [0], text: '', ms: false },
        q: t('f.net.q1', { len: E.msg.length, size: E.size }), options: nopts.map(function (v) { return { id: String(v), label: String(v) }; }), answer: String(pk.length), why: t('f.net.why1', { len: E.msg.length, size: E.size, n: pk.length }) } });
    var lostN = E.lost + 1, arrive = E.order.filter(function (i) { return i !== E.lost; });
    arrive.forEach(function (i, j) {
      var n = i + 1; where[i] = 'r'; recv.push(n);
      add({ line: [2], ms: j === 0, text: t('f.net.arrive', { n: n, route: ROUTES[i % 3], txt: pk[i].txt.replace(/ /g, '·') }) });
    });
    where[E.lost] = 'x';
    add({ line: [4], ms: true, text: t('f.net.lost', { n: lostN }),
      quiz: { view: { type: 'prog', kind: 'net', msg: E.msg, pk: pk, where: where.slice(), recv: recv.slice(), sorted: false, split: true, line: [4], text: '', ms: false },
        q: t('f.net.q2', { n: lostN }), options: [{ id: 'again', label: t('f.net.o2a') }, { id: 'guess', label: t('f.net.o2b') }, { id: 'drop', label: t('f.net.o2c') }], answer: 'again', why: t('f.net.why2') } });
    where[E.lost] = 'r'; recv.push(lostN);
    add({ line: [4, 2], text: t('f.net.again', { n: lostN }) });
    var rest = recv.slice(), first = Math.min.apply(null, rest);
    var nums = {}; rest.forEach(function (v) { nums[v] = true; });
    add({ line: [3], ms: true, text: t('f.net.mixed', { list: rest.join(', ') }),
      quiz: { view: { type: 'prog', kind: 'net', msg: E.msg, pk: pk, where: where.slice(), recv: recv.slice(), sorted: false, split: true, line: [3], text: '', ms: false },
        q: t('f.net.q3', { list: rest.join(', ') }), options: Object.keys(nums).map(Number).sort(function (a, b) { return a - b; }).slice(0, 4).map(function (v) { return { id: String(v), label: '#' + v }; }), answer: String(first), why: t('f.net.why3') } });
    add({ sorted: true, line: [3], ms: true, text: t('f.net.end', { m: E.msg }) });
    return { kind: 'net', frames: frames, pseudo: pseudo('net'), trace: { packets: pk.map(function (p) { return p.txt; }), rebuilt: pk.map(function (p) { return p.txt; }).join('') } };
  }

  /* Teach the computer: the nearest labelled example decides the group of a new penguin. */
  var AI_TRAIN = [
    { id: 'A', x: 1.5, y: 2, g: 'small' }, { id: 'B', x: 3, y: 3.5, g: 'small' }, { id: 'C', x: 2, y: 5, g: 'small' }, { id: 'D', x: 4.5, y: 2.5, g: 'small' },
    { id: 'E', x: 7, y: 7.5, g: 'big' }, { id: 'F', x: 8.5, y: 5, g: 'big' }, { id: 'G', x: 6.5, y: 5.5, g: 'big' }, { id: 'H', x: 9, y: 8.5, g: 'big' }
  ];
  var AI_TESTS = [{ x: 3.5, y: 3 }, { x: 7.5, y: 6.5 }, { x: 5.5, y: 3.8 }, { x: 6, y: 4.5 }, { x: 2.5, y: 6 }, { x: 8, y: 7 }];
  function aiRank(p) {
    return AI_TRAIN.map(function (q) { return { id: q.id, g: q.g, d: Math.sqrt((q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y)) }; }).sort(function (a, b) { return a.d - b.d; });
  }
  function aiFrames(E) {
    var frames = [];
    function add(o) { frames.push(Object.assign({ type: 'prog', kind: 'ai', train: AI_TRAIN, test: null, near: [], pick: '', guess: '', line: [], text: '', ms: false }, o)); }
    add({ line: [], ms: true, text: t('f.ai.start') });
    var guesses = [];
    E.tests.forEach(function (ti, k) {
      var p = AI_TESTS[ti], rank = aiRank(p), top = rank.slice(0, 3), best = top[0], name = t('d.ai.' + best.g);
      add({ test: p, line: [0], ms: k === 0, text: t('f.ai.new', { x: p.x, y: p.y }) });
      var ids = top.map(function (r) { return r.id; }).sort();
      add({ test: p, near: top, line: [1, 2], text: t('f.ai.measure', { list: top.map(function (r) { return r.id + ' = ' + r.d.toFixed(1); }).join(', ') }),
        quiz: { view: { type: 'prog', kind: 'ai', train: AI_TRAIN, test: p, near: [], pick: '', guess: '', line: [1], text: '', ms: false }, q: t('f.ai.q1'), options: ids.map(function (v) { return { id: v, label: v }; }), answer: best.id, why: t('f.ai.why1', { id: best.id, d: best.d.toFixed(1) }) } });
      guesses.push(best.g);
      add({ test: p, near: top, pick: best.id, guess: best.g, line: [2, 3], ms: true, text: t('f.ai.pick', { id: best.id, g: name }),
        quiz: { view: { type: 'prog', kind: 'ai', train: AI_TRAIN, test: p, near: top, pick: best.id, guess: '', line: [3], text: '', ms: false }, q: t('f.ai.q2', { id: best.id }), options: [{ id: 'small', label: t('d.ai.small') }, { id: 'big', label: t('d.ai.big') }], answer: best.g, why: t('f.ai.why2', { id: best.id, g: name }) } });
    });
    add({ test: null, line: [], ms: true, text: t('f.ai.end') });
    return { kind: 'ai', frames: frames, pseudo: pseudo('ai'), trace: { guesses: guesses } };
  }

  /* Data detective: a table of numbers, a bar chart, the biggest, the smallest, the total and the average. */
  function dataFrames(E) {
    var frames = [], v = E.vals, n = v.length, sum = 0;
    function add(o) { frames.push(Object.assign({ type: 'prog', kind: 'data', vals: v, hi: -1, lo: -1, upto: n, total: null, avg: null, line: [], text: '', ms: false }, o)); }
    var maxI = v.indexOf(Math.max.apply(null, v)), minI = v.indexOf(Math.min.apply(null, v));
    function dayOpts(right) { var all = [0, 1, 2, 3, 4].slice(0, n), pick = [right].concat(all.filter(function (i) { return i !== right; }).slice(0, 2)).sort(function (a, b) { return a - b; }); return pick.map(function (i) { return { id: String(i), label: t('d.day.' + i) }; }); }
    add({ line: [0, 1], ms: true, text: t('f.data.start') });
    add({ hi: maxI, line: [2], ms: true, text: t('f.data.max', { day: t('d.day.' + maxI), v: v[maxI] }),
      quiz: { view: { type: 'prog', kind: 'data', vals: v, hi: -1, lo: -1, upto: n, total: null, avg: null, line: [2], text: '', ms: false }, q: t('f.data.q1'), options: dayOpts(maxI), answer: String(maxI), why: t('f.data.why1', { day: t('d.day.' + maxI), v: v[maxI] }) } });
    add({ lo: minI, line: [2], text: t('f.data.min', { day: t('d.day.' + minI), v: v[minI] }),
      quiz: { view: { type: 'prog', kind: 'data', vals: v, hi: -1, lo: -1, upto: n, total: null, avg: null, line: [2], text: '', ms: false }, q: t('f.data.q2'), options: dayOpts(minI), answer: String(minI), why: t('f.data.why2', { day: t('d.day.' + minI), v: v[minI] }) } });
    v.forEach(function (x, i) {
      var old = sum; sum += x;
      var f = { upto: i + 1, total: sum, line: [3], ms: i === n - 1, text: t('f.data.add', { day: t('d.day.' + i), v: x, old: old, new: sum }) };
      if (i === 2 || i === n - 1) f.quiz = { view: { type: 'prog', kind: 'data', vals: v, hi: -1, lo: -1, upto: i + 1, total: old, avg: null, line: [3], text: '', ms: false, hint: i }, q: t('f.data.q3', { old: old, v: x }), options: numOptions(sum, old), answer: String(sum), why: t('f.data.why3', { old: old, v: x, new: sum }) };
      add(f);
    });
    var avg = sum / n;
    add({ total: sum, avg: avg, line: [4], ms: true, text: t('f.data.avg', { total: sum, n: n, avg: avg }),
      quiz: { view: { type: 'prog', kind: 'data', vals: v, hi: -1, lo: -1, upto: n, total: sum, avg: null, line: [4], text: '', ms: false }, q: t('f.data.q4', { total: sum, n: n }), options: numOptions(avg, avg + 1), answer: String(avg), why: t('f.data.why4', { total: sum, n: n, avg: avg }) } });
    add({ total: sum, avg: avg, line: [], ms: true, text: t('f.data.end', { avg: avg }) });
    return { kind: 'data', frames: frames, pseudo: pseudo('data'), trace: { max: maxI, min: minI, total: sum, avg: avg } };
  }

  /* Extra lesson types register themselves here (see frames-cs.js). */
  var BUILDERS = {}, UTIL = { t: t, pseudo: pseudo, numOptions: numOptions, ABC: ABC, runLines: runLines };

  function progFrames(kind, ex) {
    var frames = [], E = PROG_EX[kind][ex || 0];
    if (BUILDERS[kind]) return BUILDERS[kind](E, UTIL);
    if (kind === 'cond') return condFrames(E);
    if (kind === 'bug') return bugFrames(E);
    if (kind === 'race') return raceFrames(E);
    if (kind === 'cipher') return cipherFrames(E);
    if (kind === 'rep') return repFrames(E);
    if (kind === 'net') return netFrames(E);
    if (kind === 'ai') return aiFrames(E);
    if (kind === 'data') return dataFrames(E);
    function add(o) { frames.push(Object.assign({ type: 'prog', kind: kind, line: [], text: '', ms: false }, o)); }
    if (kind === 'bits') {
      var places = [8, 4, 2, 1], bits = [0, 0, 0, 0], rem = E.n;
      add({ places: places, bits: bits.slice(), cur: -1, rem: rem, n: E.n, line: [0], ms: true, text: t('f.bits.start', { n: E.n }) });
      places.forEach(function (pv, k) {
        var fits = rem >= pv, pre = frames[frames.length - 1];
        var view = Object.assign({}, pre, { cur: k, bits: bits.slice() });
        if (fits) { bits[k] = 1; rem -= pv; }
        add({
          places: places, bits: bits.slice(), cur: k, rem: rem, n: E.n, line: fits ? [1, 2, 3] : [1, 2], ms: k === 1 || k === 3,
          text: t(fits ? 'f.bits.yes' : 'f.bits.no', { p: pv, r: fits ? rem + pv : rem, left: rem }),
          quiz: {
            view: view,
            q: t('f.bits.q', { p: pv, r: fits ? rem + pv : rem }),
            options: [{ id: 'yes', label: t('f.bits.optYes') }, { id: 'no', label: t('f.bits.optNo') }],
            answer: fits ? 'yes' : 'no',
            why: t(fits ? 'f.bits.whyYes' : 'f.bits.whyNo', { p: pv, r: fits ? rem + pv : rem })
          }
        });
      });
      add({ places: places, bits: bits.slice(), cur: -1, rem: 0, n: E.n, line: [4], ms: true, text: t('f.bits.end', { n: E.n, b: bits.join('') }) });
      return { kind: kind, frames: frames, pseudo: pseudo('bits'), trace: { bits: bits.slice() } };
    }
    if (kind === 'loop') {
      var total = 0, N = E.n;
      add({ n: N, i: 0, total: 0, line: [0], ms: true, text: t('f.loop.start', { n: N }) });
      for (var i = 1; i <= N; i++) {
        var old = total, pre2 = frames[frames.length - 1];
        total += i;
        add({
          n: N, i: i, total: total, line: [1, 2], ms: i === 1 || i === N || i === Math.ceil(N / 2),
          text: t('f.loop.round', { i: i, old: old, new: total }),
          quiz: {
            view: Object.assign({}, pre2, { i: i }),
            q: t('f.loop.q', { i: i, old: old }),
            options: numOptions(total, old),
            answer: String(total),
            why: t('f.loop.why', { i: i, old: old, new: total })
          }
        });
      }
      add({ n: N, i: N, total: total, line: [3], ms: true, text: t('f.loop.end', { n: N, total: total }) });
      return { kind: kind, frames: frames, pseudo: pseudo('loop'), trace: { total: total } };
    }
    // variables
    var boxes = [], names = [], lines = E.lines;
    function val(n) { for (var q = 0; q < boxes.length; q++) if (boxes[q].name === n) return boxes[q].value; return 0; }
    function snapBoxes(changed) { return boxes.map(function (b) { return { name: b.name, value: b.value, changed: b.name === changed }; }); }
    add({ boxes: [], line: [], ms: true, lines: lines, text: t('f.var.start') });
    lines.forEach(function (ln, k) {
      var m = /^(\w+) = (.+)$/.exec(ln), name = m[1], rhs = m[2];
      var calc = rhs.replace(/[a-z]\w*/g, function (id) { return String(val(id)); });
      var value = Function('"use strict";return (' + calc + ')')(), existing = names.indexOf(name) >= 0;
      var oldv = existing ? val(name) : 0, pre3 = frames[frames.length - 1];
      if (!existing) { names.push(name); boxes.push({ name: name, value: value }); } else boxes.forEach(function (b) { if (b.name === name) b.value = value; });
      var simple = /^\d+$/.test(rhs);
      var f = {
        boxes: snapBoxes(name), line: [k], lines: lines, ms: k === 0 || k === lines.length - 1 || k === 2,
        text: t(simple ? 'f.var.num' : 'f.var.calc', { name: name, rhs: rhs, calc: calc, v: value })
      };
      if (!simple) {
        f.quiz = {
          view: Object.assign({}, pre3, { highlight: name, lines: lines, line: [k] }),
          q: t('f.var.q', { name: name, line: ln }),
          options: numOptions(value, oldv),
          answer: String(value),
          why: t('f.var.why', { name: name, calc: calc, v: value })
        };
      }
      add(f);
    });
    add({ boxes: snapBoxes(null), lines: lines, line: [], ms: true, text: t('f.var.end', { list: boxes.map(function (b) { return b.name + ' = ' + b.value; }).join(', ') }) });
    return { kind: kind, frames: frames, pseudo: lines, trace: { boxes: boxes.map(function (b) { return [b.name, b.value]; }) } };
  }

  /* ---------- Binary search (the line is already sorted) ---------- */
  function binaryFrames(arr, target) {
    var n = arr.length, frames = [], lo = 0, hi = n - 1, looks = 0, found = -1;
    function add(o) {
      frames.push(Object.assign({ type: 'sort', line: [], text: '', ms: false, arr: arr.slice(), lo: lo, hi: hi, pivot: -1, cur: -1, left: [], sorted: [], tag: 'mid', target: target }, o));
    }
    add({ line: [0], ms: true, text: t('f.bin.start', { v: target, n: n }) });
    while (lo <= hi) {
      var mid = Math.floor((lo + hi) / 2), v = arr[mid], dir = v === target ? 'found' : v < target ? 'right' : 'left';
      looks++;
      add({
        line: [1, 2], pivot: mid,
        text: t('f.bin.look', { m: v, v: target, k: hi - lo + 1 }),
        quiz: {
          q: t('f.bin.q', { m: v, v: target }),
          options: [{ id: 'left', label: t('f.bin.optLeft') }, { id: 'found', label: t('f.bin.optFound') }, { id: 'right', label: t('f.bin.optRight') }],
          answer: dir,
          why: t('f.bin.why.' + dir, { m: v, v: target })
        }
      });
      if (dir === 'found') { found = mid; break; }
      if (dir === 'right') { lo = mid + 1; add({ line: [4], ms: true, pivot: -1, text: t('f.bin.cutRight', { m: v, v: target, k: hi - lo + 1 }) }); }
      else { hi = mid - 1; add({ line: [5], ms: true, pivot: -1, text: t('f.bin.cutLeft', { m: v, v: target, k: hi - lo + 1 }) }); }
    }
    if (found >= 0) add({ line: [3], ms: true, lo: found, hi: found, sorted: [found], text: t('f.bin.found', { v: target, c: looks, n: n }) });
    else add({ line: [6], ms: true, text: t('f.bin.missing', { v: target, c: looks, n: n }) });
    return { kind: 'bin', arr: arr.slice(), frames: frames, pseudo: pseudo('bin'), trace: { found: found, looks: looks, target: target } };
  }

  /* ---------- Examples ---------- */
  /** 'random', 'sorted' (worst case for quick sort with a last-penguin pivot) or 'reversed'. */
  function makeArray(kind, n) {
    var a = range(1, n);
    if (kind === 'sorted') return a;
    if (kind === 'reversed') return a.reverse();
    for (var i = n - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    if (a.every(function (v, k) { return v === k + 1; })) { var t2 = a[0]; a[0] = a[1]; a[1] = t2; }
    return a;
  }

  /** Reads the numbers a student typed. Whole numbers 1-9, no repeats, 3 to 8 of them. */
  function parseNumbers(text, minCount, maxCount) {
    var msg = t('f.nums.err', { min: minCount, max: maxCount });
    var parts = String(text).trim().split(/[\s,;]+/).filter(function (s) { return s.length; });
    var nums = parts.map(Number);
    var ok = nums.length >= minCount && nums.length <= maxCount &&
      nums.every(function (v) { return Number.isInteger(v) && v >= 1 && v <= 9; }) &&
      new Set(nums).size === nums.length;
    return ok ? { ok: true, arr: nums } : { ok: false, error: msg };
  }

  return { pseudo: pseudo, sortFrames: sortFrames, mergeFrames: mergeFrames, bubbleFrames: bubbleFrames, binaryFrames: binaryFrames, selectionFrames: selectionFrames, insertionFrames: insertionFrames, dsFrames: dsFrames, progFrames: progFrames, PROG_EX: PROG_EX, shiftLetter: shiftLetter, BUILDERS: BUILDERS, UTIL: UTIL, aiRank: aiRank, AI_TESTS: AI_TESTS, AI_TRAIN: AI_TRAIN, netPackets: netPackets, raceSteps: raceSteps, runLines: runLines, heapFrames: heapFrames, makeArray: makeArray, parseNumbers: parseNumbers };
});
