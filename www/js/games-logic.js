/* Levels and rules for the small penguin games (bits, higher or lower, code breaker, order, sorting bins,
   folder quest, penguin detective, phish spotter, formula factory, bubble dock). Pure logic, no DOM. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GamesLogic = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var L = [];
  function add(o) { L.push(o); }

  /* ---- binary cards: switch cards on so they add up to the target ---- */
  add({ id: 'bt1', algo: 'bits', cards: [8, 4, 2, 1], target: 5 });
  add({ id: 'bt2', algo: 'bits', cards: [8, 4, 2, 1], target: 11 });
  add({ id: 'bt3', algo: 'bits', cards: [8, 4, 2, 1], target: 14 });
  add({ id: 'bt4', algo: 'bits', cards: [16, 8, 4, 2, 1], target: 19 });
  add({ id: 'bt5', algo: 'bits', cards: [16, 8, 4, 2, 1], target: 27 });
  function cardsSum(level, on) { return level.cards.reduce(function (s, c, i) { return s + (on[i] ? c : 0); }, 0); }

  /* ---- higher or lower: binary search for a secret number ---- */
  add({ id: 'bn1', algo: 'bin', max: 16 });
  add({ id: 'bn2', algo: 'bin', max: 100 });
  add({ id: 'bn3', algo: 'bin', max: 1000 });
  function binPar(level) { return Math.ceil(Math.log(level.max + 1) / Math.LN2); } // the most guesses perfect middle-guessing ever needs
  function binHint(secret, guess) { return guess === secret ? 'hit' : guess < secret ? 'higher' : 'lower'; }
  function binStars(level, guesses) { var p = binPar(level); return guesses <= p ? 3 : guesses <= p + 2 ? 2 : 1; }

  /* ---- code breaker: turn the dial until the message makes sense ---- */
  add({ id: 'cp1', algo: 'cipher', plain: 'FISH', shift: 3 });
  add({ id: 'cp2', algo: 'cipher', plain: 'PENGUIN', shift: 7 });
  add({ id: 'cp3', algo: 'cipher', plain: 'COMPUTER', shift: 11 });
  add({ id: 'cp4', algo: 'cipher', plain: 'ALGORITHM', shift: 17 });
  function shiftText(s, k) { return s.replace(/[A-Z]/g, function (c) { return String.fromCharCode((c.charCodeAt(0) - 65 + k + 26) % 26 + 65); }); }

  /* ---- put things in order (tap them one by one) ---- */
  add({ id: 'od1', algo: 'net', order: ['HEL', 'LO ', 'PEN', 'GUI', 'NS'], perm: [3, 0, 4, 2, 1], numbered: true });
  add({ id: 'od2', algo: 'net', order: ['ICE', ' AN', 'D S', 'NOW', ' ARE', ' FUN'], perm: [4, 1, 5, 0, 3, 2], numbered: true });
  add({ id: 'od3', algo: 'net', order: ['TH', 'E ', 'PA', 'CK', 'ET', 'S ', 'AR', 'RI', 'VE'], perm: [6, 2, 8, 0, 4, 7, 1, 5, 3], numbered: true });
  add({ id: 'ow1', algo: 'algo', steps: 'toast', n: 5, perm: [2, 4, 0, 3, 1] });
  add({ id: 'ow2', algo: 'algo', steps: 'plant', n: 5, perm: [3, 0, 4, 1, 2] });
  add({ id: 'ow3', algo: 'algo', steps: 'bag', n: 6, perm: [4, 1, 5, 2, 0, 3] });

  /* ---- sorting bins ---- */
  add({ id: 'bn_hw1', algo: 'hw', bins: ['in', 'out', 'sto'], items: [['k', 'keyboard', 'in'], ['k', 'screen', 'out'], ['k', 'mic', 'in'], ['k', 'usb', 'sto'], ['k', 'speakers', 'out'], ['k', 'mouse', 'in']] });
  add({ id: 'bn_hw2', algo: 'hw', bins: ['in', 'cpu', 'mem', 'sto', 'out'], items: [['k', 'printer', 'out'], ['k', 'cpu', 'cpu'], ['k', 'ram', 'mem'], ['k', 'disk', 'sto'], ['k', 'touch', 'in'], ['k', 'headphones', 'out'], ['k', 'camera', 'in'], ['k', 'flash', 'sto']] });
  add({ id: 'bn_ty1', algo: 'types', bins: ['num', 'text', 'bool'], items: [['t', '7', 'num'], ['t', '"7"', 'text'], ['t', 'true', 'bool'], ['t', '3.5', 'num'], ['t', '"cat"', 'text'], ['t', 'false', 'bool'], ['t', '100', 'num'], ['t', '"hello"', 'text']] });
  add({ id: 'bn_ty2', algo: 'types', bins: ['num', 'text', 'bool'], items: [['t', '0', 'num'], ['t', '"0"', 'text'], ['t', '"true"', 'text'], ['t', 'true', 'bool'], ['t', '-2', 'num'], ['t', '"3.14"', 'text'], ['t', '2.5', 'num'], ['t', '5 > 3', 'bool'], ['t', '"a"', 'text']] });

  /* ---- folder quest ---- */
  function dir(n, c) { return { n: n, c: c }; }
  function file(n) { return { n: n }; }
  var TREES = {
    q1: dir('Home', [dir('Games', [file('puzzle.txt'), file('scores.txt')]), dir('Photos', [file('snow.png'), file('igloo.png')]), dir('Music', [file('waves.mp3')])]),
    q2: dir('Home', [dir('School', [dir('Maths', [file('sums.txt')]), dir('Science', [file('ice-notes.txt'), file('chart.png')])]), dir('Pictures', [file('family.png')])]),
    q3: dir('Home', [dir('Projects', [dir('Story', [file('chapter1.txt'), file('cover.png')]), dir('Code', [dir('Game', [file('main.js'), file('levels.txt')]), dir('Notes', [file('todo.txt')])])]), dir('Downloads', [file('setup.zip')]), dir('Music', [dir('Chill', [file('lofi.mp3')])])])
  };
  add({ id: 'fq1', algo: 'os', tree: 'q1', file: 'igloo.png' });
  add({ id: 'fq2', algo: 'os', tree: 'q2', file: 'ice-notes.txt' });
  add({ id: 'fq3', algo: 'os', tree: 'q3', file: 'levels.txt' });
  function pathTo(node, name, trail) {
    var here = trail.concat(node.n);
    if (!node.c) return node.n === name ? here : null;
    for (var i = 0; i < node.c.length; i++) { var r = pathTo(node.c[i], name, here); if (r) return r; }
    return null;
  }
  function holds(node, name) { return !!pathTo(node, name, []); }

  /* ---- penguin detective: build a filter that picks exactly the target penguins ---- */
  var PENGUINS = [['Waddle', 4, 'A', 3], ['Snow', 2, 'B', 5], ['Pebble', 6, 'A', 2], ['Flip', 3, 'B', 4], ['Mochi', 5, 'B', 6], ['Ziggy', 1, 'B', 1]];
  var COLS = ['age', 'colony', 'fish'], COLIDX = { age: 1, colony: 2, fish: 3 }, VALUES = { age: [1, 2, 3, 4, 5, 6], colony: ['A', 'B'], fish: [1, 2, 3, 4, 5, 6] }, OPS = { age: ['>', '<', '='], colony: ['='], fish: ['>', '<', '='] };
  function condMatch(row, c) { var v = row[COLIDX[c.col]]; return c.op === '=' ? v === c.val : c.op === '>' ? v > c.val : v < c.val; }
  function pick(conds) { return PENGUINS.filter(function (r) { return conds.every(function (c) { return condMatch(r, c); }); }).map(function (r) { return r[0]; }); }
  function det(id, conds, n) { return { id: id, algo: 'db', conds: n, target: pick(conds), sol: conds }; }
  add(det('dt1', [{ col: 'colony', op: '=', val: 'A' }], 1));
  add(det('dt2', [{ col: 'age', op: '>', val: 3 }], 1));
  add(det('dt3', [{ col: 'fish', op: '<', val: 3 }], 1));
  add(det('dt4', [{ col: 'colony', op: '=', val: 'B' }, { col: 'fish', op: '>', val: 3 }], 2));
  add(det('dt5', [{ col: 'colony', op: '=', val: 'B' }, { col: 'age', op: '>', val: 2 }], 2));

  /* ---- phish spotter: tap the clues ---- */
  add({ id: 'ps1', algo: 'sec', msg: 'prize', from: 'winner@free-prizes.example.net', link: 'www.icepost.example/prize', real: 'icepost.example.login-check.net', clues: ['from', 'hurry', 'secret', 'link'] });
  add({ id: 'ps2', algo: 'sec', msg: 'account', from: 'security@icepost-help.example.org', link: 'www.icepost.example/help', real: 'icepost-help.example.org', clues: ['from', 'hurry', 'secret', 'link'] });
  add({ id: 'ps3', algo: 'sec', msg: 'photo', from: 'teacher@sunny-school.example', link: '', real: '', clues: [] });
  add({ id: 'ps4', algo: 'sec', msg: 'parcel', from: 'parcel-update@post-fast.example.net', link: 'www.postfast.example/track', real: 'post-fast.example.net.track-me.example', clues: ['from', 'hurry', 'link'] });

  /* ---- formula factory ---- */
  add({ id: 'fx1', algo: 'sheet', cells: { A1: 4, B1: 6 }, tokens: ['A1', 'B1', '+', '*'], target: 10 });
  add({ id: 'fx2', algo: 'sheet', cells: { A1: 3, B1: 5, A2: 2 }, tokens: ['A1', 'B1', 'A2', '+', '*'], target: 17 });
  add({ id: 'fx3', algo: 'sheet', cells: { A1: 2, A2: 5, A3: 3, A4: 6 }, tokens: ['A1', 'A2', 'A3', 'A4', '+', 'SUM(A1:A4)', 'MAX(A1:A4)'], target: 16 });
  add({ id: 'fx4', algo: 'sheet', cells: { A1: 2, A2: 9, A3: 3, A4: 6 }, tokens: ['A1', 'A2', 'A3', 'A4', '+', '*', 'SUM(A1:A4)', 'MAX(A1:A4)'], target: 18 });
  var RANGE = /^(SUM|MAX)\(([A-Z]\d+):([A-Z]\d+)\)$/;
  function operand(tok, cells) {
    var m = RANGE.exec(tok);
    if (!m) return cells[tok];
    var a = m[2], b = m[3], vals = [];
    for (var r = +a.slice(1); r <= +b.slice(1); r++) for (var c = a.charCodeAt(0); c <= b.charCodeAt(0); c++) { var v = cells[String.fromCharCode(c) + r]; if (v !== undefined) vals.push(v); }
    return m[1] === 'SUM' ? vals.reduce(function (s, x) { return s + x; }, 0) : Math.max.apply(null, vals);
  }
  /** Work out a formula made of tokens: operand operator operand ... (times before plus). Returns null if it is not complete. */
  function evalTokens(tokens, cells) {
    if (!tokens.length || tokens.length % 2 === 0) return null;
    var nums = [], ops = [], i;
    for (i = 0; i < tokens.length; i++) {
      if (i % 2 === 0) { if (tokens[i] === '+' || tokens[i] === '*') return null; var v = operand(tokens[i], cells); if (v === undefined) return null; nums.push(v); }
      else { if (tokens[i] !== '+' && tokens[i] !== '*') return null; ops.push(tokens[i]); }
    }
    var n2 = [nums[0]], o2 = [];
    for (i = 0; i < ops.length; i++) { if (ops[i] === '*') n2[n2.length - 1] *= nums[i + 1]; else { o2.push('+'); n2.push(nums[i + 1]); } }
    return n2.reduce(function (s, x) { return s + x; }, 0);
  }

  /* ---- bubble dock: swap neighbours until the penguins are in order ---- */
  add({ id: 'bd1', algo: 'bs', data: [3, 1, 2] });
  add({ id: 'bd2', algo: 'bs', data: [4, 2, 5, 1, 3] });
  add({ id: 'bd3', algo: 'bs', data: [5, 3, 6, 2, 4, 1] });
  function isSorted(a) { for (var i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false; return true; }

  return { LEVELS: L, cardsSum: cardsSum, binPar: binPar, binHint: binHint, binStars: binStars, shiftText: shiftText, TREES: TREES, pathTo: pathTo, holds: holds,
    PENGUINS: PENGUINS, COLS: COLS, VALUES: VALUES, OPS: OPS, condMatch: condMatch, pick: pick, evalTokens: evalTokens, isSorted: isSorted };
});
