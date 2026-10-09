#!/usr/bin/env python3
"""Generate a portable listening page from existing soundtrack candidates; no audio analysis."""
import argparse
from html import escape
import json
from pathlib import Path
import shutil
from urllib.parse import quote

CUES = {
    "menu": "Main menu · existing theme",
    "courtyard": "Castle Courtyard", "frost": "Frosty Keep",
    "factory": "Pie Factory", "dungeon": "Dragon’s Larder",
    "roof": "Rooftop Rumble", "bog": "Custard Bog",
    "race": "Chicken Racing · every arena", "hotpie": "Hot Pie · every arena",
    "wardrobe": "Wardrobe", "victory": "Winning results", "defeat": "Losing results / rematch",
    "oh-nae-nae": "Rare Oh Nae Nae arena event",
}


def copy_asset(source, destination):
    if not source.is_file():
        raise ValueError(f"Required review asset is missing: {source}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    if source.resolve() != destination.resolve():
        shutil.copy2(source, destination)


def render_card(number, slot, title, media, metadata, source_url=None, warning=None):
    source = f'<a href="{escape(source_url, quote=True)}" target="_blank" rel="noopener noreferrer">Suno source ↗</a>' if source_url else '<span>Original menu recording retained</span>'
    flag = f'<p class="warning">{escape(warning)}</p>' if warning else ''
    return f'''<article class="track" aria-labelledby="title-{slot}">
      <div class="track-top"><span class="number">{number:02d}</span><span class="cue">{escape(CUES[slot])}</span></div>
      <h2 id="title-{slot}">{escape(title)}</h2>
      <p class="metadata">{escape(metadata)}</p>
      <audio controls preload="none" data-title="{escape(title, quote=True)}" aria-label="Listen to {escape(title, quote=True)}" src="{quote(media)}">Your browser does not support this audio player.</audio>
      {flag}<div class="track-footer">{source}<a href="{quote(media)}" download>Download file</a></div>
    </article>'''


def generate(repo, output):
    repo, output = Path(repo).resolve(), Path(output).resolve()
    provenance_path = repo / "release/music/source-provenance.json"
    provenance = json.loads(provenance_path.read_text(encoding="utf-8-sig"))
    package = json.loads((repo / "package.json").read_text(encoding="utf-8-sig"))
    output.mkdir(parents=True, exist_ok=True)
    copy_asset(repo / "menu-theme.mp3", output / "menu-theme.mp3")
    cards = [render_card(1, "menu", "Custard Knights", "menu-theme.mp3", "Existing MP3 · unchanged · no WAV conversion")]
    for number, track in enumerate(provenance["tracks"], start=2):
        source = repo / track["file"]
        media = "masters/" + source.name
        copy_asset(source, output / media)
        duration = track["duration_seconds"]
        duration_text = f"{int(duration // 60)}:{duration % 60:05.2f}"
        metadata = f'{duration_text} · {track["sample_rate_hz"] // 1000} kHz · {track["valid_bits"]}-bit stereo WAV · {track["peak_dbfs"]:.2f} dBFS peak'
        warning = None
        if track["trailing_silence_seconds"] > 0.5:
            warning = f'Review flag: {track["trailing_silence_seconds"]:.3f} seconds of trailing silence. Listen for a gap on repeat; the master is unchanged.'
        cards.append(render_card(number, track["slot"], track["title"], media, metadata, track["source_url"], warning))
    copy_asset(provenance_path, output / "source-provenance.json")
    evidence = repo / "release/music/evidence"
    for filename in ("inspection-all.json", "inspection-all.md", "suno-generated.jpg", "inspection-oh-nae-nae.json", "suno-oh-nae-nae.jpg"):
        destination = output / filename
        if not destination.exists():
            copy_asset(evidence / filename, destination)

    page = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Custard Knights · soundtrack listening review</title>
<style>
:root{color-scheme:dark;--bg:#121a24;--panel:#1b2734;--ink:#f7f1df;--muted:#b2bdc9;--gold:#f3cb73;--line:#334250}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.55}main{max-width:1160px;margin:auto;padding:52px 24px 64px}.eyebrow{text-transform:uppercase;letter-spacing:.18em;color:var(--gold);font-size:12px;font-weight:750}h1{font-family:Georgia,serif;font-size:clamp(36px,5vw,62px);line-height:1.08;letter-spacing:-.035em;margin:14px 0 20px;max-width:760px}header>p{max-width:790px;color:var(--muted);font-size:17px}.tags{display:flex;gap:9px;flex-wrap:wrap;margin:23px 0}.tags span{border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:12px;color:var(--muted)}.notice{padding:17px 20px;border-left:3px solid var(--gold);background:#202b36;border-radius:0 10px 10px 0;margin:28px 0;color:#e2e6ea}.notice strong{color:var(--gold)}.player-status{display:flex;justify-content:space-between;gap:16px;align-items:center;margin:34px 0 20px;padding-bottom:16px;border-bottom:1px solid var(--line);font-size:14px;color:var(--muted)}button{font:inherit;padding:9px 15px;color:var(--ink);background:var(--panel);border:1px solid #596a79;border-radius:7px;cursor:pointer}button:hover{border-color:var(--gold)}button:focus-visible,a:focus-visible{outline:3px solid var(--gold);outline-offset:4px}.tracks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.track{background:var(--panel);padding:24px;border:1px solid var(--line);border-radius:13px}.track-top{display:flex;align-items:center;gap:13px}.number{font-size:13px;color:var(--gold);font-variant-numeric:tabular-nums;font-weight:750}.cue{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.055em}.track h2{font-size:22px;line-height:1.25;margin:14px 0 10px;letter-spacing:-.02em}.metadata{font-size:12px;color:var(--muted);margin:0 0 20px}audio{width:100%;height:42px}.track-footer{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-top:18px;font-size:12px;color:var(--muted)}a{color:var(--gold);text-underline-offset:3px}.warning{font-size:13px;padding:11px 13px;background:#3d3022;border:1px solid #745d36;border-radius:7px;color:#ffe0a0}footer{margin-top:38px;padding-top:25px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}footer p{max-width:850px}.evidence{display:flex;gap:18px;flex-wrap:wrap}@media(max-width:700px){main{padding:30px 16px}.tracks{grid-template-columns:1fr}.track{padding:20px}.player-status{align-items:flex-start}.cue{font-size:11px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
</style></head><body><main>
<header><div class="eyebrow">Custard Knights · listening room</div><h1>A soundtrack for a very noble food fight.</h1>
<p>Review the Suno WAV candidates alongside the original menu theme, including the new Oh Nae Nae song. Play a cue, check how it feels against its setting, and listen through its ending. Only one player runs at a time.</p>
<div class="tags"><span>VERSION_PLACEHOLDER</span><span>CUE_COUNT playable cues</span><span>WAV_COUNT untouched WAV exports</span><span>Human review pending</span></div></header>
<div class="notice"><strong>Playback candidates, not final musical selections.</strong> The first exported variant was selected from each pair. Musical fit, mix balance and seamless loops still need human listening. Oh Nae Nae intentionally has sung lyrics and plays during its rare arena event. Another Helping has a measured 1.595-second silent tail.</div>
<div class="player-status"><span id="now-playing" role="status" aria-live="polite">Choose a track to begin. Nothing autoplays.</span><button id="pause-all" type="button">Pause all</button></div>
<section class="tracks" aria-label="Soundtrack players">CARDS_PLACEHOLDER</section>
<footer><p>New WAVs retain the exported 48 kHz stereo, 16-bit PCM audio. There was no trimming, normalization, resampling or MP3-to-WAV conversion. Peaks are sample measurements, not perceived loudness. Original downloads and preserved masters remain unchanged.</p>
<p>The technical report records zero file-structure errors and no full-scale clipping samples, plus the inspection runtime failures and successful checks. These checks do not establish a good musical loop.</p>
<div class="evidence"><a href="source-provenance.json">Track sources and provenance</a><a href="inspection-all.md">Original instrumental inspection</a><a href="inspection-oh-nae-nae.json">Oh Nae Nae measurements</a><a href="suno-oh-nae-nae.jpg">Oh Nae Nae generation</a><a href="suno-generated.jpg">Instrumental generation</a></div></footer>
</main><script>
const players=[...document.querySelectorAll('audio')],status=document.querySelector('#now-playing');
for(const player of players){player.addEventListener('play',()=>{for(const other of players)if(other!==player)other.pause();status.textContent='Playing: '+player.dataset.title;});player.addEventListener('ended',()=>{status.textContent='Finished: '+player.dataset.title;});player.addEventListener('error',()=>{status.textContent='Unable to load '+player.dataset.title+'. Keep the audio files beside this review page.';});}
document.querySelector('#pause-all').addEventListener('click',()=>{for(const player of players)player.pause();status.textContent='All tracks paused.';});
</script></body></html>'''
    page = page.replace("VERSION_PLACEHOLDER", escape(package["version"])).replace("CARDS_PLACEHOLDER", "\n".join(cards)).replace("CUE_COUNT", str(len(cards))).replace("WAV_COUNT", str(len(provenance["tracks"])))
    target = output / "index.html"
    target.write_text(page, encoding="utf-8")
    return target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, type=Path, help="Custard Knights repository directory")
    parser.add_argument("--output", required=True, type=Path, help="Directory for the portable listening bundle")
    args = parser.parse_args()
    print(generate(args.repo, args.output))


if __name__ == "__main__":
    main()
