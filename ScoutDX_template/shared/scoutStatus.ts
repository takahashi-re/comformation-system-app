export const SCOUT_STATUS = {
  DRAFT: "DRAFT",
  PENDING_APPROVER: "PENDING_APPROVER",
  REJECTED_BY_APPROVER: "REJECTED_BY_APPROVER",
  PENDING_ADMIN: "PENDING_ADMIN",
  REJECTED_BY_ADMIN: "REJECTED_BY_ADMIN",
  AVAILABLE: "AVAILABLE",
} as const;

export type ScoutStatus = (typeof SCOUT_STATUS)[keyof typeof SCOUT_STATUS];

export const SCOUT_STATUS_LABEL: Record<ScoutStatus, string> = {
  DRAFT: "下書き",
  PENDING_APPROVER: "承認者承認待ち",
  REJECTED_BY_APPROVER: "承認者差戻し",
  PENDING_ADMIN: "管理者承認待ち",
  REJECTED_BY_ADMIN: "管理者差戻し",
  AVAILABLE: "利用可能",
};