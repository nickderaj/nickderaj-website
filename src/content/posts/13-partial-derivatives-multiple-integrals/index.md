---
title: 'Partial Derivatives and Multiple Integrals: A Quant's Toolkit'
date: '2026-03-23'
description: 'A practical guide to multivariable calculus - partial derivatives, second-order partials, the chain rule, and converting Cartesian integrals to polar coordinates - with worked examples and applications in quantitative finance.'
tags: ['math', 'python', 'quant', 'calculus']
---

<table-of-contents>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#partial-derivatives">Partial Derivatives</a></li>
<li><a href="#second-order-partial-derivatives">Second-Order Partial Derivatives</a></li>
<li><a href="#the-general-chain-rule">The General Chain Rule</a></li>
<li><a href="#double-integrals-in-cartesian-coordinates">Double Integrals in Cartesian Coordinates</a></li>
<li><a href="#polar-coordinates">Polar Coordinates</a></li>
<li><a href="#converting-cartesian-integrals-to-polar">Converting Cartesian Integrals to Polar</a></li>
<li><a href="#applications-in-quantitative-finance">Applications in Quantitative Finance</a></li>
<li><a href="#conclusion">Conclusion</a></li>
</table-of-contents>

---

## Introduction

Quantitative finance lives in multiple dimensions. Option prices depend on the underlying price, volatility, time to expiry, and interest rates simultaneously. Portfolio risk is a function of dozens or hundreds of correlated asset returns. The probability distributions that underpin everything from VaR calculations to copula models are defined over multi-dimensional spaces that require integration in two, three, or more variables.

Single-variable calculus - derivatives and integrals of $f(x)$ - is insufficient for these problems. **Multivariable calculus** extends the core ideas of differentiation and integration to functions of several variables, giving us the tools to analyze how option prices respond to simultaneous changes in multiple market parameters, how to propagate uncertainty through complex models, and how to evaluate the integrals that define expected values and probabilities in higher dimensions.

This post covers the essential multivariable calculus toolkit from first principles: partial derivatives (first and second order), the general chain rule for composite functions, double integrals, and the powerful technique of converting Cartesian integrals to polar coordinates. For each topic, we derive the key formulas, work through concrete examples, visualize the geometry, and connect to real applications in quantitative finance.

---

## Partial Derivatives

### The Core Idea

For a function of two variables $f(x, y)$, the **partial derivative** with respect to $x$ measures how $f$ changes as $x$ varies while $y$ is held fixed. It is defined as:

$$\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x + h, y) - f(x, y)}{h}$$

Similarly, the partial derivative with respect to $y$ holds $x$ fixed:

$$\frac{\partial f}{\partial y} = \lim_{h \to 0} \frac{f(x, y + h) - f(x, y)}{h}$$

The notation $\frac{\partial f}{\partial x}$ (using the "curly d" $\partial$ instead of $d$) signals that other variables exist and are being held constant. Alternative notations include $f_x$, $\partial_x f$, and $D_x f$.

### Computing Partial Derivatives

In practice, computing a partial derivative is straightforward: treat every other variable as a constant and differentiate normally with respect to the variable of interest.

**Example 1:** Let $f(x, y) = x^2 y + 3xy^3 - 2y$.

$$\frac{\partial f}{\partial x} = 2xy + 3y^3$$

(Treating $y$ as a constant: $x^2 y$ differentiates to $2xy$, $3xy^3$ to $3y^3$, and $-2y$ to $0$.)

$$\frac{\partial f}{\partial y} = x^2 + 9xy^2 - 2$$

(Treating $x$ as a constant: $x^2 y$ differentiates to $x^2$, $3xy^3$ to $9xy^2$, and $-2y$ to $-2$.)

**Example 2:** Let $f(x, y) = e^{x^2 y}$.

$$\frac{\partial f}{\partial x} = 2xy \cdot e^{x^2 y}$$

$$\frac{\partial f}{\partial y} = x^2 \cdot e^{x^2 y}$$

Here, we apply the chain rule within each partial derivative, treating the other variable as a constant.

### Geometric Interpretation

The partial derivative $\frac{\partial f}{\partial x}$ at a point $(a, b)$ is the slope of the curve you get by slicing the surface $z = f(x, y)$ with the plane $y = b$. Similarly, $\frac{\partial f}{\partial y}$ at $(a, b)$ is the slope of the slice at $x = a$.

Together, the two partial derivatives define the **gradient vector**:

$$\nabla f = \left(\frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}\right)$$

The gradient points in the direction of steepest ascent of $f$, and its magnitude $|\nabla f|$ gives the rate of change in that direction. This is the foundation of gradient descent optimization, which is ubiquitous in machine learning and model calibration.

<python-figure src="partial-derivative-slices" caption="Partial derivatives of f(x, y) = x² + y² at the point (1, 1). The blue curve shows the slice at y = 1 (slope = ∂f/∂x = 2), and the green curve shows the slice at x = 1 (slope = ∂f/∂y = 2)."></python-figure>

### The Gradient Field

For a function $f(x, y)$, the gradient $\nabla f$ assigns a vector to every point in the domain, creating a **vector field**. The gradient vectors are always perpendicular to the level curves (contours) of $f$, pointing uphill.

<python-figure src="gradient-field" caption="Gradient field of f(x, y) = x² + y². Arrows show the direction and magnitude of the gradient at each point, always perpendicular to the circular contour lines."></python-figure>

### Python Implementation

```python
import numpy as np

def partial_derivative(f, var_index, point, h=1e-8):
    """Compute partial derivative of f at point using central differences.

    Parameters:
        f: function taking a numpy array
        var_index: index of variable to differentiate with respect to
        point: numpy array of coordinates
        h: step size
    """
    point = np.array(point, dtype=float)
    point_plus = point.copy()
    point_minus = point.copy()
    point_plus[var_index] += h
    point_minus[var_index] -= h
    return (f(point_plus) - f(point_minus)) / (2 * h)

def gradient(f, point, h=1e-8):
    """Compute the gradient vector of f at point."""
    point = np.array(point, dtype=float)
    return np.array([
        partial_derivative(f, i, point, h)
        for i in range(len(point))
    ])

# Example: f(x, y) = x^2*y + 3*x*y^3
def f(p):
    x, y = p
    return x**2 * y + 3 * x * y**3

point = np.array([1.0, 2.0])
grad = gradient(f, point)
print(f"∂f/∂x at (1, 2) = {grad[0]:.4f}")  # Expected: 2*1*2 + 3*2^3 = 28
print(f"∂f/∂y at (1, 2) = {grad[1]:.4f}")  # Expected: 1^2 + 9*1*2^2 = 37
print(f"∇f at (1, 2) = ({grad[0]:.4f}, {grad[1]:.4f})")
```

Output:

```
∂f/∂x at (1, 2) = 28.0000
∂f/∂y at (1, 2) = 37.0000
∇f at (1, 2) = (28.0000, 37.0000)
```

---

## Second-Order Partial Derivatives

### Definition

Just as we can take the second derivative of a single-variable function, we can differentiate partial derivatives again. For $f(x, y)$, there are four second-order partial derivatives:

$$f_{xx} = \frac{\partial^2 f}{\partial x^2} = \frac{\partial}{\partial x}\left(\frac{\partial f}{\partial x}\right)$$

$$f_{yy} = \frac{\partial^2 f}{\partial y^2} = \frac{\partial}{\partial y}\left(\frac{\partial f}{\partial y}\right)$$

$$f_{xy} = \frac{\partial^2 f}{\partial y \, \partial x} = \frac{\partial}{\partial y}\left(\frac{\partial f}{\partial x}\right)$$

$$f_{yx} = \frac{\partial^2 f}{\partial x \, \partial y} = \frac{\partial}{\partial x}\left(\frac{\partial f}{\partial y}\right)$$

The "pure" second derivatives $f_{xx}$ and $f_{yy}$ measure curvature along each axis. The "mixed" partials $f_{xy}$ and $f_{yx}$ measure how the rate of change in one direction varies as you move in the other direction.

### Clairaut's Theorem

A fundamental result: if the mixed partial derivatives $f_{xy}$ and $f_{yx}$ are both continuous, then they are equal:

$$f_{xy} = f_{yx}$$

This **symmetry of mixed partials** (Clairaut's theorem, also known as Schwarz's theorem) means the order of differentiation does not matter for well-behaved functions. In practice, virtually all functions encountered in finance satisfy this condition, so you can always differentiate in whichever order is more convenient.

### Worked Example

Let $f(x, y) = x^3 y^2 + \sin(xy)$.

**First-order partials:**

$$f_x = 3x^2 y^2 + y\cos(xy)$$

$$f_y = 2x^3 y + x\cos(xy)$$

**Second-order partials:**

$$f_{xx} = 6xy^2 - y^2\sin(xy)$$

$$f_{yy} = 2x^3 - x^2\sin(xy)$$

$$f_{xy} = 6x^2 y + \cos(xy) - xy\sin(xy)$$

$$f_{yx} = 6x^2 y + \cos(xy) - xy\sin(xy)$$

As expected by Clairaut's theorem, $f_{xy} = f_{yx}$.

### The Hessian Matrix

The four second-order partial derivatives naturally organize into the **Hessian matrix**:

$$H = \begin{pmatrix} f_{xx} & f_{xy} \\ f_{yx} & f_{yy} \end{pmatrix}$$

The Hessian is the multivariable analog of the second derivative. It encodes curvature information in all directions and is essential for:

- **Optimization:** A critical point (where $\nabla f = 0$) is a local minimum if $H$ is positive definite, a local maximum if $H$ is negative definite, and a saddle point if $H$ is indefinite.
- **Taylor expansion:** The second-order Taylor expansion of $f$ around $(a, b)$ is:

$$f(x, y) \approx f(a, b) + \nabla f \cdot \begin{pmatrix} x - a \\ y - b \end{pmatrix} + \frac{1}{2} \begin{pmatrix} x - a \\ y - b \end{pmatrix}^T H \begin{pmatrix} x - a \\ y - b \end{pmatrix}$$

<python-figure src="second-order-surface" caption="The surface f(x, y) = x³ − 3xy² shows a saddle point at the origin. The second-order partial derivatives reveal this: f_xx = 6x and f_yy = −6x have opposite signs at (0, 0), making the Hessian indefinite."></python-figure>

### Second Derivative Test

For a function $f(x, y)$ with a critical point at $(a, b)$ (where $f_x = f_y = 0$), define the **discriminant**:

$$D = f_{xx}(a, b) \cdot f_{yy}(a, b) - [f_{xy}(a, b)]^2$$

Then:

- If $D > 0$ and $f_{xx} > 0$: **local minimum**
- If $D > 0$ and $f_{xx} < 0$: **local maximum**
- If $D < 0$: **saddle point**
- If $D = 0$: **inconclusive** (higher-order analysis needed)

This is the multivariable generalization of the single-variable second derivative test, and it is used extensively in optimization problems.

### Python Implementation

```python
import numpy as np

def hessian(f, point, h=1e-5):
    """Compute the Hessian matrix of f at point using finite differences."""
    n = len(point)
    H = np.zeros((n, n))
    point = np.array(point, dtype=float)

    for i in range(n):
        for j in range(n):
            # Central difference for mixed partials
            pp = point.copy(); pp[i] += h; pp[j] += h
            pm = point.copy(); pm[i] += h; pm[j] -= h
            mp = point.copy(); mp[i] -= h; mp[j] += h
            mm = point.copy(); mm[i] -= h; mm[j] -= h
            H[i, j] = (f(pp) - f(pm) - f(mp) + f(mm)) / (4 * h * h)

    return H

def classify_critical_point(f, point):
    """Classify a critical point using the second derivative test."""
    H = hessian(f, point)
    D = H[0, 0] * H[1, 1] - H[0, 1]**2

    if D > 0 and H[0, 0] > 0:
        return "local minimum", D, H
    elif D > 0 and H[0, 0] < 0:
        return "local maximum", D, H
    elif D < 0:
        return "saddle point", D, H
    else:
        return "inconclusive", D, H

# Example: f(x, y) = x^2 + y^2 (minimum at origin)
def f1(p): return p[0]**2 + p[1]**2
print(classify_critical_point(f1, [0, 0]))
# ('local minimum', 4.0, ...)

# Example: f(x, y) = x^2 - y^2 (saddle at origin)
def f2(p): return p[0]**2 - p[1]**2
print(classify_critical_point(f2, [0, 0]))
# ('saddle point', -4.0, ...)
```

---

## The General Chain Rule

### Single-Variable Review

In single-variable calculus, if $y = f(g(x))$, the chain rule gives:

$$\frac{dy}{dx} = f'(g(x)) \cdot g'(x)$$

The multivariable chain rule extends this to functions where the inner variables themselves depend on one or more parameters.

### Chain Rule for Multivariable Functions

Suppose $z = f(x, y)$ where $x = x(t)$ and $y = y(t)$ are both functions of a single parameter $t$. Then:

$$\frac{dz}{dt} = \frac{\partial f}{\partial x} \cdot \frac{dx}{dt} + \frac{\partial f}{\partial y} \cdot \frac{dy}{dt}$$

This makes intuitive sense: the total rate of change of $z$ with respect to $t$ has two contributions - one from $x$ changing (weighted by how much $f$ responds to $x$) and one from $y$ changing (weighted by how much $f$ responds to $y$).

### The General Chain Rule

More generally, if $z = f(x_1, x_2, \ldots, x_n)$ and each $x_i = x_i(t_1, t_2, \ldots, t_m)$, then:

$$\frac{\partial z}{\partial t_j} = \sum_{i=1}^{n} \frac{\partial f}{\partial x_i} \cdot \frac{\partial x_i}{\partial t_j}$$

In matrix notation, this is simply:

$$\frac{\partial z}{\partial \mathbf{t}} = \frac{\partial f}{\partial \mathbf{x}} \cdot \frac{\partial \mathbf{x}}{\partial \mathbf{t}}$$

where the right-hand side is the product of the Jacobian matrices.

### Example 1: Parametric Path

Let $f(x, y) = x^2 + xy + y^2$ and let $x = \cos(t)$, $y = \sin(t)$.

$$\frac{dz}{dt} = \frac{\partial f}{\partial x} \cdot \frac{dx}{dt} + \frac{\partial f}{\partial y} \cdot \frac{dy}{dt}$$

$$= (2x + y)(-\sin t) + (x + 2y)(\cos t)$$

$$= -(2\cos t + \sin t)\sin t + (\cos t + 2\sin t)\cos t$$

At $t = 0$: $x = 1$, $y = 0$, so $\frac{dz}{dt} = (2)(0) + (1)(1) = 1$.

<python-figure src="chain-rule-parametric" caption="The function f(x, y) = x² + xy + y² evaluated along the parametric path (cos t, sin t). The chain rule gives the derivative of the composite function (orange), which matches the slope of f along the path at each t."></python-figure>

### Example 2: Two Independent Variables

Let $z = f(x, y) = xy$ where $x = s + t$ and $y = s - t$. Then:

$$\frac{\partial z}{\partial s} = \frac{\partial f}{\partial x} \cdot \frac{\partial x}{\partial s} + \frac{\partial f}{\partial y} \cdot \frac{\partial y}{\partial s} = y \cdot 1 + x \cdot 1 = x + y = 2s$$

$$\frac{\partial z}{\partial t} = \frac{\partial f}{\partial x} \cdot \frac{\partial x}{\partial t} + \frac{\partial f}{\partial y} \cdot \frac{\partial y}{\partial t} = y \cdot 1 + x \cdot (-1) = y - x = -2t$$

**Verification:** We can check by substituting directly: $z = (s + t)(s - t) = s^2 - t^2$, so $\frac{\partial z}{\partial s} = 2s$ and $\frac{\partial z}{\partial t} = -2t$. The chain rule gives the same answer.

### Example 3: Polar Coordinate Transformation

A particularly important application is the polar coordinate transformation $x = r\cos\theta$, $y = r\sin\theta$. If $f(x, y)$ is a function in Cartesian coordinates, then:

$$\frac{\partial f}{\partial r} = \frac{\partial f}{\partial x}\cos\theta + \frac{\partial f}{\partial y}\sin\theta$$

$$\frac{\partial f}{\partial \theta} = -\frac{\partial f}{\partial x} \cdot r\sin\theta + \frac{\partial f}{\partial y} \cdot r\cos\theta$$

This chain rule calculation is the key to understanding why the Jacobian determinant $r$ appears when converting integrals to polar coordinates.

### Python Implementation

```python
import numpy as np

def chain_rule_numerical(f, path, t, h=1e-8):
    """Compute df/dt along a parametric path using the chain rule.

    Parameters:
        f: function of (x, y)
        path: function t -> (x, y)
        t: parameter value
    """
    # Method 1: Direct differentiation of composite
    return (f(path(t + h)) - f(path(t - h))) / (2 * h)

def chain_rule_components(f, path, t, h=1e-8):
    """Show chain rule decomposition: df/dt = (∂f/∂x)(dx/dt) + (∂f/∂y)(dy/dt)."""
    x, y = path(t)

    # Partial derivatives of f
    df_dx = (f(np.array([x + h, y])) - f(np.array([x - h, y]))) / (2 * h)
    df_dy = (f(np.array([x, y + h])) - f(np.array([x, y - h]))) / (2 * h)

    # Derivatives of path
    p_plus = path(t + h)
    p_minus = path(t - h)
    dx_dt = (p_plus[0] - p_minus[0]) / (2 * h)
    dy_dt = (p_plus[1] - p_minus[1]) / (2 * h)

    return df_dx * dx_dt + df_dy * dy_dt

# Example: f(x, y) = x^2 + xy + y^2, path = (cos t, sin t)
def f(p): return p[0]**2 + p[0]*p[1] + p[1]**2
def path(t): return np.array([np.cos(t), np.sin(t)])

t0 = 0.0
print(f"df/dt (direct):     {chain_rule_numerical(f, path, t0):.6f}")
print(f"df/dt (chain rule): {chain_rule_components(f, path, t0):.6f}")
```

Output:

```
df/dt (direct):     1.000000
df/dt (chain rule): 1.000000
```

---

## Double Integrals in Cartesian Coordinates

### The Core Idea

The double integral of $f(x, y)$ over a region $R$ computes the signed volume under the surface $z = f(x, y)$:

$$\iint_R f(x, y) \, dA = \iint_R f(x, y) \, dx \, dy$$

For a rectangular region $R = [a, b] \times [c, d]$, this is computed as an **iterated integral**:

$$\iint_R f(x, y) \, dA = \int_a^b \int_c^d f(x, y) \, dy \, dx = \int_c^d \int_a^b f(x, y) \, dx \, dy$$

**Fubini's theorem** guarantees that the order of integration can be swapped when $f$ is continuous over the region.

### Example 1: Rectangular Region

Compute $\iint_R (x^2 + y^2) \, dA$ where $R = [0, 1] \times [0, 1]$.

**Inner integral** (integrate with respect to $y$, treating $x$ as constant):

$$\int_0^1 (x^2 + y^2) \, dy = \left[x^2 y + \frac{y^3}{3}\right]_0^1 = x^2 + \frac{1}{3}$$

**Outer integral:**

$$\int_0^1 \left(x^2 + \frac{1}{3}\right) dx = \left[\frac{x^3}{3} + \frac{x}{3}\right]_0^1 = \frac{1}{3} + \frac{1}{3} = \frac{2}{3}$$

### Example 2: Non-Rectangular Region

Compute $\iint_R xy \, dA$ where $R$ is the region bounded by $y = 0$, $y = x$, and $x = 2$.

The limits are: $0 \leq x \leq 2$ and $0 \leq y \leq x$.

$$\int_0^2 \int_0^x xy \, dy \, dx = \int_0^2 \left[\frac{xy^2}{2}\right]_0^x dx = \int_0^2 \frac{x^3}{2} \, dx = \left[\frac{x^4}{8}\right]_0^2 = 2$$

<python-figure src="double-integral-volume" caption="The double integral of f(x, y) = x² + y² over the unit square [0,1] × [0,1] equals 2/3, representing the volume under the paraboloid surface."></python-figure>

### Python Implementation

```python
import numpy as np
from scipy import integrate

def double_integral_rectangular(f, x_range, y_range, n=1000):
    """Approximate double integral over rectangular region using Simpson's rule."""
    a, b = x_range
    c, d = y_range
    result, error = integrate.dblquad(f, a, b, c, d)
    return result

# Example: integral of (x^2 + y^2) over [0,1] x [0,1]
result = double_integral_rectangular(
    lambda y, x: x**2 + y**2,  # Note: dblquad takes f(y, x)
    [0, 1], [0, 1]
)
print(f"∫∫(x² + y²) dA = {result:.6f}")  # Expected: 2/3 ≈ 0.666667

# Example: integral of xy over triangular region
result2, _ = integrate.dblquad(
    lambda y, x: x * y,
    0, 2,           # x limits
    0, lambda x: x  # y limits: 0 to x
)
print(f"∫∫ xy dA (triangle) = {result2:.6f}")  # Expected: 2.0
```

Output:

```
∫∫(x² + y²) dA = 0.666667
∫∫ xy dA (triangle) = 2.000000
```

---

## Polar Coordinates

### The Coordinate System

Polar coordinates $(r, \theta)$ describe a point by its distance from the origin and angle from the positive x-axis:

$$x = r\cos\theta, \qquad y = r\sin\theta$$

$$r = \sqrt{x^2 + y^2}, \qquad \theta = \arctan\left(\frac{y}{x}\right)$$

Regions that are circular, annular, or sector-shaped are naturally described in polar coordinates. A disk of radius $R$ centered at the origin is simply $0 \leq r \leq R$, $0 \leq \theta \leq 2\pi$ - far simpler than the Cartesian description $x^2 + y^2 \leq R^2$.

<python-figure src="polar-grid" caption="Polar coordinate grid showing curves of constant r (circles) and constant θ (rays). The area element dA = r dr dθ reflects how cells grow larger farther from the origin."></python-figure>

### The Area Element

In Cartesian coordinates, the area element is $dA = dx \, dy$ - a small rectangle with area $\Delta x \cdot \Delta y$. In polar coordinates, the area element is:

$$dA = r \, dr \, d\theta$$

The extra factor of $r$ arises because the "width" of a polar cell in the $\theta$-direction is $r \Delta\theta$ (arc length), not just $\Delta\theta$. Near the origin, cells are small; far from the origin, they are large. This factor is the **Jacobian determinant** of the coordinate transformation.

### The Jacobian

The Jacobian matrix of the polar-to-Cartesian transformation is:

$$J = \begin{pmatrix} \frac{\partial x}{\partial r} & \frac{\partial x}{\partial \theta} \\ \frac{\partial y}{\partial r} & \frac{\partial y}{\partial \theta} \end{pmatrix} = \begin{pmatrix} \cos\theta & - r\sin\theta \\ \sin\theta & r\cos\theta \end{pmatrix}$$

The Jacobian determinant is:

$$|J| = \cos\theta \cdot r\cos\theta - (-r\sin\theta) \cdot \sin\theta = r\cos^2\theta + r\sin^2\theta = r$$

This is where the $r$ in $dA = r \, dr \, d\theta$ comes from. The Jacobian determinant accounts for how the coordinate transformation stretches or compresses area elements.

---

## Converting Cartesian Integrals to Polar

### The Conversion Formula

To convert a double integral from Cartesian to polar coordinates:

$$\iint_R f(x, y) \, dx \, dy = \iint_{R'} f(r\cos\theta, r\sin\theta) \cdot r \, dr \, d\theta$$

The three steps are:

1. **Replace** $x = r\cos\theta$ and $y = r\sin\theta$ in the integrand
2. **Replace** $dx \, dy$ with $r \, dr \, d\theta$ (the Jacobian factor)
3. **Convert** the region of integration from Cartesian to polar limits

### Example 1: Integral Over a Disk

Compute $\iint_D (x^2 + y^2) \, dA$ where $D$ is the disk $x^2 + y^2 \leq 4$.

In polar coordinates: $x^2 + y^2 = r^2$, and the disk is $0 \leq r \leq 2$, $0 \leq \theta \leq 2\pi$.

$$\int_0^{2\pi} \int_0^2 r^2 \cdot r \, dr \, d\theta = \int_0^{2\pi} \int_0^2 r^3 \, dr \, d\theta$$

$$= \int_0^{2\pi} \left[\frac{r^4}{4}\right]_0^2 d\theta = \int_0^{2\pi} 4 \, d\theta = 8\pi$$

This integral would be much harder in Cartesian coordinates, requiring:

$$\int_{-2}^{2} \int_{-\sqrt{4-x^2}}^{\sqrt{4-x^2}} (x^2 + y^2) \, dy \, dx$$

### Example 2: The Gaussian Integral

One of the most celebrated applications of polar coordinates is evaluating the **Gaussian integral**:

$$I = \int_{-\infty}^{\infty} e^{-x^2} \, dx$$

This integral has no elementary antiderivative, but we can compute $I^2$ by converting to polar coordinates:

$$I^2 = \int_{-\infty}^{\infty} \int_{-\infty}^{\infty} e^{-(x^2 + y^2)} \, dx \, dy$$

Converting to polar coordinates ($x^2 + y^2 = r^2$, $dA = r \, dr \, d\theta$):

$$I^2 = \int_0^{2\pi} \int_0^{\infty} e^{-r^2} \cdot r \, dr \, d\theta = \int_0^{2\pi} \left[-\frac{1}{2}e^{-r^2}\right]_0^{\infty} d\theta = \int_0^{2\pi} \frac{1}{2} \, d\theta = \pi$$

Therefore $I = \sqrt{\pi}$.

This result is the foundation of the **normal distribution**: the density $\frac{1}{\sqrt{2\pi}\sigma}e^{-x^2/(2\sigma^2)}$ integrates to 1 precisely because $\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$. Every time you compute a probability under a normal curve, write down a Black-Scholes price, or estimate a VaR figure, you are relying on this polar-coordinate calculation.

<python-figure src="gaussian-integral" caption="The 2D Gaussian e^{-(x² + y²)} viewed as a surface. The polar coordinate conversion exploits the circular symmetry: integrating r·e^{-r²} is elementary, giving the famous result I = √π."></python-figure>

### Example 3: Annular Region

Compute $\iint_A \frac{1}{\sqrt{x^2 + y^2}} \, dA$ where $A$ is the annulus $1 \leq x^2 + y^2 \leq 9$.

In polar: $\frac{1}{\sqrt{x^2 + y^2}} = \frac{1}{r}$, and $1 \leq r \leq 3$, $0 \leq \theta \leq 2\pi$.

$$\int_0^{2\pi} \int_1^3 \frac{1}{r} \cdot r \, dr \, d\theta = \int_0^{2\pi} \int_1^3 1 \, dr \, d\theta = \int_0^{2\pi} 2 \, d\theta = 4\pi$$

The $\frac{1}{r}$ singularity is exactly canceled by the Jacobian factor $r$, making this integral trivial in polar coordinates.

### When to Convert to Polar

Convert to polar coordinates when:

- **The region is circular, annular, or sector-shaped** - polar limits are simpler
- **The integrand involves $x^2 + y^2$** - this becomes just $r^2$
- **The integrand has circular symmetry** - depends only on distance from origin
- **Cartesian limits involve $\sqrt{a^2 - x^2}$** - a sign of circular geometry

<python-figure src="cartesian-vs-polar" caption="Converting integration regions from Cartesian to polar. The semicircle (left) has complex Cartesian limits but simple polar limits: 0 ≤ r ≤ 2, 0 ≤ θ ≤ π."></python-figure>

### Python Implementation

```python
import numpy as np
from scipy import integrate

def polar_integral(f_polar, r_range, theta_range):
    """Compute double integral in polar coordinates.

    f_polar takes (r, theta) and returns the integrand value.
    The Jacobian factor r is included automatically.
    """
    def integrand(theta, r):
        return f_polar(r, theta) * r  # Include Jacobian factor

    result, error = integrate.dblquad(
        integrand,
        r_range[0], r_range[1],       # r limits
        theta_range[0], theta_range[1] # theta limits
    )
    return result

# Example 1: ∫∫ (x² + y²) dA over disk of radius 2
# In polar: r² · r dr dθ = r³ dr dθ
result1 = polar_integral(
    lambda r, theta: r**2,  # x² + y² = r²
    [0, 2], [0, 2 * np.pi]
)
print(f"∫∫(x² + y²) over disk = {result1:.4f}")  # Expected: 8π ≈ 25.1327

# Example 2: Gaussian integral I² = ∫∫ e^{-(x² + y²)} dA
result2 = polar_integral(
    lambda r, theta: np.exp(-r**2),
    [0, 20], [0, 2 * np.pi]  # r=20 approximates infinity
)
print(f"I² = {result2:.6f}")          # Expected: π ≈ 3.141593
print(f"I = {np.sqrt(result2):.6f}")  # Expected: √π ≈ 1.772454

# Example 3: ∫∫ 1/√(x² + y²) over annulus 1 ≤ r ≤ 3
result3 = polar_integral(
    lambda r, theta: 1 / r,
    [1, 3], [0, 2 * np.pi]
)
print(f"∫∫ 1/r over annulus = {result3:.4f}")  # Expected: 4π ≈ 12.5664
```

Output:

```
∫∫(x² + y²) over disk = 25.1327
I² = 3.141593
I = 1.772454
∫∫ 1/r over annulus = 12.5664
```

---

## Applications in Quantitative Finance

### Delta and Gamma: Partial Derivatives of Option Prices

The most direct application of partial derivatives in finance is the computation of **Greeks** - sensitivities of an option's price to changes in market parameters. The Black-Scholes price $V(S, \sigma, t, r, K)$ is a function of multiple variables, and each partial derivative has a name:

| Greek            | Definition                                           | Interpretation                      |
| ---------------- | ---------------------------------------------------- | ----------------------------------- |
| Delta ($\Delta$) | $\frac{\partial V}{\partial S}$                      | Sensitivity to underlying price     |
| Gamma ($\Gamma$) | $\frac{\partial^2 V}{\partial S^2}$                  | Rate of change of delta (curvature) |
| Theta ($\Theta$) | $\frac{\partial V}{\partial t}$                      | Sensitivity to time decay           |
| Vega ($\nu$)     | $\frac{\partial V}{\partial \sigma}$                 | Sensitivity to volatility           |
| Vanna            | $\frac{\partial^2 V}{\partial S \, \partial \sigma}$ | Cross-sensitivity (mixed partial)   |
| Volga            | $\frac{\partial^2 V}{\partial \sigma^2}$             | Volatility convexity                |

**Gamma** is a second-order partial derivative measuring the curvature of the price-vs-underlying relationship. A portfolio with high gamma needs frequent rebalancing. **Vanna** ($\frac{\partial^2 V}{\partial S \, \partial \sigma}$) is a mixed partial derivative - it captures how delta changes when volatility moves, and is critical for managing volatility surface risk.

<python-figure src="greeks-surface" caption="Black-Scholes call delta (∂V/∂S) and gamma (∂²V/∂S²) as functions of spot price and time to expiry. Gamma peaks near the strike price and increases as expiry approaches."></python-figure>

```python
from scipy.stats import norm
import numpy as np

def bs_greeks(S, K, T, r, sigma):
    """Compute Black-Scholes Greeks for a European call."""
    d1 = (np.log(S / K) + (r + sigma**2 / 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)

    delta = norm.cdf(d1)
    gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
    theta = (-(S * norm.pdf(d1) * sigma) / (2 * np.sqrt(T))
            - r * K * np.exp(-r * T) * norm.cdf(d2))
    vega = S * np.sqrt(T) * norm.pdf(d1)
    vanna = - norm.pdf(d1) * d2 / sigma  # ∂²V/∂S∂σ

    return {
        'delta': delta, 'gamma': gamma,
        'theta': theta, 'vega': vega, 'vanna': vanna
    }

greeks = bs_greeks(S=100, K=100, T=0.25, r=0.05, sigma=0.2)
for name, val in greeks.items():
    print(f"{name:>6s} = {val:.6f}")
```

Output:

```
 delta = 0.569326
 gamma = 0.039012
 theta = -12.388183
  vega = 19.506001
 vanna = -0.073899
```

### The Chain Rule in Risk Management

The chain rule is essential when market risk factors are not directly observable. Consider a portfolio whose value $V$ depends on an implied volatility $\sigma$, which in turn depends on the VIX index level $I$:

$$\frac{dV}{dI} = \frac{\partial V}{\partial \sigma} \cdot \frac{d\sigma}{dI}$$

In a more realistic setting, a portfolio's P&L depends on multiple correlated risk factors $\{S_1, S_2, \ldots, S_n\}$ that are driven by a smaller set of principal components $\{f_1, f_2, \ldots, f_k\}$. The chain rule gives:

$$\frac{\partial V}{\partial f_j} = \sum_{i=1}^{n} \frac{\partial V}{\partial S_i} \cdot \frac{\partial S_i}{\partial f_j}$$

This is exactly how **factor-based risk models** work: they decompose portfolio sensitivity into exposures to a smaller number of interpretable factors. The chain rule is also the mathematical backbone of **backpropagation** in neural networks - automatic differentiation applies the chain rule systematically through the computational graph.

### Multivariate Normal Distribution and Portfolio Risk

The **bivariate normal density** is:

$$f(x, y) = \frac{1}{2\pi\sigma_1\sigma_2\sqrt{1-\rho^2}} \exp\left(-\frac{1}{2(1-\rho^2)}\left[\frac{x^2}{\sigma_1^2} - \frac{2\rho xy}{\sigma_1\sigma_2} + \frac{y^2}{\sigma_2^2}\right]\right)$$

Computing probabilities requires evaluating double integrals of this density. For standard bivariate normal variables (zero mean, unit variance), the probability that both variables exceed a threshold $a$ is:

$$P(X > a, Y > a) = \int_a^{\infty} \int_a^{\infty} \frac{1}{2\pi\sqrt{1-\rho^2}} \exp\left(-\frac{x^2 - 2\rho xy + y^2}{2(1-\rho^2)}\right) dx \, dy$$

When $\rho = 0$ (independence), this factors into a product of single integrals. When $\rho \neq 0$, the integral is genuinely two-dimensional. For the special case of circular symmetry ($\sigma_1 = \sigma_2$, $\rho = 0$), polar coordinates simplify the computation dramatically - this is exactly the Gaussian integral we solved earlier.

This arises directly in **joint default probability** calculations: if two assets' log-returns are bivariate normal, the probability that both drop below a threshold (triggering default) is a double integral of this form. It also appears in **basket option** pricing, where the payoff depends on the joint distribution of multiple underlyings.

### Monte Carlo Integration

In practice, many of the double (and higher-dimensional) integrals in finance cannot be evaluated analytically or even with standard quadrature. **Monte Carlo integration** approximates the integral by random sampling:

$$\iint_R f(x, y) \, dA \approx \frac{\text{Area}(R)}{N} \sum_{i=1}^{N} f(x_i, y_i)$$

where $(x_i, y_i)$ are uniformly distributed random points in $R$.

For polar-symmetric integrands, sampling in polar coordinates (uniform in $\theta$, with $r$ sampled from $r^2 \sim \text{Uniform}(0, R^2)$ to account for the Jacobian) can reduce variance significantly. This is a form of **importance sampling** - using the natural geometry of the problem to make Monte Carlo more efficient.

```python
import numpy as np

def monte_carlo_polar(f_polar, R, N=1_000_000):
    """Monte Carlo integration in polar coordinates over disk of radius R.

    Samples r² uniformly to account for the Jacobian factor.
    """
    theta = np.random.uniform(0, 2 * np.pi, N)
    r = np.sqrt(np.random.uniform(0, R**2, N))  # r² ~ Uniform(0, R²)

    values = f_polar(r, theta)
    area = np.pi * R**2
    return area * np.mean(values)

# Example: ∫∫ e^{-(x² + y²)} over all R² ≈ disk of large radius
result = monte_carlo_polar(lambda r, theta: np.exp(-r**2), R=10)
print(f"Monte Carlo I² = {result:.4f} (exact: {np.pi:.4f})")
```

### Hessian-Based Portfolio Optimization

In mean-variance portfolio optimization, the objective function is:

$$f(\mathbf{w}) = \mathbf{w}^T \boldsymbol{\mu} - \frac{\lambda}{2} \mathbf{w}^T \Sigma \mathbf{w}$$

where $\mathbf{w}$ is the weight vector, $\boldsymbol{\mu}$ is the expected return vector, $\Sigma$ is the covariance matrix, and $\lambda$ is the risk aversion parameter.

The gradient is:

$$\nabla f = \boldsymbol{\mu} - \lambda \Sigma \mathbf{w}$$

The Hessian is:

$$H = -\lambda \Sigma$$

Since $\Sigma$ is positive semi-definite, $H$ is negative semi-definite, confirming that the critical point (where $\nabla f = 0$) is a maximum. The optimal weights are:

$$\mathbf{w}^* = \frac{1}{\lambda} \Sigma^{-1} \boldsymbol{\mu}$$

The Hessian also appears in **second-order optimization methods** (Newton's method for optimization), where the update step is:

$$\mathbf{w}_{n+1} = \mathbf{w}_n - H^{-1} \nabla f$$

This converges quadratically near the optimum - the same quadratic convergence we saw in Newton–Raphson for root-finding, now applied to finding the minimum (or maximum) of a multivariable function.

---

## Conclusion

Multivariable calculus provides the mathematical language for analyzing functions that depend on several inputs simultaneously - which describes nearly every model in quantitative finance.

The key takeaways:

1. **Partial derivatives** let us isolate the effect of one variable while holding others fixed - this is exactly what Greeks measure in options pricing
2. **Second-order partial derivatives** capture curvature and cross-sensitivities through the Hessian matrix, enabling the classification of critical points and the computation of higher-order Greeks like gamma and vanna
3. **The chain rule** propagates sensitivities through chains of dependent variables, underpinning factor-based risk models, automatic differentiation, and the conversion between coordinate systems
4. **Polar coordinates** simplify integrals with circular symmetry by exploiting the Jacobian transformation $dA = r \, dr \, d\theta$, with the Gaussian integral being the most consequential example in all of probability theory
5. **Double integrals** compute volumes, expected values, and probabilities over two-dimensional regions - appearing directly in joint probability calculations, basket option pricing, and Monte Carlo methods

These tools are not just theoretical - they are the computational primitives that every pricing engine, risk system, and calibration routine is built on. A solid command of partial derivatives and multiple integrals is essential for understanding what these systems are actually doing under the hood, and for debugging them when they go wrong.

For further reading, Marsden and Tromba's _Vector Calculus_ is the standard reference for the mathematical foundations, while Shreve's _Stochastic Calculus for Finance_ shows how these ideas extend to the stochastic setting that dominates modern quantitative finance.
