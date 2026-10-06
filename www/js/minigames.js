/* The small penguin games. Each game gets a "ctx" from game.js (screen shell, result card, timers). */
(function () {
  'use strict';
  var G = window.GamesLogic, tx = window.I18n.t;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function $(s) { return document.querySelector(s); }
  function say(text, cls) { var m = $('#msg'); if (m) { m.className = 'msg ' + (cls || ''); m.innerHTML = text; } }
  function body(html) { var g = $('#gm'); g.innerHTML = html; var h = g.offsetHeight; if (h > (parseInt(g.style.minHeight, 10) || 0)) g.style.minHeight = h + 'px'; } // the area only ever grows, so the buttons below never jump back and forth
  function flash(el) { if (el) { el.classList.add('wrong'); setTimeout(function () { el.classList.remove('wrong'); }, 400); } }
  function snd(n) { if (window.Sound) window.Sound.play(n); }
  function shuffled(items, perm) { return perm.map(function (i) { return i; }); }
  var START = {};

  /* ------------------------------------------------------------ binary cards */
  START.bits = function (level, ctx) {
    var on = level.cards.map(function () { return false; }), mistakes = 0, done = false;
    function draw() {
      var s = G.cardsSum(level, on);
      body('<div class="btgoal"><small>' + tx('bt.target') + '</small><b>' + level.target + '</b></div><div class="btcards">' + level.cards.map(function (c, i) {
        return '<button class="btcard ' + (on[i] ? 'on' : 'off') + '" data-act="flip" data-i="' + i + '" aria-pressed="' + on[i] + '"><b>' + c + '</b><span>' + (on[i] ? 1 : 0) + '</span></button>';
      }).join('') + '</div><div class="btsum"><small>' + tx('bt.sum') + '</small> <b>' + s + '</b></div><div class="bitsnote">' + on.map(function (v) { return v ? 1 : 0; }).join(' ') + '</div>');
    }
    ctx.begin(level, '<div id="gm"></div>', '<button class="btn primary" data-act="check">' + tx('gm.check') + '</button>', function (a, t) {
      if (done) return;
      if (a === 'flip') { var i = +t.dataset.i; on[i] = !on[i]; draw(); say(''); snd('ok'); }
      else if (a === 'check') {
        var s = G.cardsSum(level, on);
        if (s === level.target) { done = true; ctx.finish(level, mistakes, tx('bt.won', { n: level.target, b: on.map(function (v) { return v ? 1 : 0; }).join('') })); }
        else { mistakes++; snd('no'); say(tx('bt.wrong', { s: s, n: level.target }), 'bad'); }
      }
    });
    draw(); say(tx('bt.goal', { n: level.target }));
  };

  /* ------------------------------------------------------- higher or lower */
  START.bin = function (level, ctx) {
    var secret = 1 + Math.floor(Math.random() * level.max), cur = Math.ceil(level.max / 2), hist = [], done = false;
    function draw() {
      body('<div class="bnbox"><button class="stp" data-act="step" data-d="-10">−10</button><button class="stp" data-act="step" data-d="-1">−1</button><b class="bnnum">' + cur + '</b><button class="stp" data-act="step" data-d="1">+1</button><button class="stp" data-act="step" data-d="10">+10</button></div>' +
        '<div class="panel"><h4>' + tx('bn.hist') + '</h4><div class="chips">' + (hist.length ? hist.map(function (h) { return '<span class="chip ' + h.r + '">' + h.g + ' ' + (h.r === 'higher' ? '▲' : '▼') + '</span>'; }).join('') : '<em>' + tx('cx.none') + '</em>') + '</div></div>');
    }
    ctx.begin(level, '<div id="gm"></div>', '<button class="btn primary" data-act="guess">' + tx('bn.guess') + '</button>', function (a, t) {
      if (done) return;
      if (a === 'step') { cur = Math.min(level.max, Math.max(1, cur + (+t.dataset.d))); draw(); }
      else if (a === 'guess') {
        var r = G.binHint(secret, cur);
        if (r === 'hit') { done = true; hist.push({ g: cur, r: 'higher' }); ctx.finishStars(level, G.binStars(level, hist.length), tx('bn.won', { s: secret, n: hist.length, p: G.binPar(level), max: level.max })); return; }
        if (hist.some(function (h) { return h.g === cur; })) { say(tx('bn.again'), 'bad'); return; }
        hist.push({ g: cur, r: r }); draw(); snd('no');
        say(tx(r === 'higher' ? 'bn.sayHigher' : 'bn.sayLower', { g: cur }), '');
      }
    });
    draw(); say(tx('bn.goal', { max: level.max }));
  };

  /* ---------------------------------------------------------- code breaker */
  START.cipher = function (level, ctx) {
    var coded = G.shiftText(level.plain, level.shift), d = 0, mistakes = 0, done = false;
    function draw() {
      var dec = G.shiftText(coded, -d);
      body('<div class="cprow"><small>' + tx('cp.coded') + '</small><code>' + esc(coded) + '</code></div><div class="cpdial"><button class="stp" data-act="dial" data-d="-1">◀</button><div><small>' + tx('cp.dial', { d: d }) + '</small></div><button class="stp" data-act="dial" data-d="1">▶</button></div><div class="cprow"><small>' + tx('cp.decoded') + '</small><code class="dec">' + esc(dec) + '</code></div>');
    }
    ctx.begin(level, '<div id="gm"></div>', '<button class="btn primary" data-act="found">' + tx('cp.found') + '</button>', function (a, t) {
      if (done) return;
      if (a === 'dial') { d = (d + (+t.dataset.d) + 26) % 26; draw(); say(''); }
      else if (a === 'found') {
        if (d === level.shift) { done = true; ctx.finish(level, mistakes, tx('cp.won', { w: level.plain, k: level.shift })); }
        else { mistakes++; snd('no'); say(tx('cp.wrong'), 'bad'); }
      }
    });
    draw(); say(tx('cp.goal'));
  };

  /* ------------------------------------------------- put in order (net, algo) */
  START.net = START.algo = function (level, ctx) {
    var net = !!level.order, n = net ? level.order.length : level.n, built = 0, mistakes = 0, done = false;
    function label(i) { return net ? level.order[i] : tx('o.ow.' + level.steps + '.' + i); }
    function draw() {
      var msg = net ? level.order.slice(0, built).join('') : '';
      body((net ? '<div class="odmsg"><small>' + tx('od.built') + '</small><code>' + esc(msg) + '▁</code></div>' : '<ol class="odlist">' + Array.apply(null, Array(built)).map(function (_, i) { return '<li>' + esc(label(i)) + '</li>'; }).join('') + '</ol>') +
        '<div class="odpool">' + level.perm.filter(function (i) { return i >= built; }).map(function (i) {
          return '<button class="odit' + (net ? ' pk' : '') + '" data-act="pick" data-i="' + i + '">' + (net && level.numbered ? '<i>#' + (i + 1) + '</i>' : '') + '<span>' + esc(label(i)) + '</span></button>';
        }).join('') + '</div>');
    }
    ctx.begin(level, '<div id="gm"></div>', '', function (a, t) {
      if (done || a !== 'pick') return;
      var i = +t.dataset.i;
      if (i === built) { built++; draw(); snd('ok'); if (built === n) { done = true; ctx.finish(level, mistakes, net ? tx('od.wonNet', { m: level.order.join('') }) : tx('od.wonAlgo')); } else say(''); }
      else { mistakes++; flash(t); snd('no'); say(net ? tx('od.wrongNet', { n: built + 1 }) : tx('od.wrongAlgo'), 'bad'); }
    });
    draw(); say(tx(net ? 'od.goalNet' : 'od.goalAlgo'));
  };

  /* ----------------------------------------------------------- sorting bins */
  START.hw = START.types = function (level, ctx) {
    var hw = level.algo === 'hw', k = 0, mistakes = 0, placed = {}, done = false;
    level.bins.forEach(function (b) { placed[b] = []; });
    function name(it) { return it[0] === 'k' ? tx('o.bn.' + it[1]) : it[1]; }
    function binName(b) { return tx((hw ? 'd.hw.' : 'd.ty.') + b); }
    function draw() {
      var it = level.items[k];
      body((it ? '<div class="sbcard">' + (it[0] === 't' ? '<code>' + esc(it[1]) + '</code>' : '<b>' + esc(name(it)) + '</b>') + '</div>' : '') + '<div class="sbbins n' + level.bins.length + '">' + level.bins.map(function (b) {
        var cap = level.items.filter(function (x) { return x[2] === b; }).length;
        return '<button class="sbbin" data-act="bin" data-b="' + b + '" style="min-height:' + (50 + cap * 34) + 'px"><small>' + esc(binName(b)) + '</small>' + placed[b].map(function (x) { return '<em>' + esc(x) + '</em>'; }).join('') + '</button>';
      }).join('') + '</div>');
    }
    ctx.begin(level, '<div id="gm"></div>', '', function (a, t) {
      if (done || a !== 'bin') return;
      var it = level.items[k], b = t.dataset.b;
      if (it[2] === b) { placed[b].push(name(it)); k++; snd('ok'); draw(); if (k === level.items.length) { done = true; ctx.finish(level, mistakes, tx('sb.won')); } else say(tx('sb.right', { item: name(it), bin: binName(b) }), 'good'); }
      else { mistakes++; flash(t); snd('no'); say(tx('sb.wrong', { item: name(it), bin: binName(b) }), 'bad'); }
    });
    draw(); say(tx(hw ? 'sb.goalHw' : 'sb.goalTy'));
  };

  /* ------------------------------------------------------------ folder quest */
  START.os = function (level, ctx) {
    var root = G.TREES[level.tree], stack = [root], mistakes = 0, done = false;
    function cur() { return stack[stack.length - 1]; }
    function draw() {
      body('<div class="fqgoal"><small>' + tx('fq.find') + '</small><code>' + esc(level.file) + '</code></div><div class="ospath"><small>' + tx('fq.here') + '</small> <code>' + esc(stack.map(function (s) { return s.n; }).join('/')) + '</code></div><div class="fqlist">' +
        cur().c.map(function (c, i) { return '<button class="fqit ' + (c.c ? 'fo' : 'fi') + '" data-act="open" data-i="' + i + '"><i class="' + (c.c ? 'fo' : 'fi') + '"></i><span>' + esc(c.n) + '</span></button>'; }).join('') + '</div>' +
        (stack.length > 1 ? '<button class="btn small" data-act="up">' + tx('fq.up') + '</button>' : ''));
    }
    ctx.begin(level, '<div id="gm"></div>', '', function (a, t) {
      if (done) return;
      if (a === 'up') { stack.pop(); draw(); say(''); }
      else if (a === 'open') {
        var c = cur().c[+t.dataset.i];
        if (c.c) {
          stack.push(c); draw();
          if (G.holds(c, level.file)) say(tx('fq.ok', { f: level.file, d: c.n }), 'good');
          else { mistakes++; snd('no'); say(tx('fq.dead', { f: level.file, d: c.n }), 'bad'); }
        } else if (c.n === level.file) { done = true; ctx.finish(level, mistakes, tx('fq.won', { p: stack.map(function (s) { return s.n; }).concat(c.n).join('/') })); }
        else { mistakes++; flash(t); snd('no'); say(tx('fq.wrongFile', { f: level.file }), 'bad'); }
      }
    });
    draw(); say(tx('fq.goal', { f: level.file }));
  };

  /* ------------------------------------------------------ penguin detective */
  START.db = function (level, ctx) {
    var conds = [], mistakes = 0, done = false, i;
    for (i = 0; i < level.conds; i++) conds.push({ col: 'age', op: '>', val: 1 });
    function ruleText() { return conds.map(function (c) { return tx('d.db.' + c.col) + ' ' + c.op + ' ' + c.val; }).join(' ' + tx('dt.and') + ' '); }
    function draw() {
      var hit = G.pick(conds);
      body('<div class="dtgoal"><small>' + tx('dt.found') + '</small>' + level.target.map(function (n) { return '<span class="chip">' + esc(n) + '</span>'; }).join('') + '</div><div class="dtrules">' + conds.map(function (c, k) {
        return '<div class="dtrule">' + (k ? '<small>' + tx('dt.and') + '</small>' : '<small>' + tx('dt.rule') + '</small>') + '<button data-act="cyc" data-k="' + k + '" data-w="col">' + tx('d.db.' + c.col) + '</button><button data-act="cyc" data-k="' + k + '" data-w="op">' + c.op + '</button><button data-act="cyc" data-k="' + k + '" data-w="val">' + c.val + '</button></div>';
      }).join('') + '</div><table class="dbt"><tr>' + ['name', 'age', 'colony', 'fish'].map(function (c) { return '<th>' + tx('d.db.' + c) + '</th>'; }).join('') + '</tr>' +
        G.PENGUINS.map(function (r) { return '<tr class="' + (hit.indexOf(r[0]) >= 0 ? 'on' : 'off') + '">' + r.map(function (v) { return '<td>' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>');
    }
    function next(list, v) { return list[(list.indexOf(v) + 1) % list.length]; }
    ctx.begin(level, '<div id="gm"></div>', '<button class="btn primary" data-act="check">' + tx('dt.check') + '</button>', function (a, t) {
      if (done) return;
      if (a === 'cyc') {
        var c = conds[+t.dataset.k], w = t.dataset.w;
        if (w === 'col') { c.col = next(G.COLS, c.col); c.op = G.OPS[c.col][0]; c.val = G.VALUES[c.col][0]; }
        else if (w === 'op') c.op = next(G.OPS[c.col], c.op);
        else c.val = next(G.VALUES[c.col], c.val);
        draw(); say(tx('dt.tap'));
      } else if (a === 'check') {
        var got = G.pick(conds), want = level.target;
        if (got.length === want.length && want.every(function (n) { return got.indexOf(n) >= 0; })) { done = true; ctx.finish(level, mistakes, tx('dt.won', { rule: ruleText() })); }
        else { mistakes++; snd('no'); say(tx('dt.wrong', { got: got.length ? got.join(', ') : tx('dt.none'), want: want.join(', ') }), 'bad'); }
      }
    });
    draw(); say(tx('dt.goal'));
  };

  /* ------------------------------------------------------------ phish spotter */
  START.sec = function (level, ctx) {
    var found = [], mistakes = 0, done = false, m = 'd.sec.' + level.msg;
    function seg(id, text, cls) {
      var isFound = found.indexOf(id) >= 0;
      return '<span class="seg' + (isFound ? ' hot' : '') + (cls ? ' ' + cls : '') + '" data-act="seg" data-id="' + id + '" role="button" tabindex="0">' + esc(text) + (isFound ? '<em class="clue">✓</em>' : '') + '</span>';
    }
    function draw() {
      body('<div class="msgc"><div class="msgrow"><small>' + tx('d.sec.from') + '</small>' + seg('from', level.from, 'mono') + '</div><div class="msgrow"><small>' + tx('d.sec.subject') + '</small>' + seg('subj', tx(m + '.subj')) + '</div>' +
        '<div class="msgbody">' + seg('hurry', tx(m + '.hurry')) + ' ' + seg('secret', tx(m + '.secret')) + '</div>' +
        (level.link ? '<div class="msgrow link"><small>' + tx('d.sec.link') + '</small>' + seg('link', level.link, 'u') + '</div>' : '') +
        (found.indexOf('link') >= 0 ? '<div class="msgreal">' + tx('d.sec.real') + ' <code>' + esc(level.real) + '</code></div>' : '') + '</div>' +
        '<div class="rbinfo">' + tx('ps.found', { n: found.length, m: level.clues.length }) + '</div>');
    }
    ctx.begin(level, '<div id="gm"></div>', '<button class="btn" data-act="safe">' + tx('ps.safeBtn') + '</button>', function (a, t) {
      if (done) return;
      if (a === 'seg') {
        var id = t.dataset.id;
        if (found.indexOf(id) >= 0) return;
        if (level.clues.indexOf(id) >= 0) {
          found.push(id); draw(); snd('ok');
          if (found.length === level.clues.length) { done = true; ctx.finish(level, mistakes, tx('ps.won')); }
          else say(tx('ps.good', { why: tx('ps.why.' + id) }), 'good');
        } else { mistakes++; flash(t); snd('no'); say(tx('ps.notClue'), 'bad'); }
      } else if (a === 'safe') {
        if (!level.clues.length) { done = true; ctx.finish(level, mistakes, tx('ps.safeRight')); }
        else { mistakes++; snd('no'); say(tx('ps.safeWrong'), 'bad'); }
      }
    });
    draw(); say(tx('ps.goal'));
  };

  /* --------------------------------------------------------- formula factory */
  START.sheet = function (level, ctx) {
    var toks = [], mistakes = 0, done = false, COLS = 'ABCD', rows = 0, cols = 0;
    Object.keys(level.cells).forEach(function (r) { rows = Math.max(rows, +r.slice(1)); cols = Math.max(cols, COLS.indexOf(r[0]) + 1); });
    function show(t) { return t === '*' ? '×' : t; }
    function draw() {
      var res = G.evalTokens(toks, level.cells), g = '<table class="sht"><tr><th></th>';
      for (var c = 0; c < cols; c++) g += '<th>' + COLS[c] + '</th>';
      g += '</tr>';
      for (var r = 1; r <= rows; r++) { g += '<tr><th>' + r + '</th>'; for (c = 0; c < cols; c++) { var v = level.cells[COLS[c] + r]; g += '<td>' + (v === undefined ? '' : v) + '</td>'; } g += '</tr>'; }
      body('<div class="btgoal"><small>' + tx('fx.goalLabel') + '</small><b>' + level.target + '</b></div>' + g + '</table><div class="shbar"><b>=</b><code>' + (toks.length ? esc(toks.map(show).join(' ')) : '…') + '</code></div><div class="bitsnote">' + (res !== null ? tx('fx.shows') + ' ' + res : '') + '</div>' +
        '<div class="fxpal">' + level.tokens.map(function (t) { return '<button class="fxtok' + (t === '+' || t === '*' ? ' op' : '') + '" data-act="tok" data-t="' + esc(t) + '">' + esc(show(t)) + '</button>'; }).join('') + '</div>');
    }
    ctx.begin(level, '<div id="gm"></div>', '<button class="btn primary" data-act="check">' + tx('gm.check') + '</button><button class="btn" data-act="undo">' + tx('rb.undo') + '</button><button class="btn" data-act="clear">' + tx('rb.clear') + '</button>', function (a, t) {
      if (done) return;
      if (a === 'tok') { if (toks.length < 7) toks.push(t.dataset.t); draw(); say(''); }
      else if (a === 'undo') { toks.pop(); draw(); say(''); }
      else if (a === 'clear') { toks = []; draw(); say(''); }
      else if (a === 'check') {
        var r = G.evalTokens(toks, level.cells);
        if (r === null) { say(tx('fx.incomplete'), 'bad'); return; }
        if (r === level.target) { done = true; ctx.finish(level, mistakes, tx('fx.won', { f: '=' + toks.map(show).join(' '), n: r })); }
        else { mistakes++; snd('no'); say(tx('fx.wrong', { r: r, n: level.target }), 'bad'); }
      }
    });
    draw(); say(tx('fx.goal', { n: level.target }));
  };

  /* ------------------------------------------------------------- bubble dock */
  START.bs = function (level, ctx) {
    var arr = level.data.slice(), mistakes = 0, done = false;
    function draw() {
      body('<div class="bdrow">' + arr.map(function (v, i) { return '<button class="bdp" data-act="pen" data-i="' + i + '" aria-label="' + v + '">' + ctx.penguin(v) + '</button>'; }).join('') + '</div>');
    }
    ctx.begin(level, '<div id="gm"></div>', '', function (a, t) {
      if (done || a !== 'pen') return;
      var i = +t.dataset.i;
      if (i >= arr.length - 1) { say(tx('bd.last'), 'bad'); return; }
      if (arr[i] > arr[i + 1]) {
        var x = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = x; draw(); snd('ok'); say(tx('bd.swap'), 'good');
        if (G.isSorted(arr)) { done = true; ctx.finish(level, mistakes, tx('bd.won')); }
      } else { mistakes++; flash(t); snd('no'); say(tx('bd.no'), 'bad'); }
    });
    draw(); say(tx('bd.goal'));
  };

  window.MiniGames = { LEVELS: G.LEVELS, start: START };
})();
