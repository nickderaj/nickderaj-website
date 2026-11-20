---
title: 'Combinatorial Analysis: Counting, Permutations, and the Art of Clever Enumeration'
date: '2026-04-05'
description: 'A practical guide to combinatorial analysis - the basic counting principle, permutations, combinations, the binomial theorem, and inclusion-exclusion - with worked examples including poker hands, the hopping rabbit, screwy pirates, chess tournaments, derangements, the birthday problem, and two number theory puzzles.'
tags: ['math', 'python', 'quant', 'probability']
---

<table-of-contents>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#the-basic-counting-principle">The Basic Counting Principle</a></li>
<li><a href="#permutations">Permutations</a></li>
<li><a href="#combinations">Combinations</a></li>
<li><a href="#the-binomial-theorem">The Binomial Theorem</a></li>
<li><a href="#the-inclusion-exclusion-principle">The Inclusion-Exclusion Principle</a></li>
<li><a href="#example-poker-hands">Example: Poker Hands</a></li>
<li><a href="#example-hopping-rabbit">Example: Hopping Rabbit</a></li>
<li><a href="#example-screwy-pirates-2">Example: Screwy Pirates 2</a></li>
<li><a href="#example-chess-tournament">Example: Chess Tournament</a></li>
<li><a href="#example-application-letters">Example: Application Letters</a></li>
<li><a href="#example-the-birthday-problem">Example: The Birthday Problem</a></li>
<li><a href="#example-100th-digit">Example: 100th Digit</a></li>
<li><a href="#example-cube-of-an-integer">Example: Cube of an Integer</a></li>
<li><a href="#conclusion">Conclusion</a></li>
</table-of-contents>

---

## Introduction

Combinatorics is the mathematics of counting. That description sounds trivial until you try to count the number of five-card poker hands, the number of ways to schedule trades across correlated assets, or the number of distinct risk scenarios in a portfolio of 500 positions. Counting gets hard fast, and the tools of combinatorial analysis are what make it tractable.

In quantitative finance, combinatorics shows up everywhere. Binomial option pricing models count paths through a tree. Portfolio construction involves choosing $k$ assets from a universe of $n$. The number of distinct orderings of trade executions determines slippage scenarios. Monte Carlo variance reduction techniques rely on combinatorial identities to partition sample spaces efficiently.

This post covers the five core tools of combinatorial analysis - the basic counting principle, permutations, combinations, the binomial theorem, and the inclusion-exclusion principle - and then applies them to eight worked problems that range from poker odds to number theory.

---

## The Basic Counting Principle

### Statement

Let $S$ be the set of all length-$k$ sequences. If there are $n_1$ choices for the first element, $n_2$ choices for the second element (which may depend on the first choice), and so on up to $n_k$ choices for the $k$th element, then:

$$|S| = n_1 \times n_2 \times \cdots \times n_k$$

This is sometimes called the **multiplication principle** or **rule of product**.

### Examples

**License plates:** A plate has 3 letters followed by 4 digits. There are $26^3 \times 10^4 = 175{,}760{,}000$ possible plates.

**PIN codes:** A 4-digit PIN with no repeated digits has $10 \times 9 \times 8 \times 7 = 5{,}040$ possibilities. With repetition allowed: $10^4 = 10{,}000$.

**Binary strings:** A binary string of length $n$ has $2^n$ possibilities. This is why a 256-bit cryptographic key has $2^{256} \approx 1.16 \times 10^{77}$ possible values - more than the number of atoms in the observable universe.

### The Addition Principle

If two tasks are mutually exclusive (you do one or the other, not both), the total number of ways is the sum:

$$|A \cup B| = |A| + |B| \quad \text{when } A \cap B = \emptyset$$

A student can choose a math elective (5 options) or a physics elective (3 options), but not both: $5 + 3 = 8$ total choices. This complements the multiplication principle, which counts sequential choices.

---

## Permutations

### Definition

A **permutation** is an ordered arrangement of objects. The number of ways to arrange $n$ distinct objects in a line is:

$$n! = n \times (n-1) \times (n-2) \times \cdots \times 2 \times 1$$

By convention, $0! = 1$.

Factorials grow extremely fast:

| $n$ | $n!$                          |
| --- | ----------------------------- |
| 1   | 1                             |
| 5   | 120                           |
| 10  | 3,628,800                     |
| 20  | 2,432,902,008,176,640,000     |
| 52  | $\approx 8.07 \times 10^{67}$ |

The last entry is the number of ways to shuffle a standard deck of cards. That number is so large that every shuffle you have ever performed almost certainly produced an ordering that has never existed before in history and never will again.

### Partial Permutations

The number of ways to choose and arrange $k$ objects from $n$ distinct objects (order matters) is:

$$P(n, k) = \frac{n!}{(n-k)!} = n \times (n-1) \times \cdots \times (n-k+1)$$

This counts the number of $k$-length sequences drawn without replacement from $n$ objects. Choosing a president, vice president, and treasurer from 20 people: $P(20, 3) = 20 \times 19 \times 18 = 6{,}840$.

### Permutations with Repetition

When objects are not all distinct, we divide out the overcounting. If there are $n$ objects where $n_1$ are identical of type 1, $n_2$ are identical of type 2, etc.:

$$\frac{n!}{n_1! \cdot n_2! \cdots n_r!}$$

The word MISSISSIPPI has 11 letters: 1 M, 4 I's, 4 S's, 2 P's. The number of distinct arrangements is:

$$\frac{11!}{1! \cdot 4! \cdot 4! \cdot 2!} = \frac{39{,}916{,}800}{1 \cdot 24 \cdot 24 \cdot 2} = 34{,}650$$

<python-figure src="factorial-growth" caption="Factorial growth compared to exponential growth. n! overtakes 2^n at n = 4 and grows far faster. By n = 20, 20! is roughly 10^18 while 2^20 is only about 10^6."></python-figure>

---

## Combinations

### Definition

A **combination** is an unordered selection of $k$ objects from $n$ distinct objects. The number of such selections is the **binomial coefficient**:

$$\binom{n}{k} = \frac{n!}{k!(n-k)!}$$

Read "$n$ choose $k$." Since order does not matter, we divide the number of permutations $P(n,k)$ by $k!$ (the number of ways to arrange the $k$ chosen objects):

$$\binom{n}{k} = \frac{P(n,k)}{k!} = \frac{n!}{k!(n-k)!}$$

### Key Properties

**Symmetry:**
$$\binom{n}{k} = \binom{n}{n-k}$$

Choosing $k$ objects to include is the same as choosing $n-k$ objects to exclude.

**Pascal's Identity:**
$$\binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}$$

Each object is either included (leaving $k-1$ to choose from $n-1$) or excluded (leaving $k$ to choose from $n-1$). This identity generates **Pascal's Triangle**, where each entry is the sum of the two entries above it.

**Boundary values:**
$$\binom{n}{0} = \binom{n}{n} = 1$$

There is exactly one way to choose nothing, and one way to choose everything.

### Examples

**Lottery:** Choose 6 numbers from 49. The number of possible tickets is $\binom{49}{6} = 13{,}983{,}816$.

**Committees:** Choose a 4-person committee from 10 people: $\binom{10}{4} = 210$.

**Card hands:** A 5-card poker hand from a 52-card deck: $\binom{52}{5} = 2{,}598{,}960$.

<python-figure src="pascals-triangle" caption="The first 10 rows of Pascal's Triangle. Each entry is C(n,k) and equals the sum of the two entries above. The triangle encodes all binomial coefficients and exhibits striking symmetry."></python-figure>

---

## The Binomial Theorem

### Statement

For any real number $x$ and $y$, and non-negative integer $n$:

$$(x + y)^n = \sum_{k=0}^{n} \binom{n}{k} x^k y^{n-k}$$

The binomial coefficients are exactly the numbers that appear when you expand $(x + y)^n$. This is why $\binom{n}{k}$ is called a binomial coefficient - it is the coefficient of $x^k y^{n-k}$ in the binomial expansion.

### Special Cases

**Setting $x = y = 1$:**

$$2^n = \sum_{k=0}^{n} \binom{n}{k}$$

The total number of subsets of an $n$-element set is $2^n$, because each element is either included or excluded.

**Setting $x = 1, y = -1$:**

$$0 = \sum_{k=0}^{n} (-1)^k \binom{n}{k}$$

The number of even-sized subsets equals the number of odd-sized subsets (for $n \geq 1$).

### Connection to Probability

If you flip a biased coin $n$ times, where each flip has probability $p$ of heads and $q = 1 - p$ of tails, the probability of exactly $k$ heads is:

$$P(X = k) = \binom{n}{k} p^k q^{n-k}$$

This is the **binomial distribution**. The binomial theorem tells us these probabilities sum to 1:

$$(p + q)^n = \sum_{k=0}^{n} \binom{n}{k} p^k q^{n-k} = 1^n = 1$$

<python-figure src="binomial-distributions" caption="Binomial distributions for n = 20 flips with different success probabilities p. As p increases from 0.2 to 0.8, the distribution shifts right. The distribution is symmetric when p = 0.5."></python-figure>

---

## The Inclusion-Exclusion Principle

### Two Events (Review)

From basic probability, we know:

$$|A \cup B| = |A| + |B| - |A \cap B|$$

We add the sizes of $A$ and $B$, then subtract the intersection to correct for double-counting.

### Three Events

$$|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$$

The pattern alternates: add individual sets, subtract pairwise intersections, add the triple intersection.

### General Formula

For $n$ events $A_1, A_2, \ldots, A_n$:

$$\left|\bigcup_{i=1}^{n} A_i\right| = \sum_{i} |A_i| - \sum_{i < j} |A_i \cap A_j| + \sum_{i < j < k} |A_i \cap A_j \cap A_k| - \cdots + (-1)^{n+1} |A_1 \cap A_2 \cap \cdots \cap A_n|$$

Or more compactly:

$$\left|\bigcup_{i=1}^{n} A_i\right| = \sum_{\emptyset \neq S \subseteq [n]} (-1)^{|S|+1} \left|\bigcap_{i \in S} A_i\right|$$

### Why It Works

Think of an element $x$ that belongs to exactly $m$ of the $n$ sets. The alternating sum counts $x$ exactly:

$$\binom{m}{1} - \binom{m}{2} + \binom{m}{3} - \cdots + (-1)^{m+1}\binom{m}{m} = 1$$

This follows from the binomial identity with $x = 1, y = -1$: $\sum_{k=0}^{m} (-1)^k \binom{m}{k} = 0$, so $\sum_{k=1}^{m} (-1)^{k+1} \binom{m}{k} = 1$.

Every element in the union is counted exactly once. Inclusion-exclusion is the tool you reach for when direct counting is hard but counting intersections is easy.

---

## Example: Poker Hands

### Setup

Poker is a card game in which each player receives a hand of 5 cards from a standard 52-card deck. There are 13 values (2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A) and 4 suits (hearts, diamonds, clubs, spades). The total number of possible 5-card hands is:

$$\binom{52}{5} = \frac{52!}{5! \cdot 47!} = 2{,}598{,}960$$

We compute the probability of three specific hands.

### Four of a Kind

A four-of-a-kind hand contains all 4 cards of one value plus 1 card of a different value.

**Step 1:** Choose the value for the four of a kind: $\binom{13}{1} = 13$ ways.

**Step 2:** All 4 suits are included for that value: $\binom{4}{4} = 1$ way.

**Step 3:** Choose the remaining card from the other $52 - 4 = 48$ cards: $\binom{48}{1} = 48$ ways.

$$\text{Four of a kind} = 13 \times 1 \times 48 = 624$$

$$P(\text{four of a kind}) = \frac{624}{2{,}598{,}960} \approx 0.0240\%$$

### Full House

A full house contains 3 cards of one value and 2 cards of another value.

**Step 1:** Choose the value for the triple: $\binom{13}{1} = 13$ ways.

**Step 2:** Choose 3 suits from 4 for the triple: $\binom{4}{3} = 4$ ways.

**Step 3:** Choose the value for the pair (from the remaining 12 values): $\binom{12}{1} = 12$ ways.

**Step 4:** Choose 2 suits from 4 for the pair: $\binom{4}{2} = 6$ ways.

$$\text{Full house} = 13 \times 4 \times 12 \times 6 = 3{,}744$$

$$P(\text{full house}) = \frac{3{,}744}{2{,}598{,}960} \approx 0.1441\%$$

### Two Pairs

A two-pair hand contains 2 cards of one value, 2 cards of another value, and 1 card of a third value.

**Step 1:** Choose the 2 values that form pairs: $\binom{13}{2} = 78$ ways. (We use $\binom{13}{2}$ rather than $13 \times 12$ because the two pairs are interchangeable - a hand with a pair of 7s and a pair of Kings is the same as a pair of Kings and a pair of 7s.)

**Step 2:** Choose 2 suits from 4 for the first pair: $\binom{4}{2} = 6$ ways.

**Step 3:** Choose 2 suits from 4 for the second pair: $\binom{4}{2} = 6$ ways.

**Step 4:** Choose the fifth card from the remaining $52 - 8 = 44$ cards (excluding all cards of the two paired values): $\binom{44}{1} = 44$ ways.

$$\text{Two pairs} = 78 \times 6 \times 6 \times 44 = 123{,}552$$

$$P(\text{two pairs}) = \frac{123{,}552}{2{,}598{,}960} \approx 4.7539\%$$

<python-figure src="poker-hand-probabilities" caption="Probabilities of various poker hands on a log scale. The rarer the hand, the higher its rank. Four of a kind is about 200 times less likely than two pairs."></python-figure>

### Verification with Python

```python
from math import comb

total = comb(52, 5)  # 2,598,960

four_kind = 13 * comb(4, 4) * 48  # 624
full_house = 13 * comb(4, 3) * 12 * comb(4, 2)  # 3,744
two_pair = comb(13, 2) * comb(4, 2)**2 * 44  # 123,552

for name, count in [("Four of a kind", four_kind),
                     ("Full house", full_house),
                     ("Two pairs", two_pair)]:
    print(f"{name}: {count:,} hands, P = {count/total:.4%}")
```

Output:

```
Four of a kind: 624 hands, P = 0.0240%
Full house: 3,744 hands, P = 0.1441%
Two pairs: 123,552 hands, P = 4.7539%
```

---

## Example: Hopping Rabbit

### The Problem

A rabbit sits at the bottom of a staircase with $n$ stairs. The rabbit can hop up either 1 or 2 stairs at a time. How many different ways can the rabbit ascend to the top?

### Small Cases

Let $f(n)$ be the number of ways to climb $n$ stairs.

- $f(1) = 1$: the only way is a single hop of 1.
- $f(2) = 2$: either two single hops (1+1) or one double hop (2).
- $f(3) = 3$: the paths are 1+1+1, 1+2, 2+1.
- $f(4) = 5$: the paths are 1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2.

### The Recurrence

The rabbit's last hop is either 1 stair (from stair $n-1$) or 2 stairs (from stair $n-2$). These two cases are mutually exclusive, so:

$$f(n) = f(n-1) + f(n-2)$$

with base cases $f(1) = 1$ and $f(2) = 2$.

This is the **Fibonacci sequence** (shifted by one index). The values are $1, 2, 3, 5, 8, 13, 21, 34, 55, 89, \ldots$

### Why It Is Fibonacci

The recurrence $f(n) = f(n-1) + f(n-2)$ arises because each path either starts with a 1-hop (leaving $n-1$ stairs) or a 2-hop (leaving $n-2$ stairs). The basic counting principle says we add the two cases because they are disjoint, and the subproblems are independent.

### Closed-Form Solution

The Fibonacci recurrence has a closed-form solution via the characteristic equation $x^2 = x + 1$, which has roots $\phi = \frac{1+\sqrt{5}}{2}$ (the golden ratio) and $\psi = \frac{1-\sqrt{5}}{2}$. The general solution is:

$$f(n) = \frac{\phi^{n+1} - \psi^{n+1}}{\sqrt{5}}$$

Since $|\psi| < 1$, the $\psi^{n+1}$ term vanishes for large $n$, and $f(n) \approx \frac{\phi^{n+1}}{\sqrt{5}}$. The number of paths grows exponentially with the golden ratio as the base.

<python-figure src="hopping-rabbit" caption="Number of ways for the rabbit to climb n stairs. The count follows the Fibonacci sequence and grows exponentially at rate phi ≈ 1.618."></python-figure>

### Python Implementation

```python
def rabbit_ways(n):
    """Count ways to climb n stairs with hops of 1 or 2."""
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b

for n in [1, 2, 3, 5, 10, 20, 50]:
    print(f"n={n}: {rabbit_ways(n)} ways")
```

Output:

```
n=1: 1 ways
n=2: 2 ways
n=3: 3 ways
n=5: 8 ways
n=10: 89 ways
n=20: 10946 ways
n=50: 20365011074 ways
```

---

## Example: Screwy Pirates 2

### The Problem

A pirate crew of 11 members puts all their loot in a safe. Being democratic, they decide that only a majority - any 6 or more pirates together - can open the safe. They hire a locksmith to install locks on the safe. Every lock must be opened to access the treasure, and each lock can have multiple keys. The locksmith can give more than one key to each pirate.

What is the smallest number of locks needed, and how many keys must each pirate carry?

### The Key Insight

The requirement is: any group of 6 pirates can open the safe, but no group of 5 pirates can.

For a group of 5 pirates to be unable to open the safe, there must be at least one lock for which none of those 5 pirates has a key. That means the keys for that lock are held only by the other $11 - 5 = 6$ pirates.

Conversely, for any group of 6 pirates to be able to open every lock, every lock must have at least one key held by someone in that group.

### Counting the Locks

Consider any specific group of 5 pirates. There must be a lock that none of them can open - meaning all keys for that lock belong to the complementary group of 6 pirates. Different groups of 5 need different locks, because if two groups of 5 shared the same "blocking lock," then the union of pirates excluded from that lock would include fewer than 6 pirates, which may not work.

More precisely: for each subset of 5 pirates, we need a lock whose keys are distributed among the remaining 6 pirates. Each subset of 5 produces a unique complementary set of 6, so we need one lock for each such subset.

The number of subsets of 5 pirates from 11 is:

$$\binom{11}{5} = 462$$

So we need **462 locks**.

### How Many Keys Per Pirate?

A pirate holds a key to a lock if and only if they are in the complementary group of 6 for that lock. Each lock corresponds to a group of 5 pirates who are excluded, so a pirate holds a key to a lock if and only if they are NOT in the excluded group of 5.

How many locks is a given pirate excluded from? That is the number of 5-pirate subsets that include this pirate, which is $\binom{10}{4} = 210$ (choose the other 4 from the remaining 10).

So each pirate has a key to:

$$462 - 210 = 252 \text{ locks}$$

We can verify: $\binom{10}{5} = 252$. This makes sense - a pirate holds a key to every lock whose "excluded group" does not contain them, and there are $\binom{10}{5}$ ways to choose 5 excluded pirates from the other 10.

**Answer:** 462 locks, each pirate carries 252 keys.

### Generalisation

For $n$ pirates with majority $m = \lceil (n+1)/2 \rceil$, the number of locks is $\binom{n}{m-1}$ and each pirate carries $\binom{n-1}{m-1}$ keys. The combinatorial explosion is severe - this is why real secret-sharing schemes (like Shamir's Secret Sharing) use polynomial algebra instead of physical locks.

---

## Example: Chess Tournament

### The Problem

A chess tournament has $2^n$ players with skill levels $1 > 2 > 3 > \cdots > 2^n$ (player 1 is the best). It is a single-elimination (knockout) tournament: opponents in each round are drawn at random, and the better player always wins. What is the probability that players 1 and 2 meet in the final?

### Structure of the Tournament

In each round, the remaining players are paired uniformly at random. There are $n$ rounds total (since the number of players halves each round: $2^n \to 2^{n-1} \to \cdots \to 2 \to 1$).

Since the better player always wins, player 1 will definitely reach the final. Player 2 will lose only if they face player 1 before the final. So the question becomes: what is the probability that players 1 and 2 are placed in opposite halves of the bracket?

### The Solution

Think of the bracket as a binary tree with $2^n$ leaves. In the first round, the $2^n$ players are assigned to $2^n$ positions uniformly at random.

The bracket naturally splits into two halves of size $2^{n-1}$: the top half and the bottom half. The winners of each half meet in the final. Players 1 and 2 meet in the final if and only if they are in different halves.

After player 1 is placed somewhere in the bracket, player 2 is equally likely to be in any of the remaining $2^n - 1$ positions. The number of positions in the opposite half from player 1 is $2^{n-1}$.

$$P(\text{1 and 2 meet in the final}) = \frac{2^{n-1}}{2^n - 1}$$

### Checking Small Cases

For $n = 1$ (2 players): $P = \frac{1}{1} = 1$. Trivially, the only match is the final.

For $n = 2$ (4 players): $P = \frac{2}{3}$. Player 2 is placed in one of 3 remaining spots, 2 of which are in the opposite half.

For $n = 3$ (8 players): $P = \frac{4}{7} \approx 0.571$.

For $n = 4$ (16 players): $P = \frac{8}{15} \approx 0.533$.

As $n \to \infty$: $P \to \frac{1}{2}$. With a large tournament, it is roughly a coin flip.

<python-figure src="chess-tournament" caption="Probability that the top two players meet in the final of a knockout tournament with 2^n players. The probability starts at 1 for n=1 and converges to 1/2 as the tournament grows."></python-figure>

### Why Not Exactly 1/2?

In a truly random bracket, the probability of any two specific players being in opposite halves is $\frac{2^{n-1}}{2^n - 1}$, not $\frac{1}{2}$, because we condition on the two players being in different positions ($2^n - 1$ remaining positions, not $2^n$). The discrete nature of the bracket introduces a slight upward bias that disappears as $n$ grows.

---

## Example: Application Letters

### The Problem

You send job applications to 5 firms: Morgan Stanley, Lehman Brothers, UBS, Goldman Sachs, and Merrill Lynch. You have 5 envelopes on the table neatly typed with names and addresses of contacts at these 5 firms, and 5 cover letters personalised for each. Your 3-year-old tries to be helpful and randomly stuffs each cover letter into an envelope (one letter per envelope, no repeats). What is the probability that **all 5** cover letters end up in the wrong envelopes?

### Derangements

A permutation where no element appears in its original position is called a **derangement**. We need to count the number of derangements of 5 elements, written $D_5$.

### Applying Inclusion-Exclusion

Let $A_i$ be the event that letter $i$ is in the correct envelope ($i = 1, 2, 3, 4, 5$). We want $P(\text{all wrong})$, which is the probability that none of the $A_i$ occur:

$$P(\text{all wrong}) = 1 - P(A_1 \cup A_2 \cup A_3 \cup A_4 \cup A_5)$$

By inclusion-exclusion:

$$P\left(\bigcup_{i=1}^{5} A_i\right) = \sum_i P(A_i) - \sum_{i<j} P(A_i \cap A_j) + \sum_{i<j<k} P(A_i \cap A_j \cap A_k) - \cdots$$

**Computing each term:**

If exactly $k$ specific letters are in the correct envelopes, the remaining $5-k$ letters can be in any of $(5-k)!$ arrangements. The total number of arrangements is $5! = 120$.

$$P(A_{i_1} \cap \cdots \cap A_{i_k}) = \frac{(5-k)!}{5!}$$

The number of ways to choose $k$ specific letters from 5 is $\binom{5}{k}$, so:

$$\sum_{|S|=k} P\left(\bigcap_{i \in S} A_i\right) = \binom{5}{k} \cdot \frac{(5-k)!}{5!} = \frac{1}{k!}$$

Therefore:

$$P\left(\bigcup_{i=1}^{5} A_i\right) = \frac{1}{1!} - \frac{1}{2!} + \frac{1}{3!} - \frac{1}{4!} + \frac{1}{5!} = 1 - \frac{1}{2} + \frac{1}{6} - \frac{1}{24} + \frac{1}{120} = \frac{76}{120}$$

So:

$$P(\text{all wrong}) = 1 - \frac{76}{120} = \frac{44}{120} = \frac{11}{30} \approx 0.3667$$

### The General Derangement Formula

For $n$ elements, the same argument gives:

$$D_n = n! \sum_{k=0}^{n} \frac{(-1)^k}{k!}$$

$$\frac{D_n}{n!} = \sum_{k=0}^{n} \frac{(-1)^k}{k!} \to \frac{1}{e} \approx 0.3679 \text{ as } n \to \infty$$

The probability of a random permutation being a derangement converges rapidly to $\frac{1}{e}$. Even for $n = 5$, the exact value $\frac{11}{30} \approx 0.3667$ is already very close to $\frac{1}{e} \approx 0.3679$.

<python-figure src="derangement-convergence" caption="Probability that a random permutation of n elements is a derangement (all elements displaced). The exact values D_n/n! converge rapidly to 1/e ≈ 0.3679."></python-figure>

### Intuition

It is surprising that about 37% of random permutations are derangements regardless of $n$. With 5 letters or 5 million letters, roughly the same fraction will have every element displaced. This stability comes from the rapid convergence of the Taylor series $e^{-1} = \sum_{k=0}^{\infty} \frac{(-1)^k}{k!}$, which the derangement probability approximates exactly through $n$ terms.

---

## Example: The Birthday Problem

### The Problem

How many people do we need in a room to make the probability that at least two people share a birthday greater than $\frac{1}{2}$? For simplicity, assume 365 days in a year and that birthdays are uniformly distributed.

### Setting Up

Let $n$ be the number of people. It is easier to compute the complement - the probability that all $n$ birthdays are distinct:

$$P(\text{all different}) = \frac{365}{365} \times \frac{364}{365} \times \frac{363}{365} \times \cdots \times \frac{365 - n + 1}{365}$$

$$= \prod_{i=0}^{n-1} \frac{365 - i}{365} = \frac{P(365, n)}{365^n}$$

The first person can have any birthday ($\frac{365}{365}$). The second must avoid the first person's birthday ($\frac{364}{365}$). The third must avoid two birthdays ($\frac{363}{365}$). And so on.

We want:

$$P(\text{at least one shared birthday}) = 1 - P(\text{all different}) > \frac{1}{2}$$

### Computing the Answer

| $n$    | $P(\text{all different})$ | $P(\text{shared birthday})$ |
| ------ | ------------------------- | --------------------------- |
| 10     | 0.8831                    | 0.1169                      |
| 20     | 0.5886                    | 0.4114                      |
| 22     | 0.5243                    | 0.4757                      |
| **23** | **0.4927**                | **0.5073**                  |
| 30     | 0.2937                    | 0.7063                      |
| 50     | 0.0296                    | 0.9704                      |
| 57     | 0.0099                    | 0.9901                      |

The answer is **23 people**. With just 23 people in a room, there is a better than 50% chance that two share a birthday.

<python-figure src="birthday-problem" caption="Probability that at least two people in a group share a birthday. The 50% threshold is crossed at n = 23 people, and by n = 57 the probability exceeds 99%."></python-figure>

### Why 23 Feels Wrong

Most people guess the answer should be around 183 (half of 365). The error is confusing two different questions:

1. "What is the probability that someone shares **your** birthday?" - this requires about 253 people for a 50% chance.
2. "What is the probability that **any two people** share a birthday?" - this is the actual question.

The second question is much easier to satisfy because the number of pairs grows quadratically. With $n$ people, there are $\binom{n}{2} = \frac{n(n-1)}{2}$ pairs. With 23 people, that is $\binom{23}{2} = 253$ pairs - each pair is a potential match. The quadratic growth of pairs is why the answer is roughly $\sqrt{365} \approx 19$, with the exact answer being 23.

### Application in Quantitative Finance

The birthday problem has a direct analogue in hash collision analysis and Monte Carlo simulation. If you generate $n$ random scenario IDs from a space of size $N$, the probability of a collision follows the birthday formula. This is why you need far fewer random samples than you might expect to encounter duplicates - a critical consideration when seeding random number generators for parallel Monte Carlo runs.

---

## Example: 100th Digit

### The Problem

What is the 100th digit to the right of the decimal point in the decimal representation of $(1 + \sqrt{2})^{3000}$?

### Setup with the Binomial Theorem

Let $\alpha = 1 + \sqrt{2}$ and $\beta = 1 - \sqrt{2}$. Note that $\alpha$ and $\beta$ are roots of $x^2 - 2x - 1 = 0$.

By the binomial theorem:

$$\alpha^{3000} = (1 + \sqrt{2})^{3000} = \sum_{k=0}^{3000} \binom{3000}{k} (\sqrt{2})^k$$

$$\beta^{3000} = (1 - \sqrt{2})^{3000} = \sum_{k=0}^{3000} \binom{3000}{k} (-\sqrt{2})^k$$

### The Key Trick

When we add $\alpha^{3000} + \beta^{3000}$, all the terms with odd $k$ cancel (because $(\sqrt{2})^k + (-\sqrt{2})^k = 0$ when $k$ is odd), and the even terms double:

$$\alpha^{3000} + \beta^{3000} = 2 \sum_{\substack{k=0 \\ k \text{ even}}}^{3000} \binom{3000}{k} 2^{k/2}$$

Every term in this sum is an integer (binomial coefficients are integers, and $2^{k/2}$ is an integer when $k$ is even). Therefore $\alpha^{3000} + \beta^{3000}$ is an integer. Call it $N$:

$$N = \alpha^{3000} + \beta^{3000} \in \mathbb{Z}$$

### Pinning Down $\beta^{3000}$

Now, $\beta = 1 - \sqrt{2} \approx -0.4142$. So $|\beta| < 1$, and $|\beta|^{3000}$ is astronomically small:

$$|\beta^{3000}| = |1 - \sqrt{2}|^{3000} \approx 0.4142^{3000}$$

Since $3000$ is even, $\beta^{3000} > 0$ (negative number raised to an even power). And $0 < \beta^{3000} < 1$ since $|\beta| < 1$.

### The Answer

We have:

$$\alpha^{3000} = N - \beta^{3000}$$

where $N$ is an integer and $0 < \beta^{3000} < 1$. Therefore:

$$\alpha^{3000} = (N - 1) + (1 - \beta^{3000})$$

The integer part of $\alpha^{3000}$ is $N - 1$, and the fractional part is $1 - \beta^{3000}$.

Since $\beta^{3000}$ is a tiny positive number (practically zero), $1 - \beta^{3000}$ is just below 1. Its decimal expansion is:

$$1 - \beta^{3000} = 0.\underbrace{99\ldots9}_{?}\ldots$$

In fact, $\beta^{3000}$ is so small (far less than $10^{-100}$) that $1 - \beta^{3000}$ has at least the first several hundred digits all equal to 9.

Formally: $|\beta|^{3000} = (0.4142\ldots)^{3000} < (0.5)^{3000} = 2^{-3000}$. And $2^{-3000} < 10^{-900}$ (since $2^{10} = 1024 > 10^3$, so $2^{3000} > 10^{900}$). This means the fractional part $1 - \beta^{3000}$ has at least 900 nines after the decimal point.

The 100th digit to the right of the decimal point is **9**.

---

## Example: Cube of an Integer

### The Problem

Let $x$ be an integer chosen uniformly at random between 1 and $10^{12}$. What is the probability that $x^3$ ends with 11 (that is, $x^3 \equiv 11 \pmod{100}$)?

### Reducing the Problem

The last two digits of $x^3$ depend only on the last two digits of $x$. That is, $x^3 \pmod{100}$ depends only on $x \pmod{100}$.

So we need to count how many values $x \in \{0, 1, 2, \ldots, 99\}$ satisfy $x^3 \equiv 11 \pmod{100}$.

### Brute Force Search

We can simply check all 100 residues:

```python
solutions = [x for x in range(100) if (x**3) % 100 == 11]
print(solutions)  # [71]
```

The only solution is $x \equiv 71 \pmod{100}$. Let us verify: $71^3 = 357{,}911$, and indeed the last two digits are 11.

### Why Only One Solution

We can understand this through the Chinese Remainder Theorem. Since $100 = 4 \times 25$ and $\gcd(4, 25) = 1$:

$$x^3 \equiv 11 \pmod{100} \iff \begin{cases} x^3 \equiv 3 \pmod{4} \\ x^3 \equiv 11 \pmod{25} \end{cases}$$

**Modulo 4:** The cubes mod 4 are: $0^3 \equiv 0$, $1^3 \equiv 1$, $2^3 \equiv 0$, $3^3 \equiv 3$. So $x \equiv 3 \pmod{4}$.

**Modulo 25:** We need $x^3 \equiv 11 \pmod{25}$. Checking or using the fact that the cubing map is a bijection modulo 25 (since $\gcd(3, \phi(25)) = \gcd(3, 20) = 1$), the unique solution is $x \equiv 21 \pmod{25}$.

By CRT, $x \equiv 3 \pmod{4}$ and $x \equiv 21 \pmod{25}$ gives a unique solution modulo 100. Solving: $x = 25k + 21$ and we need $25k + 21 \equiv 3 \pmod{4}$, i.e. $k + 1 \equiv 3 \pmod{4}$, so $k \equiv 2 \pmod{4}$, giving $x = 25(2) + 21 = 71$. This confirms $x \equiv 71 \pmod{100}$.

### Computing the Probability

Among integers from 1 to $10^{12}$, exactly $\frac{10^{12}}{100} = 10^{10}$ have last two digits equal to 71 (namely $71, 171, 271, \ldots, 10^{12} - 29$).

$$P(x^3 \text{ ends with } 11) = \frac{10^{10}}{10^{12}} = \frac{1}{100} = 0.01$$

<python-figure src="cube-residues" caption="Distribution of the last two digits of x^3 for x = 0, 1, ..., 99. Each residue class modulo 100 maps to exactly one cube residue. The value 11 is hit by exactly one input: x = 71."></python-figure>

---

## Conclusion

The five tools of combinatorial analysis form a complete counting toolkit:

1. **The basic counting principle** multiplies choices across sequential steps - the foundation for counting compound experiments
2. **Permutations** count ordered arrangements, with the factorial function capturing the explosive growth of possibilities
3. **Combinations** count unordered selections via binomial coefficients - the core of most probability calculations
4. **The binomial theorem** connects binomial coefficients to polynomial algebra and probability distributions
5. **Inclusion-exclusion** handles overlapping events by alternating between addition and subtraction - essential when direct counting fails

The eight examples showed these tools in action across different domains:

- **Poker hands** applied combinations to count favorable outcomes in a finite sample space
- **Hopping rabbit** uncovered the Fibonacci sequence through a simple recurrence built on the counting principle
- **Screwy pirates** used combinations to design a threshold secret-sharing scheme
- **Chess tournament** combined bracket structure with counting to find an exact probability formula
- **Application letters** demonstrated inclusion-exclusion to derive the derangement formula, revealing the deep connection to $1/e$
- **Birthday problem** used complement counting and the multiplication principle to solve a problem that defies intuition
- **100th digit** exploited the binomial theorem and conjugate surds to determine a specific digit of an enormous number without computing it
- **Cube of an integer** combined modular arithmetic with the Chinese Remainder Theorem to reduce an astronomical counting problem to a search over 100 values

For further reading, Richard Stanley's _Enumerative Combinatorics_ is the definitive reference for the field. For a more accessible and puzzle-driven approach, Miklos Bona's _A Walk Through Combinatorics_ covers the same foundations with many worked problems. The poker probability calculations extend naturally to the full hand ranking system, which is a nice exercise in applying combinations and inclusion-exclusion systematically.
