// Facts comparing the series flagged `breakout` in alternatives.json with gold. Prints markdown tables.
// Needs: public/data/gold-real-yields/{commodities,alternatives}.json (run the other two scripts first).
// Usage: node scripts/breakout-comparison.mjs  (Node >= 22.21: NODE_USE_ENV_PROXY=1 behind a proxy)
import { readFileSync } from 'node:fs';
import { fred, ols, weekly } from './lib.mjs';

const dir = 'public/data/gold-real-yields';
const A = JSON.parse(readFileSync(`${dir}/alternatives.json`, 'utf8'));
const C = JSON.parse(readFileSync(`${dir}/commodities.json`, 'utf8'));
const BREAK = '2021-12-31';

const realD = await fred('DFII10');
const realW = weekly(realD);
const realM = new Map();
{
  const acc = {};
  for (const [d, v] of realD) (acc[d.slice(0, 7)] ??= []).push(v);
  for (const [k, a] of Object.entries(acc))
    realM.set(`${k}-01`, a.reduce((s, v) => s + v, 0) / a.length);
}

const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const corr = (a, b) => {
  const ma = mean(a),
    mb = mean(b);
  let x = 0,
    y = 0,
    z = 0;
  for (let i = 0; i < a.length; i++) {
    x += (a[i] - ma) * (b[i] - mb);
    y += (a[i] - ma) ** 2;
    z += (b[i] - mb) ** 2;
  }
  return x / Math.sqrt(y * z);
};
const diff = (v) => v.slice(1).map((x, i) => x - v[i]);
const monthly = (pts) => {
  const acc = {};
  for (const [d, p] of pts) (acc[`${d.slice(0, 7)}-01`] ??= []).push(p);
  return new Map(Object.entries(acc).map(([k, a]) => [k, mean(a)]));
};

const ids = ['gold', ...A.stats.filter((s) => s.breakout).map((s) => s.id)];
const stat = (id) =>
  id === 'gold' ? C.stats.find((s) => s.id === 'gold') : A.stats.find((s) => s.id === id);
const raw = (id) => (id === 'gold' ? C.series.gold : A.series[id]);
const isMonthly = (id) => A.stats.find((s) => s.id === id)?.freq === 'm';
const goldPx = (monthlyBasis) => {
  const pts = C.series.gold.map(([d, p]) => [d, p]);
  return monthlyBasis ? monthly(pts) : new Map(pts);
};

const f = (v, n = 2) => v.toFixed(n);
const pct = (v) => `${v >= 0 ? '+' : ''}${(100 * v).toFixed(0)}%`;
const rows = [];
for (const id of ids) {
  const s = stat(id);
  const m = isMonthly(id);
  const px = new Map(raw(id).map(([d, p]) => [d, p]));
  const real = m ? realM : realW;
  const gold = goldPx(m);
  const ds = [...px.keys()].filter((d) => real.has(d) && gold.has(d)).sort();
  const pre = ds.filter((d) => d <= BREAK),
    post = ds.filter((d) => d > BREAK);
  const L = (xs) => xs.map((d) => Math.log(px.get(d)));
  const G = (xs) => xs.map((d) => Math.log(gold.get(d)));
  const R = (xs) => xs.map((d) => real.get(d));
  const trend = (v) =>
    ols(
      v.map((_, i) => [i]),
      v,
    ).r2;
  const ratios = raw(id)
    .filter(([d]) => d > BREAK)
    .map((x) => x[2]);
  const last = ds.at(-1),
    base = pre.at(-1);
  rows.push({
    id,
    name: s.name,
    m,
    end: last,
    nPost: post.length,
    r2: s.r2,
    slope: Math.exp(s.slope) - 1,
    bandIn: s.bandIn ?? s.bandShareIn,
    bandPost: s.bandPost ?? s.bandSharePost,
    lastIn: s.lastIn ?? s.lastInBand,
    now: raw(id).at(-1)[2],
    peak: Math.max(...ratios),
    levPre: corr(L(pre), R(pre)),
    levPost: corr(L(post), R(post)),
    chgPre: corr(diff(L(pre)), diff(R(pre))),
    chgPost: corr(diff(L(post)), diff(R(post))),
    ret: px.get(last) / px.get(base) - 1,
    goldRet: gold.get(last) / gold.get(base) - 1,
    levGold: corr(L(post), G(post)),
    chgGold: corr(diff(L(post)), diff(G(post))),
    trend: trend(L(post)),
    goldTrend: trend(G(post)),
  });
}

const out = [];
out.push(
  '| | Fit R² (to 2021) | Price change per +1 pt real yield | In band, to 2021 | In band, after 2021 | Last week in band | Latest ÷ line | Peak ÷ line after 2021 |',
  '| --- | --- | --- | --- | --- | --- | --- | --- |',
);
for (const r of rows)
  out.push(
    `| ${r.name} | ${f(r.r2)} | ${pct(r.slope)} | ${f(100 * r.bandIn, 0)}% | ${f(100 * r.bandPost, 0)}% | ${r.lastIn.slice(0, 7)} | ${f(r.now, 1)}× | ${f(r.peak, 1)}× |`,
  );
out.push(
  '',
  '| | Level corr. with real yield, to 2021 | Level corr., after 2021 | Change corr. with real yield, to 2021 | Change corr., after 2021 |',
  '| --- | --- | --- | --- | --- |',
);
for (const r of rows)
  out.push(`| ${r.name} | ${f(r.levPre)} | ${f(r.levPost)} | ${f(r.chgPre)} | ${f(r.chgPost)} |`);
out.push(
  '',
  '| | Price change since end-2021 | Gold, same dates | Level corr. with gold, after 2021 | Change corr. with gold, after 2021 | R² of ln price on time, after 2021 | Same for gold |',
  '| --- | --- | --- | --- | --- | --- | --- |',
);
for (const r of rows.slice(1))
  out.push(
    `| ${r.name} | ${pct(r.ret)} | ${pct(r.goldRet)} | ${f(r.levGold)} | ${f(r.chgGold)} | ${f(r.trend)} | ${f(r.goldTrend)} |`,
  );
console.log(out.join('\n'));
console.error(rows.map((r) => `${r.id}: monthly=${r.m} end=${r.end} nPost=${r.nPost}`).join('\n'));
