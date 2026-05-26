import request from "supertest";
import { describe, expect, it } from "vitest";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module";
import { InMemoryScoutDocumentStore } from "./inMemoryStore";
import { SCOUT_DOCUMENT_STORE } from "./database/database.constants";

describe("scout document workflow API", () => {
  const buildApp = async (): Promise<INestApplication> => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SCOUT_DOCUMENT_STORE)
      .useValue(new InMemoryScoutDocumentStore())
      .compile();

    const app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();
    return app;
  };

  it("creates and lists scout documents", async () => {
    const app = await buildApp();

    const createResponse = await request(app.getHttpServer())
      .post("/api/scout-documents")
      .send({
        candidateName: "山田 花子",
        scoutTitle: "バックエンドエンジニア募集",
        scoutBody: "技術ブログと TypeScript 経験を拝見し、ご連絡しました。",
        createdBy: "採用担当A",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.status).toBe("pending");

    const listResponse = await request(app.getHttpServer()).get(
      "/api/scout-documents",
    );

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({
      candidateName: "山田 花子",
      scoutTitle: "バックエンドエンジニア募集",
      createdBy: "採用担当A",
    });

    await app.close();
  });

  it("approves and returns scout documents", async () => {
    const app = await buildApp();

    const created = await request(app.getHttpServer())
      .post("/api/scout-documents")
      .send({
        candidateName: "佐藤 太郎",
        scoutTitle: "フロントエンドエンジニア募集",
        scoutBody: "Vue 3 の実績を見てスカウトをお送りします。",
        createdBy: "採用担当B",
      });

    const approveResponse = await request(app.getHttpServer())
      .patch(`/api/scout-documents/${created.body.id}/decision`)
      .send({
        action: "approve",
        comment: "送信して問題ありません。",
        decidedBy: "部門責任者",
      });

    expect(approveResponse.status).toBe(200);
    expect(approveResponse.body.status).toBe("approved");
    expect(approveResponse.body.decidedBy).toBe("部門責任者");

    const secondCreated = await request(app.getHttpServer())
      .post("/api/scout-documents")
      .send({
        candidateName: "高橋 次郎",
        scoutTitle: "データエンジニア募集",
        scoutBody: "プロフィールの分析基盤経験に魅力を感じています。",
        createdBy: "採用担当C",
      });

    const returnResponse = await request(app.getHttpServer())
      .patch(`/api/scout-documents/${secondCreated.body.id}/decision`)
      .send({
        action: "return",
        comment: "候補者への訴求を具体化してください。",
        decidedBy: "部門責任者",
      });

    expect(returnResponse.status).toBe(200);
    expect(returnResponse.body.status).toBe("returned");
    expect(returnResponse.body.decisionComment).toContain("具体化");

    await app.close();
  });
});
