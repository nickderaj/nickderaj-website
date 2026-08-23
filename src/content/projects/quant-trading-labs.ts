import type { Project } from '@/types/content.ts';

export const quantTradingLabs = {
  id: 'quant-trading-labs',
  slug: 'quant-trading-labs',
  title: 'Quant Research & Risk Engine',
  thesis:
    'A 22-notebook pre-registered research programme where most tests returned null — and the one that survived is now a live VaR/ES engine.',
  period: '2024 — present',
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
      alt: 'Live dashboard showing Value-at-Risk and Expected Shortfall bands across 16 futures contracts, updated from continuous calibration monitoring.',
      caption: 'Production VaR / ES dashboard across the 16-future universe.',
    },
    {
      src: '/screenshots/quant-trading-labs/calibration-plot.png',
      alt: 'Calibration plot comparing realised tail exceedances against the GARCH-t/EVT model forecast, with exceedance rate tracked over a rolling window.',
      caption: 'Rolling calibration check for the GARCH-t/EVT tail model.',
    },
  ],
  body: [
    { kind: 'heading', level: 2, text: 'Problem' },
    {
      kind: 'paragraph',
      text: 'Most retail-visible "quant strategies" are a single backtest with no out-of-sample discipline and no accounting for multiple-testing bias. I wanted to find out, honestly, whether any tradable edge survived a pre-registered research process across crypto, commodities and equity index futures — and to build something useful out of whatever did or didn’t survive.',
    },
    { kind: 'heading', level: 2, text: 'Approach' },
    {
      kind: 'paragraph',
      text: 'Every hypothesis was registered before it was tested: entry/exit logic, universe, sample split and success criteria written down first. 22 notebooks ran candidate signals through realistic transaction costs, walk-forward holdout windows, and Deflated Sharpe Ratio correction for the number of trials — the standard fix for the fact that testing enough strategies will eventually produce a good-looking one by chance alone.',
    },
    {
      kind: 'list',
      items: [
        'Deflated Sharpe Ratio applied across the full trial count, not per-strategy',
        'Walk-forward holdout splits — no result is reported purely in-sample',
        'Realistic cost and slippage assumptions applied uniformly across candidates',
      ],
    },
    { kind: 'heading', level: 2, text: 'Result' },
    {
      kind: 'paragraph',
      text: 'Almost everything returned null after correction — that is the headline, not a caveat. A programme where every candidate "worked" would be the actual red flag. One signal survived: GARCH-t/EVT fat-tail calibration, which models return distributions with a Student-t GARCH process and Extreme Value Theory in the tails rather than assuming normality. It is productionised as a live Value-at-Risk and Expected Shortfall engine over 16 futures contracts, with continuous calibration monitoring flagging drift between forecast and realised exceedances.',
    },
    {
      kind: 'stat',
      label: 'Research notebooks',
      value: '22',
      note: 'pre-registered, in-sample, 2024–present',
    },
    {
      kind: 'stat',
      label: 'Futures covered by the live engine',
      value: '16',
      note: 'continuous calibration monitoring, out-of-sample',
    },
    { kind: 'heading', level: 2, text: "What I'd change" },
    {
      kind: 'paragraph',
      text: 'The notebook-per-hypothesis structure is great for pre-registration discipline but slow to extend — a shared harness for cost models and holdout splitting would cut the boilerplate on every new test. I would also like a formal shutdown rule for the live engine itself: a pre-committed threshold for calibration drift that triggers a recalibration or a pause, rather than a judgement call in the moment.',
    },
  ],
} as const satisfies Project;
