/**
 * Sanitization & Input Boundary Enforcement Utility
 * Protects against LocalStorage quota exhaustion DoS and malformed payloads.
 */

export const sanitizeText = (val: unknown, maxLen = 2000): string => {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
};

export const sanitizeTitle = (val: unknown): string => {
  return sanitizeText(val, 180);
};

export const sanitizeDescription = (val: unknown): string => {
  return sanitizeText(val, 4000);
};

export const sanitizeShortCode = (val: unknown): string => {
  return sanitizeText(val, 32);
};

/**
 * Validates workspace backup payload structure and limits before parsing/saving
 */
export const validateWorkspaceBackup = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (!data.organization || typeof data.organization !== 'object') return false;
  if (!Array.isArray(data.projects) || !Array.isArray(data.tasks)) return false;

  // Maximum entity limits to prevent storage bomb attacks
  if (data.projects.length > 200) return false;
  if (data.tasks.length > 1000) return false;
  if (Array.isArray(data.users) && data.users.length > 200) return false;
  if (Array.isArray(data.activities) && data.activities.length > 2000) return false;

  return true;
};
