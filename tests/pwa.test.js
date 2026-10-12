const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
function worker(scope = 'https://example.test/XAUUSD-Calculator/') {
  const handlers = {}, stores = new Map(), network = [];
  const cacheApi = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return { async addAll(urls) { for (const url of urls) store.set(url, { cached: url }); }, async match(key) { return store.get(key); } };
    },
    async keys() { return [...stores.keys()]; },
    async delete(key) { return stores.delete(key); }
  };
  let claims = 0;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), {
    URL, caches: cacheApi,
    self: { registration: { scope }, clients: { async claim() { claims++; } }, addEventListener(name, fn) { handlers[name] = fn; } },
    async fetch(request) { network.push(request.url); throw new Error('offline'); }
  });
  const lifecycle = async name => { let pending; handlers[name]({ waitUntil(p) { pending = p; } }); await pending; };
  const request = async (url, mode = 'navigate', method = 'GET') => {
    let response;
    handlers.fetch({ request: { url, mode, method }, respondWith(p) { response = p; } });
    return response ? await response : undefined;
  };
  return { stores, network, lifecycle, request, claims: () => claims };
}
test('manifest: standalone、相対scope/start_url、192/512 PNG', () => {
  const m = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  assert.equal(m.display, 'standalone');
  for (const key of ['id', 'scope', 'start_url']) assert.equal(m[key], './');
  for (const size of [192, 512]) {
    const icon = m.icons.find(i => i.sizes === `${size}x${size}`);
    assert.ok(icon); assert.equal(icon.type, 'image/png');
    const bytes = fs.readFileSync(path.join(root, icon.src));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(bytes.readUInt32BE(16), size); assert.equal(bytes.readUInt32BE(20), size);
  }
});
test('install: 全8ファイルが存在し、保存対象に含まれる', async () => {
  const w = worker(); await w.lifecycle('install');
  const entries = [...w.stores.values()][0]; assert.equal(entries.size, 8);
  for (const url of entries.keys()) assert.ok(fs.existsSync(path.join(root, new URL(url).pathname.replace('/XAUUSD-Calculator/', ''))));
});
test('offline: ルート、index、クエリ付き起動と全静的資産をネットなしで取得', async () => {
  const w = worker(); await w.lifecycle('install'); await w.lifecycle('activate');
  for (const suffix of ['', '?from=home', 'index.html', 'index.html?from=home']) {
    const r = await w.request('https://example.test/XAUUSD-Calculator/' + suffix);
    assert.equal(r.cached, 'https://example.test/XAUUSD-Calculator/index.html');
  }
  for (const url of [...w.stores.values()][0].keys()) assert.equal((await w.request(url, 'cors')).cached, url);
  assert.equal(w.network.length, 0); assert.equal(w.claims(), 1);
});
test('activate: 同じアプリの旧版だけ削除し、他アプリのキャッシュを維持', async () => {
  const w = worker(); await w.lifecycle('install');
  w.stores.set('gold-calc:https://example.test/XAUUSD-Calculator/:old', new Map());
  w.stores.set('gold-calc:https://example.test/another/:v1', new Map());
  w.stores.set('other-app', new Map());
  await w.lifecycle('activate');
  assert.equal(w.stores.size, 3); assert.ok(w.stores.has('other-app'));
});
test('fetch: 外部API、範囲外、POST、存在しない画面を横取りしない', async () => {
  const w = worker(); await w.lifecycle('install');
  for (const [url, mode, method] of [
    ['https://external.test/api', 'cors', 'GET'],
    ['https://example.test/other/index.html', 'navigate', 'GET'],
    ['https://example.test/XAUUSD-Calculator/missing', 'navigate', 'GET'],
    ['https://example.test/XAUUSD-Calculator/index.html', 'navigate', 'POST']
  ]) assert.equal(await w.request(url, mode, method), undefined);
});
test('ルート配置でもオフライン起動できる', async () => {
  const w = worker('https://example.test/'); await w.lifecycle('install');
  assert.equal((await w.request('https://example.test/')).cached, 'https://example.test/index.html');
});
