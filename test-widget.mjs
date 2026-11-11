// Run in the disposable test copy. Uses an isolated Chromium, never personal Notion.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE);
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true});
const url = process.env.SITE_BASE_URL || pathToFileURL(resolve('index.html')).href;
try {
  const context = await browser.newContext({viewport:{width:512,height:512},timezoneId:'America/Los_Angeles',colorScheme:'light'});
  const page = await context.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date('2026-11-10T04:30:00Z')});
  await page.clock.pauseAt(new Date('2026-11-10T04:30:00Z')); // Network load time must not advance the test clock.
  await page.goto(url);
  const state = async kind => page.waitForFunction(k=>document.body.dataset.state===k,kind);
  const setTime = async stamp => {await page.clock.setSystemTime(new Date(stamp));await page.evaluate(()=>dispatchEvent(new Event('pageshow')));};
  await state('working');
  assert.equal(await page.locator('#hours').textContent(),'4');
  assert.equal(await page.locator('#remainder').textContent(),'30 分 00 秒');
  assert.equal(await page.locator('#percent').textContent(),'50%');
  assert.equal(await page.locator('#heading').textContent(),'距離下班還有');
  await page.screenshot({path:'working-light.png'});
  await page.clock.fastForward(1000);
  assert.equal(await page.locator('#remainder').textContent(),'29 分 59 秒');
  await setTime('2026-11-10T08:59:59Z');
  await page.clock.fastForward(1000);
  await state('off');
  assert.equal(await page.locator('#rest-main').isVisible(),true);
  assert.equal(await page.locator('#coffee').isVisible(),true);
  assert.equal(await page.locator('#countdown').isVisible(),false);
  await page.screenshot({path:'off-light.png'});
  await setTime('2026-11-14T04:00:00Z'); await state('rest');
  assert.equal(await page.locator('#rest-main').textContent(),'好好休息');
  await setTime('2026-11-09T23:59:59Z'); await state('before');
  assert.equal(await page.locator('#hours').textContent(),'0');
  await page.clock.fastForward(1000); await state('working');
  assert.equal(await page.locator('#hours').textContent(),'9');
  await setTime('2026-11-10T04:30:00Z');
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
  assert.equal(await page.locator('.steam').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.equal(await page.locator('#second-hand').isVisible(),false);
  await page.screenshot({path:'working-dark.png'});
  for (const width of [200,240,360,512]) {
    await page.setViewportSize({width,height:512});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const bounds=await page.locator('#heading,#status,#hours,#remainder').evaluateAll(els=>els.map(el=>{const b=el.getBoundingClientRect();return {left:b.left,right:b.right};}));
    assert.ok(bounds.every(b=>b.left>=0 && b.right<=width));
  }
  for (const [width,height] of [[400,180],[240,400]]) {
    await page.setViewportSize({width,height});
    const b=await page.locator('svg').boundingBox();
    assert.ok(Math.abs(b.width-b.height)<1,'Card must stay square in rectangular Notion embeds');
    assert.ok(Math.abs(b.width-(width-34))<1,'Card fills the embed width even when the embed is short');
  }
  await page.goto(url+'?start=09:30&end=18:30&accent=337ea9&theme=light');
  await state('working');
  assert.equal(await page.locator('#end').textContent(),'18:30');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  assert.equal(await page.locator('html').evaluate(el=>getComputedStyle(el).getPropertyValue('--accent').trim()),'#337ea9');
  await page.goto(url+'?start=25:00');
  assert.equal(await page.locator('#error').isVisible(),true);
  assert.equal(await page.locator('svg').isVisible(),false);
  assert.deepEqual(errors,[]);
  // Parent light→dark→light, with arbitrary background to expose opaque iframe corners.
  const parent=await context.newPage();
  await parent.emulateMedia({colorScheme:null});
  await parent.goto(url);
  await parent.setContent(`<style>html{color-scheme:light;background:#123456}body{margin:0}iframe{border:0;width:512px;height:512px}</style><iframe src="${url}"></iframe>`);
  const frame=parent.frames().find(f=>f.parentFrame());
  await frame.waitForFunction(()=>document.body.dataset.state);
  for (const theme of ['light','dark','light']) {
    await parent.evaluate(t=>document.documentElement.style.colorScheme=t,theme);
    await frame.waitForFunction(dark=>matchMedia('(prefers-color-scheme:dark)').matches===dark,theme==='dark');
    assert.equal(await frame.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
    assert.equal(await frame.locator('.surface').evaluate(el=>getComputedStyle(el).fill),theme==='dark'?'rgb(37, 37, 37)':'rgb(249, 248, 247)');
    await parent.screenshot({path:`iframe-${theme}.png`});
  }
  console.log('PASS: live seconds, all four states, exact shift boundaries, URL settings/errors, reduced motion, 200–512 widths, transparent iframe light→dark→light');
} finally {await browser.close();}
