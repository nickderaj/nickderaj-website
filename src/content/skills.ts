/** Skills, mirroring the CV PDF (public/nick-de-raj-cv.pdf). */
export const skills = [
  {
    group: 'Languages',
    items: ['Java', 'Python', 'TypeScript/JavaScript', 'Solidity', 'SQL', 'Bash'],
  },
  { group: 'AI Tools', items: ['Claude Code', 'Codex', 'Cursor', 'Hermes Agents'] },
  { group: 'Frontend', items: ['React', 'NextJS', 'TypeScript'] },
  {
    group: 'Backend & Systems',
    items: [
      'NodeJS',
      'Nest.JS',
      'microservices',
      'REST/GraphQL',
      'Kafka',
      'Elasticsearch',
      'Postgres',
      'Redis',
      'Docker',
      'AWS/GCP',
    ],
  },
  {
    group: 'Quant Research & Trading',
    items: [
      'GARCH/EVT',
      'time-series analysis',
      'backtesting',
      'walk-forward validation',
      'VaR/Expected Shortfall',
      'mean-reversion',
      'spread trading',
      'ATR stops',
      'market microstructure',
      'crypto market making',
    ],
  },
  { group: 'Data Engineering', items: ['ETL pipelines', 'streaming (Kafka)'] },
  {
    group: 'Tools',
    items: ['Git/GitHub', 'CI/CD', 'Claude Code', 'Jupyter', 'Linux/Unix', 'monitoring & alerting'],
  },
  {
    group: 'Leadership',
    items: [
      'Technical lead (leading up to teams of 7)',
      'cross-functional teams',
      'production system delivery',
      'code quality at scale (40+ repos)',
    ],
  },
] as const;
