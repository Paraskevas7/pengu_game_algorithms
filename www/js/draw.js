/* Drawing helpers: original penguin art and the diagrams used by the lessons and the storyboard.
   They only build HTML/SVG strings (no DOM access), so they can be tested in Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./i18n.js'));
  else root.Draw = factory(root.I18n);
})(typeof self !== 'undefined' ? self : this, function (I18n) {
  'use strict';
  var t = I18n.t;

  /* ---------- Penguin and fish ---------- */
  function penguinParts(v, hideNum) {
    var H = 22 + v * 6;
    return '<ellipse cx="20" cy="' + (H - 2.5) + '" rx="10" ry="2.5" fill="#f4a21d"/>' +
      '<rect x="3" y="1" width="34" height="' + (H - 5) + '" rx="16" fill="#1d2b3a"/>' +
      '<rect x="9" y="12" width="22" height="' + (H - 18) + '" rx="11" fill="#fff"/>' +
      '<circle cx="14" cy="8.5" r="2.4" fill="#fff"/><circle cx="26" cy="8.5" r="2.4" fill="#fff"/>' +
      '<circle cx="14.5" cy="8.8" r="1.1" fill="#000"/><circle cx="26.5" cy="8.8" r="1.1" fill="#000"/>' +
      '<polygon points="16.5,11.5 23.5,11.5 20,17" fill="#f4a21d"/>' +
      (hideNum ? '' : '<text x="20" y="' + (H - 9) + '" text-anchor="middle" font-size="9" font-weight="700" fill="#1d2b3a" font-family="system-ui,sans-serif">' + v + '</text>');
  }
  function penguin(v, hideNum) {
    return '<svg viewBox="0 0 40 ' + (22 + v * 6) + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + penguinParts(v, hideNum) + '</svg>';
  }
  var FISH_PARTS =
    '<ellipse cx="16" cy="13" rx="13" ry="8.5" fill="#ff8a3d"/><polygon points="27,13 39,3 39,23" fill="#ff8a3d"/>' +
    '<path d="M16 5.5 q3.5 7.5 0 15" stroke="#ffd9b8" fill="none" stroke-width="1.6"/><circle cx="8.5" cy="11" r="1.9" fill="#102a43"/>';

  function set(arr) { var s = {}; (arr || []).forEach(function (x) { s[x] = true; }); return s; }
  function key(a, b) { return a < b ? a + '|' + b : b + '|' + a; }

  /* ---------- Maps (places and paths) ---------- */
  function graphSVG(G, f, o) {
    o = o || {};
    var R = 19, N = G.nodes, W = G.view[0], H = G.view[1], weighted = G.edges[0].length > 2;
    var inList = set(f.list), added = set(f.added), doneS = set(f.done), seen = {};
    (f.visited || []).forEach(function (id, i) { seen[id] = i + 1; });
    var treeK = {}, actK = {}, pathK = {}, rejK = {};
    (f.tree || []).forEach(function (e) { treeK[key(e[0], e[1])] = 1; });
    (f.active || []).forEach(function (e) { actK[key(e[0], e[1])] = 1; });
    (f.rejected || []).forEach(function (e) { rejK[key(e[0], e[1])] = 1; });
    if (f.path) for (var i = 1; i < f.path.length; i++) pathK[key(f.path[i - 1], f.path[i])] = 1;

    var out = '<svg class="gsvg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + t('d.mapLabel') + '">';
    G.edges.forEach(function (e) {
      var a = N[e[0]], b = N[e[1]], k = key(e[0], e[1]);
      var cls = 'ge' + (pathK[k] ? ' path' : treeK[k] ? ' tree' : rejK[k] ? ' rej' : '') + (actK[k] ? ' active' : '');
      out += '<line class="' + cls + '" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>';
      if (G.directed) {
        var dx = b[0] - a[0], dy = b[1] - a[1], ln = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / ln, uy = dy / ln;
        out += '<polygon class="ea' + cls.slice(2) + '" points="-11,-7 1,0 -11,7" transform="translate(' + (b[0] - ux * (R + 3)).toFixed(1) + ',' + (b[1] - uy * (R + 3)).toFixed(1) + ') rotate(' + (Math.atan2(uy, ux) * 180 / Math.PI).toFixed(1) + ')"/>';
      }
    });
    if (weighted) {
      G.edges.forEach(function (e) {
        var a = N[e[0]], b = N[e[1]], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        out += '<g class="wt"><rect x="' + (mx - 11) + '" y="' + (my - 10) + '" width="22" height="20" rx="7"/><text x="' + mx + '" y="' + (my + 5) + '">' + e[2] + '</text></g>';
      });
    }
    Object.keys(N).sort().forEach(function (id) {
      var p = N[id], x = p[0], y = p[1];
      var cls = 'gn' + (id === f.current ? ' cur' : inList[id] ? ' wait' : '') + (seen[id] || doneS[id] ? ' seen' : '') +
        (added[id] ? ' new' : '') + (f.update === id ? ' upd' : '');
      out += '<g class="' + cls + '"><circle cx="' + x + '" cy="' + y + '" r="' + R + '"/><text class="nl" x="' + x + '" y="' + (y + 6) + '">' + id + '</text></g>';
    });
    Object.keys(N).sort().forEach(function (id) {
      var p = N[id], x = p[0], y = p[1];
      if (o.goal === id) out += '<g class="fishg" transform="translate(' + (x + 6) + ',' + (y + 6) + ') scale(.6)">' + FISH_PARTS + '</g>';
      if (o.start === id) out += '<text class="lbl" x="' + x + '" y="' + (y + R + 14) + '">' + t('d.start') + '</text>';
      if (!weighted && seen[id]) {
        out += '<g class="ord"><circle cx="' + (x - R + 3) + '" cy="' + (y - R + 3) + '" r="8"/><text x="' + (x - R + 3) + '" y="' + (y - R + 6.5) + '">' + seen[id] + '</text></g>';
      }
      if (f.dist) {
        var dv = f.dist[id];
        out += '<text class="dl' + (f.update === id ? ' upd' : '') + '" x="' + (x + R + 1) + '" y="' + (y - R + 4) + '">' + (dv === null || dv === undefined ? '∞' : dv) + '</text>';
      }
      if (f.from && f.from[id]) {
        var q = N[f.from[id]], dx = q[0] - x, dy = q[1] - y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        var ux = dx / len, uy = dy / len, ang = Math.atan2(uy, ux) * 180 / Math.PI;
        out += '<polygon class="fromarrow" points="-5,-6 6,0 -5,6" transform="translate(' + (x + ux * (R + 9)).toFixed(1) + ',' + (y + uy * (R + 9)).toFixed(1) + ') rotate(' + ang.toFixed(1) + ')"/>';
      }
      if (f.current === id) {
        out += '<g class="spr" transform="translate(' + (x - 16) + ',' + (y - R - 29) + ') scale(.8)">' + penguinParts(2, true) + '</g>';
      }
    });
    return out + '</svg>';
  }

  /** The waiting line (queue) or the pile (stack), shown as small penguins. */
  function chips(f, kind) {
    var isQ = kind === 'bfs', added = set(f.added);
    var body = (f.list || []).map(function (id) {
      return '<div class="pchip' + (id === f.taken ? ' out' : '') + (added[id] ? ' new' : '') + '">' + penguin(2, true) + '<span>' + id + '</span></div>';
    }).join('');
    return '<div class="panel"><h4>' + t(isQ ? 'd.queue' : 'd.stack') + '</h4>' +
      '<div class="line">' + (body || '<em class="empty">' + t('d.empty') + '</em>') + '</div>' +
      '<div class="ends"><span>' + t(isQ ? 'd.qFront' : 'd.sBottom') + '</span><span>' + t(isQ ? 'd.qBack' : 'd.sTop') + '</span></div></div>';
  }

  /** The paths to choose from (Prim) or the sorted list of all paths (Kruskal). */
  var STATE_WORD = { wait: '', take: ' ✓', skip: ' ✗', cur: ' ?' };
  function edgeList(f, kind) {
    var items = (f.elist || []).map(function (e) {
      return '<span class="ech ' + e.state + '"><b>' + e.a + '–' + e.b + '</b> ' + e.w + STATE_WORD[e.state] + '</span>';
    }).join('');
    var title = t(kind === 'prim' ? 'd.elPrim' : 'd.elKr');
    return '<div class="panel"><h4>' + title + '</h4><div class="elist">' + (items || '<em class="empty">' + t('d.none') + '</em>') + '</div>' +
      '<div class="legend"><span><i class="sw gold"></i>' + t('d.inTree') + '</span><span><i class="sw red"></i>' + t('d.skipped') + '</span></div></div>';
  }

  /** Costs so far for Dijkstra. */
  function distTable(G, f) {
    var rows = Object.keys(G.nodes).sort().map(function (id) {
      var dv = f.dist ? f.dist[id] : null, from = f.from && f.from[id];
      var cls = (id === f.current ? 'cur ' : '') + ((f.done || []).indexOf(id) >= 0 ? 'done ' : '') + (f.update === id ? 'upd' : '');
      return '<tr class="' + cls + '"><th scope="row">' + id + '</th><td>' + (dv === null || dv === undefined ? '∞' : dv) + '</td><td>' + (from || '–') + '</td></tr>';
    }).join('');
    return '<div class="panel"><h4>' + t('d.costTitle') + '</h4><table class="dtab"><thead><tr><th>' + t('d.place') + '</th><th>' + t('d.cost') + '</th><th>' + t('d.from') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  /* ---------- Penguin rows ---------- */
  var TAGS = { mid: 'g.midTag', min: 'g.minTag' };
  function tagFor(f) { return t(TAGS[f.tag] || 'g.pivotTag'); }

  /** A still picture of the penguins in a line (used by the storyboard). */
  function sortRow(f, o) {
    var n = f.arr.length, w = (o && o.w) || Math.max(26, Math.min(44, Math.floor(250 / n)));
    var out = '<div class="srow" style="--pw:' + w + 'px">';
    f.arr.forEach(function (v, i) {
      var sorted = f.sorted.indexOf(i) >= 0, cls = 'sp';
      if (!sorted && (i < f.lo || i > f.hi)) cls += ' dim';
      if (sorted) cls += ' final';
      else if (i === f.cur || (f.pair && f.pair.indexOf(i) >= 0)) cls += ' cur';
      else if (i === f.pivot) cls += ' pivot';
      else if (f.left.indexOf(i) >= 0) cls += ' grp';
      var tag = sorted ? '✓' : (i === f.pivot ? tagFor(f) : '');
      out += '<div class="' + cls + '" data-tag="' + tag + '">' + penguin(v) + '</div>';
    });
    return out + '</div>';
  }

  /** The merge sort picture: rows of groups, cutting first and merging afterwards. */
  function mergeRows(f) {
    var widest = 0;
    f.rows.forEach(function (r) { widest = Math.max(widest, r.groups.reduce(function (s, g) { return s + g.len; }, 0)); });
    var mw = Math.max(16, Math.min(40, Math.floor((262 - (widest - 1) * 5) / widest) - 8));
    var out = '<div class="mtree" style="--mw:' + mw + 'px">';
    f.rows.forEach(function (r, ri) {
      if (ri === 0 || r.kind !== f.rows[ri - 1].kind) out += '<div class="mlabel">' + t(r.kind === 'split' ? 'd.cut' : 'd.merging') + '</div>';
      out += '<div class="mrow">';
      r.groups.forEach(function (g) {
        out += '<div class="mgrp ' + g.state + '">';
        if (g.values.length) g.values.forEach(function (v) { out += '<span class="mp">' + penguin(v) + '</span>'; });
        else for (var k = 0; k < g.len; k++) out += '<span class="mp ghost"></span>';
        out += '</div>';
      });
      out += '</div>';
    });
    return out + '</div>';
  }

  /** Topological sort: the line of places that are ready, and how many arrows each place still waits for. */
  function topoPanel(G, f) {
    var body = (f.list || []).map(function (id) {
      return '<div class="pchip' + (id === f.taken ? ' out' : '') + ((f.added || []).indexOf(id) >= 0 ? ' new' : '') + '">' + penguin(2, true) + '<span>' + id + '</span></div>';
    }).join('');
    var rows = Object.keys(G.nodes).sort().map(function (id) {
      var n = f.indeg ? f.indeg[id] : 0, isDone = (f.done || []).indexOf(id) >= 0;
      return '<tr class="' + (id === f.current ? 'cur ' : '') + (isDone ? 'done' : '') + '"><th scope="row">' + id + '</th><td>' + (isDone ? '✓' : n) + '</td></tr>';
    }).join('');
    return '<div class="panel"><h4>' + t('d.topoReady') + '</h4><div class="line">' + (body || '<em class="empty">' + t('d.empty') + '</em>') + '</div></div>' +
      '<div class="panel"><h4>' + t('d.topoWait') + '</h4><table class="dtab"><thead><tr><th>' + t('d.place') + '</th><th>' + t('d.topoCount') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  /** Stack and queue side by side, doing the same jobs. */
  function dsPanels(f) {
    var qf = { list: f.queue, taken: f.outQ, added: f.newId ? [f.newId] : [] }, sf = { list: f.stack, taken: f.outS, added: f.newId ? [f.newId] : [] };
    return chips(qf, 'bfs') + chips(sf, 'dfs');
  }

  /** The heap as a family tree of numbers. */
  function heapSVG(f) {
    var a = f.arr, n = a.length, W = 330, levels = Math.max(1, Math.floor(Math.log(Math.max(n, 1)) / Math.LN2) + 1), H = 36 + (levels - 1) * 64 + 30, R = 18;
    function pos(i) {
      var lv = Math.floor(Math.log(i + 1) / Math.LN2), per = Math.pow(2, lv), k = i + 1 - per;
      return [Math.round((k + 0.5) / per * W), 32 + lv * 64];
    }
    var out = '<svg class="gsvg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + t('d.heapLabel') + '">', i;
    var pairK = {};
    if (f.pair) pairK[f.pair[0] + '|' + f.pair[1]] = true;
    for (i = 1; i < n; i++) {
      var par = (i - 1) >> 1, p1 = pos(par), p2 = pos(i);
      out += '<line class="ge' + (pairK[par + '|' + i] ? ' active' : '') + '" x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '"/>';
    }
    for (i = 0; i < n; i++) {
      var p = pos(i), cls = 'gn' + (i === f.cur ? ' cur' : '') + (f.pair && f.pair.indexOf(i) >= 0 && i !== f.cur ? ' new' : '') + ' seen';
      out += '<g class="' + cls + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + R + '"/><text class="nl" x="' + p[0] + '" y="' + (p[1] + 6) + '">' + a[i] + '</text></g>';
    }
    if (n) out += '<text class="lbl" x="' + pos(0)[0] + '" y="' + (pos(0)[1] - R - 6) + '">' + t('d.heapTop') + '</text>';
    return out + '</svg>';
  }

  /** Pictures for the beginner lessons: switches (binary), stepping stones (loops) and labelled boxes (variables). */
  var SCENES = {};
  function progScene(f) {
    var out = '', i;
    if (SCENES[f.kind]) return '<div class="prog">' + SCENES[f.kind](f) + '</div>';
    if (f.kind === 'bits') {
      out += '<div class="bitsrow">';
      f.places.forEach(function (pv, k) {
        out += '<div class="bitc ' + (f.bits[k] ? 'on' : 'off') + (k === f.cur ? ' cur' : '') + '"><span class="pv">' + pv + '</span><span class="bpg">' + penguin(f.bits[k] ? 4 : 1, true) + '</span><b>' + f.bits[k] + '</b></div>';
      });
      out += '</div><div class="bitsnote">' + t('d.bitsNote', { n: f.n, r: f.rem }) + '</div>';
    } else if (f.kind === 'loop') {
      out += '<div class="floes">';
      for (i = 1; i <= f.n; i++) out += '<div class="floe' + (i < f.i ? ' done' : i === f.i ? ' cur' : '') + '"><span>' + i + '</span>' + (i === f.i ? '<em class="hop">' + penguin(2, true) + '</em>' : '') + '</div>';
      out += '</div><div class="totbox"><span>' + t('d.total') + '</span><b>' + f.total + '</b></div>';
    } else if (f.kind === 'cond') {
      out += '<div class="vboxes"><div class="vbox changed"><i>temp</i><b>' + f.v + '</b></div></div><div class="flow">';
      var skip = f.rows.some(function (r) { return r.taken; });
      f.rows.forEach(function (r, k) {
        var cls = 'frow' + (r.cur ? ' cur' : '') + (r.taken ? ' taken' : '') + (skip && !r.taken ? ' dim' : '');
        var badge = r.res === true ? '<em class="yes">' + t('d.cond.yes') + '</em>' : r.res === false ? '<em class="no">' + t('d.cond.no') + '</em>' : '';
        out += '<div class="' + cls + '"><div class="cnd">' + (r.c === 'else' ? t('d.cond.else') : r.c + ' ?') + badge + '</div><span class="arr">&#8594;</span><div class="act">' + t('d.cond.' + r.act) + '</div></div>';
      });
      out += '</div>';
    } else if (f.kind === 'race') {
      var names = { walk: 'd.race.walk', wad: 'd.race.wad', slide: 'd.race.slide' }, CAP = 64;
      out += '<div class="race"><div class="racen">' + (f.n ? t('d.race.n', { n: f.n }) : t('d.race.pile')) + '</div>';
      f.rows.forEach(function (r) {
        var w = Math.min(100, Math.max(r.steps ? 4 : 0, r.steps / CAP * 100)), over = r.steps > CAP;
        out += '<div class="lane ' + r.id + '"><span class="who">' + t(names[r.id]) + '</span><div class="track"><i style="width:' + (r.hide ? 0 : w) + '%"></i>' + (over && !r.hide ? '<u>&#9654;</u>' : '') + '</div><b>' + (r.hide ? '?' : r.steps) + '</b></div>';
      });
      out += '</div>';
    } else if (f.kind === 'rep') {
      if (f.mode === 'word') {
        out += '<div class="rrow">' + f.word.split('').map(function (c, k) {
          var cd = f.codes[k], cur = k === f.idx, bits = cd ? cd.bin : '', num = cd ? (f.hide && cur ? '?' : cd.n) : '·';
          return '<div class="rcol' + (cur ? ' cur' : '') + '"><b class="rl">' + c + '</b><span class="rn">' + num + '</span><span class="rb">' + (cd && !(f.hide && cur) ? bits.split('').map(function (b) { return '<i class="' + (b === '1' ? 'on' : '') + '">' + b + '</i>'; }).join('') : '<i></i><i></i><i></i><i></i><i></i>') + '</span></div>';
        }).join('') + '</div><div class="bitsnote">' + t('d.rep.note') + '</div>';
      } else {
        out += '<div class="pixwrap"><div class="pix">' + f.rows.map(function (r, k) {
          return r.split('').map(function (c) { return '<u class="' + (c === '1' ? 'on' : '') + (k === f.idx ? ' cur' : '') + '"></u>'; }).join('');
        }).join('') + '</div><div class="pixn">' + f.rows.map(function (r, k) {
          var shown = k < f.done.length && !(f.hide && k === f.idx);
          return '<code class="' + (k === f.idx ? 'cur' : '') + '">' + (shown ? r : '?????') + '</code>';
        }).join('') + '</div></div>';
      }
    } else if (f.kind === 'net') {
      var col = function (title, inner) { return '<div class="ncol"><small>' + title + '</small>' + inner + '</div>'; };
      var chip = function (n, extra) { var p = f.pk[n - 1]; return '<div class="pkt' + (extra || '') + '"><i>#' + n + '</i><b>' + p.txt.replace(/ /g, '·') + '</b></div>'; };
      var sendIn = !f.split ? '<div class="pkt whole"><b>' + f.msg.replace(/ /g, '·') + '</b></div>' : f.pk.map(function (p, k) { return f.where[k] === 's' ? chip(p.n) : ''; }).join('');
      var netIn = f.pk.map(function (p, k) { return f.where[k] === 'x' ? chip(p.n, ' lost') + '<em class="lostx">&#10007;</em>' : ''; }).join('');
      var recvList = f.sorted ? f.recv.slice().sort(function (a, b) { return a - b; }) : f.recv;
      var recvIn = recvList.map(function (n) { return chip(n); }).join('');
      out += '<div class="net">' + col(t('d.net.sender'), sendIn) + col(t('d.net.network'), netIn || '<em class="hint">' + t('d.net.routers') + '</em>') + col(t('d.net.receiver'), recvIn) + '</div>';
      if (f.sorted) out += '<div class="bitsnote">' + f.recv.length + ' &#10003; ' + f.pk.map(function (p) { return p.txt; }).join('').replace(/ /g, '·') + '</div>';
    } else if (f.kind === 'ai') {
      var X = function (v) { return 24 + v * 28; }, Y = function (v) { return 232 - v * 22; };
      var svg = '<svg class="ai" viewBox="0 0 300 250" role="img"><rect x="24" y="12" width="266" height="220" rx="6" class="aibg"/>';
      (f.near || []).forEach(function (r) {
        var q = f.train.filter(function (z) { return z.id === r.id; })[0];
        svg += '<line class="ail' + (f.pick === r.id ? ' pick' : '') + '" x1="' + X(f.test.x) + '" y1="' + Y(f.test.y) + '" x2="' + X(q.x) + '" y2="' + Y(q.y) + '"/>';
      });
      f.train.forEach(function (q) {
        svg += (q.g === 'small' ? '<circle class="aip s" cx="' + X(q.x) + '" cy="' + Y(q.y) + '" r="9"/>' : '<rect class="aip b" x="' + (X(q.x) - 9) + '" y="' + (Y(q.y) - 9) + '" width="18" height="18" rx="3"/>') + '<text class="ail2" x="' + X(q.x) + '" y="' + (Y(q.y) + 4) + '">' + q.id + '</text>';
      });
      if (f.test) svg += '<g class="ain ' + (f.guess || '') + '"><path d="M' + X(f.test.x) + ' ' + (Y(f.test.y) - 12) + ' l11 12 l-11 12 l-11 -12 z"/><text x="' + X(f.test.x) + '" y="' + (Y(f.test.y) + 5) + '">?</text></g>';
      svg += '<text class="aiax" x="157" y="247">' + t('d.ai.weight') + '</text><text class="aiax" transform="rotate(-90 12 122)" x="12" y="122">' + t('d.ai.height') + '</text></svg>';
      out += svg + '<div class="legend"><span><i class="sw blue"></i>' + t('d.ai.small') + '</span><span><i class="sw gold"></i>' + t('d.ai.big') + '</span></div>';
    } else if (f.kind === 'data') {
      var mx = 10;
      out += '<div class="bars">' + f.vals.map(function (x, k) {
        return '<div class="bar' + (f.hi === k ? ' hi' : '') + (f.lo === k ? ' lo' : '') + (k < f.upto && f.total !== null ? ' cnt' : '') + '"><b>' + x + '</b><i style="height:' + (x / mx * 110) + 'px"></i><span>' + t('d.day.' + k) + '</span></div>';
      }).join('') + '</div>';
      if (f.total !== null) out += '<div class="totbox"><span>' + t('d.total') + '</span><b>' + f.total + '</b>' + (f.avg !== null ? '<span>' + t('d.data.avg') + '</span><b>' + f.avg + '</b>' : '') + '</div>';
    } else if (f.kind === 'cipher') {
      var al = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', row = function (a, b) {
        var h = '<div class="alpha">';
        for (var q = a; q < b; q++) h += '<span class="' + (al[q] === f.from && f.from ? 'from' : '') + (al[q] === f.to && f.to ? ' to' : '') + '">' + al[q] + '</span>';
        return h + '</div>';
      };
      out += '<div class="cipher">' + row(0, 13) + row(13, 26);
      out += '<div class="cwords"><div class="crow"><small>' + t('d.cip.plain') + '</small>' + f.word.split('').map(function (c, k) { return '<b class="' + (k === f.idx ? 'cur' : '') + '">' + c + '</b>'; }).join('') + '</div>';
      out += '<div class="crow"><small>' + t('d.cip.secret', { s: f.shift }) + '</small>' + f.word.split('').map(function (c, k) { return '<b class="sec ' + (k === f.idx ? 'cur' : '') + '">' + (f.out[k] || '·') + '</b>'; }).join('') + '</div></div></div>';
    } else {
      if (f.expect) out += '<div class="expect"><small>' + t('d.bug.want') + '</small> <code>' + f.expect + '</code></div>';
      out += '<div class="vcode">' + f.lines.map(function (ln, k) { return '<code class="' + (f.line.indexOf(k) >= 0 ? 'on' : '') + (f.badLine === k ? ' bad' : '') + '">' + ln + '</code>'; }).join('') + '</div>';
      out += '<div class="vboxes">' + (f.boxes.length ? f.boxes.map(function (b) {
        return '<div class="vbox' + (b.changed || f.highlight === b.name ? ' changed' : '') + '"><i>' + b.name + '</i><b>' + b.value + '</b></div>';
      }).join('') : '<em class="empty">' + t('d.noBoxes') + '</em>') + '</div>';
    }
    return '<div class="prog">' + out + '</div>';
  }

  /** The panel under a map: queue/stack chips, cost table or list of paths. */
  function side(kind, G, f) {
    if (kind === 'dij' || kind === 'bf') return distTable(G, f);
    if (kind === 'topo') return topoPanel(G, f);
    if (kind === 'prim' || kind === 'kruskal') return edgeList(f, kind);
    return chips(f, kind);
  }
  /** One whole still picture of a frame, for the storyboard and the quiz. */
  function scene(kind, G, f, o) {
    o = o || {};
    if (f.type === 'graph') return graphSVG(G, f, o) + (o.noSide ? '' : side(kind, G, f));
    if (f.type === 'sort') return sortRow(f);
    if (f.type === 'ds') return dsPanels(f);
    if (f.type === 'prog') return progScene(f);
    if (f.type === 'heap') return heapSVG(f);
    return mergeRows(f);
  }

  return { SCENES: SCENES, progScene: progScene, dsPanels: dsPanels, heapSVG: heapSVG, tagFor: tagFor, side: side, scene: scene, penguin: penguin, penguinParts: penguinParts, graphSVG: graphSVG, chips: chips, edgeList: edgeList, distTable: distTable, sortRow: sortRow, mergeRows: mergeRows, FISH_PARTS: FISH_PARTS };
});
