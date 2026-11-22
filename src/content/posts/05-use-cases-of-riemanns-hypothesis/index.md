---
title: "Use cases of Riemann's Hypothesis"
date: '2026-11-22'
description: "A new Anthropic-linked proof of the Riemann Hypothesis is being confirmed. Where RH and GRH are relied on today, with charts, and an educated guess at what gets discovered next."
tags: ['maths']
---

On 20 November 2026, Levent Alpöge, a mathematician at Anthropic, announced that he had found a proof of the Riemann Hypothesis (RH) [working with Claude](https://www.scientificamerican.com/article/anthropic-mathematician-claims-to-prove-riemann-hypothesis-most-famous-problem-in-all-of-math/), and says it confirms the Generalised Riemann Hypothesis (GRH) too. The proof is written in the Lean proof assistant. MIT's Andrew Sutherland independently compiled it in Lean, but he adds that "there is much work to be done to understand the mathematical details." So this is **a new proof that is still being confirmed**, not yet settled.

That makes this a good moment to ask what the hypothesis is actually for. Until now, "use cases" meant something specific: **places where people assumed it was true to get a clean result.** Think of it as an engineering assumption, "the bridge will hold", while waiting for the structural certificate. If the proof holds up, the certificate has arrived.

The charts marked **real data** are computed in your browser. The two marked **editorial** are my own judgement, and I say so on the chart.

## What is being assumed

RH says every non-trivial zero of the Riemann zeta function has real part exactly 1/2. In practice that is a statement about **how evenly the primes are spread**: it pins the error in the prime count to roughly the square root of x.

GRH makes the same claim for a whole family of cousins (Dirichlet L-functions and their number-field versions). It controls how primes spread across **residue classes**, like numbers ending in 1, 3, 7 or 9.

```note
Some cousins of RH are already **proved**. Weil proved it for curves over finite fields and Deligne for higher-dimensional varieties. Those proofs are used all the time, for example in error-correcting codes. The number-field cases were the open ones, and they are what the new proof targets.
```

## Where GRH is leaned on today

<riemann-chart kind="industries"></riemann-chart>

```warning
**Editorial estimate, not measured data.** Nobody has surveyed this. The slices are my rough weighting of how much each field leans on GRH, based on where it shows up in the literature. Treat the ordering as meaningful and the exact percentages as not.
```

The headline: GRH is a **tool inside computational number theory**, not something an app, a bank or a hospital calls directly.

| Field                       | What GRH buys you                              | Concrete example                                           |
| --------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| Computational number theory | Algorithms with provable running times         | Deterministic Miller primality test, Shanks–Tonelli        |
| Algebraic number theory     | Bounds on arithmetic invariants                | Class groups and class numbers                             |
| Prime distribution          | Control over primes in residue classes         | Least prime in an arithmetic progression                   |
| Arithmetic geometry         | Structure of rational points                   | L-functions of elliptic curves (Birch–Swinnerton-Dyer)     |
| Cryptography analysis       | Honest runtime and parameter analysis          | Class-group-action schemes such as CSIDH                   |
| Symbolic computation        | Deterministic polynomial factoring             | Factoring over finite fields                               |

## Use case 1: primality testing

The Miller test checks whether `n` is prime by trying "witness" numbers `a`. The question is how many `a` you must try before you can be certain. Under GRH, Bach showed it is enough to check every `a` up to about 2·(ln n)². Without GRH, no such short list is proved.

<riemann-chart kind="witnesses"></riemann-chart>

**Real data**, straight from the formula. For a 2048-bit number, about 4 million witnesses under GRH. Trial division would need around 10³⁰⁸ steps. That gap is why a one-line assumption is worth making.

```note
Primality no longer *needs* GRH. The AKS test (2002) is unconditional and polynomial-time. In practice, software uses the fast randomised Miller–Rabin test and never relies on GRH at all. The GRH version matters as a clean theoretical guarantee.
```

## Use case 2: how evenly primes are spread

Primes above 5 end in 1, 3, 7 or 9. GRH (and the weaker, proved Dirichlet theorem) says each gets an equal share in the long run.

<riemann-chart kind="residues"></riemann-chart>

**Real data**: all primes below one million. The four shares sit within a fraction of a percent of each other.

GRH goes further than "equal in the limit". It bounds how far the counts can drift apart, with an error of about √x · ln x. And the drift is real. Split primes by remainder mod 4 and the "3 mod 4" team usually leads, a pattern called Chebyshev's bias.

<riemann-chart kind="race"></riemann-chart>

**Real data**: lead of primes ≡ 3 (mod 4) over primes ≡ 1 (mod 4), up to one million. The 1-mod-4 team first takes the lead at 26,861. The lead is positive most of the time, which Rubinstein and Sarnak explained, assuming GRH plus a standard independence conjecture about the zeros.

## Use case 3: algebra and curves

- **Class groups.** Under GRH the class group of a number field is generated by primes of size about ln²|Δ|. That turns an open-ended search into a short, bounded one.
- **Small witnesses everywhere.** Under GRH the least quadratic non-residue mod p is at most 2·ln²p, and every prime has a primitive root below about (ln p)⁶.
- **Elliptic curves.** The Birch–Swinnerton-Dyer conjecture ties a curve's L-function to its rational points. RH-type statements on those L-functions govern how the point counts behave.

## What I would bet on next

Obviously nobody can tell. This is inference: look for fields that already **depend on primes, finite fields, curves or hidden symmetry, but currently tolerate uncertainty or slow algorithms**. The question to ask is "how evenly distributed is this arithmetic object?"

<riemann-chart kind="outlook"></riemann-chart>

Positions are **editorial**. Horizontal: how close the field already is to where GRH is used. Vertical: how big the headline would be if something landed.

### 1. Algorithmic number theory (most likely)

It is already where GRH is operationally embedded. A proof, or even a new method on the way to one, would most plausibly give algorithms that are not just faster versions of existing GRH-conditional ones. Think better class-group and discrete-log style computations. Impact: quiet, but real for anyone building mathematical software.

### 2. Arithmetic geometry

If a proof gives a new handle on zeros of L-functions, the first payoff is likely new results on elliptic curves, modular forms and rational points. Plausible next step: movement on ranks of elliptic curves.

### 3. Cryptographic analysis

Not "encryption broken". More likely sharper security analysis and better parameter choices for schemes built on class groups or isogenies, which are the ones whose runtime analysis already leans on GRH. RSA and elliptic-curve security do not rest on RH being true or false.

### 4. Machine learning for mathematics

Here ML is a research tool, not a customer of GRH. L-functions produce huge structured datasets, and pattern-hunting has already paid off: in 2022 researchers found "murmurations" in elliptic-curve data, a statistical pattern nobody had predicted. Expect more conjectures found this way, and a few proved.

### 5. Pseudorandomness and coding theory

Character sums, which GRH controls, measure how random arithmetic sequences look. Expect better derandomisation and sequence constructions. Coding theory already runs on the *proved* finite-field RH (algebraic-geometry codes), so a number-field proof would likely give new constructions rather than rescue existing ones.

### 6. Physics (least certain, biggest headline)

Montgomery and Dyson noticed that spacings between zeta zeros match the energy-level statistics of random quantum systems. The Hilbert–Pólya idea is that the zeros are the spectrum of some operator. That bridge is real and suggestive, but a proof would not by itself give a quantum computer, a particle or a better battery. If anything useful appears, it will be a new mathematical object, not a gadget.

## How to reason about it

GRH's next use will probably show up wherever someone is already asking "how evenly spread is this?" Primes in classes, points on curves, prime ideals in number fields, roots over finite fields, random-looking sequences.

And the part most likely to produce the genuinely new thing is the **method of the proof**, not the fact that "GRH is true". Everyone already behaves as if it is.
