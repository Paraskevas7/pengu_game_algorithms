/* Extras on the menu: the daily puzzle with a streak, and a printable certificate with the student's name. */
(function () {
  'use strict';
  var T = window.Content, D = window.Draw, C = window.PenguinCore, tx = window.I18n.t;
  var $app = document.getElementById('app');
  var DAILY_KEY = 'pengurithm-daily-v1', NAME_KEY = 'pengurithm-name';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function store(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } }
  function put(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dateStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { return dateStr(new Date()); }
  function yesterday() { var d = new Date(); d.setDate(d.getDate() - 1); return dateStr(d); }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ---------- Daily puzzle ---------- */
  function dailyState() {
    var s = store(DAILY_KEY) || { last: '', streak: 0 };
    var alive = s.last === today() || s.last === yesterday();
    return { doneToday: s.last === today(), streak: alive ? s.streak : 0, raw: s };
  }
  function recordDaily() {
    var st = dailyState();
    if (!st.doneToday) {
      var streak = st.raw.last === yesterday() ? st.raw.streak + 1 : 1;
      put(DAILY_KEY, { last: today(), streak: streak });
      return { streak: streak };
    }
    return { streak: st.streak };
  }
  function openDaily() {
    var kinds = T.order;
    var seed = hash(today());
    window.Quiz.openDaily(kinds[seed % kinds.length], seed, function () { return recordDaily(); });
  }

  function dailyCard() {
    var st = dailyState();
    return '<section class="card extra"><div><h2>' + esc(tx('x.dailyTitle')) + '</h2><p class="blurb">' + esc(tx(st.doneToday ? 'x.dailyDone' : 'x.dailyText')) +
      (st.streak ? ' <b>' + esc(tx(st.streak === 1 ? 'x.streak1' : 'x.streakN', { n: st.streak })) + '</b>' : '') + '</p></div>' +
      '<button class="btn ' + (st.doneToday ? '' : 'primary') + '" data-act="daily">' + esc(tx(st.doneToday ? 'x.dailyAgain' : 'x.dailyPlay')) + '</button></section>';
  }

  /* ---------- Certificate ---------- */
  function tierOf(n, total) { return n >= total && total > 0 ? 4 : n >= 8 ? 3 : n >= 3 ? 2 : 1; }

  function certificateCard(done, total) {
    if (!done.length) {
      return '<section class="card extra"><div><h2>' + esc(tx('x.certTitle')) + '</h2><p class="blurb">' + esc(tx('x.certNone')) + '</p></div></section>';
    }
    return '<section class="card extra"><div><h2>' + esc(tx('x.certTitle')) + '</h2><p class="blurb">' + esc(tx('x.certProgress', { n: done.length, m: total })) + '</p></div>' +
      '<button class="btn primary" data-act="cert">' + esc(tx('x.certGet')) + '</button></section>';
  }

  function certSVG(name, done, total) {
    var tier = tierOf(done.length, total), nm = name.trim() || '________________';
    var size = nm.length > 26 ? 26 : nm.length > 18 ? 34 : 44;
    var names = done.map(function (c) { return T[c].short; });
    var list = names.length > 6 ? names.slice(0, 6).join(', ') + ' …' : names.join(', ');
    var lang = window.I18n.lang(), loc = lang === 'el' ? 'el-GR' : 'en-GB', when = new Date().toLocaleDateString(loc, { year: 'numeric', month: 'long', day: 'numeric' });
    var F = 'font-family="Georgia, \'Times New Roman\', serif"', G = 'font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif"';
    return '<svg id="certsvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" role="img" aria-label="' + esc(tx('x.certHeading')) + '">' +
      '<rect width="800" height="560" fill="#fffdf5"/>' +
      '<rect x="14" y="14" width="772" height="532" rx="18" fill="none" stroke="#17304d" stroke-width="6"/>' +
      '<rect x="28" y="28" width="744" height="504" rx="12" fill="none" stroke="#e8a317" stroke-width="2.5"/>' +
      '<g transform="translate(360 52) scale(1.8)">' + D.penguinParts(3, true) + '</g>' +
      '<text x="400" y="190" text-anchor="middle" ' + F + ' font-size="40" font-weight="700" fill="#17304d">' + esc(tx('x.certHeading')) + '</text>' +
      '<text x="400" y="232" text-anchor="middle" ' + G + ' font-size="18" fill="#5b6b7d">' + esc(tx('x.certAward')) + '</text>' +
      '<text x="400" y="296" text-anchor="middle" ' + F + ' font-size="' + size + '" font-style="italic" font-weight="700" fill="#b86e00">' + esc(nm) + '</text>' +
      '<line x1="170" y1="312" x2="630" y2="312" stroke="#17304d" stroke-width="1.5"/>' +
      '<text x="400" y="352" text-anchor="middle" ' + G + ' font-size="20" fill="#17304d">' + esc(tx('x.certDid', { n: done.length })) + '</text>' +
      '<text x="400" y="384" text-anchor="middle" ' + G + ' font-size="14" fill="#5b6b7d">' + esc(list) + '</text>' +
      '<rect x="270" y="410" width="260" height="44" rx="22" fill="#17304d"/>' +
      '<text x="400" y="439" text-anchor="middle" ' + G + ' font-size="20" font-weight="700" fill="#ffcf3f">' + esc(tx('x.certTier' + tier)) + '</text>' +
      '<text x="90" y="506" ' + G + ' font-size="15" fill="#17304d">' + esc(tx('x.certDate')) + ': ' + esc(when) + '</text>' +
      '<text x="710" y="506" text-anchor="end" ' + G + ' font-size="18" font-weight="800" fill="#17304d">CS Penguins</text>' +
      '</svg>';
  }

  function openCertificate() {
    var done = C.doneChapters(), total = T.order.length;
    var saved = store(NAME_KEY) || '';
    $app.classList.remove('wide');
    $app.innerHTML = '<div class="topbar"><button class="icon-btn" data-act="menu" aria-label="' + esc(tx('x.certBack')) + '">‹</button><div class="ttl"><b>' + esc(tx('x.certTitle')) + '</b></div><span class="topspace"></span></div>' +
      '<div class="lesson"><section class="certwrap" id="certbox">' + certSVG(saved, done, total) + '</section>' +
      '<section class="card certui"><label class="numlabel" for="certname">' + esc(tx('x.certName')) + '</label>' +
      '<div class="numrow"><input id="certname" type="text" maxlength="40" autocomplete="off" placeholder="' + esc(tx('x.certNamePh')) + '" value="' + esc(saved) + '"></div>' +
      '<div class="row"><button class="btn primary" data-act="certsave">' + esc(tx('x.certSave')) + '</button><button class="btn" data-act="certprint">' + esc(tx('x.certPrint')) + '</button></div>' +
      '<p class="hint" id="certmsg" role="status"></p></section></div>';
    window.scrollTo(0, 0);
    $app.oninput = function (e) {
      if (e.target.id !== 'certname') return;
      var v = e.target.value.slice(0, 40);
      put(NAME_KEY, v);
      document.getElementById('certbox').innerHTML = certSVG(v, done, total);
    };
    $app.onclick = function (e) {
      var t = e.target.closest('[data-act]'); if (!t) return;
      if (t.dataset.act === 'menu') { $app.oninput = null; C.showMenu(); }
      else if (t.dataset.act === 'certprint') { try { window.print(); } catch (err) {} }
      else if (t.dataset.act === 'certsave') savePNG();
    };
  }

  function savePNG() {
    var svg = document.getElementById('certsvg'), msg = document.getElementById('certmsg');
    try {
      var xml = new XMLSerializer().serializeToString(svg), img = new Image();
      img.onload = function () {
        try {
          var c = document.createElement('canvas'); c.width = 1600; c.height = 1120;
          c.getContext('2d').drawImage(img, 0, 0, 1600, 1120);
          c.toBlob(function (b) {
            if (!b) { if (msg) msg.textContent = tx('x.certFail'); return; }
            var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'cs-penguins-certificate.png';
            document.body.appendChild(a); a.click(); a.remove();
            if (msg) msg.textContent = tx('x.certSaved');
          }, 'image/png');
        } catch (err) { if (msg) msg.textContent = tx('x.certFail'); }
      };
      img.onerror = function () { if (msg) msg.textContent = tx('x.certFail'); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    } catch (err) { if (msg) msg.textContent = tx('x.certFail'); }
  }

  /* ---------- Menu hooks ---------- */
  function cards(done, total) { return '<div class="extras">' + dailyCard() + certificateCard(done, total) + '</div>'; }
  function handle(act) {
    if (act === 'daily') { openDaily(); return true; }
    if (act === 'cert') { openCertificate(); return true; }
    return false;
  }

  window.Extras = { cards: cards, handle: handle, today: today, tierOf: tierOf, hash: hash };
})();
