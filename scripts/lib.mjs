export const START = '2006-01-01';
export const END = '2026-11-07'; // article's end date

export async function fred(id) {
  const res = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`);
  const rows = (await res.text()).trim().split('\n').slice(1);
  return rows
    .map((r) => r.split(','))
    .filter(([, v]) => v !== '.' && v !== '')
    .map(([d, v]) => [d, +v]);
}

export async function yahoo(ticker) {
  const p1 = Math.floor(Date.parse(START) / 1000);
  const p2 = Math.floor(Date.parse(END) / 1000) + 86400;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${p1}&period2=${p2}&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const j = (await res.json()).chart.result[0];
  const closes = j.indicators.quote[0].close;
  return j.timestamp
    .map((t, i) => [new Date(t * 1000).toISOString().slice(0, 10), closes[i]])
    .filter(([, v]) => v != null);
}

// Friday that ends the week containing date d (pandas W-FRI)
export function weekFri(d) {
  const t = new Date(`${d}T00:00:00Z`);
  const add = (5 - t.getUTCDay() + 7) % 7;
  t.setUTCDate(t.getUTCDate() + add);
  return t.toISOString().slice(0, 10);
}
export const weekly = (rows) => {
  const m = new Map();
  for (const [d, v] of rows) if (d >= START) m.set(weekFri(d), v); // rows are date-ascending -> last wins
  return m;
};

export function ols(X, y) {
  // X: array of rows (no constant); adds constant. Returns coefs, tstats, r2.
  const n = y.length,
    k = X[0].length + 1;
  const A = X.map((r) => [1, ...r]);
  const XtX = Array.from({ length: k }, () => Array(k).fill(0));
  const Xty = Array(k).fill(0);
  for (let i = 0; i < n; i++)
    for (let a = 0; a < k; a++) {
      Xty[a] += A[i][a] * y[i];
      for (let b = 0; b < k; b++) XtX[a][b] += A[i][a] * A[i][b];
    }
  const inv = invert(XtX);
  const beta = inv.map((row) => row.reduce((s, v, j) => s + v * Xty[j], 0));
  const res = A.map((r, i) => y[i] - r.reduce((s, v, j) => s + v * beta[j], 0));
  const sse = res.reduce((s, e) => s + e * e, 0);
  const ym = y.reduce((s, v) => s + v, 0) / n;
  const sst = y.reduce((s, v) => s + (v - ym) ** 2, 0);
  const s2 = sse / (n - k);
  return {
    beta,
    t: beta.map((b, i) => b / Math.sqrt(s2 * inv[i][i])),
    r2: 1 - sse / sst,
    resid: res,
  };
}
export function invert(M) {
  const n = M.length;
  const A = M.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]];
    const d = A[i][i];
    for (let j = 0; j < 2 * n; j++) A[i][j] /= d;
    for (let r = 0; r < n; r++)
      if (r !== i) {
        const f = A[r][i];
        for (let j = 0; j < 2 * n; j++) A[r][j] -= f * A[i][j];
      }
  }
  return A.map((r) => r.slice(n));
}
// ADF with constant and one lag on the gap series
export function adf(e) {
  const dy = e.slice(1).map((v, i) => v - e[i]);
  const X = [],
    y = [];
  for (let t = 1; t < dy.length; t++) {
    X.push([e[t], dy[t - 1]]);
    y.push(dy[t]);
  }
  const r = ols(X, y);
  const g = r.beta[1];
  return { t: r.t[1], halfLife: Math.log(0.5) / Math.log(1 + g) };
}
export const sd = (a, ddof) => {
  const m = a.reduce((s, v) => s + v, 0) / a.length;
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - ddof));
};
