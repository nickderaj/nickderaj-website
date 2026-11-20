---
title: 'Limits and Derivatives: The Calculus Behind Quantitative Finance'
date: '2026-03-21'
description: "A comprehensive guide to derivatives and differentiation rules - power rule, product rule, quotient rule, chain rule - with optimization techniques, the second derivative test, and L'Hopital's rule, all grounded in quantitative finance applications."
tags: ['math', 'calculus', 'quant']
---

<table-of-contents>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#limits-the-foundation">Limits: The Foundation</a></li>
<li><a href="#what-is-a-derivative">What Is a Derivative?</a></li>
<li><a href="#basic-differentiation-rules">Basic Differentiation Rules</a></li>
<li><a href="#the-product-rule">The Product Rule</a></li>
<li><a href="#the-quotient-rule">The Quotient Rule</a></li>
<li><a href="#the-chain-rule">The Chain Rule</a></li>
<li><a href="#the-generalised-power-rule">The Generalised Power Rule</a></li>
<li><a href="#other-useful-differentiation-formulas">Other Useful Differentiation Formulas</a></li>
<li><a href="#maxima-and-minima">Maxima and Minima</a></li>
<li><a href="#the-second-derivative-test">The Second Derivative Test</a></li>
<li><a href="#lhopitals-rule">L'Hopital's Rule</a></li>
<li><a href="#applications-in-quantitative-finance">Applications in Quantitative Finance</a></li>
<li><a href="#conclusion">Conclusion</a></li>
</table-of-contents>

---

## Introduction

Calculus is the mathematical language of change. In quantitative finance, nearly everything is changing - prices move, volatilities shift, interest rates fluctuate, and portfolios gain or lose value continuously. Understanding how to measure and predict these changes is not optional; it is the foundation on which modern finance is built.

Derivatives (in the calculus sense) answer the fundamental question: _how fast is something changing right now?_ When a trader computes delta, they are computing a derivative. When a risk manager measures portfolio sensitivity to interest rate shifts, they are computing a derivative. When an optimizer finds the portfolio weights that maximise the Sharpe ratio, they are setting a derivative to zero.

This post builds up the theory of limits and derivatives from first principles. We start with limits - the concept that makes derivatives rigorous - then work through the core differentiation rules (power, product, quotient, chain, and generalised power), each with worked examples and visualisations. We then apply these tools to optimisation: finding maxima and minima using the first and second derivative tests. Finally, we cover L'Hopital's rule for evaluating indeterminate forms, and connect everything to real applications in quantitative finance.

---

## Limits: The Foundation

### What Is a Limit?

Before we can define a derivative, we need the concept of a **limit**. Intuitively, $\lim_{x \to a} f(x) = L$ means that as $x$ gets arbitrarily close to $a$ (but not equal to $a$), $f(x)$ gets arbitrarily close to $L$.

The formal ($\epsilon$-$\delta$) definition states: for every $\epsilon > 0$, there exists a $\delta > 0$ such that:

$$0 < |x - a| < \delta \implies |f(x) - L| < \epsilon$$

### A Classic Example

Consider $f(x) = \frac{\sin(x)}{x}$. This function is undefined at $x = 0$ (division by zero), yet as $x$ approaches 0 from either direction, the function values approach 1:

$$\lim_{x \to 0} \frac{\sin(x)}{x} = 1$$

<python-figure src="limit-intuition" caption="f(x) = sin(x)/x has a 'hole' at x = 0 but approaches 1 from both sides. The limit exists even though the function value does not."></python-figure>

This is the essence of limits: we care about what the function _approaches_, not what it equals at the point. The function need not even be defined at $a$ for the limit to exist.

### Key Limit Properties

Limits obey algebraic rules that make them practical to compute:

| Rule     | Formula                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| Sum      | $\lim_{x \to a} [f(x) + g(x)] = \lim_{x \to a} f(x) + \lim_{x \to a} g(x)$                                          |
| Product  | $\lim_{x \to a} [f(x) \cdot g(x)] = \lim_{x \to a} f(x) \cdot \lim_{x \to a} g(x)$                                  |
| Quotient | $\lim_{x \to a} \frac{f(x)}{g(x)} = \frac{\lim_{x \to a} f(x)}{\lim_{x \to a} g(x)}$, provided denominator $\neq 0$ |
| Power    | $\lim_{x \to a} [f(x)]^n = \left[\lim_{x \to a} f(x)\right]^n$                                                      |
| Constant | $\lim_{x \to a} c = c$                                                                                              |

### Important Standard Limits

Several limits appear repeatedly in calculus and finance:

$$\lim_{x \to 0} \frac{\sin(x)}{x} = 1$$

$$\lim_{x \to 0} \frac{e^x - 1}{x} = 1$$

$$\lim_{n \to \infty} \left(1 + \frac{r}{n}\right)^n = e^r$$

The last one is particularly significant - it defines **continuous compounding**. If you invest \$1 at annual rate $r$ and compound $n$ times per year, as $n \to \infty$ you get $e^r$ dollars. This is why $e$ is the natural base for financial mathematics.

---

## What Is a Derivative?

### The Definition

The **derivative** of $f$ at point $a$ is defined as:

$$f'(a) = \lim_{h \to 0} \frac{f(a + h) - f(a)}{h}$$

This is the **limit of the difference quotient**. The fraction $\frac{f(a+h) - f(a)}{h}$ measures the average rate of change of $f$ over the interval $[a, a+h]$ - the slope of the **secant line**. As $h \to 0$, this secant line rotates to become the **tangent line**, and its slope becomes the instantaneous rate of change.

Equivalent notation:

$$f'(x) = \frac{df}{dx} = \frac{d}{dx}f(x) = \dot{f}(x)$$

### Geometric Interpretation

The derivative $f'(a)$ is the **slope of the tangent line** to $f$ at the point $(a, f(a))$. The tangent line is the best linear approximation to $f$ near $a$:

$$f(x) \approx f(a) + f'(a)(x - a)$$

<python-figure src="derivative-tangent" caption="The secant line (dashed orange) measures average rate of change between two points. The tangent line (dashed green) is the limit of the secant as the points converge - giving the instantaneous rate of change."></python-figure>

### Computing a Derivative from the Definition

Let us compute the derivative of $f(x) = x^2$ directly from the limit definition:

$$f'(x) = \lim_{h \to 0} \frac{(x+h)^2 - x^2}{h} = \lim_{h \to 0} \frac{x^2 + 2xh + h^2 - x^2}{h} = \lim_{h \to 0} \frac{2xh + h^2}{h} = \lim_{h \to 0} (2x + h) = 2x$$

So $\frac{d}{dx}x^2 = 2x$. At $x = 3$, the slope of the tangent line is $f'(3) = 6$ - the function is increasing at a rate of 6 units per unit of $x$.

### When Derivatives Don't Exist

A function is **differentiable** at $a$ if the limit above exists. Derivatives fail to exist at:

- **Corners** or **cusps**: $f(x) = |x|$ at $x = 0$ (left slope = $-1$, right slope = $+1$)
- **Vertical tangents**: $f(x) = x^{1/3}$ at $x = 0$ (slope $\to \infty$)
- **Discontinuities**: the function must be continuous to be differentiable (though continuity alone is not sufficient)

---

## Basic Differentiation Rules

Computing every derivative from the limit definition would be impractical. Instead, we derive a set of rules that cover the vast majority of functions encountered in practice.

### The Power Rule

For any real number $n$:

$$\frac{d}{dx} x^n = n x^{n-1}$$

This is the single most frequently used differentiation rule. It works for integer powers, fractional powers, and negative powers:

| $f(x)$                   | $f'(x)$                                     | Rule applied |
| ------------------------ | ------------------------------------------- | ------------ |
| $x^3$                    | $3x^2$                                      | $n = 3$      |
| $x^{1/2} = \sqrt{x}$     | $\frac{1}{2}x^{-1/2} = \frac{1}{2\sqrt{x}}$ | $n = 1/2$    |
| $x^{-1} = \frac{1}{x}$   | $-x^{-2} = -\frac{1}{x^2}$                  | $n = -1$     |
| $x^{-2} = \frac{1}{x^2}$ | $-2x^{-3} = -\frac{2}{x^3}$                 | $n = -2$     |

<python-figure src="power-rule" caption="f(x) = x³ (blue) and its derivative f'(x) = 3x² (green). Notice that f'(x) = 0 at x = 0, where the original function has a horizontal tangent, and f'(x) > 0 everywhere else, confirming x³ is increasing away from the origin."></python-figure>

### Proof of the Power Rule (Integer Case)

For positive integer $n$, using the binomial theorem:

$$\frac{d}{dx} x^n = \lim_{h \to 0} \frac{(x+h)^n - x^n}{h}$$

Expanding $(x+h)^n$ via the binomial theorem:

$$(x+h)^n = x^n + nx^{n-1}h + \binom{n}{2}x^{n-2}h^2 + \cdots + h^n$$

Substituting:

$$= \lim_{h \to 0} \frac{nx^{n-1}h + \binom{n}{2}x^{n-2}h^2 + \cdots}{h} = \lim_{h \to 0} \left[nx^{n-1} + \binom{n}{2}x^{n-2}h + \cdots\right] = nx^{n-1}$$

### The Constant Rule and Constant Multiple Rule

$$\frac{d}{dx} c = 0 \qquad \frac{d}{dx} [c \cdot f(x)] = c \cdot f'(x)$$

Constants don't change, so their rate of change is zero. Scaling a function by a constant scales its derivative by the same constant.

### The Sum and Difference Rules

$$\frac{d}{dx} [f(x) \pm g(x)] = f'(x) \pm g'(x)$$

Differentiation is **linear**: the derivative of a sum is the sum of the derivatives. Combined with the constant multiple rule, this means differentiation distributes over any linear combination:

$$\frac{d}{dx} [af(x) + bg(x)] = af'(x) + bg'(x)$$

### Example: Polynomial Differentiation

Differentiate $f(x) = 4x^5 - 3x^3 + 2x - 7$:

$$f'(x) = 4 \cdot 5x^4 - 3 \cdot 3x^2 + 2 \cdot 1 - 0 = 20x^4 - 9x^2 + 2$$

Each term differentiates independently by the power rule and constant multiple rule.

---

## The Product Rule

### Statement

When two functions are multiplied together, their derivative is not simply the product of the individual derivatives. Instead:

$$\frac{d}{dx}[f(x) \cdot g(x)] = f'(x) \cdot g(x) + f(x) \cdot g'(x)$$

In Leibniz notation: $(uv)' = u'v + uv'$. The mnemonic is "derivative of the first times the second, plus the first times the derivative of the second."

### Proof

From the limit definition:

$$\frac{d}{dx}[f(x)g(x)] = \lim_{h \to 0} \frac{f(x+h)g(x+h) - f(x)g(x)}{h}$$

We add and subtract $f(x+h)g(x)$ in the numerator:

$$= \lim_{h \to 0} \frac{f(x+h)g(x+h) - f(x+h)g(x) + f(x+h)g(x) - f(x)g(x)}{h}$$

$$= \lim_{h \to 0} \left[f(x+h) \cdot \frac{g(x+h) - g(x)}{h} + g(x) \cdot \frac{f(x+h) - f(x)}{h}\right]$$

As $h \to 0$: $f(x+h) \to f(x)$, the first fraction $\to g'(x)$, and the second $\to f'(x)$:

$$= f(x) \cdot g'(x) + g(x) \cdot f'(x)$$

### Example

Differentiate $f(x) = x \cdot \sin(x)$:

Let $u = x$ and $v = \sin(x)$. Then $u' = 1$ and $v' = \cos(x)$:

$$f'(x) = 1 \cdot \sin(x) + x \cdot \cos(x) = \sin(x) + x\cos(x)$$

<python-figure src="product-rule" caption="f(x) = x·sin(x) (blue) and its derivative f'(x) = sin(x) + x·cos(x) (green). The derivative crosses zero precisely at the peaks and troughs of the original function."></python-figure>

### Extension to Three or More Functions

The product rule extends naturally. For three functions:

$$(fgh)' = f'gh + fg'h + fgh'$$

This pattern generalises to any number of factors: differentiate each factor one at a time, keeping the others unchanged, and sum.

---

## The Quotient Rule

### Statement

For a ratio of two functions where $g(x) \neq 0$:

$$\frac{d}{dx}\left[\frac{f(x)}{g(x)}\right] = \frac{f'(x) \cdot g(x) - f(x) \cdot g'(x)}{[g(x)]^2}$$

The mnemonic: "low d-high minus high d-low, over low squared." Note the **minus** sign - this is the key difference from the product rule and a common source of errors.

### Proof

We can derive this from the product rule by writing $\frac{f}{g} = f \cdot g^{-1}$ and applying the product rule with the chain rule (which we will cover shortly). Alternatively, directly from the limit definition:

$$\frac{d}{dx}\frac{f(x)}{g(x)} = \lim_{h \to 0} \frac{1}{h}\left[\frac{f(x+h)}{g(x+h)} - \frac{f(x)}{g(x)}\right]$$

$$= \lim_{h \to 0} \frac{f(x+h)g(x) - f(x)g(x+h)}{h \cdot g(x+h)g(x)}$$

Adding and subtracting $f(x)g(x)$ in the numerator and splitting:

$$= \frac{g(x) \cdot f'(x) - f(x) \cdot g'(x)}{[g(x)]^2}$$

### Example

Differentiate $f(x) = \frac{x^2 + 1}{x - 3}$:

Let $u = x^2 + 1$ (so $u' = 2x$) and $v = x - 3$ (so $v' = 1$):

$$f'(x) = \frac{2x(x - 3) - (x^2 + 1)(1)}{(x - 3)^2} = \frac{2x^2 - 6x - x^2 - 1}{(x - 3)^2} = \frac{x^2 - 6x - 1}{(x - 3)^2}$$

### When to Avoid the Quotient Rule

The quotient rule is often unnecessary. Many quotients are simpler to differentiate by rewriting with negative exponents:

$$\frac{d}{dx}\frac{1}{x^3} = \frac{d}{dx}x^{-3} = -3x^{-4} = -\frac{3}{x^4}$$

Using the quotient rule on $\frac{1}{x^3}$ gives the same answer but with more work. Reserve the quotient rule for cases where both numerator and denominator are genuine functions of $x$.

---

## The Chain Rule

### Statement

The chain rule handles **compositions** of functions - a function applied to another function. If $y = f(g(x))$, then:

$$\frac{dy}{dx} = f'(g(x)) \cdot g'(x)$$

In Leibniz notation, if $y = f(u)$ and $u = g(x)$:

$$\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}$$

The chain rule says: differentiate the "outer" function (leaving the inner function untouched), then multiply by the derivative of the "inner" function.

### Intuition

If $u$ changes at rate $\frac{du}{dx}$ with respect to $x$, and $y$ changes at rate $\frac{dy}{du}$ with respect to $u$, then $y$ changes with respect to $x$ at the product of these rates. Rates of change multiply through a chain of dependencies - hence the name.

### Example 1: Simple Composition

Differentiate $f(x) = (3x + 1)^5$:

- Outer function: $u^5$, with derivative $5u^4$
- Inner function: $u = 3x + 1$, with derivative $3$

$$f'(x) = 5(3x + 1)^4 \cdot 3 = 15(3x + 1)^4$$

### Example 2: Trigonometric Composition

Differentiate $f(x) = \sin(x^2)$:

- Outer: $\sin(u)$, derivative $\cos(u)$
- Inner: $u = x^2$, derivative $2x$

$$f'(x) = \cos(x^2) \cdot 2x = 2x\cos(x^2)$$

<python-figure src="chain-rule" caption="f(x) = sin(x²) (blue) and its derivative f'(x) = 2x·cos(x²) (green). The derivative grows in amplitude as x increases because the 2x factor amplifies the oscillations."></python-figure>

### Example 3: Nested Composition

Differentiate $f(x) = e^{\sin(x^2)}$:

Apply the chain rule twice:

$$f'(x) = e^{\sin(x^2)} \cdot \cos(x^2) \cdot 2x = 2x \cos(x^2) \cdot e^{\sin(x^2)}$$

Each layer peels off one derivative and multiplies by the next.

---

## The Generalised Power Rule

### Statement

The generalised power rule combines the power rule with the chain rule. For any differentiable function $g(x)$ and real number $n$:

$$\frac{d}{dx}[g(x)]^n = n[g(x)]^{n-1} \cdot g'(x)$$

This is the chain rule applied to $f(u) = u^n$ with $u = g(x)$.

### Examples

**Example 1:** $f(x) = (x^2 + 3x)^4$

$$f'(x) = 4(x^2 + 3x)^3 \cdot (2x + 3)$$

**Example 2:** $f(x) = \sqrt{5x^2 - 1} = (5x^2 - 1)^{1/2}$

$$f'(x) = \frac{1}{2}(5x^2 - 1)^{-1/2} \cdot 10x = \frac{5x}{\sqrt{5x^2 - 1}}$$

**Example 3:** $f(x) = \frac{1}{(2x + 1)^3} = (2x + 1)^{-3}$

$$f'(x) = -3(2x + 1)^{-4} \cdot 2 = \frac{-6}{(2x + 1)^4}$$

### Why It Matters

The generalised power rule is not a new rule - it is just a convenient way to remember the chain rule for a very common pattern. Any expression raised to a power, where the base is itself a function of $x$, falls into this category. In finance, this comes up whenever you have terms like $(1 + r)^n$ or $S^{\beta}$ where $r$, $S$, or other quantities depend on another variable.

---

## Other Useful Differentiation Formulas

### Exponential and Logarithmic Functions

$$\frac{d}{dx} e^x = e^x \qquad \frac{d}{dx} a^x = a^x \ln(a)$$

$$\frac{d}{dx} \ln(x) = \frac{1}{x} \qquad \frac{d}{dx} \log_a(x) = \frac{1}{x \ln(a)}$$

The exponential $e^x$ is unique: it is its own derivative. This self-replicating property is why $e$ is the natural base for continuous-time models in finance - it makes differential equations dramatically simpler.

With the chain rule:

$$\frac{d}{dx} e^{g(x)} = e^{g(x)} \cdot g'(x) \qquad \frac{d}{dx} \ln(g(x)) = \frac{g'(x)}{g(x)}$$

### Trigonometric Functions

$$\frac{d}{dx} \sin(x) = \cos(x) \qquad \frac{d}{dx} \cos(x) = -\sin(x)$$

$$\frac{d}{dx} \tan(x) = \sec^2(x) \qquad \frac{d}{dx} \cot(x) = -\csc^2(x)$$

$$\frac{d}{dx} \sec(x) = \sec(x)\tan(x) \qquad \frac{d}{dx} \csc(x) = -\csc(x)\cot(x)$$

### Inverse Trigonometric Functions

$$\frac{d}{dx} \arcsin(x) = \frac{1}{\sqrt{1 - x^2}} \qquad \frac{d}{dx} \arccos(x) = -\frac{1}{\sqrt{1 - x^2}}$$

$$\frac{d}{dx} \arctan(x) = \frac{1}{1 + x^2}$$

### Logarithmic Differentiation

For functions of the form $f(x) = [u(x)]^{v(x)}$, where both base and exponent depend on $x$, take the natural log of both sides:

$$\ln(f) = v(x) \ln(u(x))$$

Differentiate implicitly:

$$\frac{f'}{f} = v'(x)\ln(u(x)) + v(x) \cdot \frac{u'(x)}{u(x)}$$

$$f'(x) = [u(x)]^{v(x)} \left[v'(x)\ln(u(x)) + \frac{v(x) \cdot u'(x)}{u(x)}\right]$$

**Example:** $f(x) = x^x$

$$f'(x) = x^x[\ln(x) + 1]$$

### Summary Table

| Function     | Derivative                  |
| ------------ | --------------------------- |
| $x^n$        | $nx^{n-1}$                  |
| $e^x$        | $e^x$                       |
| $a^x$        | $a^x \ln(a)$                |
| $\ln(x)$     | $1/x$                       |
| $\sin(x)$    | $\cos(x)$                   |
| $\cos(x)$    | $-\sin(x)$                  |
| $\tan(x)$    | $\sec^2(x)$                 |
| $\arcsin(x)$ | $1/\sqrt{1 - x^2}$          |
| $\arctan(x)$ | $1/(1 + x^2)$               |
| $[g(x)]^n$   | $n[g(x)]^{n-1} \cdot g'(x)$ |
| $e^{g(x)}$   | $e^{g(x)} \cdot g'(x)$      |
| $\ln(g(x))$  | $g'(x)/g(x)$                |

---

## Maxima and Minima

### Critical Points

A **critical point** of $f$ is a value $x = c$ where either $f'(c) = 0$ or $f'(c)$ does not exist. Critical points are the _candidates_ for maxima and minima - every local extremum must occur at a critical point (by Fermat's theorem), but not every critical point is an extremum.

### Global vs. Local Extrema

- A **global maximum** (or absolute maximum) is the largest value of $f$ on its entire domain
- A **local maximum** is a value $f(c)$ that is larger than $f(x)$ for all $x$ _near_ $c$
- Similarly for **global minimum** and **local minimum**

On a closed interval $[a, b]$, the **Extreme Value Theorem** guarantees that a continuous function attains both a global maximum and a global minimum. These occur either at critical points in $(a, b)$ or at the endpoints $a$ and $b$.

### The First Derivative Test

To classify a critical point $c$ where $f'(c) = 0$:

1. If $f'$ changes from **positive to negative** at $c$: $f(c)$ is a **local maximum**
2. If $f'$ changes from **negative to positive** at $c$: $f(c)$ is a **local minimum**
3. If $f'$ does **not change sign** at $c$: $c$ is neither (it's an **inflection point**)

### Example: Finding All Extrema

Find the extrema of $f(x) = x^4 - 8x^2 + 5$:

**Step 1:** Find $f'(x)$:

$$f'(x) = 4x^3 - 16x = 4x(x^2 - 4) = 4x(x-2)(x+2)$$

**Step 2:** Set $f'(x) = 0$:

$$4x(x-2)(x+2) = 0 \implies x = 0, \quad x = 2, \quad x = -2$$

**Step 3:** Evaluate $f$ at the critical points:

| $x$  | $f(x)$                                     | Type          |
| ---- | ------------------------------------------ | ------------- |
| $-2$ | $(-2)^4 - 8(-2)^2 + 5 = 16 - 32 + 5 = -11$ | Local minimum |
| $0$  | $0 - 0 + 5 = 5$                            | Local maximum |
| $2$  | $16 - 32 + 5 = -11$                        | Local minimum |

**Step 4:** Verify using the first derivative test. Check sign of $f'$ in each interval:

| Interval        | Sign of $f'$ | $f$ is...  |
| --------------- | ------------ | ---------- |
| $(-\infty, -2)$ | negative     | decreasing |
| $(-2, 0)$       | positive     | increasing |
| $(0, 2)$        | negative     | decreasing |
| $(2, \infty)$   | positive     | increasing |

This confirms: $x = -2$ and $x = 2$ are local minima (sign changes $-$ to $+$), and $x = 0$ is a local maximum (sign changes $+$ to $-$).

<python-figure src="maxima-minima" caption="f(x) = x⁴ − 8x² + 5 with its derivative f'(x). The critical points occur where f'(x) = 0 (green curve crosses zero). At x = ±2, f has local minima; at x = 0, f has a local maximum."></python-figure>

---

## The Second Derivative Test

### The Second Derivative

The **second derivative** $f''(x)$ is the derivative of the derivative. It measures the **rate of change of the slope** - in other words, the **concavity** of the function:

- $f''(x) > 0$: the function is **concave up** (curves like a cup, $\cup$) - the slope is increasing
- $f''(x) < 0$: the function is **concave down** (curves like a cap, $\cap$) - the slope is decreasing
- $f''(x) = 0$: potential **inflection point** where concavity changes

### The Test

At a critical point $c$ where $f'(c) = 0$:

| $f''(c)$     | Conclusion                                                           |
| ------------ | -------------------------------------------------------------------- |
| $f''(c) > 0$ | $c$ is a **local minimum** (concave up - the curve bends upward)     |
| $f''(c) < 0$ | $c$ is a **local maximum** (concave down - the curve bends downward) |
| $f''(c) = 0$ | **Inconclusive** - use the first derivative test instead             |

### Example: Applying the Second Derivative Test

For $f(x) = x^4 - 8x^2 + 5$, we found critical points at $x = -2, 0, 2$.

Compute $f''(x)$:

$$f''(x) = 12x^2 - 16$$

Evaluate at each critical point:

| $x$  | $f''(x)$               | Conclusion    |
| ---- | ---------------------- | ------------- |
| $-2$ | $12(4) - 16 = 32 > 0$  | Local minimum |
| $0$  | $12(0) - 16 = -16 < 0$ | Local maximum |
| $2$  | $12(4) - 16 = 32 > 0$  | Local minimum |

This confirms our earlier results instantly, without needing to check sign changes.

<python-figure src="second-derivative" caption="f(x), f'(x), and f''(x) plotted together. Where f''(x) > 0, the function is concave up (local min at x = ±2). Where f''(x) < 0, the function is concave down (local max at x = 0)."></python-figure>

### Inflection Points

An **inflection point** is where $f''(x) = 0$ and the concavity actually changes. For our function:

$$f''(x) = 12x^2 - 16 = 0 \implies x = \pm\frac{2}{\sqrt{3}} \approx \pm 1.155$$

At these points, $f$ transitions between concave up and concave down. Inflection points are important in finance - they mark where a trend's acceleration changes direction.

### When the Second Derivative Test Fails

The test is inconclusive when $f''(c) = 0$. Consider $f(x) = x^4$ at $x = 0$:

- $f'(0) = 0$ (critical point)
- $f''(0) = 0$ (inconclusive!)

But $x = 0$ is clearly a local minimum. In such cases, fall back to the first derivative test or examine higher-order derivatives.

---

## L'Hopital's Rule

### The Problem: Indeterminate Forms

When evaluating limits, you sometimes encounter **indeterminate forms** like $\frac{0}{0}$ or $\frac{\infty}{\infty}$. Direct substitution gives a meaningless result, but the limit itself may be perfectly well-defined.

The seven indeterminate forms are:

$$\frac{0}{0}, \quad \frac{\infty}{\infty}, \quad 0 \cdot \infty, \quad \infty - \infty, \quad 0^0, \quad 1^\infty, \quad \infty^0$$

### The Rule

**L'Hopital's Rule** states: if $\lim_{x \to a} \frac{f(x)}{g(x)}$ gives $\frac{0}{0}$ or $\frac{\infty}{\infty}$, then:

$$\lim_{x \to a} \frac{f(x)}{g(x)} = \lim_{x \to a} \frac{f'(x)}{g'(x)}$$

provided the right-hand limit exists (or is $\pm\infty$). The rule can be applied repeatedly if the result is still indeterminate.

<callout variant="important" title="Common Mistake">L'Hopital's rule differentiates the numerator and denominator **separately** - it is NOT the quotient rule. You compute $f'(x)$ and $g'(x)$ independently, not $\frac{d}{dx}\frac{f}{g}$.</callout>

### Example 1: The Classic $\frac{0}{0}$

$$\lim_{x \to 0} \frac{\sin(x)}{x} \stackrel{\frac{0}{0}}{=} \lim_{x \to 0} \frac{\cos(x)}{1} = \cos(0) = 1$$

### Example 2: $\frac{0}{0}$ with Exponentials

$$\lim_{x \to 0} \frac{e^x - 1}{x} \stackrel{\frac{0}{0}}{=} \lim_{x \to 0} \frac{e^x}{1} = e^0 = 1$$

<python-figure src="lhopital" caption="(eˣ − 1)/x is undefined at x = 0 but approaches 1. L'Hopital's rule confirms: differentiating numerator and denominator gives eˣ/1, which equals 1 at x = 0."></python-figure>

### Example 3: Applying L'Hopital's Twice

$$\lim_{x \to 0} \frac{1 - \cos(x)}{x^2} \stackrel{\frac{0}{0}}{=} \lim_{x \to 0} \frac{\sin(x)}{2x} \stackrel{\frac{0}{0}}{=} \lim_{x \to 0} \frac{\cos(x)}{2} = \frac{1}{2}$$

### Example 4: The $\frac{\infty}{\infty}$ Form

$$\lim_{x \to \infty} \frac{x^2}{e^x} \stackrel{\frac{\infty}{\infty}}{=} \lim_{x \to \infty} \frac{2x}{e^x} \stackrel{\frac{\infty}{\infty}}{=} \lim_{x \to \infty} \frac{2}{e^x} = 0$$

This shows that exponentials grow faster than any polynomial - a fact used extensively in the analysis of tail probabilities in finance.

### Handling Other Indeterminate Forms

Forms like $0 \cdot \infty$, $1^\infty$, $0^0$ and $\infty^0$ can be converted to $\frac{0}{0}$ or $\frac{\infty}{\infty}$ for L'Hopital's:

**$0 \cdot \infty$:** Rewrite $f \cdot g$ as $\frac{f}{1/g}$ or $\frac{g}{1/f}$

**Example:** $\lim_{x \to 0^+} x \ln(x)$

$$= \lim_{x \to 0^+} \frac{\ln(x)}{1/x} \stackrel{\frac{-\infty}{\infty}}{=} \lim_{x \to 0^+} \frac{1/x}{-1/x^2} = \lim_{x \to 0^+} (-x) = 0$$

**$1^\infty$:** Take the natural log, evaluate the limit, then exponentiate.

**Example:** $\lim_{x \to \infty} \left(1 + \frac{1}{x}\right)^x$

Let $L = \lim_{x \to \infty} x \ln\left(1 + \frac{1}{x}\right) = \lim_{x \to \infty} \frac{\ln(1 + 1/x)}{1/x} \stackrel{\frac{0}{0}}{=} \lim_{x \to \infty} \frac{-1/x^2 \cdot \frac{1}{1+1/x}}{-1/x^2} = 1$

So the limit is $e^L = e^1 = e$. This recovers the definition of $e$ itself.

---

## Applications in Quantitative Finance

### The Greeks: Derivatives of Option Prices

The **Greeks** are partial derivatives of an option's price with respect to various market parameters. They are literally derivatives in the calculus sense:

| Greek                | Definition                           | Interpretation                  |
| -------------------- | ------------------------------------ | ------------------------------- |
| **Delta** ($\Delta$) | $\frac{\partial V}{\partial S}$      | Price sensitivity to underlying |
| **Gamma** ($\Gamma$) | $\frac{\partial^2 V}{\partial S^2}$  | Rate of change of delta         |
| **Theta** ($\Theta$) | $\frac{\partial V}{\partial t}$      | Time decay                      |
| **Vega** ($\nu$)     | $\frac{\partial V}{\partial \sigma}$ | Volatility sensitivity          |
| **Rho** ($\rho$)     | $\frac{\partial V}{\partial r}$      | Interest rate sensitivity       |

Delta is the first derivative of the option price with respect to the spot price. Gamma is the second derivative - it tells you how quickly delta itself changes, which determines hedging frequency and transaction costs.

For a Black-Scholes European call:

$$\Delta = \frac{\partial C}{\partial S} = N(d_1), \qquad \text{where } d_1 = \frac{\ln(S/K) + (r + \sigma^2/2)T}{\sigma\sqrt{T}}$$

$$\Gamma = \frac{\partial^2 C}{\partial S^2} = \frac{N'(d_1)}{S\sigma\sqrt{T}} = \frac{\phi(d_1)}{S\sigma\sqrt{T}}$$

<python-figure src="option-delta" caption="Black-Scholes call price (blue) and delta scaled for visibility (green). Delta - the derivative of price with respect to spot - transitions from 0 (deep OTM) to 1 (deep ITM), with the steepest change near the strike price."></python-figure>

### Delta Hedging and the Chain Rule

Delta hedging requires continuously adjusting the hedge as the underlying moves. The P&L of a delta-hedged portfolio over a small time interval is:

$$dP = \frac{1}{2}\Gamma(\Delta S)^2 + \Theta \, dt$$

This comes directly from a Taylor expansion (using the chain rule for multivariate functions):

$$dV = \frac{\partial V}{\partial S}dS + \frac{\partial V}{\partial t}dt + \frac{1}{2}\frac{\partial^2 V}{\partial S^2}(dS)^2 + \cdots$$

The first term is hedged away by delta. The remaining terms involve gamma (second derivative) and theta - the fundamental trade-off in options: you earn gamma (convexity) but pay theta (time decay).

### Optimising Portfolio Allocation

The **mean-variance optimisation** problem asks: what portfolio weights $w$ maximise the Sharpe ratio? Setting the derivative to zero:

$$\frac{d}{dw}\left[\frac{w\mu - r_f}{\sqrt{w^T \Sigma w}}\right] = 0$$

This uses the quotient rule on a function of vector-valued weights. The solution yields the tangency portfolio - the cornerstone of modern portfolio theory.

For a simpler example, consider a trader choosing the optimal quantity $q$ to trade. If revenue is $R(q) = 50q - 0.5q^2$ (decreasing marginal revenue due to market impact) and cost is $C(q) = 10q + 100$ (linear execution cost plus fixed cost), then profit is:

$$P(q) = R(q) - C(q) = -0.5q^2 + 40q - 100$$

Setting $P'(q) = 0$:

$$P'(q) = - q + 40 = 0 \implies q^* = 40$$

The second derivative $P''(q) = -1 < 0$ confirms this is a maximum. The optimal trade size is 40 units, yielding profit $P(40) = -0.5(1600) + 1600 - 100 = 700$.

<python-figure src="pnl-optimization" caption="Profit optimisation using derivatives. Revenue (blue), cost (red), and profit (green). Setting P'(q) = 0 identifies the optimal quantity q* = 40 where profit is maximised at $700."></python-figure>

### Continuous Compounding and the Exponential

The limit:

$$\lim_{n \to \infty} \left(1 + \frac{r}{n}\right)^n = e^r$$

gives us continuous compounding: $FV = PV \cdot e^{rT}$. Taking the derivative with respect to $T$:

$$\frac{d(FV)}{dT} = PV \cdot r \cdot e^{rT}$$

The rate of growth of future value is proportional to the current future value - this is exponential growth. The derivative of $e^{rT}$ with respect to $r$ gives us **duration** (for bonds), and the second derivative gives **convexity**. These are direct applications of the chain rule and second derivative.

### Duration and Convexity

The price of a bond is:

$$P(y) = \sum_{i=1}^{n} \frac{CF_i}{(1 + y)^{t_i}}$$

**Modified duration** is the (negative) first derivative of price with respect to yield, normalised by price:

$$D_{mod} = -\frac{1}{P}\frac{dP}{dy} = \frac{1}{P}\sum_{i=1}^{n} \frac{t_i \cdot CF_i}{(1+y)^{t_i+1}}$$

**Convexity** is the second derivative, normalised by price:

$$C = \frac{1}{P}\frac{d^2P}{dy^2} = \frac{1}{P}\sum_{i=1}^{n} \frac{t_i(t_i + 1) \cdot CF_i}{(1+y)^{t_i+2}}$$

Together, they give a second-order Taylor approximation for the price change:

$$\frac{\Delta P}{P} \approx - D_{mod} \cdot \Delta y + \frac{1}{2}C \cdot (\Delta y)^2$$

Duration is the first derivative (linear sensitivity), and convexity is the second derivative (curvature correction) - exactly the first and second terms of a Taylor expansion.

---

## Conclusion

Limits and derivatives form the mathematical backbone of quantitative finance. The key ideas covered in this post:

1. **Limits** provide the rigorous foundation for derivatives and define continuous compounding via $e^r = \lim_{n \to \infty}(1 + r/n)^n$
2. **The derivative** measures instantaneous rate of change - the slope of the tangent line - and is defined as the limit of the difference quotient
3. **Differentiation rules** (power, product, quotient, chain, generalised power) allow efficient computation of derivatives for any combination of elementary functions
4. **Critical points and the second derivative test** identify maxima and minima - essential for portfolio optimisation, trade sizing, and finding optimal hedge ratios
5. **L'Hopital's rule** resolves indeterminate limits by replacing a ratio of functions with a ratio of their derivatives
6. **In finance**, derivatives appear as Greeks (delta, gamma, theta, vega), duration and convexity, and throughout optimisation problems

The thread connecting all of these is approximation by simpler functions. The derivative approximates a curve with its tangent line. Taylor expansions approximate nonlinear functions with polynomials. The second derivative test approximates a function near a critical point with a parabola. Every time a quant linearises a risk factor, computes a sensitivity, or optimises an objective function, they are applying the calculus of limits and derivatives.
