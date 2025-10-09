import { test, expect } from '@playwright/test';

interface TestAccount {
  email: string;
  password: string;
  name: string;
  role: string;
}

const testAccounts: TestAccount[] = [
  // 10 user accounts
  ...Array.from({ length: 10 }, (_, i) => ({
    email: i === 0 ? 'user@willydreams.com' : `user${i}@willydreams.com`,
    password: 'Password123',
    name: `User ${i === 0 ? '' : i}`,
    role: 'user',
  })),

  // 10 premium accounts
  ...Array.from({ length: 10 }, (_, i) => ({
    email: i === 0 ? 'premium@willydreams.com' : `premium${i}@willydreams.com`,
    password: 'Password123',
    name: `Premium User ${i === 0 ? '' : i}`,
    role: 'premium',
  })),

  // 10 admin accounts
  ...Array.from({ length: 10 }, (_, i) => ({
    email: i === 0 ? 'admin@willydreams.com' : `admin${i}@willydreams.com`,
    password: 'Password123',
    name: `Admin ${i === 0 ? '' : i}`,
    role: 'admin',
  })),

  // 10 superadmin accounts
  ...Array.from({ length: 10 }, (_, i) => ({
    email: i === 0 ? 'superadmin@willydreams.com' : `superadmin${i}@willydreams.com`,
    password: 'Password123',
    name: `Super Admin ${i === 0 ? '' : i}`,
    role: 'superadmin',
  })),
];

test.describe('Auth Flow Tests', () => {
  test.setTimeout(300000); // 5 minutes timeout for all accounts

  for (const account of testAccounts) {
    test(`${account.role} - ${account.email}: signup → signin → signout`, async ({ page }) => {
      console.log(`\n🧪 Testing ${account.email}...`);

      // Step 1: Go to signup page
      await page.goto('http://localhost:3000/signup');
      await page.waitForLoadState('networkidle');

      // Step 2: Fill signup form
      await page.fill('input[type="email"]', account.email);
      await page.fill('input[type="password"]', account.password);
      await page.fill('input[name="name"]', account.name);

      // Step 3: Submit signup
      await page.click('button[type="submit"]');

      // Wait a moment for the signup to process
      await page.waitForTimeout(2000);

      // Check if we were redirected to signin, or if there was an error
      if (page.url().includes('/signin')) {
        console.log(`✅ Signup successful for ${account.email}`);
      } else {
        // User might already exist, proceed to signin anyway
        console.log(`⏭️  User ${account.email} may already exist, proceeding to signin`);
        await page.goto('http://localhost:3000/signin');
      }

      // Step 4: Go to signin page if not already there
      if (!page.url().includes('/signin')) {
        await page.goto('http://localhost:3000/signin');
      }
      await page.waitForLoadState('networkidle');

      // Step 5: Fill signin form
      await page.fill('input[type="email"]', account.email);
      await page.fill('input[type="password"]', account.password);

      // Step 6: Submit signin
      await page.click('button[type="submit"]');

      // Step 7: Wait for dashboard
      await page.waitForURL('http://localhost:3000/dashboard', { timeout: 10000 });
      console.log(`✅ Signin successful for ${account.email}`);

      // Step 8: Verify dashboard content
      await expect(page.locator('h1')).toContainText('Dashboard');
      await expect(page.getByTestId('user-email')).toHaveText(account.email);
      console.log(`✅ Dashboard loaded for ${account.email}`);

      // Step 9: Logout
      await page.click('button:has-text("Logout")');

      // Step 10: Verify redirected to signin
      await page.waitForURL('http://localhost:3000/signin', { timeout: 5000 });
      console.log(`✅ Logout successful for ${account.email}`);
      console.log(`✅ Complete test for ${account.email}\n`);
    });
  }
});
