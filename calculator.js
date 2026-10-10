(function (root) {
  'use strict';
  const labels = { entry: 'エントリー価格', exit: '決済価格', lots: 'ロット数', rate: 'ドル円レート', ounces: '1ロットの数量', stop: '損切り価格' };
  function calculate(values) {
    const errors = {}, n = {};
    if (!['BUY', 'SELL'].includes(values.side)) errors.side = 'BUYまたはSELLを選択してください。';
    for (const key of Object.keys(labels)) {
      const raw = values[key];
      if (key === 'stop' && (raw === undefined || raw === null || String(raw).trim() === '')) continue;
      const str = String(raw ?? '').trim();
      const value = Number(str);
      if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(str) || !Number.isFinite(value) || value <= 0) {
        errors[key] = `${labels[key]}は0より大きい数値で入力してください。`;
      } else n[key] = value;
    }
    if (!errors.entry && !errors.stop && n.stop !== undefined &&
        ((values.side === 'BUY' && n.stop > n.entry) || (values.side === 'SELL' && n.stop < n.entry))) {
      errors.stop = values.side === 'BUY' ? 'BUYの損切り価格はエントリー以下にしてください。' : 'SELLの損切り価格はエントリー以上にしてください。';
    }
    if (Object.keys(errors).length) return { ok: false, errors };
    const direction = values.side === 'BUY' ? 1 : -1;
    const quantity = n.lots * n.ounces;
    const delta = (n.exit - n.entry) * direction;
    const usd = delta * quantity;
    const yen = usd * n.rate;
    const lossUsd = n.stop === undefined ? null : Math.abs(n.stop - n.entry) * quantity;
    const lossYen = lossUsd === null ? null : lossUsd * n.rate;
    if ([quantity, delta, usd, yen, lossUsd ?? 0, lossYen ?? 0].some(v => !Number.isFinite(v) || Math.abs(v) > Number.MAX_SAFE_INTEGER)) {
      return { ok: false, errors: { general: '数値が大きすぎます。入力値を小さくしてください。' } };
    }
    return { ok: true, quantity, delta, usd, yen, lossUsd, lossYen };
  }
  root.GoldCalculator = { calculate };
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
})(typeof globalThis !== 'undefined' ? globalThis : window);
