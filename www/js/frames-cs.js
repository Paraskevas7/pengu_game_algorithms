/* More lessons for the school curriculum, part 1 (programming ideas): robot commands, flowcharts, logic gates,
   data types, arrays, functions and recursion. Pure logic, no DOM. Adds itself to Frames (browser and Node). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./frames.js'), require('./i18n.js'));
  else root.FramesCS = factory(root.Frames, root.I18n);
})(typeof self !== 'undefined' ? self : this, function (F, I18n) {
  'use strict';
  var t = I18n.t, U = F.UTIL, EX = F.PROG_EX, B = F.BUILDERS;

  function opts(list) { return list.map(function (v) { return { id: String(v), label: String(v) }; }); }
  function uniq(list) { return list.filter(function (v, i) { return list.indexOf(v) === i; }); }
  function mk(kind, frames, extra) { return function (o) { frames.push(Object.assign({ type: 'prog', kind: kind, line: [], text: '', ms: false }, extra, o)); }; }

  /* ---------------------------------------------------------------- robot */
  var N = 5, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], DIRN = ['N', 'E', 'S', 'W'];
  function cellName(x, y) { return 'ABCDE'[x] + (y + 1); }
  EX.robot = [
    { key: 'l.exRobot1', vars: {}, start: { x: 0, y: 4, d: 0 }, goal: { x: 2, y: 2 }, prog: ['F', 'F', 'R', 'F', 'F'] },
    { key: 'l.exRobot2', vars: {}, start: { x: 0, y: 4, d: 0 }, goal: { x: 2, y: 0 }, prog: ['F', { rep: 3, body: ['F'] }, 'R', { rep: 2, body: ['F'] }] },
    { key: 'l.exRobot3', vars: {}, start: { x: 0, y: 4, d: 0 }, goal: { x: 2, y: 2 }, prog: [{ rep: 2, body: ['F', 'F', 'R'] }] }
  ];
  function robotLines(prog) {
    var lines = [], steps = [];
    function name(c) { return t('d.rb.' + c); }
    prog.forEach(function (c) {
      if (typeof c === 'string') { lines.push(name(c)); steps.push({ c: c, line: [lines.length - 1] }); return; }
      lines.push(t('d.rb.rep', { n: c.rep })); var head = lines.length - 1;
      var bodyLines = c.body.map(function (b) { lines.push('  ' + name(b)); return lines.length - 1; });
      for (var r = 0; r < c.rep; r++) c.body.forEach(function (b, k) { steps.push({ c: b, line: [head, bodyLines[k]] }); });
    });
    return { lines: lines, steps: steps };
  }
  B.robot = function (E) {
    var frames = [], add = mk('robot', frames), pl = robotLines(E.prog), s = { x: E.start.x, y: E.start.y, d: E.start.d }, trail = [[s.x, s.y]];
    function snap(extra) { return Object.assign({ x: s.x, y: s.y, d: s.d, trail: trail.map(function (q) { return q.slice(); }), goal: E.goal, lines: pl.lines }, extra); }
    add(snap({ ms: true, text: t('f.rb.start', { pos: cellName(s.x, s.y), dir: t('d.rb.dir.' + DIRN[s.d]), goal: cellName(E.goal.x, E.goal.y) }) }));
    pl.steps.forEach(function (st, k) {
      var before = snap({ line: st.line }), view = Object.assign({ type: 'prog', kind: 'robot', text: '', ms: false }, before), q;
      if (st.c === 'F') {
        var nx = s.x + DX[s.d], ny = s.y + DY[s.d], right = cellName(nx, ny), cand = [];
        for (var i = 0; i < 4; i++) { var cx = s.x + DX[i], cy = s.y + DY[i]; if (cx >= 0 && cx < N && cy >= 0 && cy < N) cand.push(cellName(cx, cy)); }
        cand.push(cellName(s.x, s.y));
        var wrong = uniq(cand).filter(function (v) { return v !== right; }).slice(0, 2);
        q = { view: view, q: t('f.rb.qF', { pos: cellName(s.x, s.y), dir: t('d.rb.dir.' + DIRN[s.d]) }), options: opts(uniq([right].concat(wrong)).sort()), answer: right, why: t('f.rb.whyF', { dir: t('d.rb.dir.' + DIRN[s.d]), pos: right }) };
        s.x = nx; s.y = ny; trail.push([s.x, s.y]);
      } else {
        var nd = (s.d + (st.c === 'R' ? 1 : 3)) % 4, ids = [nd, (nd + 1) % 4, (nd + 2) % 4].sort(function (a, b) { return a - b; });
        q = { view: view, q: t('f.rb.qT', { dir: t('d.rb.dir.' + DIRN[s.d]), cmd: t('d.rb.' + st.c) }), options: ids.map(function (i) { return { id: DIRN[i], label: t('d.rb.dir.' + DIRN[i]) }; }), answer: DIRN[nd], why: t('f.rb.whyT', { cmd: t('d.rb.' + st.c), dir: t('d.rb.dir.' + DIRN[nd]) }) };
        s.d = nd;
      }
      var txt = st.c === 'F' ? t('f.rb.F', { dir: t('d.rb.dir.' + DIRN[s.d]), pos: cellName(s.x, s.y) }) : t('f.rb.T', { cmd: t('d.rb.' + st.c), dir: t('d.rb.dir.' + DIRN[s.d]) });
      add(snap({ line: st.line, text: txt, ms: k === pl.steps.length - 1, quiz: q }));
    });
    var won = s.x === E.goal.x && s.y === E.goal.y;
    add(snap({ done: true, ms: true, text: t(won ? 'f.rb.win' : 'f.rb.lose', { pos: cellName(s.x, s.y) }) }));
    return { kind: 'robot', frames: frames, pseudo: pl.lines, trace: { x: s.x, y: s.y, d: s.d, won: won, steps: pl.steps.length } };
  };

  /* ------------------------------------------------------------ flowchart */
  var FLOWS = {
    toast: {
      h: 300, nodes: [['s', 'start', 150, 16], ['a', 'proc', 150, 66], ['b', 'proc', 150, 116], ['c', 'proc', 150, 166], ['d', 'proc', 150, 216], ['e', 'end', 150, 270]],
      edges: [['s', 'a'], ['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e']]
    },
    rain: {
      h: 330, nodes: [['s', 'start', 150, 16], ['look', 'proc', 150, 64], ['q', 'dec', 150, 120], ['umb', 'proc', 70, 192], ['sun', 'proc', 230, 192], ['go', 'proc', 150, 260], ['e', 'end', 150, 312]],
      edges: [['s', 'look'], ['look', 'q'], ['q', 'umb', 'yes', [[65, 120], [70, 120], [70, 175]], [40, 112]], ['q', 'sun', 'no', [[235, 120], [230, 120], [230, 175]], [260, 112]], ['umb', 'go', '', [[70, 209], [70, 228], [150, 228], [150, 243]]], ['sun', 'go', '', [[230, 209], [230, 228], [150, 228], [150, 243]]], ['go', 'e']]
    },
    count: {
      h: 380, nodes: [['s', 'start', 120, 16], ['init', 'proc', 120, 62], ['q', 'dec', 120, 120], ['say', 'proc', 120, 192], ['inc', 'proc', 120, 244], ['e', 'end', 120, 340]],
      edges: [['s', 'init'], ['init', 'q'], ['q', 'say', 'yes', [[120, 145], [120, 175]], [138, 162]], ['say', 'inc'], ['inc', 'q', '', [[195, 244], [255, 244], [255, 120], [205, 120]]], ['q', 'e', 'no', [[35, 120], [20, 120], [20, 340], [75, 340]], [30, 138]]]
    }
  };
  EX.algo = [
    { key: 'l.exFlow1', vars: {}, flow: 'toast' },
    { key: 'l.exFlow2', vars: {}, flow: 'rain', rain: true },
    { key: 'l.exFlow3', vars: {}, flow: 'rain', rain: false },
    { key: 'l.exFlow4', vars: {}, flow: 'count' }
  ];
  function flowText(flow, id) { return t('fc.' + flow + '.' + id); }
  B.algo = function (E) {
    var F0 = FLOWS[E.flow], frames = [], add = mk('algo', frames), kinds = {}, out = {}, names = [];
    F0.nodes.forEach(function (n) { kinds[n[0]] = n[1]; });
    F0.edges.forEach(function (e) { (out[e[0]] = out[e[0]] || []).push(e); });
    var path = [], n = 0, cur = 's', guard = 0;
    // run the flowchart and remember the path
    while (cur && guard++ < 60) {
      if (E.flow === 'count') { if (cur === 'init') n = 1; if (cur === 'inc') n += 1; }
      path.push({ id: cur, n: n });
      if (cur === 'e') break;
      var outs = out[cur];
      if (E.flow === 'count' && cur === 'q') { var yes = n <= 3; cur = outs.filter(function (e) { return e[2] === (yes ? 'yes' : 'no'); })[0][1]; continue; }
      if (E.flow === 'rain' && cur === 'q') { cur = outs.filter(function (e) { return e[2] === (E.rain ? 'yes' : 'no'); })[0][1]; continue; }
      cur = outs[0][1];
    }
    var chosen = F0.nodes.filter(function (q) { return q[1] === 'proc'; }).map(function (q) { return flowText(E.flow, q[0]); });
    var seen = [], trail = [];
    path.forEach(function (p, k) {
      seen.push(p.id); if (k > 0) trail.push([path[k - 1].id, p.id]);
      var kind = kinds[p.id], next = path[k + 1], base = { flow: E.flow, cur: p.id, seen: seen.slice(), trail: trail.slice(), n: p.n, counter: E.flow === 'count' && p.n > 0 };
      var f = Object.assign({}, base, { line: [kind === 'start' ? 0 : kind === 'end' ? 3 : kind === 'dec' ? 2 : 1] });
      if (kind === 'start') f.text = t('f.fc.start');
      else if (kind === 'end') { f.text = t('f.fc.end'); f.ms = true; }
      else if (kind === 'proc') f.text = t('f.fc.proc', { txt: flowText(E.flow, p.id) });
      else {
        var ans = next && trail.length >= 0 ? out[p.id].filter(function (e) { return e[1] === next.id; })[0][2] : 'no';
        f.text = t('f.fc.dec', { txt: flowText(E.flow, p.id), ans: t('d.fc.' + ans) }); f.ms = true;
      }
      if (next) {
        var view = Object.assign({ type: 'prog', kind: 'algo', text: '', ms: false }, base, { line: f.line });
        if (kind === 'dec') {
          var a = out[p.id].filter(function (e) { return e[1] === next.id; })[0][2];
          f.quiz = { view: view, q: t('f.fc.qd', { txt: flowText(E.flow, p.id) }), options: [{ id: 'yes', label: t('d.fc.yes') }, { id: 'no', label: t('d.fc.no') }], answer: a, why: t('f.fc.whyd', { ans: t('d.fc.' + a) }) };
          if (E.flow === 'count') f.quiz.q = t('f.fc.qn', { n: p.n });
          if (E.flow === 'count') f.quiz.why = t('f.fc.whyn', { n: p.n, ans: t('d.fc.' + a) });
        } else {
          var nextName = kinds[next.id] === 'end' ? t('f.fc.endName') : kinds[next.id] === 'start' ? t('f.fc.startName') : flowText(E.flow, next.id);
          var others = F0.nodes.filter(function (q) { return q[0] !== next.id && q[0] !== p.id && q[1] === 'proc'; }).map(function (q) { return flowText(E.flow, q[0]); });
          var list = uniq([nextName].concat(others)).slice(0, 3);
          if (list.indexOf(nextName) < 0) list[0] = nextName;
          f.quiz = { view: view, q: t('f.fc.qs', { txt: kind === 'start' ? t('f.fc.startName') : flowText(E.flow, p.id) }), options: list.sort().map(function (v) { return { id: v, label: v }; }), answer: nextName, why: t('f.fc.whys', { next: nextName }) };
          if (kind === 'start') f.quiz.q = t('f.fc.qs', { txt: t('f.fc.startName') });
        }
        if (f.quiz && f.quiz.options.length < 2) delete f.quiz;
      }
      add(f);
    });
    return { kind: 'algo', frames: frames, pseudo: U.pseudo('algo'), trace: { path: path.map(function (p) { return p.id; }) } };
  };

  /* ---------------------------------------------------------- logic gates */
  var GATES = {
    AND: { n: 1, ins: 2, f: function (a, b) { return a && b; } },
    OR: { n: 2, ins: 2, f: function (a, b) { return a || b; } },
    NOT: { n: 3, ins: 1, f: function (a) { return a ? 0 : 1; } },
    ANDNOT: { n: 4, ins: 2, f: function (a, b) { return a && !b ? 1 : 0; } },
    NOR: { n: 5, ins: 2, f: function (a, b) { return a || b ? 0 : 1; } }
  };
  EX.logic = ['AND', 'OR', 'NOT', 'ANDNOT', 'NOR'].map(function (g) { return { key: 'l.exGate.' + g, vars: {}, gate: g }; });
  B.logic = function (E) {
    var G = GATES[E.gate], frames = [], add = mk('logic', frames, { gate: E.gate }), rows = [];
    var combos = G.ins === 1 ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
    add({ ins: G.ins, a: 0, b: 0, out: null, rows: [], line: [], ms: true, text: t('f.lg.start', { gate: t('d.lg.' + E.gate) }) });
    combos.forEach(function (c, k) {
      var a = c[0], b = c[1] || 0, o = G.ins === 1 ? G.f(a) : G.f(a, b) ? 1 : 0;
      var view = { type: 'prog', kind: 'logic', gate: E.gate, ins: G.ins, a: a, b: b, out: null, rows: rows.slice(), line: [], text: '', ms: false };
      rows.push({ a: a, b: b, o: o });
      add({ ins: G.ins, a: a, b: b, out: o, rows: rows.slice(), line: [G.n % 5], ms: k === 0 || k === combos.length - 1,
        text: t(o ? 'f.lg.on' : 'f.lg.off', { a: a, b: b, gate: t('d.lg.' + E.gate), rule: t('d.lg.rule.' + E.gate) }),
        quiz: { view: view, q: t(G.ins === 1 ? 'f.lg.q1' : 'f.lg.q2', { a: a ? t('d.lg.on') : t('d.lg.offw'), b: b ? t('d.lg.on') : t('d.lg.offw'), gate: t('d.lg.' + E.gate) }), options: [{ id: 'yes', label: t('f.lg.optOn') }, { id: 'no', label: t('f.lg.optOff') }], answer: o ? 'yes' : 'no', why: t('f.lg.why', { rule: t('d.lg.rule.' + E.gate) }) } });
    });
    add({ ins: G.ins, a: 0, b: 0, out: null, rows: rows.slice(), line: [], ms: true, done: true, text: t('f.lg.end', { gate: t('d.lg.' + E.gate), rule: t('d.lg.rule.' + E.gate) }) });
    return { kind: 'logic', frames: frames, pseudo: U.pseudo('logic'), trace: { table: rows.map(function (r) { return r.o; }) } };
  };

  /* ------------------------------------------------------------ data types */
  EX.types = [
    { key: 'l.exTypes1', vars: {}, mode: 'sort', items: [['7', 'num'], ['"7"', 'text'], ['true', 'bool'], ['"ice"', 'text'], ['3.5', 'num'], ['false', 'bool']] },
    { key: 'l.exTypes2', vars: {}, mode: 'plus', items: [['3 + 4', '7', ['7', '12', '"34"']], ['"3" + "4"', '"34"', ['"34"', '7', '"7"']], ['"ice" + "berg"', '"iceberg"', ['"iceberg"', '"ice berg"', '8']], ['10 - 4', '6', ['6', '14', '4']]] }
  ];
  B.types = function (E) {
    var frames = [], add = mk('types', frames, { mode: E.mode }), done = [];
    if (E.mode === 'sort') {
      add({ item: null, done: [], ms: true, text: t('f.ty.start') });
      var order = ['num', 'text', 'bool'];
      E.items.forEach(function (it, k) {
        var view = { type: 'prog', kind: 'types', mode: 'sort', item: it[0], tp: '', done: done.slice(), line: [], text: '', ms: false };
        done.push([it[0], it[1]]);
        add({ item: it[0], tp: it[1], done: done.slice(), line: [order.indexOf(it[1])], ms: k === 0 || k === E.items.length - 1, text: t('f.ty.is', { v: it[0], type: t('d.ty.' + it[1]) }),
          quiz: { view: view, q: t('f.ty.q', { v: it[0] }), options: order.map(function (o) { return { id: o, label: t('d.ty.' + o) }; }), answer: it[1], why: t('f.ty.why.' + it[1], { v: it[0] }) } });
      });
      add({ item: null, done: done.slice(), ms: true, done2: true, text: t('f.ty.end') });
      return { kind: 'types', frames: frames, pseudo: U.pseudo('types'), trace: { types: E.items.map(function (i) { return i[1]; }) } };
    }
    add({ expr: null, done: [], ms: true, text: t('f.ty.pstart') });
    E.items.forEach(function (it, k) {
      var view = { type: 'prog', kind: 'types', mode: 'plus', expr: it[0], res: null, done: done.slice(), line: [], text: '', ms: false };
      done.push([it[0], it[1]]);
      add({ expr: it[0], res: it[1], done: done.slice(), line: [3], ms: k === E.items.length - 1, text: t('f.ty.plus', { e: it[0], r: it[1] }),
        quiz: { view: view, q: t('f.ty.pq', { e: it[0] }), options: opts(it[2].slice().sort()), answer: it[1], why: t('f.ty.pwhy', { e: it[0], r: it[1] }) } });
    });
    add({ expr: null, done: done.slice(), ms: true, text: t('f.ty.pend') });
    return { kind: 'types', frames: frames, pseudo: U.pseudo('types'), trace: { results: E.items.map(function (i) { return i[1]; }) } };
  };

  /* ---------------------------------------------------------------- arrays */
  EX.arr = [
    { key: 'l.exArr1', vars: {}, mode: 'rw', arr: [7, 3, 9, 4, 6], ops: [['r', 2], ['r', 0], ['w', 1, 10], ['r', 1], ['r', 4]] },
    { key: 'l.exArr2', vars: {}, mode: 'sum', arr: [2, 5, 1, 4] },
    { key: 'l.exArr3', vars: {}, mode: 'grid', grid: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], ops: [[0, 1], [2, 0], [1, 2], [2, 2]] }
  ];
  B.arr = function (E) {
    var frames = [], add = mk('arr', frames, { mode: E.mode });
    if (E.mode === 'rw') {
      var a = E.arr.slice();
      add({ arr: a.slice(), idx: -1, line: [0], ms: true, text: t('f.ar.start', { n: a.length, last: a.length - 1 }) });
      E.ops.forEach(function (op, k) {
        var i = op[1], view = { type: 'prog', kind: 'arr', mode: 'rw', arr: a.slice(), idx: i, hide: op[0] === 'r', line: [1], text: '', ms: false };
        if (op[0] === 'r') {
          add({ arr: a.slice(), idx: i, line: [1], ms: k === 0, text: t('f.ar.read', { i: i, v: a[i] }), quiz: { view: view, q: t('f.ar.q', { i: i }), options: U.numOptions(a[i], a[(i + 1) % a.length]), answer: String(a[i]), why: t('f.ar.why', { i: i, v: a[i], pos: i + 1 }) } });
        } else {
          var old = a[i]; a[i] = op[2];
          add({ arr: a.slice(), idx: i, wrote: true, line: [2], ms: true, text: t('f.ar.write', { i: i, old: old, v: op[2] }) });
        }
      });
      add({ arr: a.slice(), idx: -1, line: [], ms: true, text: t('f.ar.end') });
      return { kind: 'arr', frames: frames, pseudo: U.pseudo('arr'), trace: { arr: a.slice() } };
    }
    if (E.mode === 'sum') {
      var sum = 0;
      add({ arr: E.arr.slice(), idx: -1, sum: 0, line: [3], ms: true, text: t('f.ar.sstart') });
      E.arr.forEach(function (v, i) {
        var old = sum, view = { type: 'prog', kind: 'arr', mode: 'sum', arr: E.arr.slice(), idx: i, sum: old, line: [3], text: '', ms: false }; sum += v;
        add({ arr: E.arr.slice(), idx: i, sum: sum, line: [3], ms: i === E.arr.length - 1, text: t('f.ar.sadd', { i: i, v: v, old: old, new: sum }), quiz: { view: view, q: t('f.ar.sq', { i: i, v: v, old: old }), options: U.numOptions(sum, old), answer: String(sum), why: t('f.ar.swhy', { old: old, v: v, new: sum }) } });
      });
      add({ arr: E.arr.slice(), idx: -1, sum: sum, line: [], ms: true, text: t('f.ar.send', { total: sum }) });
      return { kind: 'arr', frames: frames, pseudo: U.pseudo('arr'), trace: { sum: sum } };
    }
    add({ grid: E.grid, r: -1, c: -1, line: [4], ms: true, text: t('f.ar.gstart') });
    E.ops.forEach(function (op, k) {
      var r = op[0], c = op[1], v = E.grid[r][c], view = { type: 'prog', kind: 'arr', mode: 'grid', grid: E.grid, r: r, c: c, hide: true, line: [4], text: '', ms: false };
      add({ grid: E.grid, r: r, c: c, line: [4], ms: k === 0, text: t('f.ar.gread', { r: r, c: c, v: v }), quiz: { view: view, q: t('f.ar.gq', { r: r, c: c }), options: U.numOptions(v, E.grid[c][r] === v ? v + 1 : E.grid[c][r]), answer: String(v), why: t('f.ar.gwhy', { r: r, c: c, v: v }) } });
    });
    add({ grid: E.grid, r: -1, c: -1, line: [], ms: true, text: t('f.ar.gend') });
    return { kind: 'arr', frames: frames, pseudo: U.pseudo('arr'), trace: { values: E.ops.map(function (o) { return E.grid[o[0]][o[1]]; }) } };
  };

  /* ------------------------------------------------------------- functions */
  var FUNCS = {
    double: { sig: 'double(x)', body: 'x * 2', params: ['x'] },
    area: { sig: 'area(w, h)', body: 'w * h', params: ['w', 'h'] },
    add: { sig: 'add(a, b)', body: 'a + b', params: ['a', 'b'] }
  };
  EX.func = [
    { key: 'l.exFn1', vars: {}, fn: 'double', calls: [[3], [5], [8]] },
    { key: 'l.exFn2', vars: {}, fn: 'area', calls: [[2, 3], [4, 5], [6, 3]] },
    { key: 'l.exFn3', vars: {}, fn: 'chain' }
  ];
  function callFn(name, args) { var f = FUNCS[name], fn = Function.apply(null, f.params.concat('return ' + f.body)); return fn.apply(null, args); }
  B.func = function (E) {
    var frames = [], add = mk('func', frames);
    if (E.fn === 'chain') {
      var defs = [FUNCS.add, FUNCS.double], r1 = callFn('add', [2, 3]), r2 = callFn('double', [r1]);
      add({ defs: defs, step: 0, line: [0, 1], ms: true, text: t('f.fn.cstart') });
      add({ defs: defs, step: 1, call: 'add(2, 3)', args: [2, 3], res: r1, line: [2], text: t('f.fn.c1', { r: r1 }), quiz: { view: { type: 'prog', kind: 'func', defs: defs, step: 1, call: 'add(2, 3)', args: [2, 3], res: null, line: [2], text: '', ms: false }, q: t('f.fn.cq1'), options: U.numOptions(r1, 6), answer: String(r1), why: t('f.fn.cwhy1', { r: r1 }) } });
      add({ defs: defs, step: 2, call: 'double(' + r1 + ')', args: [r1], res: r2, line: [2], ms: true, text: t('f.fn.c2', { a: r1, r: r2 }), quiz: { view: { type: 'prog', kind: 'func', defs: defs, step: 2, call: 'double(' + r1 + ')', args: [r1], res: null, line: [2], text: '', ms: false }, q: t('f.fn.cq2', { a: r1 }), options: U.numOptions(r2, r1), answer: String(r2), why: t('f.fn.cwhy2', { a: r1, r: r2 }) } });
      add({ defs: defs, step: 3, call: 'double(add(2, 3))', args: [], res: r2, line: [], ms: true, text: t('f.fn.cend', { r: r2 }) });
      return { kind: 'func', frames: frames, pseudo: U.pseudo('func'), trace: { results: [r1, r2] } };
    }
    var f = FUNCS[E.fn], results = [];
    add({ defs: [f], call: null, args: [], res: null, line: [0, 1], ms: true, text: t('f.fn.start', { sig: f.sig, body: f.body }) });
    E.calls.forEach(function (args, k) {
      var res = callFn(E.fn, args), call = E.fn + '(' + args.join(', ') + ')';
      results.push(res);
      add({ defs: [f], call: call, args: args, res: res, line: [2], ms: k === E.calls.length - 1, text: t('f.fn.call', { call: call, r: res }),
        quiz: { view: { type: 'prog', kind: 'func', defs: [f], call: call, args: args, res: null, line: [2], text: '', ms: false }, q: t('f.fn.q', { call: call }), options: U.numOptions(res, args[0]), answer: String(res), why: t('f.fn.why', { call: call, r: res }) } });
    });
    add({ defs: [f], call: null, args: [], res: null, line: [3], ms: true, text: t('f.fn.end') });
    return { kind: 'func', frames: frames, pseudo: U.pseudo('func'), trace: { results: results } };
  };

  /* ------------------------------------------------------------- recursion */
  EX.rec = [3, 4, 5].map(function (n) { return { key: 'l.exRec', vars: { n: n }, n: n }; });
  function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }
  B.rec = function (E) {
    var frames = [], add = mk('rec', frames), stack = [];
    function snap(extra) { return Object.assign({ stack: stack.map(function (s) { return { n: s.n, res: s.res }; }) }, extra); }
    add(snap({ line: [], ms: true, text: t('f.rc.start', { n: E.n }) }));
    for (var k = E.n; k >= 1; k--) {
      var view = Object.assign({ type: 'prog', kind: 'rec', text: '', ms: false, line: [k === 1 ? 1 : 2] }, snap());
      stack.push({ n: k, res: null });
      if (k > 1) add(snap({ line: [2], ms: k === E.n, text: t('f.rc.call', { n: k, m: k - 1 }), quiz: { view: Object.assign({}, view, { stack: stack.slice(0, -1).map(function (s) { return { n: s.n, res: s.res }; }).concat([{ n: k, res: null }]) }), q: t('f.rc.qc', { n: k }), options: opts(uniq(['fact(' + (k - 1) + ')', 'fact(' + k + ')', 'fact(' + (k + 1) + ')']).sort()), answer: 'fact(' + (k - 1) + ')', why: t('f.rc.whyc', { n: k, m: k - 1 }) } }));
      else add(snap({ line: [1], ms: true, text: t('f.rc.base') }));
    }
    for (var j = 1; j <= E.n; j++) {
      var top = stack[stack.length - j], r = fact(top.n), below = j > 1 ? fact(top.n - 1) : 1;
      var viewR = Object.assign({ type: 'prog', kind: 'rec', text: '', ms: false, line: [top.n === 1 ? 1 : 2], stack: snap().stack });
      top.res = r;
      var f = { line: [top.n === 1 ? 1 : 2], ms: j === E.n, text: top.n === 1 ? t('f.rc.ret1') : t('f.rc.ret', { n: top.n, m: top.n - 1, below: below, r: r }) };
      if (top.n > 1) f.quiz = { view: viewR, q: t('f.rc.qr', { n: top.n, m: top.n - 1, below: below }), options: U.numOptions(r, below), answer: String(r), why: t('f.rc.whyr', { n: top.n, below: below, r: r }) };
      add(snap(f));
    }
    add(snap({ line: [], ms: true, text: t('f.rc.end', { n: E.n, r: fact(E.n) }) }));
    return { kind: 'rec', frames: frames, pseudo: U.pseudo('rec'), trace: { result: fact(E.n) } };
  };

  return { FLOWS: FLOWS, GATES: GATES, FUNCS: FUNCS, cellName: cellName, fact: fact };
});
