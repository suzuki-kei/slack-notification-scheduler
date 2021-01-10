# Slack Notification

...

# 前提条件

 * npm (https://www.npmjs.com/)

# 使用方法

(1) npm で依存パッケージをインストールします.

    $ npm install

(2) clasp でログインします.

    $ npm run clasp login

(3) Google Apps Script のプロジェクトを作成します.

    $ npm run clasp create -- --type sheets --title 'Slack Notification' --rootDir src

(4) clasp で push します.

    $ npm run clasp push

(5) ...

...

# 各種コマンド

clasp のヘルプを表示する:

    $ npm run clasp help

script.google.com に push する:

    $ npm run clasp status
    $ npm run clasp push

ブラウザで開く:

    $ npm run clasp open

# worklog

    # package.json を作成する.
    npm init

    # clasp をインストールする.
    npm install @google/clasp

