# comformation-system-app

スカウト文の作成と承認・差戻しができる最小構成のアプリケーションです。

## 技術スタック

- Frontend: Vue 3 + TypeScript + Vite
- Backend: Node.js + NestJS
- Database: PostgreSQL (`pg`)
- Development Support: GitHub Copilot
- Environment: Docker Compose

## 主な機能

- スカウト文の作成
- スカウト文一覧の確認
- 承認待ちのスカウト文に対する承認
- コメント付きの差戻し

## 起動方法

### 初回セットアップ

```bash
cp .env.example .env
```

### Docker を使う場合

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/scout-documents
- PostgreSQL: localhost:5432

### ローカル実行

Docker 運用のみを想定しています。ローカルの `npm install` は不要です。

```bash
docker compose up --build
```

## GitHub Copilot の利用

VS Code で次の拡張を有効にすると、実装・補完・チャットによる開発支援を利用できます。

- GitHub Copilot
- GitHub Copilot Chat

## テストとビルド

```bash
docker compose build
```
