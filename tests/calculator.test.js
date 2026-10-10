const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('../calculator.js');
const base = { side: 'BUY', entry: '4000', exit: '4015', lots: '0.1', rate: '150', ounces: '100', stop: '3990' };
const calc = changes => calculate({ ...base, ...changes });
test('指定例 BUY +22,500円 / 損切り15,000円', () => { const r = calc({}); assert.equal(r.yen, 22500); assert.equal(r.usd, 150); assert.equal(r.quantity, 10); assert.equal(r.lossYen, 15000); });
test('SELL利益と損切り', () => { const r = calc({ side: 'SELL', exit: '3985', stop: '4010' }); assert.equal(r.yen, 22500); assert.equal(r.lossYen, 15000); });
test('BUY損失', () => assert.equal(calc({ exit: '3985' }).yen, -22500));
test('SELL損失', () => assert.equal(calc({ side: 'SELL', stop: '4010' }).yen, -22500));
test('同値決済と同値損切り', () => { const r = calc({ exit: '4000', stop: '4000' }); assert.equal(r.yen, 0); assert.equal(r.lossYen, 0); });
test('契約数量変更', () => assert.equal(calc({ ounces: '10' }).yen, 2250));
test('小数価格・ロット・レート', () => { const r = calc({ entry: '4000.25', exit: '4001.75', lots: '0.03', rate: '149.5' }); assert.equal(r.yen, 672.75); });
test('損切りは任意', () => { for (const stop of ['', ' ', undefined, null]) { const r = calc({ stop }); assert.equal(r.ok, true); assert.equal(r.lossYen, null); } });
for (const key of ['entry', 'exit', 'lots', 'rate', 'ounces']) {
  test(`${key}: 空欄・ゼロ・負数・非数・無限大・不正文字列を拒否`, () => { for (const value of ['', ' ', 0, -1, NaN, Infinity, 'abc', '1,000', '0x10', '1e3']) { const r = calc({ [key]: value }); assert.equal(r.ok, false); assert.ok(r.errors[key]); } });
}
test('損切りのゼロ・負数・非数を拒否', () => { for (const stop of [0, -1, 'abc', Infinity]) assert.ok(calc({ stop }).errors.stop); });
test('方向と逆の損切り価格を拒否', () => { assert.ok(calc({ stop: '4001' }).errors.stop); assert.ok(calc({ side: 'SELL', stop: '3999' }).errors.stop); });
test('不正方向を拒否', () => assert.ok(calc({ side: 'HOLD' }).errors.side));
test('計算結果のオーバーフローを拒否', () => assert.equal(calc({ lots: '9'.repeat(200), ounces: '9'.repeat(200) }).ok, false));
