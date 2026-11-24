import { expect, test } from '@playwright/test';
import catalog from '../../../../bridges.json' with { type: 'json' };

test('search works with the keyboard at 320 pixels', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Find a bridge' });
  const cards = page.locator('article[data-bridge]');
  await expect(search).toBeVisible();
  await expect(cards).toHaveCount(catalog.length);

  await search.fill('modbus');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toHaveAttribute('data-bridge-slug', 'modbus');
  await search.fill('missing-device-fixture');
  await expect(page.getByText('No matching bridges')).toBeVisible();
  await expect(cards).toHaveCount(0);

  await search.press('Tab');
  const reset = page.getByRole('button', { name: 'Clear search' });
  await expect(reset).toBeFocused();
  await reset.press('Enter');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
  await expect(cards).toHaveCount(catalog.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  expect(errors).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('preserves native catalog links and hides search', async ({ page, request }) => {
    await page.goto('/');
    await expect(page.locator('form[data-search-form]')).toBeHidden();
    await expect(page.locator('article[data-bridge]')).toHaveCount(catalog.length);
    for (const { name, slug, documentation, repository, documentationType } of catalog) {
      const card = page.locator(`article[data-bridge-slug="${slug}"]`);
      await expect(card).toBeVisible();
      await expect(card.getByRole('link', { name: `${name} on GitHub` })).toHaveAttribute('href', repository);
      const docs = `${name} ${documentationType === 'readme' ? 'README documentation' : 'documentation'}`;
      const docsLink = card.getByRole('link', { name: docs, exact: true });
      await expect(docsLink).toBeVisible();
      await expect(docsLink).toHaveAttribute('href', documentation);
    }
    expect((await request.get('/modbus/configuration')).ok()).toBeTruthy();
  });
});
