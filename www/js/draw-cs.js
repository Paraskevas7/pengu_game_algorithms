/* Pictures for the curriculum lessons, part 1 (see frames-cs.js). Builds HTML/SVG strings only. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./draw.js'), require('./frames-cs.js'), require('./i18n.js'));
  else root.DrawCS = factory(root.Draw, root.FramesCS, root.I18n);
})(typeof self !== 'undefined' ? self : this, function (D, FC, I18n) {
  'use strict';
  var t = I18n.t, S = D.SCENES;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------------------------------------------------------------- robot */
  var CELL = 48, ARROWS = ['▲', '▶', '▼', '◀'];
  S.robot = function (f) {
    var W = CELL * 5, svg = '<svg class="robot" viewBox="-18 -18 ' + (W + 24) + ' ' + (W + 24) + '" role="img">', x, y;
    for (x = 0; x < 5; x++) svg += '<text class="rbl" x="' + (x * CELL + CELL / 2) + '" y="-5">' + 'ABCDE'[x] + '</text>';
    for (y = 0; y < 5; y++) svg += '<text class="rbl" x="-9" y="' + (y * CELL + CELL / 2 + 4) + '">' + (y + 1) + '</text>';
    for (y = 0; y < 5; y++) for (x = 0; x < 5; x++) svg += '<rect class="rbc" x="' + (x * CELL + 1) + '" y="' + (y * CELL + 1) + '" width="' + (CELL - 2) + '" height="' + (CELL - 2) + '" rx="6"/>';
    (f.walls || []).forEach(function (q) { svg += '<rect class="rbw" x="' + (q[0] * CELL + 1) + '" y="' + (q[1] * CELL + 1) + '" width="' + (CELL - 2) + '" height="' + (CELL - 2) + '" rx="6"/>'; });
    f.trail.forEach(function (q) { svg += '<rect class="rbt" x="' + (q[0] * CELL + 8) + '" y="' + (q[1] * CELL + 8) + '" width="' + (CELL - 16) + '" height="' + (CELL - 16) + '" rx="5"/>'; });
    var gx = f.goal.x * CELL + CELL / 2, gy = f.goal.y * CELL + CELL / 2;
    svg += '<g class="rbfish" transform="translate(' + gx + ' ' + gy + ')"><ellipse rx="13" ry="8"/><path d="M12 0 L20 -7 L20 7 Z"/><circle cx="-7" cy="-2" r="1.8" class="eye"/></g>';
    var px = f.x * CELL + CELL / 2, py = f.y * CELL + CELL / 2;
    svg += '<g class="rbpeng" transform="translate(' + px + ' ' + py + ') rotate(' + (f.d * 90) + ')">' +
      '<ellipse cx="-4" cy="15" rx="5" ry="3" fill="#f4a21d"/><ellipse cx="4" cy="15" rx="5" ry="3" fill="#f4a21d"/>' +
      '<ellipse cx="-13" cy="3" rx="4" ry="9" fill="#1d2b3a" transform="rotate(12 -13 3)"/><ellipse cx="13" cy="3" rx="4" ry="9" fill="#1d2b3a" transform="rotate(-12 13 3)"/>' +
      '<ellipse cx="0" cy="3" rx="11" ry="14" fill="#1d2b3a"/><ellipse cx="0" cy="5" rx="7" ry="10" fill="#fff"/>' +
      '<circle cx="0" cy="-8" r="8" fill="#1d2b3a"/><circle cx="-3.2" cy="-10" r="1.8" fill="#fff"/><circle cx="3.2" cy="-10" r="1.8" fill="#fff"/><circle cx="-3.2" cy="-10.4" r=".8" fill="#000"/><circle cx="3.2" cy="-10.4" r=".8" fill="#000"/>' +
      '<polygon points="-3,-14 3,-14 0,-20" fill="#f4a21d"/></g></svg>';
    return svg;
  };

  /* ------------------------------------------------------------ flowchart */
  S.algo = function (f) {
    var F0 = FC.FLOWS[f.flow], pos = {}, kinds = {}, svg;
    F0.nodes.forEach(function (n) { pos[n[0]] = n; kinds[n[0]] = n[1]; });
    svg = '<svg class="flow" viewBox="0 0 300 ' + F0.h + '" role="img"><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="fah"/></marker></defs>';
    function nodeBox(n) {
      var id = n[0], k = n[1], x = n[2], y = n[3], w = k === 'proc' && (id === 'umb' || id === 'sun') ? 116 : k === 'proc' ? 150 : k === 'dec' ? 170 : 90, h = k === 'dec' ? 50 : 34;
      return { id: id, k: k, x: x, y: y, w: w, h: h };
    }
    var boxes = {}; F0.nodes.forEach(function (n) { boxes[n[0]] = nodeBox(n); });
    F0.edges.forEach(function (e) {
      var a = boxes[e[0]], b = boxes[e[1]], pts = e[3] || [[a.x, a.y + a.h / 2], [b.x, b.y - b.h / 2]];
      var used = f.trail.some(function (q) { return q[0] === e[0] && q[1] === e[1]; });
      svg += '<polyline class="fe' + (used ? ' used' : '') + '" fill="none" marker-end="url(#ah)" points="' + pts.map(function (q) { return q.join(','); }).join(' ') + '"/>';
      if (e[2]) { var lp = e[4] || [pts[0][0] + 10, pts[0][1] + 14]; svg += '<text class="felab" x="' + lp[0] + '" y="' + lp[1] + '">' + esc(t('d.fc.' + e[2])) + '</text>'; }
    });
    F0.nodes.forEach(function (n) {
      var b = boxes[n[0]], seen = f.seen.indexOf(b.id) >= 0, cur = f.cur === b.id, cls = 'fn ' + b.k + (seen ? ' seen' : '') + (cur ? ' cur' : '');
      var label = b.k === 'start' ? t('d.fc.start') : b.k === 'end' ? t('d.fc.end') : t('fc.' + f.flow + '.' + b.id);
      if (b.k === 'dec') svg += '<polygon class="' + cls + '" points="' + b.x + ',' + (b.y - b.h / 2) + ' ' + (b.x + b.w / 2) + ',' + b.y + ' ' + b.x + ',' + (b.y + b.h / 2) + ' ' + (b.x - b.w / 2) + ',' + b.y + '"/>';
      else svg += '<rect class="' + cls + '" x="' + (b.x - b.w / 2) + '" y="' + (b.y - b.h / 2) + '" width="' + b.w + '" height="' + b.h + '" rx="' + (b.k === 'proc' ? 5 : 17) + '"/>';
      svg += '<text class="fnt" x="' + b.x + '" y="' + (b.y + 4) + '">' + esc(label) + '</text>';
    });
    svg += '</svg>';
    if (f.flow === 'count') svg += '<div class="totbox"><span>n</span><b>' + f.n + '</b></div>';
    return svg;
  };

  /* ---------------------------------------------------------- logic gates */
  S.logic = function (f) {
    var sw = function (name, v) { return '<div class="lsw ' + (v ? 'on' : 'off') + '"><small>' + name + '</small><b>' + (v ? 1 : 0) + '</b><i>' + (v ? t('d.lg.on') : t('d.lg.offw')) + '</i></div>'; };
    var out = '<div class="lgrow">' + '<div class="lins">' + sw('A', f.a) + (f.ins === 2 ? sw('B', f.b) : '') + '</div>';
    out += '<div class="lgate"><b>' + esc(t('d.lg.' + f.gate)) + '</b></div>';
    out += '<div class="lamp ' + (f.out === null ? 'unk' : f.out ? 'on' : 'off') + '"><span></span><small>' + (f.out === null ? '?' : f.out ? t('d.lg.on') : t('d.lg.offw')) + '</small></div></div>';
    out += '<table class="ltab"><tr><th>A</th>' + (f.ins === 2 ? '<th>B</th>' : '') + '<th>' + t('d.lg.lamp') + '</th></tr>' + f.rows.map(function (r) {
      return '<tr><td>' + r.a + '</td>' + (f.ins === 2 ? '<td>' + r.b + '</td>' : '') + '<td class="' + (r.o ? 'on' : '') + '">' + r.o + '</td></tr>';
    }).join('') + '</table>';
    return out;
  };

  /* ------------------------------------------------------------ data types */
  S.types = function (f) {
    var order = ['num', 'text', 'bool'];
    if (f.mode === 'sort') {
      var out = '<div class="tycard">' + (f.item ? '<b>' + esc(f.item) + '</b>' : '<em>?</em>') + '</div><div class="tybins">';
      order.forEach(function (o) {
        var mine = f.done.filter(function (d) { return d[1] === o && !(f.tp === '' && d[0] === f.item); });
        out += '<div class="tybin' + (f.tp === o ? ' cur' : '') + '"><small>' + esc(t('d.ty.' + o)) + '</small>' + mine.map(function (d) { return '<code>' + esc(d[0]) + '</code>'; }).join('') + '</div>';
      });
      return out + '</div>';
    }
    var o2 = '<div class="tycard wide">' + (f.expr ? '<code>' + esc(f.expr) + '</code><span>=</span><b>' + (f.res === null ? '?' : esc(f.res)) + '</b>' : '<em>?</em>') + '</div><div class="tyhist">';
    o2 += f.done.filter(function (d) { return d[0] !== f.expr; }).map(function (d) { return '<div><code>' + esc(d[0]) + '</code> = <b>' + esc(d[1]) + '</b></div>'; }).join('');
    return o2 + '</div>';
  };

  /* ---------------------------------------------------------------- arrays */
  S.arr = function (f) {
    if (f.mode === 'grid') {
      var g = '<div class="agrid"><div class="ahead"><i></i>' + f.grid[0].map(function (_, c) { return '<i class="' + (c === f.c ? 'cur' : '') + '">' + c + '</i>'; }).join('') + '</div>';
      f.grid.forEach(function (row, r) {
        g += '<div class="arow"><i class="' + (r === f.r ? 'cur' : '') + '">' + r + '</i>' + row.map(function (v, c) { return '<b class="' + (r === f.r && c === f.c ? 'cur' : '') + '">' + (f.hide && r === f.r && c === f.c ? '?' : v) + '</b>'; }).join('') + '</div>';
      });
      return g + '</div><div class="bitsnote">table[row][column]</div>';
    }
    var out = '<div class="arr">' + f.arr.map(function (v, i) {
      return '<div class="acell' + (i === f.idx ? ' cur' : '') + (f.wrote && i === f.idx ? ' wrote' : '') + '"><b>' + (f.hide && i === f.idx ? '?' : v) + '</b><small>' + i + '</small></div>';
    }).join('') + '</div>';
    if (f.mode === 'sum') out += '<div class="totbox"><span>' + t('d.total') + '</span><b>' + f.sum + '</b></div>';
    else out += '<div class="bitsnote">' + (f.idx >= 0 ? t('d.ar.at', { i: f.idx }) : t('d.ar.note')) + '</div>';
    return out;
  };

  /* ------------------------------------------------------------- functions */
  S.func = function (f) {
    var out = '<div class="vcode">' + f.defs.map(function (d, k) { return '<code class="' + (f.line.indexOf(0) >= 0 || f.line.indexOf(1) >= 0 ? 'on' : '') + '">' + esc(d.sig) + ' = ' + esc(d.body) + '</code>'; }).join('') + '</div>';
    out += '<div class="fnrow"><div class="fnin">' + (f.call ? esc(f.call) : '&nbsp;') + '</div><div class="fnbox"><span>f</span></div><div class="fnout ' + (f.res === null || f.res === undefined ? 'unk' : '') + '"><small>' + t('d.fn.result') + '</small><b>' + (f.res === null || f.res === undefined ? '?' : f.res) + '</b></div></div>';
    return out;
  };

  /* ------------------------------------------------------------- recursion */
  S.rec = function (f) {
    if (!f.stack.length) return '<div class="vboxes"><em class="empty">' + t('d.rc.empty') + '</em></div>';
    var rev = f.stack.slice().reverse(), curIdx = -1;
    rev.forEach(function (s, k) { if (curIdx < 0 && s.res === null) curIdx = k; });
    return '<div class="rstack">' + rev.map(function (s, k) {
      var line = s.n === 1 ? 'fact(1) = 1' : 'fact(' + s.n + ') = ' + s.n + ' \u00d7 fact(' + (s.n - 1) + ')';
      return '<div class="rbox' + (s.res !== null ? ' done' : '') + (k === curIdx ? ' cur' : '') + '"><code>' + esc(line) + '</code><b>' + (s.res === null ? '\u2026' : '= ' + s.res) + '</b></div>';
    }).join('') + '</div>';
  };

  return {};
});
