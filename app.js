'use strict';
const form = document.getElementById('calculator');
const $ = id => document.getElementById(id);
const format = (v, decimals = 0) => new Intl.NumberFormat('ja-JP', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
const signed = (v, decimals = 0) => { const rounded = Number(v.toFixed(decimals)); return (rounded > 0 ? '+' : rounded < 0 ? '−' : '') + format(Math.abs(rounded), decimals); };
function update() {
  const values = Object.fromEntries(new FormData(form));
  const result = GoldCalculator.calculate(values);
  for (const key of ['entry', 'exit', 'lots', 'rate', 'stop', 'ounces']) {
    $(key + '-error').textContent = result.errors?.[key] ?? '';
    $(key).setAttribute('aria-invalid', result.errors?.[key] ? 'true' : 'false');
  }
  $('general-error').textContent = result.errors?.general ?? '';
  $('formula-direction').textContent = values.side === 'BUY' ? '決済価格 − エントリー価格' : 'エントリー価格 − 決済価格';
  $('contract-summary').textContent = `1 LOT = ${values.ounces || '—'} oz`;
  $('yen').className = 'yen' + (result.ok ? (result.yen > 0 ? ' positive' : result.yen < 0 ? ' negative' : '') : '');
  $('yen').textContent = result.ok ? signed(result.yen) : '—';
  const suffix = document.createElement('span'); suffix.textContent = ' 円'; $('yen').append(suffix);
  $('result-status').textContent = !result.ok ? '入力を確認' : result.yen > 0 ? '利益' : result.yen < 0 ? '損失' : '損益なし';
  $('result-status').style.color = result.ok && result.yen < 0 ? 'var(--red)' : '';
  $('usd').textContent = result.ok ? `${signed(result.usd, 2)} USD` : '有効な取引条件を入力してください';
  $('quantity').textContent = result.ok ? `${format(result.quantity, 4)} oz` : '—';
  $('delta').textContent = result.ok ? `${signed(result.delta, 2)} USD` : '—';
  $('applied-rate').textContent = result.ok ? `${format(Number(values.rate), 4)} JPY / USD` : '—';
  $('loss').textContent = result.ok && result.lossYen !== null ? `${format(result.lossYen)} 円` : '—';
  $('loss-usd').textContent = !result.ok ? '入力値を確認してください' : result.lossUsd === null ? '損切り価格を入力すると表示されます' : `${format(result.lossUsd, 2)} USD`;
  if (result.errors?.ounces) form.querySelector('details').open = true;
}
form.addEventListener('input', update);
form.addEventListener('change', update);
form.addEventListener('submit', event => { event.preventDefault(); update(); form.querySelector('[aria-invalid="true"]')?.focus(); });
form.addEventListener('reset', () => setTimeout(update, 0));
update();
