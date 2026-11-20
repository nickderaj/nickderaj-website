---
title: 'Trading Strategy Reference: Trend, Reversion, Momentum, Breakouts, and More'
date: '2026-03-31'
description: 'A comprehensive 0-to-100 guide to systematic trading strategies - covering the mechanics, math, real-world examples, failure modes, and practical edge behind every approach.'
tags: ['trading', 'technical-analysis', 'quant', 'strategies']
---

<table-of-contents>
<li><a href="#overview">Overview</a></li>
<li><a href="#market-regimes">Market regimes</a></li>
<li><a href="#how-stops-and-targets-work">How stops and targets work</a></li>
<li><a href="#risk-and-position-sizing">Risk and position sizing</a></li>
<li><a href="#trend-strategies">Trend strategies</a></li>
<li><a href="#reversion-strategies">Reversion strategies</a></li>
<li><a href="#momentum-strategies">Momentum strategies</a></li>
<li><a href="#volatility-breakout-strategies">Volatility breakout strategies</a></li>
<li><a href="#volume-strategies">Volume strategies</a></li>
<li><a href="#statistical-strategies">Statistical strategies</a></li>
<li><a href="#funding-strategies">Funding strategies</a></li>
<li><a href="#regime-filter-strategies">Regime filter strategies</a></li>
<li><a href="#tail-risk-strategies">Tail risk strategies</a></li>
<li><a href="#time-and-event-strategies">Time and event strategies</a></li>
<li><a href="#combining-strategies">Combining strategies</a></li>
<li><a href="#quick-comparison-table">Quick comparison table</a></li>
</table-of-contents>

---

## Overview

Systematic trading means following a completely pre-specified set of rules to enter and exit positions - no gut calls, no exceptions. Every trade is determined by code or a written rulebook. This is in contrast to discretionary trading, where a human makes case-by-case judgments.

The appeal of systematic trading is not that machines are smarter than humans. It is that rules are consistent. A human trader can look at the same chart on two different days and make two different decisions based on mood, recent losses, or confirmation bias. A systematic strategy makes the same decision every time the same conditions appear. That consistency is what makes backtesting meaningful - if you study how a rule performed historically, you can expect similar behavior going forward (assuming the underlying market structure does not change).

**What gives a strategy an edge?**

Every profitable trading strategy exploits some persistent inefficiency in markets. These inefficiencies exist because of human behavior, institutional constraints, or structural features of how markets are organized. For example:

- Trend-following works because new information diffuses slowly. Not everyone acts on news simultaneously; large institutions take time to fully reposition.
- Mean-reversion works because markets overreact. Fear and greed push prices beyond what fundamentals justify, and then gravity pulls them back.
- Momentum works because performance-chasing is real. Funds flows follow recent winners, creating persistence.
- Volatility breakouts work because low volatility compresses price into a range, and the eventual resolution of that compression tends to be directional.

None of these edges are free. Every strategy has periods where it does not work. The skill of systematic trading lies in understanding _why_ a strategy works, so you can recognize when those conditions are present and when they are not.

**Alpha decay**

Strategies that once worked sometimes stop working. This happens when too many participants discover the same edge and trade it away, when regulations change, or when the underlying market structure shifts. A strategy that generated strong returns in the 1990s on U.S. equities may perform poorly today because the market has become more efficient at that particular frequency. This is called alpha decay, and it is one reason why understanding the _mechanism_ behind a strategy matters more than its historical returns alone.

**How to use this guide**

Each strategy section covers: the core idea and its origin, the math behind it, why it works at a market-structure level, how real traders have used it to generate returns, the specific conditions under which it fails, and an honest accounting of its pros and cons. Parameter tables give you the levers you can tune.

The goal is not to hand you a black box. It is to help you understand each strategy well enough to know when to use it, when to avoid it, and why it will occasionally betray you.

---

## Market Regimes

Before selecting any strategy, the most important question you can ask is: what is the market doing right now? Every strategy has a regime where it thrives and a regime where it bleeds. Ignoring this is the most common reason backtests look good but live trading disappoints.

**The four regimes**

You can characterize any market at any given time along two dimensions: **direction** (trending vs. ranging) and **volatility** (high vs. low).

|              | Low Volatility                                          | High Volatility                                          |
| ------------ | ------------------------------------------------------- | -------------------------------------------------------- |
| **Trending** | Slow, steady trend - ideal for EMA/MACD/SuperTrend      | Fast, volatile trend - momentum strategies, breakouts    |
| **Ranging**  | Tight range - ideal for reversion (Bollinger, RSI fade) | Wide, choppy range - hard to trade; vol-spike strategies |

**Trending markets** exhibit serial correlation in returns: the direction of yesterday's move contains information about today's move. Trend-following strategies work here because they systematically buy strength and sell weakness. The statistical signature is positive autocorrelation in returns.

**Ranging (mean-reverting) markets** exhibit negative serial correlation: after a move in one direction, prices are more likely to reverse. Reversion strategies work here. The statistical signature is a Hurst exponent below 0.5 (covered in the Hurst Regime section).

**The regime-switching problem**

The frustrating reality is that regimes are not labeled in real time - they can only be identified clearly in hindsight. A market that has been trending for six weeks may start ranging tomorrow. This is why many professional systematic traders either (a) run multiple strategy types simultaneously to cover multiple regimes, or (b) use a regime classifier (like ADX or the Hurst exponent) to gate which strategies are active.

A rule of thumb used by many systematic traders: if ADX is above 25, trend-following strategies have a better expected payoff; if ADX is below 20, reversion strategies are more appropriate.

**Why regime matters more than signal quality**

A mediocre strategy in the right regime will outperform an excellent strategy in the wrong regime. The EMA crossover - arguably the simplest possible trend strategy - generates excellent returns during sustained trends and reliably loses money during ranging markets. Knowing this, you might deploy it only when a regime filter confirms a trend is present. That filter adds no "new information" to the signal itself, but it changes the distribution of market conditions under which you trade, which can dramatically change the outcome.

---

## How stops and targets work

Across this guide, exits are expressed using **ATR** (Average True Range). Before understanding any strategy, it helps to understand ATR deeply.

**What ATR measures**

The true range of a candle is the largest of three quantities: the high-to-low range, the distance from the prior close to today's high, and the distance from the prior close to today's low. The last two cases capture gap moves that the simple high-low spread misses.

$$TR_t = \max(H_t - L_t, \; |H_t - C_{t-1}|, \; |L_t - C_{t-1}|)$$

ATR is a rolling average of true range over $n$ periods (commonly 14):

$$\text{ATR}_t = \frac{(n-1) \cdot \text{ATR}_{t-1} + TR_t}{n}$$

ATR tells you how much an asset typically moves per bar. A stock with an ATR of $2.50 on a $50 price is moving roughly 5% per day. An ATR of $0.50 on the same stock is much calmer.

**Why ATR-based stops are better than fixed stops**

A fixed stop of "$2 per trade" applied to different assets or different time periods will be too tight in volatile conditions (you get stopped out on noise before the trade has time to develop) and too wide in quiet conditions (you give back too much if wrong). ATR-based stops automatically scale: wider when the market is volatile, tighter when it is calm. This means your stop is always approximately calibrated to the current "noise level" of the instrument.

**R-multiples and expectancy**

Systematic traders think in terms of R - the amount risked on a single trade. If your stop is 2 ATR away, that distance is 1R. Your target at 3 ATR is 1.5R. Every trade either loses 1R (stop hit) or gains 1.5R (target hit), regardless of the actual dollar amount (which varies by position size and ATR).

Expectancy is the average R gained per trade:

$$E = (W \times \bar{R}_{win}) - (L \times \bar{R}_{loss})$$

where $W$ is win rate and $L = 1 - W$ is loss rate. A strategy with a 40% win rate but average win of 2R and average loss of 1R has expectancy = $(0.4 \times 2) - (0.6 \times 1) = 0.8 - 0.6 = +0.2R$ per trade. That is a profitable strategy despite losing more often than it wins. Trend-following strategies frequently operate in this space: lower win rates but large wins when trends extend.

---

## Risk and position sizing

The signal tells you _when_ and _which direction_ to trade. Position sizing tells you _how much_. Many traders significantly underestimate how much of their long-run outcome is determined by sizing rather than signal quality.

**Fixed fractional sizing**

The standard approach in systematic trading is to risk a fixed percentage of capital on each trade - typically 0.5% to 2%. If you have $100,000 and risk 1% per trade, you risk $1,000. If your stop is $250 away (2 ATR × $125 per unit), you trade 4 units.

$$\text{Position size} = \frac{\text{Capital} \times \text{Risk fraction}}{\text{Stop distance}}$$

This keeps risk constant as a percentage of equity regardless of how volatile the instrument is or how confident you feel in a particular trade.

**The Kelly Criterion**

The Kelly Criterion gives the theoretically optimal fraction of capital to risk per trade to maximize long-run geometric growth:

$$f^* = W - \frac{L}{\bar{R}_{win}}$$

In practice, full Kelly is too aggressive - it produces large drawdowns that most people cannot psychologically tolerate and that can wipe out an account through a streak of losses. Most professional systematic traders use "half Kelly" or "quarter Kelly" in practice.

**Drawdown and ruin**

The key risk metric is not annual return - it is maximum drawdown. A strategy that returns 30% per year but has a 50% maximum drawdown is extremely difficult to run in practice: no investor or risk committee will tolerate it, and psychologically you will abandon it at the worst possible moment (the bottom of the drawdown, just before recovery).

Larger position sizes increase both returns and drawdowns. The relationship is not linear: doubling position size roughly doubles returns but can more than double drawdowns and dramatically increases the probability of catastrophic loss. Systematic traders typically target maximum drawdowns of 10-25%, and size their positions backward from that constraint.

---

## Trend strategies

Trend strategies bet that price will continue moving in the direction it is already moving. The theoretical underpinning is that asset prices exhibit positive serial correlation over medium-term horizons - not because markets are irrational, but because information takes time to be fully incorporated, institutional capital takes time to rotate, and behavioral biases cause participants to anchor to old prices.

Trend-following has the longest documented track record of any systematic approach. Commodity Trading Advisors (CTAs) - funds that systematically trade futures across all asset classes - have collectively produced positive returns over decades using trend-following at their core. The strategy's defining feature is an asymmetric payoff: many small losses, occasional very large wins. This produces a return distribution with positive skew and fat right tails - the opposite of most strategies that sell premium or fade moves.

---

### EMA Crossover

**What it does**

An exponential moving average (EMA) computes a weighted average of past prices, where recent prices receive more weight than older prices. The weighting decays exponentially backward in time. This makes the EMA more responsive to recent price changes than a simple moving average, which weights all periods equally.

The strategy tracks two EMAs simultaneously: a fast one (shorter lookback, responds quickly to price changes) and a slow one (longer lookback, represents the longer-term trend). When the fast EMA crosses above the slow EMA, it signals that short-term momentum has shifted upward relative to the longer-term trend - a bullish signal. When the fast crosses below the slow, the short-term picture has deteriorated - a bearish signal.

The formula for EMA at time $t$ with smoothing factor $\alpha = \frac{2}{n+1}$:

$$\text{EMA}_t = \alpha \cdot P_t + (1 - \alpha) \cdot \text{EMA}_{t-1}$$

A 9-period EMA uses $\alpha = 0.2$, meaning today's price gets 20% weight and all prior history gets 80%. A 21-period EMA uses $\alpha \approx 0.0909$ - much slower to respond.

**When it goes long:** fast EMA crosses above slow EMA
**When it goes short:** fast EMA crosses below slow EMA

**Key parameters**

| Parameter     | Default | What it controls                               |
| ------------- | ------: | ---------------------------------------------- |
| `fast_period` |       9 | Faster response, more signals (and more noise) |
| `slow_period` |      21 | Smoother trend, fewer signals                  |
| `atr_period`  |      14 | ATR lookback                                   |
| `atr_sl_mult` |     2.0 | Stop distance in ATR units                     |
| `atr_tp_mult` |     3.0 | Target distance in ATR units                   |

**Why it works**

Trend-following via moving averages exploits a structural feature of how information spreads through markets. When a company releases unexpectedly strong earnings, not every participant reacts simultaneously. Retail traders may react over days; institutional funds need weeks to build or reduce positions without moving the market against themselves. This staggered response creates a period where price is biased upward as successive waves of buyers enter. The EMA crossover attempts to identify that inflection point.

There is also a behavioral component: investors anchor to recent prices and adjust slowly, creating momentum. Herding behavior - where participants observe others buying and join in - amplifies moves. Both of these tendencies make prices more persistent than pure random walk theory would predict.

**Real-world example**

The most widely cited application of EMA crossovers is the "golden cross" and "death cross" - the 50-day SMA crossing above or below the 200-day SMA on equity indices and individual stocks. When the S&P 500's 50-day SMA crossed above its 200-day SMA in April 2009, it confirmed what would become a multi-year bull market following the Global Financial Crisis. Trend-following funds that entered on that signal captured the majority of the recovery from the March 2009 lows. Conversely, when a death cross formed on many individual stocks in late 2018, it preceded a 20% correction in the S&P 500 through December of that year.

A lesser-cited but illustrative example: the Australian dollar (AUD/USD) formed a clear EMA crossover to the downside in early 2013 following the end of the commodities supercycle. Trend-following CTAs that followed this signal captured a move from roughly 1.05 to 0.68 over the following two years, representing one of the cleaner sustained currency trends of that decade.

**How traders have used it to profit**

At the portfolio level, trend-following with EMAs is most commonly deployed across a basket of uncorrelated markets rather than a single instrument. Diversified trend-followers such as the systematic programs at firms like Man AHL, Winton, and Graham Capital trade dozens of futures markets simultaneously - equity indices, bonds, currencies, commodities - because the strategy's low win rate (~40%) means a sufficient number of trades is needed to realize the edge. A single market applying EMA crossovers might have negative returns in any given year purely due to bad luck; a portfolio of 30-50 markets with the same rule smooths this significantly.

**False signals and failure modes**

The EMA crossover's single biggest weakness is whipsawing in range-bound markets. During choppy periods, price oscillates around both EMAs, generating frequent crossovers that each produce small losses. These accumulate into meaningful drawdowns.

In 2015-2016, the S&P 500 traded in a wide, trendless range. Any systematic EMA crossover strategy on the index would have generated a string of false signals - crossing up, getting stopped out, crossing down, getting stopped out - creating the uncomfortable experience of consistent small losses without a payoff.

The lag inherent in EMAs also means the strategy never buys at the bottom or sells at the top - it enters after a trend is already established and exits after it has already reversed. In trending markets this is acceptable. In rapidly reversing markets, you give back a significant portion of gains before getting a reversal signal.

**Pros**

- Simple, transparent, and easy to implement correctly
- Works across virtually all asset classes and timeframes
- Long documented track record dating back to commodity markets in the 1950s-60s
- Naturally scales with volatility when combined with ATR-based stops

**Cons**

- Significant lag - always enters after the move has begun
- Loses money systematically in ranging, choppy markets
- Low win rate (~35-45%) requires psychological discipline to stick with
- Prone to whipsawing when the period ratio (fast/slow) is too compressed

**Best in:** markets with clean, sustained directional moves. Most reliable on daily and weekly timeframes.
**Avoid when:** the market has been oscillating without direction for weeks. Use ADX < 20 as an exit signal.

<python-figure src="strategy-ema-crossover" caption="Price with fast EMA(9) and slow EMA(21). Crossovers are the directional signals."></python-figure>

---

### MACD Trend

**What it does**

MACD - Moving Average Convergence Divergence - was developed by Gerald Appel in the late 1970s. Appel was a money manager looking for a way to quantify momentum shifts that EMA crossovers identified too late. His insight was to track not the EMAs themselves but the _distance_ between them. That distance - the spread between a fast EMA and a slow EMA - is MACD's core measurement.

When the fast EMA is pulling away from the slow EMA (distance growing), momentum is accelerating. When the fast EMA is converging back toward the slow (distance shrinking), momentum is decelerating. By tracking this spread and smoothing it (the "signal line"), Appel created a system that captures the rate of change of the underlying trend rather than just its direction.

The three components:

$$\text{MACD line} = \text{EMA}_{12} - \text{EMA}_{26}$$

$$\text{Signal line} = \text{EMA}_9(\text{MACD line})$$

$$\text{Histogram} = \text{MACD line} - \text{Signal line}$$

This strategy uses the **histogram crossing zero** as its signal - simpler and slightly faster than waiting for the MACD line to cross its signal line, because the histogram crossing zero is mathematically equivalent to the MACD line crossing the signal line.

**When it goes long:** MACD histogram crosses above zero (momentum turning positive)
**When it goes short:** MACD histogram crosses below zero (momentum turning negative)

**Key parameters**

| Parameter       | Default | What it controls |
| --------------- | ------: | ---------------- |
| `fast_period`   |      12 | Fast EMA period  |
| `slow_period`   |      26 | Slow EMA period  |
| `signal_period` |       9 | Signal smoothing |

**Why it works**

MACD adds one conceptual layer on top of a basic EMA crossover: instead of simply asking "is the fast above the slow?" it asks "is the fast _increasing_ relative to the slow?" This second derivative view of price makes MACD more sensitive to inflection points. A market can have the fast EMA above the slow EMA (positive MACD) but if the histogram is declining, momentum is fading - a warning that the trend may be losing steam before price has visibly rolled over.

This is why many traders use MACD divergence as a confirming or warning signal: price makes a new high, but MACD makes a lower high. The price trend is intact, but momentum is not confirming it - suggesting the move is running on fumes.

**Real-world example**

Crude oil's parabolic run from 2005 to mid-2008 provides a clean MACD case study. As WTI oil moved from $50 to $147, the MACD histogram on the weekly chart remained consistently positive, crossing zero in early 2007 and staying elevated for over a year. A trend-following strategy keyed to that zero-line crossing would have captured the heart of that move.

More instructively, MACD showed clear bearish divergence in June 2008 - price made a new all-time high above \$140, but the MACD histogram was making a lower high compared to the prior peak. That divergence preceded a collapse to below $40 within six months. Traders watching MACD were warned before price gave a definitive reversal signal.

A separate example from equity markets: in Q1 2016, MACD on the S&P 500 daily chart crossed from negative to positive in early February as markets bottomed from the China-led selloff. That crossover correctly signaled the resumption of the bull market, with the index going on to gain over 20% through the end of the year.

**How traders have used it to profit**

MACD is one of the most widely used technical indicators in the world, and accordingly its most basic application (signal line crossovers) has largely been arbitraged away in highly liquid markets. Where it retains edge is in less efficient markets (smaller-cap equities, frontier market currencies, less-traded commodity futures) and in combinations with other filters. Professional systematic traders rarely use MACD in isolation; they use the zero-line crossover as one component within a multi-factor entry model.

**False signals and failure modes**

In ranging markets, MACD whipsaws around zero relentlessly. During the S&P 500's lengthy consolidation in 2015 (when the index traded roughly between 1,850 and 2,130 for most of the year), MACD generated multiple crossovers in both directions with almost no follow-through - a reliable way to accumulate losses.

MACD also has substantial lag. The default 12/26/9 parameters were calibrated for daily bars in the early 1980s equity market. On faster timeframes or instruments with different volatility characteristics, the default parameters often generate signals that arrive well after the optimal entry point.

**Pros**

- Captures momentum in addition to trend direction
- Divergence setups provide advance warning of potential reversals
- Works across all asset classes and timeframes with parameter adjustment
- The histogram gives intuitive visual representation of momentum strength

**Cons**

- Lagging indicator - typically enters a trend late
- Whipsaws badly in sideways markets
- Default parameters (12/26/9) are not optimal across all instruments
- Multiple MACD "signals" exist (zero-line, signal-line, divergence) which can create confusion

**Best in:** trending markets with clear momentum phases and distinct pivots.
**Avoid when:** markets are oscillating in a defined range - MACD will cross zero repeatedly without follow-through.

<python-figure src="strategy-macd-trend" caption="MACD histogram crossing the zero line (positive vs negative momentum)."></python-figure>

---

### SuperTrend

**What it does**

SuperTrend is an ATR-based trailing stop mechanism that produces a single line which sits either above or below price. The line's position relative to price tells you the trend direction - below price means uptrend, above price means downtrend. When price closes on the other side of the line, the line flips, and the trend signal reverses.

The mechanics: SuperTrend calculates a basic upper and lower band around price using ATR, then applies a ratcheting rule - the band can only move in the direction that tightens it (it cannot move away from price). This creates a trailing stop that locks in gains as trends extend, and flips when price breaks the stop.

For an uptrend:

$$\text{SuperTrend}_t = \frac{H_t + L_t}{2} - (\text{multiplier} \times \text{ATR}_t)$$

The line is below price and trails upward as the trend extends. If price closes below this line, the trend flips bearish and the line jumps above price.

**When it goes long:** the SuperTrend flips below price (uptrend confirmed)
**When it goes short:** the SuperTrend flips above price (downtrend confirmed)

**Key parameters**

| Parameter    | Default | What it controls           |
| ------------ | ------: | -------------------------- |
| `atr_period` |      10 | ATR lookback               |
| `multiplier` |     3.0 | Band distance in ATR units |

**Why it works**

SuperTrend works for the same reason trailing stops work: it gives trends room to breathe by placing the stop far enough from current price that normal volatility doesn't trigger it, while systematically locking in profits as the trend extends. The ATR-based distance means the stop is calibrated to the instrument's actual noise level.

The "ratcheting" property is what distinguishes it from simple ATR bands. Because the stop can only move in the favorable direction, it creates an asymmetry: you participate fully in trend extension while limiting the loss on any given trade to approximately the stop distance at entry. This matches the payoff profile that trend-following requires - cut losses, let winners run.

**Real-world example**

The EUR/USD bear market of 2014-2016 provides a compelling SuperTrend example. From May 2014 to March 2015, the euro fell nearly 25% against the dollar - one of the largest currency moves in years, driven by diverging monetary policy between the ECB (moving toward quantitative easing) and the Fed (moving toward rate hikes). On the weekly chart, SuperTrend with a 10-period ATR and 3.0 multiplier would have flipped bearish in mid-2014 and held the short position essentially intact for the entire decline, only flipping back as the move exhausted near 1.05.

A single well-held SuperTrend signal on EUR/USD would have captured roughly 2,000 pips of directional move - the kind of extended trend that makes the strategy's occasional whipsaw losses look trivial by comparison.

**How traders have used it to profit**

SuperTrend is extensively used in trend-following systems for commodity markets, where trends are often long and price-driven by fundamental supply/demand shifts that take months or years to fully price in. Agricultural commodities, energy markets, and metals all exhibit periodic sustained trends that SuperTrend captures effectively.

The strategy is also widely used as a dynamic position-management tool - even by discretionary traders who enter for other reasons. Rather than setting a fixed take-profit target, they let SuperTrend define the trailing stop and ride the trend until it flips. This allows large winning trades to run without arbitrary targets cutting them short.

**False signals and failure modes**

SuperTrend's weakness is that it can flip rapidly during high-volatility consolidation - when ATR is elevated but price is not actually trending. In these conditions, the band alternates between above and below price multiple times, each flip generating a loss. This typically occurs after a large move when the market is digesting gains or losses without a clear new direction.

In late 2018, crude oil collapsed from $76 to $42 in about 12 weeks. After the initial crash, the market entered months of volatile, trendless trading as participants debated the new equilibrium. SuperTrend on daily charts would have generated multiple losing flips during this consolidation before any new trend emerged.

**Pros**

- Clear, unambiguous signal - line above = short, below = long
- Excellent trend-following payoff: small losses, potentially large wins
- ATR-based band automatically adapts to volatility
- Easy to implement as a trailing stop even without using it for entry

**Cons**

- Gives back significant unrealized profit on reversal before flipping
- High-volatility sideways markets produce repeated whipsaws
- No nuance - single binary signal with no strength indicator
- The flip can be triggered by a single spike candle (flash crash risk)

**Best in:** sustained directional trends with moderate volatility. Daily and weekly timeframes.
**Avoid when:** markets are in high-volatility consolidation - every spike will trigger a flip.

<python-figure src="strategy-supertrend" caption="Illustrative SuperTrend line flipping around price as volatility changes."></python-figure>

---

### Ichimoku Cloud

**What it does**

Ichimoku Kinko Hyo - usually shortened to Ichimoku Cloud - is a comprehensive trend system developed over roughly 30 years by Goichi Hosoda, a Japanese journalist writing under the pen name "Ichimoku Sanjin." He published it in 1969. The name translates roughly to "one glance equilibrium chart" - the intention was that a trained eye could assess the full trend picture at a glance.

Ichimoku is unusual in that it uses five separate lines derived from midpoints of price ranges rather than EMAs or other moving averages:

**Tenkan-sen (Conversion Line):** Midpoint of the 9-period high/low range. Reflects very short-term price equilibrium.
$$\text{Tenkan} = \frac{\text{High}_9 + \text{Low}_9}{2}$$

**Kijun-sen (Base Line):** Midpoint of the 26-period high/low range. Reflects medium-term equilibrium - acts as a trend and support/resistance indicator.
$$\text{Kijun} = \frac{\text{High}_{26} + \text{Low}_{26}}{2}$$

**Senkou Span A (Leading Span A):** Midpoint of Tenkan and Kijun, plotted 26 periods into the future.
$$\text{Senkou A} = \frac{\text{Tenkan} + \text{Kijun}}{2}$$

**Senkou Span B (Leading Span B):** Midpoint of the 52-period high/low range, plotted 26 periods into the future.
$$\text{Senkou B} = \frac{\text{High}_{52} + \text{Low}_{52}}{2}$$

The area between Senkou Span A and B is the **cloud (Kumo)**. When Span A > Span B the cloud is bullish (often colored green); when Span A < Span B it is bearish (often colored red). Crucially, both spans are plotted 26 periods ahead, creating a visible support/resistance zone in the future.

**Chikou Span (Lagging Span):** Current closing price plotted 26 periods in the past. Provides a direct comparison of current price to historical levels.

This strategy uses a simplified reading: price above cloud + Tenkan > Kijun = uptrend, enter long; price below cloud + Tenkan < Kijun = downtrend, enter short.

**When it goes long:** price breaks above cloud and Tenkan > Kijun
**When it goes short:** price breaks below cloud and Tenkan < Kijun

**Key parameters**

| Parameter         | Default | What it controls                |
| ----------------- | ------: | ------------------------------- |
| `tenkan_period`   |       9 | Fast conversion line lookback   |
| `kijun_period`    |      26 | Baseline lookback               |
| `senkou_b_period` |      52 | Cloud thickness / long lookback |

**Why it works**

The cloud provides dynamic support and resistance that is more adaptive than fixed lines. Because it is derived from the midpoint of price ranges (which capture both highs and lows), it reflects the equilibrium price over the relevant period. Markets frequently return to equilibrium after deviations - when they break through and close on the other side, it suggests a genuine regime shift rather than a transient spike.

The forward projection of the cloud (plotting 26 bars ahead) is one of Ichimoku's most distinctive features. It lets you see where support and resistance will be in the future based on current price structure. A thin cloud ahead suggests weak support - the market may pass through easily. A thick cloud suggests strong expected support - a sustained break would be more meaningful.

**Real-world example**

Ichimoku is perhaps most famously applied in Japanese equity markets and yen-denominated currency pairs, where it originated. The USD/JPY during 2012-2015 provides an excellent example. Following the election of Prime Minister Shinzo Abe and the announcement of Abenomics (a policy of aggressive monetary easing), USD/JPY broke decisively above a multi-year Ichimoku cloud in December 2012. Tenkan crossed above Kijun, the cloud turned bullish, and the pair went on to rally from 80 to 125 over the next three years. Japanese professional traders following the cloud system had a clear, timely signal for one of the most sustained currency trends in recent memory.

The Nikkei 225 during the same period showed an equally clean cloud break - the index was trading below cloud for much of 2011-2012, then broke above and spent the entire Abenomics rally in clear "above cloud, bullish configuration" territory.

**How traders have used it to profit**

Institutional FX desks in Japan have used Ichimoku for decades as a core directional framework. Major Japanese banks and securities firms publish regular Ichimoku analysis of major pairs. In the Western algorithmic trading community, the cloud provides useful, programmable support/resistance zones for position management - traders enter when price breaks above the cloud and use the cloud's lower edge as a trailing stop.

**False signals and failure modes**

Ichimoku was designed for daily timeframes - the 9/26/52 parameters were calibrated to trading weeks and months in Japanese markets. On shorter timeframes, the defaults lose much of their original logic, and signals become noisy.

In ranging, trendless markets, price repeatedly crosses above and below the cloud without committing in either direction. Because the cloud is generated from midpoints of recent ranges rather than closes, it can be very thick during volatile periods - requiring a substantial sustained move to produce a clean break.

Additionally, beginners often become overwhelmed by the visual complexity of five overlapping lines and make inconsistent decisions. The strategy demands discipline to trade only the definitive cloud breaks.

**Pros**

- Self-contained system - provides trend direction, momentum, support/resistance, and future zones in one indicator
- Forward-projected cloud is unique among trend indicators
- Extensively studied and used in institutional settings in Asia
- Cloud acts as natural trailing stop once in a position

**Cons**

- Visually complex - steep learning curve to read correctly
- Default parameters calibrated for daily Japanese equity markets; need adjustment for other timeframes/assets
- Thick clouds can suppress entries during early-trend periods
- Range-bound markets produce confusing, unreliable cloud configurations

**Best in:** medium to long-term trends on daily and weekly charts, particularly in currency and equity index markets.
**Avoid when:** markets are oscillating in a range or have been in consolidation for extended periods.

<python-figure src="strategy-ichimoku-cloud" caption="Ichimoku lines (Tenkan, Kijun, Span A/B) plotted with price for trend context."></python-figure>

---

### ADX Trend

**What it does**

The Average Directional Index was developed by J. Welles Wilder Jr. and published in his 1978 book _New Concepts in Technical Trading Systems_ - the same book that introduced RSI, ATR, and the Parabolic SAR. Wilder was a mechanical engineer turned trader, and his indicators reflect an engineer's preference for precise, mathematical definitions.

ADX is unique among trend indicators: it measures the **strength** of a trend, not its direction. A high ADX means price is trending strongly - it does not tell you which way. Direction comes from the Directional Indicators: DI+ (positive directional indicator) tracks upward movement, DI- (negative directional indicator) tracks downward movement.

The construction:

$$+DM = \max(H_t - H_{t-1}, 0) \quad \text{if } H_t - H_{t-1} > L_{t-1} - L_t, \text{ else } 0$$
$$-DM = \max(L_{t-1} - L_t, 0) \quad \text{if } L_{t-1} - L_t > H_t - H_{t-1}, \text{ else } 0$$

These are smoothed over the ATR period to produce DI+ and DI-. The Directional Movement Index (DX) is:

$$DX = \frac{|DI+ - DI-|}{DI+ + DI-} \times 100$$

ADX is then a smoothed average of DX. It therefore tells you how "spread apart" DI+ and DI- are on average - a measure of directional consistency.

Wilder's interpretation: ADX below 20 = no trend (sideways); 20-25 = emerging trend; above 25 = confirmed trend; above 40 = strong trend; above 50 = extremely strong trend (often near exhaustion).

**When it goes long:** DI+ crosses above DI- and ADX > threshold
**When it goes short:** DI- crosses above DI+ and ADX > threshold

**Key parameters**

| Parameter       | Default | What it controls                |
| --------------- | ------: | ------------------------------- |
| `adx_period`    |      14 | ADX lookback                    |
| `adx_threshold` |    25.0 | Minimum trend strength to trade |

**Why it works**

Most trend indicators give signals regardless of whether a trend actually exists. ADX gatekeeps. By requiring ADX > 25 before taking a directional signal, the strategy filters out trades in trendless markets - exactly the environment where EMA crossovers and similar strategies bleed. This conceptually simple filter has an outsized impact on strategy quality because it avoids the worst-case scenario (taking trend signals in ranges).

The DI+/DI- crossover adds directional confirmation to the trend-strength reading. Not only does a trend exist (ADX > 25), but the directional evidence agrees with the signal direction. This double filter - strength + direction - produces higher-quality entries at the cost of missing some early-trend moves.

**Real-world example**

The crude oil bear market of 2014-2016 is one of the cleanest ADX trend cases in recent history. WTI crude fell from approximately $107 in June 2014 to $26 in February 2016 - a 75% decline driven by a structural shift as U.S. shale production transformed global supply dynamics. During the most intense phase of the decline (mid-2014 through early 2015), ADX on the weekly chart registered above 35 - firmly in "strong trend" territory. DI- was dominant throughout. A strategy requiring ADX > 25 and DI- > DI+ would have held the short through most of the decline's magnitude.

By contrast, after the February 2016 low, oil entered a multi-year period of lower-volatility oscillation between roughly $40 and $75. ADX on the weekly chart frequently dropped below 20 during this period - correctly flagging a non-trending environment and keeping trend-followers out of the chop.

**How traders have used it to profit**

ADX is most commonly used as a filter _on top of_ another strategy rather than as a standalone entry system. A fund might run an EMA crossover on 20 commodity markets, but only take signals when ADX > 25 on the relevant market. This filter alone has been shown in academic research to improve the risk-adjusted return of simple moving-average strategies significantly.

In currency markets, where trends can persist for years due to central bank policy divergence, ADX readings above 30 have historically been reliable confirming signals that a trend is in progress and worth following.

**False signals and failure modes**

ADX is a lagging indicator - it rises in response to trend price action that has already occurred. This means two things: (1) you will always enter a trend somewhat late, after ADX has already risen above 25; and (2) ADX can remain elevated for a period after a trend reverses, because the smoothing mechanism is slow to reflect the reversal. In other words, ADX can be high during the early stages of a trend reversal, making it look like a trend is still strong when it is actually ending.

A specific failure mode: in whipsaw markets where price makes large directional moves but then immediately reverses, ADX can spike above 25 on the initial move and then stay elevated as price reverses equally violently. Both the initial signal and the reversal are taken - producing two losses in quick succession.

**Pros**

- Unique capability: quantifies trend strength, not just direction
- Excellent filter for eliminating range-trading losses in trend strategies
- Works across all timeframes and asset classes
- Can be combined with any directional indicator as a quality gate

**Cons**

- Lagging - ADX rises after a trend is already underway
- ADX alone gives no directional information (need DI+/DI- for that)
- Can remain high temporarily after a trend reverses
- Conservative threshold (25+) will miss some legitimate early-trend entries

**Best in:** confirming the presence of a trend before taking EMA or momentum signals. Excellent as a second-tier filter.
**Avoid when:** used as the sole signal without a directional component - ADX tells you a trend exists, not which way to trade it.

<python-figure src="strategy-adx-trend" caption="ADX trend strength rising through common thresholds (20/25/40). Direction comes from DI+, DI- (not shown)."></python-figure>

---

## Reversion strategies

Reversion strategies operate on the premise that prices which have moved "too far" from equilibrium will snap back. This is the flip side of trend-following - where trend strategies bet on persistence, reversion strategies bet on reversal.

The theoretical foundation is mean reversion - the statistical phenomenon where extreme values tend to be followed by more moderate values. In financial markets, this happens for both fundamental and behavioral reasons. Fundamentally, assets have intrinsic values; prices that deviate too far attract value buyers (in the oversold case) or sellers (in the overbought case). Behaviorally, overreaction is well-documented - fear causes overcorrection to the downside, greed to the upside, and rationality eventually asserts itself.

Mean reversion strategies tend to have higher win rates than trend strategies (60-70%+) but smaller average wins and larger average losses. Their payoff distribution is negatively skewed - many small profits, occasional large losses when a "reversion" becomes a new trend. This is the opposite of trend-following's positive skew. The primary risk is being wrong about which moves are temporary extremes versus the beginning of sustained new trends.

---

### RSI Reversion

**What it does**

The Relative Strength Index (RSI) was developed by J. Welles Wilder Jr. and published alongside ADX and ATR in his 1978 book. Like those indicators, it was designed for daily commodity charts. RSI measures the magnitude of recent gains relative to recent losses and compresses the result into a 0-100 scale.

The construction: for each of the past $n$ periods, classify each bar as an up-day (close > prior close) or down-day. Average the gains and average the losses, then compute:

$$RS = \frac{\text{Avg Gain over } n \text{ periods}}{\text{Avg Loss over } n \text{ periods}}$$

$$RSI = 100 - \frac{100}{1 + RS}$$

When all recent bars are gains, RS approaches infinity and RSI approaches 100. When all recent bars are losses, RS approaches zero and RSI approaches 0. Wilder suggested that RSI above 70 indicates the asset is overbought and RSI below 30 indicates it is oversold - levels where price is statistically stretched.

For reversion trading, these extremes are the entry signals: the strategy bets that an overbought RSI will revert downward and an oversold RSI will revert upward.

**When it goes long:** RSI < oversold threshold (price is statistically stretched downward)
**When it goes short:** RSI > overbought threshold (price is statistically stretched upward)

**Key parameters**

| Parameter    | Default | What it controls |
| ------------ | ------: | ---------------- |
| `rsi_period` |      14 | RSI lookback     |
| `overbought` |      70 | Sell threshold   |
| `oversold`   |      30 | Buy threshold    |

**Why it works**

RSI extremes represent a statistical imbalance in buying and selling pressure. When RSI hits 80, it means recent gains have been outsized compared to recent losses by a large margin. In a market without sustained directional trend, this imbalance is self-correcting: the buyers who drove the move eventually become sellers (taking profits), reducing buying pressure and allowing prices to settle.

Behaviorally, RSI extremes often correspond to periods of fear (oversold) and greed (overbought). At market extremes, the dominant emotion is usually wrong about the immediate future. Panic sellers at the bottom and euphoric buyers at the top both tend to be positioned in the direction of the recent move when the reversal occurs.

**Real-world example**

Gold in August 2018 reached an RSI below 25 on the daily chart - a reading so extreme it had only occurred twice in the prior decade. The collapse was driven by a strengthening U.S. dollar and rising real interest rates that pressured precious metals. While the fundamental backdrop was negative, the speed and magnitude of the decline created a short-term extreme. Gold bounced approximately 5% over the following two weeks before resuming its longer-term downtrend. A reversion trader who faded the RSI extreme with proper position sizing and a tight stop would have captured a clean short-term trade.

A less commonly cited but instructive example: individual large-cap equities frequently exhibit RSI extremes following sector-wide selloffs. During the March 2020 COVID crash, blue-chip names like Johnson & Johnson and Procter & Gamble briefly hit RSI levels below 20 - readings indicating panic selling in companies whose long-term fundamentals were essentially unimpaired. The subsequent 3-month recovery was one of the fastest in market history, validating the reversion thesis.

**How traders have used it to profit**

RSI reversion is most commonly applied as a swing-trading tool on daily charts for individual equities and ETFs. Market makers and quantitative funds use RSI thresholds as one component in a broader entry model for mean-reverting instruments - typically stable stocks with strong balance sheets, index ETFs, or range-bound currency pairs. The strategy is also widely used for short-term options strategies where a directional move on the underlying can be captured through puts or calls.

Wilder himself used RSI not just for the 70/30 levels but also for "failure swings" - where RSI reaches an extreme, pulls back, and then fails to make a new extreme on the next price push. This internal RSI divergence was his preferred signal for higher-confidence reversion trades.

**False signals and failure modes**

The most dangerous condition for RSI reversion is a sustained trend. In trending markets, RSI can remain above 70 or below 30 for extended periods - sometimes weeks or months - because the indicator is measuring the balance of gains vs losses, and in a strong trend, that balance is persistently skewed.

The 2014-2016 bear market in commodities is an instructive failure case. Agricultural commodities, metals, and energy products showed RSI levels below 30 repeatedly throughout this multi-year decline. Traders fading these "oversold" readings sustained losses as the trend continued well below any level that RSI had suggested was extreme. This is the classic "catching falling knives" problem - in a sustained trend, every extreme is just a resting point on the way to a new extreme.

**Pros**

- Simple and widely available in any charting platform
- High win rate in ranging, mean-reverting markets
- Quick, short-duration trades (typically resolved within 3-10 bars)
- Works well for timing entries within larger positional frameworks

**Cons**

- Fails catastrophically in trending markets
- No natural way to distinguish "extreme in a range" from "extreme at the start of a trend"
- Low average win relative to occasional catastrophic losses when trend continues
- Widely known indicator, which may reduce its edge in the most efficient markets

**Best in:** range-bound instruments, stable blue chips, index ETFs during low-volatility periods, and mean-reverting currency pairs.
**Avoid when:** the asset is in a confirmed trending regime (use ADX > 25 as a veto).

<python-figure src="strategy-rsi-reversion" caption="RSI(14) with typical overbought/oversold bands (70/30) used for reversion entries."></python-figure>

---

### Bollinger Reversion

**What it does**

Bollinger Bands were developed by John Bollinger in the early 1980s. Bollinger was a financial analyst and media commentator who was looking for a way to define high and low prices on a relative basis - not just "is this price high?" in absolute terms, but "is this price high relative to recent volatility?"

Bollinger Bands construct a channel around a moving average using standard deviations of price:

$$\text{Middle Band} = \text{SMA}_n$$
$$\text{Upper Band} = \text{SMA}_n + k \cdot \sigma_n$$
$$\text{Lower Band} = \text{SMA}_n - k \cdot \sigma_n$$

where $\sigma_n$ is the standard deviation of closes over the past $n$ periods and $k$ is typically 2.

The statistical interpretation: if price changes were normally distributed, approximately 95% of observations would fall within ±2 standard deviations of the mean. A close outside the bands means price is in the outer 5% of its recent distribution - an unusual event. The reversion strategy bets that this unusualness will correct.

**When it goes long:** price touches or crosses below the lower band
**When it goes short:** price touches or crosses above the upper band
**Target:** middle band (the moving average)

**Key parameters**

| Parameter   | Default | What it controls                 |
| ----------- | ------: | -------------------------------- |
| `bb_period` |      20 | Middle band lookback             |
| `bb_std`    |     2.0 | Band width (standard deviations) |

**Why it works**

Bollinger Bands work for reversion by identifying when price has moved unusually far from its recent equilibrium (the moving average) relative to its own recent variability. This is smarter than absolute levels: a $50 move is large for a $100 stock and tiny for a $5,000 instrument. By normalizing against standard deviation, Bollinger Bands automatically scale to each instrument's own volatility history.

The reversion to the middle band is the mechanism: when price is 2 standard deviations below its 20-period mean, there are natural mechanical reasons for reversion. Short sellers who entered at higher prices are covering; value buyers attracted by lower prices are entering; options market makers are delta-hedging.

**Real-world example**

Utility stocks provide a near-ideal Bollinger Reversion environment. Companies like Southern Company, Duke Energy, or NextEra Energy - characterized by stable regulated revenues, high dividends, and low growth volatility - trade in relatively tight ranges. Their prices oscillate between Bollinger Bands on weekly charts with notable regularity, driven by yield-seeking flows that respond to interest rate expectations. A systematic Bollinger Reversion strategy on a basket of regulated utility stocks backtests well over long periods, capturing the natural oscillation that reflects their bond-like characteristics.

The USDJPY currency pair also exhibits this behavior during low-volatility periods between major policy shifts. In 2019, USD/JPY traded in a roughly 5-point range for most of the year, touching the Bollinger Bands repeatedly and reverting reliably, as neither central bank was making major policy changes.

**How traders have used it to profit**

Bollinger Bands are among the most widely taught tools in technical analysis, and their reversion application is the most common. Systematic traders use Bollinger Bands as part of multi-factor models for identifying mean-reverting stocks, ETFs, or pairs. The bands are also used in options strategies - when price touches the lower band, implied volatility is often elevated (fear is high), making buying calls or bull put spreads more attractive.

John Bollinger himself emphasized that the bands should not be used mechanically in isolation. He distinguished between different types of band touches based on the shape of the band (expanding vs contracting) and the nature of the touch (clean, single-bar touch vs multi-bar close below the band). A single-bar spike below the lower band that reverses the same day is more reliable than a slow multi-bar grind below it, which may indicate the beginning of a new lower range.

**False signals and failure modes**

The most notorious failure mode for Bollinger Reversion is "band walking" - a phenomenon where price in a strong trend hugs the outer band for an extended period, triggering repeated reversion signals that all fail. In a strong uptrend, price can close above the upper band repeatedly for many consecutive days; in a strong downtrend, it closes below the lower band repeatedly.

During the COVID crash of February-March 2020, equity indices not only broke below their Bollinger Bands but remained below them for weeks. Each successive touch of the lower band looked like a reversion opportunity - and each successive close produced a new lower close. Traders fading the 2020 crash with Bollinger Reversion signals suffered significant losses as the "statistically extreme" became more extreme.

Bollinger himself designed the Squeeze (covered separately) to address a different failure mode: when the bands are narrow and the strategy generates small, directionless signals. Narrow bands mean low expected returns on reversion trades.

**Pros**

- Self-normalizing to volatility - works across very different instruments without parameter changes
- Clear, visible entry and exit levels (lower band = buy, upper band = sell, middle = target)
- Natural stop loss placement (just beyond the outer band)
- Can be combined with RSI to filter signals (e.g., RSI also oversold when lower band is touched)

**Cons**

- Band walking in trends produces sequences of losing reversion trades
- Standard deviation of price is not normally distributed - actual extremes are more frequent than the ±2σ = 5% implies
- 2-standard-deviation bands catch too many "normal" moves in some instruments; need widening
- The moving average target is often not reached in strong trends

**Best in:** stable, oscillating instruments - utility stocks, bonds in low-rate environments, range-bound currency pairs, commodity spreads.
**Avoid when:** the instrument is in a sustained directional trend.

<python-figure src="strategy-bollinger-reversion" caption="Price with Bollinger Bands (SMA20 ± 2σ). Touches at the bands are reversion candidates."></python-figure>

---

### VWAP Reversion

**What it does**

VWAP - Volume Weighted Average Price - is the average price an asset has traded at over a given period, weighted by volume at each price level. Unlike a simple price average, VWAP reflects where the _majority of dollars_ have been exchanged. This makes it the primary execution benchmark for institutional traders.

$$\text{VWAP} = \frac{\sum_{t} P_t \times V_t}{\sum_{t} V_t}$$

The strategy measures how far price has deviated from VWAP in standard deviation units (a z-score) and fades large deviations. The underlying thesis is that VWAP represents "fair value" in a volume-weighted sense, and large deviations from it attract counter-directional institutional flow as participants adjust toward VWAP benchmarks.

$$z_t = \frac{P_t - \text{VWAP}_t}{\sigma(\text{residuals from VWAP})}$$

This strategy uses a rolling VWAP window rather than a daily-reset VWAP, making it applicable to 24-hour markets and instruments without a defined daily open.

**When it goes long:** price is more than `z_threshold` standard deviations below VWAP
**When it goes short:** price is more than `z_threshold` standard deviations above VWAP

**Key parameters**

| Parameter     | Default | What it controls              |
| ------------- | ------: | ----------------------------- |
| `vwap_period` |      24 | Rolling window for VWAP       |
| `z_threshold` |     2.0 | Deviation required to trigger |

**Why it works**

VWAP is not just a technical indicator - it is an execution constraint for institutional participants. Many large funds measure their execution quality against VWAP; portfolio managers receive performance attribution relative to VWAP benchmarks. This creates a structural force: when price moves significantly above or below VWAP, institutional orders designed to buy (or sell) near VWAP naturally push price back. It is partly self-fulfilling due to the sheer volume of VWAP-benchmarked trading.

Intraday, VWAP also reflects the psychological anchor of "average price paid today." Participants who bought above VWAP are underwater and may reduce positions near VWAP; participants who sold below VWAP may cover near VWAP. These flows create gravity toward the anchor.

**Real-world example**

Equity futures markets provide the cleanest VWAP Reversion examples because of how consistently institutional flow uses VWAP as a benchmark. On August 24, 2015 - "Black Monday" in U.S. markets as China-driven fears triggered a flash crash - the S&P 500 E-mini futures dropped approximately 5% at the open, reaching z-scores well beyond 3 standard deviations from rolling VWAP. Within hours, price had rebounded more than halfway back. Algorithmic traders running VWAP reversion strategies captured a significant portion of that recovery, as the extreme deviation attracted institutional buy programs targeting their VWAP execution benchmarks.

In the Treasury bond market, VWAP reversion is used by fixed-income traders on 10-year notes futures, particularly around auction days when order flow is concentrated. Large post-auction deviations from VWAP tend to correct over subsequent hours as participants normalize positions.

**How traders have used it to profit**

VWAP reversion is primarily an intraday or short-term strategy because the anchoring effect is strongest within the session where most of the volume has transacted. Day traders in equities use VWAP reversion as a core entry framework - the rule "price stretched 2% below VWAP with RSI < 30, buy for a reversion to VWAP" is a specific, programmable version of this concept that has been used profitably in high-volume equity names.

Quantitative funds running market-neutral strategies use VWAP deviation to time entries in their long-short books - initiating long positions in stocks that have fallen significantly below VWAP and short positions in those that have risen far above it, betting on convergence to VWAP by end of day.

**False signals and failure modes**

VWAP reversion fails when the market is responding to genuine new information rather than transient imbalance. If a company announces a major earnings miss and the stock drops 15%, that is not a VWAP reversion opportunity - it is a permanent repricing. The stock's VWAP will shift downward to reflect the new reality, and buying the dip expecting a reversion to yesterday's VWAP is a fundamental error.

VWAP is also most reliable in high-liquidity instruments and sessions. In thinly traded instruments or off-hours sessions, VWAP can be easily distorted by small volume, making the z-score calculation unreliable. A 2-standard-deviation deviation in a futures market at 3 AM is not the same statistical event as the same deviation during the peak trading session.

**Pros**

- Anchored to actual transaction volume - not purely a price-based calculation
- Used as execution benchmark by institutions, creating structural reversion force
- Clear, intuitive interpretation (price is far from where most volume occurred)
- Combines naturally with time-of-day filters and session volume data

**Cons**

- Primarily useful intraday; rolling VWAP for multi-day periods loses its institutional relevance
- Fails on genuine news-driven repricing events
- Requires good volume data - cannot be computed from price alone
- Thin-market conditions make VWAP z-scores unreliable

**Best in:** liquid equity index futures, large-cap equities, and currency pairs during high-volume sessions.
**Avoid when:** trading around major news events where permanent repricing is possible.

<python-figure src="strategy-vwap-reversion" caption="Distance from rolling VWAP shown as a z-score; extreme deviations are faded."></python-figure>

---

### Z-Score Reversion

**What it does**

The z-score is one of the most fundamental statistical measures: it expresses a value as the number of standard deviations it is from its recent mean. For price:

$$z_t = \frac{P_t - \mu_n}{\sigma_n}$$

where $\mu_n$ is the rolling mean over the past $n$ periods and $\sigma_n$ is the rolling standard deviation. A z-score of +2 means price is 2 standard deviations above its recent average; -2 means 2 standard deviations below.

The reversion strategy is straightforward: enter long when the z-score is sufficiently negative (price far below recent average), enter short when sufficiently positive (price far above recent average), and exit when the z-score returns to near zero (price has reverted to its mean).

This strategy is the most "pure" statistical expression of mean reversion - it makes no assumptions about market microstructure, volume, or institutional behavior. It simply asks: given the asset's own recent history, is current price unusual?

**When it goes long:** z-score < `-z_entry`
**When it goes short:** z-score > `+z_entry`

**Key parameters**

| Parameter  | Default | What it controls                |
| ---------- | ------: | ------------------------------- |
| `lookback` |      20 | Mean/std window                 |
| `z_entry`  |     2.0 | How extreme a deviation must be |
| `z_exit`   |     0.5 | Normalization level to exit at  |

**Why it works**

The z-score strategy works when prices are generated by a stationary process - one where the mean and variance do not change systematically over time. Many financial instruments exhibit stationarity over short horizons: commodity prices oscillate around supply/demand equilibria, yield spreads oscillate around structural levels, and even equity prices in ranging markets oscillate around recent means.

When price makes an extreme move away from its mean (high absolute z-score), it often reflects either overreaction to news (emotional market behavior) or temporary supply/demand imbalance (a large seller or buyer that has temporarily exhausted). In either case, the force that pushed price away from equilibrium exhausts itself, and natural counter-pressure restores prices toward the mean.

**Real-world example**

Agricultural commodities provide some of the cleanest z-score reversion opportunities. In 2012, the worst U.S. drought in decades caused corn prices to spike from roughly $5.50/bushel to $8.50 - a massive +3 z-score deviation from the prior 20-week mean. While the drought was real and production was genuinely affected, the market overreacted. As the subsequent harvest and global supply adjustments normalized the balance, corn prices retraced back toward $4.50 over the following year. A z-score reversion trade entered at the peak - with appropriate stops - would have captured much of that return to mean.

Natural gas shows similar dynamics regularly due to weather-driven demand shocks. The 2021 Texas winter storm Uri pushed natural gas spot prices to extraordinary levels for a few days - z-scores in the dozens - before rapid reversion as supply adjusted. Short-dated z-score trades with tight risk management around that event were extremely profitable for participants prepared to fade the extreme.

**How traders have used it to profit**

Z-score reversion is the conceptual backbone of statistical arbitrage (stat arb) - one of the most profitable systematic trading approaches of the 1990s and 2000s. D.E. Shaw, Renaissance Technologies, and other quantitative funds built significant businesses around identifying pairs and portfolios of assets whose z-score spreads exhibited strong mean-reversion, then systematically fading deviations.

Commodity trading desks use z-score approaches to trade calendar spreads - the difference in price between different delivery months of the same commodity. These spreads have structural relationships (storage costs, seasonality) that create mean-reverting behavior when the spread moves to extremes.

**False signals and failure modes**

The fundamental assumption of z-score reversion - that the mean is stable - is violated by regime changes. When a structural shift occurs (a new technology makes an old one obsolete, a regulatory change transforms a market, a geopolitical event permanently alters supply), the mean itself shifts. Price that looks like an extreme z-score from one mean is actually the beginning of a new, lower (or higher) mean.

The 2014-2016 oil price collapse provides a sobering example. As U.S. shale production permanently changed the global supply/demand balance, any z-score reversion strategy anchored to the prior $90-100/barrel mean would have been buying into a falling knife. Oil was not reverting to $90 - it was establishing a new mean around $40-50. This is the fundamental risk of all mean-reversion strategies: distinguishing temporary extreme from new reality.

**Pros**

- Pure statistical expression of mean reversion - applicable to any time series
- No market microstructure assumptions - works on prices, spreads, ratios
- Clear entry and exit signals based on objective mathematical levels
- Naturally captures both overreaction events and supply/demand imbalances

**Cons**

- Assumes stationarity - completely breaks down when the mean shifts
- No mechanism to distinguish "extreme in current regime" from "new regime beginning"
- Short lookback windows make the mean very sensitive to recent moves, potentially understating extremes
- Long lookback windows make the mean sluggish, potentially missing shorter-cycle reversion opportunities

**Best in:** commodity spreads, yield spreads, stable oscillating instruments, and any market with structural mean-reversion (seasonal markets, regulated instruments).
**Avoid when:** the asset is undergoing a fundamental regime shift - structural changes in supply, technology, regulation.

<python-figure src="strategy-zscore-reversion" caption="Price expressed as a rolling z-score; entries are typically at extreme |z|."></python-figure>

---

## Momentum strategies

Momentum strategies occupy an interesting middle ground: they are directional like trend strategies, but they rely on shorter-term signals and often target the _continuation_ of a recent move rather than the multi-week trend. The core idea is that assets exhibiting strong recent performance tend to continue outperforming, and weak performers tend to continue underperforming - at least over the next few weeks to months.

This phenomenon - that recent returns predict near-future returns - was formally documented in academic research by Narasimhan Jegadeesh and Sheridan Titman in their landmark 1993 paper "Returns to Buying Winners and Selling Losers: Implications for Stock Market Efficiency." They found that U.S. stocks with the highest returns over the prior 3-12 months continued to outperform over the subsequent 3-12 months, and vice versa. This cross-sectional momentum effect has been replicated in virtually every major asset class and market globally. It is one of the most robust anomalies in finance.

Momentum strategies can fail violently during market crashes and sharp reversals (what researchers call "momentum crashes" - documented by Daniel and Moskowitz in 2016), so position sizing and regime awareness matter significantly more than in trend-following.

---

### RSI Momentum

**What it does**

RSI Momentum is the conceptual inverse of RSI Reversion. Where RSI Reversion fades extremes (selling overbought, buying oversold), RSI Momentum uses the same indicator to _confirm_ that a trend has real traction. The logic is simple: if RSI is above 60, buyers have been consistently more dominant than sellers for long enough to push RSI into positive territory - that is a momentum confirmation signal, not an overbought warning.

This reflects an important truth about RSI: the 70/30 overbought/oversold interpretation is only correct in ranging markets. In trending markets, RSI can sustain above 70 or below 30 for extended periods because the sustained dominance of buyers (or sellers) is exactly the point. RSI Momentum re-interprets the indicator as a trend quality gauge rather than a contrarian signal.

**When it goes long:** RSI > `upper_thresh` (sustained buying pressure confirmed)
**When it goes short:** RSI < `lower_thresh` (sustained selling pressure confirmed)

**Key parameters**

| Parameter      | Default | What it controls |
| -------------- | ------: | ---------------- |
| `rsi_period`   |      14 | RSI lookback     |
| `upper_thresh` |      60 | Long trigger     |
| `lower_thresh` |      40 | Short trigger    |

**Why it works**

When RSI crosses above 60, it means that over the prior 14 periods, gains have significantly outpaced losses. In a random market, this would revert quickly. In a trending market, the structural force driving the trend - fund flows, earnings revisions, macroeconomic tailwinds - keeps the balance tilted toward gains. RSI above 60 used as a momentum confirmation is the technical expression of "the trend is strong enough to have substance."

The use of 60/40 rather than the traditional 70/30 captures a wider range of legitimate momentum while still filtering pure noise. A market with RSI between 60 and 70 is exhibiting above-average but not extreme buying pressure - often the ideal entry zone for a trend.

**Real-world example**

NVIDIA Corporation (NVDA) through 2023 provides one of the clearest recent examples of sustained RSI momentum. Following the release of ChatGPT in late 2022 and the subsequent explosion in demand for AI-related GPU computing, NVIDIA's stock entered a multi-month period where RSI on the daily chart repeatedly touched and exceeded 70, with the weekly RSI sustaining above 60 for nearly all of the year. Trend-following funds running RSI momentum confirmation entered in early 2023 when RSI crossed 60 and held positions through a move from approximately $150 to over $500 - a 230%+ gain within the calendar year.

The key insight: a reversion trader would have been selling every time RSI approached 70. A momentum trader saw the same RSI reading as confirmation of a real trend and held. Same indicator, opposite conclusion, radically different outcomes.

**False signals and failure modes**

RSI momentum generates false starts in choppy, oscillating markets where brief bursts of buying briefly push RSI above 60 before the move exhausts and reverses. In a range-bound market, RSI oscillates from below 40 to above 60 and back, generating entry signals in both directions that cancel out.

Individual stocks around earnings announcements are particularly prone to RSI momentum false starts. A strong earnings print can push RSI to 70 in a single day; if the stock then gives back half the gain over the next week, the RSI momentum trade generates a small loss with no follow-through.

**Pros**

- Uses a simple, available indicator in a counterintuitive but statistically valid way
- Works well in combination with EMA or MACD signals as a second confirmation
- Clearly defined entry and exit levels
- Naturally adapts to instrument volatility (RSI is already a relative measure)

**Cons**

- False starts in oscillating markets produce many small losses
- No mechanism to distinguish sustained trend from brief spike
- Using RSI both as momentum (above 60 = buy) and reversion (above 70 = sell) requires clear rules about which mode is active
- Shorter-term than EMA/MACD-based trend strategies; exits can be triggered quickly

**Best in:** markets in confirmed uptrend or downtrend where RSI will sustain in the momentum zone.
**Avoid when:** the instrument is in a range where RSI oscillates without directional commitment.

<python-figure src="strategy-rsi-momentum" caption="RSI(14) with momentum thresholds (e.g. 60/40) used as trend confirmation."></python-figure>

---

### ROC Momentum

**What it does**

Rate of Change (ROC) is the simplest possible momentum measure: the percentage change in price over the past $n$ periods.

$$ROC_t = \frac{P_t - P_{t-n}}{P_{t-n}} \times 100$$

When ROC crosses a positive threshold, it means price has risen by at least that percentage over the lookback window - a momentum breakout. When ROC crosses a negative threshold, price has fallen meaningfully. This strategy trades in the direction of that recent momentum, betting it will continue.

ROC is also the basis of the momentum _factor_ in quantitative finance - specifically the 12-month ROC (often excluding the most recent month, denoted "12-1" momentum), which has been one of the most persistent return predictors in equity markets since Jegadeesh and Titman's 1993 paper.

**When it goes long:** ROC > `+roc_threshold` (significant upward momentum)
**When it goes short:** ROC < `-roc_threshold` (significant downward momentum)

**Key parameters**

| Parameter       | Default | What it controls            |
| --------------- | ------: | --------------------------- |
| `roc_period`    |      10 | Momentum lookback           |
| `roc_threshold` |     1.0 | Minimum % change to trigger |

**Why it works**

Cross-sectional momentum - buying recent winners and shorting recent losers - has one of the strongest and most replicated anomalies in finance. The behavioral explanation: investors underreact to earnings revisions and other news in the short run (causing momentum to persist), then overreact in the long run (causing eventual reversal). Institutional constraints amplify this: fund managers who buy recent winners are seen as prudent, while buying laggards is career risk. This herding behavior reinforces the momentum signal.

Time-series ROC momentum (betting that a given asset's own recent direction continues) works for similar reasons in trending markets: information about structural changes (macroeconomic shifts, competitive dynamics) is priced in gradually rather than instantaneously.

**Real-world example**

The academic literature on equity momentum is extensive and the returns are well-documented. In the real world, one vivid example is the semiconductor sector in 2023. In January 2023, the Philadelphia Semiconductor Index (SOX) had a 10-week ROC of approximately -5% - negative momentum. By April 2023, the AI demand narrative had crystallized and the 10-week ROC had crossed +20% - a strong momentum signal. Funds that entered on this positive ROC threshold and held through 2023 captured the sector's approximately 65% gain for the year.

A more dramatic example from a different asset class: gold in Q1 2016. After years of declining from its 2011 peak, gold's 10-week ROC turned sharply positive in January 2016 as the dollar began weakening and risk-off demand increased. The ROC signal correctly identified the start of gold's multi-year recovery phase from $1,050 to $1,350 by year-end.

**How traders have used it to profit**

The canonical application of ROC-based momentum is the cross-sectional stock selection model: each month, rank a universe of stocks by their 12-1 month ROC. Buy the top decile, short the bottom decile. This strategy has generated statistically significant alpha in U.S. equities continuously since the 1920s according to published academic research.

At the macro level, ROC momentum is used by Global Macro and CTA funds to take directional positions in currency, commodity, and fixed-income futures. A simple rule - go long any major commodity with a 3-month ROC above +10%, go short any with ROC below -10% - has historically captured a significant fraction of commodity market moves.

**False signals and failure modes**

ROC momentum's most dangerous failure is the "momentum crash." Documented by Kent Daniel and Tobias Moskowitz, momentum strategies periodically suffer catastrophic short-term drawdowns - typically at market bottoms when yesterday's losers (which the strategy is short) rebound explosively. The worst momentum crashes occur when: the prior period has been trending strongly (creating extreme long/short positioning), followed by a sharp market reversal. In March 2009, the bottom of the GFC, many momentum strategies suffered 30-50% drawdowns in a single month as heavily shorted beaten-down stocks recovered violently while recent winners sold off.

At the shorter timeframe used in this strategy, "chasing tops and bottoms" is the failure mode: entering a long position after a large move up, only to see the move exhaust and reverse. This is why a thoughtfully chosen threshold is important - too low a threshold generates too many small false starts.

**Pros**

- Backed by decades of academic research across asset classes
- Simple calculation, easy to implement and audit
- Applicable to cross-sectional selection (rank instruments by ROC) or time-series directional trading
- Works across multiple holding periods from weeks to months

**Cons**

- Momentum crashes can be severe and fast (30%+ in weeks)
- Chasing: entering after a large move often means entering near exhaustion
- Short lookbacks (10 bars) are noisy; longer lookbacks are more reliable but more lagging
- Requires rebalancing discipline - stale momentum signals held too long reverse to become contrary signals

**Best in:** clearly directional markets across all asset classes; especially powerful in equity cross-sectional selection.
**Avoid when:** entering after an already-large move in high-volatility regimes where reversals can be violent.

<python-figure src="strategy-roc-momentum" caption="ROC(10) crossing positive/negative thresholds as a simple momentum trigger."></python-figure>

---

### Stochastic Momentum

**What it does**

The Stochastic Oscillator was developed by George Lane in the 1950s and became one of the most widely taught technical indicators. Lane's innovation was measuring the position of the current close within its recent high-low range - not the absolute level of price, but where within the recent range price has settled.

$$\%K = \frac{C_t - L_n}{H_n - L_n} \times 100$$

where $C_t$ is the current close, $L_n$ is the lowest low over the past $n$ periods, and $H_n$ is the highest high. %K measures what percentage of the recent range the current price represents. A %K of 80 means price has closed at 80% of its recent high-low range - near the top. A %K of 20 means near the bottom.

%D is a moving average of %K, providing a smoothed signal line. Crossovers of %K above %D while in an extreme zone provide trading signals.

The momentum application: when %K crosses above %D while in the oversold zone (below 20), it suggests that selling pressure has exhausted and buyers are stepping back in. This is a momentum turn signal - not betting that price will return to the middle of the range (that would be reversion), but that the emerging buying pressure will carry price higher.

**When it goes long:** %K crosses above %D while in oversold zone
**When it goes short:** %K crosses below %D while in overbought zone

**Key parameters**

| Parameter    | Default | What it controls |
| ------------ | ------: | ---------------- |
| `k_period`   |      14 | %K lookback      |
| `d_period`   |       3 | %D smoothing     |
| `overbought` |      80 | Overbought zone  |
| `oversold`   |      20 | Oversold zone    |

**Why it works**

The Stochastic captures the intuition that sustained upward price momentum leaves prices near the top of their recent range - closes cluster toward the high end. Conversely, sustained selling pressure pushes closes toward the low end. When %K turns up from a low extreme (below 20) and crosses above its signal line (%D), it suggests the supply/demand balance that was pushing price down has shifted. Sellers who were aggressive are now less active; buyers who were absent are stepping in.

Lane himself emphasized that the Stochastic should be used for timing entries, not for generating primary signals. The strategy works best when a longer-term trend bias already exists and the Stochastic crossover is used to time pullback entries within that trend.

**Real-world example**

EUR/GBP between 2019 and early 2020 provides a good Stochastic case study. The pair traded in a relatively stable range as Brexit uncertainty created oscillating sentiment. Stochastic crossovers from oversold in the daily chart were reliably followed by short-term upward moves back toward the range midpoint, and crossovers from overbought were followed by pullbacks. The range-bound, high-uncertainty environment created ideal conditions for momentum turns within the oscillation.

A more dramatic example: in August 2015, following the China-driven flash crash that saw many equity indices drop 10%+ in days, Stochastic readings on daily S&P 500 charts fell to near zero - prices were closing at the absolute bottom of their recent ranges. The %K/%D crossover from those extreme lows correctly identified the exhaustion of selling pressure and preceded a sharp multi-week recovery.

**False signals and failure modes**

Stochastic crossovers fail in straight-line trends. In a strong uptrend, %K stays in overbought territory and never meaningfully crosses below %D - crossovers, when they occur, are brief and followed by continued upward pressure. A Stochastic sell signal in a strong uptrend (cross below %D in overbought zone) routinely fails as price continues higher.

The indicator also generates whipsaws when %K and %D are close together - minor crossovers occur frequently and often mean nothing directionally. This is particularly problematic when the oscillator is in the middle zone (40-60) rather than at an extreme.

**Pros**

- Excellent for timing entries within existing trends (pullback entries)
- Signals at extreme zones have higher reliability than mid-range crossovers
- Widely available and well-understood; easy to implement
- The %K/%D framework clearly separates the raw signal from the smoothed confirmation

**Cons**

- Generates poor signals in sustained one-directional trends
- Many crossovers in the middle zone are noise
- Slower response than RSI to sharp moves (multiple periods of smoothing create lag)
- Easy to misapply without understanding which mode the market is in (trend vs range)

**Best in:** oscillating markets where price respects a defined range; also for pullback timing within established trends.
**Avoid when:** the instrument is in a straight-line trend where %K will simply stay at one extreme.

<python-figure src="strategy-stochastic-momentum" caption="Stochastic %K and %D with 80/20 zones; crossovers in extremes are common signals."></python-figure>

---

### Dual Momentum

**What it does**

Dual Momentum is a systematic approach formalized by Gary Antonacci in his 2014 book _Dual Momentum Investing_. The "dual" refers to combining two distinct types of momentum:

**Relative momentum** (cross-sectional): Which asset has performed better recently? If asset A has outperformed asset B, favor A over B. This is the Jegadeesh-Titman momentum that selects winners over losers.

**Absolute momentum** (time-series): Has the asset gone up in absolute terms over the lookback period? If the asset's own return is negative - even if it's the "best" among a bad group - then hold cash or a defensive asset rather than the "least bad" option.

This combination is powerful: relative momentum tells you _which_ asset to own; absolute momentum tells you whether you should own _any_ of them. The absolute momentum filter is a risk management tool that moves to safety during broad market downturns.

This implementation uses a simplified version: both a short-period and long-period ROC must agree (both positive for long, both negative for short) and must have just come into alignment.

**When it goes long:** short ROC > 0 and long ROC > 0 and they just came into agreement
**When it goes short:** short ROC < 0 and long ROC < 0 and they just came into agreement

**Key parameters**

| Parameter      | Default | What it controls      |
| -------------- | ------: | --------------------- |
| `short_period` |       5 | Fast momentum horizon |
| `long_period`  |      20 | Slow momentum horizon |

**Why it works**

Requiring agreement across two timeframes filters out many false starts. A 5-period positive ROC is common and often noisy. A 20-period positive ROC is more meaningful - it represents a sustained upward move. When both agree, the momentum signal has confirmation across multiple horizons. This dual-timeframe approach reduces the signal frequency but substantially improves signal quality.

At a deeper level, multi-horizon momentum persistence is rooted in how information flows through markets. Short-term momentum reflects immediate market reaction; longer-term momentum reflects the gradual repricing as more participants update their views. When both timeframes are aligned, it suggests the move is being driven by forces that have had time to be recognized and responded to by a broad set of participants.

**Real-world example**

Antonacci's work demonstrates that his Dual Momentum Global Equity Momentum (GEM) strategy - rotating between U.S. equities, international equities, and bonds based on dual momentum - would have avoided most of the 2000-2002 dot-com bear market and the 2008-2009 financial crisis by rotating to bonds when absolute momentum turned negative. Specifically, the long-period 12-month ROC on U.S. equities turned negative in mid-2000 and in mid-2008, providing clear exit signals before the worst of both crashes materialized.

The strategy would have returned roughly 17.4% annually from 1974-2013 in Antonacci's backtests (compared to roughly 12.5% for buy-and-hold S&P 500), with dramatically smaller drawdowns - approximately 17% maximum drawdown versus 50%+ for buy-and-hold. The combination of absolute momentum as a crash filter and relative momentum as an asset selector produced these results.

**False signals and failure modes**

Dual Momentum is by design a slow, low-frequency strategy. It generates relatively few signals - typically monthly adjustments. The main failure mode is being "late" during sharp recoveries: after a crash followed by a rapid recovery (like March 2020), absolute momentum may stay negative for months after the actual bottom, keeping the strategy in defensive assets while the recovery rallies strongly.

In choppy, oscillating markets, both ROC measures can alternate between positive and negative at roughly the same frequency, generating whipsaws each time they briefly align before diverging again. Because signals require cross-timeframe agreement, the strategy has particularly poor performance in "noisy but directionless" markets.

**Pros**

- Combines two statistically robust phenomena (relative and absolute momentum) into one framework
- Absolute momentum acts as a crash filter, dramatically improving drawdown profile
- Low frequency (monthly signals) reduces transaction costs and decision fatigue
- Backed by substantial academic research and decades of out-of-sample performance

**Cons**

- Very late to enter recovering markets after sharp drawdowns
- Few signals per year - requires patience and discipline during quiet periods
- Whipsaws during oscillating markets as the two ROC measures alternate alignment
- Implementation requires multi-asset portfolio; less applicable to single-instrument trading

**Best in:** long-horizon asset allocation across multiple instruments or asset classes; monthly rebalancing frameworks.
**Avoid when:** applied to short-term trading of a single instrument - the strategy was designed for portfolio-level asset rotation.

<python-figure src="strategy-dual-momentum" caption="Two ROC horizons (short vs long). Agreement across timeframes filters noise."></python-figure>

---

## Volatility breakout strategies

Breakout strategies look for price escaping a recent range, typically after a period of compression. The thesis is that low volatility is not the natural state of markets - it is a temporary condition where buyers and sellers are in approximate balance. That balance eventually breaks, and when it does, the resulting move often has directional follow-through.

Volatility has a well-documented tendency to cluster: low-volatility periods tend to be followed by more low-volatility, and high-volatility periods are followed by more high-volatility - until a regime shift occurs. Breakout strategies try to identify that regime shift at its earliest stage and position for the resulting directional move.

---

### ATR Breakout

**What it does**

ATR Breakout defines a "recent range" using the highest high and lowest low over a lookback window, then adds an ATR-based buffer to that range to filter out false breakouts. A move beyond the range plus the buffer is treated as a "real" breakout - one large enough that it is unlikely to be simple noise.

The key insight is the ATR buffer: a breakout above the recent high by $0.01 in a market with $50 daily ATR is meaningless. A breakout above the high by $75 (1.5× ATR) is more meaningful - it represents a move significantly beyond what normal daily variation would produce. The ATR scaling makes the definition of "significant" automatic across different instruments and volatility environments.

**When it goes long:** close > recent high + (ATR × `breakout_mult`)
**When it goes short:** close < recent low - (ATR × `breakout_mult`)

**Key parameters**

| Parameter       | Default | What it controls                |
| --------------- | ------: | ------------------------------- |
| `atr_period`    |      14 | ATR lookback                    |
| `breakout_mult` |     1.5 | How "real" the breakout must be |
| `lookback`      |      20 | Recent range window             |

**Why it works**

When price is consolidating within a range, both buyers and sellers are establishing positions at roughly equivalent levels. Stop-loss orders accumulate just below the range low (from longs who bought within the range) and just above the range high (from shorts). When price breaks above the range, those accumulated short stops trigger - forced buying - which accelerates the breakout move. This mechanical dynamic, combined with fresh momentum buyers entering on the signal, creates follow-through.

The ATR buffer requirement filters out the "false breakouts" where price briefly pokes through the range on thin volume and then retreats. A move large enough to exceed ATR × multiplier beyond the range is more likely to represent genuine order flow rather than random noise.

**Real-world example**

Gold's breakout in June 2019 is a textbook ATR breakout case. From 2013 to 2019, gold had been trapped in a roughly $1,050-$1,380 range. In June 2019, driven by growing expectations of Federal Reserve rate cuts and rising geopolitical uncertainty, gold broke above $1,380 with enough force to exceed 1.5× ATR above the range high in a single week. This signaled the end of a multi-year consolidation. Gold subsequently rallied to $2,075 by August 2020 - over 50% from the breakout level. An ATR breakout strategy entering on the June 2019 signal would have captured a substantial portion of that move.

Another example: the British pound (GBP/USD) in the weeks following the June 2016 Brexit referendum. The pound fell sharply on the surprise leave vote, breaking below its multi-week range by multiples of ATR in a single day. That break was followed by years of sustained pound weakness as Brexit uncertainty unfolded.

**How traders have used it to profit**

ATR breakout is a cornerstone of commodity trading. Agricultural, energy, and metals futures frequently consolidate for extended periods as markets wait for new supply/demand information (crop reports, OPEC decisions, inventory data). When that information arrives and the range breaks, the resulting move often lasts weeks or months. CTA funds systematically apply ATR breakout logic across commodity futures as part of diversified trend-following programs.

In equity markets, ATR breakout is used for individual stock selection following periods of post-earnings consolidation. A stock that consolidates for 3-4 weeks after earnings and then breaks above the post-earnings high by 1.5× ATR is often beginning the next leg of a move.

**False signals and failure modes**

False breakouts - where price briefly exceeds the range and then retreats - are the defining weakness of breakout strategies. Markets "test" breakout levels, triggering stops and momentum buyers, and then reverse back into the range. These "stop hunts" are particularly common in currency and futures markets where sophisticated participants know exactly where stop orders accumulate.

The ATR buffer helps but does not eliminate this problem. In high-volatility, choppy markets, ATR itself is elevated, making the buffer larger but also making genuine breakouts harder to distinguish from large swings within a wide range.

**Pros**

- Captures the directional move following volatility compression
- ATR buffer is self-adjusting to market volatility
- Works across all asset classes and timeframes
- Natural with trend-following: breakout is the entry, trailing stop is the exit

**Cons**

- False breakouts are a persistent problem; "stop hunts" target obvious range boundaries
- In high-volatility environments, ATR is elevated and the buffer still doesn't filter all false breaks
- Requires patience - consolidations can be very long (weeks to months)
- Entry is typically after a significant initial move; perfect entries are impossible

**Best in:** post-consolidation markets across all asset classes, especially commodities and currency pairs around major economic events.
**Avoid when:** volatility is already high and the market is in a wide, choppy range (breakouts fail frequently in this environment).

<python-figure src="strategy-atr-breakout" caption="Price with breakout triggers built from a range plus an ATR multiple."></python-figure>

---

### Donchian Breakout

**What it does**

Donchian Channels were developed by Richard Donchian in the 1950s. Donchian was a pioneer of systematic commodity trading and one of the first to demonstrate that mechanical trading rules could be applied profitably. His channel breakout system is perhaps the simplest possible trend-following entry: if today's close is the highest it has been in the past N days, go long; if it is the lowest, go short.

$$\text{Long signal: } C_t > \max(H_{t-1}, H_{t-2}, \ldots, H_{t-n})$$
$$\text{Short signal: } C_t < \min(L_{t-1}, L_{t-2}, \ldots, L_{t-n})$$

A new N-day high means price has broken out of its recent range to the upside - all sellers who established positions in the past N days are now at a loss, and all buyers are profitable. A new N-day low means the opposite.

**When it goes long:** close is a new N-bar high
**When it goes short:** close is a new N-bar low

**Key parameters**

| Parameter         | Default | What it controls                             |
| ----------------- | ------: | -------------------------------------------- |
| `breakout_period` |      20 | Channel window (classic systems also use 55) |

**Why it works**

A new N-day high represents genuine price discovery - the market has moved to a level where no transaction has occurred in the past N days. The buyers now control the market at this level; the sellers who held throughout the consolidation have either exited or are sitting on losses. This configuration is bullish: motivated sellers have been removed, and price is in "blue sky" territory above recent resistance.

The mechanism also involves stop cascades: short sellers who placed stops above the recent high are forced to cover when the breakout occurs, adding buying pressure. This self-reinforcing dynamic is why breakouts, when genuine, tend to accelerate rather than slow immediately after the break.

**Real-world example**

The Turtle Traders are the most famous application of Donchian breakout systems. In 1983, legendary trader Richard Dennis made a bet with his partner William Eckhardt about whether trading skill could be taught. Dennis believed it could; Eckhardt was skeptical. Dennis recruited 23 "Turtles" - mostly inexperienced traders - and taught them a specific set of trading rules based largely on 20-day and 55-day Donchian breakouts across a diversified basket of commodity and financial futures.

The Turtles were instructed to buy a new 20-day or 55-day high and sell a new 20-day or 55-day low, using ATR-based position sizing and trailing stops. From 1983 to 1988, the Turtles reportedly generated over $150 million in profits, with some individual traders producing annualized returns exceeding 100% in their best years. Michael Covel documented their story in detail in the 2004 book _Turtle Trading_.

Specific Turtle trades included the 1987 soybean rally, long positions in U.S. Treasury bonds as interest rates fell through 1985-1986, and short positions in the U.S. dollar during its 1985-1987 decline. All were captured using simple Donchian breakout entries on the 55-day channel.

**How traders have used it to profit**

Donchian breakouts are the foundation of the managed futures industry. Trend-following CTAs collectively managing hundreds of billions of dollars apply this or similar breakout rules across diversified futures portfolios. Research by academics including Lasse Pedersen and Tobias Moskowitz has shown that time-series momentum strategies based on channel breakouts have delivered positive returns across every major asset class and every decade back to the earliest available data.

The 55-day period is particularly associated with long-term trend capture - a 55-day high represents a price not seen in nearly three months, which in most instruments signals a significant trend change rather than routine oscillation.

**False signals and failure modes**

Donchian breakouts fail during range-bound markets. Every time price touches the top of its range, it generates a 20-day high and a buy signal; it then retreats, generating a 20-day low and a sell signal. Each trade loses a small amount. In a wide range, this churning produces steady drawdowns that test a trader's patience without any payoff.

Between 2013 and 2019, gold oscillated within a large range and generated repeated Donchian breakout signals in both directions that largely failed. A systematic trader following only the 20-day breakout on gold would have had a frustrating 6-year period before the 2019 breakout that finally delivered.

**Pros**

- Probably the simplest possible systematic trend-following rule
- Backed by the longest and most robust performance history of any trading approach
- 55-day variant captures meaningful, multi-month trends
- Works across all futures markets and most liquid instruments

**Cons**

- Very low win rate (often 30-40%) - painful psychologically without strong discipline
- Long periods of losses in range-bound markets before a trend develops
- Simple implementation means the strategy is well-known; some edges may be reduced in efficient markets
- Requires diversification across many markets to smooth the return stream

**Best in:** diversified portfolio of commodity, currency, and financial futures across all market conditions - the strategy is designed to run continuously, losing small amounts frequently and winning large amounts occasionally.
**Avoid when:** applied to a single instrument in isolation - the edge is in diversification.

<python-figure src="strategy-donchian-breakout" caption="Price vs Donchian channel high/low; closes beyond prior extremes are breakouts."></python-figure>

---

### Bollinger Squeeze

**What it does**

The Bollinger Squeeze identifies periods when Bollinger Bands are unusually narrow - indicating that volatility has compressed to historically low levels. This "coiled spring" configuration often precedes a significant directional move, because low volatility cannot persist indefinitely. The strategy waits for this compression and then trades the first directional break when volatility expands.

The squeeze is identified by comparing the current Bollinger Band width (upper band minus lower band) to its own historical distribution. When band width falls into the bottom quantile of its recent history (e.g., below the 20th percentile), the market is in a squeeze. The trade is taken when price breaks above the upper band (squeeze resolved to the upside) or below the lower band (squeeze resolved to the downside).

A related version, popularized by trader John Carter, uses Keltner Channels (ATR-based rather than standard deviation-based bands) as an outer reference: when Bollinger Bands are inside Keltner Channels, the market is in a squeeze. This "TTM Squeeze" is widely used in equities day trading.

**When it goes long:** after squeeze, price breaks above upper band
**When it goes short:** after squeeze, price breaks below lower band

**Key parameters**

| Parameter          | Default | What it controls                       |
| ------------------ | ------: | -------------------------------------- |
| `bb_period`        |      20 | Bollinger period                       |
| `bb_std`           |     2.0 | Band width                             |
| `squeeze_lookback` |      50 | History window for "narrowness"        |
| `squeeze_quantile` |     0.2 | "Bottom x% of widths count as squeeze" |

**Why it works**

Volatility follows a mean-reverting process. Periods of low volatility are statistically predictable to be followed by periods of higher volatility - the only question is the direction. Before major economic announcements, ahead of scheduled events (FOMC meetings, earnings, expiration dates), and during lulls between macro themes, volatility compresses. When the catalyst arrives, the stored energy releases directionally.

Bollinger Band width is a clean, objective measure of this compression because it directly captures the standard deviation of prices over the relevant window. A quantile comparison ensures that "squeeze" is defined relative to the instrument's own volatility history rather than against an arbitrary absolute level.

**Real-world example**

The USD/JPY pair in 2012 provides a striking Bollinger Squeeze example. After years of extremely low volatility (driven by Japan's stable but stagnant policy environment), USD/JPY's Bollinger Bands compressed to historically narrow widths on the weekly chart during mid-2012. When Shinzo Abe was elected in December 2012 on a platform of aggressive monetary easing (Abenomics), USD/JPY broke above the Bollinger upper band decisively. The pair went from approximately 78 to 105 over the following 18 months - a 35% move from the squeeze breakout.

Another notable example: the VIX itself occasionally enters squeeze conditions before major volatility events. In early 2017, the VIX compressed to the low single digits - historically unprecedented - before the 2018 Volmageddon event. Traders who positioned for a volatility expansion from the squeeze (by buying VIX calls or variance swaps) were well-positioned when the expansion finally arrived.

**False signals and failure modes**

The Bollinger Squeeze has two main failure modes. First, the squeeze can persist much longer than expected - "coiled springs" don't always release on a predictable timeline. Waiting for the breakout can require weeks of patience while holding no position, and the breakout, when it comes, may not be cleanly directional.

Second, the initial breakout direction can be wrong. Price may break above the upper band and then immediately fall back through - a "fake-out" - before the real move begins in the opposite direction. These head-fakes are common around ambiguous economic events where the immediate interpretation reverses as more information becomes available.

**Pros**

- Identifies high-probability setup: low volatility before expansion
- Works well around scheduled catalysts (earnings, central bank announcements, economic data)
- Combines well with directional indicators to filter the direction of the breakout
- Rare signals mean each one receives careful attention

**Cons**

- Squeezes can persist for very long periods - patience required
- First break direction can be a false start
- Signals are infrequent; opportunity cost of waiting is real
- Performance is highly event-dependent - requires something to cause the resolution

**Best in:** instruments with clear volatility cycles; around scheduled economic events; markets with identifiable catalysts.
**Avoid when:** there is no obvious catalyst to resolve the compression - a squeeze without a catalyst can simply persist indefinitely.

<python-figure src="strategy-bollinger-squeeze" caption="Bollinger band width (normalized). Low width indicates a squeeze regime."></python-figure>

---

### Opening Range Breakout

**What it does**

The Opening Range Breakout (ORB) strategy defines the trading range of the first $n$ hours of a session, then trades any break of that range later in the day. The premise is that the opening range reflects the initial battle between buyers and sellers as they process overnight news and pre-market positioning. Once that range is established and then broken, a directional flow often develops for the remainder of the session.

Trader and author Toby Crabel documented the ORB concept extensively in his 1990 book _Day Trading with Short Term Price Patterns and Opening Range Breakout_, providing quantitative evidence that opening range breaks in commodity and financial futures had statistically significant follow-through.

The opening range high and low are recorded during the initial `range_hours` of the UTC session. For the remainder of the day, any close above the opening high triggers a long; any close below the opening low triggers a short.

**When it goes long:** price breaks above opening range high
**When it goes short:** price breaks below opening range low

**Key parameters**

| Parameter     | Default | What it controls                      |
| ------------- | ------: | ------------------------------------- |
| `range_hours` |       2 | How much of the day defines the range |

**Why it works**

The opening of a trading session concentrates order flow. Market-on-open orders, overnight position adjustments, and institutional programs all execute near the open, creating the initial range. Once this initial activity subsides and a range is defined, subsequent breaks of that range represent fresh directional commitment - new orders arriving with a directional view beyond the opening adjustment activity.

For equity futures and currency markets, the mechanics are reinforced by institutional flows: algorithmic execution programs that haven't finished their daily allocation will push price in one direction throughout the day. When price breaks above the opening high, it often means one of these programs is net buying; the trend tends to continue as the program works its allocation.

**Real-world example**

The London open for FX markets - approximately 7-8 AM GMT - is the single best-studied ORB window in any market. Academic research has documented that EUR/USD, GBP/USD, and other major pairs exhibit statistically significant directional follow-through when price breaks the London opening range. This is driven by the concentration of European institutional order flow - major banks, pension funds, and hedge funds that operate on London time beginning their activity simultaneously, often with correlated directional views based on the same overnight news.

In equity markets, Crabel's research found that S&P 500 futures showed statistically significant follow-through after opening range breaks on daily charts. Specifically, days with narrow opening ranges (relative to recent ATR) showed stronger follow-through when they did break, because the compression-then-breakout dynamic amplifies directional commitment.

**How traders have used it to profit**

Day traders in equity index futures (S&P 500 E-mini, DAX) systematically trade ORB by waiting for the first 30-60 minutes to define the range, then entering on any clear break with a stop just inside the range. The strategy requires no overnight position and is purely mechanical, making it popular with systematic day traders who want defined risk and a clear daily workflow.

In FX markets, Asian session traders often trade ORB during the London open, betting that the shift in institutional participation will drive a directional move. The Asia session defines one range; the London open creates the breakout.

**False signals and failure modes**

ORB is notably less reliable in low-volume sessions (weekends, holidays, overnight sessions in less-liquid instruments) where the opening range is formed by thin, unrepresentative flow. On low-volume days, breakouts are frequently reversed as the broader market participant base arrives and disagrees with the thin-volume "range."

The strategy also fails when the day is genuinely directionless - the market breaks above the range briefly and then falls back, then breaks below and retreats. These "inside days" following the break produce small losses in both directions.

**Pros**

- Clear, time-bounded framework with defined entry, stop, and target
- No overnight position risk
- Well-researched across equity futures and currency markets
- Works during sessions with genuine institutional order flow

**Cons**

- Requires active monitoring (or precise algorithmic implementation) during specific session windows
- Less reliable outside primary trading sessions (thin volume)
- Two-sided false breakouts can produce losses in both directions in one day
- Quality of signal varies significantly with overall market volume and news flow

**Best in:** liquid futures and currency markets during primary institutional trading sessions; London open for FX, regular equity futures hours.
**Avoid when:** trading thin sessions, illiquid instruments, or days with no clear catalyst.

<python-figure src="strategy-opening-range-breakout" caption="Price with a per-session opening-range high/low; later breaks can follow through."></python-figure>

---

## Volume strategies

Volume strategies use trading activity - how many units changed hands and when - to validate, predict, or explain price moves. The core premise is that price changes accompanied by high volume are more reliable than price changes on thin volume. Volume is "the fuel" of price moves; high-volume moves tend to persist, low-volume moves tend to reverse.

Modern market microstructure research has also produced more granular volume-based signals: not just how much volume traded, but _who_ was the aggressor (buyer or seller) and whether order flow was balanced or one-sided.

---

### OBV Divergence

**What it does**

On-Balance Volume (OBV) was developed by Joe Granville and published in his 1963 book _Granville's New Key to Stock Market Profits_. Granville's core thesis was that volume precedes price - accumulation (buying) or distribution (selling) by sophisticated investors shows up in volume patterns before it shows up in price. OBV operationalizes this idea: add volume on up-days, subtract volume on down-days.

$$\text{OBV}_t = \text{OBV}_{t-1} + \begin{cases} V_t & \text{if } C_t > C_{t-1} \\ -V_t & \text{if } C_t < C_{t-1} \\ 0 & \text{if } C_t = C_{t-1} \end{cases}$$

OBV accumulates over time into a running total. The absolute level is meaningless; the trend and divergence relative to price is what matters.

OBV Divergence trades when OBV and price are moving in opposite directions: if price is declining but OBV is rising (hidden accumulation), go long; if price is rising but OBV is falling (hidden distribution), go short. This divergence suggests that the dominant volume flow disagrees with current price direction.

**When it goes long:** price trend down but OBV trend up (accumulation divergence)
**When it goes short:** price trend up but OBV trend down (distribution divergence)

**Key parameters**

| Parameter      | Default | What it controls                        |
| -------------- | ------: | --------------------------------------- |
| `trend_period` |      20 | Window used to measure price/OBV trends |

**Why it works**

Granville's insight was about information asymmetry. Sophisticated participants (institutional investors, corporate insiders in pre-Regulation FD times, well-researched funds) have views about value that are not yet reflected in price. They buy on weakness (accumulation) to minimize market impact, pushing volume higher on down-days. This hidden buying shows up in OBV before it shows up in price.

The divergence signal is an estimate of who is in control of volume flow. When large participants are net buyers despite falling price, price is falling because of retail panic or thin selling, not because sophisticated money is agreeing. The subsequent return of price to OBV's implied direction is the trade.

**Real-world example**

The 2009 stock market bottom provides a classic OBV divergence case study. From November 2008 through the March 2009 low in the S&P 500, price was making new lows. But OBV on many large-cap stocks and on the S&P 500 futures was turning upward. This represented institutional accumulation - large buyers absorbing selling pressure without moving price higher yet, because selling supply was still heavy. The OBV divergence provided advance notice of the eventual March 2009 low and the subsequent recovery.

Richard Wyckoff - whose work predated Granville - described this dynamic as the "accumulation phase": a period where smart money absorbs supply at low prices before the markup phase begins. OBV divergence is essentially a quantitative approximation of Wyckoff's accumulation identification.

**How traders have used it to profit**

Volume divergence analysis is used by technical analysts across all asset classes but is most reliable in equity markets where volume data is cleanest and most meaningful. Mutual fund managers and algorithmic traders have used OBV-based signals as a secondary filter in stock selection models - preferring stocks with positive OBV trends even when price has been flat or slightly declining, as this suggests accumulation without yet-visible price impact.

**False signals and failure modes**

OBV divergence can persist for very long periods without price confirming the signal. "Accumulation" according to OBV might represent several months of patient buying before price eventually moves - and during that waiting period, a down-trending price might continue falling, creating losses on any long position taken on the divergence signal.

Additionally, OBV treats all up-day volume as bullish and all down-day volume as bearish, regardless of the magnitude of the price move or where within the day's range the close fell. A stock that opens sharply lower, attracts heavy buying, and closes up slightly from the open will have OBV add all that volume to the tally - even though most of that volume was initially bearish. More sophisticated volume indicators (like Volume-Weighted Flow or the Chaikin Money Flow) address this by weighting volume by where within the range the close occurred.

**Pros**

- Identifies hidden accumulation/distribution before price confirms
- One of the most intuitive volume indicators conceptually
- Long documented history in equity markets
- Works on any instrument with meaningful volume data

**Cons**

- Divergences can persist for extended periods (patience required)
- Binary up/down classification of volume is imprecise
- Requires quality volume data - unreliable on thin or manipulated instruments
- No natural stop level - "OBV says accumulate" doesn't tell you where you're wrong

**Best in:** equities and futures markets where volume data is reliable and institutional participation is meaningful.
**Avoid when:** in markets with poor volume data, 24-hour instruments with volume concentrated in specific sessions, or thinly traded securities.

<python-figure src="strategy-obv-divergence" caption="OBV visualized as a z-score; divergences vs price can hint at hidden accumulation/distribution."></python-figure>

---

### VWAP Cross

**What it does**

While VWAP Reversion fades extreme deviations from VWAP, VWAP Cross trades the directional signal when price crosses VWAP itself. When price moves from below VWAP to above it (or vice versa), it represents a potential shift in the balance of institutional sentiment - participants who were net sellers relative to their VWAP benchmark are now net buyers, or vice versa.

This is the simpler of the two VWAP-based strategies: long when price crosses above rolling VWAP, short when price crosses below.

**When it goes long:** price crosses above rolling VWAP
**When it goes short:** price crosses below rolling VWAP

**Key parameters**

| Parameter     | Default | What it controls    |
| ------------- | ------: | ------------------- |
| `vwap_period` |      24 | Rolling VWAP window |

**Why it works**

VWAP is the institutional execution benchmark, and a significant portion of order flow is explicitly VWAP-benchmarked. When price is above VWAP, buyers who are behind their benchmark are more aggressive (trying to catch up to VWAP by buying less now, since price is already above). Sellers who are ahead of their benchmark may be more willing to sell. This creates a natural weight on price pulling back toward VWAP.

When price breaks above VWAP with conviction, it means buyers are aggressively willing to pay above the average, suggesting strong directional demand. The cross from below to above can signal the beginning of sustained institutional buying pressure.

**Real-world example**

S&P 500 E-mini futures are perhaps the most VWAP-driven market in the world. Large program trading desks at investment banks execute tens of billions of dollars daily on VWAP benchmarks. When the market breaks above rolling VWAP in the afternoon with volume confirmation, it often signals the beginning of an end-of-day buying program from underallocated institutional participants, generating systematic follow-through.

Equity index ETFs like SPY show similar behavior. Studies of intraday flow patterns have documented that VWAP crossovers in the S&P 500 during regular trading hours predict next-hour price direction with statistical significance - not due to any magic in the indicator, but because of how much order flow explicitly references VWAP as a benchmark.

**False signals and failure modes**

In balanced, directionless markets, price chops above and below VWAP repeatedly - generating frequent false crossover signals in both directions. This is the primary weakness: VWAP is the midpoint of the distribution by definition, so in a true equilibrium market, price will oscillate around it constantly.

VWAP is also less meaningful in low-volume periods (overnight sessions, thin markets, holiday trading) where the VWAP calculation is based on few and potentially unrepresentative transactions. An overnight VWAP crossover in a thinly traded futures market tells you very little about the next directional move.

**Pros**

- Grounded in institutional market mechanics - not purely a chart pattern
- Works well during high-volume institutional sessions
- Simple, clear signal
- Combines naturally with volume confirmation filters

**Cons**

- Excessive signals in balanced, choppy markets
- Requires high-quality volume data
- Less meaningful outside primary institutional trading hours
- Susceptible to volume-lacking false breaks

**Best in:** highly liquid instruments during institutional trading hours; equity index futures and major currency pairs.
**Avoid when:** trading during thin-volume sessions or around instruments without meaningful institutional flow.

<python-figure src="strategy-vwap-cross" caption="Price vs rolling VWAP; crossovers are treated as directional shifts."></python-figure>

---

### Trade Flow Imbalance

**What it does**

Trade Flow Imbalance goes beyond simple volume to look at the _direction_ of aggressive order flow. In any market, there are makers (who provide limit orders and wait) and takers (who use market orders and pay the spread to transact immediately). Takers are more "aggressive" - they are willing to pay a price to transact now rather than wait.

When takers are predominantly buyers (high "buy ratio"), it suggests one-sided aggressive demand. When takers are predominantly sellers (low buy ratio), it suggests aggressive supply. This strategy computes the z-score of the buy-to-total-volume ratio and trades extreme imbalances.

$$\text{Buy Ratio}_t = \frac{\text{Taker Buy Volume}_t}{\text{Total Volume}_t}$$
$$z_t = \frac{\text{Buy Ratio}_t - \mu_n}{\sigma_n}$$

A high z-score (extreme buy imbalance) suggests directional buying pressure that may persist. A low z-score (extreme sell imbalance) suggests sustained selling pressure.

**When it goes long:** buy ratio z-score > `+z_threshold`
**When it goes short:** buy ratio z-score < `-z_threshold`

**Key parameters**

| Parameter          | Default | What it controls             |
| ------------------ | ------: | ---------------------------- |
| `imbalance_period` |      10 | Rolling window for buy ratio |
| `z_lookback`       |      50 | Baseline window for z-score  |
| `z_threshold`      |     1.5 | How extreme flow must be     |

**Why it works**

Aggressive order flow (market orders) reveals conviction. When an institution wants to buy, and wants to buy immediately, it uses market orders. The willingness to "pay up" for immediacy signals that the opportunity cost of waiting (missing the move) exceeds the cost of the spread. Sustained aggressive one-sided flow often precedes price moves in the direction of that flow.

This is the order-flow trading approach used extensively in electronic market making and high-frequency trading. Firms like Citadel Securities and Virtu analyze order flow imbalance in real time across millions of instruments as part of their execution and positioning models.

**Real-world example**

The "Flash Boys" context provides an instructive backdrop. Michael Lewis's 2014 book described how high-frequency trading firms at the time used order flow information - specifically the timing and direction of aggressive orders arriving at different exchanges - to detect and trade around large institutional order flow. The trade flow imbalance signal is essentially a retail/systematic approximation of the information these firms were using in real time: when buy flow significantly dominates sell flow, prices tend to move up.

On a more conventional example: around major equity index rebalancing events (S&P 500 quarterly rebalances, Russell reconstitutions), stocks being added to an index see extreme buy flow imbalance as index funds are forced buyers. Detecting this imbalance before the rebalancing price is completed allows positioning for continued one-sided pressure.

**False signals and failure modes**

Flow data quality is the primary constraint. The buy/sell classification of trades ("who was the aggressor?") requires either detailed exchange data or inference from price movement relative to bid/ask. Misclassification (the "Lee-Ready" algorithm's edge cases) can generate spurious imbalance readings.

Even with perfect data, extreme flow imbalance can represent the tail end of a large institutional order rather than the beginning. When the order is complete, the imbalance stops - and price may not continue moving without the pressure.

**Pros**

- One of the most informative signals available - reveals conviction, not just direction
- Works at very short timeframes where price-based signals have not yet formed
- Grounded in market microstructure theory
- Early warning system that can precede price-based confirmations

**Cons**

- Requires high-quality taker/maker volume data - unavailable for many instruments
- Venue-dependent: flow on one exchange may not represent aggregate market flow
- Short-lived signals - extreme flow imbalance resolves quickly
- Data infrastructure requirements are significant

**Best in:** highly liquid markets with accessible taker/maker volume data; equity and futures markets with good trade-level data.
**Avoid when:** data quality is uncertain or the instrument lacks sufficient liquidity for meaningful flow signals.

<python-figure src="strategy-tradeflow-imbalance" caption="Taker buy ratio expressed as a z-score; extreme one-sided flow is the trigger."></python-figure>

---

## Statistical strategies

Statistical strategies apply mathematical models beyond simple moving averages to extract signals from price data. They range from adaptive filtering (Kalman) to fractal analysis (Hurst) to linear regression and statistical arbitrage. The common thread is an explicit statistical model of price behavior, with trading signals derived from that model's outputs.

---

### Kalman Moving Average

**What it does**

The Kalman filter is a recursive Bayesian estimation algorithm developed by Rudolf Kálmán in 1960 for tracking the position of spacecraft. It solves the problem of estimating the "true" state of a system from noisy observations by combining predictions from a model with corrections from new data, weighting each by their respective uncertainties.

Applied to prices: at each step, the filter predicts the next price based on the current estimated "true" price. When the actual price arrives, the filter updates its estimate, weighting the correction by how much it trusts the new observation relative to its model. This makes it an adaptive moving average - during volatile periods (where observations are "noisy"), it trusts its model more and updates slowly; during quieter periods, it trusts observations more and updates quickly.

State update:
$$\hat{x}_{t|t} = \hat{x}_{t|t-1} + K_t(y_t - \hat{x}_{t|t-1})$$

where $K_t$ is the Kalman gain (how much to weight the new observation), $\hat{x}_{t|t-1}$ is the prior estimate, and $y_t$ is the observed price.

The trading rule is simple: when price crosses above the Kalman estimate, go long; when it crosses below, go short.

**When it goes long:** price crosses above Kalman estimate
**When it goes short:** price crosses below Kalman estimate

**Key parameters**

| Parameter           | Default | What it controls                            |
| ------------------- | ------: | ------------------------------------------- |
| `process_noise`     |    1e-5 | Adaptation speed (higher = faster, noisier) |
| `measurement_noise` |    1e-2 | Trust in observations (higher = smoother)   |

**Why it works**

Unlike a fixed-period EMA, the Kalman filter's effective smoothing adapts to current conditions. In trending, low-noise markets, it tracks price closely (low Kalman gain). In noisy, volatile markets, it smooths more aggressively (high Kalman gain), reducing whipsaws. This automatic regime-adaptation is theoretically superior to fixed moving averages in markets that switch between low and high volatility.

The filter also has an optimal statistical interpretation: given the assumed state-space model (price follows a random walk with known noise characteristics), the Kalman filter produces the minimum variance unbiased estimate of the true price. This mathematical optimality makes it appealing in quantitative contexts.

**Real-world example**

Renaissance Technologies - the most successful quantitative fund in history - is widely believed to use sophisticated signal processing and statistical filtering methods derived from physics and engineering. While their specific methods are proprietary, the Kalman filter's application to financial signals was pioneered in academic quantitative finance in the late 1980s and early 1990s by researchers who went on to found quantitative funds. The idea of using spacecraft tracking algorithms for stock prices is less surprising when you consider that both problems involve estimating a true state from noisy observations over time.

In a more directly observable application, Kalman filters are used in statistical arbitrage to dynamically estimate the hedge ratio between two cointegrated assets. Instead of using a fixed ratio from a regression, the Kalman filter allows the hedge ratio to adapt slowly over time as the relationship between the two assets evolves.

**False signals and failure modes**

The Kalman filter's performance is highly sensitive to the assumed noise parameters (`process_noise` and `measurement_noise`). If `measurement_noise` is set too high, the filter becomes very slow and laggy, missing trends. If `process_noise` is too high, the filter adapts too quickly and whipsaws. The "correct" parameters require careful calibration and may need periodic re-estimation as market conditions change.

The model also assumes a specific structure (random walk) that may not match the actual data-generating process. In markets with mean-reverting behavior, the random walk assumption may cause the filter to track price too closely in the wrong direction.

**Pros**

- Mathematically optimal estimator given the underlying assumptions
- Automatically adapts smoothing to volatility conditions
- Richer state representation than simple moving averages (includes uncertainty estimates)
- Applicable to many problems beyond just price tracking (hedge ratio estimation, factor model filtering)

**Cons**

- Highly parameter-sensitive; calibration is non-trivial
- Assumes specific statistical model (random walk) that may not hold
- More complex to implement correctly than simple averages
- Benefits over well-tuned EMAs are often modest in practice

**Best in:** sophisticated systems where adaptive filtering provides measurable improvement over fixed-parameter alternatives; statistical arbitrage hedge ratio estimation.
**Avoid when:** you need a simple, transparent signal that is easy to audit and explain.

<python-figure src="strategy-kalman-ma" caption="Price with an adaptive (Kalman-like) moving average that speeds up in higher volatility."></python-figure>

---

### Hurst Regime

**What it does**

The Hurst exponent is a statistical measure of long-range dependence in a time series, developed by British hydrologist Harold Edwin Hurst in 1951 while studying the flow of the Nile River. Hurst was trying to understand whether river flooding was random or exhibited long-range memory - periods of drought tended to cluster together, as did flood years. He developed the rescaled range (R/S) analysis to quantify this.

For financial time series, the Hurst exponent $H$ characterizes return behavior:

- $H > 0.5$: **Trending (persistent)** - if returns have been positive, they are more likely to continue positive. The further from 0.5, the stronger the trend persistence.
- $H = 0.5$: **Random walk** - future returns are independent of past returns. No exploitable structure.
- $H < 0.5$: **Mean-reverting (anti-persistent)** - price moves are likely to reverse. The further below 0.5, the stronger the reversion tendency.

The strategy uses rolling Hurst estimation to classify the current regime and applies trend-following logic when $H > 0.6$ and reversion logic when $H < 0.4$.

**When it goes long:** trending regime ($H > 0.6$) + rising price, or reversion regime ($H < 0.4$) + oversold
**When it goes short:** trending regime ($H > 0.6$) + falling price, or reversion regime ($H < 0.4$) + overbought

**Key parameters**

| Parameter             | Default | What it controls                              |
| --------------------- | ------: | --------------------------------------------- |
| `hurst_period`        |     100 | Window for Hurst estimation (needs many bars) |
| `trending_threshold`  |     0.6 | Trending cutoff                               |
| `reversion_threshold` |     0.4 | Mean-reversion cutoff                         |

**Why it works**

The Hurst exponent attempts to solve the fundamental problem of strategy selection: which type of strategy is appropriate for the current market? Rather than using a regime filter based on price behavior alone (like ADX or volatility percentile), the Hurst exponent directly quantifies the statistical structure of return series - the degree to which returns exhibit memory.

Academic research on FX markets has documented that currency pairs exhibit time-varying Hurst exponents - trending at some horizons and frequencies, mean-reverting at others. The same is true of commodity markets. If an estimate of the current Hurst regime is reliable, deploying trend strategies when $H > 0.6$ and reversion strategies when $H < 0.4$ is logically sound.

**Real-world example**

The Nile River data that Hurst originally studied shows $H \approx 0.73$ - strong long-memory behavior consistent with persistent drought/flood cycles. Financial markets typically show Hurst exponents close to 0.5 in efficient markets, with deviations appearing at specific timeframes and in less-efficient instruments.

Research published by Peters (1994) in "Fractal Market Analysis" and by Lo (1991) in his modified R/S analysis found evidence of long-range dependence in U.S. equity markets at the monthly level, suggesting $H$ modestly above 0.5. Currency markets have shown more significant deviations: studies of GBP/USD, EUR/USD, and emerging market currencies have found $H$ ranging from 0.45 to 0.65 at different periods, consistent with regime shifts between mean-reversion and trending behavior.

**False signals and failure modes**

The Hurst exponent requires a large sample for reliable estimation - typically 100+ observations minimum, with 200+ providing more stable estimates. This creates a fundamental lag problem: a regime shift (from trending to mean-reverting) will take many periods to show up in the Hurst estimate, long after the optimal time to have switched strategies.

The computation is also sensitive to the estimation method used. Different R/S methods, detrended fluctuation analysis (DFA), and wavelet-based estimators can produce materially different Hurst values from the same data. Consistency in methodology is essential.

**Pros**

- Directly estimates the statistical property (long-range dependence) that determines which strategy type is appropriate
- Academically grounded - built on decades of research in stochastic processes
- Applicable to any time series, not just financial instruments
- Provides quantitative regime classification rather than qualitative judgment

**Cons**

- Requires large samples for reliable estimation - significant lag
- Many estimation methods; results vary by methodology
- Regime transitions are slow to detect; you are always somewhat behind
- Between the clear thresholds (0.4-0.6), regime classification is ambiguous

**Best in:** long-horizon systematic systems where regime classification improves multi-strategy portfolio management.
**Avoid when:** operating at short timeframes where insufficient data makes Hurst estimation unreliable.

<python-figure src="strategy-hurst-regime" caption="Rolling Hurst exponent with example thresholds for trending (>0.6) vs mean-reverting (<0.4)."></python-figure>

---

### Regression Channel

**What it does**

The Regression Channel fits a linear regression line to recent closing prices and builds a channel using the standard deviation of residuals (the distance of each price from the regression line). The channel represents the "normal" oscillation around the trend line. Extreme deviations above the upper channel or below the lower channel are treated as reversion opportunities.

$$\hat{P}_t = a + b \cdot t \quad \text{(regression line)}$$
$$\text{Upper Channel} = \hat{P}_t + k \cdot \sigma_\text{residuals}$$
$$\text{Lower Channel} = \hat{P}_t - k \cdot \sigma_\text{residuals}$$

The key conceptual difference from Bollinger Bands: Bollinger Bands measure deviation from a flat (or slowly moving) average, while the Regression Channel measures deviation from a trend. This makes the Regression Channel appropriate for instruments that are trending but experiencing normal "noise" around that trend - a pullback within a trend versus a trend reversal.

**When it goes long:** price falls below lower channel band (below-trend deviation)
**When it goes short:** price rises above upper channel band (above-trend deviation)

**Key parameters**

| Parameter           | Default | What it controls         |
| ------------------- | ------: | ------------------------ |
| `regression_period` |      50 | Regression fit window    |
| `channel_std`       |     2.0 | Channel width (std devs) |

**Why it works**

In trending markets, price moves in a direction over time but not in a straight line. There is natural oscillation around the trend line as buyers and sellers interact, news is digested, and profit-taking occurs. The regression channel captures this structure: the trend line is the primary direction, and the bands define the expected oscillation. When price reaches the channel boundary, it is likely exhibiting a temporary excessive deviation from its trend trajectory, which tends to correct back.

This differs from a pure reversion strategy: you are not betting that price will revert to a flat mean, but that it will revert to its trend line - which is itself moving in a direction. The risk management implication is important: a position opened at the lower channel should be exited when the trend reverses, not just when price returns to the center.

**Real-world example**

The S&P 500's long-term regression channel is perhaps the most analyzed regression channel in equity markets. Fit to the index's price from 1950 to the present, the regression line represents the average rate of nominal price appreciation. Deviations above 2 standard deviations from this trend line occurred at the peak of the dot-com bubble (2000), at the 2007 peak, and again during 2021-2022. Each extreme deviation was followed by a reversion toward the long-term regression line. Conversely, prices fell significantly below the regression channel during the 1974 bear market, the 2009 GFC trough, and briefly in March 2020 - each providing long-term entry opportunities.

At shorter timeframes, individual stocks in identified uptrends frequently oscillate around their regression channels in ways that provide consistent short-term entry opportunities. A stock trending at 30% annually will have pullbacks that take it temporarily to the lower channel; these are often the optimal entry points for position builders.

**False signals and failure modes**

Regression Channel reversion fails when the trend itself ends. If you fit a regression to a 50-day uptrend and price breaks below the lower channel not as a temporary deviation but as the beginning of a trend reversal, the "reversion" trade means buying into a new downtrend. The regression line is a backward-looking fit - it does not predict the future trend.

The choice of lookback period also significantly affects the channel. A 50-day regression might fit a steep recent uptrend, generating aggressive channel lines that quickly become stale if the trend's slope changes. A 200-day regression will be more stable but will lag trend changes significantly.

**Pros**

- Adapts to trending markets where flat-average reversion strategies fail
- The trend line itself provides directional context for the trade
- Clear, mathematically defined entry and exit levels
- Works at multiple timeframes from intraday to multi-year

**Cons**

- Completely fails when the underlying trend reverses
- Lookback period choice is non-trivial and significantly affects results
- Regression slope is backward-looking; cannot predict future trend direction
- In strongly trending markets, channel touches near the extremes may not revert before new extremes are made

**Best in:** instruments in established trends with regular, oscillating pullbacks - trending equities, commodity uptrends, secular bond market moves.
**Avoid when:** the underlying trend is uncertain or the instrument is near a potential trend reversal.

<python-figure src="strategy-regression-channel" caption="Regression midline with ±2σ channel bands; excursions can be faded within a trend."></python-figure>

---

### Pairs Spread Mean Reversion

**What it does**

Pairs trading is a market-neutral statistical arbitrage strategy that trades the spread between two correlated assets. Rather than betting on the direction of either asset individually, the strategy bets on the _relationship_ between them: when they diverge from their historical relationship, it enters a trade betting they will converge. The strategy is long the underperforming asset and short the outperforming one simultaneously, making it broadly hedged against market-wide moves.

The spread is typically modeled as the log price ratio:

$$\text{Spread}_t = \ln\left(\frac{P_{\text{primary},t}}{P_{\text{secondary},t}}\right)$$

This is converted to a z-score relative to its rolling mean and standard deviation. Extreme z-scores indicate unusual divergence between the two assets that is expected to revert.

The statistical foundation is cointegration (developed by Engle and Granger, 1987): two price series are cointegrated if a linear combination of them is stationary. This means the spread has a tendency to revert to a long-run mean, even if each individual series follows a random walk. Pairs selected for cointegration have a mathematical property that makes the reversion strategy theoretically sound.

**When it goes long the spread:** primary is cheap relative to secondary (z-score < `-z_entry`): buy primary, sell secondary
**When it goes short the spread:** primary is expensive relative to secondary (z-score > `+z_entry`): sell primary, buy secondary

**Key parameters**

| Parameter  | Default | What it controls                |
| ---------- | ------: | ------------------------------- |
| `lookback` |      50 | Window defining "normal" spread |
| `z_entry`  |     2.0 | Divergence required to enter    |

**Why it works**

Cointegrated pairs share a structural economic relationship. The classic textbook example is Royal Dutch Shell: Shell's shares traded simultaneously in Amsterdam (Shell Transport and Trading) and London (Royal Dutch Petroleum) as a merged company where investors in each location were entitled to specified cash flows from the same underlying enterprise. No structural reason should cause these to diverge substantially in the long run, yet they regularly traded at spreads of 3-8% from their "correct" ratio as investors in different markets applied different valuations, were subject to different liquidity conditions, and held different views.

Froot, Dabora, and Frankel (1999) documented this phenomenon in detail, showing that the relative prices of Royal Dutch and Shell Transport were mean-reverting around their theoretical parity ratio. Academic pairs traders could systematically profit from the divergences by buying the relatively cheap share and selling the relatively expensive one, with near-certainty of convergence.

More broadly, pairs in the same industry (Coca-Cola vs Pepsi, Visa vs Mastercard, BP vs Shell) share common macroeconomic exposures while their relative valuation fluctuates around a mean driven by relative fundamental performance. The market-neutral property is particularly valuable: the strategy profits regardless of whether the overall market is going up or down.

**How traders have used it to profit**

Quantitative hedge funds have deployed statistical arbitrage at enormous scale. Firms like D.E. Shaw (founded 1988), Morgan Stanley's MSFP team, and later Two Sigma and Citadel built massive infrastructure around identifying and trading hundreds or thousands of cointegrated pairs simultaneously. The strategy's market-neutral characteristic makes it particularly attractive during volatile or bear markets when directional strategies struggle.

Equity pairs trading based on industry peer relationships was highly profitable in the late 1990s before widespread adoption crowded the trade. Interest rate pairs (on-the-run vs off-the-run Treasuries) was a staple of fixed-income relative-value funds. Energy pairs (crude oil vs refined products spreads, WTI vs Brent) remain active today.

**False signals and failure modes**

Long-Term Capital Management (LTCM) represents the most cautionary tale in pairs trading history. LTCM was a hedge fund run by Nobel laureates and former Salomon Brothers traders that employed massive leverage in fixed-income relative-value trades - including pairs trades between on-the-run and off-the-run Treasury bonds, and between sovereign bonds of different European nations.

Their trades were statistically impeccable: the spreads had reverted reliably for decades and the cointegration seemed robust. What they didn't adequately account for was that in a crisis, correlations break down and spreads that "must" revert can first widen to catastrophic extremes. When Russia defaulted on its debt in August 1998, a global flight to quality caused every risk spread LTCM held to widen simultaneously. They lost $4.6 billion in a matter of weeks; the Federal Reserve had to orchestrate a bailout. Their leverage (approximately 25:1 at the end) turned a spread move of a few percent into total ruin.

The lesson: cointegration is a statistical property estimated from historical data. It assumes no structural break in the relationship. When structural breaks occur - regulatory changes, mergers, competitive disruptions, defaults - the spread can diverge permanently rather than revert.

**Pros**

- Market-neutral structure hedges against broad market moves
- Grounded in cointegration theory - statistically rigorous selection criteria
- High win rate when pairs relationship is stable
- Provides diversifying returns in bear markets and periods of equity volatility

**Cons**

- Relationship breakdown (structural change) produces catastrophic losses
- Requires simultaneous management of two positions - operational complexity
- Spread can widen significantly before converting (requires adequate leverage management)
- Best pairs require careful selection and ongoing cointegration testing; stale pairs can become relationship-broken pairs

**Best in:** structurally linked pairs in stable regulatory and competitive environments; liquid instruments with continuous pricing.
**Avoid when:** there is any reason to suspect a structural change in the relationship between the two assets.

<python-figure src="strategy-pairs-spread-meanreversion" caption="Pairs spread shown as a rolling z-score; entries are typically at large |z|."></python-figure>

---

## Funding strategies

Funding strategies exploit the economics of **perpetual futures** - a type of derivative contract that never expires, used extensively in digital asset markets. To keep the perpetual contract's price anchored to the underlying spot price, an automatic payment mechanism called the **funding rate** is applied every 8 hours: if the perpetual trades above spot, longs pay shorts (negative for longs, positive for shorts); if it trades below spot, shorts pay longs.

The funding rate is therefore a real-time indicator of market positioning. Extreme positive funding means longs are overwhelmingly dominant and are paying significantly to maintain their positions. Extreme negative funding means shorts dominate. Both extremes represent crowded positions that are eventually vulnerable to reversal.

While funding rates are specific to perpetual futures, the underlying concepts generalize. In traditional futures markets, the analogous concept is the **basis** (futures price vs spot price) and **contango vs backwardation**. In currency markets, the equivalent is the interest rate differential that drives the carry trade. Wherever you can identify asymmetric positioning and its cost, funding-style strategies apply.

---

### Funding Rate Fade

**What it does**

When funding is extremely positive, longs are so dominant that they are paying a significant ongoing cost to stay long. This crowded positioning is a contrarian signal - the market has become lopsided, most participants are on one side, and a relatively small change in sentiment can trigger forced position reduction. The strategy fades the crowd: short when funding is extremely positive (too many longs), long when funding is extremely negative (too many shorts).

**When it goes long:** funding < `-funding_threshold` (shorts crowded, vulnerable to squeeze)
**When it goes short:** funding > `+funding_threshold` (longs crowded, vulnerable to selloff)

**Key parameters**

| Parameter           | Default | What it controls                          |
| ------------------- | ------: | ----------------------------------------- |
| `funding_threshold` |   0.001 | How extreme funding must be (0.1% per 8h) |

**Why it works**

Crowded trades are vulnerable trades. When everyone is already long (positive funding extreme), there are few new buyers available to push price higher. The incremental buyer is gone. Meanwhile, each participant holding a long is paying an ongoing cost - if price doesn't move favorably, they eventually close the position, adding selling pressure. The imbalance corrects when enough longs are forced or choose to exit.

This is the same logic as contrarian sentiment indicators in traditional markets. When CFTC Commitments of Traders reports show extreme net positioning by speculators in a futures market, contrarian traders fade that positioning. The sentiment poll equivalent: when 90%+ of individual investors are bullish, markets tend to disappoint.

**Real-world example**

The concept translates directly to traditional futures basis. In equity futures, the futures basis (the premium of futures over spot, adjusted for carry) swells during periods of excessive speculative demand for leveraged long exposure. At the peak of the 1999-2000 dot-com bubble, equity index futures traded at elevated premiums to fair value as speculative demand overwhelmed supply. Traders who faded the extreme basis by shorting futures and buying underlying (or vice versa at other extremes) captured the subsequent normalization.

In commodity markets, extreme contango (futures much higher than spot) in oil markets in early 2020 - when COVID demand destruction was tanking spot prices while futures reflected expected future recovery - represented an equivalent extreme positioning signal.

**False signals and failure modes**

The most dangerous failure mode is "crowded trades that keep working." In a genuine bull market, longs can remain dominant and continue paying high funding for weeks while price continues to rise. The trend is so strong that the incremental buyer never runs dry; new participants keep entering. Fading in this environment means selling into strength and getting run over.

The carry cost of being wrong is also significant: if you short when funding is extreme positive and price keeps rising, you are paying both the directional loss and the short-side carry (since you receive negative funding as a short in positive funding environments, or pay it in some implementations).

**Pros**

- Contrarian approach with a structural economic rationale (crowded positions)
- Funding rate is a real-time, objective measure of market imbalance
- Most effective at genuine market turning points when it works
- Natural alignment with volatility - extreme funding often coincides with volatility extremes

**Cons**

- Crowds can stay crowded longer than the trade can remain solvent
- Requires accurate, timely funding rate data
- Works best at genuine extremes; moderate funding levels provide weaker signals
- Fading strong trends is psychologically difficult and can produce sustained losses

**Best in:** genuine market extremes where positioning has become clearly excessive; tops and bottoms.
**Avoid when:** the market is in a strong trend - sustained positive funding in an uptrend is not necessarily extreme.

<python-figure src="strategy-funding-rate-fade" caption="Funding rate with symmetric thresholds; extremes are faded as crowded positioning."></python-figure>

---

### Funding Momentum

**What it does**

Rather than fading extreme funding, this strategy follows it. The premise: consistently positive funding over multiple consecutive settlement periods means longs are persistently dominant - not briefly crowded, but sustainably positioned. This persistent positioning tends to coincide with genuinely strong trends where the fundamentals support the directional move.

The distinction from Funding Rate Fade is the persistence filter: one period of extreme funding could be a spike. Multiple consecutive periods of above-threshold funding in the same direction suggest a structural positioning trend, not a temporary crowding that will quickly correct.

**When it goes long:** funding consistently positive and rising across consecutive settlement periods
**When it goes short:** funding consistently negative and falling across consecutive settlement periods

**Key parameters**

| Parameter           | Default | What it controls                         |
| ------------------- | ------: | ---------------------------------------- |
| `funding_period`    |       3 | Consecutive funding events required      |
| `min_funding_level` |  0.0001 | Minimum magnitude to treat as meaningful |

**Why it works**

Persistent positive carry in the direction of a trade is a feature, not a bug. In traditional finance, the carry trade (borrowing low-yield currencies to buy high-yield ones) is one of the most profitable systematic strategies precisely because carry reflects genuine interest rate differentials that attract capital flows. Persistent inflow creates trend.

When funding remains positive over multiple periods, it means bulls are repeatedly willing to pay to maintain their positions. This willingness reflects a conviction that the trend will continue to generate profits that exceed the carry cost. As long as that conviction is correct, price will continue in the bullish direction.

**Real-world example**

The Japanese yen carry trade from 2005-2007 illustrates funding momentum at its best. The Bank of Japan maintained near-zero interest rates while central banks in Australia (5%+), New Zealand (7%+), and other economies had substantial rates. Borrowing yen and investing in higher-yielding currencies provided persistent positive carry. The carry trade attracted enormous capital inflows, creating sustained trends in AUD/JPY, NZD/JPY, and other yen crosses. For most of 2005-2007, the carry was positive and persistent - a funding momentum signal - and price followed the carry, appreciating steadily.

The carry trade ultimately collapsed violently in 2007-2008 as risk appetite evaporated and yen crosses reversed 20-30% in weeks. This serves as a reminder that funding momentum, like trend strategies, can suffer violent reversals when the supporting trend ends.

**False signals and failure modes**

Reversals from persistent carry conditions can be violent because carry-motivated positioning tends to be large and correlated. When carry reverses, the exit is crowded. The "carry crash" in 2008 saw currencies that had appreciated for years against the yen reverse dramatically within months as global risk sentiment shifted.

Additionally, funding persistence can be mechanical rather than meaningful in some periods - particularly during one-sided market conditions where market structure forces one-sided funding without reflecting genuine participant conviction.

**Pros**

- Aligns with genuine trend-following logic: follow the money
- Persistent carry reduces the odds of a false signal versus a single extreme reading
- Works well in interest-rate-driven FX carry environments as well as perpetual futures
- Natural filter: requires multiple consecutive confirmations before signaling

**Cons**

- Violent reversals when carry conditions end
- Correlated with trend strategies - doesn't provide independent diversification when both fail simultaneously
- Lag: requires multiple periods of confirmation, potentially missing the early part of the move
- Funding can persist for the wrong reasons (market structure, thin liquidity) rather than fundamental ones

**Best in:** sustained trend environments where positioning builds gradually; FX carry trade analogues.
**Avoid when:** markets are at extreme historical levels where reversal risk is elevated despite persistent carry.

<python-figure src="strategy-funding-momentum" caption="Funding drifting persistently positive/negative; momentum strategies follow that persistence."></python-figure>

---

### Carry With Trend

**What it does**

Carry With Trend is the most selective of the funding strategies: it only trades when both the price trend and the funding direction agree that you are being paid to hold the position. Going long is only acceptable when the trend is upward _and_ funding is negative (meaning you receive payment as a long). Going short is only acceptable when the trend is downward _and_ funding is positive (meaning you receive payment as a short).

This double filter eliminates a significant source of risk: you never fight the trend, and you only take positions where the carry is in your favor. You are essentially being paid to be right about a trade that you were already going to take.

**When it goes long:** trend up (price above EMA) and funding < `-funding_threshold` (longs are paid)
**When it goes short:** trend down (price below EMA) and funding > `+funding_threshold` (shorts are paid)

**Key parameters**

| Parameter           | Default | What it controls          |
| ------------------- | ------: | ------------------------- |
| `trend_period`      |      50 | EMA lookback for trend    |
| `funding_threshold` |  0.0001 | Minimum funding magnitude |

**Why it works**

The combination of trend and carry is one of the most studied multi-factor combinations in systematic trading. Academic research (Asness, Moskowitz, Pedersen - "Value and Momentum Everywhere," 2013) has documented that combining momentum (trend) with value (which carry approximates in some contexts) produces superior risk-adjusted returns because the two factors are somewhat negatively correlated: when momentum is working (trending markets), carry may be neutral; when carry is working (stable yield-seeking periods), momentum may be quieter.

When both align simultaneously, the expected return is higher because two independent forces are pointing in the same direction, and the probability that either alone would be a false signal is reduced.

**Real-world example**

The Australian dollar (AUD/JPY) between 2012 and 2014 provides a good Carry With Trend example. AUD offered 4-5% interest rates while JPY offered near-zero rates. The carry differential made longs in AUD/JPY both trend-aligned (the pair was rising due to Abenomics-driven yen weakness and carry inflows) and carry-positive (you were paid to be long). The combined signal was clear: a trend that also paid you to hold it. This kind of alignment is relatively rare and represents the highest-conviction setups in this framework.

**False signals and failure modes**

Funding can be noisy and directionally inconsistent in some market structures. If funding oscillates between positive and negative within each 8-hour window, the alignment threshold may never be met, leaving the strategy with very few signals.

Trend can also lag at turning points: price may turn sharply while the EMA still shows the prior trend, meaning the strategy holds a position in a direction that is losing money on price while the carry benefit is insufficient to offset the loss.

**Pros**

- Only trades when two independent factors agree - high signal quality
- Carry factor reduces P&L volatility (you're being paid for holding)
- Market-neutral regarding positions that aren't doubly confirmed
- Elegant combination of trend and carry that has academic support

**Cons**

- Very few signals - high selectivity means significant periods without activity
- Both filters can be satisfied and still produce losses if trend reverses sharply
- Funding data quality affects signal reliability
- Carry benefit in perpetual futures is smaller than FX interest rate differentials

**Best in:** markets with meaningful, persistent carry differentials and clear medium-term trends.
**Avoid when:** funding is consistently near zero (carry component adds nothing) or when trend is unclear.

<python-figure src="strategy-carry-with-trend" caption="Funding rate relative to a small threshold; carry-with-trend seeks alignment (paid to hold)."></python-figure>

---

## Regime filter strategies

Regime filter strategies do not generate primary signals themselves - they determine which conditions must be present before any signal is acted upon. They act as gatekeepers that prevent other strategies from trading in unfavorable environments.

The key insight is that trading costs are not zero. Every false signal generates a transaction cost, a spread cost, and often a small loss. A filter that prevents even half of those false signals, while only occasionally filtering out a real signal, can dramatically improve net performance. The tradeoff is that filters also reduce signal frequency - which is why the most effective filters target the specific regime that damages a strategy most (e.g., range-bound markets for trend strategies).

---

### Volatility Regime Filter

**What it does**

This strategy measures ATR as a percentile of its own recent history. When volatility is "too hot" (ATR in the top percentile of recent readings), signals from an EMA crossover strategy are suppressed - price moves are too erratic and driven by noise, not trend. When volatility is "too cold" (ATR in the bottom percentile), signals are also suppressed - the market may be so quiet that trend signals lack meaning. Only in the "Goldilocks" middle zone are signals allowed.

Mathematically, this computes the percentile rank of current ATR within its recent history. If the current ATR is in the 50th percentile of the past 100 ATR readings, it is moderate. If it is in the 90th percentile, volatility is unusually high.

**When it goes long:** bullish EMA crossover and volatility in acceptable range (between `low_vol_pct` and `high_vol_pct`)
**When it goes short:** bearish EMA crossover and volatility in acceptable range

**Key parameters**

| Parameter      | Default | What it controls          |
| -------------- | ------: | ------------------------- |
| `atr_period`   |      14 | ATR lookback              |
| `atr_lookback` |     100 | Percentile history window |
| `high_vol_pct` |    0.85 | Above this = too volatile |
| `low_vol_pct`  |    0.15 | Below this = too quiet    |

**Why it works**

Volatility regimes predict strategy performance. Trend strategies work best in moderate volatility: high enough that price movements are meaningful and directional (not just noise), but not so high that erratic price action generates spurious crossovers. At very high volatility, ATR-based stops are wide, giving more room but also creating more potential for whipsaws before the stop is hit. At very low volatility, the signal quality drops because there is little directional movement to capture.

The VIX index serves as the classic macro-level volatility regime indicator. Many systematic funds reduce risk exposure when VIX spikes above 30-35 (extreme fear, erratic markets) and increase exposure in normal VIX environments (10-20).

**Real-world example**

The "Volmageddon" event of February 5, 2018 provides a dramatic example. On that date, the VIX doubled in a single trading day - from 17 to 37 - as a sharp equity selloff triggered a catastrophic squeeze in short-volatility exchange-traded products. A volatility regime filter set to suppress trend signals above the 85th percentile of recent ATR would have been triggered that day, keeping trend-following systems on the sidelines during the extreme one-day volatility spike and its aftermath.

Professional systematic funds such as Winton and Man AHL have documented that they reduce exposure in high-volatility regimes - not because high volatility always produces losses, but because the signal-to-noise ratio degrades and risk-adjusted returns decline.

**False signals and failure modes**

Occasionally the most significant trend moves begin during high-volatility periods - the initial move out of a crash (like March 2020's recovery) or a major policy-driven breakout. The volatility regime filter suppresses signals during these moments, potentially causing the strategy to miss the early and most violent part of the trend. This is the filter's cost: fewer bad trades, but also some missed good ones.

Setting the upper volatility threshold too conservatively (e.g., 70th percentile) blocks too many signals and defeats the purpose. Setting it too liberally (95th percentile) allows most whipsaws through.

**Pros**

- Directly targets the environment that damages trend strategies most
- ATR percentile is self-normalizing - valid across different instruments
- Can dramatically improve risk-adjusted returns of underlying trend strategy
- Simple to implement as an overlay on any directional strategy

**Cons**

- Misses some signals during genuine high-volatility trends
- Adds a parameter (the percentile thresholds) that requires calibration
- Can create periods with no signals during extended high-volatility regimes
- Historical percentile window choice affects results

**Best in:** overlay on EMA crossover, MACD, or other trend strategies across all asset classes.
**Avoid when:** used as a standalone signal rather than as a filter for another strategy.

<python-figure src="strategy-volatility-regime-filter" caption="Volatility percentile proxy (0–1). Signals are allowed only inside a target band."></python-figure>

---

### ADX Regime Filter

**What it does**

Rather than filtering based on volatility level, this strategy uses ADX to gate signals to periods when trends are confirmed to exist at an appropriate strength - not so weak that there is no trend (ADX < 20), but also not so strong that the trend may be exhausted or parabolic (ADX > 50). Within the "tradable trend" ADX range, the directional indicator (EMA crossover + DI alignment) drives the signal.

The logic distinguishes between three ADX states:

- **ADX < `adx_min`**: No trend - reversion strategies are more appropriate; trend signals are noise.
- **`adx_min` ≤ ADX ≤ `adx_max`**: Healthy trend in progress - tradeable with momentum/trend strategies.
- **ADX > `adx_max`**: Extreme, potentially exhausted trend - overextension risk is high.

**When it goes long:** trend up (price above EMA), ADX between `adx_min` and `adx_max`, and DI+ > DI-
**When it goes short:** trend down (price below EMA), ADX between `adx_min` and `adx_max`, and DI- > DI+

**Key parameters**

| Parameter    | Default | What it controls        |
| ------------ | ------: | ----------------------- |
| `adx_period` |      14 | ADX lookback            |
| `adx_min`    |      20 | Minimum ADX to trade    |
| `adx_max`    |      50 | Maximum ADX to trade    |
| `ema_period` |      20 | EMA for trend direction |

**Why it works**

The maximum ADX filter addresses a problem that the basic ADX Trend strategy doesn't: extreme ADX readings can coincide with overextended trends near their ends. When ADX is above 50, it means the trend has been unusually strong for an extended period - momentum is at its most extended, and the probability of at least a corrective pause or reversal is elevated. The "tradable trend" window (20-50) identifies trends that are confirmed and active but not yet at overextension levels.

This approach is used by professional CTA programs: they seek to participate in trends that have proven themselves (ADX > 20) without doubling down near parabolic extremes (ADX > 50).

**Real-world example**

The post-2011 gold market illustrates the upper ADX filter's value. During the 2011 peak and subsequent decline, gold's ADX rose sharply. Had an ADX regime filter been in place with an upper limit of 50, it would have suppressed new short entries during the most extreme downtrend phase - which also happened to be near the bottom of the move in 2015-2016. Similarly, ADX on gold collapsed to below 20 after 2013 as the market entered a multi-year range - correctly signaling that trend strategies should stand aside.

**False signals and failure modes**

The upper ADX cap occasionally suppresses valid continuation signals in very strong trends. A strong trend with ADX at 55 may continue for another 30% before reversing; the filter's conservatism causes the strategy to miss this continuation.

The ADX bands (20 and 50) also require periodic reassessment for different instruments. Some markets routinely have ADX above 50 when trending strongly (volatile commodities); others rarely exceed 40. Static thresholds may need adjustment.

**Pros**

- Both filters (minimum and maximum ADX) address distinct failure modes
- Three-factor confirmation (trend direction + ADX magnitude + DI direction) is high quality
- Works as a standalone or as an overlay
- Reduces exposure at potential trend extremes where reversal risk is elevated

**Cons**

- May suppress some valid late-stage trend continuation signals
- Three parameters to calibrate (ADX min, max, EMA period)
- ADX itself lags; transitions in or out of the filter window happen after the fact
- The "safe zone" for ADX varies by instrument

**Best in:** markets with identifiable trend-range-trend cycles; trend-following portfolios where over-extension is a meaningful risk.
**Avoid when:** markets have unusual volatility characteristics that push ADX persistently above 50 even in healthy trends.

<python-figure src="strategy-adx-regime-filter" caption="ADX constrained by a lower/upper band; trades are gated to a tradable trend regime."></python-figure>

---

## Tail risk strategies

Tail risk strategies target unusual events - the extreme end of the distribution of market moves. These strategies have low signal frequency, high variance, and payoffs that are uncorrelated with normal market conditions. They are most valuable as portfolio-level diversifiers rather than as standalone approaches.

The underlying market phenomenon is panic and forced selling. When markets drop sharply enough to trigger margin calls, forced liquidations, and stop cascades, price can temporarily overshoot fundamentals dramatically. The recovery from this overshoot - once the forced selling exhausts - is what tail risk strategies attempt to capture.

---

### Vol Spike Short

**What it does**

Volatility exhibits a well-documented mean-reverting tendency. Periods of extremely high volatility are followed by lower volatility; the question is not whether volatility will revert but when. This strategy identifies when ATR has spiked to an extreme percentile of its recent history - suggesting that volatility itself has overshot - and fades it, betting on a reversion of both volatility and price.

The signal: when ATR crosses above a high percentile threshold (e.g., the 95th percentile of recent ATR readings), it indicates a volatility spike. The strategy sells this spike, betting that price has moved too far too fast and will partially recover as the panic subsides.

**When it goes short:** ATR crosses above `spike_threshold_pct` percentile of recent history
(The long variant: ATR spike followed by initial recovery indicates reversion has begun)

**Key parameters**

| Parameter             | Default | What it controls                 |
| --------------------- | ------: | -------------------------------- |
| `atr_period`          |      14 | ATR lookback                     |
| `spike_lookback`      |     100 | "Normal volatility" history      |
| `spike_threshold_pct` |    0.95 | ATR must be in top 5% to trigger |

**Why it works**

Volatility spikes are driven by panic - a period where sellers at any price overwhelm buyers at any price. This extreme imbalance is self-limiting: eventually, sellers exhaust their supply (everyone who wanted to sell has sold), forced liquidations complete, and buyers return as prices reach levels that attract value interest. The recovery from the spike tends to happen quickly - often within hours to days - because panic is a psychological state that reverses when the catalyst subsides or when price falls to levels that attract long-term buyers.

The mean-reverting nature of volatility is supported by extensive academic research. GARCH models (Generalized Autoregressive Conditional Heteroskedasticity) - the standard academic framework for volatility modeling - explicitly model volatility as mean-reverting toward a long-run average.

**Real-world example**

The "Volmageddon" event of February 5, 2018 provides a textbook example. The VIX nearly doubled in a single trading day (from 17 to nearly 38), driven by a forced unwind of short-volatility exchange-traded products (notably XIV) as the S&P 500 dropped about 4%. Within two weeks, the VIX had reverted from 38 to below 20. Traders who bought S&P 500 exposure (or sold VIX) into the spike captured a 7-8% gain in the subsequent recovery as the panic subsided.

A more extreme example: during the March 2020 COVID crash, the VIX reached 85 - the highest reading in its history, exceeding even the 2008 financial crisis. The VIX then collapsed from 85 to below 30 within three months as extraordinary policy response restored confidence. Strategies that faded the volatility spike at the peak of March 2020 participated in one of the fastest recoveries in equity market history.

**How traders have used it to profit**

Volatility mean-reversion is exploited systematically by volatility arbitrageurs who buy variance swaps at high realized volatility and sell them once the spike subsides, by VIX call/put spread traders who position for the mean-reversion of implied volatility, and by equity traders who buy index dips during panic events. The strategy requires pre-positioned capital - you need to be ready to deploy at the moment of maximum fear.

**False signals and failure modes**

The catastrophic failure mode is a volatility spike that keeps spiking. During the 2008 financial crisis, volatility didn't spike once and revert - it remained elevated for months as the systemic nature of the crisis became apparent. Strategies that faded the initial Lehman Brothers spike in September 2008 faced continued extreme volatility and further price decline through November 2008.

The critical error is conflating a panic-driven overshoot (temporary, driven by forced selling) with fundamental deterioration (persistent, driven by new negative information). A company's stock dropping 20% in a day due to a revelation of accounting fraud is not a Vol Spike Short opportunity - it is a repricing. Vol Spike Short works on market-wide panics and instrument-specific overreactions; it fails on genuine bad news.

**Pros**

- Provides exposure to panic exhaustion - one of the cleaner short-term reversions
- Rare signals means each one receives careful attention
- Natural portfolio diversifier - profits in moments of market stress
- Asymmetric: panics overshoot, creating large short-term reversion potential

**Cons**

- Very high variance - individual signals either work decisively or fail catastrophically
- Cannot distinguish panic from legitimate repricing in real time
- Infrequent signals mean the strategy is essentially always "waiting"
- Requires strong psychological discipline to buy/sell into maximum fear

**Best in:** liquid markets with clear panic signatures - equity indices, VIX derivatives, commodity spikes.
**Avoid when:** there is fundamental news driving the volatility rather than pure technical/leverage-driven panic.

<python-figure src="strategy-volspike-short" caption="ATR proxy expressed as a z-score; extreme spikes are treated as tail events to fade."></python-figure>

---

### Liquidation Cascade

**What it does**

Liquidation Cascade targets the specific dynamic of forced liquidations in leveraged markets. When price drops sharply enough to breach the margin requirements of leveraged long positions, exchanges automatically liquidate those positions - creating additional selling pressure, which triggers more margin calls, which triggers more liquidations. This cascade can temporarily push price far below any reasonable fundamental level.

The strategy measures the speed and magnitude of a recent price drop using a short-period Rate of Change (ROC). An extreme negative ROC (a very fast, large drop) signals a potential liquidation cascade. The trade is to fade this extreme: go long expecting the cascade to exhaust and price to partially recover. An optional funding rate confirmation filter ensures the move was driven by overleveraged longs (funding was high before the cascade, indicating crowded long positions that then got liquidated).

**When it goes long:** ROC very negative (sharp drop - potential cascade exhaustion)
**When it goes short:** ROC very positive (sharp pump - potential leveraged squeeze exhaustion)

**Key parameters**

| Parameter           | Default | What it controls              |
| ------------------- | ------: | ----------------------------- |
| `roc_period`        |       3 | How fast the move is measured |
| `cascade_threshold` |     3.0 | ROC magnitude required (%)    |
| `funding_confirm`   |    True | Require funding confirmation  |

**Why it works**

Cascades are mechanical, not fundamental. Margin calls are triggered by contractual rules, not by any new information about value. The selling they produce is forced - liquidation algorithms sell regardless of price, without consideration of value. When the mechanical selling exhausts (all the marginable positions have been cleared), the forced supply disappears and price recovers toward the level that willing participants consider fair.

The key evidence for this mechanism: flash crashes and cascade events tend to show V-shaped recoveries when the cause is forced selling (e.g., May 6, 2010 Flash Crash in U.S. equity markets) but plateau at lower levels when the cause is new information (e.g., 9/11 attack, Lehman Brothers failure).

**Real-world example**

The May 6, 2010 Flash Crash is the canonical liquidation cascade in modern market history. In 14 minutes, the Dow Jones Industrial Average fell approximately 1,000 points (9%), with individual stocks briefly trading at $0.01. The cause was a combination of an algorithmic selling program and the withdrawal of market maker liquidity, triggering stop-loss cascades. Within 20 minutes, the Dow had recovered approximately 600 points. The extreme, rapid nature of the decline and the equally rapid recovery is characteristic of a mechanical cascade rather than a fundamental repricing.

The "Knight Capital" incident of August 2012, where a software bug at Knight Capital Group caused erratic trading in 140 NYSE-listed securities, created similar dynamics in individual stocks - extreme moves followed by rapid reversion as the mechanical distortion was identified and corrected.

**How traders have used it to profit**

High-frequency trading firms and market makers have systematically profited from these cascade events by providing liquidity at extreme levels during the cascade and selling that inventory at recovery prices. Slower systematic traders have used them as intraday swing trading setups, entering at the apparent exhaustion of the cascade and exiting as price recovers toward pre-cascade levels.

**False signals and failure modes**

The most dangerous failure is entering a liquidation cascade that is actually genuine fundamental deterioration. If a company announces a scandal, or a country announces a default, or a systemic event begins - the "cascade" will not exhaust because it is not purely mechanical. Each wave of selling reflects new information being digested, not stop orders being cleared.

The short timeframe (3-period ROC) also means signals can be triggered by minor intraday fluctuations that are simply noisy price action, not genuine cascade events. Without the funding confirmation filter, false positives multiply significantly.

**Pros**

- Captures the mechanical exhaustion of forced selling events
- Short-duration trades - typically resolved within hours
- Funding confirmation filter adds structural validity to the cascade hypothesis
- High reward-to-risk when correctly identified

**Cons**

- Cannot reliably distinguish cascade from genuine fundamental repricing
- Catching falling knives: if the cascade continues, losses can be rapid and large
- Requires infrastructure to act quickly on fast-moving signals
- Funding confirmation data may not be available or accurate in real time

**Best in:** highly leveraged markets with clearly mechanical cascade dynamics; intraday to short-term holding periods.
**Avoid when:** there is any known fundamental news driving the decline.

<python-figure src="strategy-liquidation-cascade" caption="Fast ROC(3) shock detection; extreme moves are faded as liquidation cascades."></python-figure>

---

## Time and event strategies

Time and event strategies only trade during specific windows where market behavior is structurally predictable. These strategies are not about analyzing price to determine direction - they bet that specific, recurring patterns in market microstructure create predictable directional flow at known times.

The justification for time-based strategies comes from the non-homogeneous nature of market participation: different institutions are active at different times, creating systematic flow patterns that repeat on predictable schedules.

---

### Session Overlap Momentum

**What it does**

Global financial markets have concentrated periods of institutional activity that correspond to geographic trading sessions: Asian markets (Tokyo, Hong Kong, Sydney), European markets (London, Frankfurt, Zurich), and U.S. markets (New York). When two sessions overlap, the volume concentration and institutional order flow is at its highest, often creating directional moves with follow-through.

This strategy trades momentum signals (using ROC) only during two specific overlap windows:

- **Asia/EU overlap (07:00-09:00 UTC)**: Asian and European institutions simultaneously active
- **EU/US overlap (13:00-16:00 UTC)**: The most liquid 3-hour window in global currency markets, as European afternoon meets the U.S. morning

Outside these windows, no signals are taken regardless of what momentum indicators show.

**When it goes long:** inside an overlap window and ROC above positive threshold
**When it goes short:** inside an overlap window and ROC below negative threshold

**Key parameters**

| Parameter         |         Default | What it controls          |
| ----------------- | --------------: | ------------------------- |
| `roc_period`      |               5 | Momentum lookback         |
| `roc_threshold`   |             0.3 | Minimum momentum required |
| `overlap_windows` | [(7,9),(13,16)] | Active windows (UTC)      |

**Why it works**

The EU/US overlap (1-5 PM London time) is the most actively traded window in FX markets. Volume during this 4-hour window represents a disproportionate fraction of daily FX volume as European institutions complete their business and U.S. institutions begin theirs. Both sets of participants are operating on the same real-time information, creating correlated directional order flow. Price moves that begin during this window, especially those driven by macroeconomic data releases or central bank events, tend to have follow-through because both European and U.S. participants agree on the direction.

Research published by academic market microstructure economists has documented statistically significant patterns in FX price behavior across session transitions, particularly at the London open (7-8 AM UTC) and during the London/New York overlap.

**Real-world example**

Studies of EUR/USD daily patterns consistently show that the EU/US overlap (13:00-16:00 UTC) produces higher average absolute price movement than any other equivalent window. Institutional FX traders explicitly model this - many currency overlay programs execute their trades during this window specifically because liquidity is highest and market impact is lowest.

In 2013-2014, the Bank of England WM/Reuters 4 PM fixing scandal revealed that bank traders were colluding to move the 4 PM London fix (which falls within the EU/US overlap window) in the direction of their accumulated client orders. This scandal validated the significance of the session overlap window - it was precisely because the fixing rate was market-moving and predictable that manipulation was attempted.

**False signals and failure modes**

The strategy is explicitly weaker on longer timeframes (4H+) where the session overlap distinction becomes less meaningful - daily and weekly trends dominate intraday session boundaries. It also performs poorly on weekends and holidays when liquidity is thin and session boundaries are less meaningful.

When markets are in a quiet period with no catalysts, the overlap window may produce momentum signals based on thin noise rather than genuine institutional flow. Low-volatility overlap sessions don't generate meaningfully different flow dynamics from off-peak periods.

**Pros**

- Based on documented market microstructure patterns
- Time filter reduces overall signal exposure, eliminating off-peak noise
- Particularly effective around economic data releases that fall within overlap windows
- Works well on 1H charts in highly liquid FX and futures markets

**Cons**

- Less useful on longer timeframes
- Requires precise time tracking (UTC synchronization)
- Overlap windows can vary slightly around daylight saving time changes
- Low-volume overlap sessions provide weaker signals

**Best in:** 1H charts on major FX pairs (EUR/USD, GBP/USD, USD/JPY) during active institutional sessions.
**Avoid when:** trading on daily or weekly timeframes where session boundaries are irrelevant.

<python-figure src="strategy-session-overlap-momentum" caption="ROC during higher-activity windows; time filters avoid low-signal hours."></python-figure>

---

### Funding Window Breakout

**What it does**

Perpetual futures funding rates settle at fixed times: 00:00, 08:00, and 16:00 UTC. In the hours before settlement, traders with directional exposure may adjust positions - reducing positions if they are on the wrong side of the funding payment, or building positions if they expect the funding rate to shift in their favor after settlement. This pre-settlement positioning creates predictable flow patterns.

The strategy defines a window of `window_hours_before` hours before each settlement time and trades breakouts of the recent price range that occur within this window. The thesis is that the pre-settlement positioning flow creates directional commitment that tends to persist beyond the settlement itself.

**When it goes long:** in the funding window and price breaks above recent N-bar high
**When it goes short:** in the funding window and price breaks below recent N-bar low

**Key parameters**

| Parameter             |  Default | What it controls                          |
| --------------------- | -------: | ----------------------------------------- |
| `window_hours_before` |        2 | How many hours before settlement to watch |
| `settlement_hours`    | [0,8,16] | UTC settlement times                      |
| `breakout_period`     |       10 | Range window for breakout                 |

**Why it works**

The funding settlement creates a coordination point for market participants. Traders who are long and seeing high positive funding know that in 2 hours they will pay a funding charge; some will reduce exposure to avoid the cost, creating selling pressure. Conversely, traders who are short know they will receive funding at settlement, which may encourage them to maintain or increase their short exposure heading into settlement.

This dynamic creates a window where positioning adjustments are concentrated, generating higher-than-usual order flow with a directional lean. Breakouts from the recent range during this window have structural support from the directional flow, rather than being random noise breakouts.

The concept is analogous to the pre-auction dynamics in government bond markets. In U.S. Treasury auctions, dealers and investors regularly adjust positions in the hours before the auction result, creating predictable intraday patterns around Treasury supply events.

**Real-world example**

Treasury bond markets provide the clearest traditional-finance analogue. When the U.S. Treasury announces a 10-year note auction, dealers (primary dealers who must bid at auctions) often short Treasury futures in the hours before the auction to hedge their anticipated successful bids, then cover after the auction clears. This creates predictable downward price pressure before auctions and often a relief rally immediately after. Traders who model and position for this recurring pattern have profited systematically from it - it is well-documented enough to have been the subject of academic research.

**False signals and failure modes**

The effectiveness of this strategy depends on funding rates being non-trivial - when funding is near zero, there is no pre-settlement adjustment flow because there is no material cost or benefit to adjusting. In periods of flat funding across all hours, the strategy degenerates into a random breakout strategy without the structural backing.

Additionally, the pattern may erode as more traders become aware of it and position earlier, pulling the flow into the hours before the window rather than within it.

**Pros**

- Exploits a structural, recurring calendar effect with mechanical rationale
- Well-defined entry window reduces overall market exposure
- Generalizes to analogous traditional-finance patterns (Treasury auctions, quarterly rollovers)
- The breakout provides additional directional confirmation beyond the time filter alone

**Cons**

- Dependent on non-zero funding rates for the structural flow to exist
- Can become self-defeating as the pattern becomes widely known
- Limited to perpetual futures markets without direct analogue in spot markets
- Multiple daily windows increase signal frequency, which may increase transaction costs

**Best in:** highly liquid perpetual futures markets during periods of meaningful funding rate levels.
**Avoid when:** funding rates are consistently near zero and there is no meaningful pre-settlement flow incentive.

<python-figure src="strategy-funding-window-breakout" caption="Breakouts against a short recent range, intended for pre-settlement flow windows."></python-figure>

---

## Combining strategies

A portfolio of strategies is fundamentally more robust than any single strategy. The reason is diversification of edge: each strategy exploits a different market inefficiency, and these inefficiencies do not all disappear simultaneously in the same market conditions.

**Why diversification across strategies works**

Trend strategies and reversion strategies have approximately negatively correlated returns: when markets are trending, trend strategies win and reversion strategies lose. When markets are ranging, reversion wins and trend loses. Holding both simultaneously smooths the aggregate return stream dramatically, reducing the maximum drawdown without proportionally reducing expected returns.

Similarly, combining short-timeframe momentum strategies with long-timeframe trend strategies provides diversification across horizons. Short-term momentum might capture a 3-day move; long-term trend following captures a 3-month move. Both can be happening simultaneously in different instruments or at different scales in the same instrument.

**Correlation management**

When combining strategies, the key measure is not how each strategy performs independently but how their returns correlate. Two strategies with identical return streams provide no diversification benefit. Two strategies with negatively correlated returns provide maximum diversification.

Approximate correlation characteristics:

- Trend + Trend (different indicators): High positive correlation - limited diversification
- Trend + Reversion: Moderate to low correlation - meaningful diversification
- Trend + Volatility breakout: Moderate correlation (both benefit from directional movement)
- Trend + Funding momentum: Moderate correlation in trending regimes
- Vol spike short + Liquidation cascade: High positive correlation (both fade panic)
- Pairs spread + Vol spike short: Low to negative correlation - excellent diversification

**A simple multi-strategy framework**

A practical approach for systematic traders:

1. **Core trend** (EMA crossover or SuperTrend): trades the primary trend signal on daily bars across multiple instruments
2. **Reversion overlay** (Bollinger or RSI reversion): trades shorter-term pullbacks within the trend on 4H bars
3. **Breakout filter** (Donchian): confirms that new positions align with long-term breakout direction
4. **Regime gate** (ADX or Volatility Regime Filter): suppresses all signals when conditions are unfavorable

This layered approach combines multiple edges while keeping the system simple enough to understand and maintain.

**The practical limit**

Adding strategies indefinitely does not always improve results. Each additional strategy adds complexity, potential for parameter overfitting, and operational overhead. The marginal diversification benefit of the 10th strategy is much smaller than the benefit of adding the second strategy. Most professional systematic programs run 3-8 core signal families, not 33.

The catalog in this guide is intended as an educational reference of available approaches - not a prescription to run all of them simultaneously.

---

## Quick comparison table

| Strategy                    | Style       | Best market           | Win rate (typical) | Signals per month |
| --------------------------- | ----------- | --------------------- | -----------------: | ----------------: |
| EMA Crossover               | Trend       | Trending              |             35–45% |             10–30 |
| MACD Trend                  | Trend       | Trending              |             35–45% |              8–25 |
| SuperTrend                  | Trend       | Trending              |             40–50% |              5–15 |
| Ichimoku Cloud              | Trend       | Trending              |             40–50% |              5–12 |
| ADX Trend                   | Trend       | Strong trend          |             40–50% |              5–15 |
| RSI Reversion               | Reversion   | Ranging               |             60–70% |             15–40 |
| Bollinger Reversion         | Reversion   | Ranging               |             60–70% |             10–30 |
| VWAP Reversion              | Reversion   | Ranging               |             60–70% |             20–60 |
| Z-Score Reversion           | Reversion   | Ranging               |             60–70% |             15–40 |
| RSI Momentum                | Momentum    | Trending              |             45–55% |             10–25 |
| ROC Momentum                | Momentum    | Trending              |             45–55% |             15–40 |
| Stochastic Momentum         | Momentum    | Oscillating           |             50–60% |             10–25 |
| Dual Momentum               | Momentum    | Clean trends          |             50–60% |              5–15 |
| ATR Breakout                | Volatility  | Post-consolidation    |             35–45% |              8–20 |
| Donchian Breakout           | Volatility  | Breakouts             |             30–40% |              5–15 |
| Bollinger Squeeze           | Volatility  | Post-consolidation    |             40–50% |              3–10 |
| Opening Range Breakout      | Volatility  | Active sessions       |             50–60% |             15–30 |
| OBV Divergence              | Volume      | Turning points        |             45–55% |              8–20 |
| VWAP Cross                  | Volume      | Active trading        |             50–55% |             15–40 |
| Trade Flow Imbalance        | Volume      | Liquid pairs          |             55–65% |             10–30 |
| Kalman Moving Average       | Statistical | Trending              |             40–50% |             10–25 |
| Hurst Regime                | Statistical | Any                   |             45–55% |              5–20 |
| Regression Channel          | Statistical | Trending ranges       |             60–70% |              8–20 |
| Pairs Spread Mean Reversion | Statistical | Correlated pairs      |             65–75% |              5–15 |
| Funding Rate Fade           | Funding     | Extremes              |             50–60% |              5–15 |
| Funding Momentum            | Funding     | Trending + crowd      |             45–55% |              5–10 |
| Carry With Trend            | Funding     | Trending              |             50–60% |              5–12 |
| Volatility Regime Filter    | Regime      | Moderate vol          |             varies |              5–15 |
| ADX Regime Filter           | Regime      | Developing trends     |             varies |              5–12 |
| Vol Spike Short             | Tail risk   | Panic events          |             55–65% |               1–5 |
| Liquidation Cascade         | Tail risk   | High leverage periods |             55–65% |               2–8 |
| Session Overlap Momentum    | Time        | Active windows        |             50–55% |             15–40 |
| Funding Window Breakout     | Time        | Pre-settlement        |             50–55% |             20–40 |
