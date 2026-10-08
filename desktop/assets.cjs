const path = require('node:path');
const {pathToFileURL} = require('node:url');
const fs = require('node:fs');

// Keep the renderer on the same origin across builds, and expose runtime assets only.
function resolveAsset(root, request) {
  if (!['GET', 'HEAD'].includes(request.method || 'GET')) return {status: 405};
  let url, pathname;
  try { url = new URL(request.url); pathname = decodeURIComponent(url.pathname); }
  catch { return {status: 400}; }
  if (url.protocol !== 'custard:' || url.host !== 'game' || url.username || url.password) return {status: 403};
  if (/[\\\0:]/.test(pathname)) return {status: 403};
  const file = path.resolve(root, '.' + pathname);
  const relative = path.relative(root, file);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return {status: 403};
  const asset = relative.split(path.sep).join('/');
  if (!['index.html', 'menu-theme.mp3', 'art/keyart/home.webp'].includes(asset) &&
      !/^(sprites|vendor|game|audio)\/[^.][^\0]*\.(js|css|woff2|mp3|ogg|wav|webp|png|json|txt)$/.test(asset)) return {status: 403};
  try {
    if (!fs.statSync(file).isFile()) return {status: 404};
    // Development checkouts must not expose symlink targets outside the app either.
    const actual = path.relative(fs.realpathSync(root), fs.realpathSync(file));
    if (actual.startsWith('..') || path.isAbsolute(actual)) return {status: 403};
  } catch { return {status: 404}; }
  return {file};
}

function createAssetHandler(root, net) {
  return async request => {
    const asset = resolveAsset(root, request);
    if (asset.status) return new Response('Asset unavailable', {status: asset.status});
    try { return await net.fetch(pathToFileURL(asset.file).href); }
    catch { return new Response('Asset unavailable', {status: 404}); }
  };
}
module.exports = {resolveAsset, createAssetHandler};
