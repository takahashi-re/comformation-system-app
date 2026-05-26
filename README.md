# comformation-system-app

スカウト文の作成と承認・差戻しができる最小構成のアプリケーションです。

## 技術スタック

- Frontend: Vue 3 + TypeScript + Vite
- Backend: TypeScript + Express
- Database: PostgreSQL (`pg`)
- Environment: Docker Compose

## 主な機能

- スカウト文の作成
- スカウト文一覧の確認
- 承認待ちのスカウト文に対する承認
- コメント付きの差戻し

## 起動方法

### Docker を使う場合

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/scout-documents
- PostgreSQL: localhost:5432

### ローカル実行

1. PostgreSQL を起動して `DATABASE_URL` を設定する
2. backend を起動する
3. frontend を起動する

```bash
cp .env.example .env
npm --prefix backend install
npm --prefix frontend install
npm run dev:backend
npm run dev:frontend
```

## テストとビルド

```bash
npm test
npm run build
```
