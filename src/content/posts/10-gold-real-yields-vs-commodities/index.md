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
