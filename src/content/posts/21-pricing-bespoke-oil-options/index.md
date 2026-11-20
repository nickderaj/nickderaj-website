---
title: 'Pricing Bespoke Options on Oil Futures'
date: '2026-09-11'
description: 'Part two of the Gabillon series. How the two-factor model turns into an options book: integrated variance and the Samuelson effect, the covariance matrix along the curve, average price options, calendar spreads, factor vega, and the smile the model does not have.'
tags: ['oil', 'commodities', 'quant', 'options', 'derivatives']
audio: '/audio/21-pricing-bespoke-oil-options.mp3'
---

<table-of-contents>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#what-part-one-gives-us">What Part One Gives Us</a></li>
<li><a href="#the-only-number-that-matters">The Only Number That Matters</a></li>
<li><a href="#the-samuelson-trap">The Samuelson Trap</a></li>
<li><a href="#the-covariance-matrix">The Covariance Matrix</a></li>
<li><a href="#average-price-options-and-swaptions">Average Price Options and Swaptions</a></li>
<li><a href="#calendar-spread-options">Calendar Spread Options</a></li>
<li><a href="#vega-you-cannot-hedge">Vega You Cannot Hedge</a></li>
<li><a href="#the-smile-the-model-does-not-have">The Smile the Model Does Not Have</a></li>
<li><a href="#negative-prices">Negative Prices</a></li>
<li><a href="#interview-questions">Interview Questions</a></li>
<li><a href="#closing-notes">Closing Notes</a></li>
<li><a href="#references">References</a></li>
</table-of-contents>

---

## Introduction

[Part one](/blog/20-gabillon-oil-term-structures) built Gabillon's two-factor model of the oil futures curve and showed that the Samuelson effect - volatility rising as a contract approaches expiry - falls out of the structure rather than being assumed. That is a satisfying result on its own. It is also, commercially, only half the job.

Nobody builds a term-structure model to admire the term structure. They build it because a client wants a price on something the exchange does not list: an option on a calendar-year swap, a cap on the average of next quarter's settlements, a spread option between December and June, a three-year floor on a supply contract. Those are bespoke, they are illiquid, and the only thing standing between you and mispricing them is a model that describes the whole curve consistently.

This post is about that translation. The good news is that a two-factor Gaussian model hands you nearly everything in closed form. The bad news is that the Samuelson effect, which was an elegant result in part one, becomes an active trap the moment you price an option with it - and the trap has cost people real money.

<callout variant="note" title="Numbers in this post">
Every figure uses the same calibration as part one: spot volatility 40%, long-term volatility 10%, correlation 0.15, and a decay rate beta of 1.5 (a half-life of about five and a half months). The closed forms were checked against numerical quadrature and against Monte Carlo for European, average-price and spread payoffs.
</callout>

---

## What Part One Gives Us

Three things carry over.

**The factor structure.** The log futures price is a weighted blend of a loud spot factor and a quiet long-term factor, with the weight on spot decaying exponentially:

$$\ln F(t,T) = \ln A(\tau) + B(\tau)\ln S_t + (1 - B(\tau))\ln L_t, \qquad B(\tau) = e^{-\beta\tau}$$

**The dynamics.** Differentiating, the futures price is driftless under the pricing measure and its returns load on the two factors with weights $B$ and $1-B$:

$$\frac{dF(t,T)}{F(t,T)} = B(\tau)\,\sigma_S\,dz_1 + (1 - B(\tau))\,\sigma_L\,dz_2$$

**The volatility curve.** Squaring that gives the instantaneous volatility of a contract with $\tau$ left to run:

$$\sigma_F^2(\tau) = \sigma_S^2 B^2 + \sigma_L^2 (1-B)^2 + 2\rho\sigma_S\sigma_L B(1-B)$$

Everything below is built from those three lines. Note especially that the model is **Gaussian in logs with deterministic, time-dependent volatility**. That combination is what makes an options book tractable: it means every futures price is lognormal at every horizon, so Black's formula still applies - provided you feed it the right number.

---

## The Only Number That Matters

Here is the single most important idea in this post.

Black's formula does not take a volatility. It takes a **total variance**. We usually hide this by quoting $\sigma\sqrt{T}$, which works fine when volatility is constant, and which quietly breaks the moment it is not. Under time-dependent volatility the correct input is the integral of instantaneous variance over the life of the option:

$$V(T_o, T) = \int_0^{T_o} \sigma_F^2(u, T)\, du, \qquad d_{1,2} = \frac{\ln(F/K) \pm \tfrac{1}{2}V}{\sqrt{V}}$$

and the "Black vol" you would quote is $\sqrt{V/T_o}$ - a backward-looking average over the option's life, not the volatility of anything at any single instant.

In the two-factor model this integral is elementary, because everything in sight is an exponential. Define

$$P = \int_0^{T_o}\! e^{-2\beta(T-u)}du = \frac{e^{-2\beta(T-T_o)} - e^{-2\beta T}}{2\beta}, \qquad Q = \int_0^{T_o}\! e^{-\beta(T-u)}du = \frac{e^{-\beta(T-T_o)} - e^{-\beta T}}{\beta}$$

and the total variance is a three-term combination:

$$V(T_o,T) = \sigma_S^2 P + \sigma_L^2\big(T_o - 2Q + P\big) + 2\rho\sigma_S\sigma_L\big(Q - P\big)$$

That is the whole pricing engine for vanillas. No numerical integration, no simulation.

---

## The Samuelson Trap

Now watch what that does to the numbers, because this is where people get hurt.

<python-table src="option-vol-table"></python-table>

Read the one-year row. The one-year futures contract has an instantaneous volatility **today** of 12.7%. If you sell a one-year option on it and mark it with today's volatility, you have used 12.7%. The correct Black vol is **23.6%** - you have underpriced the option by a factor of 1.86.

Why? Because over the option's life that contract does not stay a one-year contract. It ages. It becomes an eleven-month contract, then a six-month contract, then a one-week contract, and as it ages it accelerates, exactly as the Samuelson effect says it must. The option does not experience today's volatility. It experiences the whole path of volatility from here to expiry, and that path ends at the spot volatility of 40%.

<python-figure src="option-vol-vs-instantaneous" caption="The gap is the Samuelson effect integrated. Today's instantaneous vol (orange) collapses to the long-term floor within about two years; the Black vol for an option running to that contract's expiry (blue) stays far above it, because the contract speeds up as it ages."></python-figure>

The two curves have genuinely different shapes. The instantaneous curve falls fast and flattens onto the 10% floor. The option-vol curve falls much more slowly and stays well clear of the floor even at five years, because every option, however long dated, eventually lives through the contract's violent final months.

### The other direction

Now hold the contract fixed and move the option expiry instead. Take the two-year contract and ask what an option on it is worth at different expiries.

<python-figure src="fixed-contract-option-vol" caption="Options on one fixed contract. The Black vol RISES with expiry - the opposite of the equity intuition - because a longer option captures more of the contract's high-volatility endgame."></python-figure>

A three-month option on the two-year contract prices at 10.1% vol. A near-two-year option on the same contract prices at 17.5%. **The longer option has the higher volatility.** In equities that would be strange; here it is forced, because extending the option's life pushes its window into the period where the underlying contract is becoming the front month.

This is the practical content of the Samuelson effect, and it is worth stating as a rule: in commodities, _the volatility you quote depends on two dates, not one_. Which contract, and which expiry. A single number attached to "two-year oil vol" is meaningless until you say which of those you mean.

---

## The Covariance Matrix

Vanillas need one variance. Everything bespoke needs the whole **covariance matrix** between contracts, because bespoke payoffs are almost always functions of several points on the curve at once.

The same integral generalises immediately. For two contracts maturing at $T_i$ and $T_j$, define

$$P_{ij} = \frac{e^{-\beta(T_i+T_j)}\left(e^{2\beta T_o} - 1\right)}{2\beta}, \qquad Q_i = \frac{e^{-\beta T_i}\left(e^{\beta T_o} - 1\right)}{\beta}$$

$$\text{Cov}_{ij} = \sigma_S^2 P_{ij} + \sigma_L^2\big(T_o - Q_i - Q_j + P_{ij}\big) + \rho\sigma_S\sigma_L\big(Q_i + Q_j - 2P_{ij}\big)$$

Set $i = j$ and you recover $V$ exactly. This one object - an $n \times n$ matrix you can fill in closed form in microseconds - is what prices the entire bespoke book. Every structure below is a different way of squeezing it:

<python-table src="structures"></python-table>

The correlations it implies are the interesting part:

<python-figure src="terminal-correlation" caption="Correlation between two futures at option expiry, by the gap between them. Adjacent contracts are almost perfectly correlated; the decorrelation is driven by the spot factor, which only the near contract holds much of."></python-figure>

Two features matter commercially. Adjacent months are correlated at **0.998** - they are very nearly the same asset. And correlation decays with the gap but flattens out at a high level, because both contracts still share the long-term factor entirely. Even a 24-month gap keeps correlation around 0.43 to 0.75 depending on expiry. Nothing on the oil curve is ever really independent of anything else.

---

## Average Price Options and Swaptions

The dominant bespoke structure in oil is not a European option on a futures contract. It is an option on an **average**: an average price option settling on the mean of daily or monthly fixings, or a swaption on a calendar strip. Airlines, refiners and utilities consume oil continuously, so an average is what they are actually exposed to.

An average of lognormals is not lognormal, so there is no exact formula. The standard route is moment matching: compute the first two moments of the average exactly, then fit a lognormal to them and run Black. With $n$ fixings on contracts $T_1 \dots T_n$:

$$\mathbb{E}[A] = \frac{1}{n}\sum_i F_i(0), \qquad \mathbb{E}[A^2] = \frac{1}{n^2}\sum_i \sum_j F_i(0)F_j(0)\,e^{\text{Cov}_{ij}}$$

$$\sigma_A = \sqrt{\frac{1}{T_o}\ln\frac{\mathbb{E}[A^2]}{\mathbb{E}[A]^2}}$$

Both moments are exact in the model, and the covariance matrix is the closed form above. I checked the resulting prices against a 400,000-path Monte Carlo on the joint distribution and they agree inside the simulation error.

### Why averaging buys you so little

Here is the result that surprises people coming from rates or equities.

<python-table src="strip-correlation"></python-table>

Averaging twelve monthly contracts takes the volatility from 22.4% down to 14.6%. The naive intuition - divide by the square root of twelve - would say 6.5%. The naive answer is **wrong by more than a factor of two**, because $1/\sqrt{n}$ assumes independence, and the mean pairwise correlation here is 0.951.

<python-figure src="strip-vol" caption="Strip volatility against the number of months averaged. The model (blue) tracks the simple average of the component volatilities (orange) almost exactly; the 1/√n intuition (grey) is not even close."></python-figure>

The blue and orange lines nearly coincide. That is the practical lesson: for a highly correlated curve, the volatility of the average is approximately the **average of the volatilities**, not the independent-diversification answer. Averaging in oil reduces volatility mostly because it reaches further out the curve into quieter contracts, not because the fixings diversify each other.

Getting this wrong has a direction, and it is the dangerous one. If you price a swaption with a $1/\sqrt{n}$ mental model you will sell it far too cheaply.

---

## Calendar Spread Options

A calendar spread option pays on the difference between two contracts, and the difference of two lognormals is not lognormal either - worse, it can go negative, so you cannot even force a lognormal onto it. The standard treatments are Bachelier on the spread directly, or Kirk's approximation. Either way the model supplies the inputs:

$$\text{Var}(F_2 - F_1) = F_2^2\left(e^{V_2}-1\right) + F_1^2\left(e^{V_1}-1\right) - 2F_1F_2\left(e^{\text{Cov}_{12}}-1\right)$$

<python-figure src="spread-vol" caption="Standard deviation of a calendar spread with both legs at $80, by the gap between them. The spread is enormously tighter than either leg, and the whole value of the option lives in the decorrelation."></python-figure>

With a one-year option, a one-month spread has a standard deviation of **$1.48**, while each leg individually has a standard deviation of roughly $12. Almost all of the individual risk cancels. Widen the gap to twelve months and the spread standard deviation rises to **$9.67**.

This is why calendar spread options are a pure correlation trade. Nothing else in the book is anywhere near as sensitive to the correlation assumption: a small error in $\rho$ or $\beta$ barely moves a vanilla and completely repositions a spread option. And because the model derives spread volatility from the _same_ two parameters that fit the outright curve, it enforces a consistency that quoting spread vols independently would not - you cannot accidentally mark a spread option in a way that implies a correlation above one.

---

## Vega You Cannot Hedge

An options book has vega. In a two-factor model, vega is not one number - it is a vector, with a component for each factor. And the split moves dramatically with maturity.

<python-figure src="factor-vega" caption="The share of an option's variance coming from each factor. Short-dated options are almost pure spot-factor risk; beyond about two and a half years an option is essentially a pure bet on the long-term factor's volatility."></python-figure>

A six-month option is **96%** spot-factor risk. A three-year option is **96% long-term-factor** risk. The crossover is sharp, and it sits around two years.

The consequence is uncomfortable and entirely real. Listed oil options trade actively out to about a year, occasionally two. So the instruments available for hedging vega are concentrated in exactly the region that is almost pure $\sigma_S$ risk. If you are short a five-year floor, your vega is in $\sigma_L$ - and there is essentially nothing listed that carries meaningful $\sigma_L$ vega. You can delta-hedge the position with deferred futures, but the volatility exposure cannot be recycled into the market; it sits on the book until expiry.

That is not a flaw in the model. The model is telling you something true about the market, which is that long-dated commodity volatility risk is structurally un-hedgeable and has to be warehoused and charged for. A desk that marks a ten-year floor at the one-year implied vol has mispriced it twice over: wrong level, and no recognition that the risk cannot be laid off.

---

## The Smile the Model Does Not Have

Everything above assumes lognormal returns with deterministic volatility. That model produces exactly **one** implied volatility per expiry and contract. Real oil options have a pronounced smile, usually with a fat call wing in crude (fear of supply disruption) and a fat put wing in some products.

So the model, as stated, cannot fit the options market it is meant to price against. There are three standard responses, and they trade off differently:

- **Smile on top.** Fit a SABR or an interpolated surface per expiry to the listed options, and use the two-factor model only for the term structure and the correlations. Cheap, standard, and inconsistent - the smile and the factor model are two separate objects that can disagree about the same trade.
- **Stochastic volatility on the front factor.** Let $\sigma_S$ itself be stochastic. This is the principled fix, it preserves the factor structure, and it costs you the closed forms; almost everything becomes Monte Carlo.
- **Local volatility on the spot factor.** Replace the constant $\sigma_S$ with a function of the spot factor's level, calibrated to today's smile. Keeps a lot of tractability, but inherits the usual criticism that local vol produces unrealistic forward smile dynamics.

For a book dominated by Asians and spreads rather than far-strike digitals, the first option is usually what desks actually run, because those payoffs are much more sensitive to correlation and to the term structure of at-the-money vol than they are to the wings.

---

## Negative Prices

The lognormal assumption has one more failure mode, and it stopped being hypothetical in April 2020 when WTI settled at minus \$37.

Every formula in this post breaks at or below zero: $\ln F$ is undefined, and Black's formula cannot produce a price. Two standard repairs, both mentioned at the end of part one:

**Displaced lognormal.** Model $F + a$ as lognormal for a shift $a$ large enough to cover the worst plausible negative price. All the closed forms survive with strikes shifted by the same amount, and the covariance machinery is untouched. The cost is an extra, essentially unobservable parameter that materially affects deep out-of-the-money puts.

**Bachelier.** Model the price level as Gaussian. Negative prices arise naturally, and the exchanges switched to Bachelier for crude options in 2020 for exactly this reason. The awkwardness is that the factor structure was derived in logs, so you would be re-deriving the model rather than adjusting it.

Worth noting which parts of this post actually depend on lognormality: the vanilla formula and the moment matching do; the covariance structure does not. The statement "adjacent contracts correlate at 0.998, and correlation decays with the gap at a rate set by beta" is about the factor structure, and it survives any change of distributional assumption.

---

## Interview Questions

### 1. Why can't you use today's volatility to price an option on an oil future?

Because the contract's volatility is not constant over the option's life - the Samuelson effect guarantees it rises as the contract approaches expiry. Black's formula needs the integral of instantaneous variance over the option's life, not a snapshot. With the calibration used here, a one-year option on the one-year contract needs 23.6% while that contract's volatility today is 12.7%. Using today's number underprices the option by 86%.

---

### 2. Define integrated variance, and say why it is the right input.

$V = \int_0^{T_o}\sigma_F^2(u,T)\,du$. It is the variance of the terminal log price, which is the only thing Black's formula actually depends on. Under constant volatility it collapses to $\sigma^2 T_o$ and the distinction is invisible; under any term structure of volatility it is the correct generalisation, and the quoted "Black vol" is just $\sqrt{V/T_o}$ - an average over the option's life, not a volatility at any instant.

---

### 3. An option on a fixed deferred contract: does its volatility rise or fall as you extend the expiry?

It rises. This catches people out, because equity intuition says longer options have more time for volatility to mean-revert downward. Here, extending the expiry pushes the option's window further into the contract's high-volatility endgame. On the two-year contract, a three-month option prices at 10.1% and a near-two-year option at 17.5%.

---

### 4. So what does "two-year oil volatility" mean?

Nothing, until you say which two dates you mean. There are at least three different numbers in play: the instantaneous volatility of the two-year contract today (10.0%), the Black vol of an option expiring in two years on the contract that expires then (18.4%), and the Black vol of a two-year option on some other contract. Commodity volatility is indexed by both option expiry and contract maturity, and conflating them is one of the most common errors in commodity interviews.

---

### 5. Walk me through pricing an Asian option in this model.

Compute the covariance matrix between all the fixing contracts to the averaging dates using the closed form. Compute the first moment of the average, which is just the average of the forwards, and the second moment, which is the double sum of $F_iF_j e^{\text{Cov}_{ij}}$. Match a lognormal to those two moments to get an effective volatility, then run Black on the average with that volatility and the forward average as the underlying. That is Turnbull-Wakeman, with the covariance coming from the factor model rather than from an assumed flat vol.

---

### 6. When does moment matching break down?

When the distribution of the average is genuinely far from lognormal. Two cases matter. Long averaging windows spanning very different volatility regimes - the front of the strip may be three times as volatile as the back, so a single lognormal fits the middle and misses both tails. And deep out-of-the-money strikes, where you are pricing off a tail that the second moment does not pin down. For those, go to Monte Carlo, or use a three-moment fit. For at-the-money Asians on a correlated curve it is accurate to well within bid-offer.

---

### 7. Why is a swap less volatile than the futures it averages, and by how much?

Because averaging cancels some independent variation - but far less than you would guess. With twelve monthly contracts the volatility falls from 22.4% (front contract) to 14.6%. The $1/\sqrt{n}$ answer would be 6.5%, and it is wrong because it assumes independence: the mean pairwise correlation across the strip is 0.951. In a highly correlated curve the volatility of the average is close to the average of the volatilities. Most of the reduction comes from reaching out to quieter deferred contracts, not from diversification.

---

### 8. What is the risk of pricing a swaption with the $1/\sqrt{n}$ intuition?

You sell it far too cheaply, by roughly a factor of two on a twelve-month strip. The error is systematically in one direction because correlation can only make the average _more_ volatile than the independent case, never less. It is the commodity equivalent of assuming a portfolio of correlated stocks diversifies like a portfolio of independent ones.

---

### 9. How do you price a calendar spread option?

The spread can be negative, so a lognormal model is unavailable. Use Bachelier with the spread's absolute variance, or Kirk's approximation which treats the spread as approximately lognormal around the ratio. The variance comes from the model: $F_2^2(e^{V_2}-1) + F_1^2(e^{V_1}-1) - 2F_1F_2(e^{\text{Cov}_{12}}-1)$. The whole value is in the cross term - the less correlated the legs, the wider the spread distribution and the more the option is worth.

---

### 10. Why are calendar spread options so sensitive to model parameters?

Because they price the residual after a near-total cancellation. With a one-year expiry and a one-month gap, each leg has a standard deviation around \$12 and the spread has \$1.48; you are trading the roughly 10% that doesn't cancel. A correlation assumption that moves from 0.998 to 0.99 barely registers on a vanilla and changes the spread variance materially. In this model the sensitivity funnels into $\beta$, since $\beta$ controls how fast the factor loadings separate with maturity - which means CSO prices are, in effect, the market's opinion about $\beta$.

---

### 11. How does the Samuelson effect show up in a spread option, as opposed to an outright?

Two ways that pull in opposite directions. The near leg is more volatile than the far leg, which widens the spread. But the two legs are also highly correlated, which narrows it. The net effect is that spread volatility is driven by the _difference_ in factor loadings, $B(\tau_1) - B(\tau_2)$, rather than by the levels. This is a nice diagnostic: a model can get outright volatilities right and spreads badly wrong if it has the wrong decay shape, because outrights see $B$ and spreads see the derivative of $B$.

---

### 12. Your book is short a five-year floor. Where is the vega and can you hedge it?

The vega is almost entirely in the long-term factor - at five years the spot factor contributes essentially none of the variance. Listed options go out to about a year and are 90%-plus spot-factor risk, so there is no listed instrument carrying meaningful long-factor vega. You can hedge the delta with deferred futures, but the volatility exposure has to be warehoused. Correctly, that means charging a premium for the un-hedgeable risk and setting a limit on how much of it the book carries.

---

### 13. What is factor vega and why is it better than bucketed vega?

Bucketed vega perturbs the implied volatility of each expiry separately, which in a model with two driving factors double-counts: those buckets are not independent, since a change in $\sigma_S$ moves every bucket at once in a specific pattern. Factor vega instead reports sensitivity to $\sigma_S$, $\sigma_L$ and $\rho$ - the parameters that actually move. It is a smaller, orthogonal risk vector that maps directly onto hedges, and it prevents the illusion of diversification you get when a book appears to be long one bucket and short another when it is really long one factor.

---

### 14. The model produces no smile. Does that make it useless for an options book?

No, but it decides how you use it. It means the two-factor model is a _term structure and correlation_ engine, not a strike engine. For Asians, swaptions and spreads - most of the bespoke book - the dominant sensitivities are to the at-the-money term structure and the correlation, both of which the model gets right. For digitals and far-strike barriers the smile dominates and you need a smile model. The usual production setup keeps the factor model for curve consistency and overlays a calibrated smile per expiry, accepting the inconsistency as the price of tractability.

---

### 15. How would you calibrate the model for an options book, as opposed to a curve?

Fit to the volatility surface, not just the price curve. Take at-the-money implied volatilities across listed expiries, convert each to a total variance, and fit $\sigma_S$, $\sigma_L$, $\rho$ and $\beta$ by least squares against the model's $V(T_o,T)$. Weight by liquidity and by vega, because a fitting error on a contract nobody trades costs nothing. Then check the implied calendar spread volatilities against any CSO market you can see - that is an independent test of $\beta$ that the outright fit does not provide.

---

### 16. Why fit to integrated variance rather than to implied vols directly?

Because variances add and volatilities don't. Total variance is linear in the underlying model quantities, so the fit is better behaved numerically, and errors have a consistent interpretation across maturities. Fitting implied volatilities directly weights short expiries far too heavily, since a given variance error shows up as a much larger volatility error when divided by a small $T_o$.

---

### 17. If the futures price is a martingale, why is there any drift in the option pricing at all?

There isn't, and that is the point. Under the pricing measure the futures price has zero drift - part one derived the pricing equation and showed it has no discounting term for exactly this reason. So $F(0,T)$ is already the expected terminal price, Black's formula takes it as the forward directly, and the only thing you have to supply is the variance. All the modelling effort goes into the second moment; the first moment is handed to you by the market curve.

---

### 18. How do you Monte Carlo this model efficiently for a path-dependent payoff?

Don't discretise the SDE. Because the model is Gaussian with deterministic volatility, you can build the exact covariance matrix of the log prices at all the dates and contracts you need, Cholesky it once, and draw the whole joint distribution in a single step per path. There is no time-stepping error, and no need for small steps. That is what I used to verify the closed forms here: 400,000 exact draws rather than a stepped simulation, and the prices matched the analytic answers inside Monte Carlo error.

---

### 19. What are the main risks in running this model in production?

Four. The smile gap, discussed above. Parameter instability - part one showed $\beta$ blowing up in months with a strong short-term dislocation, and an option book repriced on an unstable $\beta$ will show phantom P&L. The un-hedgeable long-dated vega, which is a limits and capital question more than a modelling one. And the lognormal floor at zero, which is fine until it isn't.

---

### 20. If you could add one thing to this model for an options desk, what would it be?

Stochastic volatility on the spot factor. It is the single change that addresses the biggest gap - the missing smile - without abandoning the factor structure that makes the correlations and the term structure right. You lose the closed forms, but the exact-simulation trick above survives in a modified form, and the resulting model prices both the surface and the curve from one consistent set of dynamics. Adding a third mean-reverting factor is the alternative, but that improves the fit to the term structure of volatility rather than to the smile, and the term structure is the part this model already handles well.

---

## Closing Notes

The thing worth carrying away from part one was that the Samuelson effect is structural: it is what a two-factor curve model produces, not what it assumes. The thing worth carrying away from this one is that the same structure has a price attached.

Every result here came from a single object - the integrated covariance matrix between futures log-returns - and that object is available in closed form. Vanillas take its diagonal. Asians and swaptions take the whole thing through two moments. Spreads take a three-element combination of it. Factor vega is its derivative with respect to the parameters. One matrix, one calibration, a whole book priced consistently.

And the trap is worth repeating, because it is specific and it is expensive. The volatility of an oil option is indexed by two dates, not one. Today's instantaneous volatility is not the option's volatility, correlated averages do not diversify like independent ones, and long-dated vega has nowhere to go. Each of those is a direct consequence of the cantilever picture from part one, and each of them costs real money when it is ignored.

---

## References

- Gabillon, J. (1991). _The Term Structures of Oil Futures Prices_. Oxford Institute for Energy Studies, WPM 17.
- Black, F. (1976). "The Pricing of Commodity Contracts". _Journal of Financial Economics_, 3(1-2).
- Samuelson, P. A. (1965). "Proof That Properly Anticipated Prices Fluctuate Randomly". _Industrial Management Review_, 6(2).
- Turnbull, S. M. and Wakeman, L. M. (1991). "A Quick Algorithm for Pricing European Average Options". _Journal of Financial and Quantitative Analysis_, 26(3).
- Kirk, E. (1995). "Correlation in the Energy Markets", in _Managing Energy Price Risk_. Risk Publications.
- Margrabe, W. (1978). "The Value of an Option to Exchange One Asset for Another". _Journal of Finance_, 33(1).
- Clewlow, L. and Strickland, C. (2000). _Energy Derivatives: Pricing and Risk Management_. Lacima.
- Schwartz, E. S. and Smith, J. E. (2000). "Short-Term Variations and Long-Term Dynamics in Commodity Prices". _Management Science_, 46(7).
- Longstaff, F. A. and Schwartz, E. S. (2001). "Valuing American Options by Simulation: A Simple Least-Squares Approach". _Review of Financial Studies_, 14(1).
