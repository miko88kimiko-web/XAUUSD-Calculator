# XAUUSD Calculator

公開URL: https://miko88kimiko-web.github.io/XAUUSD-Calculator/

AndroidのChromeで開き、「ホーム画面に追加」からインストールできます。

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

## Android PWA（v1.1.0）

元の計算ロジック（`calculator.js`）と画面制御（`app.js`）は変更していません。既存の色・カード・入力欄を維持し、専用アイコン、インストールボタン、オフライン準備状況を追加しました。外部API・実行時ライブラリはありません。

### Androidへのインストール

1. 公開後のHTTPS URLをAndroidのChromeで開きます。ChatGPT内のブラウザではなくChromeで開いてください。
2. 画面下に「オフラインでも計算できます。」と表示されるまで待ちます。初回は通信が必要です。
3. 「ホーム画面に追加」ボタン、またはChrome右上の「︙」→「ホーム画面に追加」→「インストール」を選びます。メニュー名はChromeのバージョンにより「アプリをインストール」などの場合があります。
4. ホーム画面の「GOLD CALC」アイコンで起動します。スタンドアロン表示で計算できます。
5. 機内モードにして閉じてから再起動し、入力変更で計算結果が変わることを確認してください。

ZIPの中のHTMLを直接開くだけではPWAとしてインストールできません。HTTPSでの配信が必要です（開発PCのlocalhostは例外）。

### オフラインと更新

- Service WorkerはHTML・CSS・JS・manifest・アイコンの8ファイルを一括保存します。初回保存後はオフラインで起動・計算できます。
- 初回の入力値保存はありません。再起動・再読み込みで初期値に戻ります。元の仕様を維持しています。
- キャッシュがOSやブラウザによって削除された場合は、再度オンラインで開いて準備してください。
- 更新時は`sw.js`の`VERSION`も変更します。新旧ファイルの混在を避けるため、アプリと関連するChromeのタブをすべて閉じた後、次の起動で新しいバージョンへ切り替わります。更新取得には通信が必要です。
- キャッシュ名には配信scopeを含め、別のアプリのキャッシュを削除しません。アプリの既知ファイル以外の通信は横取りしません。
- 為替レート・契約数量は引き続き手動設定です。通信やAIへの接続は不要です。

### GitHub Pages

既存リポジトリ: https://github.com/miko88kimiko-web/XAUUSD-Calculator

GitHubのリポジトリ Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root) → Save。

GitHub Freeでは公開リポジトリのPagesが利用できます。非公開リポジトリのPagesはGitHub Pro等の対応プランが必要です。このリポジトリはユーザーの確認のもとPublicへ変更され、main / (root)からのPages公開を完了しました。

ルート・プロジェクトのサブパスのどちらにも対応するよう、manifest・アイコン・Service Workerは相対URLにしています。公開後、Pages設定に表示されるURLへアクセスして動作を確認してください。

### 構成と検証

追加: `manifest.json`, `pwa.js`, `sw.js`, `icons/icon-192.png`, `icons/icon-512.png`, `.nojekyll`, `tests/pwa.test.js`。

`npm run check`で全JSの構文、`npm test`で計算とPWAの23テストを確認できます。Service WorkerのユニットテストはCache APIのモックを使います。実ブラウザの確認結果と実機確認の範囲は`TEST_RESULTS.md`を参照してください。
