import React from 'react';
import { describe, it, expect } from 'vitest';
import RootLayout from '@/app/layout';

describe('RootLayout', () => {
  it('renders root layout container with responsive max-width tiers', () => {
    const layoutElement = RootLayout({
      children: <div data-testid="test-content">Hello World</div>,
    });

    expect(layoutElement.type).toBe('html');
    const body = layoutElement.props.children;
    expect(body.type).toBe('body');
    const container = body.props.children;
    expect(container.type).toBe('div');
    expect(container.props['data-testid']).toBe('root-layout-container');
    expect(container.props.className).toContain('max-w-5xl');
    expect(container.props.className).toContain('lg:max-w-7xl');
    expect(container.props.className).toContain('xl:max-w-[1400px]');
    expect(container.props.className).toContain('2xl:max-w-[1800px]');
  });
});
