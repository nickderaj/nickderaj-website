---
title: 'Commodity Price Analysis'
date: '2026-01-26'
description: 'Technical analysis of 21 commodities with buy/sell signals across 8 indicators.'
tags: ['math', 'commodities', 'quant', 'technical-analysis']
---

<table-of-contents>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#moving-averages">Moving Averages</a></li>
<li><a href="#macd">MACD</a></li>
<li><a href="#rsi">RSI</a></li>
<li><a href="#bollinger-bands">Bollinger Bands</a></li>
<li><a href="#average-true-range">Average True Range</a></li>
<li><a href="#z-score">Z-Score</a></li>
<li><a href="#drawdown-returns">Drawdown & Returns</a></li>
<li><a href="#returns-distribution">Returns Distribution</a></li>
<li><a href="#methodology">Methodology</a></li>
</table-of-contents>

## Introduction

This page presents a technical analysis dashboard for 21 commodities spanning metals, energy, and agriculture. Each commodity is analysed using 8 technical indicators that together produce a consensus buy/sell/neutral signal.

Select a commodity and time period below. The signal dashboard summarises the current recommendation from each indicator, while the charts below show the full history of each metric. Signals always reflect the latest available data point regardless of the period selected for the charts.

<commodity-selector></commodity-selector>

<commodity-charts></commodity-charts>

## Methodology

The signal for each indicator is generated using fixed thresholds applied uniformly across all commodities:

| Indicator     | Buy                                 | Sell                                 |
| ------------- | ----------------------------------- | ------------------------------------ |
| SMA Crossover | SMA 20 > SMA 200                    | SMA 20 < SMA 200                     |
| MACD          | MACD > Signal, histogram rising     | MACD < Signal, histogram falling     |
| RSI           | RSI < 30 (oversold)                 | RSI > 70 (overbought)                |
| Bollinger %B  | %B < 0.2 (near lower band)          | %B > 0.8 (near upper band)           |
| ATR           | ATR < 0.5× average (low volatility) | ATR > 1.5× average (high volatility) |
| Z-Score       | Z < −1.5                            | Z > 1.5                              |

The overall signal is determined by majority vote: if 3 or more indicators agree on Buy, the overall signal is Bullish; if 3 or more agree on Sell, it is Bearish; otherwise Neutral.

All data is sourced from Yahoo Finance via the yfinance library. The analysis covers approximately 5 years of trading data. RSI uses Wilder's smoothing method (exponential moving average with $\alpha = 1/14$). ATR uses a 14-period exponential moving average of True Range. Bollinger Bands use 2 standard deviations around a 20-period SMA.

<callout variant="warning">This analysis is for educational purposes only and does not constitute financial advice. Past performance does not guarantee future results. Always conduct your own research before making investment decisions.</callout>
