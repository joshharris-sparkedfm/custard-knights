'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { buildCatalog, writeCatalog } = require('../scripts/music.cjs');
const tracks = require('../audio/tracks.json');

function fixture(t) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ck-music-'));
  fs.mkdirSync(path.join(rootDir, 'audio'));
  t.after(() => fs.rmSync(rootDir, { recursive: true, force: true }));
  return rootDir;
}

test('missing soundtrack slots retain existing menu fallback and silent slots', t => {
  const rootDir = fixture(t), catalog = buildCatalog({ rootDir });
  assert.equal(catalog.menu, 'menu-theme.mp3');
  assert.equal(Object.keys(catalog).length, 13);
  for (const track of tracks.filter(t => t.id !== 'menu')) assert.equal(catalog[track.id], null);
});

test('exact WAV slot takes precedence, existing MP3 remains usable without WAV', t => {
  const rootDir = fixture(t);
  for (const track of tracks) {
    const base = track.file.replace(/\.(wav|mp3)$/, '');
    fs.writeFileSync(path.join(rootDir, 'audio', base + '.mp3'), 'legacy fixture');
    assert.equal(buildCatalog({ rootDir })[track.id], `audio/${base}.mp3`);
    fs.writeFileSync(path.join(rootDir, 'audio', base + '.wav'), 'WAV fixture');
    assert.equal(buildCatalog({ rootDir })[track.id], `audio/${base}.wav`);
    fs.unlinkSync(path.join(rootDir, 'audio', base + '.mp3'));
    assert.equal(buildCatalog({ rootDir })[track.id], `audio/${base}.wav`);
  }
});

test('catalog generation writes to supplied fixture only, with unchanged runtime format', t => {
  const rootDir = fixture(t);
  fs.writeFileSync(path.join(rootDir, 'audio', tracks[1].file), 'WAV fixture');
  const catalog = writeCatalog({ rootDir });
  const output = fs.readFileSync(path.join(rootDir, 'audio', 'soundtrack.js'), 'utf8');
  assert.ok(output.includes('window.CK_SOUNDTRACK=' + JSON.stringify(catalog, null, 2) + ';'));
  assert.equal(catalog.courtyard, 'audio/02-a-very-noble-food-fight.wav');
  assert.equal(fs.existsSync(path.join(rootDir, 'audio', '02-a-very-noble-food-fight.mp3')), false);
});
