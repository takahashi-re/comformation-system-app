<template>
  <section class="dashboard">
    <header class="title-bar">
      <h1>{{ title }}</h1>
      <div class="header-actions">
        <div
          v-if="isSales"
          class="scope-toggle"
          role="group"
          aria-label="表示範囲切り替え"
        >
          <button
            type="button"
            :class="{ active: scope === 'mine' }"
            @click="scope = 'mine'"
          >
            自分のみ
          </button>
          <button
            type="button"
            :class="{ active: scope === 'all' }"
            @click="scope = 'all'"
          >
            全体
          </button>
        </div>

        <button class="goto-list" type="button" @click="goToScoutList()">
          スカウト一覧へ
        </button>
      </div>
    </header>

    <div class="status-grid">
      <button
        v-for="card in statusCards"
        :key="card.key"
        type="button"
        class="status-card"
        :class="card.color"
        @click="goToScoutList(card.filterLabel)"
      >
        <div class="status-label">{{ card.label }}</div>
        <div class="status-count">{{ card.count }}件</div>
      </button>
    </div>

    <div class="metrics-grid">
      <article class="metric-card">
        <h2>業務滞留メトリクス</h2>
        <div v-for="item in stallMetrics" :key="item.label" class="metric-row">
          <div class="row-head">
            <span>{{ item.label }}</span>
            <span>{{ item.count }}件</span>
          </div>
          <div class="bar-track">
            <div
              class="bar-fill bar-blue"
              :style="getBarWidthStyle(item.count, maxStallCount)"
            ></div>
          </div>
        </div>
      </article>

      <article class="metric-card">
        <h2>差戻し理由メトリクス</h2>
        <div v-for="item in reasonMetrics" :key="item.label" class="metric-row">
          <div class="row-head">
            <span>{{ item.label }}</span>
            <span>{{ item.count }}件</span>
          </div>
          <div class="bar-track">
            <div
              class="bar-fill"
              :class="item.colorClass"
              :style="getBarWidthStyle(item.count, maxReasonCount)"
            ></div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useLoginStore } from "../../store/login.Store";
import { fetchScoutDetail, fetchScouts } from "../../api/scoutApi";
import type { ScoutEntity } from "../../type/scout";
import {
  RETURN_REASON_METRIC_ITEMS,
  type ReturnReasonMetricKey,
} from "../../shared/scoutStatus";

type Scope = "mine" | "all";

type DashboardScout = ScoutEntity & {
  id: string;
  creator: string;
  body: string;
  status: string;
  createdAt?: string;
};

const router = useRouter();
const loginStore = useLoginStore();

const scope = ref<Scope>("all");
const scouts = ref<DashboardScout[]>([]);
const rejectCommentsById = ref<Record<string, string>>({});

const positionId = computed(() => loginStore.user?.position_id ?? 0);
const positionName = computed(() => {
  if (positionId.value === 1) return "営業";
  if (positionId.value === 2) return "承認者";
  if (positionId.value === 3) return "管理者";
  return "ユーザー";
});

const isSales = computed(() => positionId.value === 1);
const effectiveScope = computed<Scope>(() =>
  isSales.value ? scope.value : "all",
);
const title = computed(() => `${positionName.value}ダッシュボード`);

const statusCardDefinition = [
  { key: "DRAFT", label: "下書き", filterLabel: "下書き", color: "gray" },
  {
    key: "PENDING_APPROVER",
    label: "営業承認待ち",
    filterLabel: "承認者承認待ち",
    color: "blue",
  },
  {
    key: "REJECTED_BY_APPROVER",
    label: "営業差戻し",
    filterLabel: "承認者差戻し",
    color: "red",
  },
  {
    key: "PENDING_ADMIN",
    label: "管理者承認待ち",
    filterLabel: "管理者承認待ち",
    color: "blue",
  },
  {
    key: "REJECTED_BY_ADMIN",
    label: "管理者差戻し",
    filterLabel: "管理者差戻し",
    color: "orange",
  },
  {
    key: "AVAILABLE",
    label: "利用可能",
    filterLabel: "利用可能",
    color: "green",
  },
] as const;

const normalizeStatus = (status?: string): string => {
  if (status === "SENT" || status === "APPROVED") {
    return "AVAILABLE";
  }
  return status ?? "";
};

const scopedScouts = computed<DashboardScout[]>(() => {
  if (!isSales.value || effectiveScope.value === "all") {
    return scouts.value;
  }
  const myEmployeeId = loginStore.user?.employee_id ?? "";
  return scouts.value.filter(
    (scout: DashboardScout) => scout.creator === myEmployeeId,
  );
});

const statusCounts = computed(() => {
  const initial = {
    DRAFT: 0,
    PENDING_APPROVER: 0,
    REJECTED_BY_APPROVER: 0,
    PENDING_ADMIN: 0,
    REJECTED_BY_ADMIN: 0,
    AVAILABLE: 0,
  };

  for (const scout of scopedScouts.value) {
    const status = normalizeStatus(scout.status);
    if (status in initial) {
      initial[status as keyof typeof initial] += 1;
    }
  }

  return initial;
});

const countOlderThan = (days: number): number => {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return scopedScouts.value.filter((scout: DashboardScout) => {
    if (!scout.createdAt) {
      return false;
    }
    const ts = new Date(scout.createdAt).getTime();
    return Number.isFinite(ts) && ts < threshold;
  }).length;
};

const reasonBarColors = [
  "bar-red",
  "bar-blue",
  "bar-purple",
  "bar-orange",
  "bar-green",
];

const statusCards = computed(() =>
  statusCardDefinition.map((card) => ({
    ...card,
    count: statusCounts.value[card.key],
  })),
);

const stallMetrics = computed(() => [
  { label: "営業承認待ち", count: statusCounts.value.PENDING_APPROVER },
  { label: "管理者承認待ち", count: statusCounts.value.PENDING_ADMIN },
  {
    label: "差戻し未対応",
    count:
      statusCounts.value.REJECTED_BY_APPROVER +
      statusCounts.value.REJECTED_BY_ADMIN,
  },
  { label: "下書きのまま", count: statusCounts.value.DRAFT },
  {
    label: "生成済・未申請",
    count: scopedScouts.value.filter(
      (scout: DashboardScout) =>
        normalizeStatus(scout.status) === "DRAFT" && scout.body.trim(),
    ).length,
  },
  { label: "長期未更新", count: countOlderThan(14) },
]);

const reasonPatternMap: Record<ReturnReasonMetricKey, RegExp[]> = {
  WEAK_APPEAL: [/魅力/, /訴求/, /弱い/],
  SALARY_EXPRESSION: [/給与/, /年収/, /報酬/],
  TOO_LONG: [/長すぎ/, /冗長/, /長い/],
  TYPO_GRAMMAR: [/誤字/, /文法/, /表記ゆれ/],
  EXPRESSION: [/表現/],
};

const reasonCounts = computed<Record<ReturnReasonMetricKey, number>>(() => {
  const counts: Record<ReturnReasonMetricKey, number> = {
    WEAK_APPEAL: 0,
    SALARY_EXPRESSION: 0,
    TOO_LONG: 0,
    TYPO_GRAMMAR: 0,
    EXPRESSION: 0,
  };

  for (const scout of scopedScouts.value) {
    const comment = rejectCommentsById.value[scout.id] ?? "";
    if (!comment) {
      continue;
    }

    for (const key of Object.keys(
      reasonPatternMap,
    ) as ReturnReasonMetricKey[]) {
      if (reasonPatternMap[key].some((pattern) => pattern.test(comment))) {
        counts[key] += 1;
      }
    }
  }

  return counts;
});

const reasonMetrics = computed(() => {
  const reasonCountMap = reasonCounts.value;
  return RETURN_REASON_METRIC_ITEMS.map((item, index) => ({
    ...item,
    count: reasonCountMap[item.key],
    colorClass: reasonBarColors[index % reasonBarColors.length],
  }));
});

const maxStallCount = computed(() =>
  Math.max(
    1,
    ...stallMetrics.value.map((item: { count: number }) => item.count),
  ),
);
const maxReasonCount = computed(() =>
  Math.max(
    1,
    ...reasonMetrics.value.map((item: { count: number }) => item.count),
  ),
);

const getBarWidthStyle = (count: number, maxCount: number) => ({
  width: `${Math.max(8, Math.round((count / maxCount) * 100))}%`,
});

const goToScoutList = (statusLabel?: string): void => {
  const query: Record<string, string> = {
    scope: effectiveScope.value,
  };
  if (statusLabel) {
    query.statuses = statusLabel;
  }

  router.push({
    name: "scout-list",
    query,
  });
};

const loadScouts = async (): Promise<void> => {
  const rows = await fetchScouts();
  scouts.value = rows
    .filter((row) => row.id && row.status)
    .map((row) => ({
      id: String(row.id),
      creator: String(row.creator ?? ""),
      body: String(row.body ?? ""),
      status: String(row.status ?? ""),
      createdAt:
        typeof row.createdAt === "string"
          ? row.createdAt
          : row.createdAt
            ? String(row.createdAt)
            : undefined,
      title: String(row.title ?? ""),
    }));
};

const loadRejectComments = async (): Promise<void> => {
  const rejectIds = scopedScouts.value
    .filter((scout: DashboardScout) =>
      ["REJECTED_BY_APPROVER", "REJECTED_BY_ADMIN"].includes(
        normalizeStatus(scout.status),
      ),
    )
    .map((scout: DashboardScout) => scout.id)
    .filter((id: string) => !rejectCommentsById.value[id]);

  if (!rejectIds.length) {
    return;
  }

  const fetched = await Promise.all(
    rejectIds.map(async (id: string) => {
      try {
        const detail = await fetchScoutDetail(id);
        return { id, comment: detail.latestRejectComment ?? "" };
      } catch {
        return { id, comment: "" };
      }
    }),
  );

  const nextMap = { ...rejectCommentsById.value };
  for (const row of fetched) {
    nextMap[row.id] = row.comment;
  }
  rejectCommentsById.value = nextMap;
};

onMounted(async () => {
  await loadScouts();
  await loadRejectComments();
});

watch(effectiveScope, async () => {
  await loadRejectComments();
});
</script>

<style scoped>
.dashboard {
  max-width: 1600px;
  margin: 0 auto;
  padding: 48px 24px 64px;
  display: grid;
  gap: 32px;
}

.title-bar {
  background: transparent;
  padding: 0 0 20px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.title-bar h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.scope-toggle {
  display: inline-flex;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background: #f9fafb;
}

.scope-toggle button {
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  padding: 8px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
}

.scope-toggle button:hover {
  color: #374151;
}

.scope-toggle button.active {
  background: #374151;
  color: #ffffff;
}

.goto-list {
  min-width: 140px;
  padding: 10px 24px;
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

.goto-list:hover {
  background: #1f2937;
  border-color: #1f2937;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

.goto-list:active {
  background: #111827;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.status-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px 0 rgb(0 0 0 / 0.1);
}

.status-card:active {
  transform: translateY(0);
}

.status-label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.status-count {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.gray {
  border-color: #9ca3af;
}

.gray .status-label {
  color: #6b7280;
}

.gray .status-count {
  color: #4b5563;
}

.blue {
  border-color: #93c5fd;
}

.blue .status-label {
  color: #2563eb;
}

.blue .status-count {
  color: #1d4ed8;
}

.red {
  border-color: #fca5a5;
}

.red .status-label {
  color: #dc2626;
}

.red .status-count {
  color: #b91c1c;
}

.orange {
  border-color: #fdba74;
}

.orange .status-label {
  color: #ea580c;
}

.orange .status-count {
  color: #c2410c;
}

.green {
  border-color: #86efac;
}

.green .status-label {
  color: #16a34a;
}

.green .status-count {
  color: #15803d;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.metric-card h2 {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  letter-spacing: -0.01em;
}

.metric-row {
  margin-bottom: 16px;
}

.metric-row:last-child {
  margin-bottom: 0;
}

.row-head {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.row-head span:last-child {
  font-weight: 600;
  color: #1f2937;
}

.bar-track {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #f3f4f6;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.3s ease;
}

.bar-blue {
  background: #3b82f6;
}

.bar-red {
  background: #ef4444;
}

.bar-purple {
  background: #a855f7;
}

.bar-orange {
  background: #f59e0b;
}

.bar-green {
  background: #10b981;
}

@media (max-width: 1200px) {
  .status-grid {
    grid-template-columns: repeat(3, minmax(140px, 1fr));
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 32px 16px 48px;
    gap: 24px;
  }

  .title-bar {
    padding: 0 0 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .title-bar h1 {
    font-size: 18px;
  }

  .header-actions {
    flex-direction: column;
    gap: 10px;
  }

  .scope-toggle {
    width: 100%;
  }

  .scope-toggle button {
    flex: 1;
  }

  .goto-list {
    width: 100%;
  }

  .status-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
    gap: 12px;
  }

  .status-card {
    padding: 16px 12px;
  }

  .status-label {
    font-size: 12px;
  }

  .status-count {
    font-size: 26px;
  }

  .metric-card {
    padding: 20px;
  }

  .metric-card h2 {
    font-size: 15px;
    margin-bottom: 16px;
  }

  .metric-row {
    margin-bottom: 14px;
  }

  .row-head {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 24px 12px 40px;
    gap: 20px;
  }

  .title-bar {
    padding: 0 0 12px;
  }

  .title-bar h1 {
    font-size: 16px;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    padding: 16px;
  }

  .metric-card h2 {
    font-size: 14px;
  }
}
</style>
