# Strategy Reference

This document explains every strategy in plain language. No finance background required.

Every strategy follows the same structure:

- **What it does** - the core idea
- **When it goes long** - bets price will rise
- **When it goes short** - bets price will fall
- **Stop loss / take profit** - where it exits if wrong or right
- **Key parameters** - what you can tune

---

## How stops and targets work (applies to all strategies)

Every strategy uses **ATR** (Average True Range) to size its exits.

ATR is a number that measures how much the price typically moves in one candle. If BTC moves ~$500 per candle on average, ATR is roughly 500. It automatically adjusts to market volatility - wider in wild markets, tighter in calm ones.

- **Stop loss** = entry price ± (ATR × `atr_sl_mult`). If you enter long at $50,000 and ATR is $500 with a 2x multiplier, the stop is $49,000.
- **Take profit** = entry price ± (ATR × `atr_tp_mult`). With a 3x multiplier, target is $51,500.

This means in a volatile market the strategy automatically gives trades more room. In a quiet market it cuts losses tighter.

---

## Trend Strategies

These strategies bet that prices will continue moving in the direction they are already going.

---

### EMA_Crossover

**What it does**

Watches two moving averages - a fast one (reacts quickly to price changes) and a slow one (smooths out noise). When the fast line crosses above the slow line, the trend is turning up. When it crosses below, the trend is turning down.

A moving average is just the average closing price over the last N candles, recalculated every bar. An _exponential_ moving average (EMA) gives more weight to recent prices than older ones.

**When it goes long:** fast EMA crosses above slow EMA (trend turning up)
**When it goes short:** fast EMA crosses below slow EMA (trend turning down)

**Key parameters**

| Parameter     | Default | What it controls                                                                     |
| ------------- | ------- | ------------------------------------------------------------------------------------ |
| `fast_period` | 9       | How many candles the fast average looks back. Smaller = reacts faster, more signals  |
| `slow_period` | 21      | How many candles the slow average looks back. Larger = smoother, fewer false signals |
| `atr_period`  | 14      | How many candles to average for ATR calculation                                      |
| `atr_sl_mult` | 2.0     | Stop loss distance in ATR units                                                      |
| `atr_tp_mult` | 3.0     | Take profit distance in ATR units                                                    |

**Best in:** trending markets. Loses money in sideways/choppy markets.

---

### MACD_Trend

**What it does**

MACD (Moving Average Convergence Divergence) is a momentum indicator. It measures the _gap_ between a fast and slow EMA. When this gap is growing, momentum is building. When it is shrinking, momentum is fading.

The MACD "histogram" shows this gap visually as bars above or below zero. When the histogram flips from negative to positive, buyers are taking control. When it flips from positive to negative, sellers are taking control.

**When it goes long:** MACD histogram crosses above zero (buyers taking over)
**When it goes short:** MACD histogram crosses below zero (sellers taking over)

**Key parameters**

| Parameter       | Default | What it controls                               |
| --------------- | ------- | ---------------------------------------------- |
| `fast_period`   | 12      | Fast EMA period                                |
| `slow_period`   | 26      | Slow EMA period                                |
| `signal_period` | 9       | Smoothing of the histogram (the "signal line") |

**Best in:** trending markets with clear momentum shifts. Similar to EMA_Crossover but slightly more lag.

---

### SuperTrend

**What it does**

SuperTrend draws a trailing line above or below price. The line flips sides when price breaks through it. When price is above the line (line is below), trend is up. When price is below the line (line is above), trend is down.

The line's distance from price is set by ATR - in volatile markets it gives more breathing room so the signal does not flip on every small move.

**When it goes long:** SuperTrend line flips from above price to below price (uptrend confirmed)
**When it goes short:** SuperTrend line flips from below price to above price (downtrend confirmed)

**Key parameters**

| Parameter    | Default | What it controls                                                                        |
| ------------ | ------- | --------------------------------------------------------------------------------------- |
| `atr_period` | 10      | How many candles ATR looks back                                                         |
| `multiplier` | 3.0     | How far the band sits from price (in ATR units). Higher = fewer flips, larger positions |

**Best in:** markets with clean sustained trends. Less whipsaw than EMA crossovers.

---

### Ichimoku_Cloud

**What it does**

Ichimoku ("one glance equilibrium chart") is a Japanese system that draws a "cloud" representing the zone of expected support and resistance. When price is above the cloud, the trend is up. When below, the trend is down.

The cloud is formed by two lines: Senkou Span A (average of the short and medium midpoints) and Senkou Span B (average of the long midpoint), both projected 26 bars forward. It also checks two faster lines - the Tenkan (9-period midpoint) and Kijun (26-period midpoint) - as a confirmation signal.

**When it goes long:** price breaks above the cloud AND Tenkan is above Kijun
**When it goes short:** price breaks below the cloud AND Tenkan is below Kijun

**Key parameters**

| Parameter         | Default | What it controls                             |
| ----------------- | ------- | -------------------------------------------- |
| `tenkan_period`   | 9       | Fast conversion line lookback                |
| `kijun_period`    | 26      | Slow baseline lookback                       |
| `senkou_b_period` | 52      | Cloud span B lookback (sets cloud thickness) |

**Best in:** medium-term trends. Cloud provides natural support/resistance context.

---

### ADX_Trend

**What it does**

ADX (Average Directional Index) measures _how strong_ a trend is on a scale of 0-100. Importantly, ADX does not tell you which direction - just whether there is a strong trend at all. A reading below 20 means the market is directionless; above 25 means a trend is developing; above 40 means a strong trend.

The strategy also tracks DI+ (positive directional movement) and DI- (negative directional movement). When DI+ is above DI-, buyers are stronger than sellers.

**When it goes long:** DI+ crosses above DI- AND ADX is above threshold (strong trend + buyers winning)
**When it goes short:** DI- crosses above DI+ AND ADX is above threshold (strong trend + sellers winning)

**Key parameters**

| Parameter       | Default | What it controls                                                 |
| --------------- | ------- | ---------------------------------------------------------------- |
| `adx_period`    | 14      | Lookback for ADX calculation                                     |
| `adx_threshold` | 25.0    | Minimum ADX required to enter. Raise to only trade strong trends |

**Best in:** confirmed trending markets. Filters out weak, directionless periods that hurt most trend strategies.

---

## Reversion Strategies

These strategies bet that prices which have moved too far in one direction will snap back towards their average.

---

### RSI_Reversion

**What it does**

RSI (Relative Strength Index) measures whether recent gains have been too large relative to recent losses. It outputs a number between 0 and 100. Above 70 usually means the asset is "overbought" (price ran up too fast, likely to pull back). Below 30 means "oversold" (price dropped too fast, likely to bounce).

This strategy _fades_ these extremes - it bets on the pullback.

**When it goes long:** RSI drops below the oversold level (price has fallen too far, expecting a bounce)
**When it goes short:** RSI rises above the overbought level (price has risen too far, expecting a pullback)

**Key parameters**

| Parameter    | Default | What it controls                                                              |
| ------------ | ------- | ----------------------------------------------------------------------------- |
| `rsi_period` | 14      | How many candles RSI looks back                                               |
| `overbought` | 70      | RSI level considered too high (0-100). Raise to only trade extreme conditions |
| `oversold`   | 30      | RSI level considered too low (0-100). Lower to only trade extreme conditions  |

**Best in:** range-bound, sideways markets. Loses badly in strong trends where RSI can stay extreme for a long time.

---

### Bollinger_Reversion

**What it does**

Bollinger Bands draw three lines around price: a middle line (simple moving average) and two outer bands at 2 standard deviations above and below. Statistically, about 95% of prices should stay within the bands. When price touches the outer band, it is unusually extended and likely to return to the middle.

**When it goes long:** price touches or crosses below the lower Bollinger Band (too far down)
**When it goes short:** price touches or crosses above the upper Bollinger Band (too far up)

**Target price:** the middle band (the moving average)

**Key parameters**

| Parameter   | Default | What it controls                                                                       |
| ----------- | ------- | -------------------------------------------------------------------------------------- |
| `bb_period` | 20      | How many candles the middle line averages                                              |
| `bb_std`    | 2.0     | How many standard deviations wide the bands are. Raise for fewer, more extreme signals |

**Best in:** ranging markets. Can be hit hard when bands are broken by genuine trend breakouts.

---

### VWAP_Reversion

**What it does**

VWAP (Volume Weighted Average Price) is the average price paid for the asset, weighted by how much was traded at each price level. It is the "fair value" anchor that institutional traders use. Large traders try to execute near VWAP. When price strays far from VWAP, it tends to be pulled back.

This strategy measures how many standard deviations away from VWAP the current price is (a z-score). When the z-score is extreme, it bets on reversion.

**When it goes long:** price is more than `z_threshold` standard deviations _below_ VWAP (too cheap)
**When it goes short:** price is more than `z_threshold` standard deviations _above_ VWAP (too expensive)

**Key parameters**

| Parameter     | Default | What it controls                                                |
| ------------- | ------- | --------------------------------------------------------------- |
| `vwap_period` | 24      | Rolling lookback for VWAP calculation (bars, not a daily reset) |
| `z_threshold` | 2.0     | How many standard deviations away to trigger                    |

**Best in:** intraday and short-term trading. Because crypto trades 24/7 there is no natural daily VWAP reset, so this uses a rolling window.

---

### ZScore_Reversion

**What it does**

The simplest reversion strategy. It calculates how many standard deviations the current price is from its rolling mean (this number is called the z-score). When price is +2 standard deviations above its average, it has moved unusually far and may revert.

**When it goes long:** z-score drops below `-z_entry` (price unusually far below average)
**When it goes short:** z-score rises above `+z_entry` (price unusually far above average)

**Key parameters**

| Parameter  | Default | What it controls                                                                          |
| ---------- | ------- | ----------------------------------------------------------------------------------------- |
| `lookback` | 20      | How many candles to use for the mean and standard deviation                               |
| `z_entry`  | 2.0     | How extreme the z-score must be to trigger                                                |
| `z_exit`   | 0.5     | Z-score level at which the position is no longer valid (informational, tracked in reason) |

**Best in:** mean-reverting assets and consolidation periods.

---

## Momentum Strategies

These strategies bet that assets which have recently moved strongly will continue moving in the same direction for a while longer.

---

### RSI_Momentum

**What it does**

The inverse of RSI_Reversion. Instead of fading extremes, this strategy _chases_ them. The thinking: when RSI breaks above 60, buyers have decisively taken control. When it breaks below 40, sellers have taken control.

**When it goes long:** RSI rises above `upper_thresh` (momentum turning bullish)
**When it goes short:** RSI falls below `lower_thresh` (momentum turning bearish)

**Key parameters**

| Parameter      | Default | What it controls                                                    |
| -------------- | ------- | ------------------------------------------------------------------- |
| `rsi_period`   | 14      | Lookback for RSI                                                    |
| `upper_thresh` | 60      | RSI level that triggers a long. Higher = more confirmation required |
| `lower_thresh` | 40      | RSI level that triggers a short                                     |

**Best in:** trending markets. Performs oppositely to RSI_Reversion. Good pair to have one of each.

---

### ROC_Momentum

**What it does**

ROC (Rate of Change) simply measures the percentage change in price over the last N candles. If price was $1,000 ten candles ago and is now $1,050, ROC is 5%. When ROC crosses a threshold, momentum is strong enough to follow.

**When it goes long:** ROC crosses above `+roc_threshold` (strong upward momentum)
**When it goes short:** ROC crosses below `-roc_threshold` (strong downward momentum)

**Key parameters**

| Parameter       | Default | What it controls                                          |
| --------------- | ------- | --------------------------------------------------------- |
| `roc_period`    | 10      | How many candles back to measure the change               |
| `roc_threshold` | 1.0     | Minimum % change required. Raise to filter out weak moves |

**Best in:** volatile markets with large directional moves.

---

### Stochastic_Momentum

**What it does**

The Stochastic oscillator compares the current closing price to the range (high to low) over the last N candles, expressed as a percentage. A reading of 80% means the close is near the top of its recent range (high momentum up). A reading of 20% means it is near the bottom (high momentum down).

It also tracks a smoothed version of itself (%D). When %K crosses above %D in the oversold zone, momentum is turning up. When %K crosses below %D in the overbought zone, momentum is turning down.

**When it goes long:** %K crosses above %D while in the oversold zone (momentum shifting up from a low base)
**When it goes short:** %K crosses below %D while in the overbought zone (momentum shifting down from a high base)

**Key parameters**

| Parameter    | Default | What it controls                          |
| ------------ | ------- | ----------------------------------------- |
| `k_period`   | 14      | Lookback for the raw stochastic line (%K) |
| `d_period`   | 3       | Smoothing period for %D (signal line)     |
| `overbought` | 80      | Above this = in the overbought zone       |
| `oversold`   | 20      | Below this = in the oversold zone         |

**Best in:** markets with regular oscillations that don't trend too hard.

---

### Dual_Momentum

**What it does**

Uses two ROC measurements over different timeframes. The logic: if both a short-term and a long-term momentum measure agree that price is moving up, the signal is more reliable. Single-timeframe momentum has a lot of false signals. Agreement between two timeframes filters most of them out.

**When it goes long:** both short-term and long-term ROC are positive AND they just came into agreement
**When it goes short:** both short-term and long-term ROC are negative AND they just came into agreement

**Key parameters**

| Parameter      | Default | What it controls                                                                          |
| -------------- | ------- | ----------------------------------------------------------------------------------------- |
| `short_period` | 5       | Fast ROC lookback                                                                         |
| `long_period`  | 20      | Slow ROC lookback. Gap between short and long determines how different the timeframes are |

**Best in:** cleaner trending markets. The dual confirmation means fewer signals but higher quality.

---

## Volatility Strategies

These strategies trade _breakouts_ - when price escapes from a period of compression and makes a large directional move.

---

### ATR_Breakout

**What it does**

Defines the "recent range" as the high and low over the last N candles. A breakout is when price moves beyond the upper or lower edge of that range by at least `breakout_mult` ATR units. The idea is that when price breaks meaningfully beyond recent boundaries, it signals a new directional move.

**When it goes long:** price closes above (recent high + ATR × multiplier)
**When it goes short:** price closes below (recent low - ATR × multiplier)

**Key parameters**

| Parameter       | Default | What it controls                                                            |
| --------------- | ------- | --------------------------------------------------------------------------- |
| `atr_period`    | 14      | ATR lookback                                                                |
| `breakout_mult` | 1.5     | How far beyond the range price must move. Higher = fewer, cleaner breakouts |
| `lookback`      | 20      | How many candles define the "recent range"                                  |

**Best in:** markets coming out of consolidation phases.

---

### Donchian_Breakout

**What it does**

Donchian Channels are simply the highest high and lowest low over the last N candles. When price closes above the N-candle high, it is at a new breakout level. When it closes below the N-candle low, it is breaking down. This is one of the oldest and simplest trend-following approaches.

**When it goes long:** close is a new N-candle high
**When it goes short:** close is a new N-candle low

**Key parameters**

| Parameter         | Default | What it controls                                                           |
| ----------------- | ------- | -------------------------------------------------------------------------- |
| `breakout_period` | 20      | How many candles define the channel. Classic Turtle Traders used 20 and 55 |

**Best in:** trending markets and all-time high breakouts. Simple and robust.

---

### Bollinger_Squeeze

**What it does**

Bollinger Bands narrow when the market is quiet and widen when it is volatile. A "squeeze" is when the bands are unusually narrow - the market is in an unusually low-volatility state. Periods of low volatility are often followed by large breakout moves (the market coils like a spring). This strategy waits for the squeeze and then trades the first directional move that breaks out of it.

**When it goes long:** after a squeeze is detected, price breaks above the upper band
**When it goes short:** after a squeeze is detected, price breaks below the lower band

**Key parameters**

| Parameter          | Default | What it controls                                                               |
| ------------------ | ------- | ------------------------------------------------------------------------------ |
| `bb_period`        | 20      | Period for the Bollinger Bands                                                 |
| `bb_std`           | 2.0     | Band width (standard deviations)                                               |
| `squeeze_lookback` | 50      | How many recent candles to compare band width against                          |
| `squeeze_quantile` | 0.2     | What percentile of recent band widths counts as a "squeeze" (0.2 = bottom 20%) |

**Best in:** choppy markets that occasionally explode. Good complement to trend strategies.

---

### Opening_Range_Breakout

**What it does**

Defines the price range of the first few hours of the UTC day (the "opening range"). This captures the initial price discovery for the day. When price later breaks above that range's high or below its low, it signals a directional move for the rest of the day.

**When it goes long:** price breaks above the opening range high
**When it goes short:** price breaks below the opening range low

**Key parameters**

| Parameter     | Default | What it controls                                            |
| ------------- | ------- | ----------------------------------------------------------- |
| `range_hours` | 2       | How many hours after midnight UTC defines the opening range |

**Best in:** liquid hours when institutional flows are active. Less reliable on weekends.

---

## Volume Strategies

These strategies use trading volume as a signal - the idea being that price moves backed by high volume are more reliable than moves on thin volume.

---

### OBV_Divergence

**What it does**

OBV (On-Balance Volume) is a running total: add the full candle's volume when price went up, subtract it when price went down. It is essentially a volume-weighted price direction indicator. When OBV rises but price falls (or vice versa), there is a "divergence" - volume is not confirming the price move. Divergences often predict reversals.

**When it goes long:** price trend is down but OBV trend is up (buying pressure hidden under falling price)
**When it goes short:** price trend is up but OBV trend is down (selling pressure hidden under rising price)

**Key parameters**

| Parameter      | Default | What it controls                                               |
| -------------- | ------- | -------------------------------------------------------------- |
| `trend_period` | 20      | How many candles are used to measure both price and OBV trends |

**Best in:** market turns and distribution/accumulation phases.

---

### VWAP_Cross

**What it does**

A simpler VWAP strategy than VWAP_Reversion. Instead of fading extremes, it trades the momentum when price crosses the VWAP line. Crossing above VWAP means buyers have taken control of the day's average; crossing below means sellers have.

**When it goes long:** price crosses above rolling VWAP
**When it goes short:** price crosses below rolling VWAP

**Key parameters**

| Parameter     | Default | What it controls               |
| ------------- | ------- | ------------------------------ |
| `vwap_period` | 24      | Rolling window for VWAP (bars) |

**Best in:** active trading sessions. Complements OBV_Divergence by following confirmed VWAP direction.

---

### TradeFlow_Imbalance

**What it does**

Binance provides a split of volume: "taker buy volume" (market buyers hitting the ask) vs total volume. When buyers are aggressively taking - lifting offers faster than sellers can post them - it signals upward pressure. This is more direct than OBV because it captures _aggressive_ order flow, not just directional volume.

The ratio of taker buy to total volume is converted to a z-score (how many standard deviations it is from its average). When the z-score is extreme, order flow is unusually one-sided.

**When it goes long:** taker buy ratio z-score exceeds `+z_threshold` (unusually strong buying)
**When it goes short:** taker buy ratio z-score drops below `-z_threshold` (unusually strong selling)

**Key parameters**

| Parameter          | Default | What it controls                            |
| ------------------ | ------- | ------------------------------------------- |
| `imbalance_period` | 10      | Rolling window for the buy ratio            |
| `z_lookback`       | 50      | How many periods define "average" buy ratio |
| `z_threshold`      | 1.5     | Standard deviations required to trigger     |

**Best in:** highly liquid pairs (BTC, ETH) where the order flow data is meaningful.

---

## Statistical Strategies

These strategies use more advanced mathematical models to detect patterns.

---

### Kalman_MA

**What it does**

A Kalman filter is a mathematical technique originally developed for missile guidance systems. It estimates the "true" value of something (here: price) by combining a prediction (where price should be based on its recent trajectory) with a noisy measurement (the actual price). The result is a smoothed estimate that adapts its smoothing speed based on how volatile the market is.

Think of it as a moving average that gets faster when price is moving fast and slower when price is quiet. When price is above the Kalman estimate, trend is up. When below, trend is down.

**When it goes long:** price crosses above the Kalman filtered line
**When it goes short:** price crosses below the Kalman filtered line

**Key parameters**

| Parameter           | Default | What it controls                                                               |
| ------------------- | ------- | ------------------------------------------------------------------------------ |
| `process_noise`     | 1e-5    | How fast the filter adapts to price changes. Higher = more responsive, noisier |
| `measurement_noise` | 1e-2    | How much it trusts each price observation. Higher = more smoothing             |

**Best in:** trending markets. More adaptive than a fixed moving average.

---

### Hurst_Regime

**What it does**

The Hurst exponent measures whether a time series is trending, random, or mean-reverting:

- H > 0.6: trending (prices tend to continue in their direction)
- H ≈ 0.5: random walk (no predictability)
- H < 0.4: mean-reverting (prices tend to snap back)

This strategy calculates the Hurst exponent in a rolling window and then applies different signals depending on the detected regime: momentum signals when trending, reversion signals when mean-reverting, and no trade when the regime is uncertain.

**When it goes long:** in trending regime, price is rising; in reversion regime, price has fallen too far
**When it goes short:** in trending regime, price is falling; in reversion regime, price has risen too far

**Key parameters**

| Parameter             | Default | What it controls                                                       |
| --------------------- | ------- | ---------------------------------------------------------------------- |
| `hurst_period`        | 100     | How many candles to estimate the Hurst exponent over (needs many bars) |
| `trending_threshold`  | 0.6     | Hurst above this = trending regime                                     |
| `reversion_threshold` | 0.4     | Hurst below this = reversion regime                                    |

**Best in:** markets that shift between trending and ranging - this strategy adapts automatically.

---

### Regression_Channel

**What it does**

Draws a linear regression line through the last N candle closes (a best-fit straight line). Then creates a channel by adding/subtracting a multiple of the standard deviation of the residuals (how far prices deviated from the fitted line). When price breaks above the upper channel, it has moved unusually far from the trend and may revert; when it breaks below, it may bounce back.

**When it goes long:** price falls below the lower regression channel band
**When it goes short:** price rises above the upper regression channel band

**Key parameters**

| Parameter           | Default | What it controls                                    |
| ------------------- | ------- | --------------------------------------------------- |
| `regression_period` | 50      | How many candles the regression line is fit through |
| `channel_std`       | 2.0     | How many standard deviations wide the channel is    |

**Best in:** trending markets with predictable mean-reversion within the trend.

---

### Pairs_Spread_MeanReversion

**What it does**

Pairs trading requires two correlated assets (e.g. BTC and ETH). The strategy tracks the _spread_ between them (the log of their price ratio). Normally the spread stays within a predictable range. When it widens too far - one asset is unusually cheap relative to the other - you buy the cheap one and short the expensive one, expecting the gap to close.

This is a market-neutral strategy: if crypto crashes overall, both legs lose roughly equally, so the portfolio is insulated from market direction. You are only betting on the relationship between the two assets.

**When it goes long the spread:** the ratio is below its mean by `z_entry` standard deviations (primary is cheap vs secondary)
**When it goes short the spread:** the ratio is above its mean by `z_entry` standard deviations (primary is expensive vs secondary)

**Requires:** two data sources - `data["primary"]` and `data["secondary"]`

**Key parameters**

| Parameter  | Default | What it controls                                                |
| ---------- | ------- | --------------------------------------------------------------- |
| `lookback` | 50      | How many candles define the "normal" spread level               |
| `z_entry`  | 2.0     | How many standard deviations the spread must diverge to trigger |

**Best in:** pairs with historically stable correlation (e.g. BTC/ETH). Breaks down when correlation changes structurally.

---

## Funding Strategies

These strategies exploit the **funding rate** mechanism unique to perpetual futures contracts.

**What is a funding rate?** Unlike regular futures, perpetuals never expire. Instead, every 8 hours, longs and shorts pay each other a small fee to keep the perpetual price anchored to the spot price. When longs outnumber shorts and the market is bullish, longs pay shorts (positive funding). When shorts dominate, shorts pay longs (negative funding). Extreme funding rates signal crowded positioning - too many people on one side.

---

### Funding_Rate_Fade

**What it does**

When funding is very high (positive), too many traders are long. They are effectively paying shorts just to hold their position. At some point, this becomes unsustainable - many will close their longs, pushing price down. This strategy fades those crowded positions.

**When it goes long:** funding rate drops below `-funding_threshold` (too many shorts, crowded short trade)
**When it goes short:** funding rate rises above `+funding_threshold` (too many longs, crowded long trade)

**Key parameters**

| Parameter           | Default | What it controls                                                         |
| ------------------- | ------- | ------------------------------------------------------------------------ |
| `funding_threshold` | 0.001   | 0.001 = 0.1% per 8h funding. Raise to only trade very extreme conditions |

**Best in:** market tops and bottoms where crowd positioning is most extreme.

---

### Funding_Momentum

**What it does**

Instead of fading extremes, this strategy follows persistent funding trends. If funding has been positive for many consecutive periods and is rising further, it means the bullish crowd is growing, not shrinking. This strategy rides that momentum.

**When it goes long:** funding has been consistently positive AND is still rising (sustained buy-side dominance)
**When it goes short:** funding has been consistently negative AND is still falling (sustained sell-side dominance)

**Key parameters**

| Parameter           | Default | What it controls                                     |
| ------------------- | ------- | ---------------------------------------------------- |
| `funding_period`    | 3       | How many consecutive funding events must agree       |
| `min_funding_level` | 0.0001  | Minimum absolute funding rate to consider meaningful |

**Best in:** sustained trending markets where positioning momentum builds over days.

---

### Carry_With_Trend

**What it does**

This strategy requires two separate conditions to align before entering:

1. The trend must be pointing in the right direction (EMA slope)
2. The funding rate must actually _benefit_ the trade (negative funding is free money to be long; positive funding is free money to be short)

You only go long when the trend is up AND funding is negative (you are being paid to be long). You only go short when the trend is down AND funding is positive (you are being paid to be short). This ensures you only take trades where both the price direction and the carry work in your favour.

**When it goes long:** EMA is sloping up AND funding is below `-funding_threshold` (trend + paid to hold)
**When it goes short:** EMA is sloping down AND funding is above `+funding_threshold` (trend + paid to hold)

**Key parameters**

| Parameter           | Default | What it controls                                         |
| ------------------- | ------- | -------------------------------------------------------- |
| `trend_period`      | 50      | EMA lookback for trend direction                         |
| `funding_threshold` | 0.0001  | Minimum funding rate magnitude to consider it meaningful |

**Best in:** moderate trending markets. Filters out many low-conviction trades.

---

## Regime Filter Strategies

These strategies use one indicator to decide whether the market is in a "tradable" state, and then only take signals that match the current regime.

---

### Volatility_Regime_Filter

**What it does**

The idea: some strategies work well in moderate volatility but fail in very quiet markets (not enough movement to profit from) or very volatile markets (too much noise, stops get hit constantly). This strategy measures current ATR as a percentile of recent ATR readings. It only allows EMA-based trend signals when volatility is in a "goldilocks" zone - not too high, not too low.

**When it goes long:** EMA crossover is bullish AND volatility is in the acceptable range
**When it goes short:** EMA crossover is bearish AND volatility is in the acceptable range

**Key parameters**

| Parameter      | Default | What it controls                                       |
| -------------- | ------- | ------------------------------------------------------ |
| `atr_period`   | 14      | ATR calculation period                                 |
| `atr_lookback` | 100     | How many bars define the volatility percentile history |
| `high_vol_pct` | 0.85    | ATR above this percentile = too volatile, no trades    |
| `low_vol_pct`  | 0.15    | ATR below this percentile = too quiet, no trades       |

**Best in:** markets that alternate between volatile and calm phases.

---

### ADX_Regime_Filter

**What it does**

Similar to Volatility_Regime_Filter but uses ADX (trend strength) instead of ATR (volatility). It only takes EMA crossover signals when ADX is in a specific range: strong enough to confirm a real trend, but not so extreme that the trend is already over-extended.

**When it goes long:** EMA trend is up AND ADX is between `adx_min` and `adx_max` AND DI+ > DI-
**When it goes short:** EMA trend is down AND ADX is between `adx_min` and `adx_max` AND DI- > DI+

**Key parameters**

| Parameter    | Default | What it controls                                       |
| ------------ | ------- | ------------------------------------------------------ |
| `adx_period` | 14      | ADX calculation period                                 |
| `adx_min`    | 20      | Minimum ADX to enter (trend must be developing)        |
| `adx_max`    | 50      | Maximum ADX to enter (trend must not be over-extended) |
| `ema_period` | 20      | EMA for trend direction                                |

**Best in:** well-defined trends that are neither in their infancy nor their final exhaustion stage.

---

## Tail Risk Strategies

These strategies specifically trade unusual market events - sudden volatility spikes, flash crashes, and liquidation cascades.

---

### VolSpike_Short

**What it does**

When volatility spikes suddenly (ATR jumps to an unusually high level relative to recent history), it often means a fear-driven move has just occurred. Fear-driven moves tend to over-shoot. After a volatility spike, prices often partially reverse as the panic subsides. This strategy shorts into volatility spikes, betting on that reversal.

**When it goes short:** ATR crosses above the `spike_threshold_pct` percentile of recent ATR readings
**When it goes long:** the same logic in reverse (rare - volatility spikes are more commonly associated with downside)

**Key parameters**

| Parameter             | Default | What it controls                                        |
| --------------------- | ------- | ------------------------------------------------------- |
| `atr_period`          | 14      | ATR calculation period                                  |
| `spike_lookback`      | 100     | How many bars define the "normal" ATR range             |
| `spike_threshold_pct` | 0.95    | ATR must be in the top 5% of recent readings to trigger |

**Best in:** liquid markets where panic sells create over-extended moves. High risk - volatility spikes can continue.

---

### Liquidation_Cascade

**What it does**

In leveraged crypto markets, when price moves sharply, leveraged traders get "liquidated" - their position is force-closed at a loss. These forced liquidations add to the directional pressure, which can trigger more liquidations in a cascade. Paradoxically, after a large, fast liquidation cascade, the selling (or buying) pressure from forced liquidations is exhausted. Price often reverses sharply.

This strategy detects a large rapid price move (via ROC) and bets in the _opposite_ direction - fading the cascade.

**When it goes long:** price has dropped sharply and fast (ROC is very negative), expecting a bounce
**When it goes short:** price has risen sharply and fast (ROC is very positive), expecting a reversal

**Optional filter:** can require funding rate to confirm the signal is from a genuinely crowded position

**Key parameters**

| Parameter           | Default | What it controls                                                         |
| ------------------- | ------- | ------------------------------------------------------------------------ |
| `roc_period`        | 3       | How fast the move is measured (short = detects very fast moves)          |
| `cascade_threshold` | 3.0     | How large the ROC move must be (in %). Raise to only trade extreme moves |
| `funding_confirm`   | True    | Whether to also require funding confirmation                             |

**Best in:** high-leverage periods and market structure events. High variance - requires large sample to evaluate.

---

## Time/Event Strategies

These strategies only trade during specific times when certain recurring patterns tend to occur.

---

### Session_Overlap_Momentum

**What it does**

The global trading day has natural activity peaks when major markets overlap. The two biggest overlaps are:

- **Asia/EU overlap:** 07:00-09:00 UTC (Tokyo close, London open)
- **EU/US overlap:** 13:00-16:00 UTC (London afternoon, New York morning)

During these windows, the volume and volatility tend to pick up, and momentum moves are more likely to follow through. This strategy only takes ROC momentum signals during these windows, and ignores all signals outside them.

**When it goes long:** inside a session overlap window AND ROC is above threshold
**When it goes short:** inside a session overlap window AND ROC is below negative threshold

**Key parameters**

| Parameter         | Default         | What it controls                              |
| ----------------- | --------------- | --------------------------------------------- |
| `roc_period`      | 5               | How many candles for the momentum measurement |
| `roc_threshold`   | 0.3             | Minimum momentum required                     |
| `overlap_windows` | [(7,9),(13,16)] | UTC hour ranges for the active windows        |

**Best in:** 1h candles on liquid pairs. Less effective on 4h where the window misses many candles.

---

### Funding_Window_Breakout

**What it does**

Funding rates settle every 8 hours at 00:00, 08:00, and 16:00 UTC. In the 1-2 hours before settlement, traders adjust their positions to avoid paying (or to capture) the upcoming funding payment. This creates predictable order flow near settlement times, which can cause price to break out of its recent range. This strategy trades those breakouts in the window before each settlement.

**When it goes long:** inside the funding window AND price breaks above the recent N-bar high
**When it goes short:** inside the funding window AND price breaks below the recent N-bar low

**Key parameters**

| Parameter             | Default  | What it controls                                       |
| --------------------- | -------- | ------------------------------------------------------ |
| `window_hours_before` | 2        | How many hours before settlement to start watching     |
| `settlement_hours`    | [0,8,16] | UTC hours when funding settles                         |
| `breakout_period`     | 10       | How many recent candles define the range to break from |

**Best in:** 1h candles on BTC and ETH where funding flows are large enough to move price.

---

## Quick comparison table

| Strategy                   | Style       | Best market           | Signals per month (typical) |
| -------------------------- | ----------- | --------------------- | --------------------------- |
| EMA_Crossover              | Trend       | Trending              | 10-30                       |
| MACD_Trend                 | Trend       | Trending              | 8-25                        |
| SuperTrend                 | Trend       | Trending              | 5-15                        |
| Ichimoku_Cloud             | Trend       | Trending              | 5-12                        |
| ADX_Trend                  | Trend       | Strong trend          | 5-15                        |
| RSI_Reversion              | Reversion   | Ranging               | 15-40                       |
| Bollinger_Reversion        | Reversion   | Ranging               | 10-30                       |
| VWAP_Reversion             | Reversion   | Ranging               | 20-60                       |
| ZScore_Reversion           | Reversion   | Ranging               | 15-40                       |
| RSI_Momentum               | Momentum    | Trending              | 10-25                       |
| ROC_Momentum               | Momentum    | Trending              | 15-40                       |
| Stochastic_Momentum        | Momentum    | Oscillating           | 10-25                       |
| Dual_Momentum              | Momentum    | Clean trends          | 5-15                        |
| ATR_Breakout               | Volatility  | Breakouts             | 8-20                        |
| Donchian_Breakout          | Volatility  | Breakouts             | 5-15                        |
| Bollinger_Squeeze          | Volatility  | Post-consolidation    | 3-10                        |
| Opening_Range_Breakout     | Volatility  | Active sessions       | 15-30                       |
| OBV_Divergence             | Volume      | Turning points        | 8-20                        |
| VWAP_Cross                 | Volume      | Active trading        | 15-40                       |
| TradeFlow_Imbalance        | Volume      | Liquid pairs          | 10-30                       |
| Kalman_MA                  | Statistical | Trending              | 10-25                       |
| Hurst_Regime               | Statistical | Any                   | 5-20                        |
| Regression_Channel         | Statistical | Trending ranges       | 8-20                        |
| Pairs_Spread_MeanReversion | Statistical | Correlated pairs      | 5-15                        |
| Funding_Rate_Fade          | Funding     | Market extremes       | 5-15                        |
| Funding_Momentum           | Funding     | Trending + crowd      | 5-10                        |
| Carry_With_Trend           | Funding     | Trending              | 5-12                        |
| Volatility_Regime_Filter   | Regime      | Moderate vol          | 5-15                        |
| ADX_Regime_Filter          | Regime      | Developing trends     | 5-12                        |
| VolSpike_Short             | Tail risk   | Panic events          | 1-5                         |
| Liquidation_Cascade        | Tail risk   | High leverage periods | 2-8                         |
| Session_Overlap_Momentum   | Time        | Active windows        | 15-40                       |
| Funding_Window_Breakout    | Time        | Pre-settlement        | 20-40                       |

Signal counts are approximate and depend heavily on the symbol and interval. Shorter intervals (15m) produce many more signals than longer ones (4h).
