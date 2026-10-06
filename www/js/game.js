/* CS Penguins - UI and game flow. Algorithm logic lives in algos.js */
(function () {
  'use strict';
  var A = window.Algos;
  var tx = window.I18n.t;
  var $app = document.getElementById('app');

  /* ---------- Content ---------- */
  /* ---------- Original artwork (inline SVG, no third-party assets) ---------- */
  var ICE_SVG = '<svg viewBox="0 0 40 40"><polygon points="5,28 11,12 26,7 36,20 31,34 14,36" fill="#d9f2fc"/><polygon points="11,12 26,7 21,21" fill="#fff" opacity=".75"/><polygon points="21,21 36,20 31,34 14,36" fill="#9ad6f0" opacity=".6"/></svg>';
  var CAVE_SVG = '<svg viewBox="0 0 40 40"><path d="M2 37 V22 Q2 3 20 3 Q38 3 38 22 V37 Z" fill="#5d7a99"/><path d="M11 37 V25 Q11 14 20 14 Q29 14 29 25 V37 Z" fill="#0b1d33"/><circle cx="17" cy="27" r="1.6" fill="#ffcf3f"/><circle cx="23" cy="27" r="1.6" fill="#ffcf3f"/></svg>';
  var LOCK_SVG = '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11 V8 a4 4 0 0 1 8 0 V11" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>';
  var FISH_SVG = '<svg viewBox="0 0 40 26"><ellipse cx="16" cy="13" rx="13" ry="8.5" fill="#ff8a3d"/><polygon points="27,13 39,3 39,23" fill="#ff8a3d"/><path d="M16 5.5 q3.5 7.5 0 15" stroke="#ffd9b8" fill="none" stroke-width="1.6"/><circle cx="8.5" cy="11" r="1.9" fill="#102a43"/></svg>';
  var FISH_WIN_SVG = '<svg viewBox="0 0 40 26"><ellipse cx="16" cy="14" rx="13" ry="8.5" fill="#ff8a3d"/><polygon points="27,14 39,5 39,24" fill="#ff8a3d"/><path d="M16 6.5 q3.5 7.5 0 15" stroke="#ffd9b8" fill="none" stroke-width="1.6"/><circle cx="8.5" cy="12" r="1.9" fill="#102a43"/><g fill="#ffcf3f"><polygon points="5,1 6.2,4 9,5 6.2,6 5,9 3.8,6 1,5 3.8,4"/><polygon points="31,0 31.8,2 34,2.8 31.8,3.6 31,6 30.2,3.6 28,2.8 30.2,2"/></g></svg>';

  var DIJ_SVG = '<svg viewBox="0 0 40 40"><path d="M7 31 L19 11 L33 27" fill="none" stroke="#ffcf3f" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="31" r="5.5" fill="#d9f2fc"/><circle cx="19" cy="11" r="5.5" fill="#d9f2fc"/><circle cx="33" cy="27" r="5.5" fill="#ff8a3d"/></svg>';
  var MS_SVG = '<svg viewBox="0 0 40 40"><g fill="#d9f2fc"><rect x="3" y="4" width="8" height="8" rx="2"/><rect x="14" y="4" width="8" height="8" rx="2"/><rect x="25" y="4" width="8" height="8" rx="2"/></g><path d="M7 15 V22 M18 15 V22 M29 15 V22" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round"/><rect x="3" y="25" width="34" height="10" rx="3" fill="#7ee8ff"/></svg>';
  var BS_SVG = '<svg viewBox="0 0 40 40"><g fill="#d9f2fc"><rect x="3" y="18" width="7" height="16" rx="2"/><rect x="13" y="12" width="7" height="22" rx="2"/><rect x="23" y="22" width="7" height="12" rx="2"/></g><path d="M12 8 H31 M27 4 L31 8 L27 12" fill="none" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var BIN_SVG = '<svg viewBox="0 0 40 40"><g fill="#d9f2fc"><rect x="3" y="22" width="6" height="12" rx="2"/><rect x="11" y="19" width="6" height="15" rx="2"/><rect x="23" y="13" width="6" height="21" rx="2"/><rect x="31" y="9" width="6" height="25" rx="2"/></g><rect x="18" y="15" width="6" height="19" rx="2" fill="#ffcf3f"/><path d="M21 4 V11 M17 8 L21 12 L25 8" fill="none" stroke="#ff8a3d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SEL_SVG = '<svg viewBox="0 0 40 40"><g fill="#d9f2fc"><rect x="3" y="14" width="7" height="20" rx="2"/><rect x="13" y="22" width="7" height="12" rx="2"/><rect x="31" y="18" width="7" height="16" rx="2"/></g><rect x="22" y="26" width="7" height="8" rx="2" fill="#ffcf3f"/><path d="M25 22 V9 M20 13 L25 8 L30 13" fill="none" stroke="#ff8a3d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var INS_SVG = '<svg viewBox="0 0 40 40"><g fill="#d9f2fc"><rect x="3" y="24" width="7" height="10" rx="2"/><rect x="13" y="18" width="7" height="16" rx="2"/><rect x="31" y="12" width="7" height="22" rx="2"/></g><rect x="22" y="20" width="7" height="14" rx="2" fill="#ffcf3f"/><path d="M26 10 H8 M13 5 L8 10 L13 15" fill="none" stroke="#ff8a3d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var TOPO_SVG = '<svg viewBox="0 0 40 40"><path d="M9 12 L20 8 M9 12 L20 30 M20 8 L33 20 M20 30 L33 20" fill="none" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round"/><g fill="#d9f2fc"><circle cx="8" cy="12" r="5"/><circle cx="20" cy="8" r="5"/><circle cx="20" cy="30" r="5"/><circle cx="33" cy="20" r="5"/></g><path d="M26 24 L33 20 L30 14" fill="none" stroke="#ff8a3d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 4)"/></svg>';
  var BF_SVG = '<svg viewBox="0 0 40 40"><path d="M7 28 L19 10 L33 26" fill="none" stroke="#ffcf3f" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><g fill="#d9f2fc"><circle cx="7" cy="28" r="5.5"/><circle cx="19" cy="10" r="5.5"/><circle cx="33" cy="26" r="5.5"/></g><text x="26" y="14" font-size="12" font-weight="800" fill="#ff6b6b" font-family="system-ui,sans-serif">&#8722;2</text></svg>';
  var SQ_SVG = '<svg viewBox="0 0 40 40"><g fill="#d9f2fc"><rect x="3" y="6" width="14" height="6" rx="2"/><rect x="3" y="15" width="14" height="6" rx="2"/><rect x="3" y="24" width="14" height="6" rx="2"/></g><g fill="#7ee8ff"><rect x="23" y="6" width="14" height="6" rx="2"/><rect x="23" y="15" width="14" height="6" rx="2"/></g><path d="M30 34 V26 M26 30 L30 34 L34 30" fill="none" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="rotate(180 30 30)"/><path d="M10 37 H34" stroke="#ffcf3f" stroke-width="2" stroke-linecap="round"/></svg>';
  var HEAP_SVG = '<svg viewBox="0 0 40 40"><path d="M20 9 L10 22 M20 9 L30 22 M10 22 L5 34 M10 22 L15 34" fill="none" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round"/><g fill="#d9f2fc"><circle cx="20" cy="9" r="6" fill="#ffcf3f"/><circle cx="10" cy="22" r="5"/><circle cx="30" cy="22" r="5"/><circle cx="5" cy="34" r="4"/><circle cx="15" cy="34" r="4"/></g></svg>';
  var BITS_SVG = '<svg viewBox="0 0 40 40"><g><rect x="3" y="10" width="7" height="20" rx="3" fill="#d9f2fc"/><rect x="12" y="10" width="7" height="20" rx="3" fill="#ffcf3f"/><rect x="21" y="10" width="7" height="20" rx="3" fill="#d9f2fc"/><rect x="30" y="10" width="7" height="20" rx="3" fill="#ffcf3f"/></g><g font-family="system-ui,sans-serif" font-weight="800" font-size="9" fill="#17304d" text-anchor="middle"><text x="6.5" y="24">0</text><text x="15.5" y="24">1</text><text x="24.5" y="24">0</text><text x="33.5" y="24">1</text></g></svg>';
  var LOOP_SVG = '<svg viewBox="0 0 40 40"><path d="M30 12 A12 12 0 1 0 31 27" fill="none" stroke="#ffcf3f" stroke-width="4" stroke-linecap="round"/><path d="M30 4 V13 H21" fill="none" stroke="#ffcf3f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="19" cy="21" r="4" fill="#d9f2fc"/></svg>';
  var VARS_SVG = '<svg viewBox="0 0 40 40"><rect x="5" y="12" width="30" height="22" rx="4" fill="#d9f2fc"/><rect x="5" y="8" width="30" height="7" rx="3" fill="#7ee8ff"/><text x="20" y="30" font-size="14" font-weight="800" fill="#17304d" text-anchor="middle" font-family="system-ui,sans-serif">x=7</text></svg>';
  var PRIM_SVG = '<svg viewBox="0 0 40 40"><path d="M8 30 L8 12 M8 12 L22 8 M22 8 L32 22 M8 30 L22 34" fill="none" stroke="#ffcf3f" stroke-width="3.5" stroke-linecap="round"/><g fill="#d9f2fc"><circle cx="8" cy="30" r="5"/><circle cx="8" cy="12" r="5"/><circle cx="22" cy="8" r="5"/><circle cx="32" cy="22" r="5"/><circle cx="22" cy="34" r="5"/></g></svg>';
  var KRUSKAL_SVG = '<svg viewBox="0 0 40 40"><path d="M6 12 L18 6 M18 6 L34 14 M6 12 L12 30 M34 14 L30 32" fill="none" stroke="#ffcf3f" stroke-width="3.5" stroke-linecap="round"/><path d="M12 30 L30 32" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="3 5" stroke-linecap="round"/><g fill="#d9f2fc"><circle cx="6" cy="12" r="5"/><circle cx="18" cy="6" r="5"/><circle cx="34" cy="14" r="5"/><circle cx="12" cy="30" r="5"/><circle cx="30" cy="32" r="5"/></g></svg>';
  var COND_SVG = '<svg viewBox="0 0 40 40"><path d="M20 4 V16 M20 16 L8 32 M20 16 L32 32" fill="none" stroke="#ffcf3f" stroke-width="3.5" stroke-linecap="round"/><path d="M8 32 m-4 0 h8 M32 32 m-4 0 h8" stroke="#d9f2fc" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="16" r="5" fill="#d9f2fc"/></svg>';
  var BUG_SVG = '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="23" rx="9" ry="11" fill="#ff6b6b"/><circle cx="20" cy="10" r="5" fill="#ff6b6b"/><path d="M11 17 L4 13 M11 24 H3 M12 31 L5 36 M29 17 L36 13 M29 24 H37 M28 31 L35 36 M17 6 L14 2 M23 6 L26 2" fill="none" stroke="#d9f2fc" stroke-width="2.5" stroke-linecap="round"/><circle cx="16" cy="22" r="2" fill="#17304d"/><circle cx="24" cy="26" r="2" fill="#17304d"/></svg>';
  var RACE_SVG = '<svg viewBox="0 0 40 40"><g stroke-linecap="round" stroke-width="5" fill="none"><path d="M4 11 H12" stroke="#7ee8ff"/><path d="M4 21 H22" stroke="#ff8a3d"/><path d="M4 31 H36" stroke="#2fb86b"/></g><path d="M30 8 L36 12 L30 16 Z" fill="#ffcf3f"/></svg>';
  var CIPHER_SVG = '<svg viewBox="0 0 40 40"><rect x="8" y="18" width="24" height="18" rx="4" fill="#ffcf3f"/><path d="M13 18 V12 A7 7 0 0 1 27 12 V18" fill="none" stroke="#d9f2fc" stroke-width="4"/><circle cx="20" cy="27" r="3" fill="#17304d"/></svg>';
  var REP_SVG = '<svg viewBox="0 0 40 40"><g font-family="ui-monospace,Menlo,monospace" font-weight="800" font-size="14" fill="#17304d"><rect x="3" y="6" width="15" height="15" rx="3" fill="#ffcf3f"/><text x="10.5" y="18" text-anchor="middle">A</text><rect x="22" y="6" width="15" height="15" rx="3" fill="#d9f2fc"/><text x="29.5" y="18" text-anchor="middle">1</text></g><g fill="#17304d"><rect x="5" y="25" width="7" height="7" rx="1.5"/><rect x="19" y="25" width="7" height="7" rx="1.5"/><rect x="12" y="32" width="7" height="6" rx="1.5" fill="#d9f2fc"/><rect x="26" y="32" width="7" height="6" rx="1.5"/></g></svg>';
  var NET_SVG = '<svg viewBox="0 0 40 40"><path d="M7 12 L20 20 L33 10 M20 20 L12 33 M20 20 L33 31" fill="none" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round"/><g fill="#d9f2fc"><circle cx="7" cy="12" r="5"/><circle cx="33" cy="10" r="5"/><circle cx="12" cy="33" r="5"/><circle cx="33" cy="31" r="5"/></g><circle cx="20" cy="20" r="6" fill="#7ee8ff"/></svg>';
  var AI_SVG = '<svg viewBox="0 0 40 40"><g fill="#7ee8ff"><circle cx="9" cy="28" r="4.5"/><circle cx="15" cy="32" r="4.5"/><circle cx="11" cy="20" r="4.5"/></g><g fill="#ffcf3f"><rect x="25" y="6" width="9" height="9" rx="2"/><rect x="29" y="18" width="9" height="9" rx="2"/><rect x="21" y="13" width="9" height="9" rx="2"/></g><path d="M20 30 l5 5 l5 -5 l-5 -5 z" fill="#ff6b9a"/></svg>';
  var DATA_SVG = '<svg viewBox="0 0 40 40"><g fill="#7ee8ff"><rect x="4" y="22" width="7" height="14" rx="2"/><rect x="14" y="10" width="7" height="26" rx="2" fill="#2fb86b"/><rect x="24" y="18" width="7" height="18" rx="2"/></g><circle cx="32" cy="12" r="5" fill="none" stroke="#ffcf3f" stroke-width="3"/><path d="M36 16 L39 20" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round"/></svg>';
  var ROBOT_SVG = '<svg viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="5" fill="#d9f2fc" opacity=".35"/><path d="M10 30 V16 H26" fill="none" stroke="#7ee8ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="30" r="5" fill="#17304d"/><path d="M10 26 L13 33 L10 31 L7 33 Z" fill="#ffcf3f"/><ellipse cx="29" cy="14" rx="5" ry="3.5" fill="#ff8a3d"/></svg>';
  var ALGO_SVG = '<svg viewBox="0 0 40 40"><rect x="12" y="3" width="16" height="8" rx="4" fill="#d9f2fc"/><path d="M20 11 V16" stroke="#ffcf3f" stroke-width="3"/><path d="M20 16 L30 22 L20 28 L10 22 Z" fill="#7ee8ff"/><path d="M20 28 V32" stroke="#ffcf3f" stroke-width="3"/><rect x="12" y="32" width="16" height="6" rx="3" fill="#d9f2fc"/></svg>';
  var LOGIC_SVG = '<svg viewBox="0 0 40 40"><path d="M10 8 H20 A12 12 0 0 1 20 32 H10 Z" fill="#7ee8ff"/><path d="M2 15 H10 M2 25 H10 M32 20 H38" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round"/></svg>';
  var TYPES_SVG = '<svg viewBox="0 0 40 40"><rect x="3" y="6" width="10" height="28" rx="3" fill="#d9f2fc"/><rect x="15" y="6" width="10" height="28" rx="3" fill="#7ee8ff"/><rect x="27" y="6" width="10" height="28" rx="3" fill="#ffcf3f"/><g font-family="ui-monospace,monospace" font-weight="800" font-size="10" fill="#17304d" text-anchor="middle"><text x="8" y="24">7</text><text x="20" y="24">a</text><text x="32" y="24">&#10003;</text></g></svg>';
  var ARR_SVG = '<svg viewBox="0 0 40 40"><g fill="#d9f2fc"><rect x="2" y="13" width="8" height="14" rx="2"/><rect x="12" y="13" width="8" height="14" rx="2" fill="#ffcf3f"/><rect x="22" y="13" width="8" height="14" rx="2"/><rect x="32" y="13" width="6" height="14" rx="2"/></g><g font-family="ui-monospace,monospace" font-weight="800" font-size="8" fill="#7ee8ff" text-anchor="middle"><text x="6" y="37">0</text><text x="16" y="37">1</text><text x="26" y="37">2</text><text x="35" y="37">3</text></g></svg>';
  var FUNC_SVG = '<svg viewBox="0 0 40 40"><rect x="11" y="9" width="18" height="22" rx="5" fill="#7ee8ff"/><text x="20" y="26" font-size="16" font-style="italic" font-weight="800" fill="#17304d" text-anchor="middle" font-family="Georgia,serif">f</text><path d="M2 20 H10 M30 20 H37 M33 16 L37 20 L33 24" fill="none" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var REC_SVG = '<svg viewBox="0 0 40 40"><rect x="3" y="3" width="34" height="34" rx="6" fill="#d9f2fc"/><rect x="9" y="9" width="22" height="22" rx="5" fill="#7ee8ff"/><rect x="14" y="14" width="12" height="12" rx="4" fill="#ffcf3f"/><circle cx="20" cy="20" r="2.5" fill="#17304d"/></svg>';
  var HW_SVG = '<svg viewBox="0 0 40 40"><rect x="4" y="6" width="32" height="20" rx="3" fill="#d9f2fc"/><rect x="7" y="9" width="26" height="14" rx="2" fill="#17304d"/><rect x="14" y="28" width="12" height="3" fill="#7ee8ff"/><rect x="9" y="32" width="22" height="4" rx="2" fill="#ffcf3f"/><rect x="16" y="13" width="8" height="6" rx="1.5" fill="#7ee8ff"/></svg>';
  var OS_SVG = '<svg viewBox="0 0 40 40"><path d="M3 9 H15 L18 13 H37 V33 H3 Z" fill="#ffcf3f"/><rect x="3" y="16" width="34" height="17" rx="2" fill="#ffe27a"/><rect x="14" y="21" width="12" height="8" rx="1.5" fill="#17304d" opacity=".7"/></svg>';
  var SHEET_SVG = '<svg viewBox="0 0 40 40"><rect x="4" y="5" width="32" height="30" rx="3" fill="#d9f2fc"/><g stroke="#17304d" stroke-width="1.6"><path d="M4 15 H36 M4 25 H36 M15 5 V35 M26 5 V35"/></g><rect x="16" y="16" width="9" height="8" fill="#ffcf3f"/></svg>';
  var DB_SVG = '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="9" rx="13" ry="5" fill="#7ee8ff"/><path d="M7 9 V30 A13 5 0 0 0 33 30 V9" fill="#d9f2fc"/><path d="M7 19 A13 5 0 0 0 33 19 M7 26 A13 5 0 0 0 33 26" fill="none" stroke="#17304d" stroke-width="1.6"/><ellipse cx="20" cy="9" rx="13" ry="5" fill="#7ee8ff" stroke="#17304d" stroke-width="1.6"/></svg>';
  var SEC_SVG = '<svg viewBox="0 0 40 40"><path d="M20 4 L34 9 V19 C34 28 28 33 20 37 C12 33 6 28 6 19 V9 Z" fill="#7ee8ff"/><rect x="14" y="18" width="12" height="10" rx="2" fill="#17304d"/><path d="M16 18 V15 A4 4 0 0 1 24 15 V18" fill="none" stroke="#17304d" stroke-width="2.5"/><circle cx="20" cy="23" r="1.8" fill="#ffcf3f"/></svg>';
  var CIT_SVG = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#7ee8ff"/><path d="M5 20 H35 M20 5 C13 12 13 28 20 35 M20 5 C27 12 27 28 20 35" fill="none" stroke="#17304d" stroke-width="1.8"/><path d="M12 31 L20 24 L28 31" fill="none" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round"/></svg>';
  var CHAPTERS = {
    bfs: { icon: ICE_SVG }, dfs: { icon: CAVE_SVG }, qs: { icon: penguin(3, true) }, bs: { icon: BS_SVG }, bin: { icon: BIN_SVG }, sel: { icon: SEL_SVG }, topo: { icon: TOPO_SVG }, sq: { icon: SQ_SVG }, bits: { icon: BITS_SVG }, loop: { icon: LOOP_SVG }, vars: { icon: VARS_SVG }, heap: { icon: HEAP_SVG }, bf: { icon: BF_SVG }, ins: { icon: INS_SVG }, cond: { icon: COND_SVG }, bug: { icon: BUG_SVG }, race: { icon: RACE_SVG }, cipher: { icon: CIPHER_SVG }, rep: { icon: REP_SVG }, robot: { icon: ROBOT_SVG }, algo: { icon: ALGO_SVG }, logic: { icon: LOGIC_SVG }, types: { icon: TYPES_SVG }, arr: { icon: ARR_SVG }, func: { icon: FUNC_SVG }, rec: { icon: REC_SVG }, hw: { icon: HW_SVG }, os: { icon: OS_SVG }, sheet: { icon: SHEET_SVG }, db: { icon: DB_SVG }, sec: { icon: SEC_SVG }, cit: { icon: CIT_SVG }, net: { icon: NET_SVG }, ai: { icon: AI_SVG }, data: { icon: DATA_SVG },
    prim: { icon: PRIM_SVG }, kruskal: { icon: KRUSKAL_SVG }, dij: { icon: DIJ_SVG }, ms: { icon: MS_SVG }
  };
  function chText(c, f) { return tx('ch.' + c + '.' + f); }

  var LEVELS = [
    { id: 'bfs1', algo: 'bfs', map: ['S....', '.##..', '...#.', '.#...', '...#G'] },
    { id: 'bfs2', algo: 'bfs', map: ['S.#...', '..#.#.', '.##.#.', '....#.', '.####.', '.....G'] },
    { id: 'bfs3', algo: 'bfs', map: ['S......', '.#.###.', '.#...#.', '.####..', '.....#.', '.###.#.', '...#..G'] },
    { id: 'dfs1', algo: 'dfs', map: ['S..#.', '.#...', '.#.#.', '...#.', '.#..G'] },
    { id: 'dfs2', algo: 'dfs', map: ['S.....', '.####.', '...#..', '.#.#.#', '.#...#', '.###.G'] },
    { id: 'dfs3', algo: 'dfs', map: ['S.....#', '.####.#', '.#....#', '.#.####', '.#....G', '.####.#', '.......'] },
    { id: 'qs1', algo: 'qs', data: [4, 2, 5, 1, 3] },
    { id: 'qs2', algo: 'qs', data: [5, 2, 6, 1, 4, 3] },
    { id: 'qs3', algo: 'qs', data: [7, 3, 9, 1, 5, 2, 8, 4, 6] }
  ].concat(window.Robot ? window.Robot.LEVELS : [], window.Circuits ? window.Circuits.LEVELS : [], window.MiniGames ? window.MiniGames.LEVELS : []);

  /* ---------- Progress ---------- */
  var SAVE_KEY = 'pengurithm-v1';
  var progress = (function () {
    try { var p = JSON.parse(localStorage.getItem(SAVE_KEY)); if (p && p.stars) return p; } catch (e) {}
    return { stars: {} };
  })();
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(progress)); } catch (e) {} }
  function starStr(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }
  function levelById(id) { return LEVELS.filter(function (l) { return l.id === id; })[0]; }

  /* ---------- Helpers ---------- */
  var S = null;           // current level state
  var timer = null;       // auto-play / delay timer
  function stopTimer() { if (timer) { clearInterval(timer); clearTimeout(timer); timer = null; } if (window.Learn) window.Learn.leave(); if (window.Quiz) window.Quiz.leave(); }
  function $(sel) { return document.querySelector(sel); }
  function label(id) { return String.fromCharCode(65 + (id % S.g.w)) + (Math.floor(id / S.g.w) + 1); }

  function penguin(v, hideNum) { return window.Draw.penguin(v, hideNum); }

  /* ---------- Menu ---------- */
  function allowed() { return true; } // every lesson is open

  function legal(page) { return window.I18n.lang() === 'el' ? page + '-el.html' : page + '.html'; }
  function langSwitch() {
    var cur = window.I18n.lang();
    return '<div class="langsw" role="group" aria-label="' + tx('m.language') + '">' + [['en', 'English'], ['el', 'Ελληνικά']].map(function (l) {
      return '<button data-act="lang" data-l="' + l[0] + '" lang="' + l[0] + '" class="' + (cur === l[0] ? 'on' : '') + '" aria-pressed="' + (cur === l[0]) + '">' + l[1] + '</button>';
    }).join('') + '</div>';
  }

  /** Lessons the student has finished: all practice levels, or a quiz with at least 3 right. */
  function doneChapters() {
    var T = window.Content;
    return T.order.filter(function (c) {
      if (!allowed(c)) return false;
      var lv = LEVELS.filter(function (l) { return l.algo === c; });
      if (lv.length) return lv.every(function (l) { return progress.stars[l.id] > 0; });
      var b = window.Quiz ? window.Quiz.best(c) : null;
      return b !== null && b >= 3;
    });
  }

  var openBook = null;
  var BOOK_ICONS = {
    sys: '<svg viewBox="0 0 40 40"><rect x="4" y="6" width="32" height="21" rx="3" fill="#d9f2fc"/><rect x="7" y="9" width="26" height="15" rx="2" fill="#17304d"/><rect x="15" y="12" width="10" height="7" rx="1.5" fill="#7ee8ff"/><rect x="13" y="29" width="14" height="3" fill="#7ee8ff"/><rect x="8" y="33" width="24" height="4" rx="2" fill="#ffcf3f"/></svg>',
    prog: '<svg viewBox="0 0 40 40"><rect x="4" y="5" width="32" height="30" rx="4" fill="#17304d" stroke="#7ee8ff" stroke-width="2"/><path d="M13 14 L8 20 L13 26 M27 14 L32 20 L27 26 M22 12 L18 28" fill="none" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    algo: '<svg viewBox="0 0 40 40"><rect x="12" y="3" width="16" height="8" rx="4" fill="#d9f2fc"/><path d="M20 11 V15" stroke="#ffcf3f" stroke-width="3"/><path d="M20 15 L31 22 L20 29 L9 22 Z" fill="#7ee8ff"/><path d="M20 29 V32" stroke="#ffcf3f" stroke-width="3"/><rect x="12" y="32" width="16" height="6" rx="3" fill="#d9f2fc"/></svg>',
    ds: '<svg viewBox="0 0 40 40"><g fill="#d9f2fc"><rect x="3" y="4" width="14" height="6" rx="2"/><rect x="3" y="13" width="14" height="6" rx="2"/><rect x="3" y="22" width="14" height="6" rx="2"/></g><circle cx="29" cy="8" r="5" fill="#7ee8ff"/><circle cx="23" cy="28" r="4.5" fill="#ffcf3f"/><circle cx="35" cy="28" r="4.5" fill="#ffcf3f"/><path d="M27 12 L24 24 M31 12 L34 24" stroke="#d9f2fc" stroke-width="2"/></svg>',
    data: '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="9" rx="13" ry="5" fill="#7ee8ff"/><path d="M7 9 V29 A13 5 0 0 0 33 29 V9" fill="#d9f2fc"/><path d="M7 19 A13 5 0 0 0 33 19" fill="none" stroke="#17304d" stroke-width="1.8"/><rect x="26" y="22" width="4" height="10" fill="#ffcf3f"/><rect x="31" y="17" width="4" height="15" fill="#2fb86b"/></svg>',
    net: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#7ee8ff"/><path d="M5 20 H35 M20 5 C13 12 13 28 20 35 M20 5 C27 12 27 28 20 35" fill="none" stroke="#17304d" stroke-width="1.8"/><path d="M13 36 L20 30 L27 36" fill="none" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round"/></svg>'
  };
  function acts(kinds) { return kinds.filter(function (c) { return allowed(c); }); }
  function bookGames(b) { return b.kinds.filter(function (c) { return LEVELS.some(function (l) { return l.algo === c; }); }).length; }
  function bookStars(b) {
    var s = 0, m = 0;
    LEVELS.forEach(function (l) { if (b.kinds.indexOf(l.algo) >= 0) { s += progress.stars[l.id] || 0; m += 3; } });
    return [s, m];
  }
  function footHTML(total) {
    return '<div class="foot">' + tx('m.stars', { a: total, b: LEVELS.length * 3 }) + '<br><a href="#" class="resetlink" data-act="reset">' + tx('m.reset') + '</a><br><small>' + tx('m.footFree') + '</small>' +
      '<br><small><a href="' + legal('privacy') + '" target="_blank" rel="noopener">' + tx('m.privacy') + '</a> &middot; <a href="' + legal('teachers') + '" target="_blank" rel="noopener">' + tx('m.teachers') + '</a></small></div>';
  }
  function totalStars() { var t = 0; LEVELS.forEach(function (l) { t += progress.stars[l.id] || 0; }); return t; }
  /** One lesson card: the lesson button, then its game levels and/or its practice quiz. */
  function lessonCard(c) {
    var ch = CHAPTERS[c], lv = LEVELS.filter(function (l) { return l.algo === c; }), ok = allowed(c), qb = window.Quiz ? window.Quiz.best(c) : null;
    var html = '<section class="card"><div class="card-head"><span class="big">' + ch.icon + '</span><div><h2>' + chText(c, 'name') + '</h2><span class="sub">' + chText(c, 'algo') + '</span></div>' +
      '<button class="ghost primary" data-act="' + 'learn' + '" data-c="' + c + '">' + tx('m.learn') + '</button></div><p class="blurb">' + chText(c, 'blurb') + '</p>';
    if (!ok) return html + '</section>';
    if (lv.length) {
      html += '<div class="gamelabel">' + tx('m.game') + '</div><div class="levels">';
      lv.forEach(function (l, i) {
        var s = progress.stars[l.id] || 0, locked = i > 0 && !(progress.stars[lv[i - 1].id] > 0);
        html += '<button class="lvl' + (locked ? ' locked' : '') + '" data-act="open" data-id="' + l.id + '"' + (locked ? ' disabled' : '') + '><b>' + (locked ? LOCK_SVG : i + 1) + '</b><span class="stars">' + starStr(s) + '</span></button>';
      });
      html += '</div>';
    }
    if (!lv.length || ['bfs', 'dfs', 'qs'].indexOf(c) < 0) html += '<button class="ghost quizbtn" data-act="quiz" data-c="' + c + '">' + tx('m.quiz') + (qb !== null ? ' &middot; ' + tx('m.best', { s: qb }) : '') + '</button>';
    return html + '</section>';
  }
  var resetArmed = false;
  function menuClick(e) {
    var t = e.target.closest('[data-act]'); if (!t) return;
    var act = t.dataset.act;
    if (act === 'sound') { window.Sound.toggle(); showMenu(); return; }
    if (window.Extras && window.Extras.handle(act, t)) return;
    if (act === 'lang') { window.I18n.setLang(t.dataset.l); showMenu(); return; }
    if (act === 'reset') { e.preventDefault(); if (resetArmed) { resetArmed = false; progress.stars = {}; save(); showMenu(); } else { resetArmed = true; t.textContent = tx('m.resetSure'); } return; }
    if (act === 'book') { openBook = t.dataset.b; showBook(openBook); window.scrollTo(0, 0); return; }
    if (act === 'home') { openBook = null; showHome(); window.scrollTo(0, 0); return; }
    if (act === 'learn') window.Learn.open(t.dataset.c);
    if (act === 'quiz') window.Quiz.open(t.dataset.c, 0);
    if (act === 'open') { var lvl = levelById(t.dataset.id); openLevel(lvl, null); }
  }
  function showMenu() { stopTimer(); S = null; if (openBook) showBook(openBook); else showHome(); }

  /* The home page: the school books (topics) of CS Penguins. */
  function showHome() {
    stopTimer(); S = null; openBook = null; resetArmed = false;
    var T = window.Content;
    var html = '<div class="hero">' + penguin(5, true) + '<h1>CS Penguins</h1><p>' + tx('m.tagline') + '</p><p class="how">' + tx('m.how') + '</p>' + langSwitch() + (window.Sound ? '<button class="soundbtn" data-act="sound" aria-pressed="' + window.Sound.on() + '">' + tx(window.Sound.on() ? 'x.soundOn' : 'x.soundOff') + '</button>' : '') + '</div>';
    html += '<h2 class="shelf">' + tx('m.topics') + '</h2>';
    T.books.forEach(function (b) {
      var st = bookStars(b), g = bookGames(b);
      html += '<button class="bookcard b-' + b.id + '" data-act="book" data-b="' + b.id + '"><span class="big">' + BOOK_ICONS[b.id] + '</span><div class="bkt"><h2>' + tx('bk.' + b.id + '.peng') + '</h2><span class="sub">' + tx('bk.' + b.id + '.name') + '</span><p class="blurb">' + tx('bk.' + b.id + '.blurb') + '</p>' +
        '<small>' + tx('m.bookInfo', { n: b.kinds.length, g: g }) + (st[1] ? ' &middot; ★ ' + st[0] + '/' + st[1] : '') + '</small></div><span class="chev" aria-hidden="true">›</span></button>';
    });
    if (window.Extras) html += window.Extras.cards(doneChapters(), T.order.length);
    $app.innerHTML = html + footHTML(totalStars());
    $app.onclick = menuClick;
  }

  /* One topic: a small penguin-themed header, then its lessons. */
  function showBook(id) {
    stopTimer(); S = null; openBook = id;
    var b = window.Content.books.filter(function (x) { return x.id === id; })[0];
    var html = '<div class="topbar"><button class="icon-btn" data-act="home" aria-label="' + tx('m.allTopics') + '">‹</button><div class="ttl"><b>' + tx('bk.' + id + '.name') + '</b><small>CS Penguins</small></div>' + '<span class="topspace"></span>' + '</div>' +
      '<header class="bookhead b-' + id + '"><span class="big">' + BOOK_ICONS[id] + '</span><div><h1>' + tx('bk.' + id + '.peng') + '</h1><span class="sub">' + tx('bk.' + id + '.name') + '</span><p>' + tx('bk.' + id + '.blurb') + '</p></div></header>';
    b.kinds.forEach(function (c) { html += lessonCard(c); });
    $app.innerHTML = html + footHTML(totalStars());
    $app.onclick = menuClick;
  }

  /* ---------- Level shell ---------- */
  function openLevel(level, mode) {
    stopTimer();
    mode = mode || ((progress.stars[level.id] || 0) > 0 ? 'play' : 'watch');
    if (level.algo === 'robot') startRobot(level); else if (level.algo === 'logic') startCircuit(level); else if (window.MiniGames && window.MiniGames.start[level.algo]) startMini(level); else if (level.algo === 'qs') startQS(level, mode); else startGraph(level, mode);
  }

  function renderShell() {
    var l = S.level;
    $app.innerHTML =
      '<div class="topbar"><button class="icon-btn" data-act="menu">‹</button><div class="ttl"><b>' + tx('lv.' + l.id) + '</b><small>' + chText(l.algo, 'algo') + '</small></div><button class="icon-btn" data-act="info">?</button></div>' +
      '<div class="modebar"><button data-act="mode" data-m="watch" class="' + (S.mode === 'watch' ? 'on' : '') + '">' + tx('g.watch') + '</button>' +
      '<button data-act="mode" data-m="play" class="' + (S.mode === 'play' ? 'on' : '') + '">' + tx('g.play') + '</button><span class="mist" id="mist"></span></div>' +
      '<div id="board" class="board"></div><div id="panel"></div><div id="msg" class="msg"></div><div id="controls" class="controls"></div>';
    updateMist();
    $app.onclick = function (e) {
      var t = e.target.closest('[data-act]'); if (!t) return;
      var a = t.dataset.act;
      if (a === 'menu') showMenu();
      else if (a === 'info') window.Learn.open(S.level.algo);
      else if (a === 'mode') openLevel(S.level, t.dataset.m);
      else if (a === 'replay') openLevel(S.level, 'play');
      else if (a === 'play') openLevel(S.level, 'play');
      else if (a === 'next') { var i = LEVELS.indexOf(S.level); openLevel(LEVELS[i + 1], null); }
      else if (a === 'step') onNext();
      else if (a === 'auto') toggleAuto(t);
      else if (a === 'tile') onTile(+t.dataset.id);
      else if (a === 'side') answerQS(t.dataset.side);
    };
  }
  function updateMist() { var m = $('#mist'); if (m) m.textContent = S.mode === 'play' ? tx('g.mistakes', { n: S.mistakes }) : tx('g.watchLearn'); }
  function say(text, cls) { var m = $('#msg'); m.className = 'msg ' + (cls || ''); m.innerHTML = text; }
  function onNext() { if (S.level.algo === 'qs') { if (S.k < S.trace.steps.length) { S.k++; showQS(); } } else { if (S.k < S.trace.steps.length) { S.k++; renderGraph(); } } }
  function toggleAuto(btn) {
    if (timer) { stopTimer(); btn.textContent = tx('g.auto'); return; }
    btn.textContent = tx('g.pause');
    timer = setInterval(function () {
      if (S.k >= S.trace.steps.length) { stopTimer(); return; }
      onNext();
      var b = $('[data-act="auto"]'); if (b && timer) b.textContent = tx('g.pause');
    }, 900);
  }
  function resultCard(stars, extra, hasNext) {
    return '<div class="result"><h3>' + tx('g.complete') + '</h3><div class="bigstars">' + starStr(stars) + '</div><p>' + tx('g.mistakes', { n: S.mistakes }) + '<br>' + extra + '</p>' +
      '<div class="row"><button class="btn" data-act="replay">' + tx('g.replay') + '</button>' +
      (hasNext ? '<button class="btn primary" data-act="next">' + tx('g.next') + '</button>' : '') +
      '<button class="btn" data-act="menu">' + tx('g.menu') + '</button></div></div>';
  }
  function completeLevel() {
    var stars = A.starsFor(S.mistakes);
    progress.stars[S.level.id] = Math.max(progress.stars[S.level.id] || 0, stars);
    save();
    if (window.Sound) window.Sound.play(stars > 0 ? 'win' : 'no');
    return stars;
  }

  /* ---------- Graph levels (BFS / DFS) ---------- */
  function startGraph(level, mode) {
    var g = A.parseGrid(level.map);
    S = { level: level, mode: mode, g: g, trace: level.algo === 'bfs' ? A.bfsTrace(g) : A.dfsTrace(g), k: 0, mistakes: 0, finished: false };
    renderShell();
    skipTrivial();
    renderGraph();
  }
  function skipTrivial() {
    if (S.mode !== 'play') return;
    var st = S.trace.steps;
    while (S.k < st.length && st[S.k].frontier.length === 1) S.k++;
  }
  function renderGraph() {
    var g = S.g, tr = S.trace, done = S.k >= tr.steps.length, step = tr.steps[S.k];
    var visited = done ? tr.order : step.visitedBefore;
    var ord = {}; visited.forEach(function (id, i) { ord[id] = i + 1; });
    var frontier = done ? [] : step.frontier, fset = {}; frontier.forEach(function (id) { fset[id] = true; });
    var pathSet = {}; if (done && tr.path) tr.path.forEach(function (id) { pathSet[id] = true; });
    var html = '<div class="grid" style="grid-template-columns:repeat(' + g.w + ',1fr)">';
    for (var id = 0; id < g.w * g.h; id++) {
      if (g.walls[id]) { html += '<div class="tile wall"></div>'; continue; }
      var cls = 'tile', inner = '';
      if (pathSet[id]) cls += ' path'; else if (ord[id]) cls += ' visited';
      if (fset[id]) { cls += ' frontier'; inner = label(id); if (S.mode === 'watch' && id === step.answer) cls += ' next'; }
      else if (ord[id]) inner = ord[id];
      var em = '';
      if (id === g.goal) em = done && tr.found ? FISH_WIN_SVG : FISH_SVG;
      else if (id === g.start) em = penguin(2, true);
      html += '<div class="' + cls + '" data-act="tile" data-id="' + id + '">' + (em ? '<span class="em">' + em + '</span>' : inner) + '</div>';
    }
    $('#board').innerHTML = html + '</div>';

    var isQ = S.level.algo === 'bfs';
    if (!done) {
      $('#panel').innerHTML = '<div class="panel"><h4>' + tx(isQ ? 'g.queueTitle' : 'g.stackTitle') + '</h4><div class="chips">' +
        frontier.map(function (id) { return '<span class="chip">' + label(id) + '</span>'; }).join('') + '</div>' +
        '<div class="ends"><span>' + tx('g.addedFirst') + '</span><span>' + tx('g.addedLast') + '</span></div></div>';
    } else $('#panel').innerHTML = '';

    var ctr = $('#controls');
    if (done) {
      S.finished = true;
      var mine = tr.path ? tr.path.length - 1 : 0, best = A.bfsTrace(g).path.length - 1;
      var extra = isQ ? tx('g.bfsExtra', { n: mine }) : mine > best ? tx('g.dfsLong', { n: mine, b: best }) : tx('g.dfsSame', { n: mine });
      if (S.mode === 'play') {
        var stars = completeLevel(), i = LEVELS.indexOf(S.level);
        say(tx('g.gotFish'), 'good');
        ctr.innerHTML = resultCard(stars, extra, i < LEVELS.length - 1);
      } else {
        say(tx('g.fishFound', { extra: extra }));
        ctr.innerHTML = '<button class="btn primary" data-act="play">' + tx('g.nowYou') + '</button><button class="btn" data-act="mode" data-m="watch">' + tx('g.watchAgain') + '</button>';
      }
      updateMist();
      return;
    }
    if (S.mode === 'watch') {
      say(tx('g.watchMsg', { id: label(step.answer), verb: tx(isQ ? 'g.verbQ' : 'g.verbS'), tail: step.discovered.length ? tx(isQ ? 'g.tailQ' : 'g.tailS') : tx('g.tailNone') }));
      ctr.innerHTML = '<button class="btn primary" data-act="step">' + tx('g.next') + '</button><button class="btn" data-act="auto">' + tx('g.auto') + '</button>';
    } else {
      say(tx('g.askTile', { rule: chText(S.level.algo, 'rule') }));
      ctr.innerHTML = '';
    }
    updateMist();
  }
  function onTile(id) {
    if (!S || S.level.algo === 'qs' || S.mode !== 'play' || S.finished) return;
    var step = S.trace.steps[S.k]; if (!step || step.frontier.indexOf(id) < 0) return;
    if (id === step.answer) { S.k++; skipTrivial(); renderGraph(); return; }
    S.mistakes++; updateMist();
    var el = document.querySelector('.tile[data-id="' + id + '"]');
    if (el) { el.classList.add('wrong'); setTimeout(function () { el.classList.remove('wrong'); }, 400); }
    say(tx('g.notQuite', { hint: chText(S.level.algo, 'hint') }), 'bad');
  }


  /* ---------- Program the Penguin (robot levels) ---------- */
  function startRobot(level) {
    var R = window.Robot, L = R.parse(level), prog = [], times = 1, busy = false, ARR = { F: '▲', L: '↶', R: '↷' };
    S = { level: level, mode: 'robot', finished: false };
    function cell(x, y) { return 'ABCDE'.charAt(x) + (y + 1); }
    function scene(st, trail) { return window.Draw.SCENES.robot({ x: st.x, y: st.y, d: st.d, trail: trail, goal: L.goal, walls: L.walls }); }
    function chip(b, i, now) { return '<button class="rbchip' + (now ? ' now' : '') + '" data-act="rbrm" data-i="' + i + '" aria-label="' + tx('rb.remove') + '">' + (b.n > 1 ? b.n + '× ' : '') + ARR[b.c] + '</button>'; }
    function tray(now) { $('#rbtray').innerHTML = prog.length ? prog.map(function (b, i) { return chip(b, i, i === now); }).join('') : '<em>' + tx('rb.empty') + '</em>'; }
    function info() { var p = R.par(level); $('#rbinfo').textContent = tx('rb.blocks', { n: prog.length, par: p }); }
    function draw(st, trail) { $('#board').innerHTML = scene(st, trail); }
    var start = { x: L.start.x, y: L.start.y, d: L.start.d };
    $app.innerHTML =
      '<div class="topbar"><button class="icon-btn" data-act="menu">‹</button><div class="ttl"><b>' + tx('lv.' + level.id) + '</b><small>' + chText(level.algo, 'algo') + '</small></div><button class="icon-btn" data-act="info">?</button></div>' +
      '<div id="board" class="board rbboard"></div><div id="msg" class="msg"></div><div id="rbtray" class="rbtray"></div>' +
      '<div class="rbpal"><button class="btn" data-act="rbadd" data-c="F">▲ ' + tx('rb.F') + '</button><button class="btn" data-act="rbadd" data-c="L">↶ ' + tx('rb.L') + '</button><button class="btn" data-act="rbadd" data-c="R">↷ ' + tx('rb.R') + '</button></div>' +
      (level.maxRep > 1 ? '<div class="rbtimes"><span>' + tx('rb.times') + '</span>' + [1, 2, 3, 4].filter(function (n) { return n <= level.maxRep; }).map(function (n) { return '<button data-act="rbtimes" data-n="' + n + '" class="' + (n === 1 ? 'on' : '') + '">' + n + '</button>'; }).join('') + '</div>' : '') +
      '<div id="rbinfo" class="rbinfo"></div><div id="controls" class="controls"><button class="btn primary" data-act="rbrun">' + tx('rb.run') + '</button><button class="btn" data-act="rbundo">' + tx('rb.undo') + '</button><button class="btn" data-act="rbclear">' + tx('rb.clear') + '</button></div>';
    draw(start, [[start.x, start.y]]); tray(-1); info(); say(tx('rb.help' + (level.maxRep > 1 ? 'Loop' : '')));
    function reset() { stopTimer(); busy = false; draw(start, [[start.x, start.y]]); tray(-1); info(); }
    function finish(res) {
      var i = LEVELS.indexOf(level), stars = R.starsFor(level, prog.length);
      progress.stars[level.id] = Math.max(progress.stars[level.id] || 0, stars); save();
      if (window.Sound) window.Sound.play('win');
      say(tx('rb.won', { n: prog.length }), 'good');
      $('#controls').innerHTML = '<div class="result"><h3>' + tx('g.complete') + '</h3><div class="bigstars">' + starStr(stars) + '</div><p>' + tx('rb.blocks', { n: prog.length, par: R.par(level) }) + '</p>' +
        '<div class="row"><button class="btn" data-act="replay">' + tx('g.replay') + '</button>' + (i < LEVELS.length - 1 && LEVELS[i + 1].algo === 'robot' ? '<button class="btn primary" data-act="next">' + tx('g.next') + '</button>' : '') + '<button class="btn" data-act="menu">' + tx('g.menu') + '</button></div></div>';
    }
    function runProgram() {
      if (busy) return;
      if (!prog.length) { say(tx('rb.needSome'), 'bad'); return; }
      var res = R.run(level, prog), k = 0, trail = [[start.x, start.y]];
      busy = true; draw(start, trail); say(tx('rb.running'));
      timer = setInterval(function () {
        if (k >= res.steps.length) {
          stopTimer(); busy = false;
          if (res.won) finish(res);
          else { tray(-1); say(tx(res.bumps ? 'rb.missBump' : 'rb.miss', { pos: cell(res.final.x, res.final.y) }), 'bad'); if (window.Sound) window.Sound.play('no'); }
          return;
        }
        var st = res.steps[k++];
        if (!st.bump) trail.push([st.x, st.y]);
        draw(st, trail); tray(st.block);
        if (st.bump) say(tx('rb.bump'), 'bad');
      }, 380);
    }
    $app.onclick = function (e) {
      var t = e.target.closest('[data-act]'); if (!t) return;
      var a = t.dataset.act;
      if (a === 'menu') showMenu();
      else if (a === 'info') window.Learn.open('robot');
      else if (a === 'replay') openLevel(level, null);
      else if (a === 'next') openLevel(LEVELS[LEVELS.indexOf(level) + 1], null);
      else if (a === 'rbrun') runProgram();
      else if (busy) return;
      else if (a === 'rbadd') { var now = Date.now(); if (t.dataset.at && now - +t.dataset.at < 300) return; t.dataset.at = now; if (prog.length < 20) { var last = prog[prog.length - 1]; prog.push({ c: t.dataset.c, n: times }); } reset(); say(''); }
      else if (a === 'rbtimes') { times = +t.dataset.n; Array.prototype.forEach.call(document.querySelectorAll('.rbtimes button'), function (b) { b.classList.toggle('on', +b.dataset.n === times); }); }
      else if (a === 'rbrm') { prog.splice(+t.dataset.i, 1); reset(); say(''); }
      else if (a === 'rbundo') { prog.pop(); reset(); say(''); }
      else if (a === 'rbclear') { prog = []; reset(); say(''); }
    };
  }

  /* ---------- Light the Lamp (logic levels) ---------- */
  function startCircuit(level) {
    var C = window.Circuits, goal = C.solutions(level), found = [], setting = level.vars.map(function () { return '0'; }), mistakes = 0, done = false;
    S = { level: level, mode: 'circuit', finished: false };
    function code() { return setting.join(''); }
    function lampOn() { return C.lamp(level, code()) === 1; }
    function sw() { return level.vars.map(function (v, i) { return '<button class="cxsw ' + (setting[i] === '1' ? 'on' : 'off') + '" data-act="cxflip" data-i="' + i + '" aria-pressed="' + (setting[i] === '1') + '"><small>' + v + '</small><b>' + setting[i] + '</b></button>'; }).join(''); }
    function foundChips() { return found.length ? found.map(function (c) { return '<span class="chip">' + level.vars.map(function (v, i) { return v + '=' + c.charAt(i); }).join(' ') + '</span>'; }).join('') : '<em>' + tx('cx.none') + '</em>'; }
    function paint() {
      $('#cxsw').innerHTML = sw();
      var on = lampOn();
      $('#cxlamp').className = 'cxlamp ' + (on ? 'on' : 'off'); $('#cxlamp').innerHTML = '<span></span><small>' + tx(on ? 'd.lg.on' : 'd.lg.offw') + '</small>';
      $('#cxfound').innerHTML = foundChips();
      $('#cxcount').textContent = tx('cx.count', { n: found.length, m: goal.length });
    }
    $app.innerHTML =
      '<div class="topbar"><button class="icon-btn" data-act="menu">‹</button><div class="ttl"><b>' + tx('lv.' + level.id) + '</b><small>' + chText(level.algo, 'algo') + '</small></div><button class="icon-btn" data-act="info">?</button></div>' +
      '<div class="cxexpr"><small>' + tx('cx.lamp') + '</small><code>' + C.text(level.expr) + '</code></div>' +
      '<div class="cxgoal">' + tx(level.target ? 'cx.goalOn' : 'cx.goalOff', { n: goal.length }) + '</div>' +
      '<div class="cxrow"><div id="cxsw" class="cxswrow"></div><div id="cxlamp"></div></div>' +
      '<div id="msg" class="msg"></div><div class="panel"><h4 id="cxcount"></h4><div id="cxfound" class="chips"></div></div>' +
      '<div class="rbinfo">' + tx('cx.legend') + '</div>' +
      '<div id="controls" class="controls"><button class="btn primary" data-act="cxsave">' + tx('cx.save') + '</button></div>';
    paint(); say(tx('cx.help'));
    function finish() {
      var i = LEVELS.indexOf(level), stars = A.starsFor(mistakes);
      progress.stars[level.id] = Math.max(progress.stars[level.id] || 0, stars); save();
      if (window.Sound) window.Sound.play('win');
      done = true; say(tx('cx.all', { n: goal.length }), 'good');
      $('#controls').innerHTML = '<div class="result"><h3>' + tx('g.complete') + '</h3><div class="bigstars">' + starStr(stars) + '</div><p>' + tx('g.mistakes', { n: mistakes }) + '</p>' +
        '<div class="row"><button class="btn" data-act="replay">' + tx('g.replay') + '</button>' + (i < LEVELS.length - 1 && LEVELS[i + 1].algo === 'logic' ? '<button class="btn primary" data-act="next">' + tx('g.next') + '</button>' : '') + '<button class="btn" data-act="menu">' + tx('g.menu') + '</button></div></div>';
    }
    $app.onclick = function (e) {
      var t = e.target.closest('[data-act]'); if (!t) return;
      var a = t.dataset.act;
      if (a === 'menu') showMenu();
      else if (a === 'info') window.Learn.open('logic');
      else if (a === 'replay') openLevel(level, null);
      else if (a === 'next') openLevel(LEVELS[LEVELS.indexOf(level) + 1], null);
      else if (done) return;
      else if (a === 'cxflip') { var i = +t.dataset.i; setting[i] = setting[i] === '1' ? '0' : '1'; paint(); say(''); }
      else if (a === 'cxsave') {
        var c = code();
        if (found.indexOf(c) >= 0) { say(tx('cx.dup'), 'bad'); return; }
        if (goal.indexOf(c) < 0) { mistakes++; if (window.Sound) window.Sound.play('no'); say(tx(level.target ? 'cx.wrongOn' : 'cx.wrongOff'), 'bad'); return; }
        found.push(c); paint();
        if (found.length === goal.length) finish(); else { if (window.Sound) window.Sound.play('ok'); say(tx('cx.good', { n: goal.length - found.length }), 'good'); }
      }
    };
  }

  /* ---------- The small games (see minigames.js) ---------- */
  function startMini(level) {
    var handler = null, done = false;
    S = { level: level, mode: 'mini', finished: false };
    function same(i) { return LEVELS[i] && LEVELS[i].algo === level.algo; }
    var ctx = {
      penguin: penguin,
      begin: function (lvl, bodyHTML, controlsHTML, onAct) {
        handler = onAct;
        $app.innerHTML = '<div class="topbar"><button class="icon-btn" data-act="menu">‹</button><div class="ttl"><b>' + tx('lv.' + lvl.id) + '</b><small>' + chText(lvl.algo, 'algo') + '</small></div><button class="icon-btn" data-act="info">?</button></div>' +
          bodyHTML + '<div id="msg" class="msg"></div><div id="controls" class="controls">' + controlsHTML + '</div>';
        $app.onclick = function (e) {
          var t = e.target.closest('[data-act]'); if (!t) return;
          var a = t.dataset.act, i = LEVELS.indexOf(level);
          if (a === 'menu') showMenu();
          else if (a === 'info') window.Learn.open(level.algo);
          else if (a === 'replay') openLevel(level, null);
          else if (a === 'next') openLevel(LEVELS[i + 1], null);
          else if (handler) handler(a, t, e);
        };
      },
      finishStars: function (lvl, stars, text) {
        var i = LEVELS.indexOf(lvl);
        progress.stars[lvl.id] = Math.max(progress.stars[lvl.id] || 0, stars); save();
        if (window.Sound) window.Sound.play('win');
        say(text, 'good');
        $('#controls').innerHTML = '<div class="result"><h3>' + tx('g.complete') + '</h3><div class="bigstars">' + starStr(stars) + '</div>' +
          '<div class="row"><button class="btn" data-act="replay">' + tx('g.replay') + '</button>' + (same(i + 1) ? '<button class="btn primary" data-act="next">' + tx('g.next') + '</button>' : '') + '<button class="btn" data-act="menu">' + tx('g.menu') + '</button></div></div>';
      },
      finish: function (lvl, mistakes, text) { ctx.finishStars(lvl, A.starsFor(mistakes), text); }
    };
    window.MiniGames.start[level.algo](level, ctx);
  }

  /* ---------- Quick sort levels ---------- */
  function startQS(level, mode) {
    S = { level: level, mode: mode, trace: A.quickSortTrace(level.data), k: 0, mistakes: 0, busy: false, finished: false, els: {} };
    renderShell();
    var board = $('#board'); board.className = 'board qs';
    level.data.forEach(function (v) {
      var d = document.createElement('div'); d.className = 'pgn'; d.innerHTML = penguin(v); board.appendChild(d); S.els[v] = d;
    });
    showQS();
  }
  function layoutQS(view) {
    var data = S.level.data, board = $('#board'), n = data.length, W = board.clientWidth || 320, slot = W / n;
    var pw = Math.min(slot - 6, 70), mx = Math.max.apply(null, data);
    board.style.height = Math.round(pw * (22 + mx * 6) / 40 + 36) + 'px';
    view.arr.forEach(function (v, i) {
      var el = S.els[v];
      el.style.width = pw + 'px';
      el.style.transform = 'translateX(' + (i * slot + (slot - pw) / 2) + 'px)';
      var inRange = i >= view.lo && i <= view.hi, cls = 'pgn';
      if (!inRange && view.sorted.indexOf(i) < 0) cls += ' dim';
      if (view.sorted.indexOf(i) >= 0) cls += ' final';
      else if (i === view.j) cls += ' cur';
      else if (i === view.pivot) cls += ' pivot';
      el.className = cls;
      el.dataset.tag = view.sorted.indexOf(i) >= 0 ? '✓' : i === view.pivot ? tx('g.pivotTag') : '';
    });
  }
  function showQS() {
    stopQsDelay();
    var tr = S.trace, ctr = $('#controls');
    if (S.k >= tr.steps.length) return finishQS();
    var s = tr.steps[S.k], n = S.level.data.length;
    if (s.type === 'compare') {
      layoutQS({ arr: s.before, sorted: s.sorted, lo: s.lo, hi: s.hi, j: s.j, pivot: s.hi });
      if (S.mode === 'watch') {
        say(tx('g.qsWatch', { p: s.pivot, v: s.value, res: tx(s.smaller ? 'g.qsShort' : 'g.qsTall') }));
        ctr.innerHTML = '<button class="btn primary" data-act="step">' + tx('g.next') + '</button><button class="btn" data-act="auto">' + tx('g.auto') + '</button>';
      } else {
        say(tx('g.qsAsk', { p: s.pivot, v: s.value }));
        ctr.innerHTML = '<button class="btn" data-act="side" data-side="left">' + tx('g.btnLeft') + '</button><button class="btn" data-act="side" data-side="right">' + tx('g.btnRight') + '</button>';
      }
    } else {
      layoutQS({ arr: s.arr, sorted: s.sorted, lo: s.lo, hi: s.hi, j: -1, pivot: -1 });
      var text = s.type === 'place'
        ? tx('g.qsPlace', { p: s.pivot })
        : tx('g.qsLone');
      say(text);
      if (S.mode === 'watch') ctr.innerHTML = '<button class="btn primary" data-act="step">' + tx('g.next') + '</button><button class="btn" data-act="auto">' + tx('g.auto') + '</button>';
      else { ctr.innerHTML = ''; S.busy = true; timer = setTimeout(function () { S.busy = false; S.k++; showQS(); }, 1100); }
    }
    updateMist();
  }
  function stopQsDelay() { if (timer && S.mode === 'play') { clearTimeout(timer); timer = null; } }
  function answerQS(side) {
    if (S.busy || S.mode !== 'play') return;
    var s = S.trace.steps[S.k]; if (!s || s.type !== 'compare') return;
    if ((side === 'left') === s.smaller) {
      S.busy = true;
      layoutQS({ arr: s.arr, sorted: s.sorted, lo: s.lo, hi: s.hi, j: -1, pivot: s.hi });
      say(tx(s.smaller ? 'g.qsOkS' : 'g.qsOkT', { v: s.value, p: s.pivot }), 'good');
      timer = setTimeout(function () { timer = null; S.busy = false; S.k++; showQS(); }, 650);
    } else {
      S.mistakes++; updateMist();
      var el = S.els[s.value]; el.classList.add('wrong'); setTimeout(function () { el.classList.remove('wrong'); }, 400);
      say(tx('g.qsWrong', { v: s.value, p: s.pivot }), 'bad');
    }
  }
  function finishQS() {
    var n = S.level.data.length, all = []; for (var i = 0; i < n; i++) all.push(i);
    layoutQS({ arr: S.trace.result, sorted: all, lo: 0, hi: n - 1, j: -1, pivot: -1 });
    S.finished = true;
    var ctr = $('#controls');
    if (S.mode === 'play') {
      var stars = completeLevel(), i2 = LEVELS.indexOf(S.level);
      say(tx('g.qsAll'), 'good');
      ctr.innerHTML = resultCard(stars, tx('g.qsResult'), i2 < LEVELS.length - 1);
    } else {
      say(tx('g.qsDone'));
      ctr.innerHTML = '<button class="btn primary" data-act="play">' + tx('g.nowYou') + '</button><button class="btn" data-act="mode" data-m="watch">' + tx('g.watchAgain') + '</button>';
    }
    updateMist();
  }

  window.PenguinCore = { penguin: penguin, LEVELS: LEVELS, CHAPTERS: CHAPTERS, showMenu: showMenu, showHome: showHome, doneChapters: doneChapters, openLevel: openLevel, FISH_SVG: FISH_SVG, FISH_WIN_SVG: FISH_WIN_SVG };
  showHome();
})();
