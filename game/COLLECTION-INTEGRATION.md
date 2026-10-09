# Collection integration (owned by parent index.html editor)

Files ready: `game/collection.js`, `game/collection-ui.js`, `game/collection-art.js`. Eleven unit checks in `tests/collection.test.cjs` pass. The hooks below are now integrated in index.html; this file records the integration contract.

## Save and award hooks

Load the three scripts before the game's main script. Initialize mutable `COLLECTION = CKCollection.normalize(JSON.parse(localStorage.getItem('ck-collection') || 'null'))` in try/catch, and `saveCollection(s)` which assigns COLLECTION and persists only `ck-collection`.

`CKCollection.apply(COLLECTION, {roundId:G.roundId, participated:true, milestones:[]})` returns `{state,applied,unlocked}`. Invoke once when accepted local/guest round awards are applied, after campaign/Cup has determined milestones, not for demo/spectator/abandoned rounds. A shared-household completion counts once, independent of how many local seats played. Do not invoke for campaign failed attempts unless the intended progression rules count an actual completed encounter. Story milestone keys are exactly `rice-chapter`, `steve-rescue`, `cup-complete`; they must accompany the completing round's first apply call, because duplicates are ignored as a whole. Mission completion replay cannot reaward when using stable receipt IDs as appropriate.

All six goals can be pinned. Goals only advance while pinned; progress remains on switching. The first completion enables a one-time choice of `tea-towel` / `burnt-toast`. `pin(state,id)`, `choose(state,id)` and `savePreset(state,0..2,profile)` return new normalized state. `owns(state,kind,value)` checks the additional collection only; legacy `owned()` should retain its original fallback.

## Profiles and network

Add arrays: HELMS += `roosterCrown,riceGuard`; CAPES += `teaTowel,burntToast`; BLADES += `goldenWhisk`. Add profile string `pose` default `plain`, allowed `plain,steveStrut`. Preserve pose in cleanKit/applyKit/netSetup and hero/wardrobe copying. `owned(kind,value)` first checks whether CKCollection.items contains the pair; if so use collection ownership, otherwise legacy logic. A new helm must not pass the existing unconditional `helm` ownership shortcut. Strict cleanKit must enforce custom helm/pose ownership; remote cleanKit accepts valid IDs for the sender's cosmetics without checking local ownership.

Do not add these six IDs to legacy PROG.unlocked or mutate legacy progression.js. `CKCollection.items` supplies labels/descriptions. Assign pose to entities alongside cape/blade, and kit.helm holds custom helmets as normal. No combat properties change.

## Canvas hooks — baked pipeline and classic fallback

`CKCollectionArt` draws original geometry and never mutates entity state. Coordinates are the current knight-local canvas (after translate(e.x,e.y), scale(KV,KV)), radius r, time G.clock.

1. In drawKnight, call `Art.pose(ctx,e,r,time,G.over || e.collectionPreview)` after the knight transform. It changes only canvas transform and only with the enabled flag. The Steve Strut rocks/lifts with alternating feet. Do not enable during live combat.
2. Before knight body/sprite, call `Art.drawBack(ctx,e,r,time)`. After body/sprite, call `Art.drawFront(ctx,e,r,time,{results:G.over,preview:e.collectionPreview,headY:...})`. For the baked pipeline use `headY:sprTop(r)+r*.65`; classic use default or `-r*1.45`. Skip costume overlay for chickens. The back-facing cloak is intentionally drawn by drawFront; front-facing cloak is drawn behind the body.
3. For custom capes (`Art.isCape(e.cape)`), skip the existing cape layer in sprCompose and return immediately from classic drawCape. The new towel/toast has its own silhouette and materials.
4. For custom helmets (`Art.isHelm(e.kit.helm)`), the existing sprite helm fallback to great supplies the base head. Skip baked plume rendering for these helmets so comb/bowl remain readable; skip classic drawPlume for them. The classic drawHelm should use the generic great body as fallback; new shapes are added by drawFront.
5. For Golden Whisk, skip baked blade layer in sprCompose. Draw `drawSword(e,r)` after successful baked knight render when `!e.wpn && Art.isBlade(e.blade)` (same translated -bob-r*.3 as current drawHeld branch). In drawSword, immediately after existing handle and pommel drawing, before the `const bk=...` blade branch, insert `if(Art.isBlade(e.blade)){Art.drawWhisk(ctx,L,w);gauntlet(e,-r*.16,0,r);ctx.restore();return;}`. This uses existing swing/reach coordinates; no simulation change. Existing drawSword handles classic render automatically.
6. Add pose to netSetup so peers see result costumes. NewGame setup must preserve the received appearance (already fixed). Result pose should not delay a round.

## UI adapter

Append an empty collection div within wardrobe and call once:

```js
collectionUI=CKCollectionUI.mount(div,{
 getState:()=>COLLECTION,
 setState:saveCollection,
 getProfile:()=>loadProfile(wardWho),
 saveProfile:p=>saveProfile(wardWho,p),
 onChange:syncWardrobe,
 onImport:()=>{ /* reload PROG, COLLECTION, clear PROFILES cache, then sync */ },
 drawPreview:(canvas,profile,{gameplay,time,pose})=>{
   // Draw an actual mkKnight using the same drawKnight pipeline.
   // e.collectionPreview=pose; e.pose=profile.pose; copy all appearance fields.
   // Rotate face with time. Canvas is 360x320 large, 190x185 gameplay.
   // Gameplay uses native radius22 with KV=1.12 and no canvas upscaling;
   // large uses a fit that keeps the complete weapon silhouette inside the canvas. Set zero inv/protect, no powers, no chicken.
   // Wrap ctx assignment and preview time/G.over overrides in try/finally.
 }
});
```

The module supplies choice, six published routes, pin/try/equip, all partial progress, three presets, status feedback, and backup controls. Its animation loop calls preview ~22fps only while visible. Call `.refresh()` when selected local seat changes or after results. Locked try-ons are ephemeral copies and never saved. `CKCollectionUI.reward(endContainer,adapters,unlockedIds)` offers first choice or unlock equip/keep current look without blocking the match flow.

Backup UI includes story spoons/checkpoints, earned coins/legacy unlocks, collection goals and four player outfits. Current Cup sessions and settings are excluded. `exportBackup(localStorage)` and `importBackup(localStorage,text)` validate all sections before writing, merge campaign state through CKCampaign.merge, merge legacy earned ownership and goal progress, retain receipts, and roll back on write failure. onImport reloads PROG/COLLECTION/PROFILES and restores ADVENTURE.campaign from the imported campaign section. Desktop download handling should be checked during packaging acceptance.

Guest profile saves send an authenticated `kit` packet. The host sanitizes the sender's own stored kit and applies it on the next round. Live network acceptance proves a guest's first Tea Towel choice appears on both peers after rematch.

The Rice Guard story milestone is all non-optional campaign nodes. The Biscuit Toll does not gate it. Campaign begin/failure clears prior unlock celebrations. Both onReward and finished callbacks share one encounter receipt so new spoons never double-count a completion.
