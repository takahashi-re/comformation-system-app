// scoutListStore.ts

import { defineStore } from "pinia"
import { fetchScouts, createScout } from "../api/scoutListApi"
import type { ScoutEntity } from "../type/scout"

type ScoutState = {
  scouts: ScoutEntity[]
  loading: boolean
  error: string | null
}

export const useScoutStore = defineStore("scout", {
  state: (): ScoutState => ({
    scouts: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchList() {
      this.loading = true
      this.error = null

      try {
        const result = await fetchScouts()
        this.scouts = result
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : "取得エラー"
      } finally {
        this.loading = false
      }
    },

    async addScout() {
      const newData: Omit<ScoutEntity, "id" | "createdAt"> = {
        title: "新しいスカウト",
        creator: "自分",
        body: "本文",
        status: "未送信"
      }

      this.error = null
      this.loading = true

      try {
        const created = await createScout(newData)

        // 追加して画面更新
        this.scouts.push(created)
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : "作成エラー"
      } finally {
        this.loading = false
      }
    }
  }
})
