// Sunny Side Sudoku: 6x6 logic (values 1-6, 0 = empty, boxes 2 rows x 3 cols)
(function (root) {
  const N = 6;
  const rowOf = i => (i / N) | 0, colOf = i => i % N;
  const boxOf = i => ((rowOf(i) / 2) | 0) * 2 + ((colOf(i) / 3) | 0);
  const PEERS = [];
  const UNITS = [];
  for (let r = 0; r < N; r++) UNITS.push([...Array(N)].map((_, c) => r * N + c));
  for (let c = 0; c < N; c++) UNITS.push([...Array(N)].map((_, r) => r * N + c));
  for (let b = 0; b < N; b++) { const u = []; for (let i = 0; i < 36; i++) if (boxOf(i) === b) u.push(i); UNITS.push(u); }
  for (let i = 0; i < 36; i++) { const s = new Set(); UNITS.forEach(u => { if (u.includes(i)) u.forEach(j => j !== i && s.add(j)); }); PEERS.push([...s]); }

  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const shuffle = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const canPlace = (g, i, v) => PEERS[i].every(j => g[j] !== v);

  function fill(g, r) {
    const i = g.indexOf(0); if (i < 0) return true;
    for (const v of shuffle([1, 2, 3, 4, 5, 6], r)) if (canPlace(g, i, v)) { g[i] = v; if (fill(g, r)) return true; g[i] = 0; }
    return false;
  }
  function countSolutions(g0, limit = 2) {
    const g = g0.slice(); let n = 0;
    (function go() {
      if (n >= limit) return;
      let best = -1, bc = null;
      for (let i = 0; i < 36; i++) if (!g[i]) { const c = [1,2,3,4,5,6].filter(v => canPlace(g, i, v)); if (!c.length) return; if (!bc || c.length < bc.length) { best = i; bc = c; } }
      if (best < 0) { n++; return; }
      for (const v of bc) { g[best] = v; go(); g[best] = 0; }
    })();
    return n;
  }
  // Logic solver: singles only (Easy), or singles + pairs/pointing (Medium+). Returns true if solved without guessing.
  function logicSolve(g0, advanced) {
    const g = g0.slice();
    const cand = g.map((v, i) => v ? 0 : [1,2,3,4,5,6].reduce((m, d) => canPlace(g, i, d) ? m | (1 << d) : m, 0));
    const set = (i, v) => { g[i] = v; cand[i] = 0; PEERS[i].forEach(j => cand[j] &= ~(1 << v)); };
    const bits = m => [1,2,3,4,5,6].filter(d => m & (1 << d));
    for (let guard = 0; guard < 200; guard++) {
      let progress = false;
      for (let i = 0; i < 36; i++) if (!g[i]) { const b = bits(cand[i]); if (!b.length) return false; if (b.length === 1) { set(i, b[0]); progress = true; } }
      for (const u of UNITS) for (let d = 1; d <= 6; d++) {
        if (u.some(i => g[i] === d)) continue;
        const spots = u.filter(i => cand[i] & (1 << d));
        if (!spots.length) return false;
        if (spots.length === 1) { set(spots[0], d); progress = true; }
      }
      if (!progress && advanced) {
        for (const u of UNITS) { // naked pairs
          const pr = u.filter(i => !g[i] && bits(cand[i]).length === 2);
          for (let a = 0; a < pr.length; a++) for (let b = a + 1; b < pr.length; b++) if (cand[pr[a]] === cand[pr[b]])
            u.forEach(i => { if (i !== pr[a] && i !== pr[b] && (cand[i] & cand[pr[a]])) { cand[i] &= ~cand[pr[a]]; progress = true; } });
        }
        for (let bx = 0; bx < 6; bx++) for (let d = 1; d <= 6; d++) { // pointing
          const box = UNITS[12 + bx], spots = box.filter(i => cand[i] & (1 << d)); if (spots.length < 2) continue;
          const rows = new Set(spots.map(rowOf)), cols = new Set(spots.map(colOf));
          const line = rows.size === 1 ? UNITS[rowOf(spots[0])] : cols.size === 1 ? UNITS[6 + colOf(spots[0])] : null;
          if (line) line.forEach(i => { if (!box.includes(i) && (cand[i] & (1 << d))) { cand[i] &= ~(1 << d); progress = true; } });
        }
      }
      if (!progress) break;
    }
    return g.every(v => v);
  }
  const DIFF = {
    easy:   { clues: 20, advanced: false, mistakes: null, hints: 2 },
    medium: { clues: 15, advanced: false, mistakes: null, hints: 3 },
    hard:   { clues: 12, advanced: true,  mistakes: null, hints: 4 },
    insane: { clues: 10, advanced: true,  mistakes: 3,    hints: 5, par: 480 },
  };
  function generate(diff, seed) {
    const r = rng(seed == null ? (Math.random() * 2 ** 32) >>> 0 : seed), spec = DIFF[diff];
    const sol = Array(36).fill(0); fill(sol, r);
    const p = sol.slice(); let clues = 36;
    for (const i of shuffle([...Array(36).keys()], r)) {
      if (clues <= spec.clues) break;
      const keep = p[i]; p[i] = 0;
      if (countSolutions(p) === 1 && logicSolve(p, spec.advanced)) clues--; else p[i] = keep;
    }
    return { diff, puzzle: p, solution: sol, clues };
  }
  function dailySeed(d = new Date()) { return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
  function conflicts(g) { const bad = new Set(); for (let i = 0; i < 36; i++) if (g[i] && !canPlace(g, i, g[i])) bad.add(i); return bad; }
  const isSolved = (g, sol) => g.every((v, i) => v === sol[i]);
  const api = { N, rowOf, colOf, boxOf, PEERS, UNITS, rng, generate, countSolutions, logicSolve, conflicts, isSolved, dailySeed, DIFF };
  if (typeof module !== 'undefined') module.exports = api; else root.Sudoku = api;
})(this);
