import type { Project } from '@/types/content.ts';

export const quantTradingLabs = {
  id: 'quant-trading-labs',
  slug: 'quant-trading-labs',
  title: 'Quant Research & Risk Engine',
  thesis:
    'A pre-registered research programme across crypto, commodities and equity index futures, one study of which is now a productionised risk engine.',
  period: '2024 - present',
  tags: [
    'Python',
    'Statistics',
    'Risk Management',
    'Deflated Sharpe',
    'GARCH',
    'EVT',
    'uv',
    'ruff',
    'mypy',
    'pytest',
  ],
  links: [
    { label: 'Repo', href: 'https://github.com/nickderaj/quant-trading-labs' },
    { label: 'Live', href: 'https://quant-trading-labs.vercel.app/' },
  ],
  screenshots: [
    {
      src: '/screenshots/quant-trading-labs/var-es-dashboard.png',
      alt: 'The risk engine dashboard: the validated forecast envelope, key terms, and a calibration strip covering the 16-product universe with OK and BREACH status per product.',
      caption: 'Risk engine dashboard with per-product calibration status.',
    },
    {
      src: '/screenshots/quant-trading-labs/calibration-plot.png',
      alt: 'VaR and Expected Shortfall by horizon, the trailing breach-rate calibration table, and a bar chart of the last 250 sessions of returns with the 1 percent VaR band overlaid.',
      caption:
        'Horizon table, trailing breach rate, and the last 250 sessions against the 1% VaR band.',
    },
  ],
  body: [
    { kind: 'heading', level: 2, text: 'Problem' },
    {
      kind: 'paragraph',
      text: 'Most retail-visible "quant strategies" are a single backtest with no out-of-sample discipline and no accounting for multiple-testing bias. I wanted to find out, honestly, whether any tradable edge survived a pre-registered research process across crypto, commodities and equity index futures - and to build something useful out of what came through it.',
    },
    { kind: 'heading', level: 2, text: 'Approach' },
    {
      kind: 'paragraph',
      text: 'Every hypothesis was registered before it was tested: entry/exit logic, universe, sample split and success criteria written down first. Candidate signals ran through realistic transaction costs, walk-forward holdout windows, and Deflated Sharpe Ratio correction for the number of trials - the standard fix for the fact that testing enough strategies will eventually produce a good-looking one by chance alone.',
    },
    {
      kind: 'list',
      items: [
        'Deflated Sharpe Ratio applied across the full trial count, not per-strategy',
        'Walk-forward holdout splits - no result is reported purely in-sample',
        'Realistic cost and slippage assumptions applied uniformly across candidates',
      ],
    },
    { kind: 'heading', level: 2, text: 'Result' },
    {
      kind: 'paragraph',
      text: 'GARCH-t/EVT fat-tail calibration came through the process as the result worth productionising: it models return distributions with a Student-t GARCH process and Extreme Value Theory in the tails rather than assuming normality. It now runs as a live Value-at-Risk and Expected Shortfall engine over 16 futures contracts, with continuous calibration monitoring flagging drift between forecast and realised exceedances.',
    },
    {
      kind: 'stat',
      label: 'Futures covered by the live engine',
      value: '16',
      note: 'continuous calibration monitoring, out-of-sample',
    },
  ],
} as const satisfies Project;
