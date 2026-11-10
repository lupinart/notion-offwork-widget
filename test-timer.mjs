import assert from 'node:assert/strict';
import './config.js';
import timer from './timer.js';
const config = timer.readConfig(globalThis.OFFWORK_CONFIG, new URLSearchParams());
const state = time => timer.stateAt(new Date(time), config);
assert.equal(state('2026-11-09T23:59:59Z').kind, 'before');
assert.equal(state('2026-11-09T23:59:59Z').remaining, 1);
assert.equal(state('2026-11-10T00:00:00Z').kind, 'working');
assert.equal(state('2026-11-10T00:00:00Z').remaining, 9*3600);
assert.equal(state('2026-11-10T04:30:00Z').progress, .5);
assert.equal(state('2026-11-10T04:30:00Z').remaining, 4.5*3600);
assert.equal(state('2026-11-10T08:59:59Z').remaining, 1);
assert.equal(state('2026-11-10T09:00:00Z').kind, 'off');
assert.equal(state('2026-11-10T16:00:00Z').kind, 'before');
assert.equal(state('2026-11-14T04:00:00Z').kind, 'rest');
assert.equal(state('2026-11-15T04:00:00Z').kind, 'rest');
const custom = timer.readConfig(globalThis.OFFWORK_CONFIG,
  new URLSearchParams('start=09:30&end=18:30&days=0,2,4&accent=337ea9&theme=dark'));
assert.deepEqual(custom.workdays, [0,2,4]);
assert.equal(custom.accent, '#337ea9');
assert.equal(timer.stateAt(new Date('2026-11-10T01:00:00Z'),custom).kind, 'before');
for (const query of ['start=25:00','end=07:00','days=','days=8','theme=unknown','accent=red','timezone=invalid']) {
  assert.throws(() => timer.readConfig(globalThis.OFFWORK_CONFIG,new URLSearchParams(query)), query);
}
const dst = timer.readConfig(globalThis.OFFWORK_CONFIG,new URLSearchParams('timezone=America/New_York&days=0'));
assert.equal(timer.stateAt(new Date('2026-11-01T17:30:00Z'),dst).progress,.5);
for (const group of ['text','colors']) {
  for (const key of Object.keys(globalThis.OFFWORK_CONFIG[group])) {
    const incomplete = structuredClone(globalThis.OFFWORK_CONFIG);
    delete incomplete[group][key];
    assert.throws(() => timer.readConfig(incomplete,new URLSearchParams()), `Missing ${group}.${key} must be reported`);
  }
}
console.log('PASS: Taiwan second/minute boundaries, before/work/off/weekend, midnight, settings validation, DST zone');
