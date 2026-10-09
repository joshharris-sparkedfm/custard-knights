'use strict';

const queueKey = (mode, teamSize) => `${mode}-${teamSize}`;
// Start close to a player's rating, then widen gradually to a bounded 800 points.
const permittedGap = (waitMs) => Math.min(800, 200 + Math.floor(Math.max(0, waitMs) / 15000) * 100);
function selectMatch(entries, required, now) {
  if (!Number.isInteger(required) || required < 1 || entries.length < required) return null;
  const oldest = [...entries].sort((a, b) => a.joinedAt - b.joinedAt || a.profile.rating - b.profile.rating);
  const anchors = [...new Set(entries.map(e => e.profile.rating))].sort((a, b) => a - b);
  let best = null, bestAge = Infinity;
  // Seven discrete bands bound this search to O(7*n²). Filtering eligibility
  // before selecting a roster lets a fresh middle-rated entrant keep waiting
  // without blocking older players whose permitted span has already widened.
  for (let gap = 200; gap <= 800; gap += 100) {
    const eligible = oldest.filter(e => permittedGap(now - e.joinedAt) >= gap);
    if (eligible.length < required) continue;
    for (const low of anchors) {
      const group = [];
      for (const entry of eligible) {
        if (entry.profile.rating >= low && entry.profile.rating <= low + gap) group.push(entry);
        if (group.length === required) break;
      }
      if (group.length !== required) continue;
      const age = group.reduce((sum, e) => sum + e.joinedAt, 0);
      if (!best || group[0].joinedAt < best[0].joinedAt || (group[0].joinedAt === best[0].joinedAt && age < bestAge)) { best = group; bestAge = age; }
    }
  }
  return best?.sort((a, b) => b.profile.rating - a.profile.rating) || null;
}

module.exports = { queueKey, permittedGap, selectMatch };
