import { describe, it, expect } from 'vitest';
import { storageService } from '../services/storageService';
import { hasPermission } from '../services/permissionService';

describe('Authentication & Persona Access Isolation', () => {
  it('validates all 4 seed personas have their assigned roles', () => {
    const users = storageService.getUsers();

    const admin = users.find((u) => u.id === 'user-sam');
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('admin');
    expect(admin?.title).toBe('VP of Product Operations');

    const pm = users.find((u) => u.id === 'user-rahul');
    expect(pm).toBeDefined();
    expect(pm?.role).toBe('manager');
    expect(pm?.title).toBe('Senior Project Manager');

    const engineer = users.find((u) => u.id === 'user-alex');
    expect(engineer).toBeDefined();
    expect(engineer?.role).toBe('member');
    expect(engineer?.title).toBe('Lead Frontend Engineer');

    const client = users.find((u) => u.id === 'user-elena');
    expect(client).toBeDefined();
    expect(client?.role).toBe('client');
    expect(client?.title).toContain('VP of Digital');
  });

  it('guarantees client persona cannot access internal project features', () => {
    const clientRole = 'client';

    // Must be able to view client portal
    expect(hasPermission(clientRole, 'CAN_VIEW_CLIENT_PORTAL')).toBe(true);

    // Must NOT have project creation, task management, or member governance
    expect(hasPermission(clientRole, 'CAN_CREATE_PROJECT')).toBe(false);
    expect(hasPermission(clientRole, 'CAN_CREATE_TASK')).toBe(false);
    expect(hasPermission(clientRole, 'CAN_MANAGE_PROJECT_MEMBERS')).toBe(false);
    expect(hasPermission(clientRole, 'CAN_APPLY_RECOVERY')).toBe(false);
    expect(hasPermission(clientRole, 'CAN_DELETE_PROJECT')).toBe(false);
  });

  it('verifies admin and project manager can manage members across projects', () => {
    expect(hasPermission('admin', 'CAN_MANAGE_PROJECT_MEMBERS')).toBe(true);
    expect(hasPermission('manager', 'CAN_MANAGE_PROJECT_MEMBERS')).toBe(true);
    expect(hasPermission('member', 'CAN_MANAGE_PROJECT_MEMBERS')).toBe(false);
  });

  it('supports provisioning new employees with passwords and authenticating them', () => {
    const users = storageService.getUsers();
    const newEmployee = {
      id: `user-test-${Date.now()}`,
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@roytech.io',
      password: 'mypassword123',
      role: 'member' as const,
      title: 'Cloud Systems Engineer',
      organizationIds: ['org-roy'],
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    const updated = [...users, newEmployee];
    storageService.saveUsers(updated);

    const reloaded = storageService.getUsers();
    const found = reloaded.find((u) => u.email === 'rohan.deshmukh@roytech.io');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Rohan Deshmukh');
    expect(found?.password).toBe('mypassword123');
    expect(found?.role).toBe('member');

    // Test password matching
    const authenticate = (email: string, pass: string) => {
      const u = reloaded.find((user) => user.email.toLowerCase() === email.toLowerCase());
      if (!u) throw new Error('Invalid email or password.');
      if (u.password && u.password !== pass) throw new Error('Invalid email or password.');
      return u;
    };

    expect(authenticate('rohan.deshmukh@roytech.io', 'mypassword123')).toBeDefined();
    expect(() => authenticate('rohan.deshmukh@roytech.io', 'wrongpass')).toThrow('Invalid email or password.');
    expect(() => authenticate('nonexistent@roytech.io', 'anypass123')).toThrow('Invalid email or password.');
  });
});
