@echo off
setlocal
cd /d "%~dp0"
chcp 932 >nul
title 元祖ローグ 日本語版

:: Node.js のチェック
where node >nul 2>nul
if errorlevel 1 (
    echo 【エラー】Node.js が見つかりません。
    echo https://nodejs.org から Node.js LTS をインストールしてください。
    pause
    exit /b 1
)

:: 初回起動時のインストール
if not exist "node_modules\vite\bin\vite.js" (
    echo 初回起動の準備をしています。少しお待ちください...
    call npm install
    if errorlevel 1 (
        echo 【エラー】npm install に失敗しました。
        pause
        exit /b 1
    )
)

echo ゲームを起動しています。終了するときはこの黒い画面を閉じてください。
call npm run dev -- --open
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" pause
endlocal & exit /b %EXIT_CODE%