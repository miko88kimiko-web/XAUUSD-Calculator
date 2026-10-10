# XAUUSD Calculator

ゴールド専用の日本円損益計算ツール。HTML / CSS / JavaScriptのみで動作し、外部API・外部ライブラリ・ビルド・通信は不要です。

## 使い方

`index.html` をブラウザで開いてください。BUY / SELL、価格、ロット、ドル円レートを変更すると自動で再計算します。損切り価格は任意です。契約数量の設定から1ロットの数量（初期値100トロイオンス）を変更できます。

- BUY: (決済価格 − エントリー価格) × ロット × 契約数量 × ドル円
- SELL: (エントリー価格 − 決済価格) × ロット × 契約数量 × ドル円
- 想定損失: |損切り価格 − エントリー価格| × ロット × 契約数量 × ドル円

BUY / 4000 → 4015 / 0.1ロット / 100 oz / 150円 = **+22,500円**。

正の有限数のみ受け付けます。BUYの損切りはエントリー以下、SELLはエントリー以上。無効な入力では結果を消去しエラーを表示します。損切りが同値なら想定損失0円です。日本円は表示時に整数へ四捨五入、USDは小数2桁へ丸めます。取引数量とレートの表示は小数4桁です。内部計算はJavaScriptの浮動小数点数を使用します。

手数料・スワップ・スリッページ等は含みません。為替レートは手動入力であり、入力値を保存・送信しません。

## テスト

Node.js 18以上。依存パッケージのインストールは不要です。

```sh
npm run check
npm test
```

BUY/SELLの利益・損失、損切り、ゼロ損益、数量変更、小数、任意項目、無効な入力、計算オーバーフローを検証します。GitHub Actionsでもpush / pull request時に実行します。

## GitHubへの反映

既存リポジトリへ以下のファイルを配置してコミットしてください。
`index.html`, `style.css`, `calculator.js`, `app.js`, `package.json`, `tests/`, `.github/workflows/test.yml`, `README.md`。

```sh
git add index.html style.css calculator.js app.js package.json tests .github README.md
git commit -m "Add responsive XAUUSD profit and loss calculator"
git push origin HEAD
```

GitHub Pagesを利用する場合は Settings → Pages → Deploy from a branch で対象ブランチの `/ (root)` を選択できます。
