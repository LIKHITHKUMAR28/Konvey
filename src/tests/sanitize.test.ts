import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeTitle,
  sanitizeDescription,
  sanitizeShortCode,
  validateWorkspaceBackup,
} from '../utils/sanitize';

describe('Sanitization & Input Boundary Utilities', () => {
  it('sanitizes titles with trimming and 180 character truncation', () => {
    expect(sanitizeTitle('   Clean Task Title   ')).toBe('Clean Task Title');
    expect(sanitizeTitle(null)).toBe('');
    expect(sanitizeTitle(undefined)).toBe('');

    const longTitle = 'a'.repeat(250);
    const sanitized = sanitizeTitle(longTitle);
    expect(sanitized.length).toBe(180);
  });

  it('sanitizes descriptions with 4000 character limit', () => {
    expect(sanitizeDescription('  Detailed specifications.  ')).toBe('Detailed specifications.');
    const longDesc = 'x'.repeat(5000);
    expect(sanitizeDescription(longDesc).length).toBe(4000);
  });

  it('sanitizes short codes up to 32 characters', () => {
    expect(sanitizeShortCode('PROJ-123')).toBe('PROJ-123');
    expect(sanitizeShortCode('VERY-LONG-PROJECT-KEY-OVERFLOW-BOUNDARY-TEST').length).toBe(32);
  });

  it('validates workspace backup schemas correctly', () => {
    // Valid backup
    const validBackup = {
      organization: { id: 'org-1', name: 'Acme Corp' },
      projects: [{ id: 'proj-1' }],
      tasks: [{ id: 'task-1' }],
      users: [{ id: 'user-1' }],
    };
    expect(validateWorkspaceBackup(validBackup)).toBe(true);

    // Invalid: null or non-object
    expect(validateWorkspaceBackup(null)).toBe(false);
    expect(validateWorkspaceBackup('malicious string')).toBe(false);

    // Invalid: missing organization
    expect(validateWorkspaceBackup({ projects: [], tasks: [] })).toBe(false);

    // Invalid: missing tasks or projects array
    expect(validateWorkspaceBackup({ organization: {} })).toBe(false);

    // Invalid: quota bomb (over 1000 tasks)
    const quotaBomb = {
      organization: { id: 'org-1' },
      projects: [],
      tasks: new Array(1001).fill({ id: 'task' }),
    };
    expect(validateWorkspaceBackup(quotaBomb)).toBe(false);
  });
});
