---
title: 'Introduction to Derivatives: Concepts and Practice Problems'
date: '2026-04-20'
description: 'A Q&A walkthrough of the foundational ideas behind derivatives - forwards, futures, options, and swaps - paired with a full set of practice problems covering hedging, speculation, arbitrage, and payoff construction.'
tags: ['finance', 'derivatives', 'options', 'futures']
---

<table-of-contents>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#conceptual-questions">Conceptual Questions</a></li>
<li><a href="#practice-problems">Practice Problems</a></li>
<li><a href="#closing-notes">Closing Notes</a></li>
</table-of-contents>

---

## Introduction

Derivatives sit at the heart of modern finance. Every hedge fund, pension scheme, corporate treasury, and market maker touches them in some form, whether they are locking in a currency rate for a future payment, taking a directional view on oil, or building structured products for retail investors. Getting comfortable with the language of forwards, futures, options, and swaps is the first step to reading any serious finance text.

This post runs through two sets of questions drawn from the introductory material of Hull's _Options, Futures, and Other Derivatives_. The first set is conceptual, covering what derivatives are, how they trade, and why the post-2008 regulatory environment looks the way it does. The second set is a bank of practice problems that exercise the payoff mechanics of long and short positions, arbitrage pricing, and hedging strategies. Answers are kept short enough to be useful as a refresher, but long enough to show the working.

---

## Conceptual Questions

### 1. What is a derivative?

A derivative is a financial instrument whose value depends on (derives from) the value of some underlying variable. The underlying can be almost anything with an observable price: a stock, a bond, a commodity like oil or copper, a currency pair, an interest rate, a credit spread, or even the weather. Common derivatives include forwards, futures, options, and swaps.

The key feature is that you are not trading the underlying directly - you are trading a contract whose cashflows are a function of the underlying's future behaviour.

---

### 2. Explain the two main ways that derivatives trade

Derivatives trade in two venues:

- **Exchange-traded markets.** Contracts are standardised (size, maturity, delivery terms) and cleared through a central counterparty (CCP) that sits between buyer and seller. Examples: CME, ICE, Eurex. Participants post margin daily. Counterparty risk is effectively removed.
- **Over-the-counter (OTC) markets.** Contracts are negotiated bilaterally between two parties, typically via dealers. Terms are fully customisable, which is attractive to corporates with specific hedging needs. The tradeoff is counterparty risk and less transparency.

---

### 3. What are the changes in place in the regulation of the OTC market since the 2008 financial crisis?

The crisis exposed the risk of opaque, unmargined, bilateral exposures (AIG and Lehman being the headline examples). Post-crisis reforms, largely driven by the G20 Pittsburgh commitments of 2009 and codified in Dodd-Frank (US) and EMIR (EU), introduced:

- **Mandatory central clearing** for standardised OTC derivatives through CCPs.
- **Trade reporting** to swap data repositories so regulators can see systemic exposures.
- **Higher capital charges** on banks for uncleared bilateral trades.
- **Margin requirements** (initial and variation) on uncleared trades, mimicking exchange-like discipline.
- **Mandatory trading on Swap Execution Facilities (SEFs)** in the US for the most liquid standardised swaps, with similar venues (MTFs, OTFs) in Europe.

The net effect is that the OTC market now looks more like the exchange market than it did in 2007.

---

### 4. Which is bigger, the exchange traded market or the OTC market?

The OTC market is far larger by notional. Recent BIS statistics put global OTC derivatives notionals at roughly \$600 trillion, compared with exchange-traded notionals in the region of \$80 trillion. Gross market value (a better measure of actual exposure) is much smaller than notional in both cases, but OTC still dominates by any sensible measure.

---

### 5. Difference between a long forward and a short forward position

- **Long forward.** You have agreed to **buy** the underlying at a fixed price $K$ on the future delivery date $T$. Your payoff at maturity is $S_T - K$. You profit if the asset rises.
- **Short forward.** You have agreed to **sell** the underlying at $K$ on date $T$. Your payoff is $K - S_T$. You profit if the asset falls.

Neither side pays anything upfront (in the simplest case). The forward price $K$ is set at inception so that the contract has zero value to both parties.

---

### 6. How do (a) forward and (b) futures contracts trade?

- **Forwards** trade over-the-counter. A corporate treasurer rings a dealer, they agree on quantity, delivery date, and forward price. No money changes hands at inception. All cashflows happen at maturity. Counterparty risk exists for the full life of the trade.
- **Futures** trade on an exchange. Contracts are standardised (e.g. one CME gold contract is 100 troy ounces, delivery on specific cycle dates). Both parties post initial margin and the contract is marked-to-market daily, with variation margin passing between accounts each day. The CCP guarantees performance, so counterparty risk is effectively eliminated.

Economically the two are similar; operationally they are very different.

---

### 7. What is the difference between a forward contract to buy an asset at \$30 and a call option to buy the same asset for \$30?

A forward is an **obligation** to buy at \$30. You must transact regardless of where the market is. If $S_T = 20$, you still have to pay \$30 for an asset worth \$20, taking a \$10 loss. A forward costs nothing upfront.

A call option is a **right** (not an obligation) to buy at \$30. If $S_T = 20$, you simply walk away and let the option expire. Your downside is limited. But that optionality has to be paid for - you pay a premium upfront to the option seller.

So: forward = free but binding; call = costly but walk-away.

---

### 8. Explain the difference between hedging, speculation, and arbitrage

- **Hedging** reduces an existing risk exposure. An airline worried about rising fuel costs buys oil futures. If oil rallies, the futures profit offsets the higher pump price.
- **Speculation** takes on risk to profit from an anticipated price movement. A hedge fund with no prior oil exposure buys futures purely because it thinks oil will rise.
- **Arbitrage** locks in a riskless profit by exploiting a pricing inconsistency, typically by simultaneously buying in one market and selling in another.

Hedging and speculation use the same instruments but with opposite intent. Arbitrage is the mechanism that keeps prices consistent across markets.

---

### 9. Explain the meaning of bid and ask quotes

- **Bid** is the price at which a market maker is willing to **buy** from you.
- **Ask** (or offer) is the price at which a market maker is willing to **sell** to you.

The ask is always higher than the bid. The difference, the **bid-ask spread**, is the market maker's compensation for providing liquidity. If you hit the bid and then immediately lift the offer, you pay the spread twice.

---

### 10. What gave rise to Jerome Kerviel's big loss?

Jerome Kerviel was a junior trader on Société Générale's Delta One desk. He was authorised to run small arbitrage positions between European equity index futures and the underlying baskets. Instead, he built up huge unauthorised directional exposures (reportedly around €50 billion notional at peak) and concealed them with fictitious offsetting trades entered into the bank's systems.

When the positions were discovered in January 2008, SocGen was forced to unwind them into a falling market, realising a loss of around €4.9 billion. The root causes were not sophisticated fraud but basic control failures: weak trade confirmation, poor segregation of duties, and insufficient supervision of an insider who understood exactly which checks were actually being performed.

---

## Practice Problems

### 1.1 Selling a call vs buying a put

Both are broadly bearish positions, but the payoffs are different:

- **Selling a call.** You receive the premium upfront. If the stock stays below the strike, you keep it all. If the stock rallies above the strike, you are obligated to deliver at the strike, giving up unlimited upside. Your maximum gain is the premium; your maximum loss is theoretically unbounded.
- **Buying a put.** You pay the premium upfront. If the stock falls below the strike, you profit. If the stock stays above, you lose the premium. Your maximum loss is the premium; your maximum gain is the strike minus the premium (if the stock goes to zero).

Selling a call has limited upside and unlimited downside. Buying a put has limited downside and large (but bounded) upside.

---

### 1.2 Short forward on £100,000 at 1.3000 USD/GBP

Short forward payoff per pound is $K - S_T = 1.3000 - S_T$.

- **(a) $S_T = 1.2900$:** gain $= (1.3000 - 1.2900) \times 100{,}000 = 1{,}000$, or \$1,000.
- **(b) $S_T = 1.3200$:** loss $= (1.3000 - 1.3200) \times 100{,}000 = -2{,}000$, or -\$2,000.

---

### 1.3 Short cotton futures at 50¢/lb, 50,000 lbs

Short payoff per pound is $0.50 - S_T$ dollars.

- **(a) $S_T = 0.4820$:** gain $= (0.50 - 0.4820) \times 50{,}000 = 900$, or \$900.
- **(b) $S_T = 0.5130$:** loss $= (0.50 - 0.5130) \times 50{,}000 = -650$, or -\$650.

---

### 1.4 Writing a put, strike \$40, 100 shares, stock at \$41

You have committed to **buy 100 shares at \$40** if the holder chooses to exercise at expiry. The holder will exercise only if $S_T < 40$.

- **Maximum gain:** the premium you received (kept in full if $S_T \geq 40$).
- **Maximum loss:** $4{,}000$ minus the premium, reached if the stock goes to zero (you pay \$4,000 for shares worth nothing).

---

### 1.5 \$5,800 to invest, stock at \$29, 3-month call (K=\$30) costs \$2.90

Two strategies:

1. **Buy the stock.** $5{,}800 / 29 = 200$ shares.
2. **Buy call options.** $5{,}800 / 2.90 = 2{,}000$ calls (20 contracts).

Payoffs at maturity:

| $S_T$ | Stock P&L  | Options P&L                   |
| ----- | ---------- | ----------------------------- |
| \$25  | $-800$     | $-5{,}800$ (all premium lost) |
| \$30  | $+200$     | $-5{,}800$                    |
| \$35  | $+1{,}200$ | $+4{,}200$                    |
| \$40  | $+2{,}200$ | $+14{,}200$                   |

The options give enormous leverage on the upside but wipe out entirely if the stock fails to clear the strike. This is the classic leverage-vs-insurance tradeoff.

---

### 1.6 Hedging 5,000 shares at \$25 against a decline

Buy 50 put option contracts (each covers 100 shares) with an expiry of 4 months and a strike chosen to set your desired floor, for example \$25. If the stock falls, the puts gain in value, offsetting the drop in your shares. If the stock rises, the puts expire worthless and you simply absorb the premium as the "insurance cost". This is a **protective put**.

---

### 1.7 Does a stock option provide funds to the company like a stock does?

No. When a company issues new stock, it receives cash in exchange for new shares. Exchange-traded stock options, by contrast, are contracts written between two investors. The company is not a party to the trade and receives no funds. Options affect the distribution of returns among investors; they do not raise capital for the firm.

(Employee stock options are different - those are issued by the company and can dilute shareholders when exercised, but they still do not bring in cash in the way a new share issue does.)

---

### 1.8 Why can a futures contract be used for either speculation or hedging?

The contract itself is neutral - it simply locks in a price for future delivery. Whether it is a hedge or a speculation depends on the user's **pre-existing exposure**. A jet fuel buyer who goes long crude futures is hedging, because the futures gain offsets a loss on physical fuel costs. A trader with no fuel exposure who goes long crude futures is speculating, because they have taken on new directional risk. Same contract, opposite purpose.

---

### 1.9 March call, strike \$50, premium \$2.50

The holder exercises if $S_T > 50$ (any positive intrinsic value is worth taking). The holder **profits** if $S_T > 52.50$, because the payoff $S_T - 50$ then exceeds the \$2.50 premium paid.

Payoff at selected prices:

| $S_T$  | 40    | 50    | 52.50 | 55    | 60    |
| ------ | ----- | ----- | ----- | ----- | ----- |
| Profit | -2.50 | -2.50 | 0     | +2.50 | +7.50 |

Flat at -\$2.50 below the strike, then rising one-for-one above it. Breakeven at $S_T = 52.50$.

---

### 1.10 June put written (short), strike \$60, premium \$4

The buyer exercises if $S_T < 60$. The writer **profits** if $S_T > 56$, because the writer keeps enough of the \$4 premium to cover the payout.

- Maximum gain: \$4 (the premium, if $S_T \geq 60$).
- Maximum loss: \$56 (if $S_T = 0$; the writer must pay 60 for a worthless share, partially offset by the \$4 premium).

Payoff at selected prices:

| $S_T$  | 50  | 56  | 60  | 65  | 70  |
| ------ | --- | --- | --- | --- | --- |
| Profit | -6  | 0   | +4  | +4  | +4  |

Losses below \$56, breakeven at \$56, max gain of \$4 once $S_T \geq 60$.

---

### 1.11 Trader writes a September call, strike \$20, stock \$18, premium \$2. Stock is \$25 at expiry

Assuming a standard 100-share contract:

- **May:** receive premium of $2 \times 100 = 200$, i.e. \$200.
- **September:** option exercised. Trader must deliver 100 shares at \$20 each while the market price is \$25, paying $5 \times 100 = 500$ (i.e. \$500) to close out.
- **Net cashflow:** \$200 − \$500 = −\$300.

The trader loses \$300.

---

### 1.12 Short December put, strike \$30, premium \$4. When does the trader gain?

The writer gains whenever the net payoff is positive, which is when $S_T > 30 - 4 = 26$. Above \$30 the option expires worthless and the writer keeps the full \$4. Between \$26 and \$30 the writer pays out $30 - S_T$ but still nets a positive figure thanks to the premium.

---

### 1.13 Hedging a foreign currency receivable in 4 months

The company will be **receiving** foreign currency, so it is worried about that currency **depreciating** before it can convert to its home currency. The right instrument is a **put option on the foreign currency** (equivalently, a call on the home currency). This locks in a floor exchange rate while keeping the upside if the foreign currency appreciates.

---

### 1.14 US company owes 1 million CAD in 6 months

- **(a) Forward.** Enter a long forward on CAD at the 6-month forward rate. Exchange rate is fully locked in. Certainty at the price of giving up any favourable moves.
- **(b) Option.** Buy a 6-month call on CAD (strike at an acceptable rate). Pay a premium today. If CAD rises, exercise. If CAD falls, let the option expire and buy cheaply at spot. Optionality at the price of the premium.

---

### 1.15 Short forward on 100 million yen at \$0.0090/¥

Short payoff per yen is $0.0090 - S_T$.

- **(a) $S_T = 0.0084$:** gain $= (0.0090 - 0.0084) \times 100{,}000{,}000 = 60{,}000$, or \$60,000.
- **(b) $S_T = 0.0101$:** loss $= (0.0090 - 0.0101) \times 100{,}000{,}000 = -110{,}000$, or -\$110,000.

---

### 1.16 Who uses long-term Treasury bond futures?

Three kinds of traders:

- **Hedgers.** Pension funds, insurers, and banks with large fixed-income books use them to adjust duration without transacting in the physical bonds. A bond portfolio manager worried about rising rates can short futures against the book.
- **Speculators.** Macro hedge funds and prop traders expressing a view on long-end interest rates.
- **Arbitrageurs.** Basis traders exploiting mispricings between the cheapest-to-deliver bond and the futures contract, or between the futures and the swap curve.

---

### 1.17 "Options and futures are zero-sum games"

Every gain on one side of a derivatives contract is matched by an equal loss on the other. There is no net wealth creation inside the contract itself - any dollar made by the long is a dollar lost by the short, ignoring transaction costs.

This does not mean derivatives are pointless. They **redistribute** risk to those most willing to bear it, which has real economic value. A farmer locking in a wheat price has strictly more certainty, even though the speculator on the other side now has more risk. The sum of payoffs is zero; the sum of utilities is not.

---

### 1.18 Long forward plus long put at the forward price

Consider a long forward at price $F$ and a long European put with the same maturity and strike $K = F$.

- Long forward payoff: $S_T - F$.
- Long put payoff: $\max(F - S_T, 0)$.

Adding them:

- If $S_T \geq F$: $(S_T - F) + 0 = S_T - F$.
- If $S_T < F$: $(S_T - F) + (F - S_T) = 0$.

The combined payoff is $\max(S_T - F, 0)$, which is exactly the payoff of a **long European call** struck at $F$. This is a direct illustration of put-call parity.

---

### 1.19 The Bankers Trust ICON

The ICON paid:

- If $S_T \geq 169$ (yen/USD): holder receives \$1,000.
- If $84.5 \leq S_T < 169$: holder receives $1{,}000 - 1{,}000 \times \max\!\left(0, \frac{169}{S_T} - 1\right)$ USD.
- If $S_T < 84.5$: holder receives nothing.

The adjustment term $1{,}000 \times (169 / S_T - 1)$ is positive when the yen strengthens against the dollar ($S_T < 169$). The holder loses on this move, and the loss is capped at \$1,000 (when $S_T = 84.5$ the payout has been eaten entirely).

This is exactly the payoff of:

- **A regular bond** paying \$1,000 at maturity, minus
- **A short currency option** that starts losing money for the holder once $S_T$ drops below 169, plus
- **A long currency option** that offsets any further losses once $S_T$ drops below 84.5.

Two options stacked against each other give the capped downside. In options language, the embedded structure is a **bear spread on the yen** written into the bond.

---

### 1.20 Offsetting forwards on yen

Going long a forward on 10M yen at rate $F_1$ (entered 1 July) and then short on 10M yen at rate $F_2$ (entered 1 September), both maturing 1 January:

- Long leg payoff: $10{,}000{,}000 \times (S_T - F_1)$.
- Short leg payoff: $10{,}000{,}000 \times (F_2 - S_T)$.

The $S_T$ terms cancel. Net payoff: $10{,}000{,}000 \times (F_2 - F_1)$.

This is a **locked-in profit or loss** equal to the difference in the two forward rates, regardless of where yen actually settles on 1 January. The company has effectively booked the move in the forward curve between July and September.

---

### 1.21 Arbitrage with GBP forwards and options

Spot 1.2580, 90-day forward 1.2556, 180-day forward 1.2518.

**(a) 180-day European call to buy £1 at \$1.22 costs 2¢.**

The 180-day forward is 1.2518, so at maturity pounds can be sold forward at that level. Buy the call for \$0.02 and short the 180-day forward. At expiry:

- Exercise the call: pay \$1.22, receive £1.
- Deliver into the forward: hand over £1, receive \$1.2518.
- Net: $1.2518 - 1.22 - 0.02 = 0.0118$, or \$0.0118 per pound, locked in today (subject to small funding adjustments).

Risk-free profit.

**(b) 90-day European put to sell £1 at \$1.29 costs 2¢.**

The 90-day forward is 1.2556. Buy the put and go long the forward. At expiry:

- Take delivery on the forward: pay \$1.2556, receive £1.
- Exercise the put: sell £1 for \$1.29.
- Net: $1.29 - 1.2556 - 0.02 = 0.0144$, or \$0.0144 per pound.

Again a risk-free profit. Both options are mispriced relative to the forwards.

---

### 1.22 Buying a call at \$30 for \$3 - ever exercise and still lose?

Yes. If $30 < S_T < 33$ the option has positive intrinsic value and will be exercised, but the payoff is less than the \$3 premium paid, so the total P&L is negative.

For example, at $S_T = 31$: exercise gives \$1, premium paid was \$3, net loss \$2. Exercising is still the right call - walking away would cost the full \$3, whereas exercising recovers \$1 of it.

---

### 1.23 Selling a put at strike \$40 for \$5

- **Max gain:** \$5 per share (the premium, if $S_T \geq 40$).
- **Max loss:** \$35 per share (if the stock goes to zero: pay \$40 for worthless share, offset by \$5 premium).

If it were a **call** at strike \$40 sold for \$5 instead:

- **Max gain:** still \$5 (premium kept if $S_T \leq 40$).
- **Max loss:** theoretically unbounded, since the stock can rise without limit.

---

### 1.24 "Buying a put on a stock you already own is a form of insurance"

A protective put combines a long stock position with a long put. The put pays off if the stock falls below the strike, setting a floor on the portfolio value. You pay a premium for this protection, which is analogous to an insurance premium, and the strike acts like the level at which the "policy" starts paying out. If nothing bad happens, the put expires worthless and you have simply paid the insurance cost.

---

### 1.25 Apple stock at \$316.50, September call strike \$320 at \$21.70

Two alternatives, each using 100 shares' worth of exposure:

**(a) Upfront cost:**

- 100 shares: $100 \times 316.50 = 31{,}650$, or \$31,650.
- 100 calls (one contract): $100 \times 21.70 = 2{,}170$, or \$2,170.

**(b) If $S = 400$ in September:**

- Shares: sell at \$400, gain $= 100 \times (400 - 316.50) = 8{,}350$, or \$8,350.
- Calls: exercise, gain $= 100 \times (400 - 320) - 2{,}170 = 8{,}000 - 2{,}170 = 5{,}830$, or \$5,830.

**(c) If $S = 300$ in September:**

- Shares: sell at \$300, loss $= 100 \times (300 - 316.50) = -1{,}650$, or -\$1,650.
- Calls: expire worthless, loss of \$2,170.

Shares do better in mild scenarios; options would only outperform if the stock moved much more sharply than \$400 (or on a percentage-return basis with far less capital at stake).

---

### 1.26 Dually listed stock arbitrage

NYSE price \$50 USD, TSX price \$60 CAD, FX 1 USD = 1.21 CAD.

- \$50 USD converts to \$60.50 CAD.
- The same stock is trading at \$60 CAD in Toronto, i.e. cheaper by 0.50 CAD per share.

**Arbitrage:** buy on TSX at \$60 CAD, sell on NYSE at \$50 USD (= \$60.50 CAD), profit roughly \$0.50 CAD per share, risk-free. As traders pile in, TSX demand pushes the Toronto price up and NYSE selling pushes the New York price down until the two are consistent through the FX rate. The window closes quickly.

---

### 1.27 Long forward vs long call, both to buy at \$1,000

- **Trader A (long forward at 1000):** payoff $S_T - 1{,}000$. No upfront cost. Unlimited downside if the asset collapses.
- **Trader B (long call at 1000, premium 100):** payoff $\max(S_T - 1{,}000, 0) - 100$. Breakeven at $S_T = 1{,}100$. Max loss is 100, regardless of how low the asset goes.

Payoffs at selected prices:

| $S_T$       | 800  | 900  | 1000 | 1100 | 1200 |
| ----------- | ---- | ---- | ---- | ---- | ---- |
| A (forward) | -200 | -100 | 0    | +100 | +200 |
| B (call)    | -100 | -100 | -100 | 0    | +100 |

A and B converge for high $S_T$, but A loses linearly below \$1,000 while B floors at -\$100. The \$100 premium buys the downside protection.

---

### 1.28 Short July put, stock \$42, strike \$40, premium \$3

The investor has agreed to **buy 100 shares at \$40** if the holder exercises (which happens only if $S_T < 40$ in July). In exchange, the investor received \$3 per share upfront.

- **Profitable** whenever $S_T > 37$ (the premium covers any payout required).
- **Maximum profit:** \$3 per share, kept in full if the stock stays at or above \$40.
- **Risks:** if the stock crashes, the investor is forced to buy at \$40 regardless of the market price, with maximum loss \$37 per share if the stock goes to zero.

---

### 1.29 US company owing 3 million euros in 3 months at 1.15 USD/EUR

- **Forward.** Enter a long EUR forward for 3 million. Locks the cost at $3M \times F$ (for example \$3.45M at 1.15). No upfront cost, no flexibility.
- **Option.** Buy a 3-month call on EUR with strike 1.15. Pay a premium today. If EUR ends above 1.15, exercise and buy at 1.15. If EUR ends below 1.15, let the option expire and buy cheaply at spot.

The forward is zero-cost but removes upside. The option costs a premium but lets the company participate if EUR weakens.

---

### 1.30 Bull call spread: long \$30 call at \$2.75, short \$32.50 call at \$1.50

- Net debit: $2.75 - 1.50 = 1.25$, or \$1.25 per share.
- Maximum profit: $(32.50 - 30) - 1.25 = 1.25$, or \$1.25 per share, reached when $S_T \geq 32.50$.
- Maximum loss: \$1.25 per share, if $S_T \leq 30$.
- Breakeven: $S_T = 31.25$.

This is a **bull call spread** - a moderately bullish play that caps both upside and downside. Cheaper than a naked long call and much less risky than being outright long the stock.

---

### 1.31 Gold arbitrage

Spot \$1,200, 1-year forward \$1,300, borrowing rate 3%, no storage or carry.

The no-arbitrage forward price is $1{,}200 \times 1.03 = 1{,}236$, or \$1,236. The market forward is \$1,300, which is too high.

**Strategy:**

1. Borrow \$1,200 at 3% for one year.
2. Buy one ounce of gold at spot.
3. Short one ounce of gold forward at \$1,300.

At maturity:

- Deliver the gold into the forward: receive \$1,300.
- Repay the loan: \$1,236.
- Profit: \$64 per ounce, risk-free.

---

### 1.32 Protective put vs stop-loss

Apple at \$316. A December put struck at \$290 costs \$21.30. Alternative: instruct the broker to sell if Apple trades at \$290.

**Put advantages:**

- Guaranteed floor of $290 - 21.30 = 268.70$ net per share (modulo time decay before expiry).
- Works through gaps (a put pays off even if the stock opens below \$290 overnight).
- The investor still owns the stock for any recovery.

**Stop-loss advantages:**

- No upfront cost.
- Simple to set up.

**Stop-loss disadvantages:**

- Execution risk: if Apple gaps through \$290, you may sell well below that level.
- Once triggered, you no longer hold the stock - any recovery leaves you out.

The put is better for protecting against sharp drawdowns or overnight gaps; the stop-loss is cheaper for gradual declines that the market participates in at each price level.

---

### 1.33 The Standard Oil oil-linked bond

The bond paid at maturity:

$$\text{Payoff} = 1{,}000 + 170 \times \max(0, P - 25) - 170 \times \max(0, P - 40)$$

where $P$ is the oil price at maturity.

- At $P = 25$: base \$1,000.
- At $P = 40$: $1,000 + 170 \times 15 - 0 = 1,000 + 2,550 = 3,550$. The extra \$2,550 matches the problem's cap.
- At $P = 50$: $1,000 + 170 \times 25 - 170 \times 10 = 1,000 + 4,250 - 1,700 = 3,550$ (still capped).

So the structure is:

- **A regular zero-coupon bond** paying \$1,000.
- **Plus 170 long call options on oil at strike \$25.**
- **Minus 170 short call options on oil at strike \$40.**

Together the two option legs form a long bull call spread on 170 "barrels", sitting on top of the regular bond. The investor participates in oil rallies between \$25 and \$40 but not beyond.

---

### 1.34 Treasurer's collar on £1 million

The treasurer wants:

- Rate capped at 1.25 on the upside (gives up gains above 1.25).
- Rate floored at 1.19 on the downside (protected against moves below 1.19).
- Market rate in between.

Construct a **collar**:

- **Buy a 6-month put** on £1 million with strike 1.19. If spot falls below 1.19, exercise and sell pounds at 1.19.
- **Sell a 6-month call** on £1 million with strike 1.25. If spot rises above 1.25, the call is exercised against the treasurer, who sells pounds at 1.25.
- If spot ends between 1.19 and 1.25, both options expire worthless and pounds are sold at market.

If the strikes are chosen such that the put premium equals the call premium, this is a **zero-cost collar** - the treasurer gets the desired payoff without paying anything upfront.

---

## Closing Notes

The questions above cover the bedrock of derivatives: identifying the right instrument for a given exposure, computing payoffs on forwards and options, spotting arbitrage between cash and derivative prices, and decomposing structured products into simpler pieces. The themes will recur in every later chapter of any derivatives text, with more machinery (discounting, stochastic calculus, volatility models) layered on top.

If you can answer these questions without looking anything up, you are well-placed to move on to pricing and hedging proper. If not, the best use of time is to redo the ones that felt shaky and draw out every payoff diagram by hand until the mechanics become automatic.
