export const DEPARTMENTS = {
  ENGINEERING: 'Civil (P-Way)',
  SIGNAL_TELECOM: 'Signal & Telecom (S&T)',
  ELECTRICAL: 'Electrical (TRD/OHE)',
  OPERATIONS: 'Operations',
};

export const BLOCK_STATUS = {
  REQUESTED: 'REQUESTED',
  CONFLICT: 'CONFLICT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const PRIORITIES = {
  CRITICAL: { label: 'Critical', color: 'red' },
  HIGH: { label: 'High', color: 'amber' },
  MEDIUM: { label: 'Medium', color: 'blue' },
  LOW: { label: 'Low', color: 'slate' },
};

export const USER_ROLES = {
  STATION_MASTER: 'Station Master / Controller',
  MAINTENANCE_ENGINEER: 'Maintenance Engineer',
  ADMIN: 'Divisional Railway Manager (Admin)',
};

export const HEADWAY_BUFFER_MINUTES = 15;

/**
 * Universal helper to detect if a maintenance block has an active train schedule conflict
 * Works seamlessly with backend DTOs (hasConflict, conflicts list, conflictRemarks)
 * and frontend status state ('CONFLICT').
 */
export function isConflictBlock(block) {
  if (!block) return false;
  if (block.status === 'CONFLICT') return true;
  if (block.hasConflict === true) return true;
  if (Array.isArray(block.conflicts) && block.conflicts.length > 0) return true;
  if (
    block.status === 'PENDING' &&
    block.conflictRemarks &&
    /clash|collision|overlap|conflict/i.test(block.conflictRemarks)
  ) {
    return true;
  }
  return false;
}
