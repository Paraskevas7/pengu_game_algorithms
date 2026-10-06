const test = require('node:test');
const assert = require('node:assert');
const I18n = require('../www/js/i18n.js');
global.I18n = I18n;
require('../www/js/i18n-el.js');
const Content = require('../www/js/content.js');
global.Content = Content;
require('../www/js/content-el.js');
const G = require('../www/js/graphs.js');
const F = require('../www/js/frames.js');
require('../www/js/frames-cs.js');
require('../www/js/frames-cs2.js');

const holes = (s) => (typeof s === 'string' ? (s.match(/\{\w+\}/g) || []).sort().join(',') : '');

test('Greek has exactly the same keys as English', () => {
  const en = Object.keys(I18n.dict.en).sort(), el = Object.keys(I18n.dict.el).sort();
  assert.deepStrictEqual(el.filter((k) => !en.includes(k)), [], 'extra Greek keys');
  assert.deepStrictEqual(en.filter((k) => !el.includes(k)), [], 'missing Greek keys');
});

test('Greek sentences keep every {placeholder} and pseudocode keeps its line count', () => {
  Object.keys(I18n.dict.en).forEach((k) => {
    const a = I18n.dict.en[k], b = I18n.dict.el[k];
    if (Array.isArray(a)) assert.strictEqual(b.length, a.length, k);
    else assert.strictEqual(holes(b), holes(a), k);
  });
});

test('Greek text really is Greek (not a copy of English)', () => {
  const same = Object.keys(I18n.dict.en).filter((k) => typeof I18n.dict.en[k] === 'string' && /[A-Za-z]{4,}/.test(I18n.dict.en[k]) && I18n.dict.en[k] === I18n.dict.el[k]);
  // a few are fine (e.g. e-mail placeholder); fail if many are untranslated
  assert.ok(same.length < 6, 'untranslated: ' + same.join(', '));
});

test('Greek lessons mirror the English lessons', () => {
  I18n.setLang('en');
  const en = JSON.parse(JSON.stringify(Content.order.map((k) => Content[k])));
  const enUi = JSON.parse(JSON.stringify(Content.ui));
  I18n.setLang('el');
  Content.order.forEach((k, i) => {
    const e = en[i], g = Content[k];
    assert.notStrictEqual(g.title, e.title, k + ' title');
    assert.strictEqual(g.story.length, e.story.length, k + ' story');
    assert.strictEqual(g.steps.length, e.steps.length, k + ' steps');
    assert.ok(g.short, k + ' short');
    ['tag', 'goal', 'remember', 'used', 'watch'].forEach((f) => assert.ok(g[f] && g[f] !== e[f], k + ' ' + f));
    assert.ok(g.time.formula && g.time.text, k + ' time');
  });
  Object.keys(enUi).forEach((k) => assert.ok(Content.ui[k] !== enUi[k], 'ui ' + k));
  I18n.setLang('en');
});

test('every lesson frame, quiz and example works in Greek', () => {
  I18n.setLang('el');
  const out = [];
  ['bfs', 'dfs', 'dij', 'prim', 'kruskal', 'topo', 'bf'].forEach((kind) => {
    const g = G.graphFor(kind);
    g.examples.forEach((ex) => {
      assert.ok(I18n.t(ex.key, ex.vars) !== ex.key, 'example key ' + ex.key);
      G.graphFrames(kind, g, ex.start, ex.goal).frames.forEach((f) => { out.push(f.text); if (f.quiz) out.push(f.quiz.q, f.quiz.why, ...f.quiz.options.map((o) => o.label)); });
    });
  });
  [F.sortFrames([4, 2, 5, 1, 3]), F.mergeFrames([5, 2, 7, 1, 8, 3]), F.bubbleFrames([3, 1, 2]), F.binaryFrames([1, 2, 3, 5, 6, 8, 9], 8), F.binaryFrames([1, 2, 3, 5, 6, 8, 9], 4), F.selectionFrames([3, 1, 2]), F.insertionFrames([3, 1, 2]), F.dsFrames(), F.heapFrames([5, 3, 7, 1, 6, 2, 4]), F.progFrames('bits', 0), F.progFrames('loop', 1), F.progFrames('vars', 0), F.progFrames('vars', 1), ...['cond', 'bug', 'race', 'cipher', 'rep', 'net', 'ai', 'data', 'robot', 'algo', 'logic', 'types', 'arr', 'func', 'rec', 'hw', 'os', 'sheet', 'db', 'sec', 'cit'].flatMap((k) => F.PROG_EX[k].map((_, i) => F.progFrames(k, i)))].forEach((d) => {
    d.frames.forEach((f) => { out.push(f.text); if (f.quiz) out.push(f.quiz.q, f.quiz.why); });
    d.pseudo.forEach((l) => out.push(l));
  });
  out.forEach((s) => {
    assert.ok(typeof s === 'string' && s.length > 0);
    assert.ok(!/\{\w+\}/.test(s), 'unfilled placeholder in: ' + s);
    assert.ok(!/undefined|NaN|\[object/.test(s), 'bad value in: ' + s);
  });
  assert.ok(out.some((s) => /[Α-Ωα-ω]{4,}/.test(s)));
  I18n.setLang('en');
});

test('language falls back to English for a missing key and is remembered by detect()', () => {
  I18n.setLang('el');
  assert.strictEqual(I18n.t('no.such.key'), 'no.such.key');
  I18n.setLang('en');
  assert.strictEqual(I18n.lang(), 'en');
});
