// App Store screenshots from demo mode. See docs/app-store/README.md.
// Usage: SHOTS=<out dir> [W=402 H=874 DPR=3] node scripts/app-store-screenshots.mjs name=/path ...
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.env.SHOTS ?? 'store-shots';
const SP = process.env.TEMP ?? '.';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = join(SP, 'chrome-cdp');
rmSync(profile, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--remote-debugging-port=9333',
  `--user-data-dir=${profile}`,
  'about:blank',
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200);
  try {
    const list = await (await fetch('http://127.0.0.1:9333/json/list')).json();
    wsUrl = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++seq;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: Number(process.env.W ?? 440),
  height: Number(process.env.H ?? 956),
  deviceScaleFactor: Number(process.env.DPR ?? 3),
  mobile: false,
});

for (const arg of process.argv.slice(2)) {
  const [name, path] = arg.split(/=(.*)/s);
  await send('Page.navigate', { url: `http://localhost:8099${path}` });
  await sleep(Number(process.env.WAIT ?? 9000));
  const metrics = await send('Runtime.evaluate', {
    expression: 'location.pathname',
  });
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(shot.result.data, 'base64'));
  console.log(name, metrics.result.result.value);
}
ws.close();
chrome.kill();
await sleep(500);
rmSync(profile, { recursive: true, force: true });
process.exit(0);
