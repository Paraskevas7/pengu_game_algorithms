const test = require('node:test');
const assert = require('node:assert');
const F = require('../www/js/frames.js');
const A = require('../www/js/algos.js');
const I18n = require('../www/js/i18n.js');
require('../www/js/frames-cs.js');
require('../www/js/frames-cs2.js');
const CS = require('../www/js/frames-cs.js');

const asc = (a, b) => a - b;

test('quick sort frames: sorted positions hold final values and the left group is below the pivot', () => {
  for (const kind of ['random', 'sorted', 'reversed']) {
    for (let run = 0; run < 30; run++) {
      const arr = F.makeArray(kind, 7);
      const want = arr.slice().sort(asc);
      const d = F.sortFrames(arr);
      for (const f of d.frames) {
        assert.deepStrictEqual(f.arr.slice().sort(asc), want, 'permutation');
        f.sorted.forEach(i => assert.strictEqual(f.arr[i], want[i], 'sorted index holds final value'));
        f.line.forEach(i => assert.ok(i >= 0 && i < d.pseudo.length));
        if (f.line.includes(3)) f.left.forEach(i => assert.ok(f.arr[i] < f.arr[f.pivot], 'left group shorter than pivot'));
      }
      assert.deepStrictEqual(d.frames[d.frames.length - 1].arr, want);
      assert.ok(d.frames.filter(f => f.ms).length >= 3);
    }
  }
});

test('example arrays: sorted is the quick sort worst case, random is never already sorted', () => {
  const count = a => F.sortFrames(a).frames.filter(f => f.line.includes(3)).length;
  assert.strictEqual(count(F.makeArray('sorted', 7)), 21);
  assert.strictEqual(count(F.makeArray('reversed', 7)), 21);
  for (let i = 0; i < 200; i++) assert.ok(!F.makeArray('random', 7).every((v, k) => v === k + 1));
});

test('merge sort trace: every merge is correct and the top merge is the sorted line', () => {
  for (let run = 0; run < 100; run++) {
    const n = 2 + Math.floor(Math.random() * 7);
    const arr = F.makeArray('random', Math.min(n, 9));
    const t = A.mergeSortTrace(arr);
    const want = arr.slice().sort(asc);
    t.events.forEach(e => {
      assert.deepStrictEqual(e.result, e.left.concat(e.right).sort(asc));
      assert.deepStrictEqual(e.picks.map(p => p.v), e.result);
      assert.deepStrictEqual(e.left, e.left.slice().sort(asc));
    });
    const top = t.events[t.events.length - 1];
    assert.deepStrictEqual(top.result, want);
    // number of merges = n - 1 (every cut needs one merge)
    assert.strictEqual(t.events.length, arr.length - 1);
    // last split row is all single penguins
    assert.ok(t.rows[t.rows.length - 1].every(g => g.lo === g.hi));
  }
});

test('merge frames: rows keep every penguin, the story ends sorted, merge targets are sorted', () => {
  for (const arr of [[5, 2, 7, 1, 8, 3, 6, 4], [3, 1, 2], [9, 8, 7, 6, 5], [2, 1]]) {
    const d = F.mergeFrames(arr), want = arr.slice().sort(asc);
    assert.ok(d.frames.length >= 3);
    d.frames.forEach(f => {
      f.line.forEach(i => assert.ok(i >= 0 && i < d.pseudo.length));
      f.rows.forEach(r => r.groups.forEach(g => {
        if (g.state === 'sorted' || g.state === 'active' && r.kind === 'merge') assert.deepStrictEqual(g.values, g.values.slice().sort(asc));
        assert.strictEqual(g.values.length === 0 ? g.state : 'x', g.values.length === 0 ? 'ghost' : 'x');
      }));
      // split rows always contain every penguin exactly once
      f.rows.filter(r => r.kind === 'split').forEach(r =>
        assert.deepStrictEqual([].concat(...r.groups.map(g => g.values)).sort(asc), want));
    });
    const last = d.frames[d.frames.length - 1];
    const lastRow = last.rows[last.rows.length - 1];
    assert.deepStrictEqual(lastRow.groups[0].values, want);
    assert.strictEqual(lastRow.groups.length, 1);
    assert.ok(last.rows.length >= 2);
  }
});

test('typed numbers are checked kindly', () => {
  assert.deepStrictEqual(F.parseNumbers('5 2 7, 1', 3, 8), { ok: true, arr: [5, 2, 7, 1] });
  for (const bad of ['', '1 2', '1 1 2', '1 2 10', '1 2 x', '1.5 2 3', '0 1 2', '1 2 3 4 5 6 7 8 9'])
    assert.strictEqual(F.parseNumbers(bad, 3, 8).ok, false, bad);
  assert.match(F.parseNumbers('1', 3, 8).error, /3 to 8/);
});

test('bubble sort: sorts, pairs and quizzes are right, every frame is explained', () => {
  const F2 = require('../www/js/frames.js');
  for (const arr of [[4, 7, 2, 6, 1, 5, 3], [1, 2, 3, 4], [5, 4, 3, 2, 1], [2, 1]]) {
    const d = F2.bubbleFrames(arr);
    assert.deepStrictEqual(d.trace.result, arr.slice().sort((a, b) => a - b));
    assert.deepStrictEqual(d.frames[d.frames.length - 1].arr, d.trace.result);
    assert.strictEqual(d.frames[d.frames.length - 1].sorted.length, arr.length);
    d.frames.forEach(f => {
      assert.ok(f.text.length > 8);
      assert.deepStrictEqual(f.arr.slice().sort((a, b) => a - b), arr.slice().sort((a, b) => a - b));
      f.line.forEach(i => assert.ok(i >= 0 && i < d.pseudo.length));
      if (f.quiz) {
        const [i, j] = f.pair;
        assert.strictEqual(f.quiz.answer, f.arr[i] > f.arr[j] ? 'yes' : 'no');
      }
    });
  }
  assert.strictEqual(F2.bubbleFrames([1, 2, 3, 4]).trace.swaps, 0);
  assert.strictEqual(F2.bubbleFrames([5, 4, 3, 2, 1]).trace.swaps, 10);
});

test('merge sort quiz: the answer is the shorter front penguin', () => {
  const m = require('../www/js/frames.js').mergeFrames([5, 2, 7, 1, 8, 3, 6, 4]);
  const qs = m.frames.filter(f => f.quiz);
  assert.strictEqual(qs.length, 7);
  qs.forEach(f => {
    const vals = f.quiz.options.map(o => +o.id);
    assert.strictEqual(+f.quiz.answer, Math.min(...vals));
    assert.ok(f.quiz.view.rows[f.quiz.view.rows.length - 1].groups.some(g => g.state === 'ghost' && g.values.length === 0));
  });
});

test('binary search: finds or rules out the target, quizzes are right, every frame is explained', () => {
  const arr = [1, 2, 3, 5, 6, 8, 9];
  [1, 2, 3, 5, 6, 8, 9, 4, 7].forEach((target) => {
    const d = F.binaryFrames(arr, target);
    assert.strictEqual(d.trace.found, arr.indexOf(target));
    assert.ok(d.trace.looks <= 3, 'at most 3 looks for 7 penguins');
    d.frames.forEach((f) => {
      assert.ok(f.text && !/\{\w+\}/.test(f.text), 'text filled in: ' + f.text);
      if (f.quiz) {
        assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer));
        const m = arr[f.pivot];
        assert.strictEqual(f.quiz.answer, m === target ? 'found' : m < target ? 'right' : 'left');
      }
    });
  });
});

test('selection and insertion sort: sort correctly, quizzes are right, every frame is explained', () => {
  for (const arr of [[4, 7, 2, 6, 1, 5, 3], [1, 2, 3, 4], [5, 4, 3, 2, 1], [2, 1]]) {
    for (const fn of ['selectionFrames', 'insertionFrames']) {
      const d = F[fn](arr), sorted = arr.slice().sort((a, b) => a - b);
      assert.deepStrictEqual(d.trace.result, sorted);
      assert.deepStrictEqual(d.frames[d.frames.length - 1].arr, sorted);
      d.frames.forEach((f) => {
        assert.strictEqual(f.arr.length, arr.length);
        assert.ok(f.text && !/\{\w+\}/.test(f.text), f.text);
        if (f.quiz) assert.ok(['yes', 'no'].includes(f.quiz.answer));
      });
    }
  }
  assert.strictEqual(F.selectionFrames([5, 4, 3, 2, 1]).trace.comparisons, 10);
  assert.strictEqual(F.insertionFrames([1, 2, 3, 4]).trace.steps, 0);
  assert.strictEqual(F.insertionFrames([5, 4, 3, 2, 1]).trace.steps, 10);
  // selection quiz: "yes" exactly when the checked penguin is shorter than the smallest so far
  F.selectionFrames([4, 7, 2, 6, 1, 5, 3]).frames.filter((f) => f.quiz).forEach((f) => {
    assert.strictEqual(f.quiz.answer === 'yes', f.arr[f.cur] < f.arr[f.pivot]);
  });
});

test('stack and queue: always different penguins leave, quiz answers are right', () => {
  const d = F.dsFrames(), qs = d.frames.filter((f) => f.quiz);
  assert.strictEqual(qs.length, 4);
  d.frames.filter((f) => f.outQ).forEach((f) => assert.notStrictEqual(f.outQ, f.outS));
  qs.forEach((f) => {
    assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer));
    assert.ok(f.quiz.view.queue && f.quiz.view.stack);
  });
  d.frames.forEach((f) => assert.ok(f.text && !/\{\w+\}/.test(f.text), f.text));
});

test('heap: the rule holds after every insert and after taking the top, quizzes are right', () => {
  const ok = (h) => h.every((v, i) => i === 0 || h[(i - 1) >> 1] <= v);
  for (const arr of [[5, 3, 7, 1, 6, 2, 4], [1, 2, 3, 4, 5, 6, 7], [7, 6, 5, 4, 3, 2, 1], [2, 1, 3]]) {
    const d = F.heapFrames(arr);
    assert.ok(ok(d.trace.built), 'heap after inserts');
    assert.strictEqual(d.trace.built[0], Math.min(...arr));
    assert.strictEqual(d.trace.out, Math.min(...arr));
    assert.ok(ok(d.trace.rest), 'heap after taking the top');
    assert.deepStrictEqual(d.trace.rest.slice().sort((a, b) => a - b), arr.slice().sort((a, b) => a - b).slice(1));
    d.frames.forEach((f) => {
      assert.ok(f.text && !/\{\w+\}/.test(f.text), f.text);
      if (f.quiz) {
        assert.ok(['yes', 'no'].includes(f.quiz.answer));
        if (f.pair && f.quiz.q === undefined) assert.fail();
      }
    });
  }
  assert.strictEqual(F.heapFrames([1, 2, 3, 4, 5, 6, 7]).frames.filter((f) => f.quiz && f.quiz.answer === 'yes' && f.line.includes(2)).length, 0);
  assert.ok(F.heapFrames([7, 6, 5, 4, 3, 2, 1]).trace.swaps >= 9);
});

test('beginner lessons: binary adds up, loops add up, variables follow the program, quizzes are right', () => {
  for (let k = 0; k < F.PROG_EX.bits.length; k++) {
    const d = F.progFrames('bits', k), n = F.PROG_EX.bits[k].n;
    assert.strictEqual(parseInt(d.trace.bits.join(''), 2), n);
    d.frames.filter((f) => f.quiz).forEach((f) => assert.ok(['yes', 'no'].includes(f.quiz.answer)));
    assert.strictEqual(d.frames.filter((f) => f.quiz).length, 4);
  }
  for (const ex of F.PROG_EX.loop) {
    const d = F.progFrames('loop', F.PROG_EX.loop.indexOf(ex));
    assert.strictEqual(d.trace.total, ex.n * (ex.n + 1) / 2);
    d.frames.filter((f) => f.quiz).forEach((f) => {
      assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer));
      assert.ok(f.quiz.options.length >= 2 && f.quiz.options.length <= 4);
    });
  }
  assert.deepStrictEqual(F.progFrames('vars', 0).trace.boxes, [['fish', 6], ['friend', 5]]);
  assert.deepStrictEqual(F.progFrames('vars', 1).trace.boxes, [['a', 5], ['b', 3], ['temp', 3]]);
  [0, 1].forEach((k) => F.progFrames('vars', k).frames.forEach((f) => {
    assert.ok(f.text && !/\{\w+\}/.test(f.text), f.text);
    if (f.quiz) assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer));
  }));
});

test('batch 1 lessons: if/else picks the right branch, bug hunt finds the line, race counts, cipher shifts', () => {
  const acts = (v) => (v < 0 ? 'scarf' : v < 10 ? 'hat' : 'swim');
  F.PROG_EX.cond.forEach((ex, k) => {
    const d = F.progFrames('cond', k);
    assert.deepStrictEqual(d.trace.acts, ex.vs.map(acts));
    d.frames.filter((f) => f.quiz).forEach((f) => assert.ok(['yes', 'no'].includes(f.quiz.answer)));
    assert.ok(d.frames.filter((f) => f.quiz).length >= 4);
  });
  F.PROG_EX.bug.forEach((ex, k) => {
    const d = F.progFrames('bug', k), want = ex.expect;
    // the buggy program really is wrong and the fixed one really is right
    const bad = F.runLines(ex.lines), good = F.runLines(ex.fixed);
    assert.ok(Object.keys(want).some((n) => bad.find((b) => b.name === n).value !== want[n]));
    Object.keys(want).forEach((n) => assert.strictEqual(good.find((b) => b.name === n).value, want[n]));
    assert.strictEqual(d.trace.fixedOk, true);
    const q = d.frames.filter((f) => f.quiz && f.quiz.options.every((o) => ex.lines.includes(o.label)) && f.quiz.answer === String(ex.bug));
    assert.strictEqual(q.length, 1);
    assert.ok(q[0].quiz.options.some((o) => o.id === String(ex.bug) && o.label === ex.lines[ex.bug]));
  });
  F.PROG_EX.race.forEach((ex, k) => {
    const d = F.progFrames('race', k);
    d.frames.filter((f) => f.quiz).forEach((f) => {
      assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer));
      assert.strictEqual(new Set(f.quiz.options.map((o) => o.id)).size, f.quiz.options.length);
    });
    ex.sizes.forEach((n) => { const s = F.raceSteps(n); assert.strictEqual(2 ** s.slide, n); assert.strictEqual(s.wad, n * n); });
  });
  assert.strictEqual(F.shiftLetter('X', 3), 'A');
  assert.strictEqual(F.shiftLetter('Z', 1), 'A');
  assert.deepStrictEqual(F.PROG_EX.cipher.map((ex, k) => F.progFrames('cipher', k).trace.cipher), ['LFH', 'GJTI', 'XSTB']);
  F.PROG_EX.cipher.forEach((ex, k) => F.progFrames('cipher', k).frames.filter((f) => f.quiz).forEach((f) => assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer))));
});

test('batch 2 lessons: letters as numbers, packets rebuild the message, nearest neighbour, data statistics', () => {
  const rep = F.progFrames('rep', 0);
  assert.deepStrictEqual(rep.trace.nums, [9, 3, 5]);
  assert.deepStrictEqual(rep.trace.bins, ['01001', '00011', '00101']);
  assert.deepStrictEqual(F.progFrames('rep', 1).trace.nums, [6, 9, 19, 8]);
  F.PROG_EX.rep.filter((e) => e.mode === 'pix').forEach((e) => {
    const k = F.PROG_EX.rep.indexOf(e), d = F.progFrames('rep', k);
    assert.strictEqual(d.trace.rows.length, 5);
    d.frames.filter((f) => f.quiz).forEach((f) => { assert.ok(f.quiz.options.length >= 2); assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer)); assert.strictEqual(new Set(f.quiz.options.map((o) => o.id)).size, f.quiz.options.length); });
  });
  F.PROG_EX.net.forEach((e, k) => {
    const d = F.progFrames('net', k), pk = F.netPackets(e);
    assert.strictEqual(d.trace.rebuilt, e.msg);
    assert.strictEqual(pk.length * e.size, e.msg.length);
    assert.ok(e.order.slice().sort().join() === pk.map((_, i) => i).join() && e.lost >= 0 && e.lost < pk.length);
    d.frames.filter((f) => f.quiz).forEach((f) => assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer)));
    assert.strictEqual(d.frames[d.frames.length - 1].sorted, true);
  });
  F.PROG_EX.ai.forEach((e, k) => {
    e.tests.forEach((ti) => { const r = F.aiRank(F.AI_TESTS[ti]); assert.ok(r[1].d - r[0].d > 0.2, 'nearest must be clear for test ' + ti); });
    const d = F.progFrames('ai', k);
    assert.strictEqual(d.trace.guesses.length, 3);
    d.frames.filter((f) => f.quiz).forEach((f) => assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer)));
  });
  assert.deepStrictEqual(F.progFrames('ai', 0).trace.guesses, ['small', 'big', 'small']);
  F.PROG_EX.data.forEach((e, k) => {
    const d = F.progFrames('data', k), sum = e.vals.reduce((a, b) => a + b, 0);
    assert.strictEqual(d.trace.total, sum);
    assert.strictEqual(d.trace.avg, sum / e.vals.length);
    assert.ok(Number.isInteger(d.trace.avg));
    assert.strictEqual(e.vals.filter((v) => v === Math.max(...e.vals)).length, 1);
    assert.strictEqual(e.vals.filter((v) => v === Math.min(...e.vals)).length, 1);
    d.frames.filter((f) => f.quiz).forEach((f) => assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer)));
  });
});

test('batch 3a lessons: robot ends on the fish, flowcharts follow the arrows, gates match their truth tables, arrays, functions, recursion', () => {
  F.PROG_EX.robot.forEach((e, k) => {
    const d = F.progFrames('robot', k);
    assert.strictEqual(d.trace.won, true);
    assert.deepStrictEqual([d.trace.x, d.trace.y], [e.goal.x, e.goal.y]);
    d.frames.filter((f) => f.quiz).forEach((f) => { assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer)); assert.strictEqual(new Set(f.quiz.options.map((o) => o.id)).size, f.quiz.options.length); });
    d.frames.forEach((f) => { assert.ok(f.x >= 0 && f.x < 5 && f.y >= 0 && f.y < 5); });
  });
  assert.deepStrictEqual(F.progFrames('algo', 1).trace.path, ['s', 'look', 'q', 'umb', 'go', 'e']);
  assert.deepStrictEqual(F.progFrames('algo', 2).trace.path, ['s', 'look', 'q', 'sun', 'go', 'e']);
  assert.strictEqual(F.progFrames('algo', 3).trace.path.filter((x) => x === 'say').length, 3);
  F.PROG_EX.algo.forEach((e, k) => F.progFrames('algo', k).frames.filter((f) => f.quiz).forEach((f) => { assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer)); assert.ok(f.quiz.options.length >= 2); }));
  const tt = (g) => F.progFrames('logic', F.PROG_EX.logic.findIndex((e) => e.gate === g)).trace.table;
  assert.deepStrictEqual(tt('AND'), [0, 0, 0, 1]);
  assert.deepStrictEqual(tt('OR'), [0, 1, 1, 1]);
  assert.deepStrictEqual(tt('NOT'), [1, 0]);
  assert.deepStrictEqual(tt('ANDNOT'), [0, 0, 1, 0]);
  assert.deepStrictEqual(tt('NOR'), [1, 0, 0, 0]);
  assert.deepStrictEqual(F.progFrames('types', 0).trace.types, ['num', 'text', 'bool', 'text', 'num', 'bool']);
  assert.deepStrictEqual(F.progFrames('types', 1).trace.results, ['7', '"34"', '"iceberg"', '6']);
  F.PROG_EX.types.forEach((e, k) => F.progFrames('types', k).frames.filter((f) => f.quiz).forEach((f) => assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer))));
  assert.deepStrictEqual(F.progFrames('arr', 0).trace.arr, [7, 10, 9, 4, 6]);
  assert.strictEqual(F.progFrames('arr', 1).trace.sum, 12);
  assert.deepStrictEqual(F.progFrames('arr', 2).trace.values, [2, 7, 6, 9]);
  F.PROG_EX.arr.forEach((e, k) => F.progFrames('arr', k).frames.filter((f) => f.quiz).forEach((f) => assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer))));
  assert.deepStrictEqual(F.progFrames('func', 0).trace.results, [6, 10, 16]);
  assert.deepStrictEqual(F.progFrames('func', 1).trace.results, [6, 20, 18]);
  assert.deepStrictEqual(F.progFrames('func', 2).trace.results, [5, 10]);
  assert.deepStrictEqual([3, 4, 5].map((n, k) => F.progFrames('rec', k).trace.result), [6, 24, 120]);
  assert.strictEqual(CS.fact(5), 120);
  F.PROG_EX.rec.forEach((e, k) => { const d = F.progFrames('rec', k); d.frames.filter((f) => f.quiz).forEach((f) => assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer))); const last = d.frames[d.frames.length - 1]; assert.ok(last.stack.every((s) => s.res !== null)); });
});

test('batch 3b lessons: computer parts, folder paths, spreadsheet maths, database filters, passwords and phishing, citizenship', () => {
  const CS2 = require('../www/js/frames-cs2.js');
  I18n.setLang('en');
  const allQuizzesOk = (kind) => F.PROG_EX[kind].forEach((e, k) => {
    const d = F.progFrames(kind, k);
    assert.ok(d.frames.length >= 5, kind + ' frames');
    assert.ok(d.frames.filter((f) => f.quiz).length >= 2, kind + ' has quizzes');
    d.frames.forEach((f) => { assert.ok(f.text && !/\{\w+\}/.test(f.text) && !/^[a-z]+\.[a-z]/i.test(f.text), kind + ' text: ' + f.text); if (f.quiz) { assert.ok(f.quiz.options.some((o) => o.id === f.quiz.answer), kind + ' answer is an option'); assert.strictEqual(new Set(f.quiz.options.map((o) => o.id)).size, f.quiz.options.length, kind + ' options are distinct'); assert.ok(!/\{\w+\}/.test(f.quiz.q + f.quiz.why)); } });
  });
  ['hw', 'os', 'sheet', 'db', 'sec', 'cit'].forEach(allQuizzesOk);
  // folders: the path really leads to the file and the quiz answer is that path
  F.PROG_EX.os.forEach((e, k) => { const d = F.progFrames('os', k), want = CS2.findPath(CS2.TREES[e.tree], e.file, []).join('/'); assert.strictEqual(d.trace.path, want); assert.ok(d.frames.some((f) => f.quiz && f.quiz.answer === want)); });
  // spreadsheet: formulas are evaluated, and a changed cell changes the sum
  assert.deepStrictEqual([F.progFrames('sheet', 0).trace.c1, F.progFrames('sheet', 0).trace.c2], [10, 35]);
  assert.deepStrictEqual(F.progFrames('sheet', 1).trace, { sum: 16, sum2: 20, max: 9 });
  assert.strictEqual(CS2.evalFormula('=SUM(A1:A2)', { A1: { v: 3 }, A2: { v: 4 } }), 7);
  // database: counts match the rule
  const rows = CS2.DB_ROWS, qs = F.progFrames('db', 0).frames.filter((f) => f.quiz).map((f) => f.quiz.answer);
  assert.deepStrictEqual(qs, [String(rows.filter((r) => r[2] === 'A').length), String(rows.filter((r) => r[1] > 3).length), String(rows.filter((r) => r[3] > 4).length)]);
  const sorted = F.progFrames('db', 1).frames.filter((f) => f.quiz).map((f) => f.quiz.answer);
  assert.deepStrictEqual(sorted, ['Ziggy', 'Mochi', 'Snow']);
  // passwords: the five checks
  assert.deepStrictEqual(F.progFrames('sec', 0).trace.scores, [1, 3, 5]);
  assert.deepStrictEqual(CS2.pwChecks('Ab1!'), [false, true, true, true, true]);
  // phishing: four clues are revealed one by one, and the safe answer is "do not click"
  const m = F.progFrames('sec', 1).frames.filter((f) => f.mode === 'msg').map((f) => f.shown);
  assert.deepStrictEqual(m.slice(0, 5), [0, 1, 2, 3, 4]);
  assert.ok(F.progFrames('sec', 2).frames.some((f) => f.quiz && f.quiz.answer === 'no'));
  // citizenship: one scenario per quiz and the answers are not always in the same place
  const ans = ['one', 'two'].flatMap((_, k) => F.progFrames('cit', k).frames.filter((f) => f.quiz).map((f) => f.quiz.answer));
  assert.ok(new Set(ans).size === 3, 'answers use a, b and c: ' + ans);
  // everything also works in Greek
  I18n.setLang('el');
  ['hw', 'os', 'sheet', 'db', 'sec', 'cit'].forEach(allQuizzesOk);
  I18n.setLang('en');
});

test('Program the Penguin: every level can be solved with its model answer, walls stop the penguin, stars follow the block count', () => {
  const R = require('../www/js/robot.js');
  R.LEVELS.forEach((l) => {
    const r = R.run(l, l.sol);
    assert.ok(r.won, l.id + ' model answer reaches the fish');
    assert.strictEqual(r.bumps, 0, l.id + ' model answer has no bumps');
    assert.ok(l.sol.every((b) => b.n <= l.maxRep), l.id + ' respects its repeat limit');
    assert.strictEqual(R.par(l), l.sol.length);
  });
  const rb4 = R.LEVELS.find((l) => l.id === 'rb4');
  const bumped = R.run(rb4, [{ c: 'R', n: 1 }, { c: 'F', n: 1 }]);   // faces east into a wall
  assert.strictEqual(bumped.bumps, 1);
  assert.deepStrictEqual([bumped.final.x, bumped.final.y], [0, 4]);
  assert.ok(!bumped.won);
  assert.ok(!R.run(rb4, []).won);
  const rb1 = R.LEVELS[0];
  assert.deepStrictEqual([R.starsFor(rb1, 2), R.starsFor(rb1, 4), R.starsFor(rb1, 9)], [3, 2, 1]);
  assert.strictEqual(R.run(rb1, [{ c: 'F', n: 4 }]).won, true, 'stops at the fish even if the program goes on');
});

test('Light the Lamp: every level has settings to find, the answers really give the goal, and the others do not', () => {
  const C = require('../www/js/circuits.js');
  C.LEVELS.forEach((l) => {
    const sol = C.solutions(l);
    assert.ok(sol.length >= 1 && sol.length < (1 << l.vars.length), l.id + ' has some but not all settings as answers');
    for (let k = 0; k < (1 << l.vars.length); k++) {
      const code = k.toString(2).padStart(l.vars.length, '0');
      assert.strictEqual(sol.includes(code), C.lamp(l, code) === l.target, l.id + ' ' + code);
    }
  });
  assert.deepStrictEqual(C.solutions(C.LEVELS[0]), ['11']);
  assert.strictEqual(C.text(['OR', ['AND', 'A', 'B'], 'C']), '(A AND B) OR C');
});
