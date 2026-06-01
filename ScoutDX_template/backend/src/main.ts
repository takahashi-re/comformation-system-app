import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Cookie パーサーミドルウェア（Cookie を req.cookies で読み取れるようにする）
  app.use(cookieParser());

  // ✅ CORS 設定（credentials を有効化）
  app.enableCors({
    //origin: '*', // 演習用のため、すべてのアクセス元を許可
    origin: 'http://localhost:5173', // フロントエンドの URL（開発環境）
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true, // ✅ Cookie を含める
  });

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  console.log(`▼ バックエンドサーバーがポート${port}で起動しました！`);
  console.log(`APIのベースURL: http://localhost:${port}/api`);
}
bootstrap();