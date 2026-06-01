<template>
  <div class="container">
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
          <ScoutListRow
            v-for="scout in filteredScouts"
            :key="scout.id"
            :class="getRowClass(scout.statusLabel)"
          >
            <!-- 概要 -->
            <td>
              {{ formattedSummary(scout) }}
            </td>

            <!-- ボタン -->
            <td class="action-cell">
              <!-- 詳細 -->
              <button @click="goDetail(scout.id)">詳細</button>

              <!-- 営業 -->
              <button
                v-if="role === 'sales' && isEditable(scout.statusLabel)"
                @click="goEdit(scout.id)"
              >
                編集
              </button>

              <!-- 承認・差戻し（対象ステータスのみ） -->
              <button
                v-if="canReview(scout.status)"
                @click="goReview(scout.id)"
              >
                承認・差戻し
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="footer" v-if="role === 'sales'">
        <button class="create-btn" @click="goCreate">新規作成</button>
      </div>
    </div>

    <div class="sidebar">
      <div class="box">
        <div class="box-title">filter選択</div>
        <div class="box-body">
          <div class="filter-group">
            <div class="filter-group-title">ステータス</div>
            <label
              v-for="status in statusOptions"
              :key="status"
              class="filter-check"
            >
              <input type="checkbox" :value="status" v-model="filterStatuses" />
              {{ status }}
            </label>
          </div>

          <div class="filter-group">
            <div class="filter-group-title">会社名</div>
            <label
              v-for="company in companies"
              :key="company"
              class="filter-check"
            >
              <input
                type="checkbox"
                :value="company"
                v-model="filterCompanies"
              />
              {{ company }}
            </label>
          </div>

          <div class="filter-group">
            <div class="filter-group-title">職種</div>
            <label v-for="job in jobs" :key="job" class="filter-check">
              <input type="checkbox" :value="job" v-model="filterJobs" />
              {{ job }}
            </label>
          </div>

          <button @click="clearFilters">フィルタ全解除</button>
        </div>
      </div>

      <div
        class="box"
        v-if="role === 'sales' || role === 'approver' || role === 'admin'"
      >
        <div class="box-title">表示内容選択</div>
        <div class="box-body">
          <label>
            <input type="checkbox" value="company" v-model="selectedColumns" />
            会社名 </label
          ><br />

          <label>
            <input type="checkbox" value="job" v-model="selectedColumns" />
            職種 </label
          ><br />

          <label>
            <input type="checkbox" value="status" v-model="selectedColumns" />
            ステータス
          </label>

          <hr />

          <button @click="selectAll">全選択</button>
          <button @click="clearAll">全解除</button>
        </div>
      </div>

      <div
        v-if="role === 'approver' || role === 'admin'"
        style="margin-top: 20px; text-align: center"
      >
        <button class="create-btn" @click="goConditions">生成文条件編集</button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchScouts } from "../../api/scoutApi";
import { useLoginStore } from "../../store/login.Store";
import ScoutListRow from "../../components/scout/ScoutListRow.vue";

const STATUS_MAP = {
  DRAFT: "下書き",
  PENDING_APPROVER: "承認者承認待ち",
  REJECTED_BY_APPROVER: "承認者差戻し",
  PENDING_ADMIN: "管理者承認待ち",
  REJECTED_BY_ADMIN: "管理者差戻し",
  AVAILABLE: "利用可能",
  SENT: "利用可能",
};

export default {
  name: "ScoutList",
  components: {
    ScoutListRow,
  },

  async mounted() {
    await this.loadScouts();
    this.applyFiltersFromRoute();
  },

  watch: {
    "$route.query": {
      deep: true,
      handler() {
        this.applyFiltersFromRoute();
      },
    },
  },

  data() {
    return {
      loginStore: useLoginStore(),
      filterStatuses: [],
      filterCompanies: [],
      filterJobs: [],
      selectedColumns: ["company", "job", "status"],
      scouts: [],
    };
  },

  computed: {
    positionId() {
      return this.loginStore.user?.position_id ?? 1;
    },
    role() {
      if (this.positionId === 1) return "sales";
      if (this.positionId === 2) return "approver";
      if (this.positionId === 3) return "admin";
      return "";
    },

    statusOptions() {
      return [
        "下書き",
        "承認者承認待ち",
        "承認者差戻し",
        "管理者承認待ち",
        "管理者差戻し",
        "利用可能",
      ];
    },

    filteredScouts() {
      return this.scouts.filter((s) => {
        const routeScope = this.$route.query.scope === "mine" ? "mine" : "all";
        const mineMatched =
          routeScope !== "mine" ||
          this.positionId !== 1 ||
          s.creator === this.loginStore.user?.employee_id;
        const statusMatched =
          this.filterStatuses.length === 0 ||
          this.filterStatuses.includes(s.statusLabel);
        const companyMatched =
          this.filterCompanies.length === 0 ||
          this.filterCompanies.includes(s.company);
        const jobMatched =
          this.filterJobs.length === 0 || this.filterJobs.includes(s.job);

        return mineMatched && statusMatched && companyMatched && jobMatched;
      });
    },

    companies() {
      const set = new Set(this.scouts.map((s) => s.company).filter(Boolean));
      return Array.from(set);
    },
    jobs() {
      const set = new Set(this.scouts.map((s) => s.job).filter(Boolean));
      return Array.from(set);
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

    toGenderLabel(gender) {
      const normalized = String(gender ?? "").trim().toLowerCase();
      if (["male", "m", "男性"].includes(normalized)) return "男性";
      if (["female", "f", "女性"].includes(normalized)) return "女性";
      if (["other", "others", "non-binary", "その他"].includes(normalized)) {
        return "その他";
      }
      return "不明";
    },

    toAgeGroup(age) {
      const raw = String(age ?? "").trim();
      const decadeText = raw.match(/^(\d{2})代$/);
      if (decadeText) {
        return `${decadeText[1]}代`;
      }
      const n = Number(age);
      if (!Number.isFinite(n) || n <= 0) return "不明";
      const d = Math.floor(n / 10) * 10;
      return `${d}代`;
    },

    isEditable(status) {
      return ["下書き", "承認者差戻し", "管理者差戻し"].includes(status);
    },

    canReview(status) {
      const canAccessReview = this.role === "approver" || this.role === "admin";
      return canAccessReview && ["PENDING_APPROVER", "REJECTED_BY_ADMIN"].includes(status);
    },

    getRowClass(status) {
      if (["承認者差戻し", "管理者差戻し"].includes(status)) {
        return "returned";
      }
      if (["利用可能"].includes(status)) {
        return "approved";
      }
      return "";
    },

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
      this.$router.push({ name: "conditions" });
    },

    selectAll() {
      this.selectedColumns = ["company", "job", "status"];
    },

    clearAll() {
      this.selectedColumns = [];
    },

    clearFilters() {
      this.filterStatuses = [];
      this.filterCompanies = [];
      this.filterJobs = [];
    },

    applyFiltersFromRoute() {
      const toList = (value) => {
        if (Array.isArray(value)) {
          return value
            .flatMap((v) => String(v).split(","))
            .map((v) => v.trim())
            .filter(Boolean);
        }
        if (typeof value === "string") {
          return value
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
        }
        return [];
      };

      this.filterStatuses = toList(this.$route.query.statuses);
      this.filterCompanies = toList(this.$route.query.companies);
      this.filterJobs = toList(this.$route.query.jobs);
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
  border-left: 1px solid #e0e4ea;
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

.footer {
  margin-top: 10px;
  text-align: right;
}

.create-btn {
  background: #3b73a8;
  color: white;
  padding: 10px;
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

.filter-group {
  margin-bottom: 12px;
}

.filter-group-title {
  font-weight: bold;
  margin-bottom: 6px;
}

.filter-check {
  display: block;
  margin-bottom: 4px;
}
/* --- テーブル幅だけ拡大 --- */
.main {
  flex: 4;
  min-width: 900px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}
</style>
