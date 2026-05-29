// scoutListApi.ts

export async function fetchScouts() {
  return [
    {
      id: "1",
      title: "営業募集",
      creator: "田中",
      body: "営業の仕事です",
      status: "未送信",
      createdAt: "2026-01-01"
    },
    {
      id: "2",
      title: "事務募集",
      creator: "佐藤",
      body: "事務の仕事です",
      status: "送信済み",
      createdAt: "2026-01-02"
    }
  ]
}

export async function createScout(data: any) {
  return {
    ...data,
    id: String(Date.now()),
    createdAt: new Date().toISOString()
  }
}

