---
title: 'How alternative commodities move together and apart'
date: '2026-11-22'
description: 'Correlations, baskets and stress-period returns for mainstream, other and Chinese onshore commodity futures, and for markets named by a systematic alternative-commodities manager.'
tags: ['commodities']
---

A follow-up to [Gold and real yields vs other commodities](/blog/10-gold-real-yields-vs-commodities). That post tested which commodities followed real yields. This one looks at how commodities outside the mainstream move relative to each other, to mainstream commodities and to equities.

## Data and groups

Weekly log returns from Friday closes, January 2006 to 20 November 2026. Series are Yahoo Finance continuous front-month futures and Sina Finance Chinese main-contract futures, in price terms with no roll adjustment or carry. Three groups:

- **Mainstream (9):** gold, silver, platinum, palladium, copper, WTI crude, natural gas, corn, wheat.
- **Other futures (19):** soybean oil, soybean meal, soybeans, oats, rough rice, cotton, coffee, sugar, cocoa, orange juice, lean hogs, live cattle, feeder cattle, Class III milk, heating oil, Brent crude, aluminium, US hot-rolled steel, iron ore.
- **Chinese onshore futures (12):** bitumen, rubber, rebar, apples, red dates, eggs, palm oil, rapeseed oil, rapeseed meal, coke, PVC, glass. The free feed stops on 19 July 2024, so "2022+" for these ends there.

The other-futures and Chinese series are the weekly ones among the 48 markets tested against real yields in the previous post.

<callout variant="note" title="Pairwise correlation">The correlation between two series' weekly returns, from −1 (always opposite) through 0 (unrelated) to +1 (always together). "Pairwise" means every pair of series in a group is measured, and the average is reported. Pairs need at least 100 shared weeks.</callout>

<callout variant="note" title="Equal-weight basket">Each week's return is the simple average of the available members' returns (at least half of the members must have data). Volatility is the standard deviation of weekly returns times √52. Maximum drawdown is the largest fall from a previous peak of the cumulative return. Annual return is the average weekly log return times 52.</callout>

<callout variant="warning" title="Data limits">Futures are front-month continuous series, so weekly returns include contract roll gaps. On 20 November, Yahoo's live quote and its daily bar disagreed for several futures (for example US natural gas, aluminium and hot-rolled steel); daily bars are used throughout. ETFs are proxies for the markets they follow, and the coal and uranium ETFs hold equities.</callout>

## Correlation within and between groups

| Pairs | Number of pairs | Mean | Median | Share below 0 | Share above 0.3 | Mean 2006–2021 | Mean 2022+ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mainstream commodities (9), within | 45 | 0.32 | 0.24 | 0% | 47% | 0.33 | 0.29 |
| Other futures (19), within | 171 | 0.10 | 0.07 | 15% | 4% | 0.12 | 0.07 |
| Chinese onshore futures (12), within | 66 | 0.16 | 0.13 | 11% | 18% | 0.16 | 0.17 |
| Mainstream × other | 190 | 0.16 | 0.12 | 6% | 13% | 0.17 | 0.12 |
| Mainstream × Chinese | 120 | 0.14 | 0.11 | 6% | 8% | 0.13 | 0.16 |
| Other × Chinese | 228 | 0.09 | 0.07 | 14% | 4% | 0.09 | 0.10 |

Mean correlation of each group's members with the S&P 500 and with the Bloomberg commodity ETN (DJP):

| Group | Mean correlation with S&P 500 | Range across members | Mean 2006–2021 | Mean 2022+ | Mean correlation with Bloomberg commodity ETN |
| --- | --- | --- | --- | --- | --- |
| Mainstream commodities (9) | 0.24 | 0.10 to 0.43 | 0.27 | 0.16 | 0.50 |
| Other futures (19) | 0.14 | −0.07 to 0.31 | 0.16 | 0.08 | 0.30 |
| Chinese onshore futures (12) | 0.08 | −0.04 to 0.23 | 0.11 | −0.01 | 0.24 |

Across all 780 pairs of the 40 series with at least 150 shared weeks, 11% have a negative correlation. The most negative is −0.16.

## Most positive and most negative pairs

| Most positive pairs | Correlation | Most negative pairs | Correlation |
| --- | --- | --- | --- |
| WTI crude / Brent crude | 0.89 | China apples (ZCE) / China glass (ZCE) | −0.16 |
| Heating oil / Brent crude | 0.83 | Corn / Feeder cattle | −0.12 |
| Gold / Silver | 0.80 | Live cattle / China apples (ZCE) | −0.11 |
| Soybean meal / Soybeans | 0.79 | Wheat / Feeder cattle | −0.09 |
| WTI crude / Heating oil | 0.74 | US hot-rolled steel / China apples (ZCE) | −0.09 |
| China palm oil (DCE) / China rapeseed oil (ZCE) | 0.71 | Coffee / China apples (ZCE) | −0.08 |
| Silver / Platinum | 0.70 | Iron ore 62% / China red dates (ZCE) | −0.08 |
| Soybean oil / China palm oil (DCE) | 0.65 | Feeder cattle / China rapeseed meal (ZCE) | −0.07 |
| Platinum / Palladium | 0.64 | Sugar #11 / China apples (ZCE) | −0.07 |
| Gold / Platinum | 0.63 | Rough rice / China eggs (DCE) | −0.06 |
| China rebar (SHFE) / China coke (DCE) | 0.62 | Heating oil / China apples (ZCE) | −0.06 |
| Corn / Wheat | 0.59 | Feeder cattle / China red dates (ZCE) | −0.06 |

## Baskets

| Series | Members | From | Average annual log return | Annualised volatility | Average member volatility | Maximum drawdown | Correlation with S&P 500 | Correlation with Bloomberg commodity ETN |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mainstream basket | 9 | 2006-01-13 | +3.0% | 19.7% | 33.9% | 56% | 0.40 | 0.87 |
| Other futures basket | 19 | 2006-01-13 | +2.8% | 12.2% | 30.1% | 48% | 0.35 | 0.78 |
| Chinese futures basket (to Jul 2024) | 12 | 2011-04-22 | −3.5% | 14.7% | 29.5% | 58% | 0.19 | 0.46 |
| S&P 500 | 1 | 2006-01 | +8.0% | 17.9% | — | 56% | 1.00 | — |
| Bloomberg commodity ETN | 1 | 2006-01 | −0.4% | 17.8% | — | 78% | 0.42 | — |

Correlation between the baskets' weekly returns: mainstream and other futures 0.63; mainstream and Chinese 0.42; other and Chinese 0.45 (to July 2024).

The other-futures basket's volatility is 40% of its members' average volatility. For the mainstream basket it is 58%, and for the Chinese basket 50%.

## Stress episodes

Cumulative price change over each window, using Friday closes. "Median" is the median across members with data; Chinese futures have data for 3 members in 2008 and none for the last two weeks.

| Episode | Dates | S&P 500 | Bloomberg commodity ETN | Mainstream, median | Other futures, median | Chinese futures, median |
| --- | --- | --- | --- | --- | --- | --- |
| GFC sell-off | 2008-09-12 to 2008-11-21 | −36% | −33% | −27% (1 of 8 up) | −25% (0 of 16 up) | −37% (0 of 3 up) |
| COVID crash | 2020-02-21 to 2020-03-20 | −31% | −24% | −16% (0 of 9 up) | −8% (4 of 19 up) | −8% (1 of 12 up) |
| 2022 rate shock | 2022-01-07 to 2022-10-14 | −23% | +15% | +4% (5 of 9 up) | +4% (10 of 19 up) | −8% (4 of 12 up) |
| Last two weeks | 2026-11-06 to 2026-11-20 | −6% | −6% | −12% (1 of 9 up) | −2% (7 of 19 up) | no data |

The 20 worst weekly S&P 500 returns since 2006 ranged from −20.1% to −5.9%, averaging −8.8%. In those weeks:

| Group | Weeks with data | Mean of the group's average weekly return | Mean share of members that rose | Weeks the group average rose |
| --- | --- | --- | --- | --- |
| Mainstream (9) | 20 | −5.8% | 28% | 1 of 20 |
| Other futures (19) | 20 | −3.9% | 22% | 0 of 20 |
| Chinese futures (12) | 16 | −3.9% | 16% | 2 of 16 |

## Markets named by GreshamQuant, last two weeks

Futures and ETFs with live prices for markets that GreshamQuant has named publicly. These are market prices, not GreshamQuant's returns or positions. South African sunflower seeds, Chinese bitumen, US power, biofuels, freight routes and propane have no live public series here. Coal and uranium are equity ETFs.

| | 20 Nov | Week to 20 Nov | Since 6 Nov |
| --- | --- | --- | --- |
| S&P 500 | −3.7% | −8.6% | −6.3% |
| Nasdaq | −5.3% | −10.0% | −8.0% |
| Bloomberg commodity ETN | −0.8% | −5.1% | −5.9% |
| Gold | −4.6% | −9.5% | −13.7% |
| Copper | −2.6% | −9.9% | −11.9% |
| WTI crude | +0.9% | −5.2% | −7.5% |
| US natural gas | +4.4% | +5.6% | +13.8% |
| Aluminium | +0.7% | −8.7% | −11.6% |
| Dutch TTF gas | +4.7% | −2.7% | +3.3% |
| Iron ore 62% | −0.2% | −0.9% | −2.2% |
| US hot-rolled steel | +0.0% | −0.1% | −0.4% |
| Global carbon ETF (KRBN) | +0.0% | −6.4% | −5.7% |
| California carbon ETF (KCCA) | +0.2% | −1.0% | −0.0% |
| Dry bulk freight ETF (BDRY) | −2.5% | −6.3% | −8.5% |
| Coal equities ETF (COAL) | −2.3% | −10.4% | −9.0% |
| Uranium equities ETF (URA) | −6.6% | −15.9% | −17.2% |

Weekly correlations among the eight named-market proxies from 2024-01-26 (the start of the COAL ETF series), 28 pairs: mean 0.10, median 0.07, 36% of pairs negative, 11% above 0.3. The highest is Coal equities ETF (COAL) / Uranium equities ETF (URA) at 0.48; the lowest is Dutch TTF gas / Uranium equities ETF (URA) at −0.12.

| Series | Correlation with S&P 500 | Correlation with Bloomberg commodity ETN |
| --- | --- | --- |
| Dutch TTF gas | −0.15 | 0.40 |
| Iron ore 62% | 0.06 | 0.13 |
| US hot-rolled steel | −0.13 | −0.02 |
| Global carbon ETF (KRBN) | 0.37 | 0.12 |
| California carbon ETF (KCCA) | 0.07 | −0.03 |
| Dry bulk freight ETF (BDRY) | 0.09 | 0.07 |
| Coal equities ETF (COAL) | 0.44 | 0.40 |
| Uranium equities ETF (URA) | 0.58 | 0.24 |

## Method and reproduction

`scripts/alt-correlations.mjs` produces every figure here and writes `public/data/alt-correlations.json`. Series definitions follow `scripts/alternatives-real-yields.mjs` from the previous post.
