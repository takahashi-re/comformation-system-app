<template>
  <div class="container">
    <!-- 左メイン -->
    <div class="main">
      <div class="title">
        スカウト文一覧（表示件数: {{ filteredScouts.length }}件）
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>フィルタリング概要</th>
            <th class="action-col">操作</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="scout in filteredScouts"
            :key="scout.id"
            :class="getRowClass(scout.statusLabel)"
          >
            <td>
              <span v-if="selectedColumns.includes('company')">
                会社名：{{ scout.company }}
              </span>

              <span v-if="selectedColumns.includes('job')">
                {{ selectedColumns.includes('company') ? '、' : '' }}職種：{{ scout.job }}
              </span>

              <span v-if="selectedColumns.includes('status')">
                {{ selectedColumns.includes('company') || selectedColumns.includes('job') ? '、' : '' }}ステータス：{{ scout.statusLabel }}
              </span>
            </td>

            <td>
              <button @click="onDetailClick(scout.id)">詳細</button>

              <button
                v-if="isEditable(scout.statusLabel)"
                @click="onEditClick(scout.id)"
              >
                編集
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <button class="create-btn" @click="onCreateClick">
          新規作成
        </button>
      </div>
    </div>

    <!-- 右サイド -->
    <div class="sidebar">
      <!-- filter -->
      <div class="box">
        <div class="box-title">filter選択</div>
        <div class="box-body">
          <select v-model="filterStatus">
            <option value="">すべて</option>
            <option value="下書き">下書き</option>
            <option value="承認者承認待ち">承認者承認待ち</option>
            <option value="承認者差戻し">承認者差戻し</option>
            <option value="管理者承認待ち">管理者承認待ち</option>
            <option value="管理者差戻し">管理者差戻し</option>
            <option value="利用可能">利用可能</option>
            <option value="送信済み">送信済み</option>
          </select>
        </div>
      </div>

      <!-- 表示内容選択 -->
      <div class="box">
        <div class="box-title">表示内容選択</div>
        <div class="box-body">
          <label>
            <input type="checkbox" value="company" v-model="selectedColumns" />
            会社名
          </label>
          <br />

          <label>
            <input type="checkbox" value="job" v-model="selectedColumns" />
            職種
          </label>
          <br />

          <label>
            <input type="checkbox" value="status" v-model="selectedColumns" />
            ステータス
          </label>

          <hr />

          <button @click="selectAll">全選択</button>
          <button @click="clearAll">全解除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchScouts } from "../../api/scoutApi";

export default {
  name: "ScoutList",

  async mounted() {
    await this.loadScouts();
  },

  data() {
    return {
      filterStatus: "",
      selectedColumns: ["company", "job", "status"],
      scouts: [],
    };
  },

  computed: {
    filteredScouts() {
      if (!this.filterStatus) return this.scouts;
      return this.scouts.filter((s) => s.statusLabel === this.filterStatus);
    },
  },

  methods: {
    async loadScouts() {
      try {
        const rows = await fetchScouts();
        this.scouts = rows.map((row) => ({
          id: row.id,
          company: row.company_name || "-",
          job: row.job_title || "-",
          status: row.status || "",
          statusLabel: this.toDisplayStatus(row.status),
        }));
      } catch (error) {
        console.error("スカウト一覧の取得に失敗しました", error);
        this.scouts = [];
      }
    },

    toDisplayStatus(status) {
      const statusMap = {
        DRAFT: "下書き",
        PENDING_APPROVER: "承認者承認待ち",
        REJECTED_BY_APPROVER: "承認者差戻し",
        PENDING_ADMIN: "管理者承認待ち",
        REJECTED_BY_ADMIN: "管理者差戻し",
        AVAILABLE: "利用可能",
        SENT: "送信済み",
      };

      return statusMap[status] || status || "-";
    },

    isEditable(statusLabel) {
      return statusLabel === "承認者差戻し" || statusLabel === "管理者差戻し";
    },

    onDetailClick(id) {
      console.log("詳細:", id);
    },
    onEditClick(id) {
      console.log("編集:", id);
    },
    onCreateClick() {
      console.log("新規作成");
    },
    getRowClass(statusLabel) {
      if (statusLabel === "承認者差戻し" || statusLabel === "管理者差戻し") {
        return "returned";
      }
      if (statusLabel === "利用可能" || statusLabel === "送信済み") {
        return "approved";
      }
      return "";
    },
    selectAll() {
      this.selectedColumns = ["company", "job", "status"];
    },
    clearAll() {
      this.selectedColumns = [];
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f5f5f5;
}

.main {
  flex: 3;
}

.sidebar {
  flex: 1;
}

.title {
  background: #3b73a8;
  color: white;
  padding: 10px;
  font-weight: bold;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.table th {
  background: #bfc9d6;
  text-align: left;
  padding: 8px;
}

.table td {
  padding: 8px;
  border-bottom: 1px solid #ccc;
}

.action-col {
  width: 150px;
}

button {
  margin-right: 5px;
}

.footer {
  margin-top: 15px;
  text-align: right;
}

.create-btn {
  background: #3b73a8;
  color: white;
  padding: 10px 20px;
}

/* 行色 */
.returned {
  background: #efe2c0;
}

.approved {
  background: #cfe3cf;
}

/* サイドバー */
.box {
  margin-bottom: 20px;
  border: 1px solid #ccc;
}

.box-title {
  background: #3b73a8;
  color: white;
  padding: 10px;
}

.box-body {
  padding: 10px;
}
</style>