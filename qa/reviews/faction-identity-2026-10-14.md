# FE10-A live faction identity review - 14 October 2026

Independent reviewer: /root/faction_visual_contract, gpt-6-luna, high. Implementation owner: /root/story_finish_impl, gpt-6.1-sol, high. QA owner: /root/faction_identity_qa, gpt-6.1-sol, medium. Root integrates.

Reviewed source: 0b3d2c69adcedac51a7786c71043afd4bcd54743, based on main5899a2eb759f02d04144dcdc3384e79ffcbcff42. game/faction-art.js SHA256135c06d389a40e51aacd8dce1493bc8a9578283ecb73bf1246a9ccfe0b2b78c0; working index.html SHA256e4ec310e7a5f43782c285d6c67e4428cc5a9302382857582bf06a3d2c09b0677. Working/committed line-ending normalization is recorded by QA; the runtime bytes did not change during captures.

## Finding and implementation

Live faction bodies previously differed mainly by team tint/default kit. The bounded change adds hollow saucepan handles/rounded bell trim to Custardia and stepped bowl plates/outboard grain crests to Rice. These are deterministic canvas accessories around the existing rounded knight, behind all accepted body, visor, cosmetic and weapon layers. Only the live faction bridge assigns the temporary faction marker from p.team. Unknown and ordinary knights do not draw the layer. No simulation/network/save fields or statistics/hitboxes/atlas changes are introduced. The existing sprite composition key and 32 MiB budget are unchanged because the extra geometry is drawn outside the cached bitmap.

## Review decision

Clear for this bounded source increment. The source reviewer found no blocker. The guarded draw hook inherits combat pose and character transforms. Exact baseline PNG comparisons for inactive and unknown factions, cache-on/off parity, bounded eviction, both visors, facings, capes, movement/falling and 4/20/50 practice and mixed positional fixtures support the source contract. Root inspected the actual-size open-visor grayscale sheet and ordinary/dense50v50 captures. Hosted CI38557205191 passed all six jobs on its first attempt at the exact source commit. Full raw results, initial fixture failures and corrections are retained in qa/results/faction-identity-2026-10-14; use its summary/manifest for exact counts and scope.

## Limits and remaining work

The staged dense100 fixture has heavily occluded interior bodies and health bars. Clear and peripheral silhouettes show the new shape distinction; this is not evidence that every fighter is identifiable, that humans recognize factions, or that TV/minimum-hardware/performance/WAN/Steam acceptance passes. Scripted grayscale captures are not a color-vision user study. Existing role weapons and HUD remain; independent Engineer/Support role silhouettes and broader FE10 art/media acceptance remain open. The latest exported friends build stays beta.17 and does not contain this new source increment. Original WIP, normal saves and old exports are preserved.