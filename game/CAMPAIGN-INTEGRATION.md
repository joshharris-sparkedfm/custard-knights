# Campaign engine connection

Implemented chapter: all eight encounters in `THE-GREAT-PUDDING-WAR.md`, seven main-path nodes and the optional Biscuit Toll. Later regions are explicitly labelled story destinations beyond this playable chapter. Authored layouts use existing tile rendering and themes. No campaign code changes party difficulty or currency rewards.

Load these scripts before the inline game, after `game/progression.js`:

```html
<script src="game/campaign.js"></script>
<script src="game/campaign-ui.js"></script>
<script src="game/campaign-integration.js"></script>
```

At the end of the inline game, before the initial `newGame(true)`, instantiate the adapter. Replace `cancelCup()` with the exact Cup cancellation helper if named differently. `ADVENTURE` must be declared before any helper runs (`let ADVENTURE=null` alongside `let G=null`), and every hook must guard the null value.

```js
ADVENTURE=CKCampaignIntegration.connect({
 makeKnight:mkKnight,steer,hurt,redraw:drawBg,
 boot:map=>{
  cancelCup();
  SEATS=null;partyGo=false;
  const saved={...cfg};
  Object.assign(cfg,{players:1,map,mode:'ffa',diff:'chill',length:360,chaosPlus:false,chaosSpeed:'normal'});
  audio();menuMusic(false);newGame(false);Object.assign(cfg,saved);
  return G;
 },
 play:()=>{showScreen(null);paused=false;$('pauseBtn').hidden=false;showTouch(true);matchMusic();},
 finished:r=>{paused=false;$('pauseBtn').hidden=true;showTouch(false);cueMusic(r.won?'victory':'defeat');},
 mapOpened:()=>{if(NET.role)return;cancelCup();if(G&&!G.demo)G.over=true;showScreen(null);$('pauseBtn').hidden=true;showTouch(false);menuMusic(true);},
 menu:toMenu
},{
 // onReward(result,save) is optional. Connect campaign-owned cosmetic goals here.
 // result.added lists NEW spoon indices. result.added.includes(0) means a first
 // successful completion of that node; replayed success must never repay it.
});
SCREENS.push(...ADVENTURE.ui.screens);
$('tAdventure').onclick=()=>{if(!NET.role)ADVENTURE.open();};
```

Add a `tAdventure` menu button, describing `Story adventure · Eight encounters`. Add `if(ADVENTURE)ADVENTURE.stop();` at the start of both `start()` and `toMenu()` so changing format never leaves a campaign overlay or runtime active. Do NOT call it from `ADVENTURE.boot`, because it would erase retry state. `cancelCup()` belongs in adventure launch and map entry; launching Cups should call `ADVENTURE.stop()`.

## Simulation hooks (exact insertion points)

1. Change `isAlly` to include campaign teams:

```js
const isAlly=(a,b)=>a===b||((isTeams(G.mode)||G.campaign)&&a.team===b.team);
const maxHp=e=>e.campaignMaxHp||(isBoss(e)?8:3);
```

2. At the first line of `botInput(e,dt)`:

```js
if(G.campaign&&ADVENTURE){const input=ADVENTURE.input(e,dt);if(input)return input;}
```

3. Replace the terminal `updateMode(dt);` in `update(dt)`:

```js
if(G.campaign&&ADVENTURE)ADVENTURE.tick(dt);else updateMode(dt);
if(!G.campaign&&!G.demo&&G.time<=0&&!G.over)endMatch();
```

The second line replaces the existing timeout `endMatch()`. Campaign results must bypass `endMatch`, `finalResults`, ordinary match/Cup coins and placement tables. Also add `if(G.campaign)return;` in `updateMode` and guard `endMatch` at entry as defence against stale Cup end hooks. Pausing must continue to stop the simulation, including the objective clock.

4. In `logEv(k,d)`, forward before the demo/log-cap early return:

```js
if(G.campaign&&ADVENTURE)ADVENTURE.event(k,d);
```

Existing `ko` and `respawn` events then remove enemies permanently, fail the player immediately, or return a bridge player to the checkpoint. This forward must happen even after the telemetry log is full.

5. At the start of `clang(b,x,y)`:

```js
if(G.campaign&&ADVENTURE)ADVENTURE.event('block',{id:b.id});
```

6. Inside the melee `parryOk(b)` success branch (next to the parry counter):

```js
if(G.campaign&&ADVENTURE)ADVENTURE.event('parry',{id:b.id});
```

7. Inside the projectile reflection branch, when assigning `p.owner=b`:

```js
if(G.campaign&&ADVENTURE)ADVENTURE.event('reflect',{id:b.id});
```

8. In `hurt`, after shields/chicken/protection returns and immediately BEFORE `b.hp-=dmg`:

```js
if(G.campaign&&ADVENTURE)ADVENTURE.event('hit',{v:b.id,a:a?a.id:-1,damage:dmg,src:o.src||'sword'});
```

The event reports actual accepted hits, not swings or protected contacts. Keeping it before subtraction ensures a lethal hit also counts towards flawless conditions before KO saves the result.

9. In `hitCrate(c,r,d)`, at the end of its valid-crate path, after crate destruction and pickup spawning but before `return true`:

```js
if(G.campaign&&ADVENTURE)ADVENTURE.event('crate',{c,r,destroyed:G.crateHp[k]<=0});
```

This makes the Steve cage and soldier rescue depend on the real sword/crate collision. The campaign replaces a random cage pickup with the guaranteed golden egg.

10. In `draw()`, after `drawDynamicTiles()` and before row-sorted knights/walls:

```js
if(G.campaign&&ADVENTURE)ADVENTURE.draw(ctx);
```

Objectives and fixed boss target circles are world-space objects and must be inside the existing camera transform. The UI owns an HTML progress HUD (`campaignHUD`) above the world. If the standard `drawHUD()` clutter distracts, show only the timer and health in campaign; ensure the campaign objective HUD remains visible. Campaign map/story/result overlays use the existing `.overlay` convention, native buttons, `data-back` and `SCREENS`, and therefore inherit controller navigation.

## QA access

Inside the existing `?qa=1` `window.CK` object, expose `adventure:ADVENTURE`, `hurt`, `startSwing`, `hitCrate`, `clang`, `doHit`, `fire`, and optionally `draw`. They already exist in the closure. Do not expose them outside opt-in QA. `adventure.launch(id,resume)` uses real engine setup and controllers. For full automated coverage, a scripted verifier may load a temporary unlocked campaign save via `adventure.campaign.restore(...)`; that is QA setup, not a production unlock route.

`npm test` automatically includes `tests/campaign.test.cjs`: prerequisites, corruption, independent spoons/idempotency, both waves, stand loss, real reflection counts, sequential bridge gates/falls, examination phases, real cage events and egg route, fixed boss telegraphs/punish windows/allied sweep collisions, playable rescue, assisted timing, saved checkpoint resets and backup merge preservation. `node qa/run.js campaign` exercises real engine collision hooks; `node qa/campaign-visual.cjs --input` additionally completes every encounter through ordinary controls, including actual pause/resume. Automated completion is not human playtesting or evidence for the proposed 20–30 minute duration.

For save export/import packaging, include the localStorage key `ck-campaign-v1` alongside existing household progression keys. `CKCampaign.merge(existing,imported)` preserves ownership and independent spoons across both saves. `campaign.restore(raw)` normalizes an imported raw save; each successful phase transition saves a checkpoint, each result merges permanent spoons independently. Generic match progression is intentionally bypassed.
