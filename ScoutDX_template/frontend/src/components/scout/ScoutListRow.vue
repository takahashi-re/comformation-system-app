<template>
  <tr :class="rowClass">
    <td>
      {{ formattedSummary }}
    </td>

    <td class="action-cell">
      <button @click="$emit('detail', scout.id)">詳細</button>

      <button
        v-if="role === 'sales' && isEditable(scout.statusLabel)"
        @click="$emit('edit', scout.id)"
      >
        編集
      </button>

      <button
        v-if="role === 'approver' && scout.status === 'PENDING_APPROVER'"
        @click="$emit('review', scout.id)"
      >
        承認・差戻し
      </button>

      <button
        v-if="role === 'admin' && scout.status === 'PENDING_ADMIN'"
        @click="$emit('review', scout.id)"
      >
        承認・差戻し
      </button>
    </td>
  </tr>
</template>

<script>
export default {
  name: "ScoutListRow",
  props: {
    scout: {
      type: Object,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    selectedColumns: {
      type: Array,
      required: true,
    },
    rowClass: {
      type: String,
      default: "",
    },
  },
  emits: ["detail", "edit", "review"],
  computed: {
    formattedSummary() {
      const parts = [];

      if (this.selectedColumns.includes("company")) {
        parts.push(`会社名：${this.scout.company}`);
      }
      if (this.selectedColumns.includes("job")) {
        parts.push(`職種：${this.scout.job}`);
      }
      if (this.selectedColumns.includes("status")) {
        parts.push(`ステータス：${this.scout.statusLabel}`);
      }

      return parts.join("、");
    },
  },
  methods: {
    isEditable(status) {
      return ["下書き", "承認者差戻し", "管理者差戻し"].includes(status);
    },
  },
};
</script>

<style scoped>
td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.6;
}

.action-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  border-left: 1px solid #f3f4f6;
}

.action-cell button {
  min-width: 80px;
  padding: 7px 16px;
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
}

.action-cell button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.action-cell button:active {
  background: #f3f4f6;
}

.returned {
  background: #fef3c7;
}

.approved {
  background: #d1fae5;
}

tr:hover td {
  background: inherit;
}

tr.returned:hover td {
  background: #fde68a;
}

tr.approved:hover td {
  background: #a7f3d0;
}

@media (max-width: 768px) {
  td {
    padding: 12px;
    font-size: 13px;
  }

  .action-cell {
    flex-direction: column;
    gap: 6px;
    padding: 12px;
  }

  .action-cell button {
    width: 100%;
  }
}
</style>