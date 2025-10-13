import { test, expect } from '@playwright/test';

test('superadmin login test', async ({ page }) => {
  console.log('🔍 Navigating to signin page...');
  await page.goto('http://localhost:3002/signin');
  
  console.log('⏳ Waiting for email input...');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  console.log('📝 Filling credentials...');
  await page.fill('input[type="email"]', 'superadmin@willydreams.com');
  await page.fill('input[type="password"]', 'Password123');
  
  console.log('🖱️  Clicking sign in button...');
  await page.click('button[type="submit"]');
  
  console.log('⏳ Waiting for redirect to dashboard...');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  console.log('✅ Verifying dashboard URL...');
  expect(page.url()).toContain('/dashboard');
  
  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: 'tests/test-results/signin-success.png', fullPage: true });
  
  console.log('✅ Login test PASSED!');
});
