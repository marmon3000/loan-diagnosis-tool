import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto('https://yushi-shindan.sova-support.jp/', { waitUntil: 'networkidle' });
await page.waitForTimeout(5000);

// Get the full HTML to understand the form structure
const html = await page.evaluate(() => document.body.innerHTML);
console.log('=== FULL HTML ===');
console.log(html);

console.log('\n=== ALL ELEMENTS ===');
const elements = await page.evaluate(() => {
  const els = document.querySelectorAll('input, select, button, label, [class*="question"], [class*="step"], [class*="form"], textarea, [role="radio"], [role="checkbox"], [class*="option"], [class*="choice"]');
  return [...els].map(el => ({
    tag: el.tagName,
    type: el.type || '',
    name: el.name || '',
    id: el.id || '',
    class: el.className || '',
    text: el.textContent?.trim().substring(0, 200) || '',
    value: el.value || '',
    placeholder: el.placeholder || ''
  }));
});
console.log(JSON.stringify(elements, null, 2));

// Try to find iframe
const iframes = await page.evaluate(() => {
  return [...document.querySelectorAll('iframe')].map(f => ({
    src: f.src,
    id: f.id,
    name: f.name
  }));
});
console.log('\n=== IFRAMES ===');
console.log(JSON.stringify(iframes, null, 2));

// Check for shadow DOM
const shadowRoots = await page.evaluate(() => {
  const hasShadow = [];
  document.querySelectorAll('*').forEach(el => {
    if (el.shadowRoot) {
      hasShadow.push({
        tag: el.tagName,
        class: el.className,
        shadowHTML: el.shadowRoot.innerHTML.substring(0, 500)
      });
    }
  });
  return hasShadow;
});
console.log('\n=== SHADOW DOM ===');
console.log(JSON.stringify(shadowRoots, null, 2));

await page.waitForTimeout(2000);
await browser.close();
