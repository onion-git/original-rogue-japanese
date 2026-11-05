<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d000e27c-96ab-4e49-830b-f473a95bed2f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Windowsでの起動

1. ZIPをフォルダーにすべて展開します。
2. Node.js が未導入の場合は [Node.js の公式サイト](https://nodejs.org/) から LTS 版をインストールします。
3. フォルダー内の **「ゲームを起動.bat」** をダブルクリックします。

初回は必要な部品を自動で準備してから、ブラウザーでゲームを開きます。次回からは同じファイルをダブルクリックするだけで起動します。終了するには起動時に開いた黒い画面を閉じてください。

## Windows one-click launch

Extract the ZIP, then double-click `StartGame.bat`. Node.js LTS must be installed. The first launch installs the required packages; later launches start the game directly. Close the command window to stop the game.
