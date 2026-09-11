import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:4300/');
await page.waitForTimeout(1500);

await page.locator('button[aria-label="Próximos serviços"]').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);

const style = await page.evaluate(() => {
  const track = document.querySelector('[data-service-card]').closest('ul');
  const cs = getComputedStyle(track);
  return { scrollbarWidth: cs.scrollbarWidth };
});
console.log('computed scrollbar-width:', style.scrollbarWidth);

await page.screenshot({ path: 'scrollbar_check.png' });

await browser.close();
