// How alternative commodities co-move: pairwise correlations, basket behaviour and stress-period returns.
// Groups (weekly log returns, Friday closes):
//   main  = 9 mainstream commodity futures (gold, silver, platinum, palladium, copper, WTI, nat gas, corn, wheat); DJP (Bloomberg commodity ETN) is the benchmark
//   other = 19 other Yahoo futures used in the alternative-commodities section of the real-yields post
//   china = 12 Chinese onshore futures (SHFE/DCE/ZCE main contract via Sina; the free feed ends 2024-07-19)
// Writes public/data/alt-correlations.json and prints a summary.
// Usage: node scripts/alt-correlations.mjs  (Node >= 22.21: NODE_USE_ENV_PROXY=1 behind a proxy)
import { writeFileSync } from 'node:fs';
import { weekFri } from './lib.mjs';

const START = '2006-01-01';
const END = '2026-11-21';
const ALT = JSON.parse(
  (await import('node:fs')).readFileSync('public/data/gold-real-yields/alternatives.json', 'utf8'),
);
const name = (id) => ALT.stats.find((s) => s.id === id)?.name ?? id;

const MAIN = [
  ['gold', 'Gold', 'GC=F'],
  ['silver', 'Silver', 'SI=F'],
  ['platinum', 'Platinum', 'PL=F'],
  ['palladium', 'Palladium', 'PA=F'],
  ['copper', 'Copper', 'HG=F'],
  ['wti', 'WTI crude', 'CL=F'],
  ['natgas', 'Natural gas', 'NG=F'],
  ['corn', 'Corn', 'ZC=F'],
  ['wheat', 'Wheat', 'ZW=F'],
  ['djp', 'Bloomberg commodity ETN', 'DJP'],
];
const OTHER = [
  ['soyoil', 'ZL=F'],
  ['soymeal', 'ZM=F'],
  ['soybeans', 'ZS=F'],
  ['oats', 'ZO=F'],
  ['rice', 'ZR=F'],
  ['cotton', 'CT=F'],
  ['coffee', 'KC=F'],
  ['sugar', 'SB=F'],
  ['cocoa', 'CC=F'],
  ['oj', 'OJ=F'],
  ['hogs', 'HE=F'],
  ['cattle', 'LE=F'],
  ['feeder', 'GF=F'],
  ['milk', 'DC=F'],
  ['heatoil', 'HO=F'],
  ['brent', 'BZ=F'],
  ['alu', 'ALI=F'],
  ['hrc', 'HRC=F'],
  ['iron', 'TIO=F'],
].map(([id, t]) => [id, name(id), t]);
const CHINA = [
  ['bitumen', 'BU0'],
  ['sh_rubber', 'RU0'],
  ['sh_rebar', 'RB0'],
  ['apples', 'AP0'],
  ['jujube', 'CJ0'],
  ['eggs', 'JD0'],
  ['palm', 'P0'],
  ['rapeoil', 'OI0'],
  ['rapemeal', 'RM0'],
  ['coke', 'J0'],
  ['pvc', 'V0'],
  ['glass', 'FG0'],
].map(([id, t]) => [id, name(id), t]);
const BENCH = [
  ['spx', 'S&P 500', '^GSPC'],
  ['ndx', 'Nasdaq', '^IXIC'],
];

const yahoo = async (t) => {
  const p1 = Math.floor(Date.parse(START) / 1000),
    p2 = Math.floor(Date.parse(END) / 1000);
  const r = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(t)}?period1=${p1}&period2=${p2}&interval=1d`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } },
  );
  const j = (await r.json()).chart.result[0];
  const c = j.indicators.quote[0].close;
  return j.timestamp
    .map((x, i) => [new Date(x * 1000).toISOString().slice(0, 10), c[i]])
    .filter(([, v]) => v != null && v > 0);
};
const sina = async (s) => {
  const r = await fetch(
    `https://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesDailyKLine?symbol=${s}`,
  );
  return (await r.json())
    .map((x) => [x[0], +x[4]])
    .filter(([d, v]) => d >= START && d <= END && v > 0);
};
const toWeekly = (rows) => {
  const m = new Map();
  for (const [d, v] of rows) m.set(weekFri(d), v);
  return m;
};

const group = { main: [], other: [], china: [], bench: [] };
for (const [g, list, get] of [
  ['main', MAIN, yahoo],
  ['other', OTHER, yahoo],
  ['china', CHINA, sina],
  ['bench', BENCH, yahoo],
])
  for (const [id, nm, t] of list) group[g].push({ id, name: nm, px: toWeekly(await get(t)) });

// weekly log-return map keyed by Friday date (only consecutive weeks)
const rets = (px) => {
  const d = [...px.keys()].sort(),
    out = new Map();
  for (let i = 1; i < d.length; i++) {
    const gap = (Date.parse(d[i]) - Date.parse(d[i - 1])) / 864e5;
    if (gap <= 10) out.set(d[i], Math.log(px.get(d[i]) / px.get(d[i - 1])));
  }
  return out;
};
for (const g of Object.values(group)) for (const s of g) s.r = rets(s.px);

const corr = (a, b, lo = '0000', hi = '9999', min = 100) => {
  const x = [],
    y = [];
  for (const [d, v] of a)
    if (d >= lo && d <= hi && b.has(d)) {
      x.push(v);
      y.push(b.get(d));
    }
  if (x.length < min) return null;
  const n = x.length,
    mx = x.reduce((s, v) => s + v, 0) / n,
    my = y.reduce((s, v) => s + v, 0) / n;
  let sxy = 0,
    sxx = 0,
    syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
};
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const pairs = (A, B, lo, hi) => {
  const out = [];
  for (let i = 0; i < A.length; i++)
    for (let j = B === A ? i + 1 : 0; j < B.length; j++) {
      const c = corr(A[i].r, B[j].r, lo, hi);
      if (c != null) out.push({ a: A[i].name, b: B[j].name, c });
    }
  return out;
};
const summ = (p) => ({
  n: p.length,
  mean: mean(p.map((x) => x.c)),
  median: median(p.map((x) => x.c)),
  pctNeg: p.filter((x) => x.c < 0).length / p.length,
  pctAbove03: p.filter((x) => x.c > 0.3).length / p.length,
});

const W = {
  full: ['0000', '9999'],
  pre: ['0000', '2021-12-31'],
  post: ['2022-01-01', '9999'],
  postChina: ['2022-01-01', '2024-07-19'],
  preChina: ['0000', '2021-12-31'],
};
const res = { within: {}, cross: {}, vsBench: {}, top: {} };
const sets = { main: group.main, other: group.other, china: group.china };
for (const [k, S] of Object.entries(sets)) {
  res.within[k] = {};
  for (const [wn, [lo, hi]] of Object.entries(W)) res.within[k][wn] = summ(pairs(S, S, lo, hi));
}
for (const [a, b] of [
  ['main', 'other'],
  ['main', 'china'],
  ['other', 'china'],
]) {
  res.cross[`${a}-${b}`] = {};
  for (const [wn, [lo, hi]] of Object.entries(W))
    res.cross[`${a}-${b}`][wn] = summ(pairs(sets[a], sets[b], lo, hi));
}
// vs S&P 500 and vs DJP
const spx = group.bench[0],
  djp = group.main.find((s) => s.id === 'djp');
for (const [k, S] of Object.entries(sets)) {
  res.vsBench[k] = {};
  for (const [wn, [lo, hi]] of Object.entries(W)) {
    const cs = S.filter((s) => s.id !== 'djp')
      .map((s) => corr(s.r, spx.r, lo, hi))
      .filter((x) => x != null);
    const cd = S.filter((s) => s.id !== 'djp')
      .map((s) => corr(s.r, djp.r, lo, hi))
      .filter((x) => x != null);
    res.vsBench[k][wn] = {
      spxMean: mean(cs),
      spxMin: Math.min(...cs),
      spxMax: Math.max(...cs),
      djpMean: mean(cd),
      n: cs.length,
    };
  }
}
// top / bottom pairs across all groups, full sample, >= 150 weeks
const all = [...group.main, ...group.other, ...group.china].filter((s) => s.id !== 'djp');
const allPairs = [];
for (let i = 0; i < all.length; i++)
  for (let j = i + 1; j < all.length; j++) {
    const c = corr(all[i].r, all[j].r, '0000', '9999', 150);
    if (c != null) allPairs.push({ a: all[i].name, b: all[j].name, c });
  }
allPairs.sort((x, y) => y.c - x.c);
res.top = {
  pos: allPairs.slice(0, 12),
  neg: allPairs.slice(-12).reverse(),
  nPairs: allPairs.length,
  pctNeg: allPairs.filter((p) => p.c < 0).length / allPairs.length,
};

// equal-weight baskets
const basket = (S, lo, hi) => {
  const dates = new Set();
  for (const s of S) for (const d of s.r.keys()) if (d >= lo && d <= hi) dates.add(d);
  const out = new Map();
  for (const d of [...dates].sort()) {
    const v = S.map((s) => s.r.get(d)).filter((x) => x != null);
    if (v.length >= Math.max(3, S.length / 2)) out.set(d, mean(v));
  }
  return out;
};
const stat = (r) => {
  const v = [...r.values()],
    n = v.length,
    m = mean(v);
  const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / (n - 1));
  let eq = 0,
    peak = 0,
    mdd = 0;
  for (const x of v) {
    eq += x;
    peak = Math.max(peak, eq);
    mdd = Math.min(mdd, eq - peak);
  }
  return {
    weeks: n,
    annRet: 52 * m,
    annVol: sd * Math.sqrt(52),
    sharpeLike: (52 * m) / (sd * Math.sqrt(52)),
    maxDD: 1 - Math.exp(mdd),
    cumLog: eq,
  };
};
const mainEx = group.main.filter((s) => s.id !== 'djp');
const bk = {
  main: basket(mainEx, '2006-01-01', '9999'),
  other: basket(group.other, '2006-01-01', '9999'),
  china: basket(group.china, '2006-01-01', '2024-07-19'),
};
res.basket = {};
for (const [k, r] of Object.entries(bk)) {
  const lo = r.size ? [...r.keys()].sort()[0] : '',
    hi = [...r.keys()].sort().at(-1);
  res.basket[k] = {
    ...stat(r),
    from: lo,
    to: hi,
    corrSpx: corr(r, spx.r, '0000', '9999', 50),
    corrDjp: corr(r, djp.r, '0000', '9999', 50),
    avgMemberVol: mean(
      (k === 'main' ? mainEx : k === 'other' ? group.other : group.china).map(
        (s) => stat(s.r).annVol,
      ),
    ),
  };
}
res.basket.spx = { ...stat(spx.r), corrSpx: 1 };
res.basket.djp = { ...stat(djp.r), corrSpx: corr(djp.r, spx.r) };
// basket-to-basket correlations
res.basketCorr = {
  'main-other': corr(bk.main, bk.other),
  'main-china(<=2024-07)': corr(bk.main, bk.china),
  'other-china(<=2024-07)': corr(bk.other, bk.china),
};

// stress episodes: cumulative log return over [from, to]
const win = (px, from, to) => {
  const d = [...px.keys()].sort();
  const a = d.filter((x) => x <= from).at(-1),
    b = d.filter((x) => x <= to).at(-1);
  return a &&
    b &&
    a >= '2000' &&
    d.includes(a) &&
    Date.parse(from) - Date.parse(a) < 12 * 864e5 &&
    Date.parse(to) - Date.parse(b) < 12 * 864e5
    ? px.get(b) / px.get(a) - 1
    : null;
};
const EP = [
  ['GFC sell-off', '2008-09-12', '2008-11-21'],
  ['COVID crash', '2020-02-21', '2020-03-20'],
  ['2022 rate shock', '2022-01-07', '2022-10-14'],
  ['Last two weeks', '2026-11-06', '2026-11-20'],
];
res.episodes = [];
for (const [label, from, to] of EP) {
  const row = { label, from, to, spx: win(spx.px, from, to), djp: win(djp.px, from, to) };
  for (const [k, S] of Object.entries({ main: mainEx, other: group.other, china: group.china })) {
    const r = S.map((s) => ({ n: s.name, r: win(s.px, from, to) })).filter((x) => x.r != null);
    row[k] = r.length
      ? {
          n: r.length,
          median: median(r.map((x) => x.r)),
          mean: mean(r.map((x) => x.r)),
          up: r.filter((x) => x.r > 0).length,
          best: r.reduce((a, b) => (b.r > a.r ? b : a)),
          worst: r.reduce((a, b) => (b.r < a.r ? b : a)),
        }
      : null;
  }
  res.episodes.push(row);
}
// worst 20 S&P weeks since 2006
const worst = [...spx.r.entries()]
  .sort((a, b) => a[1] - b[1])
  .slice(0, 20)
  .map(([d]) => d);
res.worstSpxWeeks = { weeks: worst.length };
for (const [k, S] of Object.entries({ main: mainEx, other: group.other, china: group.china })) {
  const perWeek = worst
    .map((d) => {
      const v = S.map((s) => s.r.get(d)).filter((x) => x != null);
      return v.length
        ? { avg: mean(v), up: v.filter((x) => x > 0).length / v.length, n: v.length }
        : null;
    })
    .filter(Boolean);
  res.worstSpxWeeks[k] = {
    weeksCovered: perWeek.length,
    meanOfAvg: mean(perWeek.map((x) => x.avg)),
    meanShareUp: mean(perWeek.map((x) => x.up)),
    weeksAvgUp: perWeek.filter((x) => x.avg > 0).length,
  };
}
res.worstSpxWeeks.spxMean = mean(worst.map((d) => spx.r.get(d)));
res.worstSpxWeeks.spxMin = Math.min(...worst.map((d) => spx.r.get(d)));
res.worstSpxWeeks.spxMax = Math.max(...worst.map((d) => spx.r.get(d)));
// Markets named by Babbedge (Top Traders Unplugged, Apr 2026) that have live Yahoo prices; ETFs/equities are proxies.
const NAMED = [
  ['ttf', 'Dutch TTF gas', 'TTF=F'],
  ['iron', 'Iron ore 62%', 'TIO=F'],
  ['hrc', 'US hot-rolled steel', 'HRC=F'],
  ['krbn', 'Global carbon ETF (KRBN)', 'KRBN'],
  ['kcca', 'California carbon ETF (KCCA)', 'KCCA'],
  ['bdry', 'Dry bulk freight ETF (BDRY)', 'BDRY'],
  ['coal', 'Coal equities ETF (COAL)', 'COAL'],
  ['ura', 'Uranium equities ETF (URA)', 'URA'],
];
const named = [];
for (const [id, nm, t] of NAMED) {
  const px = toWeekly(await yahoo(t));
  named.push({ id, name: nm, px, r: rets(px), start: [...px.keys()].sort()[0] });
}
const nStart = named
  .map((x) => x.start)
  .sort()
  .at(-1);
const np = pairs(named, named, nStart, '9999');
res.named = {
  commonStart: nStart,
  starts: Object.fromEntries(named.map((x) => [x.name, x.start])),
  pairs: summ(np),
  top: [...np].sort((a, b) => b.c - a.c),
  vsSpx: named.map((x) => ({
    name: x.name,
    spx: corr(x.r, spx.r, nStart, '9999', 50),
    djp: corr(x.r, djp.r, nStart, '9999', 50),
  })),
};
const move = (px, from, to) => {
  const d = [...px.keys()].sort();
  const a = d.filter((x) => x <= from).at(-1),
    b = d.filter((x) => x <= to).at(-1);
  return px.get(b) / px.get(a) - 1;
};
const dayMove = (rows) => rows.at(-1)[1] / rows.at(-2)[1] - 1;
const RECENT = [
  ...BENCH,
  ['djp', 'Bloomberg commodity ETN', 'DJP'],
  ['gold', 'Gold', 'GC=F'],
  ['copper', 'Copper', 'HG=F'],
  ['wti', 'WTI crude', 'CL=F'],
  ['natgas', 'US natural gas', 'NG=F'],
  ['alu', 'Aluminium', 'ALI=F'],
  ...NAMED,
];
res.recent = [];
for (const [id, nm, t] of RECENT) {
  const rows = await yahoo(t),
    px = new Map(rows);
  res.recent.push({
    id,
    name: nm,
    ticker: t,
    last: rows.at(-1)[0],
    day: dayMove(rows),
    week: move(px, '2026-11-13', '2026-11-20'),
    twoWeek: move(px, '2026-11-06', '2026-11-20'),
  });
}
res.meta = {
  start: START,
  end: END,
  nMain: mainEx.length,
  nOther: group.other.length,
  nChina: group.china.length,
  lastWeek: [...spx.r.keys()].sort().at(-1),
};
writeFileSync('public/data/alt-correlations.json', JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
