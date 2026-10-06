/* Practice quiz: "what happens next?" questions built from the same frames as the lessons. */
(function () {
  'use strict';
  var F = window.Frames, G = window.Graphs, D = window.Draw, T = window.Content, C = window.PenguinCore;
  var tx = window.I18n.t;
  var $app = document.getElementById('app');
  var KEY = 'pengurithm-quiz-v1';
  var Q = null;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function readBest() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function writeBest(b) { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch (e) {} }
  function best(kind) { var b = readBest()[kind]; return typeof b === 'number' ? b : null; }

  /** Up to six questions spread through the lesson. */
  function pick(list, max) {
    if (list.length <= max) return list;
    var out = [];
    for (var k = 0; k < max; k++) out.push(list[Math.round(k * (list.length - 1) / (max - 1))]);
    return out.filter(function (v, i) { return out.indexOf(v) === i; });
  }

  function build(kind, round) {
    var data, graph = null;
    if (kind === 'bs') data = F.bubbleFrames(F.makeArray('random', 6));
    else if (kind === 'sel') data = F.selectionFrames(F.makeArray('random', 6));
    else if (kind === 'ins') data = F.insertionFrames(F.makeArray('random', 6));
    else if (kind === 'bin') data = F.binaryFrames([1, 2, 3, 5, 6, 8, 9], [4, 1, 7, 8, 3, 9][round % 6]);
    else if (kind === 'sq') data = F.dsFrames();
    else if (F.PROG_EX[kind]) data = F.progFrames(kind, round % F.PROG_EX[kind].length);
    else if (kind === 'heap') data = F.heapFrames(F.makeArray('random', 7));
    else if (kind === 'ms') data = F.mergeFrames(F.makeArray('random', 8));
    else {
      graph = G.graphFor(kind);
      var ex = graph.examples[round % graph.examples.length];
      data = G.graphFrames(kind, graph, ex.start, ex.goal);
    }
    var qs = data.frames.filter(function (f) { return f.quiz; });
    if (kind === 'bs' || kind === 'sel' || kind === 'ins' || kind === 'bf' || kind === 'topo' || kind === 'heap' || kind === 'cond') {
      // a fair mix of "swap" and "stay" questions
      var yes = qs.filter(function (f) { return f.quiz.answer === 'yes'; }), no = qs.filter(function (f) { return f.quiz.answer === 'no'; });
      qs = pick(yes, 3).concat(pick(no, 3)).sort(function (a, b) { return qs.indexOf(a) - qs.indexOf(b); });
    } else qs = pick(qs, 6);
    return { kind: kind, graph: graph, data: data, qs: qs, i: 0, score: 0, answered: false, round: round };
  }

  function seededRandom(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /** One question for the daily puzzle. The same day always gives the same question. */
  function openDaily(kind, seed, onDone) {
    if (window.Learn) window.Learn.leave();
    var real = Math.random, rnd = seededRandom(seed);
    Math.random = rnd;
    try { Q = build(kind, seed % 5); } finally { Math.random = real; }
    Q.qs = [Q.qs[Math.floor(rnd() * Q.qs.length)]];
    Q.daily = onDone; Q.dailyInfo = null;
    $app.classList.add('wide');
    window.scrollTo(0, 0);
    render();
  }

  function open(kind, round) {
    if (window.Learn) window.Learn.leave();
    Q = build(kind, round || 0);
    $app.classList.add('wide');
    window.scrollTo(0, 0);
    render();
  }

  function leave() { Q = null; }

  function topbar(X) {
    return '<div class="topbar"><button class="icon-btn" data-act="lesson" aria-label="' + esc(tx('q.lesson')) + '">‹</button>' +
      '<div class="ttl"><b>' + esc(X.title) + '</b><small>' + esc(Q.daily ? tx('x.dailyTitle') : T.ui.quizTitle) + '</small></div><span class="topspace"></span></div>';
  }

  function render() {
    var X = T[Q.kind];
    if (Q.i >= Q.qs.length) return renderEnd(X);
    var f = Q.qs[Q.i], q = f.quiz, view = q.view || f;
    $app.innerHTML = topbar(X) + '<div class="lesson"><section class="card quiz">' +
      '<div class="qprog" aria-label="' + esc(tx('q.of', { i: Q.i + 1, n: Q.qs.length })) + '">' + Q.qs.map(function (_, k) {
        return '<i class="' + (k < Q.i ? 'done' : k === Q.i ? 'now' : '') + '"></i>';
      }).join('') + '</div>' +
      '<div class="stepno">' + esc(tx('q.of', { i: Q.i + 1, n: Q.qs.length })) + '</div>' +
      '<div class="qpic">' + D.scene(Q.kind, Q.graph, view, Q.graph ? { start: Q.data.start, goal: Q.data.goal } : {}) + '</div>' +
      '<h2 class="qtext">' + esc(q.q) + '</h2>' +
      '<div class="opts" role="group" aria-label="' + esc(tx('q.answers')) + '">' + q.options.map(function (o) {
        return '<button class="opt" data-act="pick" data-id="' + esc(o.id) + '">' + esc(o.label) + '</button>';
      }).join('') + '</div>' +
      '<div class="qfeed" id="qfeed" role="status" aria-live="polite"></div></section></div>';
    Q.answered = false;
    $app.onclick = onClick;
  }

  function onClick(e) {
    var t = e.target.closest('[data-act]'); if (!t || !Q) return;
    var a = t.dataset.act;
    if (a === 'lesson') { if (Q.daily) C.showMenu(); else window.Learn.open(Q.kind); }
    else if (a === 'pick' && !Q.answered) answer(t);
    else if (a === 'next') { Q.i++; Q.answered = false; render(); window.scrollTo(0, 0); }
    else if (a === 'again') open(Q.kind, Q.round + 1);
    else if (a === 'menu') C.showMenu();
  }

  function answer(btn) {
    var q = Q.qs[Q.i].quiz, ok = btn.dataset.id === q.answer;
    Q.answered = true;
    if (ok) Q.score++;
    if (window.Sound) window.Sound.play(ok ? 'ok' : 'no');
    if (Q.daily && !Q.dailyInfo) Q.dailyInfo = Q.daily(ok) || {};
    Array.prototype.forEach.call($app.querySelectorAll('.opt'), function (b) {
      b.disabled = true;
      if (b.dataset.id === q.answer) b.classList.add('right');
      else if (b === btn) b.classList.add('wrong');
    });
    var last = Q.i === Q.qs.length - 1;
    $('#qfeed').innerHTML = '<div class="said ' + (ok ? 'yes' : 'no') + '"><b>' + esc(tx(ok ? 'q.yes' : 'q.no')) + '</b>' + esc(q.why) + '</div>' +
      '<button class="btn primary" data-act="next">' + esc(tx(last ? 'q.score' : 'q.next')) + '</button>';
    var nx = $('#qfeed .btn'); if (nx) nx.focus();
  }
  function $(s) { return $app.querySelector(s); }

  function renderEnd(X) {
    if (Q.daily) {
      var info = Q.dailyInfo || {};
      $app.innerHTML = topbar(X) + '<div class="lesson"><section class="card quiz end"><div class="bigscore">' + (Q.score ? '★' : '☆') + '</div>' +
        '<h2 class="qtext">' + esc(tx('x.dailyEnd')) + '</h2><p class="t-white">' + esc(tx(Q.score ? 'x.dailyRight' : 'x.dailyWrong')) + '</p>' +
        (info.streak ? '<p class="t-pink"><b>' + esc(tx(info.streak === 1 ? 'x.streak1' : 'x.streakN', { n: info.streak })) + '</b></p>' : '') +
        '<div class="endbtns"><button class="btn primary" data-act="menu">' + esc(tx('q.menu')) + '</button></div></section></div>';
      if (window.Sound && Q.score) window.Sound.play('win');
      return;
    }
    var n = Q.qs.length, pct = n ? Q.score / n : 0;
    var msg = pct === 1 ? tx('q.perfect', { name: X.short }) : pct >= 0.6 ? tx('q.great') : tx('q.try');
    var b = readBest(); if (typeof b[Q.kind] !== 'number' || Q.score > b[Q.kind]) { b[Q.kind] = Q.score; writeBest(b); }
    $app.innerHTML = topbar(X) + '<div class="lesson"><section class="card quiz end"><div class="bigscore">' + Q.score + ' / ' + n + '</div>' +
      '<div class="stars">' + '★'.repeat(Math.round(pct * 3)) + '☆'.repeat(3 - Math.round(pct * 3)) + '</div><p class="t-white">' + esc(msg) + '</p>' +
      '<div class="endbtns"><button class="btn primary" data-act="again">' + esc(tx('q.again')) + '</button><button class="ghost" data-act="lesson">' + esc(tx('q.lesson')) + '</button><button class="ghost" data-act="menu">' + esc(tx('q.menu')) + '</button></div></section></div>';
  }

  window.Quiz = { openDaily: openDaily, open: open, leave: leave, best: best };
})();
