/* SDE4 station presentation conversions: RH 0–10 signal to 0–100%, clamped to
 * its physical display range; wind direction normalized to [0, 360). */
(function (root) {
  "use strict";
  const HOUR = 3600000, DAY = 24 * HOUR, OFFSET = 8 * HOUR;
  const SAMPLE_TOLERANCE = 15 * 60000, REFRESH_MS = 5 * 60000;
  const wrapDegrees = value => ((Number(value) % 360) + 360) % 360;
  const humidityPercent = value => Math.min(100, Math.max(0, Number(value) * 10));
  function circularMean(values) {
    if (!values.length) return null;
    const vectors = values.reduce((sum, value) => {
      const radians = wrapDegrees(value) * Math.PI / 180;
      return { x: sum.x + Math.cos(radians), y: sum.y + Math.sin(radians) };
    }, { x: 0, y: 0 });
    if (Math.hypot(vectors.x, vectors.y) < 1e-9) return null;
    return wrapDegrees(Math.atan2(vectors.y, vectors.x) * 180 / Math.PI);
  }
  const metrics = [
    { key: "temperature", name: "Air Temperature", pointName: "SDE4 Weather Station Air Temperature", unit: "°C", digits: 1, color: "#b33c30", kpiClass: "temperature" },
    { key: "humidity", name: "Relative Humidity", pointName: "SDE4 Weather Station Relative Humidity", unit: "%RH", digits: 0, color: "#1769aa", kpiClass: "humidity", transform: humidityPercent, min: 0, max: 100 },
    { key: "wind", name: "Wind Direction", pointName: "SDE4 Weather Station Wind Direction", unit: "°", digits: 0, color: "#247c70", kpiClass: "wind", transform: wrapDegrees, aggregate: "circular" },
    { key: "solar", name: "Solar Irradiance", pointName: "SDE4 Weather Station Solar Irradiance", unit: "W/m²", digits: 0, color: "#ef7c00", kpiClass: "solar" },
  ];
  function normalise(points, now = Date.now(), transform = value => value) {
    const rows = new Map();
    for (const p of points || []) {
      const t = Date.parse(p.t), v = p.v;
      if (!Number.isFinite(t) || t > now || v === null || v === undefined ||
          (typeof v !== "number" && typeof v !== "string") || String(v).trim() === "" || !Number.isFinite(Number(v))) continue;
      const converted = transform(Number(v));
      if (!Number.isFinite(converted)) continue;
      rows.set(t, { t, v: converted });
    }
    return [...rows.values()].sort((a, b) => a.t - b.t);
  }
  function aggregate(rows, period, now = Date.now(), method = "arithmetic") {
    const localNow = new Date(now + OFFSET);
    const today = Math.floor((now + OFFSET) / DAY) * DAY - OFFSET;
    const slots = [], buckets = new Map(), samples = new Map();
    let start;
    if (period === "yearly") {
      const year = localNow.getUTCFullYear();
      start = Date.UTC(year, 0, 1) - OFFSET;
      for (let m = 0; m <= localNow.getUTCMonth(); m++) slots.push(Date.UTC(year, m, 1) - OFFSET);
    } else if (period === "30d") {
      start = today - 29 * DAY;
      for (let t = start; t <= today; t += DAY) slots.push(t);
    } else {
      start = today - 6 * DAY;
      for (let t = start; t <= now; t += 3 * HOUR) slots.push(t);
    }
    for (const row of rows) {
      if (row.t < start || row.t > now) continue;
      if (period === "7d") {
        const slot = Math.round((row.t + OFFSET) / (3 * HOUR)) * 3 * HOUR - OFFSET;
        const distance = Math.abs(row.t - slot), previous = samples.get(slot);
        // Use an actual nearby observation; never interpolate or carry a stale value.
        if (slot < start || slot > now || distance > SAMPLE_TOLERANCE) continue;
        if (!previous || distance < Math.abs(previous.t - slot) ||
            (distance === Math.abs(previous.t - slot) && row.t < previous.t)) samples.set(slot, row);
        continue;
      }
      const d = new Date(row.t + OFFSET);
      const key = period === "yearly" ? Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) - OFFSET
        : Math.floor((row.t + OFFSET) / DAY) * DAY - OFFSET;
      const bucket = buckets.get(key) || [];
      bucket.push(row.v); buckets.set(key, bucket);
    }
    return slots.map(t => {
      if (period === "7d") {
        const sample = samples.get(t);
        return { t, v: sample ? sample.v : null, n: sample ? 1 : 0, observedAt: sample?.t ?? null };
      }
      const values = buckets.get(t) || [];
      const value = !values.length ? null : method === "circular" ? circularMean(values)
        : values.reduce((a, b) => a + b, 0) / values.length;
      return { t, v: value, n: values.length };
    });
  }
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const dateLabel = (t, options = {}) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Singapore", day: "2-digit", month: "short", ...options }).format(new Date(t));
  const number = (v, digits = 1) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: digits }).format(v);
  let active = false, period = "7d", pending = null, fetchedAt = 0, records = [], panel;
  const periods = Object.fromEntries(metrics.map(metric => [metric.key, "7d"]));
  let originalIdentity, originalSubtitle;
  async function fetchRange(metric) {
    const point = metric.pointName;
    const params = new URLSearchParams({ building: "SDE4", point, start: "-365d", stop: "now()", limit: "20000" });
    let lastError;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(`https://buildingdt.org/realtime/range?${params}`, { signal: AbortSignal.timeout(30000), cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (payload.building !== "SDE4" || payload.point !== point || !Array.isArray(payload.points)) throw new Error("Unexpected point response");
        return normalise(payload.points, Date.now(), metric.transform);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }
  function init() {
    if (panel) return;
    const workspace = document.querySelector('[data-workspace="weather"]');
    const identity = workspace.querySelector(".weather-station-identity");
    originalIdentity = identity.innerHTML;
    originalSubtitle = workspace.querySelector(".workspace-topbar p")?.textContent;
    panel = document.createElement("section");
    panel.id = "stationWeatherCharts";
    panel.setAttribute("aria-label", "SDE4 weather station observations");
    panel.hidden = true;
    workspace.querySelector(".weather-analysis-content").append(panel);
    const refreshVisible = (force = false) => {
      if (active && !workspace.hidden && document.visibilityState !== "hidden") return load(period, force);
    };
    root.setInterval(() => refreshVisible(true), REFRESH_MS);
    document.addEventListener("visibilitychange", () => refreshVisible());
    root.addEventListener("focus", () => refreshVisible());
  }
  function select(value) {
    init(); active = value === "sde4";
    const workspace = document.querySelector('[data-workspace="weather"]');
    workspace.classList.toggle("sde4-weather-active", active);
    panel.hidden = !active;
    workspace.querySelector(".weather-station-identity").innerHTML = active
      ? "<span>Weather station location</span><strong>SDE4 Weather Station</strong><small>On-site weather station</small>" : originalIdentity;
    const subtitle = workspace.querySelector(".workspace-topbar p");
    if (subtitle) subtitle.textContent = active ? "SDE4 · on-site weather station observations" : originalSubtitle;
    document.getElementById("weatherLocationNote").textContent = active
      ? "On-site weather station · weather data."
      : "Open-Meteo · model-based weather at NUS Kent Ridge coordinates.";
    document.getElementById("weatherSourceStatus").textContent = active ? "SDE4 · loading" : "Open-Meteo · loading";
    document.getElementById("weatherUpdated").textContent = "Awaiting update";
  }
  async function load(nextPeriod = period, force = false) {
    init(); period = nextPeriod;
    if (pending) { render(period); return pending; }
    if (!force && fetchedAt && Date.now() - fetchedAt < REFRESH_MS) { render(period); return; }
    records = [];
    pending = (async () => {
      const results = await Promise.allSettled(metrics.map(fetchRange));
      records = results.map((r, i) => ({ metric: metrics[i], rows: r.status === "fulfilled" ? r.value : [], error: r.status === "rejected" }));
      fetchedAt = Date.now();
    })().finally(() => { pending = null; if (active) render(period); });
    render(period);
    return pending;
  }
  function chart(metric, rows, period) {
    const values = rows.filter(r => r.v !== null);
    if (!values.length) return '<div class="weather-empty"><strong>No reported data</strong><span>No usable values for this metric and period.</span></div>';
    const w = 850, h = 270, left = 70, right = 20, top = 25, bottom = 38;
    let low = Number.isFinite(metric.min) ? metric.min : Math.min(...values.map(r => r.v));
    let high = Number.isFinite(metric.max) ? metric.max : Math.max(...values.map(r => r.v));
    const dataLow = low;
    if (!Number.isFinite(metric.min) || !Number.isFinite(metric.max)) {
      const pad = Math.max((high - low) * 0.12, Math.abs(high) * 0.02, 0.01);
      low -= pad; high += pad;
    }
    const roughStep = (high - low) / 4;
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const step = [1, 2, 5, 10].find(n => n * magnitude >= roughStep) * magnitude;
    low = Math.floor(low / step) * step;
    if (dataLow >= 0) low = Math.max(0, low);
    high = Math.ceil(high / step) * step;
    const x = i => left + i / Math.max(rows.length - 1, 1) * (w - left - right);
    const y = v => top + (high - v) / (high - low) * (h - top - bottom);
    let path = "", connected = false;
    rows.forEach((r, i) => { if (r.v === null) { connected = false; return; } path += `${connected ? "L" : "M"}${x(i)},${y(r.v)} `; connected = true; });
    const ticks = Array.from({ length: Math.round((high - low) / step) + 1 }, (_, i) => {
      const v = low + step * i;
      return `<line x1="${left}" x2="${w - right}" y1="${y(v)}" y2="${y(v)}"/><text x="${left - 8}" y="${y(v) + 4}" text-anchor="end">${number(v, metric.digits)}</text>`;
    }).join("");
    const labels = [...new Set([0, Math.floor((rows.length - 1) / 4), Math.floor((rows.length - 1) / 2), Math.floor((rows.length - 1) * 3 / 4), rows.length - 1])].map(i =>
      `<text x="${x(i)}" y="${h - 12}" text-anchor="${i === 0 ? "start" : i === rows.length - 1 ? "end" : "middle"}">${escape(dateLabel(rows[i].t, period === "yearly" ? { day: undefined, year: "numeric" } : {}))}</text>`).join("");
    const dots = rows.map((r, i) => {
      if (r.v === null) return "";
      const label = `${dateLabel(r.observedAt ?? r.t, period === "7d" ? { hour: "2-digit", minute: "2-digit" } : period === "yearly" ? { day: undefined, year: "numeric" } : {})} SGT · ${number(r.v, metric.digits)} ${metric.unit} · ${period === "7d" ? "3-hour sample" : `mean of ${r.n} available observations`}`;
      return `<circle class="${metric.key}" cx="${x(i)}" cy="${y(r.v)}" r="3"><title>${escape(label)}</title></circle>`;
    }).join("");
    const hits = rows.map((r, i) => {
      if (r.v === null) return "";
      const start = i === 0 ? left : (x(i - 1) + x(i)) / 2;
      const end = i === rows.length - 1 ? w - right : (x(i) + x(i + 1)) / 2;
      const time = dateLabel(r.observedAt ?? r.t, period === "7d" ? { hour: "2-digit", minute: "2-digit" } : period === "yearly" ? { day: undefined, year: "numeric" } : {});
      const display = metric.key === "wind" ? `${number(r.v, metric.digits)}° ${compass(r.v)}` : `${number(r.v, metric.digits)} ${metric.unit}`;
      const detail = period === "7d" ? "3-hour sample" : period === "30d" ? `Daily average · ${r.n} observations` : `Monthly average · ${r.n} observations`;
      return `<rect class="weather-chart-hit" tabindex="0" role="img" aria-label="Inspect ${escape(time)}" data-station-hit data-station-time="${escape(time)}" data-station-display="${escape(display)}" data-station-detail="${escape(detail)}" data-station-x="${x(i)}" data-station-y="${y(r.v)}" x="${start}" y="${top}" width="${Math.max(1, end - start)}" height="${h - top - bottom}"></rect>`;
    }).join("");
    return `<svg viewBox="0 0 ${w} ${h}" role="group" aria-label="${escape(metric.name)} ${escape(metric.unit)}"><text class="weather-axis-unit" x="${left}" y="14">${escape(metric.name)} ${escape(metric.unit)}</text><g class="station-grid">${ticks}${labels}</g><path class="station-line ${metric.key}" d="${path}"/>${dots}<line class="weather-hover-line" y1="${top}" y2="${h - bottom}" hidden></line><circle class="weather-hover-dot ${metric.key}" r="5" hidden></circle><g>${hits}</g></svg><div class="weather-chart-tooltip" role="status" hidden data-station-tooltip><header></header><div><span><i class="${metric.key}"></i>${escape(metric.name)}</span><strong></strong></div><small></small></div><p class="weather-chart-note">Source: On-site weather station · Singapore time (SGT)</p>`;
  }
  function render(nextPeriod = period) {
    period = nextPeriod;
    if (!active) return;
    init();
    const now = Date.now();
    document.getElementById("weatherSourceStatus").textContent = pending ? "SDE4 · loading" : "On-site weather station · SDE4";
    const latestTimes = records.map((record) => record.rows.at(-1)?.t).filter(Number.isFinite);
    const latestTime = latestTimes.length ? Math.max(...latestTimes) : null;
    document.getElementById("weatherUpdated").textContent = pending ? "Loading station history" : latestTime ? `Updated ${dateLabel(latestTime, { hour: "2-digit", minute: "2-digit" })} SGT` : "No update available";
    const currentCards = metrics.map(metric => {
      const record = records.find(r => r.metric.key === metric.key);
      const latest = record?.rows.at(-1);
      const display = !latest ? "--" : metric.key === "wind" ? `${number(latest.v, metric.digits)}° ${compass(latest.v)}` : `${number(latest.v, metric.digits)} ${metric.unit}`;
      return `<div class="${metric.kpiClass}"><span>${metric.name}</span><strong>${display}</strong><small>${latest ? dateLabel(latest.t, { hour: "2-digit", minute: "2-digit" }) + " SGT" : "No current value"}</small></div>`;
    }).join("");
    panel.innerHTML = `<section class="weather-current-summary station-current-summary"><h2>Current conditions <span>Latest available · independent of chart period</span></h2><div class="weather-kpi-strip">${currentCards}</div></section><div class="station-toolbar"><span>Station observations</span><button type="button" class="nems-refresh" id="stationRefresh" ${pending ? "disabled" : ""}>${pending ? "Loading…" : "Refresh"}</button></div>` + metrics.map(metric => {
      const period = periods[metric.key];
      const periodName = period === "yearly" ? "Yearly" : period === "30d" ? "Monthly" : "Weekly";
      const mode = period === "yearly" ? "Year to date · monthly means · current month partial" : period === "30d" ? "Last 30 calendar days · daily means · today partial" : "Last 7 calendar days · one sample every 3 hours";
      const controls = `<div class="segmented weather-period-control" role="group" aria-label="${metric.name} reporting period">${[["7d", "Weekly"], ["30d", "Monthly"], ["yearly", "Yearly"]].map(([value, label]) => `<button type="button" data-station-metric="${metric.key}" data-station-period="${value}" class="${value === period ? "active" : ""}" aria-pressed="${value === period}">${label}</button>`).join("")}</div>`;
      const record = records.find(r => r.metric.key === metric.key);
      const rows = aggregate(record?.rows || [], period, now, metric.aggregate), latest = record?.rows.at(-1);
      const range = `${dateLabel(rows[0].t, { year: "numeric" })} – ${dateLabel(now, { year: "numeric" })}`;
      return `<article class="dashboard-card station-card"><header><div><h2>${metric.name} · ${periodName}</h2><p>${range} · ${mode}</p></div><div class="chart-legend weather-chart-legend"><span style="--series:${metric.color}">${metric.name} · ${metric.unit}</span></div>${controls}</header><div class="weather-chart-frame station-chart">${pending ? '<div class="weather-loading">Loading station observations…</div>' : record?.error ? '<div class="weather-empty"><strong>Station data unavailable</strong><span>This point could not be loaded. Use Refresh to retry.</span></div>' : chart(metric, rows, period)}</div></article>`;
    }).join("");
    document.getElementById("stationRefresh").addEventListener("click", () => load(period, true));
    panel.querySelectorAll("[data-station-period]").forEach(button => button.addEventListener("click", () => {
      const { stationMetric, stationPeriod } = button.dataset;
      periods[stationMetric] = stationPeriod;
      render();
      panel.querySelector(`[data-station-metric="${stationMetric}"][data-station-period="${stationPeriod}"]`)?.focus({ preventScroll: true });
    }));
    panel.querySelectorAll(".station-chart").forEach(frame => {
      const tooltip = frame.querySelector("[data-station-tooltip]");
      const line = frame.querySelector(".weather-hover-line");
      const dot = frame.querySelector(".weather-hover-dot");
      const hide = () => { if (!tooltip || !line || !dot) return; tooltip.hidden = true; line.hidden = true; dot.hidden = true; };
      frame.querySelectorAll("[data-station-hit]").forEach(hit => {
        const show = () => {
          const x = Number(hit.dataset.stationX), y = Number(hit.dataset.stationY);
          line.setAttribute("x1", x); line.setAttribute("x2", x); line.hidden = false;
          dot.setAttribute("cx", x); dot.setAttribute("cy", y); dot.hidden = false;
          tooltip.querySelector("header").textContent = hit.dataset.stationTime;
          tooltip.querySelector("strong").textContent = hit.dataset.stationDisplay;
          tooltip.querySelector("small").textContent = hit.dataset.stationDetail;
          tooltip.hidden = false;
          const pixelX = x / 850 * frame.clientWidth;
          tooltip.style.left = `${Math.max(112, Math.min(frame.clientWidth - 112, pixelX))}px`;
          tooltip.classList.toggle("align-right", pixelX > frame.clientWidth * 0.78);
        };
        hit.addEventListener("pointerenter", show); hit.addEventListener("pointermove", show);
        hit.addEventListener("focus", show); hit.addEventListener("blur", hide);
      });
      frame.addEventListener("pointerleave", hide);
    });
  }
  function compass(value) {
    return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(wrapDegrees(value) / 45) % 8];
  }
  root.NUSStationWeather = { isActive: () => active, select, load, render, normalise, aggregate, wrapDegrees, humidityPercent, circularMean, metrics };
})(globalThis);
