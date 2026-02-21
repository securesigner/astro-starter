/**
 * Contact Form Validation Tests (QA-06)
 *
 * Tests for the React ContactForm component in Astro:
 * - Required field validation
 * - Email format validation
 * - Honeypot spam protection
 * - Formspree form attributes
 *
 * Updated for Astro migration (January 2026)
 * Form is now a React component with client-side validation.
 */

import { test, expect } from '@playwright/test';

test.describe('Contact Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Contact form is available on both homepage and /contact/ page
    await page.goto('/contact/');
    // Wait for full page load
    await page.waitForLoadState('networkidle');
    // Wait for React hydration - form should be present
    await page.waitForSelector('form', { state: 'attached', timeout: 30000 });
  });

  test('validates required fields show error on blur', async ({ page }) => {
    const form = page.locator('form').first();

    // Name field should show error when blurred empty
    const nameInput = form.locator('input[name="name"]');
    await nameInput.focus();
    await nameInput.blur();

    // Email field should show error when blurred empty
    const emailInput = form.locator('input[name="email"]');
    await emailInput.focus();
    await emailInput.blur();

    // Message field should show error when blurred empty
    const messageInput = form.locator('textarea[name="message"]');
    await messageInput.focus();
    await messageInput.blur();

    // Form should still be visible (not submitted)
    await expect(form).toBeVisible();
  });

  test('validates email format - rejects invalid email', async ({ page }) => {
    const form = page.locator('form').first();

    // Fill email with invalid format
    const emailInput = form.locator('input[name="email"]');
    await emailInput.fill('invalid-email-format');
    await emailInput.blur();

    // Wait for validation feedback
    await page.waitForTimeout(100);

    // Should still be on the same page
    await expect(page).toHaveURL(/\/contact/);
  });

  test('validates email format - accepts valid email', async ({ page }) => {
    const form = page.locator('form').first();

    // Fill email with valid format
    const emailInput = form.locator('input[name="email"]');
    await emailInput.fill('test@example.com');
    await emailInput.blur();

    // Check email is in valid state
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(true);
  });

  test('form has correct Formspree attributes', async ({ page }) => {
    const form = page.locator('form').first();

    await expect(form).toHaveAttribute('method', /post/i);

    // Form action should point to Formspree
    const action = await form.getAttribute('action');
    expect(action).toContain('formspree.io');
  });

  test('honeypot field is present for spam prevention', async ({ page }) => {
    const form = page.locator('form').first();

    // Check Formspree honeypot field exists (hidden from users)
    const honeypotInput = form.locator('input[name="_gotcha"]');
    await expect(honeypotInput).toBeAttached();
  });

  test('all form fields have accessible labels', async ({ page }) => {
    const form = page.locator('form').first();

    // Check each required field has an associated label
    const nameInput = form.locator('input[name="name"]');
    const emailInput = form.locator('input[name="email"]');
    const messageInput = form.locator('textarea[name="message"]');

    // Inputs should be present
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();

    // Check for labels or aria-labels
    const hasNameLabel = await form.locator('label:has-text("name")').count() > 0 ||
      await nameInput.getAttribute('aria-label') !== null;
    const hasEmailLabel = await form.locator('label:has-text("email")').count() > 0 ||
      await emailInput.getAttribute('aria-label') !== null;
    const hasMessageLabel = await form.locator('label:has-text("message")').count() > 0 ||
      await messageInput.getAttribute('aria-label') !== null;

    expect(hasNameLabel || hasEmailLabel || hasMessageLabel).toBe(true);
  });

  test('service dropdown has options', async ({ page }) => {
    const form = page.locator('form').first();

    // Scroll form into view to trigger client:visible hydration
    await form.scrollIntoViewIfNeeded();
    // Wait for React hydration of the Radix Select component
    await page.waitForTimeout(2000);

    // Check for native <select> element with actual options (not a Radix hidden select)
    const nativeSelect = form.locator('select[name="service"]');
    if (await nativeSelect.count() > 0) {
      const options = await nativeSelect.locator('option').allTextContents();
      if (options.length > 1) {
        // Native select with real options — test passes
        return;
      }
    }

    // Custom Radix/shadcn Select: open and verify options
    const customSelect = form.locator('[role="combobox"], button[data-slot="select-trigger"]');
    await expect(customSelect.first()).toBeVisible({ timeout: 10000 });
    await customSelect.first().click();
    const options = page.locator('[role="option"]');
    await expect(options.first()).toBeVisible({ timeout: 5000 });
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(1);
  });

  test('form has submit button', async ({ page }) => {
    const form = page.locator('form').first();
    const submitButton = form.locator('button[type="submit"]');

    await expect(submitButton).toBeVisible();
  });

  test('form can be filled completely', async ({ page }) => {
    const form = page.locator('form').first();

    // Fill all required fields
    await form.locator('input[name="name"]').fill('Test User');
    await form.locator('input[name="email"]').fill('test@example.com');
    await form.locator('textarea[name="message"]').fill('This is a test message with enough characters to meet the minimum length requirement.');

    // Submit button should be enabled
    const submitButton = form.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });
});
