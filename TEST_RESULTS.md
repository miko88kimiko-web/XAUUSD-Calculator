# GOLD CALC PWA 動作テスト結果

検証日: 2026-10-12 / バージョン: 1.1.0

## 正式ソースと既存機能

添付6ファイルを正式ソースとして使用。既存GitHubリポジトリのcalculator.js・app.js・style.cssも一致しました。calculator.jsとapp.jsは元ファイルとバイト単位で同一です。計算式・丸め・エラー判定・初期値・入力値を保存しない仕様を維持しています。

## 結果

| 検証 | 結果 |
|---|---|
| JavaScript構文（calculator/app/pwa/sw） | PASS |
| 既存計算テスト17件 | 全件PASS |
| PWAユニットテスト6件 | 全件PASS |
| BUY/SELLの利益・損失、損切り、任意項目、契約数量 | PASS |
| 入力エラー、エラー欄フォーカス、初期値リセット | PASS |
| スマホ幅320/360/390/412px、横向き915×412、1200px | 横はみ出しなし |
| 入力欄・計算・リセットのタッチ領域 | 高さ44px以上 |
| 192px / 512pxアイコン | PNG実寸とmaskable安全領域を確認 |
| Chromiumのmanifest解析 | エラー0 |
| Chromiumのインストール要件 | installabilityErrors 0 |
| オフライン再読み込み | PASS |
| 通信遮断後にタブを閉じて再起動（クエリ付きURL） | PASS |
| オフラインで入力変更・再計算 | PASS |
| ブラウザのJavaScript例外 | 0 |
| 他アプリのキャッシュ維持・範囲外通信 | ユニットテストPASS |

ブラウザ: Chromium 153.0.8010.0 / モバイル・タッチ設定、localhost上で実施。実ブラウザのCache API・Service Workerを使って起動後に通信を遮断しました。unit testはNode.js 24.19.0。詳細なブラウザ測定値はtests/browser-results.jsonにあります。日本語フォントは検証環境だけに補いました。アプリには外部フォント・外部ライブラリ・APIを追加していません。

## 実機・公開についての未確認範囲

Android端末そのものへのインストール、OSのホーム画面アイコン、実際のstandaloneウィンドウ表示は未実施です。manifestのdisplayはstandaloneで、Chromiumのインストール要件は通っています。Android Chromeでの最終確認はREADMEのインストール手順を参照してください。

既存リポジトリは非公開です。利用可能なGitHub接続ではPages設定の取得・変更操作が提供されていないため、Pagesの有効化と公開URLの到達確認は実施していません。GitHub Pagesの公開URLは未発行・未確認として扱います。既存リポジトリの公開範囲は変更していません。

## 再検証

依存パッケージ不要。Node.js 18以上でnpm run check / npm test。結果は23件PASSです。

## 維持した制約

損益は円表示。ドル円レートは手動入力。手数料・スワップ・スリッページは含まれません。初回のオフライン準備には通信が必要です。再読み込みで入力値は初期値に戻ります。
