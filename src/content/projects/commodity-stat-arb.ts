import type { Project } from '@/types/content.ts';

export const commodityStatArb = {
  id: 'commodity-stat-arb',
  slug: 'commodity-stat-arb',
  title: 'Commodity Futures Spread Trading System',
  thesis:
    'Spun out of the risk-engine research - a mean-reversion book trading cointegrated commodity spreads, running unattended in paper production.',
  period: '2024 - present',
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
      src: '/screenshots/commodity-stat-arb/trade-brent-calendar.png',
      alt: 'Trade chart for a long Brent calendar spread, showing the spread close against its 30-day prior mean and a 1.5 sigma band, with entry, stop and z-score exit marked, plus a z-score subplot below.',
      caption: 'Brent calendar spread, long, +27.34 ATR. Entry, stop and z-score exit marked.',
    },
    {
      src: '/screenshots/commodity-stat-arb/trade-bean-corn.png',
      alt: 'Trade chart for a short soybean-corn spread showing entry, exit and the rolling z-score that generated the signal.',
      caption: 'Soybean-corn spread, short, +3.08 ATR.',
    },
    {
      src: '/screenshots/commodity-stat-arb/trade-kc-chicago-wheat.png',
      alt: 'Trade chart for a long KC-Chicago wheat spread showing entry, exit and the rolling z-score that generated the signal.',
      caption: 'KC-Chicago wheat spread, long, +1.56 ATR.',
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
      text: 'Candidate pairs and baskets are screened for cointegration with Engle-Granger, Johansen and ADF tests, then traded on the resulting spread’s z-score with regime gates from the term structure - the same "divide the timeline into labelled regimes" grammar used on the career chart. An early single-pair Brent–WTI proof of concept (Sharpe 0.41 post-cost over 8.5 years, 73% win rate) validated the mechanics before scaling to the full 5-spread book reported below; the two numbers describe different scopes of the same system, not conflicting results.',
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
  ],
} as const satisfies Project;
