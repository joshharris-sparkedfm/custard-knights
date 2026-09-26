// Knight lab: renders a turnaround and animation sheet of one knight with the live game renderer.
// Run through art/lab/render.py, which opens index.html?qa=1 headless and captures the result.
// Rows: 8 facing directions (idle), then states (walk cycle, swing, charge, block, hit, stunned, win, chicken), then game scale.
(() => {
  const P = window.LAB || {};
  if ('sprites' in P) CK.sprites(!!P.sprites);
  const G = CK.begin({ map: 'courtyard', humans: 0 }); G.over = true; CK.freeze(true);
  const S = P.scale || 2.1, cell = 112 * S, cols = 8, rows = 3, W = cols * cell, H = rows * cell + 260;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = '#6FBF5E'; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < W / 40; i++) for (let j = 0; j < H / 40; j++) if ((i + j) % 2) x.fillRect(i * 40, j * 40, 40, 40);
  const kit = Object.assign({ kit: { helm: 'great', plume: 'feather', metal: 'steel' }, emblem: 'star', color: '#FF5A4E', cape: 'plain', blade: 'steel' }, P.knight || {});
  const label = (t, px, py) => { x.font = '800 16px Nunito, sans-serif'; x.fillStyle = '#221733'; x.textAlign = 'center'; x.fillText(t, px, py); };
  const put = (e, cx, cy, sc) => { x.setTransform(sc, 0, 0, sc, cx, cy); CK.withCtx(x, () => CK.drawKnight(e)); x.setTransform(1, 0, 0, 1, 0, 0); };
  const K = o => CK.mkKnight(Object.assign({}, kit, o));
  // row 1: eight directions
  const dirs = [['S', Math.PI / 2], ['SE', Math.PI / 4], ['E', 0], ['NE', -Math.PI / 4], ['N', -Math.PI / 2], ['NW', -3 * Math.PI / 4], ['W', Math.PI], ['SW', 3 * Math.PI / 4]];
  dirs.forEach(([n, f], i) => { put(K({ face: f }), i * cell + cell / 2, cell * .76, S); label(n, i * cell + cell / 2, cell - 8); });
  // row 2: walk cycle facing SE, 8 phases
  for (let i = 0; i < 8; i++) { const e = K({ face: Math.PI / 4, vx: 160, vy: 160, walk: i * Math.PI / 4 }); put(e, i * cell + cell / 2, cell * 1.76, S); label('walk ' + (i + 1), i * cell + cell / 2, cell * 2 - 8); }
  // row 3: states
  const st = [
    ['swing', { face: .3, swing: .12, swingKind: 'light', swingDur: .22 }],
    ['heavy', { face: .3, swing: .15, swingKind: 'heavy', swingDur: .3 }],
    ['charge', { face: .3, charge: .8 }],
    ['block', { face: .3, blocking: true }],
    ['hit', { face: .3, flash: .1 }],
    ['stunned', { face: .3, stun: .4 }],
    ['win', { face: Math.PI / 2, win: true }],
    ['chicken', { face: .3, chick: true }],
  ];
  G.winners = [];
  st.forEach(([n, o], i) => { const e = K(Object.assign({}, o)); e.hitSet = []; e.crateHit = true; if (o.win) { G.winners = [e]; } put(e, i * cell + cell / 2, cell * 2.76, S); label(n, i * cell + cell / 2, cell * 3 - 8); });
  // bottom strip: game scale (1x and 2x), four colours, so readability is judged where it matters
  const cols2 = ['#FF5A4E', '#2EC4B6', '#9B7BFF', '#FFD23F', '#4DA8FF', '#9BE564', '#FF8FB1', '#FF9F43'];
  x.fillStyle = '#5C5470'; x.fillRect(0, rows * cell, W / 2, 260); x.fillStyle = '#CFE2F1'; x.fillRect(W / 2, rows * cell, W / 2, 260);
  const CP = ['plain', 'stripes', 'chevron', 'checker', 'stars', 'trim', 'stripes', 'stars'], BL = ['steel', 'wooden', 'baguette', 'fish', 'candy', 'spoon', 'fish', 'baguette'], EM = ['star', 'heart', 'crown', 'skull', 'bolt', 'moon', 'pie', 'sun'];
  cols2.forEach((col, i) => { put(K({ color: col, face: -Math.PI / 2 - .6 + i * .15, id: 40 + i, cape: CP[i] }), 40 + i * 44, rows * cell + 90, 1); put(K({ color: col, face: -Math.PI / 2 - .6 + i * .15, id: 40 + i, cape: CP[i] }), 60 + i * 88, rows * cell + 210, 2); });
  cols2.forEach((col, i) => { put(K({ color: col, face: Math.PI / 2 + .6 - i * .15, id: 50 + i, kit: { helm: ['great', 'sallet', 'horned', 'crest', 'kettle', 'barbute', 'great', 'horned'][i], plume: ['feather', 'twin', 'mohawk', 'flame', 'brush', 'feather', 'flame', 'twin'][i], metal: ['steel', 'gold', 'dark', 'steel', 'gold', 'dark', 'steel', 'gold'][i] }, blade: BL[i], emblem: EM[i] }), W / 2 + 40 + i * 44, rows * cell + 90, 1); put(K({ color: col, face: Math.PI / 2 + .6 - i * .15, id: 50 + i, kit: { helm: ['great', 'sallet', 'horned', 'crest', 'kettle', 'barbute', 'great', 'horned'][i], plume: ['feather', 'twin', 'mohawk', 'flame', 'brush', 'feather', 'flame', 'twin'][i], metal: ['steel', 'gold', 'dark', 'steel', 'gold', 'dark', 'steel', 'gold'][i] }, blade: BL[i], emblem: EM[i] }), W / 2 + 60 + i * 88, rows * cell + 210, 2); });
  label('from behind: every cape pattern', W / 4, rows * cell + 22); label('game scale 1x and 2x on a light floor, every helm, blade and emblem', W * .75, rows * cell + 22);
  window.__sheet = c.toDataURL('image/png'); document.title = 'DONE';
})();
