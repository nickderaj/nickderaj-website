// Applies the article's method (ln(price) on 10y real yield, fit 2006-2021) to ~48 alternative commodities.
// Sources: Yahoo (weekly futures), Sina Finance (SHFE/DCE/ZCE main contracts, weekly; free feed ends 2024-07), FRED/IMF (monthly).
// Usage: node scripts/alternatives-real-yields.mjs  (Node >= 22.21: NODE_USE_ENV_PROXY=1 behind a proxy)
import { writeFileSync } from 'node:fs';
import { adf, END, fred, ols, sd, weekly, yahoo } from './lib.mjs';

const BREAK = '2021-12-31';
const realD = await fred('DFII10');
const realW = weekly(realD);
const realM = new Map();
{
  const acc = {};
  for (const [d, v] of realD) (acc[d.slice(0, 7)] ??= []).push(v);
  for (const [k, a] of Object.entries(acc))
    realM.set(k + '-01', a.reduce((s, v) => s + v, 0) / a.length);
}

const sina = async (sym) => {
  const r = await fetch(
    `https://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesDailyKLine?symbol=${sym}`,
  );
  return (await r.json()).map((x) => [x[0], +x[4]]).filter(([d, v]) => d <= END && v > 0);
};
const fredM = async (id) =>
  (await fred(id)).filter(([d]) => d >= '2006-01-01' && d <= '2026-09-30');

const SPEC = [
  // Yahoo, weekly
  ...[
    ['soyoil', 'Soybean oil', 'ZL=F'],
    ['soymeal', 'Soybean meal', 'ZM=F'],
    ['soybeans', 'Soybeans', 'ZS=F'],
    ['oats', 'Oats', 'ZO=F'],
    ['rice', 'Rough rice', 'ZR=F'],
    ['cotton', 'Cotton', 'CT=F'],
    ['coffee', 'Coffee', 'KC=F'],
    ['sugar', 'Sugar #11', 'SB=F'],
    ['cocoa', 'Cocoa', 'CC=F'],
    ['oj', 'Orange juice', 'OJ=F'],
    ['hogs', 'Lean hogs', 'HE=F'],
    ['cattle', 'Live cattle', 'LE=F'],
    ['feeder', 'Feeder cattle', 'GF=F'],
    ['milk', 'Class III milk', 'DC=F'],
    ['heatoil', 'Heating oil', 'HO=F'],
    ['brent', 'Brent crude', 'BZ=F'],
    ['alu', 'Aluminium', 'ALI=F'],
    ['hrc', 'US hot-rolled steel', 'HRC=F'],
    ['iron', 'Iron ore 62%', 'TIO=F'],
  ].map(([id, name, t]) => ({
    id,
    name,
    src: 'Yahoo',
    freq: 'w',
    get: async () => (await yahoo(t)).filter(([, v]) => v > 0),
  })),
  // Sina (SHFE / DCE / ZCE main continuous), weekly
  ...[
    ['bitumen', 'China bitumen (SHFE BU)', 'BU0'],
    ['sh_rubber', 'China rubber (SHFE)', 'RU0'],
    ['sh_rebar', 'China rebar (SHFE)', 'RB0'],
    ['apples', 'China apples (ZCE)', 'AP0'],
    ['jujube', 'China red dates (ZCE)', 'CJ0'],
    ['eggs', 'China eggs (DCE)', 'JD0'],
    ['palm', 'China palm oil (DCE)', 'P0'],
    ['rapeoil', 'China rapeseed oil (ZCE)', 'OI0'],
    ['rapemeal', 'China rapeseed meal (ZCE)', 'RM0'],
    ['coke', 'China coke (DCE)', 'J0'],
    ['pvc', 'China PVC (DCE)', 'V0'],
    ['glass', 'China glass (ZCE)', 'FG0'],
  ].map(([id, name, s]) => ({ id, name, src: 'Sina', freq: 'w', get: () => sina(s) })),
  // FRED / IMF monthly
  ...[
    ['sunoil', 'Sunflower oil (IMF)', 'PSUNOUSDM'],
    ['rapeoil_m', 'Rapeseed oil (IMF)', 'PROILUSDM'],
    ['rubber_m', 'Rubber (IMF)', 'PRUBBUSDM'],
    ['palm_m', 'Palm oil (IMF)', 'PPOILUSDM'],
    ['uranium', 'Uranium (IMF)', 'PURANUSDM'],
    ['ironore_m', 'Iron ore (IMF)', 'PIORECRUSDM'],
    ['tin', 'Tin (IMF)', 'PTINUSDM'],
    ['nickel', 'Nickel (IMF)', 'PNICKUSDM'],
    ['zinc', 'Zinc (IMF)', 'PZINCUSDM'],
    ['lead', 'Lead (IMF)', 'PLEADUSDM'],
    ['coal', 'Australian coal (IMF)', 'PCOALAUUSDM'],
    ['wool', 'Wool (IMF)', 'PWOOLCUSDM'],
    ['barley', 'Barley (IMF)', 'PBARLUSDM'],
    ['tea', 'Tea (IMF)', 'PTEAUSDM'],
    ['oranges', 'Oranges (IMF)', 'PORANGUSDM'],
    ['bananas', 'Bananas (IMF)', 'PBANSOPUSDM'],
    ['rice_m', 'Thai rice (IMF)', 'PRICENPQUSDM'],
  ].map(([id, name, f]) => ({ id, name, src: 'FRED/IMF', freq: 'm', get: () => fredM(f) })),
];

const GROUP = {
  agri: [
    'soybeans',
    'soymeal',
    'soyoil',
    'oats',
    'rice',
    'cotton',
    'coffee',
    'sugar',
    'cocoa',
    'oj',
  ],
  livestock: ['hogs', 'cattle', 'feeder', 'milk'],
  energy: ['heatoil', 'brent', 'alu', 'hrc', 'iron'],
};
const groupOf = (c) =>
  c.src === 'Sina'
    ? 'china'
    : c.src === 'FRED/IMF'
      ? 'imf'
      : Object.keys(GROUP).find((g) => GROUP[g].includes(c.id));

const out = [];
const series = {};
for (const c of SPEC) {
  try {
    const raw = await c.get();
    const px = new Map();
    if (c.freq === 'w') for (const [d, v] of weekly(raw)) px.set(d, v);
    else for (const [d, v] of raw) px.set(d, v);
    const real = c.freq === 'w' ? realW : realM;
    const rows = [...px.keys()]
      .filter((d) => real.has(d) && px.get(d) > 0)
      .sort()
      .map((d) => ({ d, p: px.get(d), r: real.get(d) }));
    const train = rows.filter((x) => x.d <= BREAK),
      post = rows.filter((x) => x.d > BREAK);
    if (train.length < 60 || post.length < 20) {
      out.push({ ...c, skip: `train ${train.length} post ${post.length}` });
      continue;
    }
    const fit = ols(
      train.map((x) => [x.r]),
      train.map((x) => Math.log(x.p)),
    );
    const [b0, b1] = fit.beta,
      miss = sd(fit.resid, 2);
    const o = rows.map((x) => ({ ...x, ratio: x.p / Math.exp(b0 + b1 * x.r) }));
    const ins = o.filter((x) => x.d <= BREAK),
      pst = o.filter((x) => x.d > BREAK);
    const inBand = (x) => Math.abs(Math.log(x.ratio)) <= 2 * miss;
    const lastIn = [...o].reverse().find(inBand);
    const corr = (xs) => {
      const a = xs.map((x) => Math.log(x.p)),
        b = xs.map((x) => x.r);
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
      return sab / Math.sqrt(saa * sbb);
    };
    series[c.id] = o.map((x) => [x.d, +x.p.toFixed(2), +x.ratio.toFixed(3)]);
    out.push({
      id: c.id,
      name: c.name,
      src: c.src,
      group: groupOf(c),
      freq: c.freq,
      start: o[0].d,
      end: o.at(-1).d,
      nTrain: train.length,
      nPost: post.length,
      breakout: false,
      r2: fit.r2,
      slope: b1,
      miss,
      adfT: adf(ins.map((x) => Math.log(x.ratio))).t,
      bandIn: ins.filter(inBand).length / ins.length,
      bandPost: pst.filter(inBand).length / pst.length,
      now: o.at(-1).ratio,
      peak: Math.max(...pst.map((x) => x.ratio)),
      trough: Math.min(...pst.map((x) => x.ratio)),
      lastIn: lastIn?.d,
      corrPre: corr(ins),
      corrPost: corr(pst),
    });
  } catch (e) {
    out.push({ id: c.id, name: c.name, skip: e.message });
  }
}
// Break-out rule: real pre-2022 fit (R² >= 0.30) and mostly outside its band afterwards (<= 40% of weeks inside).
for (const s of out) if (!s.skip) s.breakout = s.r2 >= 0.3 && s.bandPost <= 0.4;
writeFileSync(
  'public/data/gold-real-yields/alternatives.json',
  JSON.stringify({ stats: out.filter((s) => !s.skip), series }),
);
const skipped = out.filter((s) => s.skip);
if (skipped.length) console.log('skipped', skipped);
const f = (x, n = 2) => (x == null ? '' : x.toFixed(n));
console.table(
  out.map((s) =>
    s.skip
      ? { name: s.name, skip: s.skip }
      : {
          name: s.name,
          src: s.src,
          start: s.start.slice(0, 7),
          nTr: s.nTrain,
          r2: f(s.r2),
          slope: f(s.slope, 3),
          adfT: f(s.adfT),
          bandIn: f(s.bandIn * 100, 0),
          bandPost: f(s.bandPost * 100, 0),
          now: f(s.now),
          trough: f(s.trough),
          peak: f(s.peak),
          lastIn: s.lastIn?.slice(0, 7),
          cPre: f(s.corrPre),
          cPost: f(s.corrPost),
        },
  ),
);
