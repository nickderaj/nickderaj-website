---
title: "What I Learned Building a Neural Network from Scratch with Karpathy's Micrograd"
date: '2026-04-13'
description: "A journey through backpropagation, computational graphs, and why billions of tiny knobs create intelligence — documenting the first lesson of Karpathy's Zero to Hero course."
tags: ['ai', 'deep-learning', 'neural-networks', 'python']
---

<table-of-contents>
<li><a href="#why-backpropagation-is-the-one-concept-to-know">Why Backpropagation is the One Concept to Know</a></li>
<li><a href="#the-value-class-and-computational-graphs">The Value Class and Computational Graphs</a></li>
<li><a href="#the-chain-rule-how-gradients-flow">The Chain Rule: How Gradients Flow</a></li>
<li><a href="#building-up-neuron-layer-mlp">Building Up: Neuron, Layer, MLP</a></li>
<li><a href="#the-training-loop">The Training Loop</a></li>
<li><a href="#from-micrograd-to-pytorch">From Micrograd to PyTorch</a></li>
<li><a href="#what-surprised-me-why-this-actually-works">What Surprised Me: Why This Actually Works</a></li>
<li><a href="#whats-next">What's Next</a></li>
</table-of-contents>

---

I was recommended Andrej Karpathy's [Zero to Hero](https://github.com/karpathy/micrograd) course by a friend who runs his own AI company. For those unfamiliar, Karpathy is a former Tesla and OpenAI researcher who left to focus on education, earning massive respect in the AI community for making deep learning accessible. This post covers what I learned from the first lesson: building micrograd, a tiny autograd engine and neural network library from scratch. If you only have time to understand one thing about how neural networks work, this is it.

---

## Why Backpropagation is the One Concept to Know

If you strip away all the hype, frameworks, and infrastructure, neural networks come down to one core algorithm: backpropagation. Its purpose is straightforward. We have a network with a bunch of weights, and we need to figure out how to adjust those weights so that the network's predictions get closer to the correct answers. Backpropagation does this by calculating the derivative of the loss function with respect to every single parameter in the network. In other words, it tells us: if I nudge this particular weight up slightly, does the overall error go up or down, and by how much?

That information is all we need to improve the network, one small step at a time.

---

## The Value Class and Computational Graphs

Before we can do backpropagation, we need a way to track how values in the network are computed. This is where the computational graph comes in, and it's arguably the most important idea in micrograd.

Every time you perform an operation (add two numbers, multiply them, apply tanh), micrograd records it. The result isn't just a number. It's a node in a directed acyclic graph (DAG) that remembers what produced it. So if `c = a + b`, the node for `c` knows it came from `a` and `b` via addition.

<div style="background-color: #1e1e2e; border: 1px solid #313244; border-radius: 12px; padding: 24px 16px 16px; margin: 28px 0; text-align: center;">
<img src="/blog/micrograd-zero/computational-graph.svg" alt="Computational graph showing nodes a, b, c, d, e connected by multiply and add operations" style="max-width: 100%; height: auto;" />
<div style="font-size: 14px; color: #a6adc8; margin-top: 14px;">A computational graph: every operation is recorded as a node, creating a DAG that backpropagation can traverse in reverse.</div>
</div>

Why does this matter? Because when it's time to compute gradients, we can walk this graph in reverse (from output back to inputs) and apply the chain rule at every step. This is automatic differentiation, and it's exactly what PyTorch's autograd engine does under the hood. Micrograd just does it with scalar values so you can see every detail.

The `.backward()` method triggers this process. It performs a reverse topological sort of the graph, then computes gradients node by node from the output all the way back to the inputs.

---

## The Chain Rule: How Gradients Flow

The chain rule is the mathematical engine that makes backpropagation possible. The intuition is this: if you have a chain of operations, the derivative of the final output with respect to an early input is just the product of all the local derivatives along the path.

Say you have `a → b → c → loss`. The gradient of loss with respect to `a` is:

```
d(loss)/d(a) = d(loss)/d(c) × d(c)/d(b) × d(b)/d(a)
```

<div style="background-color: #1e1e2e; border: 1px solid #313244; border-radius: 12px; padding: 24px 16px 16px; margin: 28px 0; text-align: center;">
<img src="/blog/micrograd-zero/chain-rule.svg" alt="Forward pass computing values left to right, backward pass multiplying local derivatives right to left" style="max-width: 100%; height: auto;" />
<div style="font-size: 14px; color: #a6adc8; margin-top: 14px;">Forward pass computes values left to right. Backward pass multiplies local derivatives right to left using the chain rule.</div>
</div>

Each node only needs to know its own local derivative. Multiply them all together along the path, and you get the full gradient. This is what allows backpropagation to scale through deep networks with many layers. Each layer doesn't need to understand the whole network, it just needs to pass gradients backward through its own local operations.

---

## Building Up: Neuron, Layer, MLP

Karpathy builds the neural network from the bottom up, which made the architecture click for me in a way that reading about it never did.

### The Neuron

A single neuron is the simplest building block. It takes a vector of inputs, multiplies each by a corresponding weight, adds a bias term, and passes the result through an activation function:

```
out = tanh(Σ(w_i × x_i) + b)
```

<div style="background-color: #1e1e2e; border: 1px solid #313244; border-radius: 12px; padding: 24px 16px 16px; margin: 28px 0; text-align: center;">
<img src="/blog/micrograd-zero/neuron.svg" alt="A single neuron: inputs multiplied by weights, summed with bias, passed through tanh activation" style="max-width: 100%; height: auto;" />
<div style="font-size: 14px; color: #a6adc8; margin-top: 14px;">A single neuron: inputs are multiplied by weights, summed with a bias, then passed through an activation function.</div>
</div>

The activation function (tanh in this case) is something I'd always seen in lecture slides without fully understanding why it was there. The answer is non-linearity. Without it, stacking layers of neurons would just produce another linear function, no matter how deep the network. The activation function is what gives the network the ability to model curves, boundaries, and complex patterns rather than just straight lines.

### The Layer

A layer is simply a collection of neurons. It takes the same input vector and feeds it to every neuron in the layer. Each neuron processes the input independently with its own weights and bias, and the layer returns a list of all their outputs. You define a layer by specifying how many neurons it contains.

### The MLP (Multi-Layer Perceptron)

The MLP stacks layers together. It takes a list of sizes (for example, `[3, 4, 4, 1]` for 3 inputs, two hidden layers of 4 neurons each, and 1 output). Each layer's output becomes the next layer's input. A forward pass sends data through this entire sequence, layer by layer, until a final output is produced.

<div style="background-color: #1e1e2e; border: 1px solid #313244; border-radius: 12px; padding: 24px 16px 16px; margin: 28px 0; text-align: center;">
<img src="/blog/micrograd-zero/mlp.svg" alt="MLP with architecture [3, 4, 4, 1]: 3 inputs, two hidden layers of 4, and 1 output" style="max-width: 100%; height: auto;" />
<div style="font-size: 14px; color: #a6adc8; margin-top: 14px;">An MLP with architecture [3, 4, 4, 1]: 3 inputs, two hidden layers of 4 neurons, and 1 output. Every neuron connects to all neurons in the next layer.</div>
</div>

---

## The Training Loop

Training is where all the pieces come together. It follows three steps, repeated over and over.

### 1. Forward Pass

Feed input data through the network to produce predictions. At this stage the network is just guessing, especially early in training.

### 2. Compute Loss

Compare the predictions to the target values using a loss function. In micrograd, we use the sum of squared errors: for each output, take the difference between prediction and target, square it (so it's always positive regardless of direction), and sum them all up. This single number tells us how wrong the network is overall.

### 3. Backward Pass and Gradient Descent

Run `.backward()` on the loss to compute gradients for every parameter in the network. Then update each parameter using gradient descent:

```python
p.data -= learning_rate * p.grad
```

<div style="background-color: #1e1e2e; border: 1px solid #313244; border-radius: 12px; padding: 24px 16px 16px; margin: 28px 0; text-align: center;">
<img src="/blog/micrograd-zero/gradient-descent.svg" alt="Gradient descent on a loss surface contour plot showing good and bad learning rates" style="max-width: 100%; height: auto;" />
<div style="font-size: 14px; color: #a6adc8; margin-top: 14px;">Gradient descent with different learning rates. A good rate converges smoothly; too large and it overshoots, bouncing across the loss surface.</div>
</div>

This nudges every weight in the direction that reduces the loss. The learning rate controls how big each step is. Too large and you overshoot, bouncing around without converging. Too small and training takes forever.

<callout variant="note" title="Zeroing Gradients">
One critical detail: gradients must be zeroed out before each training step. Micrograd (and PyTorch) accumulates gradients by default, so if you forget to reset them, gradients from previous steps pile up and your updates become meaningless.
</callout>

Repeat this loop enough times and the network's predictions get progressively closer to the target values. The loss shrinks. The weights settle into a configuration that works.

---

## From Micrograd to PyTorch

Micrograd operates on scalar values. Every weight is a single number, every operation happens one value at a time. This is great for learning but far too slow for real work.

PyTorch does the exact same thing conceptually, but operates on tensors: n-dimensional arrays of numbers. Instead of computing one multiplication at a time, tensor operations process thousands or millions of values in parallel. This is why GPUs have become so central to AI. They were originally designed for graphics (which is also massively parallel matrix math), and it turns out training neural networks is the same kind of workload. The concepts you learn in micrograd (computational graphs, autograd, backpropagation, gradient descent) transfer directly. The difference is just scale.

---

## What Surprised Me: Why This Actually Works

After building micrograd, the thing that struck me is how simple the individual pieces are. A neuron is just multiply, add, squish. That's it. But stack enough of these together across layers, and something unexpected happens. The network starts capturing patterns far too complex for any human to hand-code.

What makes this possible comes down to two things. First, activation functions introduce non-linearity, meaning the network isn't just drawing straight lines through data. It can bend, curve, and carve out complex decision boundaries. Second, the sheer number of parameters. Even micrograd's tiny MLP has dozens of weights. Production models like Claude or GPT have billions. Each weight is a tiny knob, and during training, backpropagation turns all of them simultaneously, nudging the network toward better predictions one gradient step at a time.

And this is exactly where the "black box" problem comes from. When researchers say they don't fully understand what's happening inside their models, they're talking about these weights. Nobody sat down and assigned them. They emerged from the training process. After millions of gradient updates across billions of parameters, the final weight values encode something that works, but no human designed that configuration or can easily read it back. You can inspect any individual weight, but understanding what the collective arrangement _means_ is like trying to understand a brain by measuring one synapse at a time.

This is why AI safety and interpretability research has become so important. If we can't explain why a model produces a given output, how do we trust it in high-stakes decisions like medical diagnosis or criminal justice? Organizations like Anthropic are actively working on mechanistic interpretability, trying to reverse-engineer what specific neurons and circuits inside models actually represent. On the regulatory side, frameworks like the EU AI Act are pushing for transparency requirements, mandating that high-risk AI systems be explainable and auditable. The challenge is that regulation needs to keep pace with models that are growing more capable faster than we can understand them.

Building micrograd made this click for me. With 20 parameters, you can trace exactly what's happening. With 200 billion, you fundamentally can't. That's the tension at the heart of AI development today.

---

## What's Next

This was just the first lesson in Karpathy's Zero to Hero series. Next up is building makemore, where we move from a toy autograd engine to actually generating language. I'll be documenting that journey too.

If you're interested in understanding how neural networks really work under the hood, I can't recommend this course enough. Start with micrograd. Build it yourself. The moment you see gradients flowing backward through a graph you built from scratch, something clicks that no amount of reading can replicate.

---

_Thanks for reading. This is part of a series documenting my journey through Karpathy's Neural Networks: Zero to Hero. Follow along for the next post on makemore and language generation._
