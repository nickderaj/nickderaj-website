---
title: 'Gold and real yields vs other commodities'
date: '2026-11-21'
description: 'Reproducing the gold vs real yield charts from Caio Marchesani, and why the relationship broke in 2022.'
tags: ['commodities']
---

Reproduced from [Caio Marchesani, "Gold and real yields"](https://caiomarchesani.com/articles/gold-and-real-yields/). Weekly Friday closes, COMEX gold (`GC=F`) and 10-year TIPS yield (FRED `DFII10`).

## Gold and real yields, together

<gold-chart kind="overlay"></gold-chart>

Gold and the 10-year real yield moved in opposite directions through 2021. From 2022 the real yield rose and gold did not fall.

## Gold vs the real yield

<gold-chart kind="scatter"></gold-chart>

OLS of ln(gold) on the real yield, 2006–2021 (835 weeks): R² 0.85, about 25% off gold per point of real yield. Post-2021 weeks sit far above the line.

## Gold vs the 2006–2021 line

<gold-chart kind="ratio"></gold-chart>

Gold divided by the fitted line. Within ±24% (two typical misses of 12%) in 787 of 835 weeks to 2021. Last inside the band on 29 July 2022.

---

## Same test, other commodities

Same method: ln(price) on the 10-year real yield, fitted 2006–2021, then price ÷ line. Weekly front-month futures (Yahoo). Shaded band is ±2 typical misses of each commodity's own fit; dashed vertical is 2022.

<commodity-chart kind="multiples"></commodity-chart>

| Commodity | R² (2006–21) | Cointegration t (5% crit. −3.34) | Weeks in band, 2006–21 | Weeks in band, 2022+ | Now ÷ line |
| --- | --- | --- | --- | --- | --- |
| Gold | 0.85 | −4.31 | 94% | 6% | 6.0× |
| Silver | 0.47 | −2.92 | 94% | 32% | 4.4× |
| Palladium | 0.59 | −2.31 | 97% | 8% | 3.9× |
| Platinum | 0.01 | −2.37 | 99% | 96% | 1.2× |
| Copper | 0.06 | −2.42 | 97% | 57% | 2.3× |
| WTI crude | 0.01 | −2.57 | 97% | 100% | 1.3× |
| Natural gas | 0.44 | −3.15 | 95% | 50% | 0.5× |
| Corn | 0.22 | −2.95 | 97% | 85% | 1.4× |
| Wheat | 0.06 | −3.04 | 96% | 91% | 1.2× |

Only gold passes the cointegration test before 2022. Silver and palladium are the only others with a real pre-2022 fit, and they leave their bands too. Platinum, oil and grains never had a real-yield relationship to break.

## Gold, silver, palladium

<commodity-chart kind="precious"></commodity-chart>

Price ÷ real-yield line, log scale. All three lifted away from 1× after 2021; gold furthest.

---

## Alternative commodities

Same test again on 48 more markets, to see whether anything other than the precious metals had a real-yield relationship before 2022 and lost it afterwards. Same method: ln(price) on the 10-year real yield, fitted to 2021 (from each series' own start), then price ÷ line. Shaded band is ±2 typical misses of that fit; dashed vertical is 2022. Cointegration critical value is −3.34 at 5%, as above. Panels share one time axis, so short series start late and the Chinese series stop in July 2024.

**What stands out**

- Nothing comes close to gold's R² of 0.85. Best of the rest: apples 0.54 (a short 2017+ sample with a _positive_ slope), then tin 0.42, IMF iron ore 0.41, soybean meal 0.40, Chinese glass 0.38 and cattle 0.34–0.37.
- Tin is the closest copy of the precious-metal story: decent fit, leaves its band after 2021 (16% of weeks inside), now 4.3× the line. Live and feeder cattle leave too (14% and 16% inside), and their correlation with real yields flips from about −0.6 before 2022 to +0.75 after.
- Many series clear −3.34 before 2022 (lean hogs −4.35, Class III milk, soybean meal, sunflower oil, lead, eggs, cocoa, rough rice), but most have R² near 0.1 or less. They revert around a flat line rather than tracking yields, and with 48 tests two or three false passes at 5% are expected.
- Vegetable oils and iron ore drift away late rather than in 2022. IMF sunflower oil was inside its band until September 2025 and is now 2.05×; palm, rapeseed and soybean oil look similar. I have not tested why.
- Chinese futures mostly never had a relationship. Bitumen has R² 0.01, stays inside its band (98% of weeks to July 2024) and sits at 1.2×. Rubber, rebar, PVC, eggs, palm oil and rapeseed oil are the same. Glass, coke and rapeseed meal are the exceptions.
- Uranium (IMF) is the one clean _positive_ link: R² 0.26, and the correlation strengthens from +0.51 before 2022 to +0.70 after. It never leaves its band.
- A ratio above 1× is not automatically a break. Most prices rose in 2022 while real yields rose too, so with a weak fit a high ratio can just reflect general inflation.

### Agriculture and softs

Yahoo weekly futures.

<commodity-chart kind="alternatives" group="agri"></commodity-chart>

| Commodity | R² (to 2021) | Cointegration t | In band, to 2021 | In band, after 2021 | Latest ÷ line |
| --- | --- | --- | --- | --- | --- |
| Soybean oil | 0.12 | -2.21 | 97% | 56% | 2.0× |
| Soybean meal | 0.40 | -3.67 | 95% | 74% | 1.3× |
| Soybeans | 0.30 | -2.87 | 98% | 74% | 1.5× |
| Oats | 0.24 | -2.66 | 95% | 76% | 1.5× |
| Rough rice | 0.08 | -3.40 | 97% | 75% | 1.6× |
| Cotton | 0.16 | -2.52 | 96% | 94% | 1.3× |
| Coffee | 0.09 | -2.30 | 95% | 40% | 2.4× |
| Sugar #11 | 0.10 | -2.39 | 95% | 91% | 1.4× |
| Cocoa | 0.11 | -3.44 | 97% | 36% | 2.4× |
| Orange juice | 0.00 | -3.10 | 95% | 43% | 1.0× |

### Livestock and dairy

Yahoo weekly futures.

<commodity-chart kind="alternatives" group="livestock"></commodity-chart>

| Commodity | R² (to 2021) | Cointegration t | In band, to 2021 | In band, after 2021 | Latest ÷ line |
| --- | --- | --- | --- | --- | --- |
| Lean hogs | 0.11 | -4.35 | 94% | 89% | 0.8× |
| Live cattle | 0.37 | -2.67 | 95% | 14% | 2.4× |
| Feeder cattle | 0.34 | -2.16 | 92% | 16% | 3.1× |
| Class III milk | 0.16 | -3.88 | 93% | 89% | 1.3× |

### Energy, steel and iron ore

Yahoo weekly futures. Aluminium starts 2014, US hot-rolled steel 2008, iron ore 2010.

<commodity-chart kind="alternatives" group="energy"></commodity-chart>

| Commodity | R² (to 2021) | Cointegration t | In band, to 2021 | In band, after 2021 | Latest ÷ line |
| --- | --- | --- | --- | --- | --- |
| Heating oil | 0.00 | -2.24 | 96% | 82% | 2.1× |
| Brent crude | 0.00 | -2.08 | 98% | 100% | 1.3× |
| Aluminium | 0.00 | -1.02 | 97% | 71% | 1.7× |
| US hot-rolled steel | 0.16 | -1.51 | 95% | 58% | 3.0× |
| Iron ore 62% | 0.15 | -2.06 | 96% | 93% | 1.8× |

### IMF monthly benchmarks

Monthly averages from FRED (IMF), against the monthly average real yield. Sunflower oil stands in for sunflower seeds: I could not find a free South African (JSE/SAFEX) seed series.

<commodity-chart kind="alternatives" group="imf"></commodity-chart>

| Commodity | R² (to 2021) | Cointegration t | In band, to 2021 | In band, after 2021 | Latest ÷ line |
| --- | --- | --- | --- | --- | --- |
| Sunflower oil (IMF) | 0.23 | -3.54 | 96% | 70% | 2.0× |
| Rapeseed oil (IMF) | 0.06 | -1.96 | 94% | 77% | 1.6× |
| Rubber (IMF) | 0.00 | -2.34 | 95% | 100% | 1.3× |
| Palm oil (IMF) | 0.16 | -2.87 | 97% | 70% | 2.0× |
| Uranium (IMF) | 0.26 | -2.18 | 98% | 100% | 1.2× |
| Iron ore (IMF) | 0.41 | -2.60 | 95% | 84% | 2.3× |
| Tin (IMF) | 0.42 | -3.10 | 96% | 16% | 4.3× |
| Nickel (IMF) | 0.13 | -2.57 | 97% | 96% | 0.8× |
| Zinc (IMF) | 0.00 | -2.34 | 95% | 95% | 1.7× |
| Lead (IMF) | 0.07 | -3.53 | 92% | 100% | 1.0× |
| Australian coal (IMF) | 0.04 | -2.27 | 97% | 58% | 2.0× |
| Wool (IMF) | 0.29 | -2.52 | 92% | 84% | 2.2× |
| Barley (IMF) | 0.01 | -1.82 | 100% | 100% | 1.0× |
| Tea (IMF) | 0.07 | -3.19 | 100% | 100% | 1.2× |
| Oranges (IMF) | 0.00 | -2.68 | 95% | 42% | 1.0× |
| Bananas (IMF) | 0.13 | -2.40 | 99% | 32% | 1.3× |
| Thai rice (IMF) | 0.11 | -1.68 | 99% | 75% | 1.3× |

### Chinese futures

SHFE, DCE and ZCE main contract, weekly, from Sina Finance. The free feed stops at 19 July 2024, so "after 2021" means 2022 to mid-2024 only. Bitumen starts October 2013.

<commodity-chart kind="alternatives" group="china"></commodity-chart>

| Commodity | R² (to 2021) | Cointegration t | In band, to 2021 | In band, after 2021 | Latest ÷ line |
| --- | --- | --- | --- | --- | --- |
| China bitumen (SHFE BU) | 0.01 | -2.24 | 96% | 98% | 1.2× |
| China rubber (SHFE) | 0.06 | -2.10 | 96% | 100% | 0.8× |
| China rebar (SHFE) | 0.01 | -1.65 | 93% | 100% | 1.0× |
| China apples (ZCE) | 0.54 | -2.49 | 97% | 55% | 0.6× |
| China red dates (ZCE) | 0.05 | -1.61 | 94% | 71% | 1.2× |
| China eggs (DCE) | 0.03 | -3.45 | 96% | 100% | 1.1× |
| China palm oil (DCE) | 0.00 | -1.98 | 97% | 86% | 1.3× |
| China rapeseed oil (ZCE) | 0.03 | -1.32 | 98% | 91% | 1.1× |
| China rapeseed meal (ZCE) | 0.24 | -3.12 | 95% | 5% | 1.2× |
| China coke (DCE) | 0.13 | -1.88 | 97% | 37% | 2.1× |
| China PVC (DCE) | 0.02 | -2.33 | 97% | 99% | 0.9× |
| China glass (ZCE) | 0.38 | -2.37 | 98% | 32% | 1.8× |

