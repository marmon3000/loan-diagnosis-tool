import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto('https://yushi-shindan.sova-support.jp/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// Get full page content after JS rendering
const content = await page.evaluate(() => {
  // Get all visible text and form elements
  const allText = [];

  // Get all text content
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  while (walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    if (text && text.length > 1) {
      allText.push(text);
    }
  }

  // Get all buttons and their text
  const buttons = [...document.querySelectorAll('button, [role="button"], a')].map(el => ({
    tag: el.tagName,
    text: el.textContent.trim(),
    class: el.className
  }));

  // Get all input/select elements
  const inputs = [...document.querySelectorAll('input, select, textarea')].map(el => ({
    tag: el.tagName,
    type: el.type,
    placeholder: el.placeholder,
    name: el.name
  }));

  return { allText, buttons, inputs, html: document.body.innerHTML.substring(0, 15000) };
});

console.log('=== PAGE TEXT ===');
console.log(content.allText.join('\n'));
console.log('\n=== BUTTONS ===');
console.log(JSON.stringify(content.buttons, null, 2));
console.log('\n=== INPUTS ===');
console.log(JSON.stringify(content.inputs, null, 2));
console.log('\n=== HTML SNIPPET ===');
console.log(content.html);

await browser.close();
