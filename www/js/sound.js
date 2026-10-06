/* Tiny optional sound effects made with the browser's own audio. Off by default (good for classrooms). */
(function () {
  'use strict';
  var KEY = 'pengurithm-sound', ctx = null;
  function isOn() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function setOn(v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {} }
  function audio() {
    if (ctx) return ctx;
    try { var AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); } catch (e) { ctx = null; }
    return ctx;
  }
  function tone(c, freq, start, dur, type, vol) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
  }
  var SOUNDS = {
    ok: [[660, 0, 0.14], [880, 0.12, 0.2]],
    no: [[220, 0, 0.22, 'triangle']],
    win: [[523, 0, 0.14], [659, 0.13, 0.14], [784, 0.26, 0.14], [1047, 0.39, 0.3]]
  };
  function play(name) {
    if (!isOn()) return;
    var c = audio(), s = SOUNDS[name];
    if (!c || !s) return;
    try {
      if (c.state === 'suspended') c.resume();
      s.forEach(function (n) { tone(c, n[0], n[1], n[2], n[3]); });
    } catch (e) {}
  }
  function toggle() { var v = !isOn(); setOn(v); if (v) play('ok'); return v; }
  window.Sound = { on: isOn, toggle: toggle, play: play };
})();
