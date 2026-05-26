import "reflect-metadata";
import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const port = Number(process.env.PORT || 3000);

  app.use(helmet());
  app.enableCors({ origin: frontendOrigin });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
