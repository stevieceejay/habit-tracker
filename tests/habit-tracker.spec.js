const { test, expect } = require('@playwright/test');
const path = require('path');

test('habit checkbox toggles when clicked', async ({ page }) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'index.html');
  const url = `file://${filePath}`;

  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(url);
  await expect(page).toHaveURL(url);
  await expect(page.locator('label.box')).toHaveCount(21);

  const firstCheckbox = page.locator('label.box').first();
  await expect(firstCheckbox).toBeVisible();

  const initialClass = await firstCheckbox.getAttribute('class');
  await firstCheckbox.click();

  const finalClass = await firstCheckbox.getAttribute('class');
  expect(finalClass).not.toBe(initialClass);
  expect(pageErrors).toEqual([]);
});

test('adding a new habit adds a row and clears the input', async ({ page }) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'index.html');
  const url = `file://${filePath}`;

  await page.goto(url);
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const habitInput = page.locator('#habit-input');
  const submitButton = page.locator('#add-form button[type="submit"]');
  const initialRowCount = await page.locator('tbody#tracker-body tr').count();

  await habitInput.fill('Practice guitar');
  await submitButton.click();

  await expect(page.locator('tbody#tracker-body tr')).toHaveCount(initialRowCount + 1);
  await expect(page.locator('text=Practice guitar')).toBeVisible();
  await expect(habitInput).toHaveValue('');
  expect(pageErrors).toEqual([]);
});
