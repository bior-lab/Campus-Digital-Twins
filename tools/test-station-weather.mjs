import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context = vm.createContext({ Intl, Date, URLSearchParams, AbortSignal });
vm.runInContext(readFileSync(new URL('../src/station-weather.js', import.meta.url), 'utf8'), context);
const api = context.NUSStationWeather;
const now = Date.parse('2026-09-07T14:00:00Z');
const input = [
  { t: '2026-09-07T01:00:00Z', v: 383.87738 },
  { t: '2026-09-07T04:00:00Z', v: 0.0306873936 },
  { t: '2026-09-07T07:00:00Z', v: null },
  { t: '2026-09-07T08:00:00Z', v: '' },
  { t: '2026-09-07T09:00:00Z', v: { Name: 'No Data' } },
  { t: '2026-09-07T10:00:00Z', v: 0 },
  { t: '2026-09-08T01:00:00Z', v: 900 },
];
const rows = api.normalise(input, now);
assert.equal(rows.length, 3);
assert.equal(rows[0].v, 383.87738, 'Generic normalisation does not infer a conversion');
assert.equal(rows[1].v, 0.0306873936, 'Generic normalisation keeps source values');
assert.equal(rows[2].v, 0, 'Keep legitimate zero');
const weekly = api.aggregate(rows, '7d', now);
assert.equal(weekly.filter(r => r.v !== null).length, 3);
assert.equal(weekly.find(r => r.t === Date.parse('2026-09-07T07:00:00Z')).v, null);
const monthly = api.aggregate(rows, '30d', now);
assert.equal(monthly.length, 30);
assert.equal(monthly.at(-1).n, 3);
assert.equal(monthly.at(-1).v, (383.87738 + 0.0306873936) / 3);
const yearly = api.aggregate(rows, 'yearly', now);
assert.equal(yearly.length, 9);
assert.equal(yearly[0].v, null);
assert.equal(yearly.at(-1).n, 3);
const midnight = api.normalise([{ t: '2026-08-31T16:00:00Z', v: 10 }], now);
assert.equal(api.aggregate(midnight, 'yearly', now)[8].v, 10, 'Bucket in SGT, not UTC');
assert.equal(api.normalise([input[0], { ...input[0], v: 42 }], now).length, 1);
assert.ok(Math.abs(api.wrapDegrees(383.87738) - 23.87738) < 1e-9);
assert.equal(api.wrapDegrees(-10), 350);
assert.ok(Math.abs(api.humidityPercent(0.0306873936) - 0.306873936) < 1e-9);
assert.equal(api.humidityPercent(10), 100);
assert.equal(api.humidityPercent(100), 100, 'Clamp out-of-range source values to the physical display range');
assert.ok(Math.abs(api.circularMean([350, 10])) < 1e-9, 'Circular mean crosses north instead of returning 180');
assert.ok(Math.abs(api.aggregate([{ t: Date.parse('2026-09-07T01:00:00Z'), v: 350 }, { t: Date.parse('2026-09-07T02:00:00Z'), v: 10 }], '30d', now, 'circular').at(-1).v) < 1e-9);
const recentNow = Date.parse('2026-10-19T07:28:00Z');
const irregular = api.normalise([
  { t: '2026-10-18T16:00:00.989013Z', v: 28 },
  { t: '2026-10-19T01:03:00.990005Z', v: 99 },
  { t: '2026-10-19T01:00:00.989013Z', v: 31 },
  { t: '2026-10-19T04:16:00Z', v: 88 },
  { t: '2026-10-19T06:59:00Z', v: 0 },
  { t: '2026-10-19T07:01:00Z', v: 10 },
  { t: '2026-10-19T07:24:00.990005Z', v: 32.9 },
], recentNow);
const irregularWeekly = api.aggregate(irregular, '7d', recentNow);
const sampleAt = t => irregularWeekly.find(r => r.t === Date.parse(t));
assert.equal(sampleAt('2026-10-18T16:00:00Z').v, 28, 'Fractional-second observations survive the SGT midnight boundary');
assert.equal(sampleAt('2026-10-19T01:00:00Z').v, 31, 'Use the closest observation, not a mean of the surrounding values');
assert.equal(sampleAt('2026-10-19T01:00:00Z').observedAt, Date.parse('2026-10-19T01:00:00.989013Z'), 'Keep the real source timestamp for tooltips');
assert.equal(sampleAt('2026-10-19T04:00:00Z').v, null, 'An observation beyond 15 minutes cannot fill a missing sample');
assert.equal(sampleAt('2026-10-19T07:00:00Z').v, 0, 'An equal-distance tie keeps the earlier real observation, including zero');
assert.equal(sampleAt('2026-10-19T07:00:00Z').n, 1);
assert.ok(irregularWeekly.every(r => r.t <= recentNow), 'Never create future chart slots');
assert.equal(api.aggregate([{ t: recentNow, v: 12 }], '7d', recentNow).filter(r => r.v !== null).length, 0, 'Do not carry a current value into an earlier three-hour sample');
console.log('PASS: station values, gaps, SGT buckets, sampling and diagnostic aggregates.');

// Exercise the source switch while four real-shaped requests are in flight.
const nodes = new Map();
const node = key => {
  if (!nodes.has(key)) nodes.set(key, { innerHTML: '', textContent: '', hidden: false,
    setAttribute() {}, append() {}, addEventListener() {}, focus() {}, classList: { toggle() {} },
    querySelector: selector => node(selector), querySelectorAll: selector => selector === '[data-station-period]' ? periodButtons : [] });
  return nodes.get(key);
};
const periodButtons = ['temperature', 'humidity', 'wind', 'solar'].flatMap(stationMetric => ['7d', '30d', 'yearly'].map(stationPeriod => ({
  dataset: { stationMetric, stationPeriod }, listeners: new Map(),
  addEventListener(type, listener) { this.listeners.set(type, listener); },
})));
const requests = [];
const timers = [], documentEvents = new Map(), windowEvents = new Map();
let clockNow = Date.now();
class ClockDate extends Date { static now() { return clockNow; } }
const document = { visibilityState: 'visible', querySelector: selector => node(selector), getElementById: id => node(id), createElement: () => node('panel'),
  addEventListener: (type, listener) => documentEvents.set(type, listener) };
const uiContext = vm.createContext({ Intl, Date: ClockDate, URLSearchParams, AbortSignal, document,
  setInterval: (callback, delay) => { timers.push({ callback, delay }); return timers.length; },
  addEventListener: (type, listener) => windowEvents.set(type, listener),
  fetch: url => new Promise(resolve => requests.push({ url, resolve })) });
vm.runInContext(readFileSync(new URL('../src/station-weather.js', import.meta.url), 'utf8'), uiContext);
const ui = uiContext.NUSStationWeather;
ui.select('sde4');
const load = ui.load('7d');
ui.load('yearly');
assert.equal(requests.length, 4, 'Period switching shares in-flight range requests');
ui.select('kent-ridge');
for (const [i, request] of requests.entries()) {
  request.resolve(i === 1 ? { ok: false, status: 503 } : { ok: true, json: async () => ({
    building: 'SDE4', point: new URL(request.url).searchParams.get('point'),
    points: [{ t: new Date(clockNow).toISOString(), v: 42 }] }) });
}
await new Promise(resolve => setImmediate(resolve));
assert.equal(requests.length, 5, 'A failed point is retried once');
requests[4].resolve({ ok: false, status: 503 });
await load;
assert.equal(node('weatherSourceStatus').textContent, 'Open-Meteo · loading', 'Late station responses cannot overwrite Kent Ridge');
ui.select('sde4');
await ui.load('yearly');
assert.equal(requests.length, 5, 'Cached station history reused');
for (const button of periodButtons.filter(button => button.dataset.stationPeriod === 'yearly')) button.listeners.get('click')();
assert.match(node('panel').innerHTML, /Air Temperature · Yearly/);
assert.match(node('panel').innerHTML, /Station data unavailable/, 'One failed point has its own failure state');
assert.match(node('panel').innerHTML, /Solar Irradiance · Yearly/);
assert.match(node('panel').innerHTML, /Relative Humidity · Yearly/);
assert.match(node('panel').innerHTML, /weather-axis-unit/, 'SDE4 charts use the same in-plot series label as Kent Ridge');
assert.match(node('panel').innerHTML, /weather-chart-tooltip/, 'SDE4 charts use the Kent Ridge floating tooltip component');
assert.match(node('panel').innerHTML, /data-station-hit/, 'SDE4 chart points expose accessible tooltip hit areas');
assert.doesNotMatch(node('panel').innerHTML, /station-readout/, 'The old inline readout is removed');
assert.doesNotMatch(node('panel').innerHTML, /Not converted|Invalid source signal|diagnostic/);
console.log('PASS: request deduplication, source-switch isolation, period switching and partial failure.');

assert.equal(timers.length, 1, 'Source switches must not create duplicate polling timers');
assert.equal(timers[0].delay, 5 * 60000);
const workspace = node('[data-workspace="weather"]');
document.visibilityState = 'hidden';
timers[0].callback();
assert.equal(requests.length, 5, 'A hidden browser tab does not poll');
document.visibilityState = 'visible';
workspace.hidden = true;
timers[0].callback();
assert.equal(requests.length, 5, 'Another dashboard section does not poll station history');
workspace.hidden = false;
ui.select('kent-ridge');
timers[0].callback();
assert.equal(requests.length, 5, 'The Open-Meteo view does not poll station history');
ui.select('sde4');
windowEvents.get('focus')();
assert.equal(requests.length, 5, 'Regaining focus reuses fresh data');
const resolveGoodRequests = start => {
  for (const request of requests.slice(start)) request.resolve({ ok: true, json: async () => ({
    building: 'SDE4', point: new URL(request.url).searchParams.get('point'),
    points: [{ t: new Date(clockNow).toISOString(), v: 43 }] }) });
};
clockNow += 5 * 60000;
const polling = timers[0].callback();
timers[0].callback();
assert.equal(requests.length, 9, 'Visible automatic refresh fetches four points and shares in-flight requests');
resolveGoodRequests(5);
await polling;
assert.doesNotMatch(node('panel').innerHTML, /Station data unavailable/, 'The next refresh recovers a previously failed point');
clockNow += 5 * 60000;
const resumed = documentEvents.get('visibilitychange')();
assert.equal(requests.length, 13, 'Returning to a visible tab fetches expired station data');
resolveGoodRequests(9);
await resumed;
assert.match(node('panel').innerHTML, /43 °C/, 'Automatic refresh updates the current-condition cards');
console.log('PASS: automatic refresh, focus/visibility recovery, hidden-view isolation and retry recovery.');
