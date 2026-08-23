import type { Project } from '@/types/content.ts';
import { ceres } from './ceres.ts';
import { commodityStatArb } from './commodity-stat-arb.ts';
import { quantTradingLabs } from './quant-trading-labs.ts';

/**
 * Sequenced deliberately (PLAN §2.3): research → the strategy it produced → the public teaching
 * record. Adding a fourth project is one new file plus one entry here.
 */
export const projects: Project[] = [quantTradingLabs, commodityStatArb, ceres];
