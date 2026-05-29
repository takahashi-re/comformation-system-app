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
            <!-- 概要 -->
            <td>
              {{ formattedSummary(scout) }}
            </td>

            <!-- ボタン -->
            <td>
              <!-- 詳細 -->
              <button @click="goDetail(scout.id)">詳細</button>

              <!-- 営業 -->
              <button
                v-if="role === 'sales' && isEditable(scout.statusLabel)"
                @click="goEdit(scout.id)"
              >
                編集
              </button>

              <!-- 承認者 -->
              <button
                v-if="role === 'approver' && scout.status === 'PENDING_APPROVER'"
                @click="goReview(scout.id)"
              >
                承認・差戻し
              </button>

              <!-- 管理者 -->
              <button
                v-if="role === 'admin' && scout.status === 'PENDING_ADMIN'"
                @click="goReview(scout.id)"
              >
                承認・差戻し
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 営業のみ -->
      <div class="footer" v-if="role === 'sales'">
        <button class="create-btn" @click="goCreate">
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
      <div class="box" v-if="role === 'sales' || role === 'approver' || role === 'admin'">
        <div class="box-title">表示内容選択</div>
        <div class="box-body">
          <label>
            <input type="checkbox" value="company" v-model="selectedColumns" />
            会社名
          </label><br />

          <label>
            <input type="checkbox" value="job" v-model="selectedColumns" />
            職種
          </label><br />

          <label>
            <input type="checkbox" value="status" v-model="selectedColumns" />
            ステータス
          </label>

          <hr />

          <button @click="selectAll">全選択</button>
          <button @click="clearAll">全解除</button>
        </div>
      </div>

      <!-- 共通：生成文条件編集 -->
      <div v-if="role !== 'sales'" style="margin-top:20px; text-align:center;">
        <button class="create-btn" @click="goConditions">
          生成文条件編集
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchScouts } from "../../api/scoutApi";
import { getUser } from "../../api/loginApi";

const STATUS_MAP = {
  DRAFT: "下書き",
  PENDING_APPROVER: "承認者承認待ち",
  REJECTED_BY_APPROVER: "承認者差戻し",
  PENDING_ADMIN: "管理者承認待ち",
  REJECTED_BY_ADMIN: "管理者差戻し",
  AVAILABLE: "利用可能",
  SENT: "送信済み",
};

export default {
  name: "ScoutList",

  async mounted() {
    await this.loadScouts();
  },

  data() {
    return {
      positionId: getUser()?.position_id ?? 1,

      filterStatus: "",
      selectedColumns: ["company", "job", "status"],
      scouts: [],
    };
  },

  computed: {
    // ✅ ロール判定
    role() {
      if (this.positionId === 1) return "sales";
      if (this.positionId === 2) return "approver";
      if (this.positionId === 3) return "admin";
      return "";
    },

    filteredScouts() {
      if (!this.filterStatus) return this.scouts;
      return this.scouts.filter(
        (s) => s.statusLabel === this.filterStatus
      );
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
          status: row.status,
          statusLabel: STATUS_MAP[row.status] || "-",
        }));
      } catch (e) {
        console.error(e);
        this.scouts = [];
      }
    },

    // ✅ 表示まとめ
    formattedSummary(scout) {
      const parts = [];

      if (this.selectedColumns.includes("company")) {
        parts.push(`会社名：${scout.company}`);
      }
      if (this.selectedColumns.includes("job")) {
        parts.push(`職種：${scout.job}`);
      }
      if (this.selectedColumns.includes("status")) {
        parts.push(`ステータス：${scout.statusLabel}`);
      }

      return parts.join("、");
    },

    isEditable(status) {
      return ["承認者差戻し", "管理者差戻し"].includes(status);
    },

    getRowClass(status) {
      if (["承認者差戻し", "管理者差戻し"].includes(status)) {
        return "returned";
      }
      if (["利用可能", "送信済み"].includes(status)) {
        return "approved";
      }
      return "";
    },

    // ✅ 遷移
    goDetail(id) {
      this.$router.push(`/scout/${id}`);
    },

    goEdit(id) {
      this.$router.push(`/scout/${id}/edit`);
    },

    goCreate() {
      this.$router.push("/scout/create");
    },

    goReview(id) {
      this.$router.push(`/review/${id}`);
    },

    goConditions() {
      this.$router.push("/conditions");
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
}

.table th {
  background: #bfc9d6;
  padding: 8px;
}

.table td {
  padding: 8px;
  border-bottom: 1px solid #ccc;
}

.action-col {
  width: 200px;
}

.footer {
  margin-top: 10px;
  text-align: right;
}

.create-btn {
  background: #3b73a8;
  color: white;
  padding: 10px;
}

.returned {
  background: #efe2c0;
}

.approved {
  background: #cfe3cf;
}

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