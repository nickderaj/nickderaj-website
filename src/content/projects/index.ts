import type { Project } from '@/types/content.ts';
import { commodityStatArb } from './commodity-stat-arb.ts';
import { quantTradingLabs } from './quant-trading-labs.ts';

/**
 * Sequenced deliberately (PLAN §2.3): research → the strategy it produced. Adding another project is one new file plus one entry here.
 */
export const projects: Project[] = [quantTradingLabs, commodityStatArb];
