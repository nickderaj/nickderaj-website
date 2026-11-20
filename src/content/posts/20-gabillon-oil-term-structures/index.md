---
title: 'Oil Futures Term Structures: Gabillon, Samuelson, and 40+ Interview Questions'
date: '2026-09-09'
description: "A walkthrough of Jacques Gabillon's 1991 two-factor model of oil futures prices - spot, a stochastic long-term price, and a convenience yield driven by their ratio - followed by a long bank of interview questions and answers on convenience yield, term structure, and the Samuelson effect."
tags: ['oil', 'commodities', 'quant', 'interviews']
audio: '/audio/20-gabillon-oil-term-structures.mp3'
---

<table-of-contents>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#the-model-in-one-page">The Model in One Page</a></li>
<li><a href="#why-cost-of-carry-is-not-enough">Why Cost of Carry Is Not Enough</a></li>
<li><a href="#the-two-factor-model">The Two-Factor Model</a></li>
<li><a href="#the-volatility-term-structure">The Volatility Term Structure</a></li>
<li><a href="#what-the-data-said">What the Data Said</a></li>
<li><a href="#part-1-foundations">Part 1: Foundations</a></li>
<li><a href="#part-2-the-two-factor-model">Part 2: The Two-Factor Model</a></li>
<li><a href="#part-3-the-samuelson-effect">Part 3: The Samuelson Effect</a></li>
<li><a href="#part-4-calibration-and-empirics">Part 4: Calibration and Empirics</a></li>
<li><a href="#part-5-comparisons-limits-and-extensions">Part 5: Comparisons, Limits, and Extensions</a></li>
<li><a href="#rapid-fire-round">Rapid-Fire Round</a></li>
<li><a href="#closing-notes">Closing Notes</a></li>
<li><a href="#references">References</a></li>
</table-of-contents>

---

## Introduction

Jacques Gabillon wrote _The Term Structures of Oil Futures Prices_ at the Oxford Institute for Energy Studies in 1991, on secondment from Elf Trading. The timing matters: the paper was written either side of the Iraqi invasion of Kuwait, when the front NYMEX WTI contract went from \$15.30 to \$38.69 a barrel while the last contract on the board moved from \$19.78 to \$24.99. That single observation - the front end doing four times the work of the back end - is the entire motivation for the model.

The problem Gabillon was trying to solve was commercial, not academic. Banks and oil companies were selling long-dated swaps, oil-linked bonds, and option warrants on WTI. Pricing those instruments reduces to knowing the term structure of futures prices _and_ the term structure of volatilities, and the exchange only gave you both out to a couple of years at best. You either extrapolate the curve by hand, or you build a model with few enough parameters that you can trust it beyond the last traded maturity. Gabillon built the model.

This post does two things. The first half walks through the model itself - the state variables, the PDE, the closed-form solution, and the volatility term structure it implies - with charts generated from the model's own formulas. The second half is a long bank of interview questions and answers built on the paper and on the Samuelson effect, the kind of thing that gets asked in commodities quant and trading interviews. The Q&A is meant to be reusable as a study sheet: each question stands alone.

<callout variant="note" title="Notation">
Throughout, S is the spot price, L the long-term price, F the futures price, t current time, T maturity, and &tau; = T &minus; t the time to maturity. r is the risk-free rate, Cc the marginal cost of carry, and Cy the marginal convenience yield.
</callout>

---

## The Model in One Page

Two state variables, both lognormal diffusions:

$$\frac{dS}{S} = \mu_S \, dt + \sigma_S \, dz_1, \qquad \frac{dL}{L} = \mu_L \, dt + \sigma_L \, dz_2, \qquad dz_1 dz_2 = \rho \, dt$$

A convenience yield that is a function of the two state variables rather than a third factor:

$$C_y(S, L, t) = \beta(t) \ln\!\left(\frac{S}{L}\right) + \delta(t)$$

Two boundary conditions - the futures price is the spot price at expiry, and the long-term price at infinite maturity:

$$F(S, L, T, T) = S, \qquad \lim_{T \to \infty} F(S, L, t, T) = L$$

And, with constant parameters, a closed-form solution:

$$F(S, L, \tau) = A(\tau) \, S^{B(\tau)} \, L^{1 - B(\tau)}, \qquad B(\tau) = e^{-\beta \tau}$$

$$\ln A(\tau) = \frac{v}{4\beta} B(\tau)\big(1 - B(\tau)\big), \qquad v = \sigma_S^2 + \sigma_L^2 - 2\rho\sigma_S\sigma_L$$

That is the whole model. The futures price is a geometric weighted average of spot and the long-term price, the weight decaying exponentially with maturity, plus a small convexity correction. Everything below is either the derivation, the consequences, or the caveats.

<python-table src="model-symbols"></python-table>

---

## Why Cost of Carry Is Not Enough

Start with the simplest possible model. Assume oil is a traded asset, storage costs a constant $C_c$ per unit per unit time, and the spot price follows a lognormal diffusion. Build a riskless portfolio of physical oil plus futures, force its return to $r$, and you get:

$$F(S, \tau) = S \, e^{(r + C_c)\tau}$$

This model is useless for oil, in three separate ways:

1. **It cannot produce backwardation.** Both $r$ and $C_c$ are positive, so the curve must slope upwards. NYMEX WTI was in backwardation most of the time.
2. **It has no long end.** $F \to \infty$ as $\tau \to \infty$.
3. **It has a flat volatility curve.** Differentiating, the futures volatility equals the spot volatility at every maturity. The market shows volatility falling sharply with maturity.

Adding a constant convenience yield $C_y$ - a flow of services that accrues to the holder of physical oil but not to the holder of a paper contract - fixes the first problem:

$$F(S, \tau) = S \, e^{(r + C_c - C_y)\tau}$$

Now the sign of $r + C_c - C_y$ decides contango versus backwardation, which is the classic theory-of-storage result. But problems 2 and 3 survive, and a new one appears: the model flips discontinuously between $F \to \infty$ and $F \to 0$ as the sign flips, and $\partial F / \partial S > 1$ in contango, meaning deferred contracts should move _more_ than spot. The market says the opposite.

---

## The Two-Factor Model

### The cantilever

Gabillon's mental model is a cantilever: a beam fixed at one end, free at the other. A force applied at the free end produces maximum deflection there, decaying to zero at the fixed end. The free end is the spot price, where the physical market applies the shocks. The fixed end is the long-term price of oil - the price of a contract for delivery at infinite maturity, which nobody trades, so it has to be inferred from the contracts that do trade.

The analogy is deliberately temporary. Two things break it. First, deformation travels along a real beam at finite speed; in an efficient futures market the whole curve reprices at once, so there are no waves in the term structure - only lags in how participants interpret news. Second, the fixed end is not actually fixed: curves observed on different dates with nearly identical spot prices have visibly different shapes, which means the long end has a life of its own. So $L$ becomes stochastic, with a volatility well below $\sigma_S$.

### From SDEs to a PDE

Take $F = F(S, L, t, T)$ and apply Itô's lemma in two dimensions:

$$dF = F_S \, dS + F_L \, dL + F_t \, dt + \tfrac{1}{2}F_{SS}(dS)^2 + \tfrac{1}{2}F_{LL}(dL)^2 + F_{SL} \, dS \, dL$$

Build a portfolio of three futures contracts with different maturities, choose the weights so it is riskless, and impose that a futures position requires no investment and therefore earns nothing. That forces a linear relationship between the drift and the two diffusion coefficients, with maturity-independent coefficients $\lambda_S$ and $\lambda_L$ - the market prices of spot and long-term price risk. Since oil is assumed traded, a portfolio of physical oil hedged with futures pins $\lambda_S$ to the cost of carry and convenience yield. Taking the limit of the no-arbitrage relation as $T \to \infty$ pins $\lambda_L$ too: the boundary condition $F \to L$ forces market participants to price long-term risk _as if_ a contract for delivery at infinite time were traded.

What comes out is:

$$(r - C_y) S F_S + \tfrac{1}{2}\sigma_S^2 S^2 F_{SS} + \tfrac{1}{2}\sigma_L^2 L^2 F_{LL} + \rho \sigma_S \sigma_L S L F_{SL} + F_t = 0$$

<callout variant="important" title="No discounting term">
There is no &minus;rF term. A futures price is not the value of a traded asset - it is the quote at which a contract of zero current value can be entered, marked to market daily. Writing &minus;rF into this PDE is one of the most common slips in interviews; it is the forward-contract-value PDE, not the futures-price PDE.
</callout>

### Solving it

Guess $F = A(t,T) \, S^{B(t,T)} \, L^{1 - B(t,T)}$. Then $S F_S = BF$, $S^2 F_{SS} = B(B-1)F$, $L^2 F_{LL} = -B(1-B)F$, $SL F_{SL} = B(1-B)F$, and $F_t = F\left[\frac{A_t}{A} + B_t \ln(S/L)\right]$. Substituting and collecting the second-order terms into $\tfrac{1}{2} v B(B-1)$ with $v = \sigma_S^2 + \sigma_L^2 - 2\rho\sigma_S\sigma_L$, the PDE separates into two ordinary differential equations:

$$B_t - \beta(t) B = 0, \qquad A_t + (r - \delta(t)) A B + \tfrac{1}{2} v A B (B - 1) = 0$$

The first, with $B(T,T) = 1$, gives $B(\tau) = e^{-\beta\tau}$ for constant $\beta$; note $B \to 0$ as $\tau \to \infty$, which is exactly the second boundary condition. Integrating the second and imposing $\lim_{T\to\infty} A = 1$ fixes the constant part of the convenience yield:

$$\delta = r - \frac{v}{4} \quad \Longrightarrow \quad \ln A(\tau) = \frac{v}{4\beta} e^{-\beta\tau}\big(1 - e^{-\beta\tau}\big)$$

The interest rate cancels out of the futures price entirely. It is absorbed into the level of the convenience yield, which is what you would expect: in a storable commodity the financing cost and the convenience of holding inventory are two sides of the same carry.

The curve shapes fall straight out of the relative level of $S$ and $L$:

<python-figure src="term-structure-shapes" caption="Spot above the long-term price gives backwardation; spot below gives contango. Both curves converge to L, and the speed of convergence is set by β."></python-figure>

<python-figure src="beta-curve-shapes" caption="β is the only shape parameter in the simple model. Its half-life, ln(2)/β, is how long it takes a futures contract to be half spot and half long-term price."></python-figure>

### Adding a short-term shock

The constant-$\beta$ model cannot produce curves with an inflection point or a local minimum - and in January and February 1991 the WTI curve was backwardated at the front and in strong contango further out. Gabillon's fix is to let the constant part of the convenience yield decay from a shock:

$$\delta(t) = \delta + \theta e^{-\eta t}$$

$\theta$ is the amplitude of a physical-market shock at $t = 0$ and $1/\eta$ its characteristic time. The closed form survives, picking up one extra term:

$$\ln A(\tau) = \frac{v}{4\beta}B(1-B) - \theta \, \frac{e^{-\eta\tau} - e^{-\beta\tau}}{\beta - \eta}$$

<python-figure src="short-term-shock-backwardation" caption="A negative shock (θ = −0.3, η = 2) lifts the front of a backwardated curve without touching the long end."></python-figure>

<python-figure src="short-term-shock-contango" caption="With S barely above L, a positive shock pushes the front below the long-term price and produces a curve with a local minimum - a shape the constant-β model simply cannot draw."></python-figure>

---

## The Volatility Term Structure

Because $\ln F$ is a fixed linear combination of $\ln S$ and $\ln L$, the instantaneous variance of the futures price is a quadratic form in the weight $B$:

$$\sigma_F^2(\tau) = \sigma_S^2 B^2 + \sigma_L^2 (1 - B)^2 + 2\rho\sigma_S\sigma_L B(1 - B), \qquad B = e^{-\beta\tau}$$

At $\tau = 0$ this is $\sigma_S$; as $\tau \to \infty$ it is $\sigma_L$. The Samuelson effect is not assumed anywhere - it is a structural consequence of the front of the curve loading on a volatile factor and the back loading on a quiet one.

<python-figure src="spot-factor-weight" caption="B(τ) is the elasticity of the futures price to the spot price. A one-year contract with β = 1.5 is only 22% spot."></python-figure>

<python-figure src="volatility-term-structure" caption="Volatility term structures for different correlations. With ρ negative the curve undershoots σL and recovers - the two factors partially cancel at intermediate maturities."></python-figure>

<python-table src="vol-term-structure"></python-table>

The comparison worth internalising is what the second factor buys you. A one-factor geometric Brownian motion gives a flat volatility curve, which is wrong. A one-factor mean-reverting spot gives $\sigma_S e^{-k\tau}$, which decays to zero - so a five-year swap would have essentially no volatility and no hedging demand, which is also wrong. The two-factor model decays to a floor:

<python-figure src="samuelson-comparison" caption="Three models of the same market. Only the two-factor version reproduces both the steep front-end decay and the nonzero long-dated volatility that the market actually prices."></python-figure>

---

## What the Data Said

Gabillon fitted the simplified model to daily NYMEX WTI settlement prices from 1 June 1989 to 28 February 1991, dropping days with limit-up or limit-down contracts, and using every published settlement regardless of liquidity. $L$ is not observable, so he estimated it two ways: first by treating it as constant within each calendar month and fitting the whole curve, then by extrapolating a daily series from the shape of the traded curve at its far end using $f(\tau) = a_1 + a_2 e^{-a_3 \tau}$ matched to the level, slope, and curvature of the observed structure.

<python-table src="empirical-parameters"></python-table>

Three things stand out. The long-term price is far less volatile than spot under the monthly method (17.6% against 46.4%), which is the empirical content of the cantilever. The daily extrapolation is noisier - it depends on a second derivative estimated from the illiquid tail of the curve, and eight days out of 423 had to be interpolated away - which inflates both $\sigma_L$ and $\rho$. And $\beta$ is reasonably stable in normal markets but blows up in April-May 1990 and January-February 1991, exactly the periods when a strong short-term effect was present and the simple model had no way to represent it.

---

## Part 1: Foundations

### 1. What is the main objective of Gabillon's paper, and how is the model structured?

The objective is practical: build a model of the term structures of oil futures prices _and_ volatilities that rests on few enough assumptions to be trusted beyond exchange-traded maturities, so that long-dated swaps, oil-linked bonds, and warrants can be priced and hedged consistently.

The structure is a two-factor diffusion model. The state variables are the spot price $S$ and a long-term price $L$, defined as the price of a contract for delivery at infinite maturity. The convenience yield is not a third factor: it is specified as a function $C_y(S, L, t)$ of the two state variables and time. Because $S$ and $L$ are stochastic, the resulting convenience yield is stochastic too - but it introduces no new source of randomness, which is exactly what buys the closed-form solution.

---

### 2. Why is a convenience yield needed on top of cost of carry?

In a pure cost-of-carry world, $F(S,\tau) = S e^{(r + C_c)\tau}$. Since $r$ and $C_c$ are both positive, the curve can only be in contango, and the price of an infinitely deferred contract is infinite. Crude oil is in backwardation a large fraction of the time, so the model is falsified by the first curve you look at.

The convenience yield is the flow of services that accrues to the owner of physical inventory but not to the owner of a contract for future delivery: the ability to meet an unexpected surge in demand, to keep a refinery running through a supply disruption, to avoid stock-out costs. Treated as a continuous dividend yield on the commodity, it changes the carry relation to $F(S,\tau) = S e^{(r + C_c - C_y)\tau}$, and backwardation becomes the perfectly ordinary case where the convenience of holding barrels exceeds the cost of holding them.

---

### 3. Define backwardation and contango, and explain how the model produces both.

Backwardation is when the spot price stands at a premium to futures prices; contango is the reverse. In the constant-convenience-yield model the sign of $r + C_c - C_y$ decides which, with all the defects described above.

In the two-factor model the state is decided by the position of $S$ relative to $L$. Because the convenience yield is increasing in $\ln(S/L)$, a spot price above the long-term price means a high convenience yield and a downward-sloping curve; a spot price below it means a low convenience yield and an upward-sloping curve. Both converge to the same finite $L$, so there is no discontinuity when the market flips states - the crossing of $S$ and $L$ _is_ the flip. This also explains the apparent mean reversion of the curve: the long-term price provides the limit level around which the state changes, and cycles in the spot price drive the market back and forth across it.

---

### 4. What exactly goes wrong with the constant-convenience-yield model?

Three things, and it is worth being able to list them cleanly:

- **Long-maturity behaviour.** In contango $F \to \infty$, in backwardation $F \to 0$, and the model jumps discontinuously between the two as the sign of $r + C_c - C_y$ flips. Neither limit is consistent with a market that prices five-year oil in a narrow band.
- **Spot sensitivity.** $\partial F / \partial S = e^{(r + C_c - C_y)\tau}$, which exceeds 1 in contango. Deferred contracts would have to move more than spot. Observation says deferred contracts move far less.
- **Volatility.** Since $F$ is proportional to $S$, $\sigma_F = \sigma_S$ at every maturity. The observed volatility curve slopes down steeply.

---

### 5. The theory of storage says convenience yield falls as inventories rise. In February 1991 world crude stocks were at ten-year highs and the market was in steep backwardation. How?

Because "inventory" is not one number. What matters is availability to the marginal consumer, not the global total. In early 1991, commercial stocks - the ones a refiner can actually call on - were low relative to normal, while producer states held large floating stocks near consumer centres that were not freely available to the market. Supply was tight where it counted.

There is a second point in the same answer. The term structure reflects not just the current convenience yield but its expected path. At the beginning of 1991 the market was pricing the risk that the Gulf war would cause long-lasting disruption to supply from the region, and that expectation produces backwardation whatever today's stock level is. The honest general statement is that a large convenience yield expresses a preference for barrels now over barrels later, whatever the reason.

---

### 6. Is the convenience yield observable? How would you get a number for it?

Not directly. It is a residual: whatever you need to add to the carry relation to reconcile the observed curve with the cost of financing and storing oil. That makes it model-dependent, and the model you use to extract it matters.

The common shortcut - implying $\delta$ from two nearby contracts via $F = S e^{(r - \delta)\tau}$ - has two problems Gabillon points out. It imports a formula derived under _non-stochastic_ convenience yield into a setting where you intend to treat convenience yield as stochastic, and it inherits the discontinuities of the nearby contract: the time to delivery of the front contract cycles between a few days and a month, so week-on-week changes in the implied yield mix genuine information with the roll. In the two-factor model you instead recover the whole implied convenience-yield term structure from the fitted $A(0,T)$ and $B(0,T)$ functions, which are estimated from the full curve and the volatility curve rather than from two points.

---

### 7. Is oil a traded asset, and why does the question matter?

It matters because it determines whether the expected growth rate of the spot price enters the pricing of a futures contract. If physical oil is a traded asset that can be bought, stored, and sold, then a hedged portfolio of oil and futures must earn $r$, the market price of spot risk is pinned down by the carry relation, and $\mu_S$ is irrelevant to futures pricing. If it is not - the usual objection is that commodities are held for consumption, not investment - then the market price of spot risk is a free parameter and the drift matters.

Gabillon's models assume it is traded, but Section 4.4 shows the assumption is not load-bearing. Rebuild the model with a mean-reverting spot, no convenience yield at all, and an explicit market price of spot risk $\lambda_S$, and you get back essentially the same closed form. The lesson is that the convenience yield and the expected growth rate of the spot price play the same role: the model needs _something_ that pulls the front end back toward the long end, and it does not much care what you call it.

---

## Part 2: The Two-Factor Model

### 8. Why use a long-term price $L$ as the second state variable instead of a stochastic convenience yield?

Three reasons, in order of weight.

**It matches what the data does.** Deferred WTI contracts are far quieter than nearby ones, and curves observed at different times with almost identical spot prices have visibly different shapes. That second fact rules out a one-factor model and points to a slow-moving anchor at the long end. Treating that anchor as a state variable captures exogenous news that moves long-run expectations - a major discovery, a structural demand shift - without any visible effect on the prompt physical market.

**It makes the convenience yield endogenous.** In Gibson-Schwartz the convenience yield mean-reverts on its own schedule, so a stable spot price implies a convenience yield drifting back to its long-run mean for no economic reason. In Gabillon the convenience yield rises and falls with $S/L$, which is what the market looks like: backwardation builds as prices spike and unwinds as they fall.

**It is tractable.** Because the convenience yield is a function of the existing state variables rather than a third Brownian motion, the pricing PDE admits a closed-form solution.

---

### 9. What is the cantilever analogy, and where does it break down?

A cantilever is a beam fixed at one end and free at the other. A force at the free end deflects it most there, with the deflection decaying to zero at the fixed end. Map the free end to the spot price and the fixed end to the long-term price and you have a picture of how a shock to the physical market propagates along the curve. A useful detail of the analogy: as time passes, a given contract slides along the beam toward the free end, which is why there is no discontinuity in the term structure at expiry even though the individual contract series jumps.

It breaks in two places. Deformation propagates along a real beam at finite speed, whereas an efficient futures market reprices all maturities simultaneously - so you should not build waves into the dynamics of the curve, only lags in interpretation. And the fixed end is not fixed: the long-term price has its own stochastic dynamics, which is precisely the extension that makes the model interesting.

---

### 10. Write down the dynamics of $S$ and $L$.

Both follow correlated diffusions, and under the lognormal-stationary assumption:

$$\frac{dS}{S} = \mu_S(S,t) \, dt + \sigma_S \, dz_1, \qquad \frac{dL}{L} = \mu_L(L,t) \, dt + \sigma_L \, dz_2, \qquad dz_1 dz_2 = \rho \, dt$$

Neither drift needs to be specified: under the traded-asset assumption for $S$ and the limiting no-arbitrage condition for $L$, both expected growth rates drop out of the futures price. The parameters that matter are $\sigma_S$, $\sigma_L$, $\rho$ and - through the convenience yield - $\beta$. Empirically $\sigma_S \gg \sigma_L$ and $\rho$ is positive but well below 1.

---

### 11. Derive the futures pricing PDE.

Write $F = F(S, L, t, T)$ and apply Itô:

$$dF = F_S dS + F_L dL + F_t dt + \tfrac{1}{2}F_{SS}(dS)^2 + \tfrac{1}{2}F_{LL}(dL)^2 + F_{SL} \, dS \, dL$$

Substituting the SDEs gives $dF = \alpha \, dt + \gamma_1 dz_1 + \gamma_2 dz_2$. Now form a portfolio of three futures contracts with maturities $T_1, T_2, T_3$ and choose the weights so that both Brownian terms vanish. The portfolio is riskless and requires no investment, so its drift must be zero. Doing this for all triples of maturities forces the maturity-independent linear relation

$$\alpha = \lambda_S \gamma_1 + \lambda_L \gamma_2$$

where $\lambda_S$ and $\lambda_L$ are the market prices of spot and long-term price risk, common to every contract. Next, hedge one unit of physical oil with futures: that portfolio earns $r$, costs $C_c$ to carry, and throws off $C_y$, which pins $\lambda_S$. Finally, taking $T \to \infty$ in the no-arbitrage relation and imposing $F \to L$ pins $\lambda_L$ as if $L$ were a traded asset. Substituting both gives

$$(r - C_y) S F_S + \tfrac{1}{2}\sigma_S^2 S^2 F_{SS} + \tfrac{1}{2}\sigma_L^2 L^2 F_{LL} + \rho\sigma_S\sigma_L S L F_{SL} + F_t = 0$$

subject to $F(S,L,T,T) = S$ and $\lim_{T\to\infty} F = L$.

---

### 12. Why is there no $-rF$ term in that PDE?

Because $F$ is a futures _price_, not the value of a position. Entering a futures contract costs nothing and the position is marked to market continuously, so the no-arbitrage argument sets the drift of the futures price to zero under the pricing measure rather than to $rF$. The $-rF$ term belongs in the PDE for the _value_ of a forward contract or of an option on the futures, where the instrument is a traded asset whose price must grow at the risk-free rate in the risk-neutral world.

Stated the clean way: $F$ is a martingale under the risk-neutral measure when rates are deterministic, so its PDE has no discounting term, and $F(t,T) = \mathbb{E}_t^{\mathbb{Q}}[S_T]$.

---

### 13. Solve the PDE.

Try $F = A(t,T) S^{B(t,T)} L^{1-B(t,T)}$, so that $\ln F = \ln A + B \ln S + (1-B)\ln L$. The derivatives are $S F_S = BF$, $S^2 F_{SS} = B(B-1)F$, $L^2F_{LL} = -B(1-B)F$, $SLF_{SL} = B(1-B)F$ and $F_t = F[A_t/A + B_t \ln(S/L)]$. Substituting with $C_y = \beta\ln(S/L) + \delta$ and collecting terms, the coefficient of $\ln(S/L)$ must vanish separately from the constant:

$$B_t = \beta B, \qquad \frac{A_t}{A} = -(r - \delta)B - \tfrac{1}{2}vB(B-1)$$

with $v = \sigma_S^2 + \sigma_L^2 - 2\rho\sigma_S\sigma_L$ - the variance of $\ln(S/L)$. With $B(T,T) = 1$ the first gives $B(\tau) = e^{-\beta\tau}$, which automatically satisfies $B \to 0$ at infinite maturity. Integrating the second from $t$ to $T$ with $A(T,T) = 1$, then imposing $A \to 1$ at infinite maturity, forces $\delta = r - v/4$ and leaves

$$F(S,L,\tau) = S^{e^{-\beta\tau}} L^{1 - e^{-\beta\tau}} \exp\!\left[\frac{v}{4\beta}e^{-\beta\tau}\left(1 - e^{-\beta\tau}\right)\right]$$

So the log futures price is a convex combination of the log spot and log long-term price, plus a convexity term that vanishes at both ends of the curve and peaks where $B = 1/2$.

---

### 14. Why does the interest rate disappear from the futures price?

Because the limit condition $F \to L$ fixes the constant component of the convenience yield at $\delta = r - v/4$, and $r$ appears in the $A$ equation only in the combination $r - \delta$. The economics: if you insist that the far end of the curve pins to a finite long-term price, you have implicitly said that the net carry at the long end is zero, so financing cost and convenience yield must offset there. Any change in $r$ is absorbed by an equal change in the level of the convenience yield.

This is a nice property for a practitioner - the curve does not move when the Fed does, which matches how oil desks behave - and a warning sign for a theorist, because it tells you $\delta$ is doing a lot of unobservable work.

---

### 15. What does $B(\tau)$ mean economically?

$B(\tau)$ is the elasticity of the futures price to the spot price: $\partial \ln F / \partial \ln S = B$, so $\partial F/\partial S = BF/S$. It is the fraction of a futures contract that is "spot" as opposed to "long-term price", and it decays exponentially at rate $\beta$.

The natural summary statistic is the half-life $\ln 2 / \beta$. Gabillon's estimates cluster around $\beta \approx 1.5$, so the half-life is about 0.46 years: a contract five or six months out is already only half a spot contract, and a two-year contract is 95% long-term price. That single number explains both the cantilever picture and the volatility term structure.

---

### 16. What does the assumption of a finite long-term price imply about the market price of long-term risk?

It is a much stronger assumption than it looks. Since $L$ is not the price of a traded asset, its market price of risk $\lambda_L$ is in principle free. Taking the limit of the no-arbitrage relation as maturity goes to infinity forces $\lambda_L = \mu_L/\sigma_L$ - that is, market participants must price long-term oil price risk exactly as if a contract for delivery at infinite maturity were traded.

Gabillon also gives the general version: without the limit condition, the futures price converges to a finite value if and only if $\lambda_L$ is at or below a critical level $\lambda^*$. At $\lambda^*$ the implied long-dated price diverges. So "there exists a finite price of oil for delivery at infinite time" is a statement about the risk aversion of market participants, not just about oil - which is the single most questionable assumption in the paper, and the author says so.

---

### 17. What does the short-term shock term add?

The constant-parameter model has exactly one shape parameter, $\beta$, and can only draw monotone curves converging to $L$. Real curves are sometimes backwardated at the front and in contango further out, or the reverse. Letting the constant component of the convenience yield decay from a shock, $\delta(t) = \delta + \theta e^{-\eta t}$, adds a term

$$-\theta \, \frac{e^{-\eta\tau} - e^{-\beta\tau}}{\beta - \eta}$$

to $\ln A$. $\theta$ is the amplitude of a physical-market disturbance and $1/\eta$ its characteristic decay time, so the economic story is clean: market participants can keep their view of the long-term price while a transient dislocation - a refinery outage, a cold winter, a war premium - reprices the front. It costs two parameters and keeps the closed form, and it is exactly what the model needed in April-May 1990 and January-February 1991, the two periods where the simple version fitted worst.

---

### 18. What is the distribution of the futures price in this model?

Gaussian in logs. $\ln F(t,T) = \ln A + B \ln S_t + (1 - B)\ln L_t$ is a fixed linear combination of two correlated Brownian motions with constant coefficients (for a fixed $T$, $B$ changes deterministically with $t$), so $\ln F$ is normally distributed and $F$ is lognormal. That is what makes the model usable: European options on futures price with Black's formula using the integrated variance

$$\bar{\sigma}^2(t, T_{\text{opt}}, T) = \frac{1}{T_{\text{opt}} - t}\int_t^{T_{\text{opt}}} \sigma_F^2(u, T) \, du$$

and $\sigma_F^2(u,T) = \sigma_S^2 B^2 + \sigma_L^2(1-B)^2 + 2\rho\sigma_S\sigma_L B(1-B)$ evaluated at $B = e^{-\beta(T-u)}$. The integral is a sum of exponentials, so it is closed form too.

---

### 19. You are long a five-year WTI swap. How do you hedge it with front-month futures in this model?

Compute factor sensitivities, not a one-for-one barrel hedge. For each leg of the swap with maturity $T_i$, the exposure to spot is $\partial F_i/\partial S = B(\tau_i) F_i / S$ and the exposure to the long-term factor is $(1 - B(\tau_i))F_i/L$. With $\beta = 1.5$, a leg five years out has $B \approx 0.0006$: hedging it with front-month futures is almost pointless, since the front contract is essentially pure spot exposure.

That is the practical punchline of the model. Long-dated oil risk is mostly $L$-risk, and the only instruments that carry meaningful $L$-exposure are the longest contracts on the board. You hedge with a small basket - a front contract for the spot factor and the longest liquid contract for the long-term factor - solving a two-by-two system to match both sensitivities, and you accept a large residual because the deferred contracts are illiquid. The model also tells you the hedge ratios decay over time as $B$ grows toward 1, so the book has to be rebalanced as maturity approaches.

---

### 20. How would you price an oil-linked bond or a swap with this model?

A commodity swap is a strip of forwards, so its fixed leg is a discounted average of model futures prices across the settlement dates - the model's job is producing $F(0,T_i)$ beyond the exchange's last liquid maturity, which is exactly the gap Gabillon set out to fill. With deterministic rates the futures price equals the forward price, so no convexity adjustment is needed; if you want to be careful about rate-commodity correlation, add one.

An oil-linked bond is a bond plus a strip of options on the futures. Because $\ln F$ is Gaussian with a known integrated variance, each option prices in closed form with Black, using the model's own volatility term structure rather than a flat extrapolation of the last observable implied vol. The point of a term-structure model, as opposed to a curve-fitting exercise, is that prices and volatilities across the whole book come from one consistent set of parameters - so a five-year warrant and a three-month option cannot be marked with contradictory views of the same market.

---

### 21. How does the market price of risk relate to the convenience yield here?

They are two descriptions of the same mechanism. In the convenience-yield version, oil is a traded asset, so hedging physical oil with futures fixes $\lambda_S$ in terms of $r$, $C_c$ and $C_y$; the convenience yield is what makes the front end drift back toward the long end.

In the alternative build of Section 4.4, there is no convenience yield at all. The spot price mean-reverts toward $L$ directly, $dS/S = k\ln(L/S)dt + \sigma_S dz_1$, and $\lambda_S$ enters explicitly. Solving that PDE gives $B(\tau) = e^{-k\tau}$ - so the mean-reversion speed $k$ plays exactly the role of $\beta$ - and the same functional form for $F$. The one visible difference is the long end:

$$\lim_{\tau\to\infty} F = L \exp\!\left(-\frac{\lambda_S\sigma_S}{k} - \frac{v}{4k}\right)$$

The futures curve converges not to $L$ but to $L$ times a constant skew reflecting the spot risk premium. In the convenience-yield version that skew was silently absorbed into $\delta$. Which formulation you prefer is a matter of taste; what you cannot do is claim the convenience yield is separately identified from the risk premium, because from curve data alone it is not.

---

## Part 3: The Samuelson Effect

### 22. Define the Samuelson effect and give the intuition.

The Samuelson effect, or maturity effect, is the observation that futures return volatility increases as a contract approaches expiry: nearby contracts are more volatile than deferred ones. Samuelson's 1965 argument assumes the futures price is the expected future spot price and that the spot price is mean-reverting. Under those assumptions, a shock to spot today barely changes the expectation of spot in three years, because the shock is expected to decay - but it changes the expectation of spot next month almost one for one.

The convergence argument is the same thing viewed from the other end: at expiry the futures price must equal the spot price, so all of the spot's volatility is transmitted to the contract. Far from expiry the contract is insulated from the noise in today's physical market.

---

### 23. How does Gabillon's model produce it? Give the formula.

Since $\ln F = \ln A + B\ln S + (1-B)\ln L$ with $B = e^{-\beta\tau}$, the instantaneous variance is a quadratic form:

$$\sigma_F^2(\tau) = \sigma_S^2 B^2 + \sigma_L^2(1-B)^2 + 2\rho\sigma_S\sigma_L B(1-B)$$

At $\tau = 0$, $B = 1$ and $\sigma_F = \sigma_S$. As $\tau \to \infty$, $B \to 0$ and $\sigma_F \to \sigma_L$. In between, the contract is a portfolio of a high-volatility factor and a low-volatility one, with the weight on the volatile factor decaying exponentially. The Samuelson effect is therefore not an assumption in this model; it is a consequence of the state-variable structure, and its speed is controlled by the same $\beta$ that controls the shape of the price curve. Short-term convenience-yield shocks - the $\theta, \eta$ terms - sharpen the effect further at the very front of the curve.

---

### 24. Is the volatility decay always monotone in this model?

No, and this is the interesting case. Differentiating the quadratic form, the behaviour depends on $\rho$. When $\rho$ is high (the two factors move together), the curve falls smoothly from $\sigma_S$ to $\sigma_L$. When $\rho$ is low or negative, the cross term $2\rho\sigma_S\sigma_L B(1-B)$ is negative and largest in magnitude at intermediate maturities, so the volatility curve _undershoots_ $\sigma_L$ and then recovers - the two factors partially cancel for contracts that are roughly half spot and half long-term price.

With $\sigma_S = 40\%$, $\sigma_L = 10\%$, $\beta = 1.5$ and $\rho = -0.5$, the one-year volatility is 8.4%, below the 10% long-dated floor. That is a real, observable feature of commodity volatility curves - a dip in the belly - and it is why "the Samuelson effect means volatility declines monotonically with maturity" is a claim worth qualifying in an interview.

---

### 25. What does long-dated volatility converge to, and why does that matter?

To $\sigma_L$, not to zero. This is the practical difference between a two-factor model and a single mean-reverting factor. Under pure mean reversion, $\sigma_F(\tau) = \sigma_S e^{-k\tau}$, so a five-year contract with $k = 1.5$ has a volatility of about 0.02% - effectively a deterministic price. That would imply long-dated options are worthless and long-dated hedging is unnecessary, both of which are false: five-year WTI options trade at meaningful volatilities, and the back of the curve moves enough to bankrupt people.

The second factor puts a floor under the volatility curve. Anyone who has to mark a ten-year swap needs that floor, which is why every production commodity model since has had at least two factors.

---

### 26. Is the Samuelson effect really about mean reversion, or about information?

Both stories exist and they are not identical. Samuelson's original mechanism is mean reversion in the spot process. The information-flow story, due to Anderson and Danthine and refined by Bessembinder and co-authors, is that volatility rises as contract-relevant uncertainty is resolved - and for commodities, most supply and demand uncertainty resolves close to delivery.

The empirically sharper statement is the negative-covariance hypothesis: the maturity effect appears when spot price changes are negatively correlated with changes in the slope of the forward curve - which is precisely the case for storable commodities where a supply shock raises spot and increases backwardation. That condition holds for crude and for agricultural markets and fails for most financial futures, which is why the effect is a commodity phenomenon rather than a universal law. In Gabillon's model the condition holds by construction, since a rise in $S$ with $L$ fixed both raises spot and steepens the backwardation.

---

### 27. How would you measure the volatility term structure in practice?

Carefully, because neither available measure is what the model calls $\sigma_F(t,T)$. Historical volatility for a given contract is computed over a past window during which the contract's maturity was shrinking, so it is an average over a stretch of the term structure rather than a point on it. Gabillon's fix is to plot a 20-trading-day historical volatility at the midpoint of the maturity range it spans. Implied volatility is forward-looking but only available out to the maturities where options trade - for WTI in 1991, nine months, against three years of futures.

Three practical rules follow. Use constant-maturity series built from the futures curve rather than raw contract series, so the roll does not contaminate returns. Be explicit about whether you are measuring an average over a window or an instantaneous point. And when you fit the model, fit to the measure you will actually be trading against - if you are marking an options book, fit the implied curve.

---

### 28. How does the Samuelson effect feed into option pricing on futures?

Through integrated variance, not spot volatility. An option expiring at $T_{\text{opt}}$ on a futures contract expiring at $T$ is priced with Black's formula using the average variance of _that_ contract over the life of the option:

$$\bar{\sigma}^2 = \frac{1}{T_{\text{opt}} - t}\int_t^{T_{\text{opt}}} \sigma_F^2(u, T)\, du$$

With a declining volatility term structure, two consequences follow. First, an option on a deferred contract is worth far less than the same option on the front contract - the classic reason calendar spreads on commodity options are not priced with one flat vol. Second, when the option expires close to the futures expiry, the contract's volatility is rising over the life of the option, so the average sits above the volatility observed today. Ignoring that term structure and quoting off today's realized volatility systematically misprices the short-dated wing.

---

### 29. Are there markets where the Samuelson effect does not hold?

Yes. It is strongest in storable physical commodities with meaningful convenience yields - crude, products, grains - and weak or absent in financial futures. Some interest-rate futures show a flat or inverted maturity effect, because the underlying is an expectation of a policy rate rather than a physically constrained commodity, and uncertainty about the rate does not resolve near delivery in the same way. Equity index futures are close to pure cost of carry, so their volatility is essentially the index volatility at all maturities.

The modelling implication is that you should not hard-code Samuelson behaviour. A flexible model produces it when the data asks for it - in Gabillon's case through the relative volatility of the two factors and the size of $\beta$ - and can produce a flat curve when $\sigma_L \to \sigma_S$ and $\rho \to 1$.

---

## Part 4: Calibration and Empirics

### 30. How do you infer the convenience-yield term structure from market data?

In the general, time-dependent version of the model the recipe is a two-step inversion.

First, recover $B(0,T)$ for every maturity from the current volatility term structure, using

$$\sigma_F^2(0,T) = \sigma_S^2B^2 + \sigma_L^2(1-B)^2 + 2\rho\sigma_S\sigma_LB(1-B)$$

and estimates of $\sigma_S$, $\sigma_L$, $\rho$ from historical data. Second, with $B(0,T)$ in hand and the spot and long-term prices observed, invert $F(0,T) = A(0,T)S^{B}L^{1-B}$ to get $A(0,T)$ across maturities. Then differentiate the two ODEs that link $A$ and $B$ to $\beta(t)$ and $\delta(t)$, and read off the implied convenience-yield functions.

This is the commodity analogue of extracting an implied short-rate process from a bond curve in a Hull-White or HJM setting: you are not estimating the convenience yield, you are reading off whatever convenience yield makes today's curve arbitrage-free within the model.

---

### 31. What does "reducing degrees of freedom" mean, and why does it matter?

In the fully general version, $\beta(t)$, $\delta(t)$, $\sigma_S(t)$, $\sigma_L(t)$ and $\rho(t)$ are all free functions of time. That version fits today's price and volatility curves essentially exactly. The problem is dynamic: refit tomorrow and the implied functions have changed; refit a few days later and they have changed a lot. A model whose "constants" move every week is a static interpolation with extra steps - it prices consistently across instruments at a point in time, but it cannot be used to forecast, to compute risk, or to say anything about how the curve will move.

The fix is to restrict the functional forms: constant $\sigma_S$, $\sigma_L$, $\rho$, constant $\beta$, and either a constant $\delta$ or a single exponentially decaying shock. The model then loses the exact fit and gains stability - the entire term structure of prices and volatilities is described by $(S, L, \sigma_S, \sigma_L, \rho, \beta)$ plus at most $(\theta, \eta)$. Hull and White make the same point for interest rates: a model that values derivatives consistently today and a model that describes the motion of the curve are different objectives, and you usually cannot have both.

---

### 32. $L$ is not observable. How did Gabillon estimate it?

Two ways, and the comparison is instructive.

**Monthly, non-stochastic.** Split the sample into calendar months and assume $L$ is constant within each month. Then fit the constant-parameter model to the full curve on every day of the month by least squares, estimating $L$ and $\beta$ jointly. This gives stable, well-behaved estimates - the annualized volatility of monthly $L$ was 17.6% against 46.4% for spot, and the correlation was 0.21 - but only one $L$ per month.

**Daily, by extrapolation.** Fit $f(\tau) = a_1 + a_2e^{-a_3\tau}$ to the far end of the traded curve, matching the level, first derivative, and second derivative at the last traded maturity, then take $L = \lim_{\tau\to\infty} f(\tau) = a_1$. This gives a daily series but is extremely sensitive to derivatives estimated from the illiquid tail. When the estimated second derivative came out non-negative, the extrapolation diverged and the previous negative value had to be substituted; and eight days out of 423 produced jumps in $\ln(L_t/L_{t-1})$ that reversed immediately and were replaced by interpolation. Even after filtering, $\sigma_L$ came out at 33.7% and $\rho$ at 0.42 - both higher than the monthly method suggests.

The honest summary is that $L$ is a latent variable and the estimates inherit the noise of whatever extraction scheme you pick. Today you would run the model through a Kalman filter with the futures curve as the observation equation and treat $S$ and $L$ as unobserved states - which is exactly what Schwartz and Smith did a decade later.

---

### 33. Why not just use the front-month contract as the spot price?

Because its time to delivery cycles between a few days and a month, so a series of front-contract prices mixes true spot moves with changes in time-to-delivery. In a steeply backwardated or contangoed market that second component is large, and it is worst in exactly the weeks where an expiry falls - which is when the data is most interesting.

Gabillon instead backs out a spot proxy from the curve itself, extrapolating to zero maturity using the observed slope at the front, $S \approx F_1 - \tau_1 \cdot \partial F/\partial\tau$ with the derivative approximated by $(F_2 - F_1)/(\tau_2 - \tau_1)$. Every futures price is associated with its exact time to maturity so the whole thing describes a continuous structure. The modern equivalent is a constant-maturity series or a properly rolled continuous contract.

---

### 34. What did the estimation show, and were the parameters stable?

The headline numbers are in the table above. The estimates of $L$ and $\beta$ were statistically significant in every period, and $L$ behaved as the cantilever picture suggests - stable, and crossing the spot price exactly when the market flipped between backwardation and contango. $\beta$ stayed within roughly $[1.15, 2.64]$ with the daily $L$ series, excluding four months.

Those four months are the interesting ones. In April-May 1990 there was steep contango in the first six months only; in January-February 1991, after the air campaign began, the front was backwardated while the long end was in strong contango. In both cases the simple model tried to fit a short-term effect using the only parameter it had, so $\beta$ blew up and the fit at the long end deteriorated badly. That is a clean example of a misspecified model signalling its own misspecification through unstable parameters, and it is the empirical case for the $\theta, \eta$ shock term.

Reintroducing stochastic $L$ reduced root mean square errors most during regime changes and during periods of large erratic spot moves - which is the evidence that the long-term price genuinely is a second source of risk rather than a fitted constant.

---

### 35. How would you calibrate this model today?

In three stages.

**Historical stage.** Build constant-maturity WTI series, use a front constant-maturity contract as the $S$ proxy and the longest liquid constant-maturity contract as the $L$ proxy, and estimate $\sigma_S$, $\sigma_L$ and $\rho$ from log returns - ideally with an exponentially weighted or GARCH estimator, since commodity volatility is strongly time-varying.

**Cross-sectional stage.** With those three fixed, fit $\beta$ (and $\theta, \eta$ if you need front-end curvature) by least squares to the observed futures curve, weighting maturities by liquidity rather than treating a 36-month contract as equal in value to a front contract. If you are marking an options book, fit jointly to the implied volatility term structure through $\sigma_F(\tau)$ instead of to prices alone.

**Filtering stage.** Rather than proxying $L$, put the model in state-space form - the state is $(\ln S, \ln L)$, the observation equation is the vector of log futures prices - and run a Kalman filter with maximum likelihood on the parameters. This handles the latency of both factors properly, uses the whole curve every day, and gives you standard errors.

Then check stability: refit weekly and plot the parameter paths. If $\beta$ wanders the way it did in February 1991, the model is missing a feature, not asking for a recalibration.

---

### 36. How would you validate the model out of sample?

Four tests, in increasing order of severity.

1. **Cross-sectional fit.** RMSE on the contracts used in the fit, and separately on contracts held out - typically the longest maturities, since extrapolation there is the whole point of the exercise.
2. **Parameter stability.** Refit through time and look for drift, jumps, or regime dependence in $\beta$, $\sigma_L$ and $\rho$.
3. **Hedging performance.** Build the two-factor hedge for a long-dated exposure, run it through history, and compare the variance of the hedged P&L against a naive stack-and-roll hedge. This is the test that matters commercially, and it is much harsher than a price fit.
4. **Simulated stylized facts.** Simulate paths and check that the model reproduces the frequency and persistence of backwardation and contango, the shape of the volatility term structure, and the distribution of curve slopes. A model can fit every curve in the sample and still simulate futures that never flip state.

---

## Part 5: Comparisons, Limits, and Extensions

### 37. Compare the model with Gibson-Schwartz.

<python-table src="model-comparison"></python-table>

Gibson and Schwartz (1990) take spot $S$ and instantaneous convenience yield $\delta$ as state variables, with $\delta$ following an Ornstein-Uhlenbeck process. It is the canonical stochastic-convenience-yield model and it fits the data well, at the cost of a PDE with no analytic solution, requiring numerical valuation.

Gabillon's three criticisms are worth knowing. The convenience yield mean-reverts on a schedule independent of the spot price, whereas the market suggests the convenience yield rises and falls _with_ spot. The empirical proxies are shaky: the spot proxy is the front contract, with the roll problems described above, and the convenience yield is implied from a formula derived under _non-stochastic_ convenience yield and then fed into a stochastic-convenience-yield model. And the absence of a closed form makes it awkward for day-to-day valuation and hedging of a large book.

The counter-argument in Gibson-Schwartz's favour: the convenience yield genuinely does have its own randomness - inventories, outages, weather - that a deterministic function of $S/L$ cannot capture. Gabillon buys tractability with that assumption, and in a market with rich, liquid data you might prefer the extra factor.

---

### 38. How does it relate to Schwartz-Smith (2000)?

Very closely - Gabillon is essentially a precursor. Schwartz and Smith decompose the log spot price into a short-term deviation $\chi$ that mean-reverts to zero and an equilibrium level $\xi$ that follows an arithmetic Brownian motion, with $\ln S = \chi + \xi$, and show that this is equivalent to a stochastic-convenience-yield model of the Gibson-Schwartz type.

Written in logs, Gabillon's futures price is $\ln F = \ln A + e^{-\beta\tau}\ln S + (1 - e^{-\beta\tau})\ln L$, which is precisely the short-term/long-term split: the log spot deviation from $\ln L$ decays at rate $\beta$, and $\ln L$ is the permanent component. The differences are mainly presentational - Schwartz and Smith give the state-space/Kalman filter treatment, work under an explicitly risk-neutral parameterisation with a separate risk premium on each factor, and have a drift in the equilibrium factor - but the pricing structure is the same, and so is the volatility term structure. If you can derive one, you can derive the other, and saying so in an interview shows you understand what the factors are doing rather than which paper they came from.

---

### 39. How does this connect to interest-rate term-structure modelling?

Gabillon borrows from both branches of the rates literature deliberately.

The **equilibrium branch** - Vasicek, Cox-Ingersoll-Ross, Brennan-Schwartz - specifies a small set of state variables with diffusion dynamics and derives the whole curve analytically. Gabillon's constant-parameter model is that approach applied to oil: two state variables, a closed form for every maturity, an imperfect but stable fit.

The **no-arbitrage branch** - Ho-Lee, Heath-Jarrow-Morton, Black-Derman-Toy, Hull-White - calibrates exactly to today's curve and volatility structure by making model functions time-dependent. Gabillon's general version, where $A(0,T)$ and $B(0,T)$ are read off the market and inverted for $\beta(t)$ and $\delta(t)$, is that approach.

The key difference is data. Rates markets have liquid instruments out to 25 years and a rich volatility surface, so an exact lattice fit is both possible and useful. In oil you have a few dozen futures prices and options out to a year or two, so exact fitting overfits - hence the deliberate reduction of degrees of freedom.

---

### 40. What are the main limitations and criticisms of the model?

- **The functional form of the convenience yield is imposed.** $C_y = \beta\ln(S/L) + \delta(t)$ is motivated by intuition and tractability, not derived from inventory dynamics. Equilibrium models of storage (Routledge, Seppi and Spatt, for instance) generate convenience yields with state-dependent, asymmetric behaviour - very high when inventories approach a stock-out, near zero when storage is ample - which a smooth log-ratio function cannot reproduce.
- **The finite-$L$ assumption is strong.** It forces the market price of long-term risk to equal the value it would take if an infinite-maturity contract traded. No such contract exists, and attitudes to very long-dated commodity risk need not be so tidy.
- **Deterministic convenience yield throws away real randomness.** Inventory and outage shocks move the curve in ways $S$ and $L$ alone cannot express.
- **Constant parameters are too rigid** for a rich volatility surface, and the flexible version has poor dynamic properties. The model's usefulness rests entirely on where you set that dial.
- **Seasonality is unmodelled**, so refined products are out of scope.
- **Lognormality rules out negative prices**, which stopped being an academic point in April 2020.

---

### 41. Why does the model fail for refined products?

Because the convenience yield of gasoil or gasoline is dominated by seasonality, not by the level of spot relative to a long-run anchor. Heating oil demand peaks in winter, gasoline in summer, and the market prices those cycles into the curve in advance - which is why European gasoil was steeply backwardated in the winter of 1990-91 and American gasoline in the summer of 1989. A model whose convenience yield depends only on $S/L$ produces monotone curves converging to $L$; it cannot produce a curve that oscillates with delivery month.

The fix is standard: add a deterministic seasonal function to the convenience yield or to the log futures price, typically a small Fourier series in delivery month, fitted once and held fixed. That keeps the two-factor structure and the closed form while letting the curve wiggle by calendar month. Gabillon flags this as the obvious extension in his conclusion.

---

### 42. WTI settled at minus \$37 in April 2020. What does that do to a model like this?

It breaks the lognormal assumption outright - $S^{B}L^{1-B}$ is not even defined for negative $S$ - and it breaks the economics behind the convenience yield, because the convenience of holding a barrel goes sharply negative when storage at Cushing is full and you are contractually obliged to take delivery.

Two families of repairs. Shift the distribution: model $S + a$ as lognormal for some constant shift $a$ covering the worst plausible negative price, which keeps the closed forms with a displaced strike, exactly the displaced-diffusion trick used for negative rates. Or move to an arithmetic/Gaussian factor structure: let $\ln$ go and model the price level itself as a sum of Gaussian factors, which permits negative prices naturally at the cost of allowing them too easily in normal times. The exchanges took the displaced route for options in 2020 by switching to Bachelier pricing.

It is also worth noting what the episode confirms about the model's core idea: the front contract collapsed while the long end barely moved. The cantilever held, even as the lognormality did not.

---

### 43. What would a modern production version of this model look like?

Three factors rather than two, typically: a short-term deviation, a long-term equilibrium level, and a stochastic factor for the long-run drift or for interest rates. Stochastic volatility on at least the front factor, since commodity volatility clusters violently and a constant $\sigma_S$ cannot price the smile. A deterministic seasonal component for products and gas. A displaced or arithmetic specification so negative prices are representable. And a jump component if you care about the front-month tails around OPEC meetings and geopolitical events.

For anything path-dependent or exotic on the whole curve, the industry standard moved to market models - the Clewlow and Strickland multi-factor forward-curve approach, which models every forward directly with a volatility function $\sigma_i(t)$ and is the commodity analogue of HJM. Gabillon's structure survives inside all of them as the volatility function: an exponentially decaying loading on a short factor plus a flat loading on a long factor is the standard first two principal components of a commodity forward curve, and they are usually labelled "level" and "slope".

The cleanest way to state the generalisation, though, is not to bolt features on one at a time but to notice that Gabillon is already a two-factor member of a family that extends to any number of factors. That is the next question.

---

### 44. How does Gabillon generalise to the n-factor Gaussian model?

The n-factor Gaussian model writes the log spot price as a sum of $n$ latent factors, one non-stationary and the rest mean-reverting at different speeds:

$$\ln S_t = \sum_{i=1}^{n} x_i(t), \qquad dx_i = -k_i x_i \, dt + \sigma_i \, dz_i, \qquad dz_i dz_j = \rho_{ij} dt$$

with $k_1 = 0$ for the permanent factor and $k_2 < k_3 < \dots$ for progressively faster transients. Each factor is a time scale: $k_1$ is the long-run equilibrium level, the middle factors are the multi-month cycle, and the fastest ones are the storage and logistics noise that dies within weeks.

Because everything is Gaussian in logs, the futures price is exponential-affine in the factors:

$$\ln F(t,T) = \sum_{i=1}^{n} e^{-k_i \tau} x_i(t) + D(\tau) + C(\tau)$$

where $D$ collects the risk-neutral drifts and $C$ is the Jensen convexity term:

$$
\begin{aligned}
D(\tau) &= \mu_1 \tau + \sum_{i \geq 2} \frac{\mu_i}{k_i}\big(1 - e^{-k_i\tau}\big) \\[4pt]
C(\tau) &= \frac{1}{2}\sum_{i,j} \frac{\rho_{ij}\,\sigma_i\sigma_j}{k_i + k_j}\Big(1 - e^{-(k_i+k_j)\tau}\Big)
\end{aligned}
$$

and the volatility term structure is a sum of exponentials:

$$\sigma_F^2(\tau) = \sum_{i,j} \rho_{ij}\,\sigma_i \sigma_j \, e^{-(k_i + k_j)\tau}$$

**Gabillon is the $n = 2$ case.** Change basis from $(\ln S, \ln L)$ to $(\ell, y) = \big(\ln L, \ln(S/L)\big)$. Then $\ell$ is the permanent factor with $k_1 = 0$ and volatility $\sigma_L$, and $y$ is a transient factor with $k_2 = \beta$ and volatility $\sqrt{v}$ - which is exactly why $v = \sigma_S^2 + \sigma_L^2 - 2\rho\sigma_S\sigma_L$ shows up everywhere in the closed form: it is the variance of the log spread. Substituting into the volatility formula above reproduces $\sigma_F^2 = \sigma_S^2B^2 + \sigma_L^2(1-B)^2 + 2\rho\sigma_S\sigma_LB(1-B)$ term for term.

The boundary condition translates too, and this is the part worth remembering. Requiring $F \to L$ at infinite maturity forces the permanent factor's risk-neutral drift to $\mu_1 = -\tfrac{1}{2}\sigma_L^2$ - in other words, **$L$ must be a martingale in levels under the pricing measure**. That is the same statement as $\lambda_L = \mu_L/\sigma_L$ from question 16, in the language of factors rather than market prices of risk. Impose it, and the $\tau$-linear terms cancel and the convexity sum collapses to precisely $\ln A(\tau) = \frac{v}{4\beta}B(1-B)$. Gabillon's $A$ is not an artefact of his particular convenience-yield algebra; it is the generic Gaussian convexity term under a no-growth constraint on the long factor.

**What the extra factors buy.** Cortazar and Naranjo estimated this family on every daily oil futures transaction from 1992 to 2001 by Kalman filter, and found that **three factors are needed to fit the term structure of prices, but four to fit the term structure of volatilities**. That is the empirical answer to "how many factors does production need", and it says something specific: the volatility curve is harder than the price curve. Two factors give a monotone decay to a floor; real volatility curves have humps and kinks that need a third and fourth time scale. It also vindicates Gabillon's own diagnosis, since the periods where his $\beta$ blew up are exactly the ones where a second transient factor was needed.

Desks like this family for four reasons: Gaussian factors keep Black pricing in closed form, the state-space form calibrates by Kalman filter on the whole curve at once, the factors line up with the principal components of the forward curve (level, slope, curvature), and adding a factor is a change of $n$ rather than a new model. Its limits are the same as Gabillon's, inherited: Gaussian in logs means no negative prices without a displacement, constant $\sigma_i$ means no smile, and nothing in it knows about seasonality.

<callout variant="note" title="On naming">
This family is usually called the n-factor Gaussian model, and the canonical public reference is Cortazar and Naranjo (2006), building on the canonical affine representation of Dai and Singleton (2000). Individual desks have their own in-house names and variants for the same structure; those are not public, so this post sticks to the published version.
</callout>

---

## Rapid-Fire Round

**What are the two state variables?** Spot price $S$ and long-term price $L$, the price for delivery at infinite maturity.

**Is the convenience yield stochastic?** Yes, but only through $S$ and $L$ - it adds no third Brownian motion.

**What is $B(\tau)$?** $e^{-\beta\tau}$: the elasticity of the futures price to spot, and the weight on the spot factor.

**What is the futures price formula?** $F = A(\tau)S^{B}L^{1-B}$, a geometric weighted average of the two factors times a convexity term.

**Why does $r$ vanish?** The boundary condition $F \to L$ forces $\delta = r - v/4$, so $r$ cancels.

**Front-month volatility?** $\sigma_S$. **Infinite-maturity volatility?** $\sigma_L$.

**What creates the Samuelson effect here?** The exponential decay of the spot loading $B(\tau)$, with $\sigma_S > \sigma_L$.

**When is the volatility curve not monotone?** When $\rho$ is low or negative - the belly dips below $\sigma_L$.

**What does $\theta$ do?** Adds a decaying front-end shock, allowing curves with an inflection point or local minimum.

**Biggest assumption?** That a finite price of oil for delivery at infinite time exists, which constrains the market price of long-term risk.

**Closest modern relative?** Schwartz-Smith (2000), which is the same short-term/long-term decomposition in state-space form.

---

## Closing Notes

The reason this 1991 paper still repays reading is that it makes a structural choice rather than a statistical one. Faced with a curve whose front end is wild and whose back end is calm, Gabillon did not add a volatility parameter per maturity; he asked what two economic quantities would generate that pattern, wrote down their dynamics, and let the Samuelson effect fall out of the algebra. The volatility term structure is not fitted in his model - it is implied by $\sigma_S$, $\sigma_L$, $\rho$ and a single decay rate.

The other durable lesson is the trade-off he is explicit about: the more freedom you give the model's functions, the better it fits today's curve and the less it tells you about tomorrow's. Almost every argument in commodity modelling since - two factors or three, constant or stochastic volatility, spline the curve or parameterise it - is a version of the same dial.

If you are preparing for interviews with this material, the three things to be able to do from memory are: derive the futures PDE and explain why there is no $-rF$ term, write down $\sigma_F^2(\tau)$ and describe its two limits, and explain in one sentence why the long-dated volatility floor matters commercially.

---

## References

- Gabillon, J. (1991). _The Term Structures of Oil Futures Prices_. Oxford Institute for Energy Studies, WPM 17.
- Samuelson, P. A. (1965). "Proof That Properly Anticipated Prices Fluctuate Randomly". _Industrial Management Review_, 6(2).
- Gibson, R. and Schwartz, E. S. (1990). "Stochastic Convenience Yield and the Pricing of Oil Contingent Claims". _Journal of Finance_, 45(3).
- Brennan, M. J. and Schwartz, E. S. (1985). "Evaluating Natural Resource Investments". _Journal of Business_, 58(2).
- Fama, E. F. and French, K. R. (1988). "Business Cycles and the Behavior of Metals Prices". _Journal of Finance_, 43(5).
- Bessembinder, H., Coughenour, J. F., Seguin, P. J. and Smoller, M. M. (1996). "Is There a Term Structure of Futures Volatilities? Reevaluating the Samuelson Hypothesis". _Journal of Derivatives_, 4(2).
- Schwartz, E. S. (1997). "The Stochastic Behavior of Commodity Prices: Implications for Valuation and Hedging". _Journal of Finance_, 52(3).
- Schwartz, E. S. and Smith, J. E. (2000). "Short-Term Variations and Long-Term Dynamics in Commodity Prices". _Management Science_, 46(7).
- Routledge, B. R., Seppi, D. J. and Spatt, C. S. (2000). "Equilibrium Forward Curves for Commodities". _Journal of Finance_, 55(3).
- Cortazar, G. and Schwartz, E. S. (2003). "Implementing a Stochastic Model for Oil Futures Prices". _Energy Economics_, 25(3).
- Cortazar, G. and Naranjo, L. (2006). "An N-Factor Gaussian Model of Oil Futures Prices". _Journal of Futures Markets_, 26(3).
- Dai, Q. and Singleton, K. J. (2000). "Specification Analysis of Affine Term Structure Models". _Journal of Finance_, 55(5).
- Clewlow, L. and Strickland, C. (2000). _Energy Derivatives: Pricing and Risk Management_. Lacima.
- Hull, J. and White, A. (1990). "Pricing Interest-Rate-Derivative Securities". _Review of Financial Studies_, 3(4).
- Working, H. (1977). _Selected Writings of Holbrook Working_. Chicago Board of Trade.
