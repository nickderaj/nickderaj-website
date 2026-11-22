---
title: 'How alternative commodities move together and apart'
date: '2026-11-22'
description: 'Correlations, baskets, stress episodes and recent moves for mainstream, other and Chinese onshore commodity futures, in charts.'
tags: ['commodities']
---

A follow-up to [Gold and real yields vs other commodities](/blog/03-gold-real-yields-vs-commodities). That post tested which commodities followed real yields. This one looks at how commodities outside the mainstream move relative to each other, to mainstream commodities and to equities.

<alt-chart kind="stats"></alt-chart>

## Data and groups

Weekly log returns from Friday closes, January 2006 to 20 November 2026. Series are Yahoo Finance continuous front-month futures and Sina Finance Chinese main-contract futures, in price terms with no roll adjustment or carry. Three groups:

- **Mainstream (9):** gold, silver, platinum, palladium, copper, WTI crude, natural gas, corn, wheat.
- **Other futures (19):** soybean oil, soybean meal, soybeans, oats, rough rice, cotton, coffee, sugar, cocoa, orange juice, lean hogs, live cattle, feeder cattle, Class III milk, heating oil, Brent crude, aluminium, US hot-rolled steel, iron ore.
- **Chinese onshore futures (12):** bitumen, rubber, rebar, apples, red dates, eggs, palm oil, rapeseed oil, rapeseed meal, coke, PVC, glass. The free feed stops on 19 July 2024, so "2022+" for these ends there.

The other-futures and Chinese series are the weekly ones among the 48 markets tested against real yields in the previous post.

<callout variant="note" title="Pairwise correlation">The correlation between two series' weekly returns, from −1 (always opposite) through 0 (unrelated) to +1 (always together). "Pairwise" means every pair of series in a group is measured, and the average is reported. Pairs need at least 100 shared weeks.</callout>

<callout variant="note" title="Equal-weight basket">Each week's return is the simple average of the available members' returns (at least half of the members must have data). Volatility is the standard deviation of weekly returns times √52. Maximum drawdown is the largest fall from a previous peak of the cumulative return. Annual return is the average weekly log return times 52.</callout>

<callout variant="warning" title="Data limits">Futures are front-month continuous series, so weekly returns include contract roll gaps. On 20 November, Yahoo's live quote and its daily bar disagreed for several futures (for example US natural gas, aluminium and hot-rolled steel); daily bars are used throughout. ETFs are proxies for the markets they follow, and the coal and uranium ETFs hold equities.</callout>

## The correlation map

<alt-chart kind="heatmap"></alt-chart>

Mean pairwise correlation within the mainstream group is 0.28 (36 pairs), within other futures 0.10 (171 pairs) and within Chinese futures 0.16 (66 pairs). Between groups: mainstream and other 0.14, mainstream and Chinese 0.13, other and Chinese 0.09.

## Every pair, one dot each

<alt-chart kind="strip"></alt-chart>

The share of pairs with a negative correlation is 0% within mainstream, 15% within other futures and 11% within Chinese futures. The share above 0.3 is 33%, 4% and 18%. Mean within-group correlation was 0.29, 0.12 and 0.16 in 2006–2021, and 0.26, 0.07 and 0.17 from 2022.

## Who moves with equities

<alt-chart kind="lollipop"></alt-chart>

Mean correlation with the S&P 500 is 0.24 for mainstream commodities (range 0.10 to 0.43), 0.14 for other futures (−0.07 to 0.31) and 0.08 for Chinese futures (−0.04 to 0.23). With the Bloomberg commodity ETN it is 0.50, 0.30 and 0.24. From 2022 the S&P correlation means are 0.16, 0.08 and −0.01.

## The most positive and most negative pairs

<alt-chart kind="pairs"></alt-chart>

Of all 780 pairs, 10.5% have a negative correlation. The most negative is China apples (ZCE) / China glass (ZCE) at −0.16. The most positive is WTI crude / Brent crude at 0.89.

## Baskets

<alt-chart kind="curves"></alt-chart>

Equal-weight basket statistics, 2006 to 20 November 2026 (Chinese basket: April 2011 to July 2024): the mainstream basket averaged +3.0% a year with volatility 19.7% and a maximum drawdown of 56%. The other-futures basket averaged +2.8% with volatility 12.2% and a maximum drawdown of 48%. The Chinese basket averaged −3.5% with volatility 14.7% and a maximum drawdown of 58%. The S&P 500 averaged +8.0% with volatility 17.9% and a maximum drawdown of 56%; the commodity ETN −0.4%, 17.8% and 78%.

<alt-chart kind="drawdown"></alt-chart>

Correlation between the baskets' weekly returns: mainstream and other futures 0.63; mainstream and Chinese 0.42; other and Chinese 0.45 (to July 2024). Correlation with the S&P 500: mainstream 0.40, other futures 0.35, Chinese 0.19.

<alt-chart kind="volratio"></alt-chart>

## Four market stress episodes

<alt-chart kind="episodes"></alt-chart>

Cumulative price change over each window, using Friday closes. "Median" is the median across members with data; Chinese futures have data for 3 members in 2008 and none for the last two weeks.

- **GFC sell-off** (12 Sep to 21 Nov 2008): S&P 500 −36%, commodity ETN −33%. Median change: mainstream −27% (1 of 8 up), other futures −25% (0 of 16 up), Chinese futures −37% (0 of 3 up).
- **COVID crash** (21 Feb to 20 Mar 2020): S&P 500 −31%, commodity ETN −24%. Median change: mainstream −16% (0 of 9 up), other futures −8% (4 of 19 up), Chinese futures −8% (1 of 12 up).
- **2022 rate shock** (7 Jan to 14 Oct 2022): S&P 500 −23%, commodity ETN +15%. Median change: mainstream +4% (5 of 9 up), other futures +4% (10 of 19 up), Chinese futures −8% (4 of 12 up).
- **Last two weeks** (6 to 20 Nov 2026): S&P 500 −6%, commodity ETN −6%. Median change: mainstream −12% (1 of 9 up), other futures −2% (7 of 19 up), Chinese futures no data.

## The 20 worst S&P 500 weeks

<alt-chart kind="scatter"></alt-chart>

The 20 worst weekly S&P 500 returns since 2006 ranged from −20.1% to −5.9%, averaging −8.8%. In those weeks the mean of the mainstream group's average weekly return was −5.8% (on average 28% of members rose; the group average rose in 1 of 20 weeks). For other futures it was −3.9% (22% rose; 0 of 20 weeks). For Chinese futures it was −3.9% (16% rose; 2 of 16 weeks).

## The last two weeks

<alt-chart kind="recent"></alt-chart>

Futures and ETFs with live prices for eight niche markets: Dutch gas, iron ore, US hot-rolled steel, carbon, dry bulk freight, coal and uranium. These are market prices only. South African sunflower seeds, US power, biofuels, freight routes and propane have no live public series here. Coal and uranium are equity ETFs.

<alt-chart kind="dumbbell"></alt-chart>

Weekly correlations among the eight niche-market proxies from 2024-01-26 (the start of the COAL ETF series), 28 pairs: mean 0.10, median 0.07, 36% of pairs negative, 11% above 0.3. The highest is Coal equities ETF (COAL) / Uranium equities ETF (URA) at 0.48; the lowest is Dutch TTF gas / Uranium equities ETF (URA) at −0.12.

## Method and reproduction

`scripts/alt-correlations.mjs` produces every figure here and writes `public/data/alt-correlations.json`. Series definitions follow `scripts/alternatives-real-yields.mjs` from the previous post.
