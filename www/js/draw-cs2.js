/* Pictures for the curriculum lessons, part 2 (see frames-cs2.js). Builds HTML strings only. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./draw.js'), require('./frames-cs2.js'), require('./i18n.js'));
  else root.DrawCS2 = factory(root.Draw, root.FramesCS2, root.I18n);
})(typeof self !== 'undefined' ? self : this, function (D, FC, I18n) {
  'use strict';
  var t = I18n.t, S = D.SCENES;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ------------------------------------------------------- inside the computer */
  S.hw = function (f) {
    if (f.ask) f = Object.assign({}, f, { on: [], data: '' }); // a question must not light up its own answer
    var order = ['in', 'cpu', 'out', 'mem', 'sto'];
    return '<div class="hwgrid">' + order.map(function (id) {
      var on = f.on.indexOf(id) >= 0;
      return '<div class="hwc ' + id + (on ? ' on' : '') + '"><b>' + esc(t('d.hw.' + id)) + '</b><small>' + esc(t('d.hw.' + id + '2')) + '</small>' + (on && f.data ? '<span class="hwchip">' + esc(f.data) + '</span>' : '') + '</div>';
    }).join('') + '</div><div class="bitsnote">' + esc(t('d.hw.note')) + '</div>';
  };

  /* ------------------------------------------------------------ files and folders */
  S.os = function (f) {
    if (f.ask) f = Object.assign({}, f, { path: [] }); // a question must not show its own answer
    return '<div class="ostree">' + f.lines.map(function (l) {
      var onPath = f.path.indexOf(l.n) >= 0 && (l.folder || f.path[f.path.length - 1] === l.n), isCur = f.path.length && f.path[f.path.length - 1] === l.n;
      return '<div class="osr d' + l.d + (onPath ? ' on' : '') + (isCur ? ' cur' : '') + '"><i class="' + (l.folder ? 'fo' : 'fi') + '"></i><span>' + esc(l.n) + '</span></div>';
    }).join('') + '</div>' + (f.path.length ? '<div class="ospath"><code>' + esc(f.path.join('/')) + '</code></div>' : '');
  };

  /* ---------------------------------------------------------------- spreadsheet */
  S.sheet = function (f) {
    var COLS = 'ABCD', out = '', r, c;
    function shown(ref) {
      var cell = f.cells[ref];
      if (!cell) return '';
      if (f.ask === ref) return '?';
      return String(cell.f ? FC.evalFormula(cell.f, f.cells) : cell.v);
    }
    if (f.bar) out += '<div class="shbar"><b>' + esc(f.bar.ref) + '</b><code>' + esc(f.ask === f.bar.ref ? '?' : f.bar.text) + '</code></div>';
    out += '<table class="sht"><tr><th></th>';
    for (c = 0; c < f.cols; c++) out += '<th>' + COLS[c] + '</th>';
    out += '</tr>';
    for (r = 1; r <= f.rows; r++) {
      out += '<tr><th>' + r + '</th>';
      for (c = 0; c < f.cols; c++) { var ref = COLS[c] + r; out += '<td class="' + (f.sel.indexOf(ref) >= 0 ? 'sel ' : '') + (f.cells[ref] && f.cells[ref].f ? 'fx' : '') + '">' + esc(shown(ref)) + '</td>'; }
      out += '</tr>';
    }
    return out + '</table>';
  };

  /* ------------------------------------------------------------------- database */
  S.db = function (f) {
    var head = '<tr>' + ['name', 'age', 'colony', 'fish'].map(function (c) { return '<th>' + esc(t('d.db.' + c)) + '</th>'; }).join('') + '</tr>';
    var out = (f.rule ? '<div class="dbrule"><span>' + esc(t('d.db.rule')) + '</span> <code>' + esc(f.rule) + '</code></div>' : '<div class="dbrule"><span>' + esc(t('d.db.table')) + '</span></div>');
    out += '<table class="dbt">' + head + f.rows.map(function (r) { return '<tr class="' + (r.on ? 'on' : (f.count !== null ? 'off' : '')) + '">' + r.c.map(function (v) { return '<td>' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
    if (f.count !== null && f.count !== undefined) out += '<div class="totbox"><span>' + esc(t('d.db.count')) + '</span><b>' + (f.ask ? '?' : f.count) + '</b></div>';
    return out;
  };

  /* -------------------------------------------------- passwords and phishing */
  S.sec = function (f) {
    if (f.mode === 'pw') {
      if (!f.pw) return '<div class="pwbox"><code class="pw">• • • • •</code></div><ul class="pwl">' + [0, 1, 2, 3, 4].map(function (i) { return '<li><i></i>' + esc(t('d.sec.c' + i)) + '</li>'; }).join('') + '</ul>';
      return '<div class="pwbox"><code class="pw">' + esc(f.pw) + '</code><div class="pwbar s' + f.score + '"><span style="width:' + (f.score * 20) + '%"></span></div></div><ul class="pwl">' + f.checks.map(function (ok, i) { return '<li class="' + (ok ? 'ok' : 'no') + '"><i>' + (ok ? '✓' : '✗') + '</i>' + esc(t('d.sec.c' + i)) + '</li>'; }).join('') + '</ul>';
    }
    function badge(n) { return f.shown >= n ? '<em class="clue">' + n + '</em>' : ''; }
    var m = 'd.sec.' + f.id;
    return '<div class="msgc"><div class="msgrow' + (f.shown >= 1 ? ' hot' : '') + '"><small>' + esc(t('d.sec.from')) + '</small><code>' + esc(f.from) + '</code>' + badge(1) + '</div>' +
      '<div class="msgrow"><small>' + esc(t('d.sec.subject')) + '</small><b>' + esc(t(m + '.subj')) + '</b></div>' +
      '<div class="msgbody"><span class="' + (f.shown >= 2 ? 'hot' : '') + '">' + esc(t(m + '.hurry')) + badge(2) + '</span> <span class="' + (f.shown >= 3 ? 'hot' : '') + '">' + esc(t(m + '.secret')) + badge(3) + '</span></div>' +
      '<div class="msgrow link' + (f.shown >= 4 ? ' hot' : '') + '"><small>' + esc(t('d.sec.link')) + '</small><u>' + esc(f.link) + '</u>' + badge(4) + '</div>' +
      (f.shown >= 4 ? '<div class="msgreal">' + esc(t('d.sec.real')) + ' <code>' + esc(f.real) + '</code></div>' : '') + '</div>';
  };

  /* ---------------------------------------------------------- digital citizenship */
  S.cit = function (f) {
    if (f.topic === 'intro') return '<div class="citcard intro"><b>' + esc(t('d.cit.intro')) + '</b></div>';
    return '<div class="citcard ' + f.topic + '"><small>' + esc(t('d.cit.t.' + f.topic)) + '</small><p>' + esc(t('d.cit.s.' + f.sc)) + '</p></div>';
  };

  return {};
});
