const test = require('node:test');
const assert = require('node:assert');
const D = require('../www/js/draw.js');
const G = require('../www/js/graphs.js');
const F = require('../www/js/frames.js');
require('../www/js/frames-cs.js');
require('../www/js/frames-cs2.js');
require('../www/js/draw-cs.js');
require('../www/js/draw-cs2.js');

function balanced(html) {
  // every opened svg/div/g/table/tr/td/th/tbody/thead/span/text closes
  for (const tag of ['svg', 'div', 'g', 'table', 'tbody', 'thead', 'tr', 'td', 'th', 'span', 'text', 'rect', 'circle']) {
    const open = (html.match(new RegExp('<' + tag + '[\\s>]', 'g')) || []).length;
    const selfClose = (html.match(new RegExp('<' + tag + '[^>]*/>', 'g')) || []).length;
    const close = (html.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    assert.strictEqual(open - selfClose, close, tag + ' balanced');
  }
  assert.ok(!/undefined|NaN|null/.test(html), 'no undefined/NaN/null in output');
}

test('graph pictures draw for every frame of every example', () => {
  for (const kind of ['bfs', 'dfs', 'dij']) {
    const g = G.graphFor(kind);
    for (const ex of g.examples) {
      const d = G.graphFrames(kind, g, ex.start, ex.goal);
      d.frames.forEach(f => {
        const svg = D.graphSVG(g, f, { goal: ex.goal, start: ex.start });
        balanced(svg);
        assert.strictEqual((svg.match(/class="gn/g) || []).length, Object.keys(g.nodes).length);
        assert.strictEqual((svg.match(/<line /g) || []).length, g.edges.length);
        if (f.current) assert.ok(svg.includes('class="spr"'));
        balanced(kind === 'dij' ? D.distTable(g, f) : D.chips(f, kind));
      });
    }
  }
});

test('Dijkstra pictures show costs, infinity and arrows', () => {
  const g = G.WEIGHTED, d = G.graphFrames('dij', g, 'A', 'F');
  assert.ok(D.graphSVG(g, d.frames[0]).includes('∞'));
  const last = d.frames[d.frames.length - 1];
  const svg = D.graphSVG(g, last);
  assert.ok(svg.includes('fromarrow') && svg.includes('class="ge path"'));
  assert.ok(D.distTable(g, last).includes('<td>13</td>'));
});

test('penguin rows and merge pictures draw for every frame', () => {
  for (const kind of ['random', 'sorted']) {
    F.sortFrames(F.makeArray(kind, 7)).frames.forEach(f => {
      const html = D.sortRow(f);
      balanced(html);
      assert.strictEqual((html.match(/class="sp/g) || []).length, 7);
    });
  }
  for (const arr of [[5, 2, 7, 1, 8, 3, 6, 4], [3, 1, 2]]) {
    F.mergeFrames(arr).frames.forEach(f => {
      const html = D.mergeRows(f);
      balanced(html);
      assert.ok(html.includes('Cutting in halves'));
    });
  }
});

test('spanning-tree and bubble pictures draw for every frame and quiz view', () => {
  for (const [kind, d] of [['prim', G.graphFrames('prim', G.MST, 'D')], ['kruskal', G.graphFrames('kruskal', G.MST)]]) {
    d.frames.concat(d.frames.filter(f => f.quiz).map(f => f.quiz.view)).forEach(f => {
      const svg = D.graphSVG(G.MST, f, {});
      balanced(svg);
      assert.strictEqual((svg.match(/<line /g) || []).length, G.MST.edges.length);
      balanced(D.scene(kind, G.MST, f, {}));
      balanced(D.edgeList(f, kind));
    });
  }
  const last = G.graphFrames('kruskal', G.MST).frames.pop();
  assert.ok(D.graphSVG(G.MST, last, {}).includes('class="ge rej'));
  const b = F.bubbleFrames([4, 7, 2, 6, 1, 5, 3]);
  b.frames.forEach(f => { balanced(D.sortRow(f)); assert.strictEqual((D.sortRow(f).match(/class="sp/g) || []).length, 7); });
  assert.strictEqual((D.sortRow(b.frames[1]).match(/class="sp cur/g) || []).length, 2);
});

test('binary search pictures draw: middle tagged, found penguin final, the rest dimmed', () => {
  const d = F.binaryFrames([1, 2, 3, 5, 6, 8, 9], 8);
  d.frames.forEach(f => { balanced(D.sortRow(f)); assert.strictEqual((D.sortRow(f).match(/class="sp/g) || []).length, 7); });
  const look = d.frames.find(f => f.quiz);
  assert.match(D.sortRow(look), /data-tag="middle"/);
  const end = d.frames[d.frames.length - 1];
  assert.strictEqual((D.sortRow(end).match(/class="sp final/g) || []).length, 1);
  assert.strictEqual((D.sortRow(end).match(/class="sp dim/g) || []).length, 6);
});

test('directed maps draw one arrowhead per road, with scenes and side panels for every frame', () => {
  for (const kind of ['topo', 'bf']) {
    const g = G.graphFor(kind), ex = g.examples[0], d = G.graphFrames(kind, g, ex.start, ex.goal);
    d.frames.concat(d.frames.filter(f => f.quiz).map(f => f.quiz.view)).forEach(f => {
      const svg = D.graphSVG(g, f, {});
      balanced(svg);
      assert.strictEqual((svg.match(/<polygon class="ea/g) || []).length, g.edges.length);
      balanced(D.scene(kind, g, f, {}));
    });
  }
});

test('stack/queue panels and the heap tree draw for every frame and quiz view', () => {
  const ds = F.dsFrames();
  ds.frames.concat(ds.frames.filter(f => f.quiz).map(f => f.quiz.view)).forEach(f => balanced(D.scene('sq', null, f, {})));
  const hp = F.heapFrames([5, 3, 7, 1, 6, 2, 4]);
  hp.frames.forEach(f => {
    const svg = D.heapSVG(f);
    balanced(svg);
    assert.strictEqual((svg.match(/<circle /g) || []).length, f.arr.length);
    assert.strictEqual((svg.match(/<line /g) || []).length, Math.max(0, f.arr.length - 1));
  });
});

test('beginner pictures draw for every frame and quiz view', () => {
  for (const kind of ['bits', 'loop', 'vars', 'cond', 'bug', 'race', 'cipher', 'rep', 'net', 'ai', 'data', 'robot', 'algo', 'logic', 'types', 'arr', 'func', 'rec', 'hw', 'os', 'sheet', 'db', 'sec', 'cit']) {
    F.PROG_EX[kind].forEach((_, k) => {
      const d = F.progFrames(kind, k);
      d.frames.concat(d.frames.filter(f => f.quiz).map(f => f.quiz.view)).forEach(f => balanced(D.scene(kind, null, f, {})));
    });
  }
});
