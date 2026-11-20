---
title: 'Technical Pattern Recognition'
date: '2026-01-27'
description: 'Detecting chart patterns in commodity futures — ascending triangles, head & shoulders, double bottoms, and more — then backtesting predictions against actual price movements.'
tags: ['commodities', 'technical-analysis', 'pattern-recognition', 'python']
---

<table-of-contents>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#pattern-types">Pattern Types</a></li>
<li><a href="#how-it-works">How It Works</a></li>
<li><a href="#interactive-analysis">Interactive Analysis</a></li>
<li><a href="#all-results">All Results</a></li>
<li><a href="#methodology">Methodology</a></li>
</table-of-contents>

## Introduction

Technical pattern recognition attempts to identify recurring geometric formations in price charts that historically precede predictable price movements. Traders have catalogued these patterns for over a century, from Charles Dow's foundational work in the 1890s to modern algorithmic implementations.

This post implements nine classical chart patterns programmatically, applies them to commodity futures data, and backtests the resulting predictions against actual price movements. The goal isn't to validate technical analysis as a trading strategy — it's to build an objective measurement of how often these patterns produce directionally correct predictions on recent commodity data.

## Pattern Types

The system detects nine patterns, each classified as bullish (price expected to rise) or bearish (price expected to fall).

### Continuation Patterns

**Ascending Triangle** (Bullish, 75% confidence) — Rising lows converging toward flat resistance. The tightening range suggests buyers are increasingly aggressive, and a breakout above resistance is expected.

**Descending Triangle** (Bearish, 75% confidence) — Falling highs converging toward flat support. Sellers are increasingly aggressive, and a breakdown below support is expected.

**Bullish Flag** (Bullish, 70% confidence) — A brief consolidation (low slope) following a strong uptrend. The pause is interpreted as profit-taking before the trend resumes.

**Bearish Flag** (Bearish, 70% confidence) — A brief consolidation following a strong downtrend. The pause precedes further selling.

### Reversal Patterns

**Double Bottom** (Bullish, 80% confidence) — Two troughs at nearly the same price level (within 2%). The repeated test of support without breakdown suggests a floor has formed.

**Double Top** (Bearish, 80% confidence) — Two peaks at nearly the same price level. The repeated failure to break resistance suggests a ceiling has formed.

**Head & Shoulders** (Bearish, 85% confidence) — Three peaks where the middle (head) is higher than the two shoulders, which are roughly equal. A classic topping pattern.

**Inverted Head & Shoulders** (Bullish, 85% confidence) — Three troughs where the middle is lower than the two shoulders. A classic bottoming pattern.

### Wedge Patterns

**Rising Wedge** (Bearish, 65% confidence) — Both highs and lows are rising, but lows are rising faster, causing the price channel to narrow upward. Despite the upward drift, the converging trendlines signal weakening momentum.

**Falling Wedge** (Bullish, 65% confidence) — Both highs and lows are falling, but highs are falling faster. The converging trendlines signal a potential reversal to the upside.

## How It Works

Each analysis uses a three-date split:

1. **Analysis period** (start → mid): The pattern recognition algorithm examines this window. It identifies local peaks and troughs using the `scipy.signal.argrelextrema` function, then runs all nine pattern detectors. Detected patterns are scored and aggregated into a single directional prediction (BULLISH, BEARISH, or NEUTRAL) with an overall confidence.

2. **Test period** (mid → end): The algorithm checks the actual price movement during this period. If the price moved more than 0.5% in either direction, it's classified as BULLISH or BEARISH. If it stayed within ±0.5%, it's NEUTRAL.

3. **Verdict**: The prediction from step 1 is compared against the actual direction from step 2. A match counts as correct.

The system uses `scipy.signal.argrelextrema` with `order=5` to identify local peaks and troughs — meaning a point must be the highest (or lowest) within a 5-day window on each side to qualify. Support and resistance levels are derived from the most recent peaks and troughs.

## Interactive Analysis

Select a commodity and date range to see the pattern analysis in detail. The chart shows the analysis period in blue and the test period in grey (dashed). Red dots mark detected peaks, green dots mark troughs. Horizontal dashed lines show support (green) and resistance (red) levels.

<pattern-selector></pattern-selector>

<pattern-display></pattern-display>

## All Results

Below are all 20 analysis samples — 10 with 3-month windows and 10 with 6-month windows — across seven commodities. Click any card to load its detailed analysis above.

<pattern-results-table></pattern-results-table>

## Methodology

**Confidence scoring**: Each pattern has a fixed base confidence (65–85%) determined by the pattern type. The overall prediction aggregates all detected patterns by summing bullish and bearish confidences separately, then normalizing so they sum to 1. The direction with the higher normalized score wins.

**Peak/trough detection**: Local extrema are identified using `scipy.signal.argrelextrema` with `order=5`. This means a peak must be the highest point within a 5-bar window on each side (11 bars total). This balances sensitivity — too small a window detects noise, too large misses legitimate turning points.

**Direction threshold**: A ±0.5% dead zone prevents marginal moves from being classified as directional. Price changes within this band are labelled NEUTRAL.

**Data source**: All price data comes from Yahoo Finance commodity futures contracts (front-month continuous). The `commodities.py` module handles fetching and caching, with forward-fill for gaps and anomaly correction for extreme single-day drops (>80%).

<callout variant="warning" title="Disclaimer">This analysis is for educational and informational purposes only. It is not financial advice. Past pattern recognition accuracy does not predict future results. Technical patterns are one of many tools used in market analysis and should never be the sole basis for trading decisions.</callout>
