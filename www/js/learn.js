/* Lesson pages: goal, animated player, "story in pictures" storyboard, theory, facts and pseudocode. */
(function () {
  'use strict';
  var A = window.Algos, F = window.Frames, G = window.Graphs, D = window.Draw, T = window.Content, C = window.PenguinCore;
  var tx = window.I18n.t;
  var $app = document.getElementById('app');

  var SPEEDS = [1900, 1300, 900, 550, 320];
  var TYPE = { bfs: 'graph', dfs: 'graph', dij: 'graph', topo: 'graph', bf: 'graph', prim: 'graph', kruskal: 'graph', qs: 'sort', bs: 'sort', bin: 'sort', sel: 'sort', ins: 'sort', sq: 'ds', bits: 'prog', loop: 'prog', vars: 'prog', cond: 'prog', bug: 'prog', race: 'prog', cipher: 'prog', robot: 'prog', algo: 'prog', logic: 'prog', types: 'prog', arr: 'prog', func: 'prog', rec: 'prog', hw: 'prog', os: 'prog', sheet: 'prog', db: 'prog', sec: 'prog', cit: 'prog', rep: 'prog', net: 'prog', ai: 'prog', data: 'prog', heap: 'heap', ms: 'merge' };
  var BIN_ARR = [1, 2, 3, 5, 6, 8, 9];
  var BIN_EX = [{ v: 8, key: 'l.binFind' }, { v: 1, key: 'l.binFind' }, { v: 4, key: 'l.binMissing' }];
  var MIXED = { qs: [4, 7, 2, 6, 1, 5, 3], bs: [4, 7, 2, 6, 1, 5, 3], bin: BIN_ARR, sel: [4, 7, 2, 6, 1, 5, 3], ins: [4, 7, 2, 6, 1, 5, 3], heap: [5, 3, 7, 1, 6, 2, 4], ms: [5, 2, 7, 1, 8, 3, 6, 4] };
  var SIZE = { qs: 7, bs: 7, sel: 7, ins: 7, heap: 7, ms: 8 };
  var MINN = { qs: 3, bs: 2, sel: 2, ins: 2, heap: 3, ms: 2 };
  var MAXN = { heap: 7 };
  var L = null, keyHandler = null;

  var ICON = {
    first: '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="5" width="3" height="14" fill="currentColor"/><polygon points="19,5 9,12 19,19" fill="currentColor"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="22" height="22"><polygon points="17,5 7,12 17,19" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 24 24" width="22" height="22"><polygon points="7,5 17,12 7,19" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="26" height="26"><polygon points="7,4 20,12 7,20" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="26" height="26"><rect x="6" y="5" width="4.5" height="14" fill="currentColor"/><rect x="13.5" y="5" width="4.5" height="14" fill="currentColor"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M9 3h6v9h4l-7 9-7-9h4z" fill="currentColor"/></svg>'
  };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function $(sel) { return $app.querySelector(sel); }

  /* ---------- Lifecycle ---------- */
  function leave() {
    if (L && L.timer) clearInterval(L.timer);
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    L = null;
    $app.classList.remove('wide');
    $app.oninput = null;
  }

  function open(kind) {
    leave();
    L = { kind: kind, type: TYPE[kind], i: 0, speed: 3, playing: false, timer: null, ex: 0, preset: 'mixed', els: {} };
    if (L.type !== 'graph' && L.type !== 'ds' && L.type !== 'prog') L.arr = MIXED[kind].slice();
    compute();
    render();
    window.scrollTo(0, 0);
    keyHandler = function (e) {
      if (!L) return;
      var tag = e.target && e.target.tagName;
      if (tag === 'INPUT' && e.target.id === 'nums' && e.key === 'Enter') { applyNumbers(); e.preventDefault(); return; }
      if (tag === 'INPUT') return;
      if (e.key === 'ArrowRight') { pause(); go(L.i + 1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { pause(); go(L.i - 1); e.preventDefault(); }
      else if (e.key === ' ' && tag !== 'BUTTON') { toggle(); e.preventDefault(); }
    };
    document.addEventListener('keydown', keyHandler);
  }

  function compute() {
    if (L.type === 'graph') {
      L.graph = G.graphFor(L.kind);
      var ex = L.graph.examples[L.ex];
      L.data = G.graphFrames(L.kind, L.graph, ex.start, ex.goal);
    } else if (L.type === 'sort') L.data = L.kind === 'bs' ? F.bubbleFrames(L.arr) : L.kind === 'sel' ? F.selectionFrames(L.arr) : L.kind === 'ins' ? F.insertionFrames(L.arr) : L.kind === 'bin' ? F.binaryFrames(L.arr, BIN_EX[L.ex].v) : F.sortFrames(L.arr);
    else if (L.type === 'ds') L.data = F.dsFrames();
    else if (L.type === 'prog') L.data = F.progFrames(L.kind, L.ex);
    else if (L.type === 'heap') L.data = F.heapFrames(L.arr);
    else L.data = F.mergeFrames(L.arr);
    L.i = 0;
    L.story = pickStory();
  }

  /** Up to six key moments, spread evenly through the lesson. */
  function pickStory() {
    var fr = L.data.frames, idx = [];
    fr.forEach(function (f, k) { if (f.ms) idx.push(k); });
    if (idx[0] !== 0) idx.unshift(0);
    if (idx[idx.length - 1] !== fr.length - 1) idx.push(fr.length - 1);
    if (idx.length > 6) {
      var pick = [];
      for (var k = 0; k < 6; k++) pick.push(idx[Math.round(k * (idx.length - 1) / 5)]);
      idx = pick.filter(function (v, k2) { return pick.indexOf(v) === k2; });
    }
    return idx;
  }

  /* ---------- Page ---------- */
  function exampleHTML() {
    var U = T.ui;
    if (L.type === 'graph') {
      if (L.graph.examples.length < 2) return '';
      return '<div class="seg" role="group" aria-label="' + esc(tx('l.examples')) + '">' + L.graph.examples.map(function (ex, k) {
        return '<button data-act="ex" data-i="' + k + '" class="' + (L.ex === k ? 'on' : '') + '">' + esc(tx(ex.key, ex.vars)) + '</button>';
      }).join('') + '</div>';
    }
    if (L.kind === 'bin') {
      return '<div class="seg" role="group" aria-label="' + esc(tx('l.examples')) + '">' + BIN_EX.map(function (ex, k) {
        return '<button data-act="ex" data-i="' + k + '" class="' + (L.ex === k ? 'on' : '') + '">' + esc(tx(ex.key, { v: ex.v })) + '</button>';
      }).join('') + '</div>';
    }
    if (L.type === 'ds') return '';
    if (L.type === 'prog') {
      return '<div class="seg" role="group" aria-label="' + esc(tx('l.examples')) + '">' + F.PROG_EX[L.kind].map(function (ex, k) {
        return '<button data-act="ex" data-i="' + k + '" class="' + (L.ex === k ? 'on' : '') + '">' + esc(tx(ex.key, ex.vars)) + '</button>';
      }).join('') + '</div>';
    }
    var presets = [['mixed', tx('l.mixed')], ['random', tx('l.random')], ['sorted', tx('l.sorted')], ['reversed', tx('l.reversed')]];
    return '<div class="seg" role="group" aria-label="' + esc(tx('l.examples')) + '">' + presets.map(function (p) {
      return '<button data-act="preset" data-p="' + p[0] + '" class="' + (L.preset === p[0] ? 'on' : '') + '">' + p[1] + '</button>';
    }).join('') + '</div>' +
      '<label class="numlabel" for="nums">' + esc(U.numbersLabel) + '</label>' +
      '<div class="numrow"><input id="nums" type="text" inputmode="numeric" autocomplete="off" value="' + L.arr.join(' ') + '">' +
      '<button class="btn small" data-act="apply">' + esc(U.numbersButton) + '</button></div><p class="numerr" id="numerr" role="alert"></p>';
  }

  function render() {
    var X = T[L.kind], U = T.ui, hasPractice = true;
    $app.classList.add('wide');
    $app.innerHTML =
      '<div class="topbar"><button class="icon-btn" data-act="back" aria-label="' + esc(tx('l.back')) + '">‹</button>' +
      '<div class="ttl"><b>' + esc(X.title) + '</b><small>' + esc(X.tag) + '</small></div>' +
      (hasPractice ? '<button class="ghost primary" data-act="practice">' + esc(tx('l.practice')) + '</button>' : '<span class="topspace"></span>') + '</div>' +
      '<div class="lesson">' +
      '<section class="intro"><div class="pip">' + D.penguin(4, true) + '</div><div class="bubble"><h3>' + esc(tx('l.goal')) + '</h3><p class="t-pink">' + esc(X.goal) + '</p></div></section>' +
      '<section class="player card"><div id="stage" class="stage"></div><div id="side"></div>' +
      '<div class="caption"><div class="pipsay">' + D.penguin(2, true) + '</div><div class="said" id="said" aria-live="polite"></div></div>' +
      '<input id="scrub" class="scrub" type="range" min="0" max="' + (L.data.frames.length - 1) + '" value="0" aria-label="' + esc(tx('l.stepAria')) + '">' +
      '<div class="transport">' +
      '<button class="tbtn" data-act="first" aria-label="' + esc(tx('l.first')) + '" title="' + esc(tx('l.first')) + '">' + ICON.first + '</button>' +
      '<button class="tbtn" data-act="prev" aria-label="' + esc(tx('l.prev')) + '" title="' + esc(tx('l.prev')) + '">' + ICON.back + '</button>' +
      '<button class="tbtn play" data-act="toggle" id="playbtn" aria-label="' + esc(tx('l.play')) + '" title="' + esc(tx('l.play')) + '">' + ICON.play + '</button>' +
      '<button class="tbtn" data-act="step" aria-label="' + esc(tx('l.next')) + '" title="' + esc(tx('l.next')) + '">' + ICON.next + '</button>' +
      '<label class="speed">' + esc(tx('l.speed')) + '<input id="speed" type="range" min="1" max="5" value="' + L.speed + '"></label></div>' +
      (exampleHTML() ? '<div class="examples"><h4>' + esc(U.examples) + '</h4>' + exampleHTML() + '</div>' : '') + '</section>' +
      '<section class="storyboard"><h2>' + esc(U.storyTitle) + '</h2><p class="hint">' + esc(U.storyHint) + '</p><div id="story"></div></section>' +
      '<section class="theory">' +
      '<h2>' + esc(U.howTitle) + '</h2>' + X.story.map(function (p) { return '<p class="t-white">' + esc(p) + '</p>'; }).join('') +
      '<ol class="steps t-white">' + X.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
      '<div class="gold-box"><h3>' + esc(U.rememberTitle) + '</h3><p>' + esc(X.remember) + '</p></div>' +
      '<div class="gold-box time"><h3>' + esc(U.timeTitle) + '</h3><div class="formula">' + esc(X.time.formula) + '</div><p class="t-white">' + esc(X.time.text) + '</p></div>' +
      '<div class="two"><div class="note"><h3>' + esc(U.usedTitle) + '</h3><p class="t-white">' + esc(X.used) + '</p></div>' +
      '<div class="note warn"><h3>' + esc(U.watchTitle) + '</h3><p class="t-pink">' + esc(X.watch) + '</p></div></div>' +
      '<details class="codebox"><summary>' + esc(U.codeTitle) + '</summary><p class="hint">' + esc(U.codeHint) + '</p><ol class="code" id="code">' +
      L.data.pseudo.map(function (line) { return '<li>' + esc(line) + '</li>'; }).join('') + '</ol></details>' +
      '</section></div>';

    $app.onclick = onClick;
    $app.oninput = function (e) {
      if (!L) return;
      if (e.target.id === 'scrub') { pause(); go(+e.target.value, true); }
      if (e.target.id === 'speed') { L.speed = +e.target.value; if (L.playing) { clearInterval(L.timer); startTimer(); } }
    };
    if (L.type === 'sort') buildSortStage();
    buildStory();
    draw();
    stabilize();
  }

  function buildStory() {
    var fr = L.data.frames, n = fr.length, html = '';
    L.story.forEach(function (idx, k) {
      var f = fr[idx], pic;
      if (L.type === 'graph') {
        pic = D.graphSVG(L.graph, f, { goal: L.data.goal, start: L.data.start }) + (L.kind === 'dij' || L.kind === 'bf' ? '' : D.side(L.kind, L.graph, f));
      } else if (L.type === 'sort') pic = D.sortRow(f);
      else if (L.type === 'ds') pic = D.dsPanels(f);
      else if (L.type === 'prog') pic = D.progScene(f);
      else if (L.type === 'heap') pic = D.heapSVG(f);
      else pic = D.mergeRows(f);
      if (k) html += '<div class="arrow" aria-hidden="true">' + ICON.arrow + '</div>';
      html += '<figure class="spanel"><div class="snum">' + esc(tx('l.step', { i: idx + 1, n: n })) + '</div><div class="spic">' + pic + '</div><figcaption>' + esc(f.text) + '</figcaption></figure>';
    });
    $('#story').innerHTML = html;
  }

  /* ---------- Events ---------- */
  function onClick(e) {
    var t = e.target.closest('[data-act]'); if (!t || !L) return;
    var a = t.dataset.act;
    if (a === 'back') C.showMenu();
    else if (a === 'practice') {
      var first = C.LEVELS.filter(function (l) { return l.algo === L.kind; })[0];
      if (first) C.openLevel(first, null); else window.Quiz.open(L.kind, 0);
    }
    else if (a === 'first') { pause(); go(0); }
    else if (a === 'prev') { pause(); go(L.i - 1); }
    else if (a === 'step') { pause(); go(L.i + 1); }
    else if (a === 'toggle') toggle();
    else if (a === 'ex') { L.ex = +t.dataset.i; reload(); }
    else if (a === 'preset') {
      L.preset = t.dataset.p;
      L.arr = L.preset === 'mixed' ? MIXED[L.kind].slice() : F.makeArray(L.preset, SIZE[L.kind]);
      reload();
    }
    else if (a === 'apply') applyNumbers();
  }

  function applyNumbers() {
    var box = $('#nums'), res = F.parseNumbers(box ? box.value : '', MINN[L.kind], MAXN[L.kind] || 8);
    if (!res.ok) { $('#numerr').textContent = res.error; return; }
    L.arr = res.arr; L.preset = 'custom';
    reload();
  }

  function reload() {
    pause();
    var y = window.scrollY;
    compute(); render();
    window.scrollTo(0, y);
  }

  /* ---------- Player ---------- */
  function go(i, fromScrub) {
    if (!L) return;
    L.i = Math.max(0, Math.min(L.data.frames.length - 1, i));
    draw(fromScrub);
  }
  function startTimer() {
    L.timer = setInterval(function () {
      if (!L) return;
      if (!document.getElementById('stage')) { pause(); return; }
      if (L.i >= L.data.frames.length - 1) { pause(); return; }
      go(L.i + 1);
    }, SPEEDS[L.speed - 1]);
  }
  function play() {
    if (L.i >= L.data.frames.length - 1) go(0);
    L.playing = true; startTimer(); updatePlayBtn();
  }
  function pause() {
    if (!L) return;
    if (L.timer) { clearInterval(L.timer); L.timer = null; }
    L.playing = false; updatePlayBtn();
  }
  function toggle() { if (!L) return; if (L.playing) pause(); else play(); }
  function updatePlayBtn() {
    var b = $('#playbtn'); if (!b) return;
    b.innerHTML = L.playing ? ICON.pause : ICON.play;
    var lab = tx(L.playing ? 'l.pause' : 'l.play');
    b.setAttribute('aria-label', lab);
    b.title = lab;
  }

  /* Keep the controls still: measure every frame once and give the picture, side panel and speech box the tallest height. */
  function stabilize() {
    if (!L || !document.getElementById('stage')) return;
    var st = $('#stage'), sd = $('#side'), sa = $('#said'), keep = L.i, mh = 0, mside = 0, msaid = 0, i;
    [st, sd, sa].forEach(function (e) { e.style.minHeight = ''; });
    for (i = 0; i < L.data.frames.length; i++) {
      L.i = i; draw(true);
      if (L.type !== 'sort') mh = Math.max(mh, Math.ceil(st.getBoundingClientRect().height));
      mside = Math.max(mside, Math.ceil(sd.getBoundingClientRect().height)); msaid = Math.max(msaid, Math.ceil(sa.getBoundingClientRect().height));
    }
    L.i = keep; draw(false);
    if (mh) st.style.minHeight = mh + 'px';
    if (mside) sd.style.minHeight = mside + 'px';
    sa.style.minHeight = msaid + 'px';
    if (!resizeBound) { resizeBound = true; window.addEventListener('resize', function () { if (L) stabilize(); }); }
  }
  var resizeBound = false;

  /* ---------- Drawing the current frame ---------- */
  function draw(fromScrub) {
    var frames = L.data.frames, f = frames[L.i], n = frames.length;
    $('#said').innerHTML = '<span class="stepno">' + esc(tx('l.step', { i: L.i + 1, n: n })) + '</span>' + esc(f.text);
    if (!fromScrub) $('#scrub').value = L.i;
    var lis = $app.querySelectorAll('#code li');
    for (var k = 0; k < lis.length; k++) lis[k].classList.toggle('on', f.line.indexOf(k) >= 0);
    $app.querySelector('[data-act="first"]').disabled = L.i === 0;
    $app.querySelector('[data-act="prev"]').disabled = L.i === 0;
    $app.querySelector('[data-act="step"]').disabled = L.i === n - 1;
    if (L.type === 'graph') {
      $('#stage').innerHTML = D.graphSVG(L.graph, f, { goal: L.data.goal, start: L.data.start });
      $('#side').innerHTML = D.side(L.kind, L.graph, f);
    } else if (L.type === 'prog') {
      $('#stage').className = 'stage'; $('#stage').innerHTML = D.progScene(f);
      $('#side').innerHTML = '';
    } else if (L.type === 'ds') {
      $('#stage').className = 'stage'; $('#stage').innerHTML = D.dsPanels(f);
      $('#side').innerHTML = '';
    } else if (L.type === 'heap') {
      $('#stage').className = 'stage'; $('#stage').innerHTML = D.heapSVG(f);
      $('#side').innerHTML = '<div class="legend"><span><i class="sw gold"></i>' + esc(tx('l.legendHeapMove')) + '</span><span><i class="sw blue"></i>' + esc(tx('l.legendHeapOther')) + '</span></div>';
    } else if (L.type === 'merge') {
      $('#stage').innerHTML = D.mergeRows(f);
      $('#side').innerHTML = '';
    } else drawSort(f);
  }

  function buildSortStage() {
    var board = $('#stage'); board.className = 'stage board qs'; board.innerHTML = '';
    L.els = {};
    L.arr.forEach(function (v) {
      var d = document.createElement('div'); d.className = 'pgn'; d.innerHTML = D.penguin(v); board.appendChild(d); L.els[v] = d;
    });
    $('#side').innerHTML = L.kind === 'bin'
      ? '<div class="legend"><span><b>' + esc(tx('l.looking', { v: BIN_EX[L.ex].v })) + '</b></span><span><i class="sw gold"></i>' + esc(tx('l.legendMid')) + '</span><span><i class="sw green"></i>' + esc(tx('l.legendFound')) + '</span></div>'
      : L.kind === 'sel'
      ? '<div class="legend"><span><i class="sw gold"></i>' + esc(tx('l.legendSel')) + '</span><span><i class="sw blue"></i>' + esc(tx('l.legendChecked')) + '</span><span><i class="sw green"></i>' + esc(tx('l.legendFinal')) + '</span></div>'
      : L.kind === 'ins'
      ? '<div class="legend"><span><i class="sw blue"></i>' + esc(tx('l.legendMove')) + '</span><span><i class="sw green"></i>' + esc(tx('l.legendSortedPart')) + '</span></div>'
      : L.kind === 'bs'
      ? '<div class="legend"><span><i class="sw blue"></i>' + esc(tx('l.legendPair')) + '</span><span><i class="sw green"></i>' + esc(tx('l.legendFinal')) + '</span></div>'
      : '<div class="legend"><span><i class="sw gold"></i>' + esc(tx('l.legendQs')) + '</span><span><i class="sw blue"></i>' + esc(tx('l.legendLeft')) + '</span><span><i class="sw green"></i>' + esc(tx('l.legendFinal')) + '</span></div>';
  }

  function drawSort(f) {
    var board = $('#stage'), n = f.arr.length, W = board.clientWidth || 320, slot = W / n;
    var pw = Math.min(slot - 6, 64), mx = Math.max.apply(null, f.arr);
    board.style.height = Math.round(pw * (22 + mx * 6) / 40 + 36) + 'px';
    f.arr.forEach(function (v, i) {
      var el = L.els[v], cls = 'pgn', isSorted = f.sorted.indexOf(i) >= 0;
      el.style.width = pw + 'px';
      el.style.transform = 'translateX(' + (i * slot + (slot - pw) / 2) + 'px)';
      if (!isSorted && (i < f.lo || i > f.hi)) cls += ' dim';
      if (isSorted) cls += ' final';
      else if (i === f.cur || (f.pair && f.pair.indexOf(i) >= 0)) cls += ' cur';
      else if (i === f.pivot) cls += ' pivot';
      else if (f.left.indexOf(i) >= 0) cls += ' grp';
      el.className = cls;
      el.dataset.tag = isSorted ? '✓' : (i === f.pivot ? D.tagFor(f) : '');
    });
  }

  window.Learn = { open: open, leave: leave };
})();
