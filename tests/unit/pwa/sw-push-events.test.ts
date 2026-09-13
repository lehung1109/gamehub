import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Service Worker Push and Notification Click Handlers', () => {
  const swPath = path.resolve('public/sw.js');

  it('verifies public/sw.js contains push event listener and parses JSON payloads', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');

    expect(swContent).toContain("addEventListener('push'");
    expect(swContent).toContain('event.data.json()');
    expect(swContent).toContain('self.registration.showNotification');
    expect(swContent).toContain('/icons/icon-192.png');
  });

  it('verifies public/sw.js contains notificationclick handler navigating to target URL', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');

    expect(swContent).toContain("addEventListener('notificationclick'");
    expect(swContent).toContain('event.notification.close()');
    expect(swContent).toContain('clients.matchAll');
    expect(swContent).toContain('clients.openWindow');
  });
});
