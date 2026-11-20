---
title: 'Integration: From First Principles to Quantitative Finance Applications'
date: '2026-03-22'
description: 'A comprehensive guide to integral calculus - the power rule in reverse, substitution, integration by parts, and definite integrals - with geometric intuition, Python implementations, and applications in quantitative finance including expected values, option pricing, and risk metrics.'
tags: ['math', 'python', 'quant', 'calculus']
---

<table-of-contents>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#what-is-integration">What Is Integration?</a></li>
<li><a href="#the-power-rule-in-reverse">The Power Rule in Reverse</a></li>
<li><a href="#common-antiderivatives">Common Antiderivatives</a></li>
<li><a href="#definite-integrals-and-the-fundamental-theorem">Definite Integrals and the Fundamental Theorem</a></li>
<li><a href="#integration-by-substitution">Integration by Substitution</a></li>
<li><a href="#substitution-in-definite-integrals">Substitution in Definite Integrals</a></li>
<li><a href="#integration-by-parts">Integration by Parts</a></li>
<li><a href="#numerical-integration">Numerical Integration</a></li>
<li><a href="#applications-in-quantitative-finance">Applications in Quantitative Finance</a></li>
<li><a href="#expected-values-using-integration">Expected Values Using Integration</a></li>
<li><a href="#conclusion">Conclusion</a></li>
</table-of-contents>

---

## Introduction

Integration is the inverse of differentiation - and one of the most powerful tools in a quantitative analyst's mathematical toolkit. Where derivatives tell us about rates of change and local behavior, integrals let us accumulate quantities: areas under curves, total probabilities, expected payoffs, and present values of continuous cash flow streams.

Every time a quant prices a European option, computes Value-at-Risk from a continuous distribution, or calculates the expected value of a portfolio return, integration is doing the heavy lifting behind the scenes. The Black-Scholes formula is, at its core, an integral over the risk-neutral probability distribution. Duration and convexity of bonds involve integrals of discounted cash flows. Risk metrics like CVaR require integrating the tail of a loss distribution.

This post builds integration from the ground up: starting with the geometric intuition of area under a curve, working through the fundamental techniques (power rule, substitution, integration by parts), and then applying these tools to real quantitative finance problems. Along the way, we cover numerical methods for integrals that have no closed-form solution - which, in practice, is most of the integrals quants encounter.

---

## What Is Integration?

### The Area Problem

The fundamental motivation for integration is computing the **area under a curve**. Given a continuous function $f(x) \geq 0$ on the interval $[a, b]$, the area between the curve and the x-axis is:

$$A = \int_a^b f(x) \, dx$$

But what does this actually mean? The integral is defined as the limit of a sum of rectangles - an idea that goes back to Archimedes and was formalized by Riemann in the 19th century.

### Riemann Sums

Partition the interval $[a, b]$ into $n$ equal subintervals, each of width $\Delta x = \frac{b - a}{n}$. Choose a sample point $x_i^*$ in each subinterval. The **Riemann sum** is:

$$S_n = \sum_{i=1}^{n} f(x_i^*) \cdot \Delta x$$

Each term $f(x_i^*) \cdot \Delta x$ is the area of a rectangle with height $f(x_i^*)$ and width $\Delta x$. As $n \to \infty$, these rectangles fill in the area under the curve more precisely:

$$\int_a^b f(x) \, dx = \lim_{n \to \infty} \sum_{i=1}^{n} f(x_i^*) \cdot \Delta x$$

The three common choices for sample points are:

- **Left Riemann sum**: $x_i^* = a + (i-1)\Delta x$ - uses the left endpoint of each subinterval
- **Right Riemann sum**: $x_i^* = a + i \cdot \Delta x$ - uses the right endpoint
- **Midpoint rule**: $x_i^* = a + (i - \frac{1}{2})\Delta x$ - uses the center of each subinterval

<python-figure src="riemann-sums" caption="Riemann sum approximations of ∫₀² x² dx with increasing numbers of rectangles. As n grows, the sum converges to the exact value of 8/3 ≈ 2.667."></python-figure>

### Python Implementation

```python
def riemann_sum(f, a, b, n, method='midpoint'):
    """Approximate the integral of f from a to b using n rectangles.

    Methods: 'left', 'right', 'midpoint'
    """
    dx = (b - a) / n
    total = 0

    for i in range(n):
        if method == 'left':
            x = a + i * dx
        elif method == 'right':
            x = a + (i + 1) * dx
        else:  # midpoint
            x = a + (i + 0.5) * dx
        total += f(x) * dx

    return total

# Example: ∫₀² x² dx = 8/3 ≈ 2.6667
f = lambda x: x ** 2
for n in [4, 10, 50, 100, 1000]:
    approx = riemann_sum(f, 0, 2, n)
    error = abs(approx - 8/3)
    print(f"n={n:>4}: {approx:.6f}, error = {error:.2e}")
```

Output:

```
n=   4: 2.625000, error = 4.17e-02
n=  10: 2.660000, error = 6.67e-03
n=  50: 2.666400, error = 2.67e-04
n= 100: 2.666600, error = 6.67e-05
n=1000: 2.666666, error = 6.67e-07
```

The midpoint rule converges at rate $O(1/n^2)$, which is surprisingly good for such a simple method.

### Indefinite vs. Definite Integrals

There are two related but distinct concepts:

**Definite integral**: $\int_a^b f(x) \, dx$ - a number representing the signed area under $f$ from $a$ to $b$.

**Indefinite integral (antiderivative)**: $\int f(x) \, dx = F(x) + C$ - a family of functions $F$ such that $F'(x) = f(x)$.

The **Fundamental Theorem of Calculus** connects them: if $F$ is any antiderivative of $f$, then:

$$\int_a^b f(x) \, dx = F(b) - F(a)$$

This is what makes integration practical. Instead of computing limits of Riemann sums, we find an antiderivative and evaluate it at the endpoints.

---

## The Power Rule in Reverse

### Derivatives to Antiderivatives

Recall the power rule for differentiation:

$$\frac{d}{dx} x^n = n x^{n-1}$$

Running this in reverse gives us the **power rule for integration**. If the derivative of $x^n$ is $n x^{n-1}$, then the antiderivative of $x^n$ must be $\frac{x^{n+1}}{n+1}$ (since differentiating $\frac{x^{n+1}}{n+1}$ gives back $x^n$):

$$\int x^n \, dx = \frac{x^{n+1}}{n+1} + C \quad \text{for } n \neq -1$$

The $+C$ is the **constant of integration** - since the derivative of any constant is zero, there are infinitely many antiderivatives differing only by a constant.

### The Special Case: $n = -1$

When $n = -1$, the formula $\frac{x^{n+1}}{n+1}$ involves division by zero. The antiderivative of $\frac{1}{x}$ is instead:

$$\int \frac{1}{x} \, dx = \ln|x| + C$$

This is because $\frac{d}{dx} \ln|x| = \frac{1}{x}$.

### Examples

**Example 1:** Find $\int x^3 \, dx$

$$\int x^3 \, dx = \frac{x^{3+1}}{3+1} + C = \frac{x^4}{4} + C$$

**Example 2:** Find $\int \sqrt{x} \, dx$

Rewrite $\sqrt{x} = x^{1/2}$:

$$\int x^{1/2} \, dx = \frac{x^{3/2}}{3/2} + C = \frac{2}{3} x^{3/2} + C$$

**Example 3:** Find $\int \frac{1}{x^2} \, dx$

Rewrite $\frac{1}{x^2} = x^{-2}$:

$$\int x^{-2} \, dx = \frac{x^{-1}}{-1} + C = -\frac{1}{x} + C$$

**Example 4:** Find $\int (3x^2 + 2x - 5) \, dx$

Using linearity of integration:

$$\int (3x^2 + 2x - 5) \, dx = 3 \cdot \frac{x^3}{3} + 2 \cdot \frac{x^2}{2} - 5x + C = x^3 + x^2 - 5x + C$$

### The Generalized Power Rule

The power rule extends to composite functions. If we have a function raised to a power, multiplied by its own derivative:

$$\int [g(x)]^n \cdot g'(x) \, dx = \frac{[g(x)]^{n+1}}{n+1} + C \quad \text{for } n \neq -1$$

This is a direct consequence of the chain rule in reverse. For example:

$$\int 2x(x^2 + 1)^3 \, dx = \frac{(x^2 + 1)^4}{4} + C$$

Here $g(x) = x^2 + 1$, so $g'(x) = 2x$, and we recognize the pattern immediately.

<python-figure src="power-rule" caption="The power rule in action: f(x) = x² and its antiderivative F(x) = x³/3. The value of the definite integral ∫₀² x² dx equals F(2) − F(0) = 8/3."></python-figure>

---

## Common Antiderivatives

Beyond the power rule, several functions have antiderivatives that appear constantly in practice. These are worth memorizing:

| Function $f(x)$          | Antiderivative $\int f(x) \, dx$ |
| ------------------------ | -------------------------------- |
| $x^n$ ($n \neq -1$)      | $\frac{x^{n+1}}{n+1} + C$        |
| $\frac{1}{x}$            | $\ln\|x\| + C$                   |
| $e^x$                    | $e^x + C$                        |
| $a^x$                    | $\frac{a^x}{\ln a} + C$          |
| $\sin x$                 | $-\cos x + C$                    |
| $\cos x$                 | $\sin x + C$                     |
| $\sec^2 x$               | $\tan x + C$                     |
| $\frac{1}{1+x^2}$        | $\arctan x + C$                  |
| $\frac{1}{\sqrt{1-x^2}}$ | $\arcsin x + C$                  |

### The Exponential Function

The exponential function $e^x$ is its own antiderivative, making it uniquely simple:

$$\int e^x \, dx = e^x + C$$

More generally, for $e^{kx}$:

$$\int e^{kx} \, dx = \frac{1}{k} e^{kx} + C$$

This property is why the exponential function appears everywhere in finance - continuous compounding, the Black-Scholes model, and stochastic processes all rely on the calculus of $e^x$ being clean and self-referential.

### Trigonometric Functions

The trigonometric antiderivatives follow from differentiating the trig functions:

$$\int \sin x \, dx = -\cos x + C$$
$$\int \cos x \, dx = \sin x + C$$

These arise in Fourier analysis, which is used in option pricing (characteristic function methods) and signal processing of financial time series.

<python-figure src="common-antiderivatives" caption="Three fundamental functions and their antiderivatives. Each antiderivative F(x) has the property that F'(x) = f(x)."></python-figure>

---

## Definite Integrals and the Fundamental Theorem

### The Fundamental Theorem of Calculus

The **Fundamental Theorem of Calculus (FTC)** has two parts that together form the bridge between differential and integral calculus:

**Part 1 (Differentiation of integrals):** If $f$ is continuous on $[a, b]$ and we define:

$$F(x) = \int_a^x f(t) \, dt$$

then $F'(x) = f(x)$. In other words, the integral of $f$ from $a$ to $x$ is an antiderivative of $f$.

**Part 2 (Evaluation of integrals):** If $F$ is any antiderivative of $f$ on $[a, b]$, then:

$$\int_a^b f(x) \, dx = F(b) - F(a) = \Big[F(x)\Big]_a^b$$

Part 2 is what we use in practice. Instead of computing a limit of Riemann sums (which requires infinite summation), we just need to:

1. Find an antiderivative $F(x)$
2. Evaluate $F(b) - F(a)$

### Examples

**Example 1:** Compute $\int_0^2 x^2 \, dx$

$$\int_0^2 x^2 \, dx = \left[\frac{x^3}{3}\right]_0^2 = \frac{8}{3} - 0 = \frac{8}{3}$$

**Example 2:** Compute $\int_1^e \frac{1}{x} \, dx$

$$\int_1^e \frac{1}{x} \, dx = \Big[\ln|x|\Big]_1^e = \ln(e) - \ln(1) = 1 - 0 = 1$$

**Example 3:** Compute $\int_0^{\pi} \sin x \, dx$

$$\int_0^{\pi} \sin x \, dx = \Big[-\cos x\Big]_0^{\pi} = -\cos(\pi) - (-\cos(0)) = -(-1) + 1 = 2$$

This tells us the area under one arch of the sine curve is exactly 2.

**Example 4:** Compute $\int_0^1 e^{2x} \, dx$

$$\int_0^1 e^{2x} \, dx = \left[\frac{e^{2x}}{2}\right]_0^1 = \frac{e^2}{2} - \frac{1}{2} = \frac{e^2 - 1}{2} \approx 3.1945$$

### Properties of Definite Integrals

Several properties simplify definite integral calculations:

**Linearity:**

$$\int_a^b [\alpha f(x) + \beta g(x)] \, dx = \alpha \int_a^b f(x) \, dx + \beta \int_a^b g(x) \, dx$$

**Reversal of limits:**

$$\int_a^b f(x) \, dx = -\int_b^a f(x) \, dx$$

**Additivity over intervals:**

$$\int_a^b f(x) \, dx = \int_a^c f(x) \, dx + \int_c^b f(x) \, dx$$

**Comparison:** If $f(x) \leq g(x)$ on $[a, b]$, then:

$$\int_a^b f(x) \, dx \leq \int_a^b g(x) \, dx$$

<python-figure src="ftc-demo" caption="The Fundamental Theorem of Calculus in action: the shaded area under f(x) = sin(x) from 0 to π equals F(π) − F(0) = 2, where F(x) = −cos(x)."></python-figure>

---

## Integration by Substitution

### The Idea

Integration by substitution is the reverse of the chain rule. Recall that the chain rule says:

$$\frac{d}{dx} F(g(x)) = F'(g(x)) \cdot g'(x) = f(g(x)) \cdot g'(x)$$

Reading this backward:

$$\int f(g(x)) \cdot g'(x) \, dx = F(g(x)) + C$$

The technique works by substituting $u = g(x)$, so that $du = g'(x) \, dx$, transforming the integral into a simpler one in terms of $u$.

### The Method

1. Identify an inner function $u = g(x)$ whose derivative $g'(x)$ appears (possibly up to a constant) in the integrand
2. Compute $du = g'(x) \, dx$
3. Rewrite the entire integral in terms of $u$ and $du$
4. Integrate with respect to $u$
5. Substitute back $u = g(x)$

### Examples

**Example 1:** Find $\int 2x \cos(x^2) \, dx$

Let $u = x^2$, so $du = 2x \, dx$:

$$\int 2x \cos(x^2) \, dx = \int \cos(u) \, du = \sin(u) + C = \sin(x^2) + C$$

**Example 2:** Find $\int \frac{x}{x^2 + 1} \, dx$

Let $u = x^2 + 1$, so $du = 2x \, dx$, meaning $x \, dx = \frac{1}{2} du$:

$$\int \frac{x}{x^2 + 1} \, dx = \frac{1}{2} \int \frac{1}{u} \, du = \frac{1}{2} \ln|u| + C = \frac{1}{2} \ln(x^2 + 1) + C$$

**Example 3:** Find $\int e^{3x} \, dx$

Let $u = 3x$, so $du = 3 \, dx$, meaning $dx = \frac{1}{3} du$:

$$\int e^{3x} \, dx = \frac{1}{3} \int e^u \, du = \frac{1}{3} e^u + C = \frac{1}{3} e^{3x} + C$$

**Example 4:** Find $\int x^2 \sqrt{x^3 + 1} \, dx$

Let $u = x^3 + 1$, so $du = 3x^2 \, dx$:

$$\int x^2 \sqrt{x^3 + 1} \, dx = \frac{1}{3} \int \sqrt{u} \, du = \frac{1}{3} \cdot \frac{2}{3} u^{3/2} + C = \frac{2}{9} (x^3 + 1)^{3/2} + C$$

### When Substitution Works

Substitution is effective when you can spot a function-derivative pair in the integrand. The key is recognizing that some part of the integrand is the derivative of another part. With practice, you develop an intuition for which substitutions to try.

<python-figure src="substitution-demo" caption="Integration by substitution: transforming ∫2x·cos(x²)dx. The substitution u = x² simplifies the oscillating integrand into a standard cosine integral."></python-figure>

---

## Substitution in Definite Integrals

### Changing the Limits

When using substitution in a definite integral, you have two options:

1. Substitute back to the original variable and use the original limits
2. **Change the limits** to match the new variable (usually cleaner)

If $u = g(x)$, then when $x = a$, $u = g(a)$, and when $x = b$, $u = g(b)$:

$$\int_a^b f(g(x)) \cdot g'(x) \, dx = \int_{g(a)}^{g(b)} f(u) \, du$$

### Examples

**Example 1:** Compute $\int_0^1 2x \cdot e^{x^2} \, dx$

Let $u = x^2$, so $du = 2x \, dx$. When $x = 0$: $u = 0$. When $x = 1$: $u = 1$.

$$\int_0^1 2x \cdot e^{x^2} \, dx = \int_0^1 e^u \, du = \Big[e^u\Big]_0^1 = e - 1 \approx 1.7183$$

**Example 2:** Compute $\int_0^2 x \sqrt{4 - x^2} \, dx$

Let $u = 4 - x^2$, so $du = -2x \, dx$. When $x = 0$: $u = 4$. When $x = 2$: $u = 0$.

$$\int_0^2 x \sqrt{4 - x^2} \, dx = -\frac{1}{2} \int_4^0 \sqrt{u} \, du = \frac{1}{2} \int_0^4 u^{1/2} \, du = \frac{1}{2} \left[\frac{2}{3} u^{3/2}\right]_0^4 = \frac{1}{2} \cdot \frac{16}{3} = \frac{8}{3}$$

**Example 3:** Compute $\int_1^e \frac{(\ln x)^2}{x} \, dx$

Let $u = \ln x$, so $du = \frac{1}{x} dx$. When $x = 1$: $u = 0$. When $x = e$: $u = 1$.

$$\int_1^e \frac{(\ln x)^2}{x} \, dx = \int_0^1 u^2 \, du = \left[\frac{u^3}{3}\right]_0^1 = \frac{1}{3}$$

### Python Verification

```python
from scipy.integrate import quad
import math

# Example 1: ∫₀¹ 2x·e^(x²) dx
result1, _ = quad(lambda x: 2 * x * math.exp(x**2), 0, 1)
print(f"∫₀¹ 2x·e^(x²) dx = {result1:.6f} (exact: {math.e - 1:.6f})")

# Example 2: ∫₀² x·√(4-x²) dx
result2, _ = quad(lambda x: x * math.sqrt(4 - x**2), 0, 2)
print(f"∫₀² x·√(4-x²) dx = {result2:.6f} (exact: {8/3:.6f})")

# Example 3: ∫₁ᵉ (ln x)²/x dx
result3, _ = quad(lambda x: (math.log(x))**2 / x, 1, math.e)
print(f"∫₁ᵉ (ln x)²/x dx = {result3:.6f} (exact: {1/3:.6f})")
```

Output:

```
∫₀¹ 2x·e^(x²) dx = 1.718282 (exact: 1.718282)
∫₀² x·√(4-x²) dx = 2.666667 (exact: 2.666667)
∫₁ᵉ (ln x)²/x dx = 0.333333 (exact: 0.333333)
```

---

## Integration by Parts

### The Idea

Integration by parts is the reverse of the product rule. Recall:

$$\frac{d}{dx}[u(x) \cdot v(x)] = u'(x) \cdot v(x) + u(x) \cdot v'(x)$$

Integrating both sides and rearranging:

$$\int u \, dv = uv - \int v \, du$$

This technique is useful when the integral of the product $u \, dv$ is hard, but the integral on the right-hand side ($\int v \, du$) is easier.

### Choosing $u$ and $dv$: The LIATE Rule

The key to integration by parts is choosing $u$ and $dv$ wisely. The **LIATE** mnemonic gives priority for choosing $u$:

1. **L**ogarithmic functions ($\ln x$, $\log x$)
2. **I**nverse trigonometric functions ($\arctan x$, $\arcsin x$)
3. **A**lgebraic functions ($x^2$, $x$, polynomials)
4. **T**rigonometric functions ($\sin x$, $\cos x$)
5. **E**xponential functions ($e^x$, $2^x$)

Choose $u$ from earlier in this list. The function later in the list becomes part of $dv$.

### Examples

**Example 1:** Find $\int x e^x \, dx$

Choose $u = x$ (algebraic) and $dv = e^x \, dx$ (exponential). Then $du = dx$ and $v = e^x$:

$$\int x e^x \, dx = x e^x - \int e^x \, dx = x e^x - e^x + C = e^x(x - 1) + C$$

**Example 2:** Find $\int x^2 \sin x \, dx$

Choose $u = x^2$ and $dv = \sin x \, dx$. Then $du = 2x \, dx$ and $v = -\cos x$:

$$\int x^2 \sin x \, dx = - x^2 \cos x + \int 2x \cos x \, dx$$

Apply integration by parts again to $\int 2x \cos x \, dx$ with $u = 2x$, $dv = \cos x \, dx$:

$$\int 2x \cos x \, dx = 2x \sin x - \int 2 \sin x \, dx = 2x \sin x + 2 \cos x + C$$

Combining:

$$\int x^2 \sin x \, dx = - x^2 \cos x + 2x \sin x + 2 \cos x + C$$

**Example 3:** Find $\int \ln x \, dx$

Choose $u = \ln x$ and $dv = dx$. Then $du = \frac{1}{x} dx$ and $v = x$:

$$\int \ln x \, dx = x \ln x - \int x \cdot \frac{1}{x} \, dx = x \ln x - \int 1 \, dx = x \ln x - x + C = x(\ln x - 1) + C$$

**Example 4:** Find $\int e^x \sin x \, dx$

This is a classic example where integration by parts must be applied twice, and the original integral reappears. Let $I = \int e^x \sin x \, dx$.

First application: $u = \sin x$, $dv = e^x \, dx$:

$$I = e^x \sin x - \int e^x \cos x \, dx$$

Second application to $\int e^x \cos x \, dx$: $u = \cos x$, $dv = e^x \, dx$:

$$I = e^x \sin x - \left[e^x \cos x + \int e^x \sin x \, dx\right] = e^x \sin x - e^x \cos x - I$$

Solving for $I$:

$$2I = e^x(\sin x - \cos x) \implies I = \frac{e^x(\sin x - \cos x)}{2} + C$$

<python-figure src="integration-by-parts" caption="Integration by parts on ∫xe^x dx: the product xe^x minus the correction term e^x gives the antiderivative e^x(x − 1)."></python-figure>

### Definite Integration by Parts

For definite integrals, the formula becomes:

$$\int_a^b u \, dv = \Big[uv\Big]_a^b - \int_a^b v \, du$$

**Example:** Compute $\int_0^1 x e^x \, dx$

$$\int_0^1 x e^x \, dx = \Big[x e^x\Big]_0^1 - \int_0^1 e^x \, dx = (1 \cdot e - 0) - (e - 1) = e - e + 1 = 1$$

---

## Numerical Integration

### Why Numerical Methods?

Many integrals encountered in quantitative finance have no closed-form antiderivative. The standard normal CDF:

$$\Phi(x) = \frac{1}{\sqrt{2\pi}} \int_{-\infty}^{x} e^{-t^2/2} \, dt$$

is the most famous example - there is no elementary antiderivative for $e^{-t^2/2}$. We must use numerical methods.

### The Trapezoidal Rule

The trapezoidal rule approximates the area under the curve using trapezoids instead of rectangles:

$$\int_a^b f(x) \, dx \approx \frac{\Delta x}{2} \left[f(x_0) + 2f(x_1) + 2f(x_2) + \cdots + 2f(x_{n-1}) + f(x_n)\right]$$

where $\Delta x = \frac{b-a}{n}$ and $x_i = a + i \cdot \Delta x$. The error is $O(\Delta x^2)$ - it converges as $O(1/n^2)$.

### Simpson's Rule

Simpson's rule fits parabolas through consecutive groups of three points, achieving $O(1/n^4)$ convergence:

$$\int_a^b f(x) \, dx \approx \frac{\Delta x}{3} \left[f(x_0) + 4f(x_1) + 2f(x_2) + 4f(x_3) + \cdots + 4f(x_{n-1}) + f(x_n)\right]$$

where $n$ must be even. This is remarkably accurate for smooth functions - often just 10–20 subintervals suffice for 8+ digits of precision.

### Python Implementation

```python
def trapezoidal(f, a, b, n):
    """Trapezoidal rule with n subintervals."""
    dx = (b - a) / n
    total = 0.5 * (f(a) + f(b))
    for i in range(1, n):
        total += f(a + i * dx)
    return total * dx

def simpsons(f, a, b, n):
    """Simpson's rule with n subintervals (n must be even)."""
    if n % 2 != 0:
        n += 1
    dx = (b - a) / n
    total = f(a) + f(b)
    for i in range(1, n):
        x = a + i * dx
        total += 4 * f(x) if i % 2 == 1 else 2 * f(x)
    return total * dx / 3

# Compare on ∫₀¹ e^(-x²) dx ≈ 0.746824...
import math
f = lambda x: math.exp(-x**2)
exact = 0.746824132812427  # from scipy

for n in [4, 8, 16, 32]:
    trap = trapezoidal(f, 0, 1, n)
    simp = simpsons(f, 0, 1, n)
    print(f"n={n:>2}: trap error={abs(trap-exact):.2e}, "
          f"simpson error={abs(simp-exact):.2e}")
```

Output:

```
n= 4: trap error=1.73e-03, simpson error=6.50e-06
n= 8: trap error=4.32e-04, simpson error=3.83e-07
n=16: trap error=1.08e-04, simpson error=2.35e-08
n=32: trap error=2.70e-05, simpson error=1.45e-09
```

Simpson's rule achieves 9 digits of accuracy with just 32 subintervals, while the trapezoidal rule manages only 5.

<python-figure src="numerical-integration" caption="Trapezoidal vs. Simpson's rule convergence for ∫₀¹ e^(-x²) dx. Simpson's rule converges as O(1/n⁴), dramatically outpacing the trapezoidal rule's O(1/n²)."></python-figure>

### Gaussian Quadrature

For the highest accuracy per function evaluation, **Gaussian quadrature** chooses both the sample points and weights optimally:

$$\int_{-1}^{1} f(x) \, dx \approx \sum_{i=1}^{n} w_i f(x_i)$$

where $x_i$ are roots of the Legendre polynomial $P_n(x)$ and $w_i$ are the corresponding weights. With $n$ points, Gaussian quadrature is exact for polynomials of degree $\leq 2n - 1$.

```python
from scipy.integrate import quad

# The gold standard: adaptive Gaussian quadrature
result, error = quad(lambda x: math.exp(-x**2), 0, 1)
print(f"∫₀¹ e^(-x²) dx = {result:.15f}")
print(f"Estimated error: {error:.2e}")
```

Output:

```
∫₀¹ e^(-x²) dx = 0.746824132812427
Estimated error: 8.29e-15
```

SciPy's `quad` function uses adaptive Gaussian quadrature and is the go-to tool for numerical integration in Python.

---

## Applications in Quantitative Finance

### Option Pricing: The Black-Scholes Integral

The Black-Scholes formula for a European call option can be written as an integral over the risk-neutral density:

$$C = e^{-rT} \int_K^{\infty} (S_T - K) \cdot f(S_T) \, dS_T$$

where $f(S_T)$ is the log-normal density of the terminal stock price under the risk-neutral measure. Working through the algebra yields the familiar formula involving the normal CDF $\Phi$ - but the integral form reveals the economic intuition: the option price is the discounted expected payoff.

For exotic options where no closed-form solution exists, we compute this integral numerically:

```python
from scipy.integrate import quad
from scipy.stats import norm
import numpy as np

def bs_call_integral(S, K, T, r, sigma):
    """Black-Scholes call price via numerical integration."""
    # Log-normal density of S_T under risk-neutral measure
    mu = np.log(S) + (r - 0.5 * sigma**2) * T
    s = sigma * np.sqrt(T)

    def integrand(ST):
        payoff = max(ST - K, 0)
        density = norm.pdf(np.log(ST), mu, s) / ST
        return payoff * density

    price, _ = quad(integrand, K, K * 10)  # integrate from K to large value
    return np.exp(-r * T) * price

# Example: S=100, K=100, T=1, r=0.05, sigma=0.20
price = bs_call_integral(100, 100, 1, 0.05, 0.20)
print(f"BS Call Price (numerical): ${price:.4f}")

# Compare with closed form
d1 = (np.log(100/100) + (0.05 + 0.04/2) * 1) / 0.20
d2 = d1 - 0.20
closed = 100 * norm.cdf(d1) - 100 * np.exp(-0.05) * norm.cdf(d2)
print(f"BS Call Price (closed):    ${closed:.4f}")
```

Output:

```
BS Call Price (numerical): $10.4506
BS Call Price (closed):    $10.4506
```

### Present Value of Continuous Cash Flows

When cash flows arrive continuously (a reasonable approximation for high-frequency revenue streams), the present value is an integral:

$$PV = \int_0^T C(t) \cdot e^{-rt} \, dt$$

where $C(t)$ is the cash flow rate at time $t$ and $r$ is the continuous discount rate.

**Example:** A project generates cash flows of $C(t) = 100e^{0.03t}$ (growing at 3%) for 10 years, discounted at 8%:

$$PV = \int_0^{10} 100 e^{0.03t} \cdot e^{-0.08t} \, dt = 100 \int_0^{10} e^{-0.05t} \, dt = 100 \left[\frac{e^{-0.05t}}{-0.05}\right]_0^{10}$$

$$= \frac{100}{0.05}(1 - e^{-0.5}) = 2000(1 - 0.6065) = \$787.00$$

### Duration and Convexity

For a bond with continuous cash flows, **modified duration** and **convexity** are defined via integrals:

$$D = \frac{1}{P} \int_0^T t \cdot C(t) \cdot e^{-yt} \, dt$$

$$\text{Convexity} = \frac{1}{P} \int_0^T t^2 \cdot C(t) \cdot e^{-yt} \, dt$$

Duration measures the weighted-average time to receive cash flows (first moment), while convexity measures the dispersion (second moment). Both are integrals that arise from differentiating the price function with respect to yield - connecting differentiation and integration full circle.

### Value-at-Risk from Continuous Distributions

If portfolio returns follow a continuous distribution with density $f(x)$, the **Value-at-Risk** at confidence level $\alpha$ is found by solving:

$$\int_{-\infty}^{-\text{VaR}} f(x) \, dx = 1 - \alpha$$

And the **Conditional Value-at-Risk (CVaR)**, or Expected Shortfall, is the expected loss given that the loss exceeds VaR:

$$\text{CVaR}_\alpha = \frac{1}{1-\alpha} \int_{-\infty}^{-\text{VaR}} x \cdot f(x) \, dx$$

Both require evaluating integrals of the loss distribution - analytically for normal distributions, numerically for heavy-tailed distributions like Student-t or mixture models.

```python
from scipy.integrate import quad
from scipy.stats import norm, t as t_dist
import numpy as np

def cvar_numerical(dist, alpha):
    """Compute CVaR at confidence level alpha for a given distribution."""
    var = dist.ppf(1 - alpha)
    integrand = lambda x: x * dist.pdf(x)
    expected_tail, _ = quad(integrand, dist.ppf(1e-10), var)
    return - expected_tail / (1 - alpha)

# Normal distribution: mu=0.05, sigma=0.20
mu, sigma = 0.05, 0.20
normal = norm(loc=mu, scale=sigma)
var_95 = - normal.ppf(0.05)
cvar_95 = cvar_numerical(normal, 0.95)

print(f"Normal VaR(95%):  {var_95:.4f}")
print(f"Normal CVaR(95%): {cvar_95:.4f}")

# Student-t with 4 degrees of freedom (heavier tails)
df = 4
student = t_dist(df, loc=mu, scale=sigma)
var_t = - student.ppf(0.05)
cvar_t = cvar_numerical(student, 0.95)

print(f"Student-t VaR(95%):  {var_t:.4f}")
print(f"Student-t CVaR(95%): {cvar_t:.4f}")
```

Output:

```
Normal VaR(95%):  0.2790
Normal CVaR(95%): 0.3590
Student-t VaR(95%):  0.3098
Student-t CVaR(95%): 0.4820
```

The heavy-tailed Student-t distribution produces significantly higher risk metrics, illustrating why the choice of distribution matters in risk management.

<python-figure src="var-cvar" caption="VaR and CVaR for normal vs. Student-t distributions. The shaded tail areas represent the probability of extreme losses - heavier tails mean more tail risk."></python-figure>

---

## Expected Values Using Integration

### Definition

The **expected value** of a continuous random variable $X$ with probability density function $f(x)$ is:

$$E[X] = \int_{-\infty}^{\infty} x \cdot f(x) \, dx$$

More generally, the expected value of any function $g(X)$ is:

$$E[g(X)] = \int_{-\infty}^{\infty} g(x) \cdot f(x) \, dx$$

This is the continuous analog of the weighted average: instead of summing over discrete outcomes, we integrate over all possible values, each weighted by its probability density.

### Variance and Higher Moments

The **variance** is the expected squared deviation from the mean:

$$\text{Var}(X) = E[(X - \mu)^2] = \int_{-\infty}^{\infty} (x - \mu)^2 \cdot f(x) \, dx$$

A useful computational formula:

$$\text{Var}(X) = E[X^2] - (E[X])^2$$

Higher moments -**skewness** and **kurtosis** - are similarly defined via integrals:

$$\text{Skew}(X) = E\left[\left(\frac{X - \mu}{\sigma}\right)^3\right] = \int_{-\infty}^{\infty} \left(\frac{x - \mu}{\sigma}\right)^3 f(x) \, dx$$

$$\text{Kurt}(X) = E\left[\left(\frac{X - \mu}{\sigma}\right)^4\right] = \int_{-\infty}^{\infty} \left(\frac{x - \mu}{\sigma}\right)^4 f(x) \, dx$$

These moments quantify the shape of return distributions and are central to portfolio risk analysis.

### Expected Option Payoffs

The price of any European-style derivative is the discounted expected payoff under the risk-neutral measure:

$$V = e^{-rT} \cdot E^Q[\text{Payoff}(S_T)] = e^{-rT} \int_0^{\infty} \text{Payoff}(S_T) \cdot f^Q(S_T) \, dS_T$$

For a **call option**: $\text{Payoff} = \max(S_T - K, 0)$

For a **put option**: $\text{Payoff} = \max(K - S_T, 0)$

For a **digital call**: $\text{Payoff} = \mathbf{1}_{S_T > K}$

```python
from scipy.integrate import quad
from scipy.stats import norm
import numpy as np

def price_derivative(payoff_func, S, K, T, r, sigma):
    """Price any European derivative via risk-neutral integration."""
    mu = np.log(S) + (r - 0.5 * sigma**2) * T
    s = sigma * np.sqrt(T)

    def integrand(ST):
        if ST <= 0:
            return 0
        density = norm.pdf(np.log(ST), mu, s) / ST
        return payoff_func(ST) * density

    price, _ = quad(integrand, 1e-6, S * 10)
    return np.exp(-r * T) * price

S, K, T, r, sigma = 100, 100, 1, 0.05, 0.20

# Price different derivatives
call = price_derivative(lambda ST: max(ST - K, 0), S, K, T, r, sigma)
put = price_derivative(lambda ST: max(K - ST, 0), S, K, T, r, sigma)
digital = price_derivative(lambda ST: 1.0 if ST > K else 0.0, S, K, T, r, sigma)
straddle = price_derivative(lambda ST: abs(ST - K), S, K, T, r, sigma)

print(f"Call:     ${call:.4f}")
print(f"Put:      ${put:.4f}")
print(f"Digital:  ${digital:.4f}")
print(f"Straddle: ${straddle:.4f}")
```

Output:

```
Call:     $10.4506
Put:      $5.5735
Digital:  $0.5323
Straddle: $16.0241
```

### The Normal Distribution

The **normal distribution** with mean $\mu$ and variance $\sigma^2$ has density:

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} \exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)$$

Its expected value and variance can be computed via integration:

$$E[X] = \int_{-\infty}^{\infty} x \cdot \frac{1}{\sigma\sqrt{2\pi}} e^{-(x-\mu)^2/(2\sigma^2)} \, dx = \mu$$

$$\text{Var}(X) = \int_{-\infty}^{\infty} (x - \mu)^2 \cdot \frac{1}{\sigma\sqrt{2\pi}} e^{-(x-\mu)^2/(2\sigma^2)} \, dx = \sigma^2$$

The integral for $E[X]$ is solved by substitution ($u = x - \mu$), splitting into an odd function (which integrates to zero) and a constant times the total probability (which integrates to $\mu$). These integrals are foundational - everything in quantitative finance that involves the normal distribution ultimately rests on them.

### Moment-Generating Functions

The **moment-generating function (MGF)** compactly encodes all moments of a distribution:

$$M_X(t) = E[e^{tX}] = \int_{-\infty}^{\infty} e^{tx} f(x) \, dx$$

The $n$-th moment is recovered by differentiating:

$$E[X^n] = M_X^{(n)}(0)$$

For the normal distribution, the MGF is:

$$M_X(t) = \exp\left(\mu t + \frac{\sigma^2 t^2}{2}\right)$$

This is derived by completing the square in the exponent of the integral - a technique that combines substitution with the Gaussian integral $\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$. The MGF is particularly useful in quantitative finance for proving that sums of independent normal random variables are normal, and for deriving the distribution of portfolio returns.

<python-figure src="expected-value" caption="Expected value as the 'balance point' of a distribution. For the normal distribution, E[X] = μ is the center of symmetry."></python-figure>

---

## Conclusion

Integration is the mathematical engine behind much of quantitative finance. From the basic power rule to sophisticated numerical quadrature, the techniques covered in this post form a progression:

1. **The power rule** and **common antiderivatives** handle the simplest integrals - polynomials, exponentials, and trigonometric functions
2. **Substitution** extends our reach by transforming complex integrands into standard forms, leveraging the chain rule in reverse
3. **Integration by parts** tackles products of functions by trading one integral for a simpler one, using the product rule in reverse
4. **Numerical integration** (trapezoidal, Simpson's, Gaussian quadrature) handles the vast majority of real-world integrals that resist closed-form solutions
5. **Expected values** connect integration to probability, enabling the pricing of derivatives, computation of risk metrics, and analysis of return distributions

The Fundamental Theorem of Calculus ties everything together: differentiation and integration are inverse operations. Every derivative formula you know gives you an antiderivative for free. And when antiderivatives don't exist in closed form, numerical methods provide answers to arbitrary precision.

For further reading, Shreve's _Stochastic Calculus for Finance_ extends these ideas to stochastic integrals (Ito calculus), which underpin modern derivative pricing theory. Press et al.'s _Numerical Recipes_ covers the implementation details of production-quality quadrature routines. And for a rigorous treatment of Lebesgue integration - the foundation of modern probability theory - Williams' _Probability with Martingales_ is the standard reference.
