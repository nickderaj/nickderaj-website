---
title: 'Ordinary Differential Equations for Quantitative Finance'
date: '2026-03-25'
description: 'A hands-on guide to ordinary differential equations - separable, first-order linear, homogeneous, and nonhomogeneous - with solution techniques, Python implementations, and applications in quantitative finance.'
tags: ['math', 'python', 'quant', 'differential-equations']
---

<table-of-contents>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#what-is-a-differential-equation">What Is a Differential Equation?</a></li>
<li><a href="#separable-differential-equations">Separable Differential Equations</a></li>
<li><a href="#first-order-linear-differential-equations">First-Order Linear Differential Equations</a></li>
<li><a href="#second-order-homogeneous-differential-equations">Second-Order Homogeneous Differential Equations</a></li>
<li><a href="#second-order-nonhomogeneous-differential-equations">Second-Order Nonhomogeneous Differential Equations</a></li>
<li><a href="#numerical-methods-for-odes">Numerical Methods for ODEs</a></li>
<li><a href="#applications-in-quantitative-finance">Applications in Quantitative Finance</a></li>
<li><a href="#conclusion">Conclusion</a></li>
</table-of-contents>

---

## Introduction

Differential equations describe how things change. In quantitative finance, the things that change are prices, interest rates, portfolio values, and risk exposures. The Black-Scholes equation is a partial differential equation. Short-rate models like Vasicek and CIR are driven by ordinary differential equations. Mean-reverting trading signals, exponential decay of autocorrelation, and continuous compounding all reduce to ODEs that we need to solve analytically or numerically.

An ordinary differential equation (ODE) relates a function to its own derivatives. Where algebra asks "find the number $x$ that satisfies this equation," ODEs ask "find the function $y(t)$ whose derivatives satisfy this equation." The unknown is not a number but a curve.

This post covers four families of ODEs from first principles: separable equations, first-order linear equations, second-order homogeneous equations, and second-order nonhomogeneous equations. For each type, we derive the general solution technique, work through examples, plot solution curves, and connect to real problems in quantitative finance.

---

## What Is a Differential Equation?

### Definition

An **ordinary differential equation** is an equation involving a function $y(t)$ and one or more of its derivatives $y'(t), y''(t), \ldots$ with respect to a single independent variable $t$:

$$F(t, y, y', y'', \ldots, y^{(n)}) = 0$$

The **order** of an ODE is the highest derivative that appears. A **first-order** ODE involves only $y'$, a **second-order** ODE involves $y''$, and so on.

### Solutions and Initial Conditions

A **solution** to an ODE is a function $y(t)$ that satisfies the equation for all $t$ in some interval. Most ODEs have infinitely many solutions (a family of curves), and we need additional information to pick out a specific one.

An **initial value problem** (IVP) pairs an ODE with initial conditions:

$$y' = f(t, y), \qquad y(t_0) = y_0$$

The initial condition pins down which curve in the solution family passes through the point $(t_0, y_0)$. For a second-order ODE, we need two initial conditions: $y(t_0) = y_0$ and $y'(t_0) = v_0$.

### Direction Fields

A first-order ODE $y' = f(t, y)$ assigns a slope to every point $(t, y)$ in the plane. Plotting these slopes as short line segments gives a **direction field** (or slope field). Solution curves must be tangent to the direction field at every point, so the field gives a visual picture of how solutions behave before we solve anything.

<python-figure src="direction-field" caption="Direction field for y' = -y + sin(t). The short line segments show the slope at each point. Solution curves (colored) follow the field, all converging toward the same periodic steady state regardless of initial condition."></python-figure>

### Linear vs. Nonlinear

An ODE is **linear** if it can be written as:

$$a_n(t) y^{(n)} + a_{n-1}(t) y^{(n-1)} + \cdots + a_1(t) y' + a_0(t) y = g(t)$$

The function $y$ and its derivatives appear only to the first power and are not multiplied together. Linear ODEs have a rich theory with explicit solution formulas. Nonlinear ODEs (like $y' = y^2$) are much harder and usually require numerical methods.

---

## Separable Differential Equations

### The Idea

A first-order ODE is **separable** if it can be written as:

$$\frac{dy}{dt} = g(t) \cdot h(y)$$

The right-hand side factors into a function of $t$ alone times a function of $y$ alone. This lets us move all the $y$ terms to one side and all the $t$ terms to the other, then integrate both sides independently.

### Solution Method

Starting from $\frac{dy}{dt} = g(t) \cdot h(y)$, divide both sides by $h(y)$ (assuming $h(y) \neq 0$):

$$\frac{1}{h(y)} \frac{dy}{dt} = g(t)$$

Now integrate both sides with respect to $t$:

$$\int \frac{1}{h(y)} \, dy = \int g(t) \, dt + C$$

Perform both integrals and solve for $y$ (if possible). The constant $C$ is determined by the initial condition.

### Example 1: Exponential Growth and Decay

The simplest separable ODE is:

$$\frac{dy}{dt} = ky$$

where $k$ is a constant. Separate variables:

$$\frac{1}{y} \, dy = k \, dt$$

Integrate both sides:

$$\ln|y| = kt + C$$

Exponentiate:

$$y(t) = Ae^{kt}$$

where $A = e^C$ is determined by the initial condition $y(0) = A$.

- If $k > 0$: **exponential growth** (population growth, compound interest)
- If $k < 0$: **exponential decay** (radioactive decay, signal decay, mean reversion)

This is the most important ODE in finance. Continuous compounding at rate $r$ means $\frac{dP}{dt} = rP$, giving $P(t) = P_0 e^{rt}$.

<python-figure src="exponential-growth-decay" caption="Solutions to y' = ky for different values of k. Positive k gives exponential growth, negative k gives exponential decay. All curves pass through y(0) = 1."></python-figure>

### Example 2: Logistic Growth

The logistic equation models growth that saturates at a carrying capacity $K$:

$$\frac{dy}{dt} = ry\left(1 - \frac{y}{K}\right)$$

This is separable with $g(t) = 1$ and $h(y) = ry(1 - y/K)$. Using partial fractions:

$$\frac{1}{y(1 - y/K)} = \frac{1}{y} + \frac{1/K}{1 - y/K}$$

Integrating:

$$\ln|y| - \ln|1 - y/K| = rt + C$$

Solving for $y$:

$$y(t) = \frac{K}{1 + \left(\frac{K}{y_0} - 1\right)e^{-rt}}$$

For small $y$, the growth is approximately exponential ($y \approx y_0 e^{rt}$). As $y$ approaches $K$, the growth rate slows and $y \to K$ asymptotically. In finance, logistic curves model adoption rates, market saturation, and the growth of AUM in strategies that face capacity constraints.

<python-figure src="logistic-growth" caption="Logistic growth with K = 100 and r = 0.5 for different initial conditions. All solutions converge to the carrying capacity K = 100 regardless of starting point."></python-figure>

### Example 3: A Nonlinear Separable ODE

$$\frac{dy}{dt} = t \cdot y^2$$

Separate: $\frac{dy}{y^2} = t \, dt$. Integrate: $-\frac{1}{y} = \frac{t^2}{2} + C$.

Solve for $y$: $y(t) = \frac{-2}{t^2 + C'}$ where $C' = 2C$.

With $y(0) = 1$: $C' = -2$, so $y(t) = \frac{2}{2 - t^2}$.

This solution has a vertical asymptote at $t = \sqrt{2}$ - the solution blows up in finite time. This kind of finite-time blowup appears in models of self-reinforcing feedback loops and can signal when a model breaks down.

### Python Implementation

```python
import numpy as np
from scipy.integrate import solve_ivp

def solve_separable_example():
    """Solve y' = ky numerically and compare with exact solution."""
    k = -0.5

    # Numerical solution using scipy
    sol = solve_ivp(
        lambda t, y: k * y,
        t_span=[0, 10],
        y0=[1.0],
        t_eval=np.linspace(0, 10, 200)
    )

    # Exact solution
    exact = np.exp(k * sol.t)

    max_error = np.max(np.abs(sol.y[0] - exact))
    print(f"Max error between numerical and exact: {max_error:.2e}")
    return sol.t, sol.y[0], exact

t, numerical, exact = solve_separable_example()
```

Output:

```
Max error between numerical and exact: 1.33e-08
```

---

## First-Order Linear Differential Equations

### Standard Form

A first-order linear ODE has the form:

$$\frac{dy}{dt} + P(t) \, y = Q(t)$$

The function $y$ and its derivative $y'$ appear linearly (to the first power, not multiplied together). The coefficient functions $P(t)$ and $Q(t)$ can be any functions of $t$.

If $Q(t) = 0$, the equation is **homogeneous** (and also separable). If $Q(t) \neq 0$, it is **nonhomogeneous**, and we need a more general technique.

### The Integrating Factor Method

The key idea is to multiply both sides by a carefully chosen function $\mu(t)$ (the **integrating factor**) that makes the left-hand side a perfect derivative.

We want:

$$\mu(t) \frac{dy}{dt} + \mu(t) P(t) y = \frac{d}{dt}\left[\mu(t) y\right]$$

Expanding the right side by the product rule: $\frac{d}{dt}[\mu y] = \mu y' + \mu' y$. Comparing with the left side, we need $\mu' = \mu P(t)$, which is itself a separable ODE with solution:

$$\mu(t) = e^{\int P(t) \, dt}$$

Multiplying the original equation by $\mu(t)$:

$$\frac{d}{dt}\left[\mu(t) y\right] = \mu(t) Q(t)$$

Integrate both sides:

$$\mu(t) y = \int \mu(t) Q(t) \, dt + C$$

Solve for $y$:

$$y(t) = \frac{1}{\mu(t)} \left[\int \mu(t) Q(t) \, dt + C\right]$$

### Example 1: Constant Coefficients

$$\frac{dy}{dt} + 2y = 6$$

Here $P(t) = 2$ and $Q(t) = 6$.

**Integrating factor:** $\mu = e^{\int 2 \, dt} = e^{2t}$.

**Multiply and integrate:**

$$\frac{d}{dt}[e^{2t} y] = 6e^{2t}$$

$$e^{2t} y = 3e^{2t} + C$$

$$y(t) = 3 + Ce^{-2t}$$

As $t \to \infty$, the transient term $Ce^{-2t}$ dies out and $y \to 3$ (the steady state). The steady-state value $y = 3$ solves the algebraic equation $2y = 6$, which is what you get by setting $y' = 0$.

<python-figure src="first-order-linear" caption="Solutions to y' + 2y = 6 for different initial conditions. All solutions converge to the steady state y = 3 as the transient Ce^{-2t} decays."></python-figure>

### Example 2: Variable Coefficients

$$\frac{dy}{dt} + \frac{1}{t} y = t, \qquad t > 0$$

**Integrating factor:** $\mu = e^{\int (1/t) \, dt} = e^{\ln t} = t$.

**Multiply:**

$$\frac{d}{dt}[ty] = t^2$$

**Integrate:**

$$ty = \frac{t^3}{3} + C$$

$$y(t) = \frac{t^2}{3} + \frac{C}{t}$$

With $y(1) = 2$: $2 = \frac{1}{3} + C$, so $C = \frac{5}{3}$ and $y(t) = \frac{t^2}{3} + \frac{5}{3t}$.

### Example 3: Newton's Law of Cooling

A classic first-order linear ODE: the temperature $T$ of an object in an environment at temperature $T_a$ satisfies:

$$\frac{dT}{dt} = -k(T - T_a)$$

Rewrite as $\frac{dT}{dt} + kT = kT_a$. This has integrating factor $\mu = e^{kt}$ and solution:

$$T(t) = T_a + (T_0 - T_a)e^{-kt}$$

The temperature decays exponentially toward the ambient temperature. The rate constant $k$ depends on the object's thermal properties. This same mathematical structure appears in mean-reverting models throughout finance (see the Vasicek model below).

### Python Implementation

```python
import numpy as np
from scipy.integrate import solve_ivp

def integrating_factor_solve(P, Q, t_span, y0, t_eval):
    """Solve y' + P(t)*y = Q(t) using scipy for comparison.

    Also returns the exact solution when P and Q are constant.
    """
    def ode(t, y):
        return Q(t) - P(t) * y[0]

    sol = solve_ivp(ode, t_span, [y0], t_eval=t_eval)
    return sol.t, sol.y[0]

# Example: y' + 2y = 6, y(0) = 0
t, y = integrating_factor_solve(
    P=lambda t: 2,
    Q=lambda t: 6,
    t_span=[0, 5],
    y0=0,
    t_eval=np.linspace(0, 5, 200)
)

# Exact: y = 3 - 3*exp(-2t)
exact = 3 - 3 * np.exp(-2 * t)
print(f"Max error: {np.max(np.abs(y - exact)):.2e}")
```

Output:

```
Max error: 8.88e-09
```

---

## Second-Order Homogeneous Differential Equations

### Standard Form

A second-order linear homogeneous ODE with constant coefficients has the form:

$$ay'' + by' + cy = 0$$

where $a$, $b$, $c$ are constants. "Homogeneous" means the right-hand side is zero. These equations model systems that evolve freely without external forcing: a spring-mass system without applied force, a circuit without a voltage source, or the undriven component of a financial model.

### The Characteristic Equation

The key insight is to guess a solution of the form $y = e^{rt}$. Substituting into $ay'' + by' + cy = 0$:

$$ar^2 e^{rt} + br e^{rt} + c e^{rt} = 0$$

Since $e^{rt} \neq 0$, we can divide it out:

$$ar^2 + br + c = 0$$

This is the **characteristic equation** (or auxiliary equation). It is a quadratic in $r$, and its roots determine the form of the general solution. There are three cases depending on the discriminant $\Delta = b^2 - 4ac$.

### Case 1: Two Distinct Real Roots ($\Delta > 0$)

If $r_1 \neq r_2$ are both real, the general solution is:

$$y(t) = C_1 e^{r_1 t} + C_2 e^{r_2 t}$$

**Example:** $y'' - 3y' + 2y = 0$.

Characteristic equation: $r^2 - 3r + 2 = (r - 1)(r - 2) = 0$, so $r_1 = 1$ and $r_2 = 2$.

General solution: $y(t) = C_1 e^{t} + C_2 e^{2t}$.

With $y(0) = 1$ and $y'(0) = 0$: solving $C_1 + C_2 = 1$ and $C_1 + 2C_2 = 0$ gives $C_1 = 2$, $C_2 = -1$.

$$y(t) = 2e^{t} - e^{2t}$$

Both roots are positive, so the solution grows without bound. If both roots were negative, the solution would decay to zero (stable). If one root is positive and one negative, the positive root dominates for large $t$.

<python-figure src="homogeneous-real-roots" caption="Solutions to y'' - 3y' + 2y = 0 for different initial conditions. The characteristic roots r = 1 and r = 2 are both positive, so all nontrivial solutions grow exponentially."></python-figure>

### Case 2: Complex Conjugate Roots ($\Delta < 0$)

If $\Delta < 0$, the roots are complex conjugates $r = \alpha \pm \beta i$ where $\alpha = -b/(2a)$ and $\beta = \sqrt{4ac - b^2}/(2a)$. The general solution is:

$$y(t) = e^{\alpha t}\left(C_1 \cos(\beta t) + C_2 \sin(\beta t)\right)$$

This represents **oscillation** with:

- **Frequency** determined by $\beta$ (the imaginary part)
- **Amplitude envelope** determined by $e^{\alpha t}$

The behavior depends on the sign of $\alpha$:

- $\alpha < 0$: **damped oscillation** (amplitude decays to zero)
- $\alpha = 0$: **pure oscillation** (constant amplitude, no damping)
- $\alpha > 0$: **growing oscillation** (amplitude increases, unstable)

**Example:** $y'' + 2y' + 5y = 0$.

Characteristic equation: $r^2 + 2r + 5 = 0$. Roots: $r = \frac{-2 \pm \sqrt{4 - 20}}{2} = -1 \pm 2i$.

So $\alpha = -1$ and $\beta = 2$:

$$y(t) = e^{-t}(C_1 \cos 2t + C_2 \sin 2t)$$

This is a damped oscillation with frequency $\omega = 2$ and exponential decay rate $1$.

<python-figure src="homogeneous-complex-roots" caption="Damped oscillation from y'' + 2y' + 5y = 0. The envelope e^{-t} (dashed) bounds the oscillatory solution. The system oscillates with frequency 2 while the amplitude decays exponentially."></python-figure>

### Case 3: Repeated Root ($\Delta = 0$)

If $\Delta = 0$, there is one repeated root $r = -b/(2a)$. The first solution is $y_1 = e^{rt}$, but we need a second linearly independent solution. The trick is that $y_2 = te^{rt}$ also solves the equation. The general solution is:

$$y(t) = (C_1 + C_2 t) e^{rt}$$

**Example:** $y'' + 4y' + 4y = 0$.

Characteristic equation: $r^2 + 4r + 4 = (r + 2)^2 = 0$. Repeated root: $r = -2$.

$$y(t) = (C_1 + C_2 t) e^{-2t}$$

With $y(0) = 1$ and $y'(0) = 3$: $C_1 = 1$ and $C_2 - 2C_1 = 3$, so $C_2 = 5$.

$$y(t) = (1 + 5t) e^{-2t}$$

The repeated root case sits on the boundary between overdamped (two distinct real roots) and underdamped (complex roots). It is called **critically damped** - the system returns to equilibrium as fast as possible without oscillating.

<python-figure src="homogeneous-repeated-root" caption="Critically damped response from y'' + 4y' + 4y = 0. The repeated root r = -2 produces the fastest decay without oscillation. Compare with the overdamped and underdamped cases."></python-figure>

### Summary Table

| Discriminant    | Roots                         | Solution Form                                     | Behavior                  |
| --------------- | ----------------------------- | ------------------------------------------------- | ------------------------- |
| $b^2 - 4ac > 0$ | Two real: $r_1, r_2$          | $C_1 e^{r_1 t} + C_2 e^{r_2 t}$                   | Exponential growth/decay  |
| $b^2 - 4ac < 0$ | Complex: $\alpha \pm \beta i$ | $e^{\alpha t}(C_1 \cos\beta t + C_2 \sin\beta t)$ | Oscillation with envelope |
| $b^2 - 4ac = 0$ | Repeated: $r$                 | $(C_1 + C_2 t)e^{rt}$                             | Critical damping          |

### Python Implementation

```python
import numpy as np
from scipy.integrate import solve_ivp

def solve_second_order(a, b, c, y0, v0, t_span, t_eval):
    """Solve ay'' + by' + cy = 0 with y(0) = y0, y'(0) = v0.

    Converts to a system of two first-order ODEs:
        y' = v
        v' = -(b/a)*v - (c/a)*y
    """
    def system(t, state):
        y, v = state
        dydt = v
        dvdt = -(b / a) * v - (c / a) * y
        return [dydt, dvdt]

    sol = solve_ivp(system, t_span, [y0, v0], t_eval=t_eval)
    return sol.t, sol.y[0], sol.y[1]

# Example: y'' + 2y' + 5y = 0, y(0) = 1, y'(0) = 0
# Roots: -1 +/- 2i, so y = e^{-t}(cos 2t + 0.5 sin 2t)
t, y, v = solve_second_order(1, 2, 5, y0=1, v0=0,
                              t_span=[0, 8],
                              t_eval=np.linspace(0, 8, 400))

# Exact solution
exact = np.exp(-t) * (np.cos(2*t) + 0.5 * np.sin(2*t))
print(f"Max error: {np.max(np.abs(y - exact)):.2e}")
```

Output:

```
Max error: 2.66e-07
```

---

## Second-Order Nonhomogeneous Differential Equations

### Standard Form

A second-order linear nonhomogeneous ODE with constant coefficients:

$$ay'' + by' + cy = g(t)$$

The right-hand side $g(t) \neq 0$ represents an external forcing function. The system is being driven by something: an applied force, a voltage source, a periodic market signal, or an interest rate target.

### The General Solution Structure

The general solution is the sum of two parts:

$$y(t) = y_h(t) + y_p(t)$$

- $y_h(t)$ is the **homogeneous solution** (or complementary solution): the general solution of $ay'' + by' + cy = 0$, found using the characteristic equation as above
- $y_p(t)$ is a **particular solution**: any single function that satisfies the full nonhomogeneous equation

The homogeneous part captures the system's natural response (which typically decays to zero if the system is stable). The particular solution captures the forced response that persists due to $g(t)$.

### Method of Undetermined Coefficients

For certain forms of $g(t)$, we can guess the form of $y_p$ and solve for unknown constants. This works when $g(t)$ is a polynomial, exponential, sine/cosine, or a combination of these.

**The guess table:**

| $g(t)$                              | Guess for $y_p(t)$                      |
| ----------------------------------- | --------------------------------------- |
| $a_n t^n + \cdots + a_0$            | $A_n t^n + \cdots + A_0$                |
| $ae^{kt}$                           | $Ae^{kt}$                               |
| $a\cos(\omega t) + b\sin(\omega t)$ | $A\cos(\omega t) + B\sin(\omega t)$     |
| $t^n e^{kt}$                        | $(A_n t^n + \cdots + A_0)e^{kt}$        |
| $e^{kt}\cos(\omega t)$              | $e^{kt}(A\cos\omega t + B\sin\omega t)$ |

**Important rule:** if your guess for $y_p$ is already a solution of the homogeneous equation, multiply the guess by $t$ (or $t^2$ if it overlaps with both homogeneous solutions). This avoids producing zero when you substitute into the left-hand side.

### Example 1: Polynomial Forcing

$$y'' - 3y' + 2y = 4t$$

**Homogeneous solution:** Characteristic equation $r^2 - 3r + 2 = 0$ gives $r = 1, 2$.

$$y_h = C_1 e^t + C_2 e^{2t}$$

**Particular solution:** Guess $y_p = At + B$. Then $y_p' = A$ and $y_p'' = 0$.

Substitute: $0 - 3A + 2(At + B) = 4t$, so $2At + (2B - 3A) = 4t$.

Matching coefficients: $2A = 4$ gives $A = 2$, and $2B - 3A = 0$ gives $B = 3$.

$$y_p = 2t + 3$$

**General solution:** $y(t) = C_1 e^t + C_2 e^{2t} + 2t + 3$.

### Example 2: Exponential Forcing

$$y'' - 3y' + 2y = e^{3t}$$

**Homogeneous solution:** Same as above, $y_h = C_1 e^t + C_2 e^{2t}$.

**Particular solution:** Guess $y_p = Ae^{3t}$. Then $y_p' = 3Ae^{3t}$ and $y_p'' = 9Ae^{3t}$.

Substitute: $9Ae^{3t} - 9Ae^{3t} + 2Ae^{3t} = e^{3t}$, so $2Ae^{3t} = e^{3t}$.

Therefore $A = 1/2$ and $y_p = \frac{1}{2}e^{3t}$.

**General solution:** $y(t) = C_1 e^t + C_2 e^{2t} + \frac{1}{2}e^{3t}$.

### Example 3: Sinusoidal Forcing (Resonance)

$$y'' + 4y = 3\sin(2t)$$

**Homogeneous solution:** $r^2 + 4 = 0$ gives $r = \pm 2i$.

$$y_h = C_1 \cos(2t) + C_2 \sin(2t)$$

**Particular solution:** We would normally guess $y_p = A\cos(2t) + B\sin(2t)$, but this overlaps with the homogeneous solution. So we multiply by $t$:

$$y_p = t(A\cos(2t) + B\sin(2t))$$

Computing $y_p''$ and substituting (after some algebra):

$$y_p'' + 4y_p = -4A\sin(2t) + 4B\cos(2t) = 3\sin(2t)$$

So $A = -3/4$ and $B = 0$:

$$y_p = -\frac{3}{4}t\cos(2t)$$

The factor of $t$ means the amplitude grows linearly with time. This is **resonance** - when the forcing frequency matches the natural frequency of the system, the response grows without bound. In finance, resonance appears when a trading strategy amplifies rather than dampens a periodic signal in the market.

<python-figure src="resonance" caption="Resonance in y'' + 4y = 3sin(2t). When the forcing frequency (omega = 2) matches the natural frequency, the amplitude grows linearly with time. The dashed envelope shows the t-proportional growth."></python-figure>

### Variation of Parameters

When $g(t)$ does not fit the guess table (e.g., $g(t) = \tan(t)$ or $g(t) = 1/t$), we use **variation of parameters**. Given two homogeneous solutions $y_1(t)$ and $y_2(t)$, a particular solution is:

$$y_p(t) = -y_1(t) \int \frac{y_2(t) g(t)}{W(t)} \, dt + y_2(t) \int \frac{y_1(t) g(t)}{W(t)} \, dt$$

where $W(t) = y_1 y_2' - y_1' y_2$ is the **Wronskian** determinant. This method always works for linear ODEs but often produces integrals that cannot be evaluated in closed form.

### Python Implementation

```python
import numpy as np
from scipy.integrate import solve_ivp

def solve_nonhomogeneous(a, b, c, g, y0, v0, t_span, t_eval):
    """Solve ay'' + by' + cy = g(t) with y(0) = y0, y'(0) = v0."""
    def system(t, state):
        y, v = state
        dydt = v
        dvdt = (g(t) - b * v - c * y) / a
        return [dydt, dvdt]

    sol = solve_ivp(system, t_span, [y0, v0], t_eval=t_eval)
    return sol.t, sol.y[0], sol.y[1]

# Example: y'' + 4y = 3*sin(2t), y(0) = 0, y'(0) = 0
# Resonance case
t, y, v = solve_nonhomogeneous(
    1, 0, 4,
    g=lambda t: 3 * np.sin(2 * t),
    y0=0, v0=0,
    t_span=[0, 20],
    t_eval=np.linspace(0, 20, 800)
)

# Exact: y = -(3/4)*t*cos(2t)
exact = -(3/4) * t * np.cos(2 * t)
print(f"Max error: {np.max(np.abs(y - exact)):.2e}")
```

Output:

```
Max error: 4.52e-05
```

### Forced Damped Oscillation

Combining all elements, consider the forced damped oscillator:

$$y'' + 2\gamma y' + \omega_0^2 y = F_0 \cos(\omega t)$$

where $\gamma$ is the damping coefficient, $\omega_0$ is the natural frequency, $\omega$ is the driving frequency, and $F_0$ is the forcing amplitude.

The transient homogeneous solution decays exponentially (assuming $\gamma > 0$), and the system settles into a steady-state particular solution:

$$y_p(t) = A\cos(\omega t - \phi)$$

where the amplitude and phase shift are:

$$A = \frac{F_0}{\sqrt{(\omega_0^2 - \omega^2)^2 + 4\gamma^2\omega^2}}, \qquad \tan\phi = \frac{2\gamma\omega}{\omega_0^2 - \omega^2}$$

The amplitude peaks near $\omega = \omega_0$ (resonance), with the peak height limited by the damping $\gamma$. This frequency response function appears throughout signal processing and is analogous to how a trading filter responds to market signals at different frequencies.

<python-figure src="forced-damped" caption="Forced damped oscillator y'' + 0.4y' + 4y = cos(wt) for different driving frequencies. The response amplitude peaks near the natural frequency w0 = 2 (resonance) and rolls off at higher frequencies."></python-figure>

---

## Numerical Methods for ODEs

### Why Numerical Methods

Most ODEs encountered in practice do not have closed-form solutions. Even when they do, it is often faster and more flexible to solve them numerically. Numerical methods approximate the solution at discrete time steps, building up the solution curve point by point.

### Euler's Method

The simplest numerical method. Given $y' = f(t, y)$ and step size $h$:

$$y_{n+1} = y_n + h \cdot f(t_n, y_n)$$

This follows the slope at each point for a small step, then recalculates. It is first-order accurate: halving $h$ halves the error. Euler's method is easy to understand but too inaccurate for production use.

### Runge-Kutta 4 (RK4)

The workhorse of ODE solvers. RK4 evaluates the slope at four points within each step and takes a weighted average:

$$k_1 = f(t_n, y_n)$$
$$k_2 = f\left(t_n + \frac{h}{2}, y_n + \frac{h}{2}k_1\right)$$
$$k_3 = f\left(t_n + \frac{h}{2}, y_n + \frac{h}{2}k_2\right)$$
$$k_4 = f(t_n + h, y_n + h k_3)$$
$$y_{n+1} = y_n + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)$$

RK4 is fourth-order accurate: halving $h$ reduces the error by a factor of 16. For a given accuracy target, RK4 needs far fewer steps than Euler's method.

<python-figure src="euler-vs-rk4" caption="Euler's method vs RK4 on y' = -y, y(0) = 1 with step size h = 0.5. Euler visibly drifts from the exact solution e^{-t} while RK4 remains accurate even with large steps."></python-figure>

### Adaptive Step Size

Modern solvers (like `scipy.integrate.solve_ivp` with `method='RK45'`) adjust the step size automatically. They take larger steps where the solution is smooth and smaller steps where it changes rapidly, maintaining a target error tolerance without wasting computation.

### Python Implementation

```python
import numpy as np

def euler_method(f, t_span, y0, h):
    """Euler's method for y' = f(t, y)."""
    t_start, t_end = t_span
    ts = [t_start]
    ys = [y0]
    t, y = t_start, y0

    while t < t_end - 1e-10:
        y = y + h * f(t, y)
        t = t + h
        ts.append(t)
        ys.append(y)

    return np.array(ts), np.array(ys)

def rk4_method(f, t_span, y0, h):
    """Classical Runge-Kutta (RK4) method."""
    t_start, t_end = t_span
    ts = [t_start]
    ys = [y0]
    t, y = t_start, y0

    while t < t_end - 1e-10:
        k1 = f(t, y)
        k2 = f(t + h/2, y + h/2 * k1)
        k3 = f(t + h/2, y + h/2 * k2)
        k4 = f(t + h, y + h * k3)
        y = y + (h/6) * (k1 + 2*k2 + 2*k3 + k4)
        t = t + h
        ts.append(t)
        ys.append(y)

    return np.array(ts), np.array(ys)

# Compare on y' = -y, y(0) = 1
f = lambda t, y: -y
h = 0.5

t_euler, y_euler = euler_method(f, [0, 5], 1.0, h)
t_rk4, y_rk4 = rk4_method(f, [0, 5], 1.0, h)

exact_euler = np.exp(-t_euler)
exact_rk4 = np.exp(-t_rk4)

print(f"Euler max error (h={h}):  {np.max(np.abs(y_euler - exact_euler)):.6f}")
print(f"RK4 max error (h={h}):    {np.max(np.abs(y_rk4 - exact_rk4)):.6f}")
```

Output:

```
Euler max error (h=0.5):  0.059824
RK4 max error (h=0.5):    0.000091
```

---

## Applications in Quantitative Finance

### Continuous Compounding

The simplest financial ODE: if a portfolio grows at continuous rate $r$:

$$\frac{dP}{dt} = rP$$

This is separable with solution $P(t) = P_0 e^{rt}$. Continuous compounding is the limit of discrete compounding as the compounding frequency goes to infinity:

$$P_0 \left(1 + \frac{r}{n}\right)^{nt} \to P_0 e^{rt} \quad \text{as } n \to \infty$$

Every present value calculation in finance uses $e^{-rT}$ as the discount factor. This is just the solution to $\frac{dP}{dt} = -rP$ run backward in time.

### The Vasicek Short-Rate Model

The Vasicek model describes the evolution of the instantaneous interest rate:

$$dr = \kappa(\theta - r) \, dt + \sigma \, dW_t$$

Ignoring the stochastic term $\sigma \, dW_t$ (which requires stochastic calculus), the deterministic part is a first-order linear ODE:

$$\frac{dr}{dt} = \kappa(\theta - r)$$

Rewrite: $\frac{dr}{dt} + \kappa r = \kappa\theta$.

Using the integrating factor $\mu = e^{\kappa t}$:

$$r(t) = \theta + (r_0 - \theta)e^{-\kappa t}$$

This says the rate $r$ reverts to the long-run mean $\theta$ at speed $\kappa$. If $r_0 > \theta$, the rate decreases; if $r_0 < \theta$, it increases. The **half-life** of mean reversion is $t_{1/2} = \ln(2)/\kappa$.

This is the same structure as Newton's law of cooling and the RC circuit. Mean reversion is one of the most important concepts in quantitative finance, and it reduces to a first-order linear ODE.

<python-figure src="vasicek-mean-reversion" caption="Vasicek mean reversion: dr/dt = kappa(theta - r) with theta = 0.05, kappa = 0.5. Rates starting above or below the long-run mean theta = 5% revert exponentially. Half-life = ln(2)/0.5 = 1.39 years."></python-figure>

```python
import numpy as np

def vasicek_deterministic(r0, kappa, theta, T, dt=0.01):
    """Solve the deterministic Vasicek ODE: dr/dt = kappa*(theta - r)."""
    t = np.arange(0, T + dt, dt)
    r_exact = theta + (r0 - theta) * np.exp(-kappa * t)
    return t, r_exact

# Different starting rates, same parameters
kappa, theta = 0.5, 0.05
for r0 in [0.01, 0.03, 0.05, 0.07, 0.10]:
    t, r = vasicek_deterministic(r0, kappa, theta, T=10)
    print(f"r0 = {r0:.2f}: r(10) = {r[-1]:.4f}")
```

Output:

```
r0 = 0.01: r(10) = 0.0497
r0 = 0.03: r(10) = 0.0499
r0 = 0.05: r(10) = 0.0500
r0 = 0.07: r(10) = 0.0501
r0 = 0.10: r(10) = 0.0503
```

### The Black-Scholes PDE (Reduced Form)

The Black-Scholes equation for a European option price $V(S, t)$ is:

$$\frac{\partial V}{\partial t} + \frac{1}{2}\sigma^2 S^2 \frac{\partial^2 V}{\partial S^2} + rS\frac{\partial V}{\partial S} - rV = 0$$

This is a PDE (partial differential equation), but under certain transformations it can be reduced to the heat equation, which is solved via ODEs. More directly, the time evolution of a delta-hedged portfolio satisfies an ODE at each grid point in a finite-difference scheme:

$$\frac{dV_i}{dt} = \frac{1}{2}\sigma^2 S_i^2 \frac{V_{i+1} - 2V_i + V_{i-1}}{(\Delta S)^2} + rS_i \frac{V_{i+1} - V_{i-1}}{2\Delta S} - rV_i$$

This is a system of coupled ODEs, one for each grid point $S_i$. Solving this system (using methods like RK4 or implicit schemes) is how finite-difference option pricing works in practice.

### Portfolio Value with Continuous Deposits

If you invest a continuous stream of $D$ dollars per year into a portfolio earning rate $r$:

$$\frac{dP}{dt} = rP + D$$

This is a first-order linear ODE with $P(t) = P_0 e^{rt} + \frac{D}{r}(e^{rt} - 1)$.

The first term is the growth of the initial investment. The second term is the accumulated value of continuous deposits. For $P_0 = 0$, $D = 10000$, $r = 0.07$:

$$P(30) = \frac{10000}{0.07}(e^{0.07 \times 30} - 1) = \$1{,}066{,}658$$

Compare with a savings account ($r = 0$): $P(30) = 30 \times 10000 = \$300{,}000$. The ODE captures the compounding effect that turns regular deposits into substantial wealth over time.

### Damped Oscillations in Mean-Reverting Spreads

When a pairs trading spread overshoots its equilibrium, the dynamics can be modeled as a damped oscillator:

$$\frac{d^2 s}{dt^2} + 2\gamma \frac{ds}{dt} + \omega_0^2 s = 0$$

where $s$ is the spread deviation from equilibrium, $\gamma$ is the damping from trading friction, and $\omega_0$ is the natural reversion frequency.

- **Underdamped** ($\gamma < \omega_0$): the spread oscillates around equilibrium before settling, creating multiple trading opportunities
- **Critically damped** ($\gamma = \omega_0$): the fastest return to equilibrium without overshooting
- **Overdamped** ($\gamma > \omega_0$): slow monotonic return, fewer trading signals

Understanding which regime a spread is in tells you how to size positions and set take-profit levels.

### The CIR Model

The Cox-Ingersoll-Ross model improves on Vasicek by ensuring interest rates stay positive:

$$dr = \kappa(\theta - r) \, dt + \sigma\sqrt{r} \, dW_t$$

The deterministic part is again $\frac{dr}{dt} = \kappa(\theta - r)$, identical to Vasicek. The stochastic term $\sigma\sqrt{r}$ scales with $\sqrt{r}$, so volatility vanishes as rates approach zero, preventing negative rates. At the ODE level, the mean-reversion behavior is the same, but the stochastic dynamics differ in important ways for option pricing.

### Summary of Financial ODEs

| Model             | ODE                                      | Type                     | Solution                               |
| ----------------- | ---------------------------------------- | ------------------------ | -------------------------------------- |
| Compound growth   | $P' = rP$                                | Separable                | $P_0 e^{rt}$                           |
| Growth + deposits | $P' = rP + D$                            | First-order linear       | $P_0 e^{rt} + \frac{D}{r}(e^{rt} - 1)$ |
| Vasicek rate      | $r' = \kappa(\theta - r)$                | First-order linear       | $\theta + (r_0 - \theta)e^{-\kappa t}$ |
| Spread reversion  | $s'' + 2\gamma s' + \omega_0^2 s = 0$    | 2nd-order homogeneous    | Depends on $\gamma$ vs $\omega_0$      |
| Forced model      | $s'' + 2\gamma s' + \omega_0^2 s = F(t)$ | 2nd-order nonhomogeneous | $y_h + y_p$                            |

---

## Conclusion

Ordinary differential equations give us the language to describe how quantities evolve over time. The four types covered here form a complete toolkit for the most common ODE problems:

1. **Separable equations** split into independent integrals on each side - exponential growth, decay, and logistic saturation all fall into this category
2. **First-order linear equations** are solved by the integrating factor method - this handles mean-reverting models like Vasicek, continuous deposits, and any system with a constant forcing term
3. **Second-order homogeneous equations** reduce to the characteristic equation - the three cases (real roots, complex roots, repeated root) correspond to exponential growth/decay, oscillation, and critical damping
4. **Second-order nonhomogeneous equations** add external forcing via undetermined coefficients or variation of parameters - resonance occurs when the forcing frequency matches the natural frequency

In quantitative finance, these equations appear everywhere: continuous compounding is a separable ODE, mean-reverting interest rate models are first-order linear, spread dynamics in pairs trading can be modeled as damped oscillators, and finite-difference option pricing reduces PDEs to systems of ODEs. Numerical solvers like RK4 and adaptive methods from `scipy.integrate` handle the cases where closed-form solutions do not exist.

For further reading, Boyce and DiPrima's _Elementary Differential Equations_ is the standard reference for solution techniques. Shreve's _Stochastic Calculus for Finance II_ extends these ideas to stochastic differential equations, where the deterministic ODE framework meets Brownian motion and Ito calculus.
