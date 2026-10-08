import assert from 'node:assert/strict';
import '../src/building-history.js';
const { normalise, combineComponents, aggregate } = globalThis.NUSBuildingHistory;
const point = (date, value) => ({ t: `${date}T12:00:00+08:00`, v: value });
const now = Date.parse('2026-09-07T20:00:00+08:00');

assert.equal(normalise([point('2026-08-01', null), point('2026-08-02', ''), point('2026-08-03', false), point('2026-08-04', 'NaN')]).length, 0);
assert.equal(normalise([point('2026-08-01', 0)]).length, 1, 'zero is real reported data');
assert.equal(normalise([point('2026-08-01', 2), point('2026-08-01', 3)]).length, 1, 'duplicate timestamps must not inflate totals');
assert.equal(aggregate([], now), null);
assert.equal(aggregate([point('2026-09-07', 5)], now), null, 'exclude incomplete current day');
const mixed = aggregate([point('2026-09-06', 20), point('2026-08-01', 10), point('2026-08-03', 30), point('2026-09-07', 99)], now);
assert.equal(mixed.monthlyMonth, '2026-08');
assert.equal(mixed.monthly.length, 31);
assert.equal(mixed.monthly[1], null, 'missing is not zero');
assert.equal(mixed.yearly[7], 40);
assert.equal(mixed.yearly[8], 20);
assert.equal(mixed.yearly[0], null);
assert.equal(mixed.monthProfiles['2026-09'].labels.length, 30);
assert.equal(mixed.monthProfiles['2026-08'].reportedDays, 2);
assert.equal(mixed.monthProfiles['2026-08'].partialDays, 2);
assert.equal(aggregate([point('2024-02-01', 1)], Date.parse('2024-03-01T00:00:00+08:00')).monthly.length, 29);
assert.equal(aggregate([point('2026-02-01', 1)], Date.parse('2026-03-01T00:00:00+08:00')).monthly.length, 28);
assert.equal(aggregate([point('2025-12-31', 1)], Date.parse('2026-01-01T00:00:00+08:00')).yearly[0], null, 'do not relabel last year');
const boundary = aggregate([{ t: '2026-08-31T16:00:00Z', v: 2 }], now);
assert.equal(boundary.monthlyLabels[0], '2026-09-01', 'Singapore day boundary');
const combined = combineComponents([[point('2026-08-01', 3), point('2026-08-02', 4)], [point('2026-08-01', 5)]]);
assert.equal(combined.length, 1, 'both PV components required');
assert.equal(combined[0].v, 8);
assert.equal(combineComponents([[point('2026-08-01', 3)], []]).length, 0);
const fullJuly = Array.from({ length: 31 * 24 }, (_, i) => ({ t: new Date(Date.parse('2026-07-01T00:00:00+08:00') + i * 3600000).toISOString(), v: 1 }));
const partialAugust = [...fullJuly, point('2026-08-01', 5)];
assert.equal(aggregate(partialAugust, now).monthlyMonth, '2026-07', 'prefer a fully reported ended month over a newer incomplete month');
assert.equal(aggregate(fullJuly, now).monthProfiles['2026-07'].partialDays, 0);
assert.equal(aggregate([point('2026-09-01', 5)], now).monthlyMonth, '2026-09', 'allow current partial month when it is the only available data');
// COM3 cooling: correct only the verified invalid hour, preserving the day's
// other 23 readings, raw input, unrelated series and later source repairs.
const octoberNow = Date.parse('2026-10-08T12:00:00+08:00');
const com3Context = { building: 'COM3', metric: 'cooling' };
const badHour = '2026-09-08T15:00:00.000Z';
const september = Array.from({ length: 30 * 24 }, (_, i) => ({
  t: new Date(Date.parse('2026-09-01T00:00:00+08:00') + i * 3600000).toISOString(),
  v: 100,
}));
september.find(row => row.t === badHour).v = -1677469.88;
const original = structuredClone(september);
const corrected = aggregate(combineComponents([september]), octoberNow, com3Context);
assert.deepEqual(september, original, 'raw API data must not be mutated');
assert.equal(corrected.monthlyMonth, '2026-09');
assert.equal(corrected.monthProfiles['2026-09'].values[7], 2300, 'keep the 23 valid hours on Sept 8');
assert.equal(corrected.yearly[8], 71900, 'yearly September and monthly KPI use the corrected total');
assert.equal(corrected.monthly.reduce((total, value) => total + value, 0), corrected.yearly[8]);
assert.equal(corrected.monthProfiles['2026-09'].values[6], 2400);
assert.equal(corrected.monthProfiles['2026-09'].values[8], 2400);
assert.deepEqual(corrected.corrections, [{ t: badHour, date: '2026-09-08', originalValue: -1677469.88, replacementValue: 0 }]);
assert.equal(corrected.monthProfiles['2026-09'].partialDays, 0);
assert.equal(aggregate([{ t: '2026-09-08T23:00:00+08:00', v: -1 }], octoberNow, com3Context).monthly[7], 0, 'match equivalent Singapore timestamps');
for (const context of [{ building: 'SDE4', metric: 'cooling' }, { building: 'COM3', metric: 'electricity' }, {}]) {
  const unchanged = aggregate(september, octoberNow, context);
  assert.equal(unchanged.monthly[7], 2300 - 1677469.88, 'do not apply COM3 cooling correction to other series');
  assert.deepEqual(unchanged.corrections, []);
}
const repaired = aggregate([{ t: badHour, v: 98 }], octoberNow, com3Context);
assert.equal(repaired.monthly[7], 98, 'accept a corrected upstream reading');
assert.deepEqual(repaired.corrections, []);
assert.equal(aggregate([{ t: badHour, v: 0 }], octoberNow, com3Context).corrections.length, 0);
assert.equal(aggregate([{ t: badHour, v: null }], octoberNow, com3Context), null, 'missing stays missing');
assert.equal(aggregate([{ t: '2026-09-08T14:00:00Z', v: -5 }], octoberNow, com3Context).monthly[7], -5, 'do not silently change unreviewed hours');
console.log('PASS: aggregation, month lengths, Singapore boundaries, missing/zero/invalid data, deduplication, PV completeness, scoped COM3 correction and monthly/yearly consistency.');
