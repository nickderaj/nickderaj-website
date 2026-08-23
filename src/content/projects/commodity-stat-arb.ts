import type { Project } from '@/types/content.ts';

export const commodityStatArb = {
  id: 'commodity-stat-arb',
  slug: 'commodity-stat-arb',
  title: 'Commodity Futures Spread Trading System',
  thesis:
    'Spun out of the risk-engine research — a mean-reversion book trading cointegrated commodity spreads, running unattended in paper production.',
  period: '2024 — present',
  tags: [
    'Python 3.11',
    'PostgreSQL 16',
    'Alembic',
    'Docker',
    'Databento',
    'Plotly Dash',
    'Cointegration',
  ],
  links: [{ label: 'Repo', href: 'https://github.com/nickderaj/commodity-stat-arb' }],
  screenshots: [
    {
      src: '/screenshots/commodity-stat-arb/equity-curve.svg',
      alt: 'Plotly Dash panel showing the cumulative equity curve of the commodity spread book from 2010 to present, including the held-out 2024–2026 segment.',
      caption: 'Live Dash equity curve, full-sample and held-out segments.',
    },
    {
      src: '/screenshots/commodity-stat-arb/spread-zscore.svg',
      alt: 'Chart of a cointegrated commodity spread’s rolling z-score against its entry and exit thresholds, with trade markers.',
      caption: 'Spread z-score signal with entry/exit thresholds.',
    },
    {
      src: '/screenshots/commodity-stat-arb/drawdown-postmortem.svg',
      alt: 'Annotated drawdown chart tracing the -11.3% paper drawdown to a single unstopped trade, with the subsequent rebuilt stop layer overlaid.',
      caption: 'Post-mortem on the -11.3% drawdown that drove the stop-layer rebuild.',
    },
  ],
  spunOutOf: 'quant-trading-labs',
  body: [
    { kind: 'heading', level: 2, text: 'Problem' },
    {
      kind: 'paragraph',
      text: 'The risk-engine research (project 1) set a universe of futures with well-understood tail behaviour. This project asks the next question of the same universe: is there a systematic, explainable edge in the relative pricing between related commodity contracts, and can it survive being run unattended rather than just backtested?',
    },
    { kind: 'heading', level: 2, text: 'Approach' },
    {
      kind: 'paragraph',
      text: 'Candidate pairs and baskets are screened for cointegration with Engle-Granger, Johansen and ADF tests, then traded on the resulting spread’s z-score with regime gates from the term structure — the same "divide the timeline into labelled regimes" grammar used on the career chart. An early single-pair Brent–WTI proof of concept (Sharpe 0.41 post-cost over 8.5 years, 73% win rate) validated the mechanics before scaling to the full 5-spread book reported below; the two numbers describe different scopes of the same system, not conflicting results.',
    },
    {
      kind: 'list',
      items: [
        'Engle-Granger, Johansen and ADF cointegration screening across candidate commodity pairs',
        'Z-score entry/exit signals with term-structure regime gates',
        'PostgreSQL 16 + Alembic for trade and calibration history, Databento for futures data, Dockerised for unattended operation',
      ],
    },
    { kind: 'heading', level: 2, text: 'Result' },
    {
      kind: 'paragraph',
      text: 'Full-sample backtest (2010–2026): +49.0% cumulative return, Sharpe 0.68. Held-out sample (2024–2026, out-of-sample): +14.9%, Sharpe 1.14, roughly 70% hit rate across 470+ trades. A -11.3% paper drawdown was traced to a single unstopped trade rather than a broken model, and the risk layer was rebuilt around that failure: ATR-based stop sizing, adverse-excursion stops, and per-spread calibration instead of one global stop rule. The system now runs unattended in paper production.',
    },
    {
      kind: 'stat',
      label: 'Full-sample return',
      value: '+49.0%',
      note: '2010–2026, in-sample',
    },
    { kind: 'stat', label: 'Full-sample Sharpe', value: '0.68', note: '2010–2026, in-sample' },
    {
      kind: 'stat',
      label: 'Held-out return',
      value: '+14.9%',
      note: '2024–2026, out-of-sample',
    },
    { kind: 'stat', label: 'Held-out Sharpe', value: '1.14', note: '2024–2026, out-of-sample' },
    {
      kind: 'stat',
      label: 'Hit rate',
      value: '~70%',
      note: 'across 470+ trades, out-of-sample',
    },
    {
      kind: 'stat',
      label: 'Peak paper drawdown',
      value: '-11.3%',
      note: 'traced to one unstopped trade, pre-rebuild',
    },
    { kind: 'heading', level: 2, text: "What I'd change" },
    {
      kind: 'paragraph',
      text: 'Per-spread calibration was reactive — it followed the drawdown rather than anticipating the failure mode. I would build stop-sizing validation into the pre-registration step itself (project 1’s discipline, applied here), so a spread cannot go live without an explicit worst-case single-trade loss bound. I would also extend the regime gates to commodity-specific seasonality rather than term structure alone.',
    },
  ],
} as const satisfies Project;
