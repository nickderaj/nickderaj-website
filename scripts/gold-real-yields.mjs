// Reproduces the dataset behind caiomarchesani.com/articles/gold-and-real-yields
// Usage: node scripts/gold-real-yields.mjs
import { writeFileSync } from 'node:fs';
import { adf, fred, ols, sd, weekly, yahoo } from './lib.mjs';

const OUT = 'public/data/gold-real-yields/weekly.json';

const [gold, real, usd] = await Promise.all([yahoo('GC=F'), fred('DFII10'), fred('DTWEXBGS')]);
const g = weekly(gold),
  r = weekly(real),
  u = weekly(usd);
const dates = [...g.keys()].filter((d) => r.has(d)).sort(); // usd joined separately (weekly series, may be sparse at ends)
const rows = dates.map((d) => ({ d, gold: g.get(d), real: r.get(d), usd: u.get(d) ?? null }));

const train = rows.filter((x) => x.d <= '2021-12-31');
const fit = ols(
  train.map((x) => [x.real]),
  train.map((x) => Math.log(x.gold)),
);
const [b0, b1] = fit.beta;
const miss = sd(fit.resid, 2);
const out = rows.map((x) => {
  const line = Math.exp(b0 + b1 * x.real);
  return { ...x, line, ratio: x.gold / line };
});
const gap = (xs) => xs.map((x) => Math.log(x.ratio));
const adfIn = adf(gap(out.filter((x) => x.d <= '2021-12-31')));
const full = ols(
  out.map((x) => [x.real]),
  out.map((x) => Math.log(x.gold)),
);
const fullGap = out.map((x, i) => Math.log(x.gold) - (full.beta[0] + full.beta[1] * x.real));
const adfFull = adf(fullGap);
const lastInBand = [...out].reverse().find((x) => Math.abs(Math.log(x.ratio)) <= 2 * miss);
const bandWeeks = train.filter((x, i) => Math.abs(Math.log(out[i].ratio)) <= 2 * miss).length;

const stats = {
  weeksTrain: train.length,
  intercept: Math.exp(b0),
  slope: b1,
  r2: fit.r2,
  miss,
  adfIn,
  adfFull,
  lastInBand: lastInBand.d,
  bandWeeks,
  ratioPeak: Math.max(...out.map((x) => x.ratio)),
  ratioPeakDate: out.reduce((a, x) => (x.ratio > a.ratio ? x : a)).d,
  start: out[0].d,
  end: out.at(-1).d,
  n: out.length,
};
console.log(JSON.stringify(stats, null, 2));
writeFileSync(
  OUT,
  JSON.stringify({
    stats,
    rows: out.map((x) => ({
      ...x,
      gold: +x.gold.toFixed(2),
      line: +x.line.toFixed(2),
      ratio: +x.ratio.toFixed(4),
    })),
  }),
);
