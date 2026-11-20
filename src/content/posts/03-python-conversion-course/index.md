---
title: 'Python Crash Course: From JavaScript to Python'
date: '2026-01-27'
description: 'A crash course from JavaScript to Python, to get quickly up to speed.'
tags: ['python', 'javascript', 'coding']
---

<table-of-contents>
<li><a href="#variables--basic-types">Variables & Basic Types</a></li>
<li><a href="#operators">Operators</a></li>
<li><a href="#control-flow">Control Flow</a></li>
<li><a href="#functions">Functions</a></li>
<li><a href="#data-structures">Data Structures</a></li>
<li><a href="#object-oriented-programming">Object-Oriented Programming</a></li>
<li><a href="#advanced-algorithms">Advanced Algorithms</a></li>
<li><a href="#common-patterns-for-leetcode">Common Patterns for LeetCode</a></li>
<li><a href="#performance--complexity">Performance & Complexity</a></li>
</table-of-contents>

---

## Variables & Basic Types

### Variable Declaration

In Python, there's no `const`, `let`, or `var`. Variables are created by assignment.

```javascript
// JavaScript
const name = 'Alice';
let age = 25;
var score = 100;
```

```python
# Python
name = "Alice"
age = 25
score = 100
```

Python is **dynamically typed** but **strongly typed**. You don't declare types, but types matter at runtime.

### Basic Data Types

| JavaScript  | Python          | Example                             |
| ----------- | --------------- | ----------------------------------- |
| `number`    | `int`, `float`  | `42`, `3.14`                        |
| `string`    | `str`           | `"hello"`                           |
| `boolean`   | `bool`          | `True`, `False`                     |
| `null`      | `None`          | `None`                              |
| `undefined` | (doesn't exist) | (use `None`)                        |
| `BigInt`    | `int`           | Python ints are arbitrary precision |

```javascript
// JavaScript
let num = 42;
let float = 3.14;
let str = 'hello';
let bool = true;
let nothing = null;
```

```python
# Python
num = 42
float_num = 3.14
str_val = "hello"
bool_val = True
nothing = None
```

### Type Checking

```javascript
// JavaScript
typeof 42 === 'number';
typeof 'hello' === 'string';
```

```python
# Python
type(42) == int
type("hello") == str
isinstance(42, int)  # Better practice
```

---

## Operators

### Arithmetic Operators

```javascript
// JavaScript
10 + 3; // 13
10 - 3; // 7
10 * 3; // 30
10 / 3; // 3.3333...
10 % 3; // 1 (remainder)
2 ** 3; // 8 (exponentiation)
10; // 3  // 3 (floor division - not in JS!)
```

```python
# Python
10 + 3   # 13
10 - 3   # 7
10 * 3   # 30
10 / 3   # 3.3333... (always float)
10 % 3   # 1 (remainder)
2 ** 3   # 8 (exponentiation)
10 // 3  # 3 (floor division)
```

<callout variant="important">In Python, `/` always returns a float. Use `//` for integer division.</callout>

### Comparison Operators

```javascript
// JavaScript
10 == 10; // true
10 === 10; // true
10 != 5; // true
10 < 5; // false
```

```python
# Python
10 == 10    # True
10 != 5     # True
10 < 5      # False
10 <= 10    # True
```

<callout variant="note">Python doesn't have `===`. Use `is` for identity comparison (rarely needed in LeetCode).</callout>

### Logical Operators

```javascript
// JavaScript
true && false; // false
true || false; // true
!true; // false
```

```python
# Python
True and False  # False
True or False   # True
not True        # False
```

---

## Control Flow

### If/Else Statements

```javascript
// JavaScript
if (age >= 18) {
  console.log('Adult');
} else if (age >= 13) {
  console.log('Teen');
} else {
  console.log('Child');
}
```

```python
# Python
if age >= 18:
    print("Adult")
elif age >= 13:
    print("Teen")
else:
    print("Child")
```

<callout variant="important">Python uses **indentation** instead of braces. Indentation is mandatory and part of the syntax.</callout>

### Ternary Operator

```javascript
// JavaScript
const status = age >= 18 ? 'Adult' : 'Minor';
```

```python
# Python
status = "Adult" if age >= 18 else "Minor"
```

### For Loops

```javascript
// JavaScript - C-style loop
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// JavaScript - for...of (iterate values)
for (const num of [1, 2, 3]) {
  console.log(num);
}

// JavaScript - for...in (iterate keys/indices)
for (const i in [1, 2, 3]) {
  console.log(i); // 0, 1, 2
}
```

```python
# Python - no C-style loops
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# Python - iterate over values (like for...of)
for num in [1, 2, 3]:
    print(num)

# Python - iterate with index
for i, num in enumerate([1, 2, 3]):
    print(i, num)  # 0 1, 1 2, 2 3
```

`range(n)` generates numbers from 0 to n-1. `range(start, end, step)` is also supported.

### While Loops

```javascript
// JavaScript
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}
```

```python
# Python
i = 0
while i < 5:
    print(i)
    i += 1
```

### Break and Continue

```javascript
// JavaScript
for (let i = 0; i < 10; i++) {
  if (i === 5) break; // Exit loop
  if (i === 2) continue; // Skip iteration
  console.log(i);
}
```

```python
# Python
for i in range(10):
    if i == 5:
        break           # Exit loop
    if i == 2:
        continue        # Skip iteration
    print(i)
```

---

## Functions

### Basic Function Definition

```javascript
// JavaScript
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// Call
add(3, 5); // 8
```

```python
# Python
def add(a, b):
    return a + b

# Call
add(3, 5)  # 8
```

<callout variant="note">No arrow functions in Python. Use `def` for all functions.</callout>

### Default Parameters

```javascript
// JavaScript
function greet(name = 'World') {
  console.log(`Hello, ${name}`);
}

greet(); // Hello, World
greet('Alice'); // Hello, Alice
```

```python
# Python
def greet(name="World"):
    print(f"Hello, {name}")

greet()           # Hello, World
greet("Alice")    # Hello, Alice
```

### Variadic Arguments (Variable Number of Args)

```javascript
// JavaScript - rest parameters
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4); // 10
```

```python
# Python - *args
def sum_numbers(*numbers):
    return sum(numbers)

sum_numbers(1, 2, 3, 4)  # 10

# Also supports **kwargs for keyword arguments
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25)
```

### Lambda Functions

```javascript
// JavaScript - arrow functions as lambdas
const square = (x) => x * x;
[1, 2, 3].map((x) => x * x); // [1, 4, 9]
```

```python
# Python - lambda keyword
square = lambda x: x * x
list(map(lambda x: x * x, [1, 2, 3]))  # [1, 4, 9]
```

<callout variant="tip">Python lambdas are limited to single expressions. For complex logic, use `def`.</callout>

---

## Data Structures

### Lists (Arrays)

```javascript
// JavaScript
const arr = [1, 2, 3, 4, 5];
arr[0]; // 1
arr.length; // 5
arr.push(6); // [1, 2, 3, 4, 5, 6]
arr.pop(); // 5, arr is [1, 2, 3, 4, 5]
arr.shift(); // 1, arr is [2, 3, 4, 5]
arr.unshift(0); // [0, 2, 3, 4, 5]
arr.slice(1, 3); // [2, 3] (doesn't mutate)
arr.splice(1, 2); // removes elements (mutates)
```

```python
# Python
lst = [1, 2, 3, 4, 5]
lst[0]           # 1
len(lst)         # 5
lst.append(6)    # [1, 2, 3, 4, 5, 6]
lst.pop()        # 5, lst is [1, 2, 3, 4, 5]
lst.pop(0)       # 1, lst is [2, 3, 4, 5] (removes first)
lst.insert(0, 0) # [0, 2, 3, 4, 5] (insert at index)
lst[1:3]         # [2, 3] (slicing, doesn't mutate)
lst.remove(2)    # removes first occurrence of 2
```

**List Slicing** is powerful in Python:

```python
lst = [1, 2, 3, 4, 5]
lst[1:4]       # [2, 3, 4]
lst[:3]        # [1, 2, 3]
lst[2:]        # [3, 4, 5]
lst[-1]        # 5 (last element)
lst[-2:]       # [4, 5]
lst[::2]       # [1, 3, 5] (every 2nd element)
lst[::-1]      # [5, 4, 3, 2, 1] (reverse)
```

### Tuples (Immutable Lists)

```python
# Python - tuples are immutable
tup = (1, 2, 3)
tup[0]         # 1
tup[0] = 5     # TypeError - can't modify
len(tup)       # 3

# Unpacking
a, b, c = (1, 2, 3)
print(a, b, c)  # 1 2 3
```

<callout variant="note">No direct JavaScript equivalent. Think of tuples as frozen arrays that can be used as dictionary keys.</callout>

### Strings

```javascript
// JavaScript
const str = 'hello';
str[0]; // "h"
str.length; // 5
str.toUpperCase(); // "HELLO"
str.toLowerCase(); // "hello"
str.split(''); // ["h", "e", "l", "l", "o"]
str.includes('ell'); // true
str.indexOf('l'); // 2
str.substring(1, 4); // "ell"
```

```python
# Python
s = "hello"
s[0]              # "h"
len(s)            # 5
s.upper()         # "HELLO"
s.lower()         # "hello"
list(s)           # ["h", "e", "l", "l", "o"]
"ell" in s        # True
s.find("l")       # 2 (-1 if not found)
s[1:4]            # "ell" (slicing works on strings too)
s.split(",")      # Split by delimiter
s.join(["a", "b"]) # "aXb" if s = "X"
```

<callout variant="note">**Strings are immutable** in Python. You can't do `s[0] = 'x'`.</callout>

### Dictionaries (Objects/Maps)

```javascript
// JavaScript - objects are key-value stores
const obj = { name: 'Alice', age: 25 };
obj.name; // "Alice"
obj['age']; // 25
obj.city = 'NYC'; // Add property
delete obj.age; // Delete property
Object.keys(obj); // ["name", "city"]
Object.values(obj); // ["Alice", "NYC"]
'name' in obj; // true
```

```python
# Python - dictionaries
d = {"name": "Alice", "age": 25}
d["name"]           # "Alice"
d["age"]            # 25
d["city"] = "NYC"   # Add key
del d["age"]        # Delete key
list(d.keys())      # ["name", "city"]
list(d.values())    # ["Alice", "NYC"]
"name" in d         # True
d.get("name")       # "Alice"
d.get("missing", "default")  # "default"
```

### Sets

```javascript
// JavaScript - Set (similar to Python)
const set = new Set([1, 2, 3, 2, 1]);
set.size; // 3
set.add(4); // Set { 1, 2, 3, 4 }
set.has(2); // true
set.delete(2); // Set { 1, 3, 4 }
```

```python
# Python - sets (unordered, unique elements)
s = {1, 2, 3, 2, 1}
len(s)              # 3
s.add(4)            # {1, 2, 3, 4}
2 in s              # True
s.remove(2)         # {1, 3, 4}
s.discard(2)        # doesn't raise error if missing
set()               # empty set
s1.union(s2)        # s1 | s2
s1.intersection(s2) # s1 & s2
```

### List Comprehensions

```javascript
// JavaScript - map, filter, etc.
[1, 2, 3, 4].map((x) => x * 2); // [2, 4, 6, 8]
[1, 2, 3, 4].filter((x) => x > 2); // [3, 4]
[1, 2, 3, 4].map((x) => x * 2).filter((x) => x > 4); // [6, 8]
```

```python
# Python - list comprehensions (more readable)
[x * 2 for x in [1, 2, 3, 4]]           # [2, 4, 6, 8]
[x for x in [1, 2, 3, 4] if x > 2]      # [3, 4]
[x * 2 for x in [1, 2, 3, 4] if x * 2 > 4]  # [6, 8]

# Nested comprehensions
matrix = [[1, 2], [3, 4]]
[x for row in matrix for x in row]      # [1, 2, 3, 4]

# Dictionary comprehensions
{x: x**2 for x in range(5)}             # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# Set comprehensions
{x % 3 for x in range(10)}              # {0, 1, 2}
```

---

## Object-Oriented Programming

### Classes

```javascript
// JavaScript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }

  getAge() {
    return this.age;
  }
}

const p = new Person('Alice', 25);
p.greet(); // Hello, I'm Alice
```

```python
# Python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        print(f"Hello, I'm {self.name}")

    def get_age(self):
        return self.age

p = Person("Alice", 25)
p.greet()  # Hello, I'm Alice
```

<callout variant="important" title="Key differences">

- Use `__init__` instead of `constructor`
- All methods take `self` as first parameter (explicit)
- No `new` keyword in Python
- Python naming convention: `get_age` (snake_case) instead of `getAge` (camelCase)

</callout>

### Inheritance

```javascript
// JavaScript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog('Rex');
dog.speak(); // Rex barks
```

```python
# Python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(f"{self.name} makes a sound")

class Dog(Animal):
    def speak(self):
        print(f"{self.name} barks")

dog = Dog("Rex")
dog.speak()  # Rex barks
```

### Static Methods and Properties

```javascript
// JavaScript
class MathUtils {
  static PI = 3.14159;

  static add(a, b) {
    return a + b;
  }
}

MathUtils.PI; // 3.14159
MathUtils.add(2, 3); // 5
```

```python
# Python
class MathUtils:
    PI = 3.14159

    @staticmethod
    def add(a, b):
        return a + b

MathUtils.PI       # 3.14159
MathUtils.add(2, 3) # 5
```

---

## Advanced Algorithms

### Sorting

```javascript
// JavaScript
const arr = [3, 1, 4, 1, 5, 9, 2, 6];
arr.sort(); // [1, 1, 2, 3, 4, 5, 6, 9]
arr.sort((a, b) => b - a); // descending
arr.sort((a, b) => a.localeCompare(b)); // strings
```

```python
# Python
arr = [3, 1, 4, 1, 5, 9, 2, 6]
arr.sort()                           # Sorts in-place
sorted(arr)                          # Returns new sorted list
sorted(arr, reverse=True)            # Descending
sorted(arr, key=lambda x: -x)        # Custom sort

# Sort custom objects
people = [{"name": "Alice", "age": 25}, {"name": "Bob", "age": 20}]
sorted(people, key=lambda x: x["age"])
```

### Searching and Finding

```javascript
// JavaScript
const arr = [1, 2, 3, 4, 5];
arr.indexOf(3); // 2
arr.includes(3); // true
arr.find((x) => x > 3); // 4
arr.findIndex((x) => x > 3); // 3
arr.filter((x) => x > 3); // [4, 5]
```

```python
# Python
arr = [1, 2, 3, 4, 5]
arr.index(3)           # 2
3 in arr               # True
next((x for x in arr if x > 3))  # 4
[i for i, x in enumerate(arr) if x > 3][0]  # 3
[x for x in arr if x > 3]  # [4, 5]

# Binary search (for sorted arrays)
import bisect
bisect.bisect_left(arr, 3)  # 2 (insertion point)
```

### Recursion

```javascript
// JavaScript
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

factorial(5); // 120
fibonacci(6); // 8
```

```python
# Python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

factorial(5)    # 120
fibonacci(6)    # 8

# Python has recursion limit (default 1000)
import sys
sys.setrecursionlimit(10000)
```

### Memoization (Dynamic Programming)

```javascript
// JavaScript - using object
function fib(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}

fib(50); // Very fast
```

```python
# Python - using functools
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

fib(50)  # Very fast

# Or manual memoization
def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]
```

### Tree Traversal

```javascript
// JavaScript
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// DFS - Inorder
function inorder(root, result = []) {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.val);
  inorder(root.right, result);
  return result;
}

// BFS - Level order
function levelOrder(root) {
  const result = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}
```

```python
# Python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# DFS - Inorder (recursive)
def inorder(root, result=None):
    if result is None:
        result = []
    if not root:
        return result
    inorder(root.left, result)
    result.append(root.val)
    inorder(root.right, result)
    return result

# BFS - Level order
from collections import deque

def level_order(root):
    result = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        result.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return result
```

### Graph Algorithms

```python
# Python - DFS
def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    return visited

# BFS
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return visited

# Example graph
graph = {
    1: [2, 3],
    2: [1, 4],
    3: [1],
    4: [2]
}

dfs(graph, 1)   # {1, 2, 3, 4}
bfs(graph, 1)   # {1, 2, 3, 4}
```

---

## Common Patterns for LeetCode

### Two Pointers

```python
# Finding pairs that sum to target
def two_sum(arr, target):
    left, right = 0, len(arr) - 1
    result = []
    while left < right:
        total = arr[left] + arr[right]
        if total == target:
            result.append((arr[left], arr[right]))
            left += 1
            right -= 1
        elif total < target:
            left += 1
        else:
            right -= 1
    return result

two_sum([1, 2, 3, 4, 5, 6], 7)  # [(1, 6), (2, 5), (3, 4)]
```

### Sliding Window

```python
# Maximum sum of subarray of size k
def max_sum_subarray(arr, k):
    if len(arr) < k:
        return 0

    window_sum = sum(arr[:k])
    max_sum = window_sum

    for i in range(k, len(arr)):
        window_sum = window_sum - arr[i - k] + arr[i]
        max_sum = max(max_sum, window_sum)

    return max_sum

max_sum_subarray([1, 4, 2, 10, 2, 3, 1, 0, 20], 4)  # 24
```

### Binary Search

```python
# Find target in sorted array
def binary_search(arr, target):
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1

binary_search([1, 3, 5, 7, 9, 11], 7)  # 3
```

### Hash Map for Frequency

```python
# Find first non-repeating character
def first_non_repeating(s):
    char_count = {}
    for char in s:
        char_count[char] = char_count.get(char, 0) + 1

    for char in s:
        if char_count[char] == 1:
            return char

    return None

first_non_repeating("leetcode")  # "l"
```

### Dynamic Programming

```python
# Climbing stairs problem
def climb_stairs(n):
    if n <= 1:
        return n

    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2

    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]

    return dp[n]

climb_stairs(5)  # 8
```

### Backtracking

```python
# Generate all subsets (power set)
def subsets(nums):
    result = []

    def backtrack(index, current):
        result.append(current[:])
        for i in range(index, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()

    backtrack(0, [])
    return result

subsets([1, 2, 3])
# [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
```

---

## Performance & Complexity

### Time Complexity

| Notation   | Name         | Example                          |
| ---------- | ------------ | -------------------------------- |
| O(1)       | Constant     | Accessing array element by index |
| O(log n)   | Logarithmic  | Binary search                    |
| O(n)       | Linear       | Simple loop through array        |
| O(n log n) | Linearithmic | Merge sort, quick sort           |
| O(n²)      | Quadratic    | Nested loops                     |
| O(n³)      | Cubic        | Triple nested loops              |
| O(2^n)     | Exponential  | Recursive fibonacci              |
| O(n!)      | Factorial    | Permutations                     |

### Space Complexity

```python
# O(1) - constant space
def sum_numbers(n):
    total = 0
    for i in range(n):
        total += i
    return total

# O(n) - linear space
def create_list(n):
    return [i for i in range(n)]

# O(n²) - quadratic space
def create_matrix(n):
    return [[0] * n for _ in range(n)]
```

### Common Optimizations

```python
# Use sets for O(1) lookups instead of lists O(n)
if x in my_set:      # O(1)
    pass
if x in my_list:     # O(n)
    pass

# Use dictionaries to avoid nested loops
# Instead of:
for item1 in list1:
    for item2 in list2:
        if item1 == item2:
            pass

# Do:
d = {item: True for item in list2}
for item1 in list1:
    if item1 in d:
        pass

# String concatenation: use join, not +
# Bad:
result = ""
for char in chars:
    result += char  # O(n²)

# Good:
result = "".join(chars)  # O(n)
```

---

## Quick Reference: Python vs JavaScript

| Task             | JavaScript         | Python                                |
| ---------------- | ------------------ | ------------------------------------- |
| Print to console | `console.log()`    | `print()`                             |
| Length           | `.length`          | `len()`                               |
| Type check       | `typeof`           | `type()`                              |
| Max value        | `Math.max(...arr)` | `max(arr)`                            |
| Min value        | `Math.min(...arr)` | `min(arr)`                            |
| Reverse          | `arr.reverse()`    | `arr.reverse()` or `arr[::-1]`        |
| Join array       | `arr.join(",")`    | `",".join(arr)`                       |
| Split string     | `str.split(",")`   | `str.split(",")`                      |
| Abs value        | `Math.abs(x)`      | `abs(x)`                              |
| Floor            | `Math.floor(x)`    | `x // 1` or `math.floor(x)`           |
| Ceil             | `Math.ceil(x)`     | `math.ceil(x)` or `(x + 0.9999) // 1` |
| Power            | `Math.pow(x, y)`   | `x ** y` or `pow(x, y)`               |
| Square root      | `Math.sqrt(x)`     | `x ** 0.5` or `math.sqrt(x)`          |
| Sort             | `arr.sort()`       | `arr.sort()` or `sorted(arr)`         |

---

## Essential Built-in Functions

```python
# String methods
s = "hello world"
s.upper()           # "HELLO WORLD"
s.lower()           # "hello world"
s.capitalize()      # "Hello world"
s.replace("o", "a") # "hella warld"
s.startswith("he")  # True
s.endswith("ld")    # True
s.strip()           # Remove leading/trailing whitespace
s.split()           # ["hello", "world"]

# List methods
lst = [3, 1, 4, 1, 5]
sorted(lst)         # [1, 1, 3, 4, 5] (new list)
reversed(lst)       # iterator (use list(reversed(lst)))
sum(lst)            # 14
len(lst)            # 5
min(lst)            # 1
max(lst)            # 5
lst.count(1)        # 2
lst.clear()         # removes all elements

# Useful functions
range(5)            # 0, 1, 2, 3, 4
enumerate([10, 20, 30])  # (0, 10), (1, 20), (2, 30)
zip([1, 2], [3, 4]) # (1, 3), (2, 4)
map(fn, iterable)   # applies fn to each element
filter(fn, iterable) # keeps elements where fn is True
any([True, False])   # True
all([True, False])   # False
```

---

## Exception Handling

```python
# Try-except-finally
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")
except Exception as e:
    print(f"Error: {e}")
finally:
    print("Cleanup code here")

# Raising exceptions
if age < 0:
    raise ValueError("Age cannot be negative")

# Multiple except blocks
try:
    int("not a number")
except ValueError:
    print("Invalid value")
except TypeError:
    print("Wrong type")
```

---

## File I/O

```python
# Reading files
with open("file.txt", "r") as f:
    content = f.read()          # entire file as string
    # OR
    lines = f.readlines()       # list of lines

# Writing files
with open("file.txt", "w") as f:
    f.write("Hello, world!")

# Appending
with open("file.txt", "a") as f:
    f.write("\nMore content")

# Reading JSON
import json
with open("data.json", "r") as f:
    data = json.load(f)
```

---

## Imports and Modules

```python
# Standard library imports
import math
math.sqrt(16)       # 4.0
math.ceil(4.2)      # 5
math.floor(4.8)     # 4

from collections import deque, Counter, defaultdict
# deque for efficient append/pop from both ends
# Counter for counting frequencies
# defaultdict for default values

from functools import lru_cache

# Check if something is in a module
from itertools import combinations, permutations
```

---

## Final Tips for LeetCode in Python

1. **Use `deque` for queue operations** (more efficient than list.pop(0))
2. **Use `defaultdict` or `.get()` for safe dictionary access**
3. **List comprehensions are your friend** - they're faster and more Pythonic
4. **String concatenation**: Use `join()`, not `+`
5. **Use `enumerate()` when you need both index and value**
6. **Use `zip()` for pairing elements from multiple iterables**
7. **Use set operations for O(1) lookups**
8. **Use `//` for integer division, not `/`**
9. **Remember: strings and tuples are immutable**
10. **Use `*args` and `**kwargs` for flexible function parameters\*\*
11. **Learn the difference between shallow and deep copy** (use `copy.deepcopy()`)
12. **Use `@lru_cache` for memoization in recursive problems**
