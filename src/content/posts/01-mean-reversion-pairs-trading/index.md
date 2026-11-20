---
title: 'Pairs Trading - A Market-Neutral Mean-Reversion Strategy'
date: '2026-01-25'
description: 'Exploring a market-neutral mean-reversion trading strategy that profits from temporary divergences between two cointegrated securities.'
tags: ['math', 'cointegration', 'quant']
---

## Introduction

Pairs trading is a market-neutral strategy that exploits temporary mispricings between two historically related securities. Instead of betting on the direction of any single asset, you simultaneously go long one and short the other - profiting when their relative prices revert to equilibrium.

The strategy rests on a statistical concept called **cointegration**: two price series that may individually wander randomly but maintain a stable long-run relationship. When they diverge beyond normal bounds, you bet on convergence. When they converge, you close the trade.

In this post, we'll apply pairs trading to commodity futures - assets whose prices are linked by physical and economic relationships. We'll cover the mathematical foundations, test for cointegration across a universe of commodities, and backtest a complete trading strategy.

## The Commodity Universe

We work with seven commodity futures over a six-year window (2019–2024), covering the COVID crash, the inflation era, and the rate hiking cycle:

<python-table src="commodity-stats"></python-table>

The normalized price chart reveals how differently these commodities behaved over the period - gold surged as an inflation hedge while natural gas exhibited extreme volatility:

<python-figure src="commodity-prices" caption="All commodity futures normalized to a starting value of 100."></python-figure>

## Mathematical Foundations

### Stationarity and the ADF Test

A time series $X_t$ is **stationary** if its statistical properties - mean, variance, and autocorrelation - don't change over time. Most asset prices are non-stationary: they have trends and their variance grows. But certain _combinations_ of non-stationary series can be stationary.

The **Augmented Dickey-Fuller (ADF) test** checks for stationarity. It fits the regression:

$$
\Delta X_t = \alpha + \beta t + \gamma X_{t-1} + \sum_{i=1}^{p} \delta_i \Delta X_{t-i} + \varepsilon_t
$$

The null hypothesis is $\gamma = 0$ (unit root, non-stationary). If the test statistic is sufficiently negative, we reject the null and conclude the series is stationary.

### Cointegration

Two series $X_t$ and $Y_t$ are **cointegrated** if there exists a linear combination $Z_t = X_t - \beta Y_t$ that is stationary, even though $X_t$ and $Y_t$ are individually non-stationary.

The **Engle-Granger two-step method** tests for this:

1. Regress $X_t$ on $Y_t$ to estimate $\hat{\beta}$:

$$
X_t = \alpha + \beta Y_t + \varepsilon_t
$$

2. Apply the ADF test to the residuals $\hat{\varepsilon}_t = X_t - \hat{\alpha} - \hat{\beta} Y_t$

If the residuals are stationary (ADF rejects the null), the pair is cointegrated.

### The Z-Score

Given the spread $S_t = \log(X_t / Y_t)$ between two cointegrated series, the **z-score** measures how far the current spread deviates from its rolling mean:

$$
z_t = \frac{S_t - \mu_t}{\sigma_t}
$$

where $\mu_t$ and $\sigma_t$ are the rolling mean and standard deviation over a lookback window (we use 60 trading days). A z-score of $\pm 2$ means the spread is two standard deviations from its recent average - a potential trading signal.

## Cointegration Testing

We test all $\binom{7}{2} = 21$ commodity pairs for cointegration using the Engle-Granger method. The table below shows p-values - pairs with $p < 0.05$ are considered cointegrated at the 95% confidence level:

<python-table src="cointegration-tests"></python-table>

Out of 21 pairs, only **WTI Oil / Brent Oil** passes the cointegration test with high confidence ($p < 0.001$). This makes economic sense - they're both crude oil benchmarks, linked by physical arbitrage. The remaining pairs, including some that seem intuitively related (Gold/Silver, Silver/Copper), are _not_ cointegrated in this period.

This is a critical lesson: **cointegration is not the same as correlation**. Gold and silver may move together broadly, but their long-run price ratio isn't stable enough for statistical arbitrage.

## Cointegrated Pair: WTI & Brent Oil

WTI (West Texas Intermediate) and Brent crude are both benchmarks for global oil prices. They price slightly different grades of crude, but arbitrage via tanker shipping keeps them tightly linked. The spread primarily reflects transportation costs and regional supply-demand imbalances.

<python-figure src="wti-brent-prices" caption="WTI and Brent oil move almost in lockstep, as expected for two crude oil benchmarks."></python-figure>

The z-score oscillates within a bounded range, repeatedly crossing the entry and exit thresholds - exactly the behavior we want for mean-reversion trading:

<python-figure src="wti-brent-zscore" caption="The WTI/Brent z-score reverts to the mean, though the COVID crash in 2020 caused an extreme dislocation."></python-figure>

The COVID crash in April 2020 - when WTI briefly went negative - shows up as a massive spike. This highlights a real risk of pairs trading: extreme events can blow through your stop-loss before you can react.

### Year-by-Year: WTI/Brent Through Market Regimes

The full six-year view compresses a lot of information. Breaking the data into yearly windows reveals how the WTI/Brent relationship behaves through dramatically different market conditions - and why it remains tradeable even through crises.

#### 2019: Pre-COVID Stability

<python-figure src="wti-brent-prices-2019" caption="In 2019, WTI and Brent track each other closely with minor divergences."></python-figure>

<python-figure src="wti-brent-zscore-2019" caption="The z-score stays well within the trading bands for most of 2019, with clean mean-reversion cycles."></python-figure>

A calm year for the spread. The z-score oscillates gently, rarely reaching the entry thresholds. This is the baseline behavior - tight tracking driven by the physical arbitrage mechanism. When the spread widens slightly, arbitrageurs ship oil between markets, forcing convergence within days.

#### 2020: The COVID Dislocation

<python-figure src="wti-brent-prices-2020" caption="The COVID crash created a massive divergence as WTI collapsed more than Brent."></python-figure>

<python-figure src="wti-brent-zscore-2020" caption="The z-score spikes violently during the COVID crash but eventually mean-reverts - the defining characteristic of a cointegrated pair."></python-figure>

April 2020 was the stress test. WTI briefly went negative due to storage constraints at the Cushing, Oklahoma delivery point - a problem specific to the WTI contract. Brent, delivered by sea, had no such constraint. The z-score spiked to extreme levels, but critically, **it came back**. The physical arbitrage mechanism reasserted itself once storage constraints eased. This is the difference between a cointegrated pair experiencing a tail event and a non-cointegrated pair drifting permanently: the cointegrated pair _recovers_.

#### 2021: Post-COVID Recovery

<python-figure src="wti-brent-prices-2021" caption="Both benchmarks recover together as demand returns and OPEC+ manages supply."></python-figure>

<python-figure src="wti-brent-zscore-2021" caption="The z-score returns to normal oscillation in 2021, generating clean trading signals."></python-figure>

After the extreme dislocation, the spread normalizes. The z-score shows textbook mean-reversion behavior - oscillating around zero, hitting entry thresholds, then reverting. This year would have generated multiple profitable trades with no stop-loss events.

#### 2022: Energy Crisis and the Russia-Ukraine War

<python-figure src="wti-brent-prices-2022" caption="The Russia-Ukraine war widened the WTI/Brent spread as Brent reflected European supply fears."></python-figure>

<python-figure src="wti-brent-zscore-2022" caption="The z-score shows elevated volatility during the energy crisis but continues to mean-revert."></python-figure>

Russia's invasion of Ukraine in February 2022 disproportionately affected Brent (the European benchmark) compared to WTI (the US benchmark). European supply concerns pushed Brent to a premium. The z-score shows wider oscillations than 2019 or 2021, but the key feature remains: **it keeps crossing zero**. The mean-reverting structure survives even a major geopolitical shock.

#### 2023: Normalization

<python-figure src="wti-brent-prices-2023" caption="WTI and Brent return to tight tracking as energy markets stabilize."></python-figure>

<python-figure src="wti-brent-zscore-2023" caption="The z-score shows stable mean-reversion behavior in 2023, similar to the pre-COVID regime."></python-figure>

By 2023, the spread returns to its pre-crisis baseline. Clean oscillation, regular zero crossings, and no extreme events. The physical arbitrage link between the two crude oil benchmarks - tanker shipping, refinery flexibility, and futures market convergence - continues to enforce equilibrium.

## Not Cointegrated: Gold & Silver

Gold and silver are both precious metals, stores of value, and inflation hedges. They appear to move together, and traders often assume they're a natural pair. But the cointegration test tells a different story for 2019–2024.

<python-figure src="gold-silver-prices" caption="Gold and silver normalized prices appear to track each other, but the relationship isn't statistically stable."></python-figure>

<python-figure src="gold-silver-zscore" caption="The gold/silver z-score drifts and trends rather than reliably mean-reverting."></python-figure>

The z-score shows extended periods of drift rather than the tight oscillation we saw with WTI/Brent. While the gold-to-silver ratio does mean-revert over very long horizons (decades), within our six-year window the structural shift in gold prices (central bank buying, inflation hedging) disrupted the relationship. This is exactly why you need to _test_ for cointegration rather than assume it.

## Not Cointegrated: Gold & Copper

Gold is a precious metal driven by investment demand, inflation expectations, and risk sentiment. Copper is an industrial metal driven by construction, manufacturing, and economic growth. While both are metals, their economic drivers are fundamentally different.

<python-figure src="gold-copper-prices" caption="Gold and copper prices diverge significantly - their relationship is not stable over time."></python-figure>

<python-figure src="gold-copper-zscore" caption="The gold/copper z-score trends persistently, making it unsuitable for pairs trading."></python-figure>

The z-score trends persistently rather than reverting. Trading this pair would be like fighting a trend - a losing proposition.

## Not Cointegrated: WTI Oil & Gold

WTI crude and gold might seem unrelated, but they're sometimes discussed together - oil drives inflation, and gold hedges against it. Does this macro narrative create a tradeable statistical relationship?

<python-figure src="wti-gold-prices" caption="WTI oil and gold normalized prices diverge sharply, especially during the COVID crash and subsequent recovery."></python-figure>

<python-figure src="wti-gold-zscore" caption="The WTI/gold z-score shows large, persistent swings with no tendency to revert - these assets live in different worlds."></python-figure>

The z-score swings are even more extreme than gold/copper, with no mean-reverting structure. The COVID crash sent oil plummeting while gold surged as a safe haven - exactly the opposite of what a pairs trade would need. The macro narrative connecting oil and gold doesn't translate into a cointegrated relationship.

## Quantifying Mean Reversion

Looking at the z-score charts for WTI/Brent versus Gold/Silver, the visual difference can be subtle. Both oscillate. Both sometimes cross the entry thresholds. Both spike. The difference is in the **character** of those oscillations - and we can measure it precisely.

<python-table src="mean-reversion-metrics"></python-table>

The metrics tell a clear story:

**Half-life** is the most diagnostic metric. It measures how many trading days the spread takes to move halfway back to its mean after a deviation. WTI/Brent's short half-life means dislocations are temporary - the physical arbitrage mechanism (tanker shipping, refinery switching) actively forces convergence. Gold/Silver's longer half-life means the spread can drift for extended periods before reverting - if it reverts at all. Gold/Copper and WTI/Gold show effectively infinite half-lives: their "spreads" are not mean-reverting.

**Zero crossings per year** counts how often the z-score crosses the zero line. More crossings means the spread oscillates around its mean rather than trending away from it. WTI/Brent crosses frequently, creating regular trading opportunities. The non-cointegrated pairs cross less often because they spend extended periods on one side of zero - trending, not oscillating.

**Time within $\pm 2\sigma$** shows how much of the time the z-score stays within two standard deviations. For WTI/Brent, the spread almost always stays in a bounded range, with excursions beyond $2\sigma$ being rare tail events. Non-cointegrated pairs spend more time at extremes because their "spread" isn't pulled back to the mean.

**Max |z-score|** reveals the worst-case excursion. Even WTI/Brent can spike to extreme z-scores during crises (COVID). But the critical difference is **what happens after the spike**: WTI/Brent comes back, while non-cointegrated pairs can stay at extreme levels indefinitely.

### Why Gold and Silver Fool You

Gold and silver are the most deceptive pair. Their prices _look_ correlated. The gold-to-silver ratio is widely discussed by traders. Both are precious metals, inflation hedges, and stores of value. But correlation and cointegration are fundamentally different statistical properties.

**Correlation** says two series tend to move in the same direction. Gold and silver do - when markets panic, both rise. **Cointegration** says their _ratio_ reverts to a stable equilibrium. The gold-to-silver ratio doesn't - it drifted from ~85 in early 2019 to ~125 during COVID, then back to ~80, then to ~90. These aren't oscillations around a fixed mean; they're structural shifts driven by changing relative demand for investment gold versus industrial silver.

The gold/silver z-score might cross your entry threshold and look like a trade. But without a physical arbitrage mechanism to force convergence, you're betting on a regime that may never return. The spread can stay "wrong" longer than you can stay solvent.

### Why Physical Arbitrage Matters

WTI/Brent works because the spread is bounded by real-world economics. If WTI trades at a \$5 discount to Brent and it costs \$3 per barrel to ship oil from the Gulf Coast to Europe, arbitrageurs will buy WTI, ship it, and sell it as Brent - pocketing the \$2 difference and narrowing the spread. This mechanism provides a **fundamental floor and ceiling** on how far the spread can deviate.

Gold/Silver has no such mechanism. You can't convert gold into silver. The relative price is driven by jewelry demand, industrial use (silver in solar panels and electronics), central bank reserves (gold), and speculative flows - none of which create a physical arbitrage bound.

This is why pairs trading works best with **fungible substitutes** - two grades of oil, two delivery locations for the same commodity - rather than **thematically similar but fundamentally different assets** like two different metals.

## Spread Distribution

Comparing the spread distributions of our cointegrated pair against a non-cointegrated one makes the difference visually clear:

<python-figure src="spread-distribution" caption="The WTI/Brent spread is tightly concentrated around zero (mean-reverting), while gold/copper has fatter tails and more extreme values."></python-figure>

## Assessing Tradeability

Even WTI/Brent - our best pair - blows through the $\pm 3.0$ stop-loss level during the COVID crash. How do you distinguish between a tradeable pair experiencing normal tail risk and a pair that isn't suitable for trading?

### Stop-Loss Breaches Are Expected

A z-score of $\pm 3.0$ represents a three-standard-deviation event. For a normally distributed process, this occurs roughly 0.3% of the time. Over six years of daily data (~1,500 observations), you'd expect approximately 4–5 days beyond $\pm 3\sigma$. The WTI/Brent pair's COVID-era breach is consistent with tail risk - rare but not impossible.

The question isn't whether stop-losses ever trigger. It's whether the pair **recovers** after they do. Look at the 2020 yearly window above: the z-score spikes violently, hits the stop, but then mean-reverts back to normal within weeks. Compare this to the Gold/Copper z-score, which doesn't "spike and recover" - it _drifts_ to extreme values and stays there.

### Three Tests for Tradeability

**1. Does the half-life fit your trading horizon?**

If the half-life is 15 days and your lookback window is 60 days, the spread will complete approximately four full mean-reversion cycles within the lookback - plenty of trading opportunities. If the half-life is 200 days, you'd need a lookback of 800+ days, and you'd get very few signals per year. As a rule of thumb, look for a half-life shorter than one-third of your lookback window.

**2. Does the pair stay cointegrated through time?**

Run the cointegration test on rolling windows (e.g., trailing two years). A robust pair passes the test consistently, not just on the full sample. If cointegration appears and disappears, the relationship may be spurious or regime-dependent. WTI/Brent passes the test in most rolling windows because the physical arbitrage mechanism is structural, not cyclical.

**3. What happens after extreme events?**

Review every instance where the z-score breached $\pm 3.0$. Did the spread snap back within the half-life? That's healthy mean-reversion surviving a shock. Did it stay extreme for months? That suggests a structural break. Did it establish a new equilibrium at a different level? If so, the pair is no longer tradeable with the current parameters.

For WTI/Brent, the COVID breach resolved within weeks. The Russia-Ukraine shock in 2022 widened the spread but didn't break cointegration - the z-score continued to oscillate, just with more volatility. These are the signatures of a robust, tradeable relationship weathering external shocks.

### Position Sizing for Tail Risk

Even with a well-tested pair, stop-loss events are costly. The standard approach is to size positions so that a stop-loss event loses no more than a fixed percentage of your portfolio (typically 1–2%). If your stop-loss is at $\pm 3.0\sigma$ and entry is at $\pm 1.25\sigma$, the worst-case loss per trade is roughly $1.75\sigma$ of the spread. Size accordingly - the max drawdown in the backtest provides a realistic estimate of the damage a crisis can inflict.

## Trading Algorithm

The strategy follows simple rules applied to our cointegrated pair (WTI/Brent):

**Entry:**

- **Long spread** when $z_t < -1.25$ (spread is abnormally low, expect it to increase)
- **Short spread** when $z_t > +1.25$ (spread is abnormally high, expect it to decrease)

**Exit:**

- **Target**: z-score reverts to $\pm 0.5$
- **Stop-loss**: z-score reaches $\pm 3.0$ (spread is widening, cut losses)

In practice, "long the spread" for WTI/Brent means going long WTI and short Brent (betting the log price ratio will increase). "Short the spread" is the reverse.

The z-score lookback window is 60 trading days - roughly three months. This balances responsiveness (shorter windows react to recent changes) with stability (longer windows reduce false signals).

## Backtesting Results

We backtest the strategy on the WTI/Brent pair over the full 2019–2024 period:

<python-figure src="backtest-equity" caption="Equity curve for the WTI/Brent pairs trading strategy."></python-figure>

<python-table src="backtest-metrics"></python-table>

Key observations:

- The **Sharpe ratio** measures risk-adjusted return - above 1.0 is generally considered good
- **Max drawdown** shows the worst peak-to-trough decline - the cost of staying in the strategy through its worst period
- **Win rate** above 50% confirms the mean-reversion edge exists, though the edge may be modest

The equity curve shows the impact of extreme events. The COVID crash in 2020 - when WTI went negative - created a massive dislocation that would have triggered stop-losses. This is the fundamental tension of pairs trading: the same mean-reversion that generates steady profits can produce large losses when structural breaks occur.

## Conclusion

Pairs trading on cointegrated commodities illustrates both the power and the limitations of statistical arbitrage. The key takeaways:

1. **Cointegration ≠ correlation.** Two assets can be highly correlated without being cointegrated (and vice versa). Gold and silver move together but aren't cointegrated in this period. Cointegration is about a stable _long-run equilibrium_, not short-term co-movement.

2. **Few pairs actually work.** Out of 21 commodity pairs, only WTI/Brent passed the cointegration test. This reflects the high bar for a statistically tradeable relationship - you need a fundamental arbitrage mechanism, not just vague similarity.

3. **The strategy is not risk-free.** Extreme events (COVID crash), regime changes (new supply sources), and model breakdown (cointegration can disappear) are real risks. Stop-losses help but can't eliminate tail risk.

4. **Always test, never assume.** The gold/silver pair "should" work based on intuition, but the data says otherwise for this period. Let the statistics guide your trading, not your narrative.

The full Python implementation - data fetching, statistical testing, and backtesting - is available in this post's source files.
