# Store field draft

Updated 9 October 2026 after the **0.3.0-alpha.6** review checkpoint, with **0.3.0-beta.1** targeted for a private Windows friends beta. This is preparation material; the beta target does not establish an exported archive, and store fields have not been submitted or approved. Use BETA-PLAN.md for the private test scope, LAUNCH-STATUS.md for acceptance and PREVIEW-BUILD.md/the frozen manifest for exported build identity.

- Product: Custard Knights
- Developer: Sparked FM Ltd
- Publisher: Sparked FM Ltd
- Proposed base prices: GBP 7.99; USD 9.99. Other territories to be reviewed in Steamworks.
- Release model: premium complete game with earned cosmetics; no paid cosmetic currency.
- Initial package: Windows x64, launch `Custard Knights.exe` from install root with no arguments.
- Language verified in the implementation: English interface and subtitles/text. No spoken narration has been added.
- Play formats implemented: single-player bots/story; local shared-screen arena and Cup; PeerJS online arena rooms by code. Local couch capacity four human seats; total original-arena capacity eight knights including bots and remote guests. Story is single-player.
- Faction Front implemented: Brawl, Capture the Flag and Castle Siege with 4v4, 20v20 and 50v50 total combatants, four roles and bot fill. Local bot practice is available; online faction rooms require a separately running authoritative server. No public endpoint is deployed. Do not turn total combatant capacity into an advertised 100-human service claim before acceptance.
- Difficulty options: Easy, Medium, Hard, STEVE. Session standings are anonymous/unranked; private host-issued ratings and skill queues are implemented; Steam identity, party matchmaking and public competitive acceptance remain unfinished.
- Do not select unimplemented Steam achievements, Steam Cloud or Steam matchmaking. Full-controller/Deck support needs corresponding acceptance evidence.
- Public support email/URL: awaiting owner's answer.

## Copy

Use the current short/about description in STEAM-HANDOFF.md. The campaign is the eight-encounter first chapter. Do not imply the later dessert kingdoms are playable. Eleven new Suno WAV recordings and the existing menu MP3 now fill all twelve cues, but human musical and loop acceptance remains pending. Do not include internal testing instructions or the private beta's access keys/endpoints in the published description.

## Content-survey source facts for review

The game contains stylised fantasy sword fighting, cartoon knockouts, pies, hazards and transformations into chickens. The implemented story is text-based. Players can choose their displayed names; original arena online uses PeerJS, while faction online uses a separate WebSocket server. The preparation did not add microphones, voice chat, account registration, payments or a live generative-AI service.

The menu music is a pre-generated Suno recording whose commercial rights the owner confirmed. Eleven further pre-generated Suno v6 recordings were exported as WAV on 9 October 2026 from the observed Pro account and imported unchanged; their source URLs, hashes, creation settings and review status are recorded in [music/source-provenance.json](music/source-provenance.json). They are playback candidates pending human musical/loop review, and must be included in the shipped-audio inventory if retained in the submitted build. Prior user rights confirmation and observed account status are recorded context, not a new legal declaration or an independent licensing determination.

New store illustrations and the desktop icon were pre-generated with image_gen; exact prompts and image sources are recorded in art/store. The game does not generate music or artwork during play. Review all shipped AI-assisted player-facing art, audio and narrative against the current [Steam content survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey); the facts above are an inventory starting point, not completed survey answers or an exhaustive provenance declaration. Final classifications and ratings must follow the form presented for this application.

## Upload assets

Steam-Store-Assets contains exact-size capsule/library exports, icons and a review sheet. Use those assets for their named artwork slots only. Gameplay screenshots and the 41-second 1080p H.264/AAC trailer are separate actual-game captures from the earlier release work. The 20-second faction preview in art/review/factions-2026-10-09 shows scripted local play with bots, captured before the final difficulty edits. Neither is footage of 100 online humans. All media remains a review candidate until checked against the final candidate and selected in the real Steamworks app.
