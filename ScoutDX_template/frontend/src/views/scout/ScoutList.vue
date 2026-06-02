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
            :scout="scout"
            :role="role"
            :current-user-id="loginStore.user?.employee_id || ''"
            :selected-columns="selectedColumns"
            :row-class="getRowClass(scout.statusLabel)"
            @detail="goDetail"
            @edit="goEdit"
            @review="goReview"
          />
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

          <div v-if="role === 'sales'" class="filter-group">
            <div class="filter-group-title">担当者</div>
            <label class="filter-check">
              <input type="checkbox" value="mine" v-model="filterOwners" />
              自分
            </label>
            <label class="filter-check">
              <input type="checkbox" value="others" v-model="filterOwners" />
              他の担当者
            </label>
          </div>

          <button
            class="toggle-advanced"
            @click="showAdvancedFilters = !showAdvancedFilters"
          >
            {{ showAdvancedFilters ? "詳細検索を閉じる" : "詳細検索" }}
          </button>

          <div v-if="showAdvancedFilters" class="filter-group">
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

          <div v-if="showAdvancedFilters" class="filter-group">
            <div class="filter-group-title">職種</div>
            <label v-for="job in jobs" :key="job" class="filter-check">
              <input type="checkbox" :value="job" v-model="filterJobs" />
              {{ job }}
            </label>
          </div>

          <div v-if="showAdvancedFilters" class="filter-group">
            <div class="filter-group-title">求職者 性別</div>
            <label
              v-for="gender in genderOptions"
              :key="gender"
              class="filter-check"
            >
              <input type="checkbox" :value="gender" v-model="filterGenders" />
              {{ gender }}
            </label>
          </div>

          <div v-if="showAdvancedFilters" class="filter-group">
            <div class="filter-group-title">求職者 年代</div>
            <label
              v-for="ageGroup in ageGroupOptions"
              :key="ageGroup"
              class="filter-check"
            >
              <input
                type="checkbox"
                :value="ageGroup"
                v-model="filterAgeGroups"
              />
              {{ ageGroup }}
            </label>
          </div>

          <div v-if="showAdvancedFilters" class="filter-group">
            <div class="filter-group-title">最終更新日からの経過日数</div>
            <div class="filter-check" style="align-items: center; gap: 6px">
              <input
                type="number"
                min="0"
                step="1"
                v-model.number="updatedDays"
                placeholder="n 日"
                style="width: 96px"
              />
              日以上
            </div>
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

          <label>
            <input type="checkbox" value="creator" v-model="selectedColumns" />
            制作者
          </label>

          <label>
            <input type="checkbox" value="reviewer" v-model="selectedColumns" />
            最新承認/差戻し者
          </label>

          <label>
            <input type="checkbox" value="age" v-model="selectedColumns" />
            年齢
          </label>

          <label>
            <input type="checkbox" value="gender" v-model="selectedColumns" />
            性別
          </label>

          <label>
            <input
              type="checkbox"
              value="updatedAt"
              v-model="selectedColumns"
            />
            最終更新日
          </label>

          <hr />

          <button @click="selectAll">全選択</button>
          <button @click="clearAll">全解除</button>
        </div>
      </div>

      <div v-if="role === 'admin'" style="margin-top: 20px; text-align: center">
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
  REJECTED_BY_ADMIN_TO_APPROVER: "管理者差戻し",
  REJECTED_BY_ADMIN_TO_ADMIN: "管理者差戻し",
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
      filterGenders: [],
      filterAgeGroups: [],
      filterOwners: [],
      updatedDays: "",
      showAdvancedFilters: false,
      selectedColumns: ["company", "job", "status", "reviewer"],
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
        const myId = this.loginStore.user?.employee_id;
        const ownerMatched = (() => {
          if (this.positionId !== 1) return true;
          if (this.filterOwners.length === 0) return true;
          const isMine = s.creator === myId;
          return (
            (this.filterOwners.includes("mine") && isMine) ||
            (this.filterOwners.includes("others") && !isMine)
          );
        })();
        const statusMatched =
          this.filterStatuses.length === 0 ||
          this.filterStatuses.includes(s.statusLabel);
        const companyMatched =
          this.filterCompanies.length === 0 ||
          this.filterCompanies.includes(s.company);
        const jobMatched =
          this.filterJobs.length === 0 || this.filterJobs.includes(s.job);
        const genderMatched =
          this.filterGenders.length === 0 ||
          this.filterGenders.includes(this.toGenderLabel(s.job_seeker_gender));
        const ageMatched =
          this.filterAgeGroups.length === 0 ||
          this.filterAgeGroups.includes(this.toAgeGroup(s.job_seeker_age));
        const updatedMatched = (() => {
          const days = this.updatedDaysNumber;
          if (days === null) return true;
          if (!s.updatedAt) return false;
          return this.getDaysSinceUpdated(s.updatedAt) >= days;
        })();

        return (
          ownerMatched &&
          statusMatched &&
          companyMatched &&
          jobMatched &&
          genderMatched &&
          ageMatched &&
          updatedMatched
        );
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
    genderOptions() {
      const set = new Set(
        this.scouts
          .map((s) => this.toGenderLabel(s.job_seeker_gender))
          .filter((gender) => gender !== "不明"),
      );
      return Array.from(set);
    },
    ageGroupOptions() {
      return ["10代", "20代", "30代", "40代", "50代", "60代", "70代"];
    },
    updatedDaysNumber() {
      const value = Number(this.updatedDays);
      return Number.isFinite(value) && value >= 0 ? value : null;
    },
  },

  methods: {
    async loadScouts() {
      try {
        const rows = await fetchScouts();
        this.scouts = rows.map((row) => ({
          id: row.id,
          creator: row.creator || "",
          company: row.company_name || "-",
          job: row.job_title || "-",
          status: row.status,
          statusLabel: STATUS_MAP[row.status] || "-",
          job_seeker_age: row.job_seeker_age ?? null,
          job_seeker_gender: row.job_seeker_gender ?? "",
          reviewerName:
            row.reviewer_name ||
            row.returned_by_name ||
            row.updated_by_name ||
            "-",
          updatedAt: row.updatedAt ?? row.updated_at ?? "",
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
      if (this.selectedColumns.includes("reviewer")) {
        parts.push(`最新承認/差戻し者：${scout.reviewerName || "-"}`);
      }
      if (this.selectedColumns.includes("age")) {
        parts.push(`年齢：${this.formatAge(scout.job_seeker_age)}`);
      }
      if (this.selectedColumns.includes("gender")) {
        parts.push(`性別：${this.toGenderLabel(scout.job_seeker_gender)}`);
      }
      if (this.selectedColumns.includes("updatedAt")) {
        parts.push(`最終更新日：${this.formatDate(scout.updatedAt)}`);
      }

      return parts.join("、");
    },

    formatAge(age) {
      const n = Number(age);
      if (!Number.isFinite(n) || n <= 0) return "-";
      return `${n}歳`;
    },

    formatDate(value) {
      const date = new Date(value);
      if (!date || Number.isNaN(date.getTime())) return "-";
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}/${m}/${d}`;
    },

    toGenderLabel(gender) {
      const normalized = String(gender ?? "")
        .trim()
        .toLowerCase();
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

    getDaysSinceUpdated(updatedAt) {
      const date = new Date(updatedAt);
      if (!date || Number.isNaN(date.getTime())) return Infinity;
      const diffMs = Date.now() - date.getTime();
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    },

    isEditable(status) {
      return ["下書き", "承認者差戻し", "管理者差戻し"].includes(status);
    },

    canReview(status) {
      const canAccessReview = this.role === "approver" || this.role === "admin";
      return (
        canAccessReview &&
        ["PENDING_APPROVER", "REJECTED_BY_ADMIN_TO_APPROVER"].includes(status)
      );
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
      if (this.role !== "admin") return;
      this.$router.push({ name: "conditions" });
    },

    selectAll() {
      this.selectedColumns = [
        "company",
        "job",
        "status",
        "creator",
        "reviewer",
        "age",
        "gender",
        "updatedAt",
      ];
    },

    clearAll() {
      this.selectedColumns = [];
    },

    clearFilters() {
      this.filterStatuses = [];
      this.filterCompanies = [];
      this.filterJobs = [];
      this.filterGenders = [];
      this.filterAgeGroups = [];
      this.filterOwners = [];
      this.updatedDays = "";
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
      this.filterGenders = toList(this.$route.query.genders);
      this.filterAgeGroups = toList(this.$route.query.ageGroups);
      this.filterOwners = toList(this.$route.query.owners);
      this.updatedDays = String(this.$route.query.updatedDays || "");

      if (this.role === "sales" && this.filterOwners.length === 0) {
        const routeScope = this.$route.query.scope === "mine" ? "mine" : "all";
        if (routeScope === "mine") {
          this.filterOwners = ["mine"];
        }
      }

      this.showAdvancedFilters =
        this.filterCompanies.length > 0 ||
        this.filterJobs.length > 0 ||
        this.filterGenders.length > 0 ||
        this.filterAgeGroups.length > 0 ||
        this.updatedDays !== "";
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 48px 24px 64px;
  background: #f9fafb;
}

.main {
  flex: 3;
  min-width: 0;
}

.sidebar {
  flex: 1;
  min-width: 280px;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  padding: 0 0 20px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
  letter-spacing: -0.01em;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.table th {
  background: #f9fafb;
  padding: 14px 16px;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  letter-spacing: -0.01em;
}

.table th.action-col {
  width: 280px;
  text-align: center;
}

.table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.6;
}

.table tbody tr {
  transition: background-color 0.15s ease;
}

.table tbody tr:hover {
  background: #f9fafb;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.returned {
  background: #fef3c7 !important;
}

.returned:hover {
  background: #fde68a !important;
}

.approved {
  background: #d1fae5 !important;
}

.approved:hover {
  background: #a7f3d0 !important;
}

.footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  text-align: right;
}

.create-btn {
  min-width: 140px;
  padding: 11px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  border: 1.5px solid #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  background: #374151;
  color: #ffffff;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.08);
}

.create-btn:hover {
  background: #1f2937;
  border-color: #1f2937;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

.create-btn:active {
  background: #111827;
}

.box {
  margin-bottom: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.box-title {
  background: #475569;
  color: white;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.01em;
}

.box-body {
  padding: 16px;
}

.box-body label {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  margin-bottom: 12px;
  cursor: pointer;
  transition: color 0.15s ease;
}

.box-body label:hover {
  color: #1f2937;
}

.box-body input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #374151;
}

/* フィルターグループ */
.filter-group {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.filter-group:last-of-type {
  border-bottom: none;
  margin-bottom: 16px;
}

.filter-group-title {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.filter-check {
  display: flex !important;
  align-items: center;
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
  margin-bottom: 10px !important;
  padding: 4px 0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-check:hover {
  color: #1f2937;
  padding-left: 4px;
}

.filter-check:last-child {
  margin-bottom: 0 !important;
}

.box-body hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 16px 0;
}

.box-body button {
  min-width: 80px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  border: 1.5px solid #d1d5db;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  background: #ffffff;
  color: #374151;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  margin-right: 8px;
  margin-bottom: 0;
}

.box-body button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.box-body button:active {
  background: #f3f4f6;
}

.box-body > button:only-of-type,
.box-body > button:last-of-type {
  margin-right: 0;
}

.toggle-advanced {
  width: 100%;
  margin-bottom: 16px;
}

.sidebar > div:last-child {
  text-align: center;
}

/* レスポンシブ対応 */
@media (max-width: 1200px) {
  .container {
    flex-direction: column;
  }

  .main {
    min-width: 0;
  }

  .sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .sidebar > div:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 32px 16px 48px;
    gap: 20px;
  }

  .title {
    font-size: 18px;
    padding-bottom: 16px;
    margin-bottom: 20px;
  }

  .table {
    font-size: 13px;
  }

  .table th {
    padding: 12px;
    font-size: 12px;
  }

  .table td {
    padding: 12px;
    font-size: 13px;
  }

  .sidebar {
    grid-template-columns: 1fr;
  }

  .box-body button {
    width: calc(50% - 4px);
    margin-right: 0;
  }

  .box-body button:first-of-type {
    margin-right: 8px;
  }

  .filter-group-title {
    font-size: 11px;
  }

  .filter-check {
    font-size: 12px;
    margin-bottom: 8px !important;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 24px 12px 40px;
  }

  .title {
    font-size: 16px;
  }

  .table {
    font-size: 12px;
  }

  .box-title {
    padding: 10px 14px;
    font-size: 13px;
  }

  .box-body {
    padding: 14px;
  }

  .box-body button {
    width: 100%;
    margin-right: 0 !important;
    margin-bottom: 8px;
  }

  .box-body button:last-child {
    margin-bottom: 0;
  }
}
</style>
