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
  display: grid;
  gap: 20px;
}

.title-bar {
  background: linear-gradient(135deg, #114c6e 0%, #1f7a8c 70%, #2da1a4 100%);
  color: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.title-bar h1 {
  margin: 0;
  font-size: 1.45rem;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.scope-toggle {
  display: inline-flex;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  overflow: hidden;
}

.scope-toggle button {
  border: none;
  background: transparent;
  color: #fff;
  padding: 7px 14px;
  cursor: pointer;
}

.scope-toggle button.active {
  background: rgba(255, 255, 255, 0.2);
}

.goto-list {
  border: none;
  border-radius: 10px;
  background: #f7fff7;
  color: #0f5132;
  font-weight: 700;
  padding: 8px 14px;
  cursor: pointer;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(130px, 1fr));
  gap: 12px;
}

.status-card {
  border: none;
  border-radius: 12px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
  color: #fff;
}

.status-label {
  font-size: 0.9rem;
}

.status-count {
  margin-top: 6px;
  font-size: 1.35rem;
  font-weight: 800;
}

.gray {
  background: #6c757d;
}

.blue {
  background: #1f6fb2;
}

.red {
  background: #d64545;
}

.orange {
  background: #e67e22;
}

.green {
  background: #2e8b57;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.metric-card {
  background: #fff;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  padding: 16px;
}

.metric-card h2 {
  margin: 0 0 14px;
  font-size: 1.05rem;
  color: #2b3a58;
}

.metric-row {
  margin-bottom: 12px;
}

.row-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.bar-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #edf2f7;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
}

.bar-blue {
  background: linear-gradient(90deg, #2d8ecf, #59b6e6);
}

.bar-red {
  background: linear-gradient(90deg, #f05365, #f58ea0);
}

.bar-purple {
  background: linear-gradient(90deg, #7e57c2, #ab7ff0);
}

.bar-orange {
  background: linear-gradient(90deg, #f39c12, #f8c471);
}

.bar-green {
  background: linear-gradient(90deg, #27ae60, #58d68d);
}

@media (max-width: 1100px) {
  .status-grid {
    grid-template-columns: repeat(3, minmax(140px, 1fr));
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .status-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}
</style>
