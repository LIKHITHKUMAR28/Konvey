import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';

describe('StorageService & Seed Data', () => {
  beforeEach(() => {
    storageService.resetToSeed();
  });

  it('initializes default organization data properly', () => {
    const org = storageService.getOrganization();
    expect(org).toBeDefined();
    expect(org.id).toBe('org-acme');
    expect(org.name).toBe('ROY Tech solutions');
  });

  it('loads all seed users including Admin, Manager, Member, and Client personas', () => {
    const users = storageService.getUsers();
    expect(users.length).toBeGreaterThanOrEqual(4);

    const admin = users.find((u) => u.role === 'admin');
    expect(admin).toBeDefined();
    expect(admin?.name).toBe('Sameera Rao');

    const manager = users.find((u) => u.role === 'manager');
    expect(manager).toBeDefined();
    expect(manager?.name).toBe('Rahul Sharma');

    const client = users.find((u) => u.role === 'client');
    expect(client).toBeDefined();
    expect(client?.name).toBe('Ananya Roy');
  });

  it('manages active user ID and authentication session state', () => {
    storageService.setCurrentUserId('user-sam');
    expect(storageService.getCurrentUserId()).toBe('user-sam');

    storageService.setIsAuthenticated(true);
    expect(storageService.getIsAuthenticated()).toBe(true);

    storageService.setIsAuthenticated(false);
    expect(storageService.getIsAuthenticated()).toBe(false);
  });
});
