// Unit tests for the pure helpers in src/shared.ts (run after a build):
//   npm test
// shared.ts is a classic script (no modules), so load dist/shared.js into a vm
// context and pull the globals out.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const code = readFileSync(join(root, 'dist', 'shared.js'), 'utf8');
const ctx = vm.createContext({ atob });
vm.runInContext(
  code +
    '\n;globalThis.__rs = { RS_API_BASE, RS_PAIRING_URL, RS_QUEUE_MAX_AGE_MS, rsDecodeJwtPayload, rsTokenExpiry, rsIsExtensionToken, rsClassifyFailure, rsEnqueue, rsPruneQueue, rsFormatAgo, rsHealthSummary, rsRelevantError, rsDaysLeft };',
  ctx
);
const rs = ctx.__rs;

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (payload) => `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.sig`;
const H = 3600_000;
const D = 24 * H;
const now = Date.UTC(2026, 9, 21, 12);

test('decodes base64url JWT payloads (incl. -/_ chars and unicode)', () => {
  const p = { userId: 'a?>~~~', kind: 'extension', exp: 1808131876, name: 'Zoë' };
  const tok = jwt(p);
  assert.ok(/[-_]/.test(tok.split('.')[1]), 'fixture should exercise base64url chars');
  assert.deepEqual({ ...rs.rsDecodeJwtPayload(tok) }, p);
  assert.equal(rs.rsTokenExpiry(tok), 1808131876 * 1000);
  assert.equal(rs.rsIsExtensionToken(tok), true);
  assert.equal(rs.rsIsExtensionToken(jwt({ userId: 'x', exp: 1 })), false);
  assert.equal(rs.rsDecodeJwtPayload('garbage'), null);
  assert.equal(rs.rsTokenExpiry('a.b.c'), null);
});

test('classifies save failures', () => {
  assert.equal(rs.rsClassifyFailure(null), 'retry');
  assert.equal(rs.rsClassifyFailure(500), 'retry');
  assert.equal(rs.rsClassifyFailure(503), 'retry');
  assert.equal(rs.rsClassifyFailure(429), 'retry');
  assert.equal(rs.rsClassifyFailure(408), 'retry');
  assert.equal(rs.rsClassifyFailure(401), 'auth');
  assert.equal(rs.rsClassifyFailure(400), 'drop');
  assert.equal(rs.rsClassifyFailure(404), 'drop');
});

test('enqueue dedupes by URL, keeps original queuedAt/attempts, newest data wins', () => {
  const a = { url: 'https://x.com/a/status/1', platform: 'x', title: 'one', author: '@a' };
  let q = rs.rsEnqueue([], a, 'err1', now);
  q = rs.rsEnqueue(q, { url: 'https://www.youtube.com/watch?v=abcdefghijk', platform: 'youtube', title: 'v', author: 'c' }, 'err', now + 1);
  q[0].attempts = 3;
  q = rs.rsEnqueue(q, { ...a, title: 'one (edited)', topic_names: ['AI'] }, 'err2', now + 2);
  assert.equal(q.length, 2);
  const item = q.find((i) => i.data.url === a.url);
  assert.equal(item.data.title, 'one (edited)');
  assert.equal(item.queuedAt, now);
  assert.equal(item.attempts, 3);
  assert.equal(item.lastError, 'err2');
});

test('prune drops items older than 14 days', () => {
  const mk = (url, at) => ({ data: { url, platform: 'x', title: '', author: '' }, queuedAt: at, attempts: 0 });
  const { keep, expired } = rs.rsPruneQueue([mk('old', now - 15 * D), mk('new', now - D)], now);
  assert.equal(JSON.stringify(keep.map((i) => i.data.url)), JSON.stringify(["new"]));
  assert.equal(JSON.stringify(expired.map((i) => i.data.url)), JSON.stringify(["old"]));
});

test('formats relative times', () => {
  assert.equal(rs.rsFormatAgo(now - 10_000, now), 'just now');
  assert.equal(rs.rsFormatAgo(now - 5 * 60_000, now), '5m ago');
  assert.equal(rs.rsFormatAgo(now - 2 * H, now), '2h ago');
  assert.equal(rs.rsFormatAgo(now - 47 * H, now), '47h ago');
  assert.equal(rs.rsFormatAgo(now - 3 * D, now), '3d ago');
  assert.equal(rs.rsFormatAgo(now + 5000, now), 'just now');
});

test('health summary', () => {
  assert.equal(rs.rsHealthSummary(undefined, now), 'No captures yet');
  assert.equal(
    rs.rsHealthSummary({ lastCapture: { x: now - 2 * H, youtube: now - 3 * D }, lastSaved: {} }, now),
    'Last capture: X 2h ago · YouTube 3d ago'
  );
  assert.equal(rs.rsHealthSummary({ lastCapture: { youtube: now - 60_000 }, lastSaved: {} }, now), 'Last capture: YouTube 1m ago');
});

test('relevant error is hidden once a later save succeeds or after 7 days', () => {
  const err = { at: now - H, platform: 'x', message: 'boom' };
  assert.equal(rs.rsRelevantError({ lastCapture: {}, lastSaved: {}, lastError: err }, now), 'X: boom (1h ago)');
  assert.equal(rs.rsRelevantError({ lastCapture: {}, lastSaved: { x: now - 1000 }, lastError: err }, now), null);
  assert.equal(rs.rsRelevantError({ lastCapture: {}, lastSaved: { youtube: now - 1000 }, lastError: err }, now), 'X: boom (1h ago)');
  const global = { at: now - H, message: 'Connection expired' };
  assert.equal(rs.rsRelevantError({ lastCapture: {}, lastSaved: {}, lastError: global }, now), 'Connection expired (1h ago)');
  assert.equal(rs.rsRelevantError({ lastCapture: {}, lastSaved: { youtube: now }, lastError: global }, now), null);
  assert.equal(rs.rsRelevantError({ lastCapture: {}, lastSaved: {}, lastError: { ...err, at: now - 8 * D } }, now), null);
});

test('days left', () => {
  assert.equal(rs.rsDaysLeft(now + 13.5 * D, now), 13);
  assert.equal(rs.rsDaysLeft(now + 180 * D, now), 180);
  assert.equal(rs.rsDaysLeft(now - H, now), -1);
});

test('URL constants are production by default (build:local rewrites them)', () => {
  assert.equal(rs.RS_API_BASE, process.env.EXPECT_LOCAL ? 'http://localhost:4000/v1' : 'https://resurface-nclr.onrender.com/v1');
  assert.equal(rs.RS_PAIRING_URL, process.env.EXPECT_LOCAL ? 'http://localhost:3000/extension' : 'https://resurface-web-eight.vercel.app/extension');
});

console.log(`\n${passed} passed`);
