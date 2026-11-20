---
title: 'Basic Probability: Definitions and Set Operations'
date: '2026-04-04'
description: 'A ground-up guide to probability theory - outcomes, sample spaces, events, set operations, and random variables - with worked examples including the coin toss advantage, card game odds, the drunk passenger problem, and random points on a circle.'
tags: ['math', 'python', 'quant', 'probability']
---

<table-of-contents>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#outcomes-and-the-sample-space">Outcomes and the Sample Space</a></li>
<li><a href="#probability-of-an-outcome">Probability of an Outcome</a></li>
<li><a href="#events-and-their-probabilities">Events and Their Probabilities</a></li>
<li><a href="#set-operations-on-events">Set Operations on Events</a></li>
<li><a href="#mutual-exclusivity">Mutual Exclusivity</a></li>
<li><a href="#random-variables">Random Variables</a></li>
<li><a href="#example-the-coin-toss-advantage">Example: The Coin Toss Advantage</a></li>
<li><a href="#example-the-casino-card-game">Example: The Casino Card Game</a></li>
<li><a href="#example-the-drunk-passenger">Example: The Drunk Passenger</a></li>
<li><a href="#example-n-points-on-a-circle">Example: N Points on a Circle</a></li>
<li><a href="#conclusion">Conclusion</a></li>
</table-of-contents>

---

## Introduction

Probability is the mathematical language of uncertainty. Every pricing model, risk metric, and trading signal in quantitative finance rests on probability theory. When a quant says "there is a 5% chance the portfolio loses more than \$1M tomorrow," that statement has a precise mathematical meaning built from the definitions we cover here.

Before computing expected values, running Monte Carlo simulations, or pricing options, you need the foundational objects: outcomes, sample spaces, events, and their probabilities. These definitions are not just formalities - they are the scaffolding that ensures our reasoning about uncertainty is internally consistent. Getting them wrong leads to the kind of subtle errors that blow up models in production.

This post builds probability from the ground up. We start with the basic definitions and set operations, then apply them to four worked problems - a coin toss game, a casino card game, the drunk passenger puzzle, and a geometric probability problem - that exercise these ideas in increasingly creative ways.

---

## Outcomes and the Sample Space

### Outcomes

An **outcome** is a single possible result of a random experiment. We denote an individual outcome with the lowercase Greek letter omega: $\omega$.

If you flip a coin, the possible outcomes are heads and tails: $\omega_1 = H$ and $\omega_2 = T$. If you roll a standard die, there are six outcomes: $\omega_1 = 1, \omega_2 = 2, \ldots, \omega_6 = 6$.

An outcome must be the most granular result of the experiment - it cannot be broken down further. "Rolling an even number" is not an outcome; it is an **event** (a collection of outcomes), which we define shortly.

### The Sample Space

The **sample space** $\Omega$ (uppercase omega) is the set of all possible outcomes of a random experiment:

$$\Omega = \{\omega_1, \omega_2, \ldots\}$$

For a single coin flip: $\Omega = \{H, T\}$.

For a die roll: $\Omega = \{1, 2, 3, 4, 5, 6\}$.

For two coin flips: $\Omega = \{HH, HT, TH, TT\}$.

The sample space can be finite, countably infinite, or uncountable. A finite die roll has $|\Omega| = 6$. The number of coin flips until the first heads has $\Omega = \{1, 2, 3, \ldots\}$ - countably infinite. The time until the next trade execution has $\Omega = [0, \infty)$ - uncountable.

Every probability question begins by specifying $\Omega$. If the sample space is wrong, everything downstream is wrong.

---

## Probability of an Outcome

### Definition

A **probability measure** assigns a number to each outcome $\omega \in \Omega$ that represents how likely it is:

$$P(\{\omega\}) = p(\omega)$$

We write $p(\omega)$ for the probability of a single outcome. The probability measure must satisfy two axioms:

1. **Non-negativity**: $p(\omega) \geq 0$ for all $\omega \in \Omega$
2. **Normalization**: $\sum_{\omega \in \Omega} p(\omega) = 1$

The first axiom says probabilities cannot be negative. The second says the total probability across all outcomes must equal 1 - something must happen.

### Uniform Probability

When all outcomes are equally likely, we have a **uniform** probability measure:

$$p(\omega) = \frac{1}{|\Omega|}$$

For a fair die: $p(\omega) = \frac{1}{6}$ for each face. For a fair coin: $p(\omega) = \frac{1}{2}$.

### Non-Uniform Probability

Not all experiments are fair. A loaded die might have $p(6) = 0.3$ and $p(1) = p(2) = \ldots = p(5) = 0.14$. A stock price moving up tomorrow might have $p(\text{up}) = 0.52$ and $p(\text{down}) = 0.48$. As long as the two axioms are satisfied, any assignment of probabilities is valid.

<python-figure src="die-probabilities" caption="Probability distributions for a fair die (uniform) versus a loaded die. The loaded die has p(6) = 0.3, with the remaining probability distributed equally across the other faces."></python-figure>

---

## Events and Their Probabilities

### What Is an Event?

An **event** $A$ is a subset of the sample space: $A \subseteq \Omega$. An event is a collection of outcomes that we group together because they share some property we care about.

For a die roll with $\Omega = \{1, 2, 3, 4, 5, 6\}$:

- "Rolling an even number": $A = \{2, 4, 6\}$
- "Rolling greater than 4": $B = \{5, 6\}$
- "Rolling a 3": $C = \{3\}$

An event containing a single outcome (like $C$ above) is called an **elementary event** or **simple event**. An event can also be the entire sample space ($A = \Omega$, the **certain event**) or the empty set ($A = \emptyset$, the **impossible event**).

### Probability of an Event

The probability of an event $A$ is the sum of the probabilities of the outcomes it contains:

$$P(A) = \sum_{\omega \in A} p(\omega)$$

For a fair die, the probability of rolling an even number is:

$$P(\{2, 4, 6\}) = p(2) + p(4) + p(6) = \frac{1}{6} + \frac{1}{6} + \frac{1}{6} = \frac{1}{2}$$

For a uniform sample space, this simplifies to the counting formula:

$$P(A) = \frac{|A|}{|\Omega|}$$

The number of favorable outcomes divided by the total number of outcomes. Simple, but only valid when all outcomes are equally likely.

### Properties

From the axioms, several useful properties follow immediately:

- $P(\Omega) = 1$ (something always happens)
- $P(\emptyset) = 0$ (the impossible event never happens)
- $0 \leq P(A) \leq 1$ for any event $A$

---

## Set Operations on Events

Since events are sets, we can combine them using set operations. These operations let us build complex events from simpler ones.

### Union ($A \cup B$)

The **union** of two events $A$ and $B$ is the event "A or B (or both) occurs":

$$A \cup B = \{\omega \in \Omega : \omega \in A \text{ or } \omega \in B\}$$

For a die roll, if $A = \{2, 4, 6\}$ (even) and $B = \{5, 6\}$ (greater than 4):

$$A \cup B = \{2, 4, 5, 6\}$$

The probability of a union is:

$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

We subtract $P(A \cap B)$ to avoid double-counting outcomes that belong to both events. This is the **inclusion-exclusion principle**.

### Intersection ($A \cap B$)

The **intersection** of two events is the event "both A and B occur":

$$A \cap B = \{\omega \in \Omega : \omega \in A \text{ and } \omega \in B\}$$

With the same events: $A \cap B = \{6\}$ - the only outcome that is both even and greater than 4.

For a fair die: $P(A \cap B) = P(\{6\}) = \frac{1}{6}$.

We can verify inclusion-exclusion:

$$P(A \cup B) = \frac{3}{6} + \frac{2}{6} - \frac{1}{6} = \frac{4}{6} = \frac{2}{3}$$

which matches $P(\{2, 4, 5, 6\}) = \frac{4}{6}$.

### Complement ($A^c$)

The **complement** of an event $A$ is the event "A does not occur":

$$A^c = \{\omega \in \Omega : \omega \notin A\} = \Omega \setminus A$$

For $A = \{2, 4, 6\}$: $A^c = \{1, 3, 5\}$.

The complement has a simple probability:

$$P(A^c) = 1 - P(A)$$

This is one of the most useful identities in probability. When computing $P(A)$ directly is hard, it is often easier to compute $P(A^c)$ and subtract from 1. We will see this technique used in the "N points on a circle" problem.

<python-figure src="set-operations" caption="Set operations on events for a die roll. A = {2, 4, 6} (even) and B = {5, 6} (greater than 4). The union, intersection, and complement operations produce new events from existing ones."></python-figure>

### De Morgan's Laws

Two identities that relate complements with unions and intersections:

$$(A \cup B)^c = A^c \cap B^c$$

$$(A \cap B)^c = A^c \cup B^c$$

In words: "not (A or B)" is the same as "not A and not B," and "not (A and B)" is the same as "not A or not B."

---

## Mutual Exclusivity

Two events $A$ and $B$ are **mutually exclusive** (or **disjoint**) if they cannot both occur:

$$A \cap B = \emptyset$$

If $A$ and $B$ are mutually exclusive, the addition formula simplifies:

$$P(A \cup B) = P(A) + P(B)$$

No correction for double-counting is needed because there is no overlap.

For a die roll: "rolling a 1" and "rolling a 6" are mutually exclusive. "Rolling an even number" and "rolling a number greater than 4" are not - they share the outcome 6.

This generalizes to any number of pairwise mutually exclusive events $A_1, A_2, \ldots, A_n$:

$$P\left(\bigcup_{i=1}^{n} A_i\right) = \sum_{i=1}^{n} P(A_i)$$

A **partition** of $\Omega$ is a collection of mutually exclusive events whose union is $\Omega$ itself. Every outcome belongs to exactly one event in the partition. This is the basis of the **law of total probability**, which decomposes a complex probability calculation into simpler pieces.

---

## Random Variables

### Definition

A **random variable** is a function that assigns a numerical value to each outcome in the sample space:

$$X: \Omega \to \mathbb{R}$$

For each outcome $\omega \in \Omega$, $X(\omega)$ is a real number. The random variable converts qualitative outcomes (like "heads" or "the stock goes up") into numbers that we can compute with.

For two coin flips with $\Omega = \{HH, HT, TH, TT\}$, define $X$ = "number of heads":

$$X(HH) = 2, \quad X(HT) = 1, \quad X(TH) = 1, \quad X(TT) = 0$$

$X$ takes the values 0, 1, or 2. We can now ask questions like $P(X = 1) = P(\{HT, TH\}) = \frac{1}{2}$.

### Discrete vs. Continuous

A random variable is **discrete** if it takes on a finite or countably infinite set of values. The number of heads in 10 flips, the number of trades in a day, the number of defaults in a portfolio - all discrete.

A random variable is **continuous** if it takes values in an interval of real numbers. A stock's daily return, the time between trades, the implied volatility of an option - all continuous.

For a discrete random variable, we describe its behavior with a **probability mass function** (PMF):

$$p_X(x) = P(X = x)$$

For the number of heads in two fair coin flips:

$$p_X(0) = \frac{1}{4}, \quad p_X(1) = \frac{1}{2}, \quad p_X(2) = \frac{1}{4}$$

For continuous random variables, we use a **probability density function** (PDF) $f_X(x)$, where $P(a \leq X \leq b) = \int_a^b f_X(x) \, dx$.

### Expected Value

The **expected value** (or **mean**) of a discrete random variable is the probability-weighted average of its values:

$$E[X] = \sum_{x} x \cdot p_X(x)$$

For the coin flip example: $E[X] = 0 \cdot \frac{1}{4} + 1 \cdot \frac{1}{2} + 2 \cdot \frac{1}{4} = 1$.

This makes intuitive sense: if you flip two fair coins, you expect one head on average.

<python-figure src="two-coin-pmf" caption="PMF of X = number of heads in two fair coin flips. The expected value E[X] = 1 is marked, representing the probability-weighted average."></python-figure>

---

## Example: The Coin Toss Advantage

### The Problem

Two gamblers are playing a coin toss game. Gambler A has $n + 1$ fair coins; Gambler B has $n$ fair coins. Both flip all their coins simultaneously. What is the probability that A gets more heads than B?

At first glance this seems like it requires a messy combinatorial calculation - summing over all possible values of A's heads and B's heads. But there is an elegant solution.

### Setting Up the Sample Space

Let $H_A$ be the number of heads A gets and $H_B$ the number of heads B gets. A has $n + 1$ coins, so $H_A \in \{0, 1, \ldots, n+1\}$. B has $n$ coins, so $H_B \in \{0, 1, \ldots, n\}$.

The sample space $\Omega$ consists of all possible outcomes from flipping $2n + 1$ fair coins in total. We want to find $P(H_A > H_B)$.

### The Elegant Solution

The key insight is to think about A's extra coin separately. Suppose A first flips $n$ coins (matching B's count), and then flips the $(n+1)$th coin separately.

Let $H_A'$ be A's heads from the first $n$ coins. Now A and B each have $n$ fair coins, so by symmetry:

$$P(H_A' > H_B) = P(H_A' < H_B)$$

Call this probability $p$, and let $q = P(H_A' = H_B)$. Then $2p + q = 1$, so $q = 1 - 2p$.

Now consider the $(n+1)$th coin. A gets more heads than B overall ($H_A > H_B$) in exactly two cases:

1. $H_A' > H_B$ (A was already ahead) - this happens with probability $p$, and A wins regardless of the extra coin
2. $H_A' = H_B$ (tied after $n$ coins each) and the extra coin is heads - this happens with probability $q \cdot \frac{1}{2}$

Therefore:

$$P(H_A > H_B) = p + q \cdot \frac{1}{2} = p + \frac{1 - 2p}{2} = p + \frac{1}{2} - p = \frac{1}{2}$$

The answer is $\frac{1}{2}$, regardless of $n$. Whether A has 2 coins vs B's 1, or 1001 coins vs B's 1000, the probability is always exactly one half.

### Why This Works

The symmetry argument is clean because the extra coin acts as a tiebreaker. After the first $n$ coins, A and B are in a symmetric position. The only "extra" probability mass comes from the tiebreaker coin, which perfectly fills in the gap. There is no scenario where A and B tie overall (since A has an odd-numbered total of coins and B has an even-numbered total, or vice versa), so the probabilities of A winning and B winning must sum to 1.

<python-figure src="coin-toss-advantage" caption="Simulated probability that A (n+1 coins) gets more heads than B (n coins) for various values of n. The probability converges to exactly 0.5 for all n, confirming the analytical result."></python-figure>

---

## Example: The Casino Card Game

### The Problem

A casino offers a simple card game. There are 52 cards in a deck with 4 cards for each value (2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A). The cards are thoroughly shuffled. You pick a card from the deck, and the dealer picks another one without replacement. If your card has a larger value, you win. If the values are equal or yours is smaller, the house wins. What is your probability of winning?

### Setting Up the Sample Space

Since the cards are shuffled and drawn without replacement, the sample space is the set of all ordered pairs of distinct cards:

$$|\Omega| = 52 \times 51 = 2{,}652$$

Each ordered pair is equally likely.

### Counting Favorable Outcomes

Let us condition on the value of your card and count how many dealer cards you beat.

There are 13 possible values. If your card has the $k$th-highest value (where $k = 1$ is the highest, ace):

- Cards with a lower value than yours: $4 \times (13 - k)$ cards in the deck. After you draw one, the remaining deck has 51 cards, of which $4(13 - k)$ are lower.
- But we also need to account for the fact that one of the 4 cards of your value has been removed.

Let us think about it more directly. You draw one card of some value $v$. The remaining 51 cards contain:

- 3 cards of value $v$ (ties - you lose)
- $4 \times (\text{number of values below } v)$ cards you beat
- $4 \times (\text{number of values above } v)$ cards that beat you

With 13 values ranked 2 < 3 < ... < 10 < J < Q < K < A, if your card is the $i$th value from the bottom (so $i = 1$ for a 2, $i = 13$ for an ace):

- Cards you beat: $4(i - 1)$
- Ties: $3$
- Cards that beat you: $4(13 - i)$

Check: $4(i-1) + 3 + 4(13-i) = 4i - 4 + 3 + 52 - 4i = 51$. Correct.

Your probability of winning given your card has rank $i$ is:

$$P(\text{win} \mid \text{rank } i) = \frac{4(i-1)}{51}$$

Since each rank is equally likely (each has 4 of 52 cards):

$$P(\text{win}) = \sum_{i=1}^{13} \frac{1}{13} \cdot \frac{4(i-1)}{51} = \frac{4}{13 \times 51} \sum_{i=1}^{13} (i-1) = \frac{4}{663} \cdot \frac{12 \times 13}{2} = \frac{4 \times 78}{663} = \frac{312}{663} = \frac{24}{51} = \frac{8}{17}$$

Your probability of winning is $\frac{8}{17} \approx 0.4706$. The house wins with probability $\frac{9}{17} \approx 0.5294$.

The house edge is $\frac{9}{17} - \frac{8}{17} = \frac{1}{17} \approx 5.88\%$. As the casino promised: the house always has better odds.

<python-figure src="card-game-probabilities" caption="Probability of winning the card game given each possible card rank. Higher-ranked cards give better odds, but even with an ace you can still tie (3/51 chance). The overall win probability is 8/17 ≈ 47.06%."></python-figure>

### Why Ties Kill You

The asymmetry comes entirely from ties. If ties were a push (nobody wins), then by symmetry you and the dealer would each win exactly half the time. But since ties go to the house, the house captures all that tie probability:

$$P(\text{tie}) = \sum_{i=1}^{13} \frac{1}{13} \cdot \frac{3}{51} = \frac{3}{51} = \frac{1}{17} \approx 5.88\%$$

This is exactly the house edge. The game is symmetric in every way except the tie-breaking rule, and that single asymmetry is enough to guarantee the house wins over time.

---

## Example: The Drunk Passenger

### The Problem

A line of 100 airline passengers are waiting to board a plane. Each holds a ticket to one of the 100 seats on that flight. For convenience, the $n$th passenger in line has a ticket for seat number $n$.

The first passenger is drunk and picks a random seat (equally likely for each seat). All subsequent passengers are sober: they go to their assigned seat if it is available, and if it is taken, they randomly choose a free seat from the remaining ones.

You are passenger number 100 (the last to board). What is the probability you end up in your own seat (seat 100)?

### Building Intuition with Small Cases

Let us start with smaller versions to see the pattern.

**2 passengers, 2 seats:** The drunk passenger (P1) picks seat 1 or seat 2 with equal probability. If P1 picks seat 1 (their own), P2 gets seat 2. If P1 picks seat 2, P2 is forced into seat 1. So $P(\text{P2 gets seat 2}) = \frac{1}{2}$.

**3 passengers, 3 seats:** P1 picks uniformly from seats 1, 2, 3.

- P1 picks seat 1 (prob $\frac{1}{3}$): everyone gets their own seat. P3 gets seat 3.
- P1 picks seat 3 (prob $\frac{1}{3}$): P2 gets seat 2, P3 is forced into seat 1. P3 does not get seat 3.
- P1 picks seat 2 (prob $\frac{1}{3}$): P2 finds their seat taken and picks randomly from {1, 3}. If P2 picks seat 1, P3 gets seat 3. If P2 picks seat 3, P3 gets seat 1. So P3 gets seat 3 with probability $\frac{1}{2}$ in this branch.

Total: $P(\text{P3 gets seat 3}) = \frac{1}{3} + \frac{1}{3} \cdot 0 + \frac{1}{3} \cdot \frac{1}{2} = \frac{1}{3} + \frac{1}{6} = \frac{1}{2}$.

The answer is $\frac{1}{2}$ again. This is not a coincidence.

### The General Proof

**Claim:** For $n$ passengers, $P(\text{passenger } n \text{ gets their seat}) = \frac{1}{2}$ for all $n \geq 2$.

**Proof:** The key observation is that at every step of the process, only two seats matter: **seat 1** (the drunk's assigned seat) and **seat $n$** (your seat). All other seats get filled correctly by their rightful owners - the only disruption cascades through passengers whose seats are taken, and each displaced passenger faces the same recursive choice.

Here is the precise argument. When any displaced passenger picks a random free seat, three things can happen:

1. They pick seat 1 (the drunk's seat) - this ends the cascade. Everyone remaining gets their own seat, and you get seat $n$.
2. They pick seat $n$ (your seat) - this ends the cascade too. You will not get your seat.
3. They pick some other passenger's seat - this displaces that passenger, and the process continues.

Option 3 just passes the problem to someone else. The cascade only terminates when either seat 1 or seat $n$ is chosen. By symmetry, at every step, a displaced passenger choosing randomly among free seats is equally likely to pick seat 1 as seat $n$ (both are free, both have equal probability of being selected among the remaining free seats).

Therefore:

$$P(\text{you get seat } n) = \frac{1}{2}$$

<python-figure src="drunk-passenger" caption="Simulated probability that the last passenger gets their correct seat, for various numbers of total passengers (10,000 simulations each). The probability is always 1/2, regardless of the number of passengers."></python-figure>

### Why This Feels Wrong

Most people's intuition says the answer should get smaller as $n$ grows - with 100 passengers, surely there is a lot of room for things to go wrong. But the proof shows that the intermediate chaos is irrelevant. No matter how many passengers are displaced, the cascade always terminates with a 50/50 coin flip between seat 1 and seat 100. All the complexity in between is just passing the buck.

---

## Example: N Points on a Circle

### The Problem

Given $N$ points drawn uniformly and independently on the circumference of a circle, what is the probability that all $N$ points lie within some semicircle (half the circumference)?

### Why This Is Tricky

The semicircle is not fixed - we are asking whether there **exists** any semicircle that contains all the points. If the semicircle were fixed in advance (say, the top half), the problem would be straightforward: each point independently has probability $\frac{1}{2}$ of falling in the top half, so the probability would be $\left(\frac{1}{2}\right)^N$. But since the semicircle can be positioned anywhere, the probability is much larger.

### The Solution

Fix one of the $N$ points, say $P_1$. We want the probability that all other points lie within a semicircle starting at $P_1$ (going clockwise, say). Since the points are uniform on the circle, each of the remaining $N - 1$ points independently falls within this specific semicircle with probability $\frac{1}{2}$.

But $P_1$ is not special. If all points lie within some semicircle, then at least one of them must be the "leftmost" point (the first one clockwise) of that semicircle. By the union bound, we might overcount - but the key insight is that the events "point $P_i$ is the leftmost point and all others are within a semicircle starting at $P_i$" are **mutually exclusive**.

Why mutually exclusive? If all points lie in a semicircle, the leftmost point is unique (with probability 1, no two points coincide on a continuous circle). So exactly one point is the leftmost.

By the addition rule for mutually exclusive events:

$$P(\text{all in a semicircle}) = \sum_{i=1}^{N} P(P_i \text{ is leftmost and all in a semicircle from } P_i)$$

By symmetry, each term is identical:

$$= N \cdot P(\text{all other } N-1 \text{ points are within a semicircle clockwise from } P_1)$$

$$= N \cdot \left(\frac{1}{2}\right)^{N-1}$$

$$= \frac{N}{2^{N-1}}$$

### Checking Special Cases

- $N = 1$: $\frac{1}{2^0} = 1$. One point is always in a semicircle. Correct.
- $N = 2$: $\frac{2}{2^1} = 1$. Two points always lie in some semicircle (take the semicircle defined by their midpoint). Correct.
- $N = 3$: $\frac{3}{4} = 0.75$. Three random points on a circle have a 75% chance of fitting in a semicircle.
- $N = 4$: $\frac{4}{8} = 0.5$. Even odds.
- $N = 10$: $\frac{10}{512} \approx 0.0195$. With 10 points, it is rare for all to cluster in half the circle.

<python-figure src="n-points-circle-probability" caption="Probability that N random points on a circle all lie within a semicircle. The formula N/2^(N-1) drops off rapidly - even at N = 5 the probability is under 20%, and by N = 10 it is below 2%."></python-figure>

### Geometric Intuition

For small $N$, most random configurations happen to cluster enough to fit in a semicircle. As $N$ grows, the points spread more evenly around the circle, and it becomes exponentially unlikely that a full half remains empty.

The formula $\frac{N}{2^{N-1}}$ has the same structure as the probability of getting at most one tail in $N - 1$ coin flips: there are $N$ ways to pick which "side" of the circle is empty (one for each point that could be the boundary), and each has probability $\left(\frac{1}{2}\right)^{N-1}$.

<circle-diagram></circle-diagram>

<python-figure src="circle-point-arrangements" caption="Random arrangements of N = 5 points on a circle. Left: a configuration where all points fit within a semicircle (shown in green). Right: a configuration where no semicircle contains all points. The probability of the left case is 5/16 = 31.25%."></python-figure>

---

## Conclusion

The definitions we covered - outcomes, sample spaces, events, set operations, and random variables - are the atomic building blocks of probability theory. Every result in statistics, stochastic calculus, and quantitative finance is built on this foundation.

The four examples illustrate different problem-solving techniques:

1. **The coin toss advantage** used symmetry to collapse a complex combinatorial sum into a one-line argument. The answer ($\frac{1}{2}$) does not depend on $n$ at all.
2. **The casino card game** used conditioning and the law of total probability to decompose the calculation by card rank. The house edge comes entirely from the tie-breaking rule.
3. **The drunk passenger** used a recursive argument and symmetry to show that intermediate chaos is irrelevant - only the first and last seats matter.
4. **N points on a circle** used mutual exclusivity and the complement technique to convert a geometric problem into a clean combinatorial formula.

These techniques - symmetry, conditioning, recursion, and complement counting - appear everywhere in probability. Master them here, and they will serve you well when the problems involve option pricing, risk metrics, and stochastic processes.

For further reading, Sheldon Ross's _A First Course in Probability_ covers these foundations thoroughly. For a more puzzle-oriented approach, Frederick Mosteller's _Fifty Challenging Problems in Probability_ is full of problems in the spirit of the examples above.
