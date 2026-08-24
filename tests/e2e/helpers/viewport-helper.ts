import type { Page } from '@playwright/test';

export const VIEWPORT_MOBILE = { width: 375, height: 667 };
export const VIEWPORT_TABLET = { width: 768, height: 1024 };
export const VIEWPORT_LAPTOP_LG = { width: 1024, height: 768 };
export const VIEWPORT_DESKTOP_XL = { width: 1280, height: 800 };
export const VIEWPORT_DESKTOP_2XL = { width: 1536, height: 864 };
export const VIEWPORT_DESKTOP_FHD = { width: 1920, height: 1080 };
export const VIEWPORT_ULTRAWIDE = { width: 3440, height: 1440 };

export async function getComputedWidth(page: Page, selector: string): Promise<number> {
  return await page.$eval(selector, (el) => {
    const rect = el.getBoundingClientRect();
    return rect.width;
  });
}

export async function getComputedMaxWidth(page: Page, selector: string): Promise<string> {
  return await page.$eval(selector, (el) => {
    return window.getComputedStyle(el).maxWidth;
  });
}
