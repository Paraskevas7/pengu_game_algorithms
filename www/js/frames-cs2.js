/* More lessons for the school curriculum, part 2 (computers and digital life): how a computer works, files and folders,
   spreadsheets, databases, passwords and phishing, digital citizenship. All examples are invented for this site.
   Pure logic, no DOM. Adds itself to Frames (browser and Node). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./frames.js'), require('./i18n.js'));
  else root.FramesCS2 = factory(root.Frames, root.I18n);
})(typeof self !== 'undefined' ? self : this, function (F, I18n) {
  'use strict';
  var t = I18n.t, U = F.UTIL, EX = F.PROG_EX, B = F.BUILDERS;

  /** Turn a list of steps into lesson frames. A step is { line, k, v, scene, q:{k,v,opts,ans,wk,wv} }. */
  function gen(kind, steps) {
    return steps.map(function (s, i) {
      var line = [s.line || 0];
      var f = Object.assign({ type: 'prog', kind: kind, line: line, text: t(s.k, s.v), ms: !!s.ms || i === 0 || i === steps.length - 1 }, s.scene);
      if (s.q) f.quiz = { view: Object.assign({ type: 'prog', kind: kind, line: line, text: '', ms: false, ask: s.q.ask === undefined ? true : s.q.ask }, s.scene), q: t(s.q.k, s.q.v), options: s.q.opts, answer: s.q.ans, why: t(s.q.wk, s.q.wv) };
      return f;
    });
  }
  function done(kind, frames, trace) { return { kind: kind, frames: frames, pseudo: U.pseudo(kind), trace: trace || {} }; }
  /** The right answer plus two others, with the right one in a changing place. */
  function three(all, ans, seed, label) {
    var others = all.filter(function (x) { return x !== ans; }), o = [others[seed % others.length], others[(seed + 1) % others.length]];
    o.splice(seed % 3, 0, ans);
    return o.map(function (id) { return { id: String(id), label: label ? label(id) : String(id) }; });
  }
  function nOpts(n) { var s = {}; [n, n + 1, n + 2, n - 1].forEach(function (v) { if (v >= 0 && Object.keys(s).length < 3) s[v] = 1; }); s[n] = 1; return Object.keys(s).map(Number).sort(function (a, b) { return a - b; }).slice(0, 3).map(function (v) { return { id: String(v), label: String(v) }; }); }

  /* ------------------------------------------------------- inside the computer */
  var HW = ['in', 'cpu', 'mem', 'sto', 'out'];
  function hwOpts(ans, seed) { return three(HW, ans, seed, function (id) { return t('d.hw.' + id); }); }
  function hq(id, seed) { return { k: 'f.hw.q.' + id, opts: hwOpts(id, seed), ans: id, wk: 'f.hw.w.' + id }; }
  EX.hw = [{ key: 'l.exHw1', vars: {}, id: 'type' }, { key: 'l.exHw2', vars: {}, id: 'save' }];
  B.hw = function (E) {
    var S;
    if (E.id === 'type') S = [
      { line: 0, k: 'f.hw.t0', scene: { on: [], data: '' } },
      { line: 0, k: 'f.hw.t1', scene: { on: ['in'], data: 'A' }, q: hq('in', 1) },
      { line: 1, k: 'f.hw.t2', scene: { on: ['cpu'], data: 'A' }, q: hq('cpu', 2) },
      { line: 2, k: 'f.hw.t3', scene: { on: ['mem'], data: 'A' }, q: hq('mem', 0) },
      { line: 4, k: 'f.hw.t4', scene: { on: ['out'], data: 'A' }, q: hq('out', 1) },
      { line: 4, k: 'f.hw.t5', scene: { on: [], data: '' } }
    ];
    else S = [
      { line: 2, k: 'f.hw.s0', scene: { on: ['mem'], data: 'pic' } },
      { line: 0, k: 'f.hw.s1', scene: { on: ['in', 'cpu'], data: 'pic' } },
      { line: 2, k: 'f.hw.s2', scene: { on: ['mem'], data: 'pic' }, q: hq('mem', 2) },
      { line: 3, k: 'f.hw.s3', scene: { on: ['cpu', 'sto'], data: 'pic' }, q: hq('sto', 1) },
      { line: 3, k: 'f.hw.s4', scene: { on: ['sto', 'mem', 'out'], data: 'pic' } },
      { line: 3, k: 'f.hw.s5', scene: { on: [], data: '' } }
    ];
    return done('hw', gen('hw', S), { parts: HW.length });
  };

  /* ------------------------------------------------------------ files and folders */
  function dir(n, c) { return { n: n, c: c }; }
  function file(n) { return { n: n }; }
  var TREES = {
    A: dir('Home', [dir('Pictures', [file('cat.png'), file('beach.png')]), dir('Music', [file('song.mp3')]), dir('School', [dir('Maths', [file('homework.txt')]), dir('Science', [file('notes.txt')])])]),
    B: dir('Home', [dir('Projects', [dir('Story', [file('draft.txt'), file('cover.png')]), dir('Code', [file('game.js'), file('notes.txt')])]), dir('Photos', [file('trip.png')])])
  };
  EX.os = [
    { key: 'l.exOs1', vars: {}, tree: 'A', file: 'homework.txt', wrong: ['Home/Maths/School/homework.txt', 'Home/School/Science/homework.txt'] },
    { key: 'l.exOs2', vars: {}, tree: 'B', file: 'game.js', wrong: ['Home/Code/Projects/game.js', 'Home/Projects/Story/game.js'] }
  ];
  function findPath(node, name, trail) {
    var here = trail.concat(node.n);
    if (node.n === name && !node.c) return here;
    for (var i = 0; node.c && i < node.c.length; i++) { var r = findPath(node.c[i], name, here); if (r) return r; }
    return null;
  }
  function flatten(node, d, out) { out.push({ n: node.n, d: d, folder: !!node.c }); (node.c || []).forEach(function (c) { flatten(c, d + 1, out); }); return out; }
  function folderNames(node, out) { if (node.c) { out.push(node.n); node.c.forEach(function (c) { folderNames(c, out); }); } return out; }
  B.os = function (E) {
    var tree = TREES[E.tree], path = findPath(tree, E.file, []), flat = flatten(tree, 0, []), last = path.length - 1, folders = folderNames(tree, []), S = [];
    function scene(k) { return { lines: flat, path: path.slice(0, k + 1) }; }
    S.push({ line: 0, k: 'f.os.start', v: { root: tree.n, file: E.file }, scene: { lines: flat, path: [] } });
    path.forEach(function (name, k) {
      var s = { line: k === 0 ? 1 : k === last ? 4 : 2, k: k === 0 ? 'f.os.top' : k === last ? 'f.os.found' : 'f.os.open', v: { name: name }, scene: scene(k) };
      if (k === last - 1) s.q = { k: 'f.os.q1', v: { file: E.file }, opts: three(folders.filter(function (x) { return x !== 'Home'; }), name, 1).map(function (o) { return o; }), ans: name, wk: 'f.os.w1', wv: { folder: name, file: E.file } };
      if (k === last) s.q = { k: 'f.os.q2', v: { file: E.file }, opts: three(E.wrong.concat(path.join('/')), path.join('/'), 2), ans: path.join('/'), wk: 'f.os.w2' };
      S.push(s);
    });
    S.push({ line: 3, k: 'f.os.end', scene: { lines: flat, path: path.slice() } });
    return done('os', gen('os', S), { path: path.join('/') });
  };

  /* ---------------------------------------------------------------- spreadsheet */
  var COLS = 'ABCD';
  function refPos(ref) { return { c: COLS.indexOf(ref[0]), r: +ref.slice(1) }; }
  function rangeRefs(a, b) {
    var p = refPos(a), q = refPos(b), out = [];
    for (var r = p.r; r <= q.r; r++) for (var c = p.c; c <= q.c; c++) out.push(COLS[c] + r);
    return out;
  }
  /** Work out one formula. Supports =A1+B1, =A2*B2, =SUM(A1:A4), =MAX(A1:A4). */
  function evalFormula(f, cells) {
    var m;
    function val(ref) { return cells[ref].f ? evalFormula(cells[ref].f, cells) : cells[ref].v; }
    if ((m = /^=(SUM|MAX)\((\w+):(\w+)\)$/.exec(f))) {
      var vals = rangeRefs(m[2], m[3]).map(val);
      return m[1] === 'SUM' ? vals.reduce(function (a, b) { return a + b; }, 0) : Math.max.apply(null, vals);
    }
    if ((m = /^=(\w+)([+*])(\w+)$/.exec(f))) return m[2] === '+' ? val(m[1]) + val(m[3]) : val(m[1]) * val(m[3]);
    throw new Error('formula ' + f);
  }
  function refsOf(f) { var m = /\((\w+):(\w+)\)/.exec(f); return m ? rangeRefs(m[1], m[2]) : f.slice(1).split(/[+*]/); }
  EX.sheet = [{ key: 'l.exSh1', vars: {}, id: 'calc' }, { key: 'l.exSh2', vars: {}, id: 'sum' }];
  B.sheet = function (E) {
    var cells, rows, cols, S = [], trace = {};
    function sc(extra) { return Object.assign({ rows: rows, cols: cols, cells: JSON.parse(JSON.stringify(cells)), sel: [], bar: null }, extra); }
    function shown(ref) { return cells[ref].f ? evalFormula(cells[ref].f, cells) : cells[ref].v; }
    function put(ref, f) { cells[ref] = { f: f }; return evalFormula(f, cells); }
    if (E.id === 'calc') {
      rows = 2; cols = 3; cells = { A1: { v: 4 }, B1: { v: 6 }, A2: { v: 5 }, B2: { v: 7 } };
      S.push({ line: 0, k: 'f.sh.c0', scene: sc({}) });
      S.push({ line: 0, k: 'f.sh.c1', scene: sc({ sel: ['A2'], bar: { ref: 'A2', text: '5' } }), q: { ask: 'A2', k: 'f.sh.qA2', opts: nOpts(5), ans: '5', wk: 'f.sh.wA2' } });
      var r1 = put('C1', '=A1+B1');
      S.push({ line: 1, k: 'f.sh.c2', v: { r: r1 }, scene: sc({ sel: ['A1', 'B1', 'C1'], bar: { ref: 'C1', text: '=A1+B1' } }), q: { ask: 'C1', k: 'f.sh.q', v: { ref: 'C1', f: '=A1+B1' }, opts: nOpts(r1), ans: String(r1), wk: 'f.sh.w1', wv: { a: 4, b: 6, r: r1 } } });
      var r2 = put('C2', '=A2*B2');
      S.push({ line: 1, k: 'f.sh.c3', v: { r: r2 }, scene: sc({ sel: ['A2', 'B2', 'C2'], bar: { ref: 'C2', text: '=A2*B2' } }), q: { ask: 'C2', k: 'f.sh.q', v: { ref: 'C2', f: '=A2*B2' }, opts: nOpts(r2), ans: String(r2), wk: 'f.sh.w2', wv: { a: 5, b: 7, r: r2 } } });
      S.push({ line: 2, k: 'f.sh.c4', scene: sc({}) });
      trace = { c1: r1, c2: r2 };
    } else {
      rows = 5; cols = 2; cells = { A1: { v: 2 }, A2: { v: 5 }, A3: { v: 3 }, A4: { v: 6 } };
      S.push({ line: 3, k: 'f.sh.s0', scene: sc({ sel: rangeRefs('A1', 'A4') }) });
      var sum = put('A5', '=SUM(A1:A4)');
      S.push({ line: 3, k: 'f.sh.s1', v: { r: sum }, scene: sc({ sel: rangeRefs('A1', 'A5'), bar: { ref: 'A5', text: '=SUM(A1:A4)' } }), q: { ask: 'A5', k: 'f.sh.q', v: { ref: 'A5', f: '=SUM(A1:A4)' }, opts: nOpts(sum), ans: String(sum), wk: 'f.sh.w3', wv: { r: sum } } });
      cells.A2 = { v: 9 };
      var sum2 = shown('A5');
      S.push({ line: 3, k: 'f.sh.s2', v: { r: sum2 }, scene: sc({ sel: ['A2', 'A5'], bar: { ref: 'A2', text: '9' } }), q: { ask: 'A5', k: 'f.sh.qs2', opts: nOpts(sum2), ans: String(sum2), wk: 'f.sh.w4', wv: { r: sum2 } } });
      var mx = put('B5', '=MAX(A1:A4)');
      S.push({ line: 3, k: 'f.sh.s3', v: { r: mx }, scene: sc({ sel: rangeRefs('A1', 'A4').concat('B5'), bar: { ref: 'B5', text: '=MAX(A1:A4)' } }), q: { ask: 'B5', k: 'f.sh.q', v: { ref: 'B5', f: '=MAX(A1:A4)' }, opts: nOpts(mx), ans: String(mx), wk: 'f.sh.w5', wv: { r: mx } } });
      S.push({ line: 4, k: 'f.sh.s4', scene: sc({}) });
      trace = { sum: sum, sum2: sum2, max: mx };
    }
    var fr = gen('sheet', S);
    return done('sheet', fr, trace);
  };

  /* ------------------------------------------------------------------- database */
  var DB_ROWS = [['Waddle', 4, 'A', 3], ['Snow', 2, 'B', 5], ['Pebble', 6, 'A', 2], ['Flip', 3, 'B', 4], ['Mochi', 5, 'B', 6], ['Ziggy', 1, 'B', 1]];
  var DB_COLS = ['name', 'age', 'colony', 'fish'];
  function dbMatch(r, col, op, val) { var v = r[DB_COLS.indexOf(col)]; return op === '=' ? v === val : op === '>' ? v > val : v < val; }
  EX.db = [{ key: 'l.exDb1', vars: {}, id: 'filter' }, { key: 'l.exDb2', vars: {}, id: 'sort' }];
  B.db = function (E) {
    var S = [];
    function rule(col, op, val) { return t('d.db.' + col) + ' ' + op + ' ' + val; }
    function filt(col, op, val, ask) { var n = 0, rows = DB_ROWS.map(function (r) { var on = dbMatch(r, col, op, val); if (on) n++; return { c: r, on: on }; }); return { scene: { rows: rows, rule: rule(col, op, val), count: n, ask: !!ask }, n: n }; }
    function sorted(col, desc, only) {
      var i = DB_COLS.indexOf(col), list = DB_ROWS.filter(function (r) { return !only || dbMatch(r, only[0], only[1], only[2]); }).slice().sort(function (a, b) { return desc ? b[i] - a[i] : a[i] - b[i]; });
      return { rows: list.map(function (r) { return { c: r, on: false }; }), rule: (only ? rule(only[0], only[1], only[2]) + ', ' : '') + t('d.db.sortby', { col: t('d.db.' + col), dir: t(desc ? 'd.db.desc' : 'd.db.asc') }), count: null, list: list };
    }
    var all = { rows: DB_ROWS.map(function (r) { return { c: r, on: false }; }), rule: '', count: null };
    if (E.id === 'filter') {
      S.push({ line: 0, k: 'f.db.f0', v: { n: DB_ROWS.length }, scene: all });
      [['colony', '=', 'A', 'f.db.f1'], ['age', '>', 3, 'f.db.f2'], ['fish', '>', 4, 'f.db.f3']].forEach(function (f, k) {
        var r = filt(f[0], f[1], f[2]);
        S.push({ line: 1, k: f[3], v: { rule: rule(f[0], f[1], f[2]) }, scene: r.scene, q: { k: 'f.db.qn', v: { rule: rule(f[0], f[1], f[2]) }, opts: nOpts(r.n), ans: String(r.n), wk: 'f.db.wn', wv: { rule: rule(f[0], f[1], f[2]), n: r.n } } });
      });
      S.push({ line: 3, k: 'f.db.fend', scene: filt('colony', '=', 'B').scene });
    } else {
      S.push({ line: 0, k: 'f.db.s0', scene: all });
      var s1 = sorted('age', false), s2 = sorted('fish', true), s3 = sorted('age', false, ['colony', '=', 'B']);
      var names = DB_ROWS.map(function (r) { return r[0]; });
      S.push({ line: 2, k: 'f.db.s1', scene: s1, q: { k: 'f.db.qfirst', opts: three(names, s1.list[0][0], 0), ans: s1.list[0][0], wk: 'f.db.wfirst', wv: { who: s1.list[0][0] } } });
      S.push({ line: 2, k: 'f.db.s2', scene: s2, q: { k: 'f.db.qfirst', opts: three(names, s2.list[0][0], 1), ans: s2.list[0][0], wk: 'f.db.wfirst', wv: { who: s2.list[0][0] } } });
      S.push({ line: 2, k: 'f.db.s3', scene: s3, q: { k: 'f.db.qsecond', opts: three(names, s3.list[1][0], 2), ans: s3.list[1][0], wk: 'f.db.wsecond', wv: { who: s3.list[1][0] } } });
      S.push({ line: 4, k: 'f.db.send', scene: all });
    }
    S.forEach(function (s) { if (s.q && s.scene.count !== null) s.scene = Object.assign({}, s.scene, { ask: true }); });
    return done('db', gen('db', S), { rows: DB_ROWS.length });
  };

  /* -------------------------------------------------- passwords and phishing */
  var PW_CHECKS = [function (p) { return p.length >= 12; }, function (p) { return /[A-Z]/.test(p); }, function (p) { return /[a-z]/.test(p); }, function (p) { return /[0-9]/.test(p); }, function (p) { return /[^A-Za-z0-9]/.test(p); }];
  function pwChecks(p) { return PW_CHECKS.map(function (f) { return f(p); }); }
  var PWS = ['penguin', 'Penguin2020', 'Ice#Pond-7-Waddles!'];
  var MSGS = {
    prize: { from: 'winner@free-prizes.example.net', link: 'www.icepost.example/prize', real: 'icepost.example.login-check.net' },
    account: { from: 'security@icepost-help.example.org', link: 'www.icepost.example/help', real: 'icepost-help.example.org' }
  };
  EX.sec = [{ key: 'l.exSec1', vars: {}, id: 'pw' }, { key: 'l.exSec2', vars: {}, id: 'prize' }, { key: 'l.exSec3', vars: {}, id: 'account' }];
  B.sec = function (E) {
    var S = [];
    if (E.id === 'pw') {
      var sc = PWS.map(function (p) { var c = pwChecks(p); return { mode: 'pw', pw: p, checks: c, score: c.filter(Boolean).length }; });
      S.push({ line: 0, k: 'f.sec.p0', scene: { mode: 'pw', pw: '', checks: [], score: 0 } });
      S.push({ line: 0, k: 'f.sec.p1', v: { pw: PWS[0], n: sc[0].score }, scene: sc[0], q: { k: 'f.sec.qn', v: { pw: PWS[0] }, opts: nOpts(sc[0].score), ans: String(sc[0].score), wk: 'f.sec.wn', wv: { n: sc[0].score } } });
      S.push({ line: 0, k: 'f.sec.p2', v: { pw: PWS[1], n: sc[1].score }, scene: sc[1], q: { k: 'f.sec.qimp', opts: [{ id: 'a', label: t('o.sec.imp.a') }, { id: 'b', label: t('o.sec.imp.b') }, { id: 'c', label: t('o.sec.imp.c') }], ans: 'a', wk: 'f.sec.wimp' } });
      S.push({ line: 0, k: 'f.sec.p3', v: { pw: PWS[2], n: sc[2].score }, scene: sc[2], q: { k: 'f.sec.qstrong', opts: three(PWS, PWS[2], 2), ans: PWS[2], wk: 'f.sec.wstrong' } });
      S.push({ line: 1, k: 'f.sec.p4', scene: { mode: 'pw', pw: '', checks: [], score: 0 } });
      return done('sec', gen('sec', S), { scores: sc.map(function (x) { return x.score; }) });
    }
    var M = MSGS[E.id];
    function ms(n) { return { mode: 'msg', id: E.id, from: M.from, link: M.link, real: M.real, shown: n }; }
    S.push({ line: 3, k: 'f.sec.m0', scene: ms(0) });
    S.push({ line: 3, k: 'f.sec.m1', scene: ms(1) });
    S.push({ line: 3, k: 'f.sec.m2', scene: ms(2), q: { k: 'f.sec.qhurry', opts: [{ id: 'a', label: t('o.sec.hurry.a') }, { id: 'b', label: t('o.sec.hurry.b') }, { id: 'c', label: t('o.sec.hurry.c') }], ans: 'b', wk: 'f.sec.whurry' } });
    S.push({ line: 2, k: 'f.sec.m3', scene: ms(3), q: { k: 'f.sec.qpass', opts: [{ id: 'no', label: t('o.sec.pass.no') }, { id: 'yes1', label: t('o.sec.pass.yes1') }, { id: 'yes2', label: t('o.sec.pass.yes2') }], ans: 'no', wk: 'f.sec.wpass' } });
    S.push({ line: 3, k: 'f.sec.m4', scene: ms(4) });
    S.push({ line: 4, k: 'f.sec.m5', scene: ms(4), q: { k: 'f.sec.qdo', opts: [{ id: 'a', label: t('o.sec.do.a') }, { id: 'b', label: t('o.sec.do.b') }, { id: 'c', label: t('o.sec.do.c') }], ans: 'c', wk: 'f.sec.wdo' } });
    return done('sec', gen('sec', S), { clues: 4 });
  };

  /* ---------------------------------------------------------- digital citizenship */
  var CIT = {
    p1: { topic: 'priv', ans: 'b' }, k1: { topic: 'kind', ans: 'c' }, p2: { topic: 'priv', ans: 'a' },
    c1: { topic: 'credit', ans: 'b' }, l1: { topic: 'credit', ans: 'c' }, s1: { topic: 'source', ans: 'a' }, c2: { topic: 'credit', ans: 'b' }
  };
  EX.cit = [{ key: 'l.exCit1', vars: {}, id: 'one', list: ['p1', 'k1', 'p2'], i: 'f.cit.i1', e: 'f.cit.e1' }, { key: 'l.exCit2', vars: {}, id: 'two', list: ['c1', 'l1', 's1', 'c2'], i: 'f.cit.i2', e: 'f.cit.e2' }];
  B.cit = function (E) {
    var S = [{ line: 0, k: E.i, scene: { topic: 'intro', sc: '' } }];
    E.list.forEach(function (id) {
      var c = CIT[id];
      S.push({ line: { priv: 0, kind: 1, credit: 2, source: 3 }[c.topic], k: 'f.cit.' + id, scene: { topic: c.topic, sc: id }, q: { k: 'f.cit.q', opts: ['a', 'b', 'c'].map(function (o) { return { id: o, label: t('o.cit.' + id + '.' + o) }; }), ans: c.ans, wk: 'f.cit.w.' + id } });
    });
    S.push({ line: 4, k: E.e, scene: { topic: 'intro', sc: '' } });
    return done('cit', gen('cit', S), { scenarios: E.list.length });
  };

  return { pwChecks: pwChecks, evalFormula: evalFormula, TREES: TREES, DB_ROWS: DB_ROWS, PWS: PWS, CIT: CIT, findPath: findPath };
});
