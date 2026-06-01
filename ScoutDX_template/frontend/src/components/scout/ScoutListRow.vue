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
  padding: 8px;
  border-bottom: 1px solid #ccc;
}

.action-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  text-align: center;
  border-bottom: none;
  border-left: 2px solid #bfc9d6;
  padding: 8px;
}

.returned {
  background: #efe2c0;
}

.approved {
  background: #cfe3cf;
}
</style>
