/* "Light the Lamp": a logic puzzle. Flip switches and find every setting that gives the goal. Pure logic (browser and Node). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Circuits = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  /* An expression is a switch name ('A') or [gate, ...inputs]. target is the lamp state the player must find. */
  var LEVELS = [
    { id: 'lg1', algo: 'logic', vars: ['A', 'B'], expr: ['AND', 'A', 'B'], target: 1 },
    { id: 'lg2', algo: 'logic', vars: ['A', 'B'], expr: ['OR', 'A', 'B'], target: 1 },
    { id: 'lg3', algo: 'logic', vars: ['A', 'B'], expr: ['AND', 'A', ['NOT', 'B']], target: 1 },
    { id: 'lg4', algo: 'logic', vars: ['A', 'B', 'C'], expr: ['OR', ['AND', 'A', 'B'], 'C'], target: 0 },
    { id: 'lg5', algo: 'logic', vars: ['A', 'B', 'C'], expr: ['AND', ['OR', 'A', 'B'], ['NOT', 'C']], target: 1 }
  ];
  function evaluate(e, env) {
    if (typeof e === 'string') return env[e] ? 1 : 0;
    var v = e.slice(1).map(function (x) { return evaluate(x, env); });
    if (e[0] === 'AND') return v[0] && v[1] ? 1 : 0;
    if (e[0] === 'OR') return v[0] || v[1] ? 1 : 0;
    if (e[0] === 'NOT') return v[0] ? 0 : 1;
    throw new Error('gate ' + e[0]);
  }
  /** The expression as text, e.g. "(A AND B) OR C". */
  function text(e, top) {
    if (typeof e === 'string') return e;
    if (e[0] === 'NOT') return 'NOT ' + text(e[1], false);
    var s = text(e[1], false) + ' ' + e[0] + ' ' + text(e[2], false);
    return top === false ? '(' + s + ')' : s;
  }
  function envOf(level, code) { var env = {}; level.vars.forEach(function (v, i) { env[v] = code.charAt(i) === '1'; }); return env; }
  /** Every switch setting (like "101") that gives the goal. */
  function solutions(level) {
    var out = [], n = level.vars.length;
    for (var k = 0; k < (1 << n); k++) {
      var code = ''; for (var i = 0; i < n; i++) code += (k >> (n - 1 - i)) & 1;
      if (evaluate(level.expr, envOf(level, code)) === level.target) out.push(code);
    }
    return out;
  }
  function lamp(level, code) { return evaluate(level.expr, envOf(level, code)); }
  return { LEVELS: LEVELS, evaluate: evaluate, text: text, solutions: solutions, lamp: lamp };
});
