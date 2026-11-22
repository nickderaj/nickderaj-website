// Applies the article's method (ln(price) on 10y real yield, fit 2006-2021) to other commodities.
// Usage: node scripts/commodities-real-yields.mjs
import { writeFileSync } from 'node:fs';
import { adf, fred, ols, sd, weekly, yahoo } from './lib.mjs';

const COMMODITIES = [
  { id: 'gold', name: 'Gold', ticker: 'GC=F' },
  { id: 'silver', name: 'Silver', ticker: 'SI=F' },
  { id: 'platinum', name: 'Platinum', ticker: 'PL=F' },
  { id: 'palladium', name: 'Palladium', ticker: 'PA=F' },
  { id: 'copper', name: 'Copper', ticker: 'HG=F' },
  { id: 'wti', name: 'WTI crude', ticker: 'CL=F' },
  { id: 'natgas', name: 'Natural gas', ticker: 'NG=F' },
  { id: 'corn', name: 'Corn', ticker: 'ZC=F' },
  { id: 'wheat', name: 'Wheat', ticker: 'ZW=F' },
];
const BREAK = '2021-12-31';
const real = weekly(await fred('DFII10'));
const corr = (a, b) => {
  const n = a.length,
    ma = a.reduce((s, v) => s + v, 0) / n,
    mb = b.reduce((s, v) => s + v, 0) / n;
  let sab = 0,
    saa = 0,
    sbb = 0;
  for (let i = 0; i < n; i++) {
    sab += (a[i] - ma) * (b[i] - mb);
    saa += (a[i] - ma) ** 2;
    sbb += (b[i] - mb) ** 2;
  }
  return { r: sab / Math.sqrt(saa * sbb), beta: sab / sbb };
};

const series = {};
const stats = [];
for (const c of COMMODITIES) {
  const px = weekly((await yahoo(c.ticker)).filter(([, v]) => v > 0)); // drop negative prints (WTI Apr-2020)
  const rows = [...px.keys()]
    .filter((d) => real.has(d))
    .sort()
    .map((d) => ({ d, p: px.get(d), r: real.get(d) }));
  const train = rows.filter((x) => x.d <= BREAK);
  const fit = ols(
    train.map((x) => [x.r]),
    train.map((x) => Math.log(x.p)),
  );
  const [b0, b1] = fit.beta;
  const miss = sd(fit.resid, 2);
  const out = rows.map((x) => ({
    ...x,
    line: Math.exp(b0 + b1 * x.r),
    ratio: x.p / Math.exp(b0 + b1 * x.r),
  }));
  const inSample = out.filter((x) => x.d <= BREAK);
  const post = out.filter((x) => x.d > BREAK);
  const full = ols(
    out.map((x) => [x.r]),
    out.map((x) => Math.log(x.p)),
  );
  const fullGap = out.map((x) => Math.log(x.p) - (full.beta[0] + full.beta[1] * x.r));
  const inBand = (x) => Math.abs(Math.log(x.ratio)) <= 2 * miss;
  const lastIn = [...out].reverse().find(inBand);
  const wk = (xs) => ({
    dp: xs.slice(1).map((x, i) => 100 * Math.log(x.p / xs[i].p)),
    dr: xs.slice(1).map((x, i) => x.r - xs[i].r),
  });
  const pre = wk(inSample),
    po = wk(post);
  const cPre = corr(pre.dp, pre.dr),
    cPost = corr(po.dp, po.dr);
  const last = out.at(-1);
  stats.push({
    id: c.id,
    name: c.name,
    ticker: c.ticker,
    start: out[0].d,
    nTrain: train.length,
    intercept: Math.exp(b0),
    slope: b1,
    r2: fit.r2,
    miss,
    adfIn: adf(inSample.map((x) => Math.log(x.ratio))),
    adfFull: adf(fullGap),
    bandShareIn: inSample.filter(inBand).length / inSample.length,
    bandSharePost: post.filter(inBand).length / post.length,
    lastInBand: lastIn?.d ?? null,
    lastRatio: last.ratio,
    peakRatio: Math.max(...post.map((x) => x.ratio)),
    troughRatio: Math.min(...post.map((x) => x.ratio)),
    weekly: { preCorr: cPre.r, preBeta: cPre.beta, postCorr: cPost.r, postBeta: cPost.beta },
  });
  series[c.id] = out.map((x) => [x.d, +x.p.toFixed(3), +x.ratio.toFixed(4)]);
}
console.table(
  stats.map((s) => ({
    id: s.id,
    start: s.start,
    r2: s.r2.toFixed(2),
    slope: s.slope.toFixed(3),
    miss: s.miss.toFixed(2),
    adfT: s.adfIn.t.toFixed(2),
    hl: s.adfIn.halfLife.toFixed(0),
    fullT: s.adfFull.t.toFixed(2),
    bandIn: s.bandShareIn.toFixed(2),
    bandPost: s.bandSharePost.toFixed(2),
    lastIn: s.lastInBand,
    now: s.lastRatio.toFixed(2),
    preCorr: s.weekly.preCorr.toFixed(2),
    postCorr: s.weekly.postCorr.toFixed(2),
  })),
);
writeFileSync('public/data/gold-real-yields/commodities.json', JSON.stringify({ stats, series }));
