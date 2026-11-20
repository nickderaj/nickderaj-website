---
title: 'Modern Java Threading in Java 21+: From Platform Threads to Virtual Threads'
date: '2026-02-04'
description: 'A deep, opinionated guide to threads, virtual threads, and concurrency in Java 21+ — covering the Java Memory Model, structured concurrency, synchronization, and real-world patterns for production systems.'
tags: ['java', 'concurrency', 'virtual-threads']
---

<table-of-contents>
<li><a href="#1-modern-java-concurrency-mindset-java-21">1. Modern Java Concurrency Mindset</a></li>
<li><a href="#2-threading-models-and-core-concepts">2. Threading Models and Core Concepts</a></li>
<li><a href="#3-java-memory-model-and-visibility-guarantees">3. Java Memory Model and Visibility</a></li>
<li><a href="#4-working-with-threads-directly-platform-and-virtual">4. Working With Threads Directly</a></li>
<li><a href="#5-executors-and-thread-pools-in-the-virtual-thread-era">5. Executors and Thread Pools</a></li>
<li><a href="#6-structured-concurrency-in-java-21">6. Structured Concurrency</a></li>
<li><a href="#7-synchronization-and-shared-state">7. Synchronization and Shared State</a></li>
<li><a href="#8-high-level-async-and-parallel-abstractions">8. High-Level Async and Parallel Abstractions</a></li>
<li><a href="#9-common-concurrency-patterns-with-modern-java">9. Common Concurrency Patterns</a></li>
<li><a href="#10-pitfalls-gotchas-and-failure-modes">10. Pitfalls, Gotchas, and Failure Modes</a></li>
<li><a href="#11-testing-debugging-and-observability">11. Testing, Debugging, and Observability</a></li>
<li><a href="#12-performance-tuning-and-design-guidelines">12. Performance Tuning and Design Guidelines</a></li>
<li><a href="#13-real-world-case-studies">13. Real-World Case Studies</a></li>
<li><a href="#14-summary-and-recommended-practices">14. Summary and Recommended Practices</a></li>
<li><a href="#15-common-interview-questions">15. Common Interview Questions</a></li>
</table-of-contents>

## 1. Modern Java Concurrency Mindset (Java 21+)

Java's concurrency story has changed more in the last two releases than in the previous decade. Virtual threads (Project Loom) shipped as a final feature in Java 21, and structured concurrency is close behind. If your mental model of Java threading was formed in the Java 5–11 era — fixed thread pools, `CompletableFuture` chains, maybe some reactive programming — it's time to update it.

But first, a disclaimer: **virtual threads do not make concurrency easy**. They change the _cost model_ of threads and the _preferred patterns_ for IO-bound work. You still need to understand visibility, atomicity, locking, and cancellation. The bugs are the same bugs. The difference is that the right solution is now simpler to write.

### 1.1 Why Concurrency Matters Now

Modern backends are inherently concurrent. A typical microservice handles thousands of simultaneous HTTP requests, each waiting on databases, downstream APIs, and message brokers. The CPU spends most of its time _waiting_, not computing.

This distinction matters:

- **IO-bound concurrency**: many tasks, mostly waiting. The bottleneck is the number of things you can wait on simultaneously. Think REST handlers, gRPC services, Kafka consumers.
- **CPU-bound parallelism**: fewer tasks, mostly computing. The bottleneck is core count. Think data processing, simulations, batch transforms.

The metrics that matter are **latency** (how long one request takes), **throughput** (how many requests per second), and **resource utilization** (are your cores and memory being used efficiently). Getting concurrency wrong hurts all three.

<callout variant="note" title="Concurrency vs Parallelism">
Concurrency is about _dealing with_ many things at once (structure). Parallelism is about _doing_ many things at once (execution). A single-core machine can be concurrent but not parallel. Virtual threads are primarily a concurrency tool — they let you structure code around many simultaneous tasks without needing one OS thread per task.
</callout>

### 1.2 Evolution of Java Concurrency

A brief history to explain why virtual threads exist and why old habits may no longer be optimal:

| Era              | What Changed                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| **Java 1.0–1.4** | Manual `Thread` management, `synchronized`, `wait`/`notify`. Painful and error-prone.                       |
| **Java 5**       | `java.util.concurrent`: `ExecutorService`, `Future`, `Lock`, concurrent collections. A massive improvement. |
| **Java 7–8**     | `ForkJoinPool`, parallel streams, `CompletableFuture`. Expressive async and data parallelism.               |
| **Java 19–21**   | Virtual threads and structured concurrency. The cost model of threads changes fundamentally.                |

The key insight: **threads used to be expensive OS resources** (each one costs ~1 MB of stack space, plus kernel scheduling overhead). This forced Java developers into elaborate pooling strategies, non-blocking IO, and callback-based programming. Virtual threads are cheap user-mode constructs — you can have millions of them. This makes "one thread per task" viable again for IO-bound work.

<callout variant="important" title="Virtual Threads Are Not a Silver Bullet">
Virtual threads make blocking code scalable for IO-bound workloads. They do not eliminate the need for good concurrency design. You still need to think about shared state, locking, backpressure, and error handling. The difference is that you can think about these things while writing straightforward imperative code instead of callback chains.
</callout>

## 2. Threading Models and Core Concepts

### 2.1 Processes vs Threads (Brief Recap)

A process has its own address space. Threads within a process share the same heap but have separate stacks and registers. The mental model: **multiple call stacks walking around the same heap**. This sharing is what makes threads useful (cheap communication) and dangerous (data races).

Within the JVM, all threads — platform or virtual — share the same heap. If two threads read and write the same field without synchronization, you have a data race, and the behavior is undefined by the Java Memory Model.

### 2.2 Platform Threads vs Virtual Threads

Both are `java.lang.Thread` from the developer's perspective, but they are backed by fundamentally different mechanisms.

**Platform threads** have a 1:1 mapping to OS threads. They are heavyweight: each one allocates a native stack (typically 512 KB–1 MB), is scheduled by the OS kernel, and is limited in number. Most systems can sustain a few thousand before context-switching overhead and memory pressure become problems.

**Virtual threads** are lightweight threads managed by the JVM. The JVM multiplexes many virtual threads onto a small pool of platform threads (called _carrier threads_). When a virtual thread blocks on IO, the JVM unmounts it from the carrier thread, freeing the carrier for other work. When the IO completes, the JVM remounts the virtual thread onto an available carrier.

|                     | Platform Thread    | Virtual Thread                           |
| ------------------- | ------------------ | ---------------------------------------- |
| **Backed by**       | OS thread (1:1)    | JVM-managed, multiplexed onto carriers   |
| **Stack cost**      | ~512 KB–1 MB fixed | Starts small, grows as needed            |
| **Practical limit** | Thousands          | Millions                                 |
| **Best for**        | CPU-bound work     | IO-bound work (blocking calls)           |
| **Scheduling**      | OS kernel          | JVM (ForkJoinPool-based)                 |
| **Pinning risk**    | N/A                | `synchronized` blocks, some native calls |

<callout variant="warning" title="Pinning: The Virtual Thread Gotcha">
When a virtual thread executes inside a `synchronized` block or method, it becomes _pinned_ to its carrier thread. If it then blocks (e.g., on IO), the carrier thread is also blocked — defeating the purpose of virtual threads. Prefer `ReentrantLock` over `synchronized` for locks that guard blocking operations. Use `-Djdk.tracePinnedThreads=short` to detect pinning at runtime.
</callout>

### 2.3 Thread Lifecycle and States

Every Java thread moves through a defined set of states:

- **NEW** — created but not yet started.
- **RUNNABLE** — executing or ready to execute.
- **BLOCKED** — waiting to acquire an intrinsic lock (monitor).
- **WAITING** — waiting indefinitely for another thread's action (`Object.wait()`, `Thread.join()`, `LockSupport.park()`).
- **TIMED_WAITING** — waiting with a timeout (`Thread.sleep()`, `Object.wait(timeout)`).
- **TERMINATED** — execution complete.

For virtual threads, the key difference is what happens during **WAITING** and **TIMED_WAITING**: instead of blocking an OS thread, the virtual thread is _unmounted_ from its carrier (unless pinned), freeing the carrier for other virtual threads. This is the mechanism that makes millions of concurrent blocking calls feasible.

```java
Thread vt = Thread.ofVirtual().name("worker-1").unstarted(() -> {
    System.out.println("State inside task: " + Thread.currentThread().getState());
});

System.out.println("Before start: " + vt.getState());  // NEW
vt.start();
vt.join();
System.out.println("After join: " + vt.getState());     // TERMINATED
```

## 3. Java Memory Model and Visibility Guarantees

The Java Memory Model (JMM) is the contract between your code and the JVM regarding when writes by one thread become visible to reads by another thread. Getting this wrong produces bugs that are maddening to diagnose — they appear intermittently, depend on hardware, JIT optimizations, and load patterns, and often vanish under a debugger.

### 3.1 Happens-Before Relationships

The core concept is **happens-before**: if action A _happens-before_ action B, then B is guaranteed to see the effects of A. Without a happens-before edge, the JVM and CPU are free to reorder, cache, and optimize in ways that make writes invisible to other threads.

Happens-before edges are established by:

- **`synchronized`**: unlocking a monitor happens-before every subsequent lock of that same monitor.
- **`volatile`**: a write to a volatile variable happens-before every subsequent read of that variable.
- **`Thread.start()`**: the call to `start()` happens-before any action in the started thread.
- **`Thread.join()`**: all actions in a thread happen-before `join()` returns.
- **`ExecutorService` submission**: submitting a task happens-before the task begins.

The classic example of getting this wrong is double-checked locking without `volatile`:

```java
// BROKEN: other threads may see a non-null but partially constructed instance
public class BrokenSingleton {
    private static BrokenSingleton instance;

    public static BrokenSingleton getInstance() {
        if (instance == null) {
            synchronized (BrokenSingleton.class) {
                if (instance == null) {
                    instance = new BrokenSingleton(); // unsafe publication
                }
            }
        }
        return instance;
    }
}
```

The fix is simple — add `volatile`:

```java
// CORRECT: volatile ensures visibility of the fully constructed object
public class Singleton {
    private static volatile Singleton instance;

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

Without `volatile`, the first `null` check can see a non-null reference to a _partially constructed_ object. The `synchronized` block only protects threads that enter it — the outer check bypasses it entirely. The `volatile` keyword creates the necessary happens-before edge between the write inside the synchronized block and the read outside it.

<callout variant="important" title="Rule of Thumb">
If two threads access the same mutable data and at least one writes, you need a happens-before relationship. No exceptions. "It works on my machine" is not evidence of correctness — it is evidence of a particular hardware memory model and JIT compilation path.
</callout>

### 3.2 Atomicity and Mutability

An operation is **atomic** if it completes in a single, indivisible step from the perspective of other threads. In Java, reads and writes of references and most primitives (except `long` and `double` on 32-bit JVMs) are atomic. But atomicity alone is not enough:

```java
// NOT THREAD-SAFE: read-modify-write is three operations, not one
private int counter = 0;

public void increment() {
    counter++; // read counter, add 1, write counter — not atomic
}
```

Two threads calling `increment()` simultaneously can both read the same value, increment it, and write back the same result — losing an update. The fix is to use `AtomicInteger`:

```java
private final AtomicInteger counter = new AtomicInteger(0);

public void increment() {
    counter.incrementAndGet(); // atomic CAS operation
}
```

For high-contention counters (e.g., metrics in a heavily concurrent service), `LongAdder` outperforms `AtomicLong` because it distributes updates across multiple cells and only aggregates on read:

```java
private final LongAdder requestCount = new LongAdder();

public void onRequest() {
    requestCount.increment(); // low contention under high concurrency
}

public long getTotal() {
    return requestCount.sum(); // aggregates all cells
}
```

<callout variant="warning" title="Gotcha: 'Just a Boolean'">
"It's just a boolean, booleans are atomic" — true, the read/write is atomic, but without `volatile` or another happens-before edge, the write may never become visible to other threads. The JIT compiler can hoist the read out of a loop, and you get an infinite loop on one thread while the other thread has already set the flag. Always use `volatile` for flags shared between threads, or use `AtomicBoolean`.
</callout>

## 4. Working With Threads Directly (Platform and Virtual)

Understanding the low-level Thread API matters even if you typically use higher-level abstractions. When things go wrong, you need to know what is happening underneath.

### 4.1 Creating and Starting Platform Threads

```java
// Lambda syntax — the modern way
Thread thread = new Thread(() -> {
    System.out.println("Running on: " + Thread.currentThread().getName());
});
thread.setName("data-loader");
thread.setDaemon(true); // won't prevent JVM shutdown
thread.start();
```

<callout variant="warning" title="Gotcha: Uncaught Exceptions">
If a thread throws an unchecked exception and you haven't set an `UncaughtExceptionHandler`, the exception is printed to stderr and the thread dies silently. In a production service, this means lost work with no alerting. Always set a handler:
</callout>

```java
thread.setUncaughtExceptionHandler((t, e) -> {
    logger.error("Thread {} failed: {}", t.getName(), e.getMessage(), e);
});
```

Manual thread creation is rarely the right choice for platform threads — you almost always want an executor. But for virtual threads, direct creation is more reasonable.

### 4.2 Creating Virtual Threads in Java 21+

Java 21 provides three idiomatic ways to create virtual threads:

```java
// 1. Fire-and-forget
Thread.startVirtualThread(() -> {
    var data = fetchFromDatabase(); // blocking call — that's fine
    process(data);
});

// 2. Customized virtual thread
Thread vt = Thread.ofVirtual()
    .name("order-processor-", 0)  // names: order-processor-0, order-processor-1, ...
    .start(() -> processOrder(orderId));

// 3. Via executor (preferred for integration with existing APIs)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i ->
        executor.submit(() -> {
            var response = httpClient.send(request, BodyHandlers.ofString());
            processResponse(response);
        })
    );
} // executor.close() waits for all tasks to complete
```

The third pattern — using `Executors.newVirtualThreadPerTaskExecutor()` — is the most common in practice because most existing code is written against `ExecutorService`. The `try-with-resources` ensures all submitted tasks complete before continuing, which is a form of structured concurrency.

<callout variant="important" title="Rule of Thumb">
Treat virtual threads as cheap but not free. Each one consumes memory for its stack (starting small but growing as needed). Creating a million virtual threads that each allocate large stack frames will still cause memory pressure. The key benefit is that _parked_ virtual threads cost almost nothing — so for IO-bound work where most threads are waiting, the savings are enormous.
</callout>

### 4.3 Thread Interruption, Cancellation, and Cooperative Shutdown

Java's cancellation mechanism is _cooperative_: calling `thread.interrupt()` sets a flag and may throw `InterruptedException` from blocking operations. The thread must check for and respond to this signal.

```java
Thread worker = Thread.ofVirtual().start(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        try {
            var message = queue.take(); // throws InterruptedException if interrupted
            process(message);
        } catch (InterruptedException e) {
            // Restore the flag so callers know we were interrupted
            Thread.currentThread().interrupt();
            break; // exit the loop
        }
    }
    cleanup(); // release resources
});

// Later, request cancellation:
worker.interrupt();
worker.join(Duration.ofSeconds(5));
```

<callout variant="warning" title="The Cardinal Sin of InterruptedException">
Never swallow `InterruptedException`. Either re-throw the exception, or restore the interrupt flag with `Thread.currentThread().interrupt()`. Swallowing it silently breaks all upstream cancellation logic and can cause tasks to hang indefinitely during shutdown.
</callout>

```java
// BAD: silently swallows the interruption
catch (InterruptedException e) {
    // the thread no longer knows it was interrupted
}

// GOOD: restore the flag so callers know we were interrupted
catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    throw new RuntimeException("Task interrupted", e);
}
```

## 5. Executors and Thread Pools in the Virtual Thread Era

### 5.1 Classic Thread Pools (Fixed, Cached, Scheduled)

The `java.util.concurrent` executor types have been the workhorses of Java concurrency since Java 5:

```java
// Fixed pool: bounded concurrency, queued overflow
ExecutorService cpuPool = Executors.newFixedThreadPool(
    Runtime.getRuntime().availableProcessors()
);

// Scheduled pool: periodic and delayed tasks
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
scheduler.scheduleAtFixedRate(
    () -> refreshCache(),
    0, 5, TimeUnit.MINUTES
);
```

**Fixed pools** are still the right choice for CPU-bound work. Size them to core count. Don't use virtual threads for CPU-heavy computation — you will not get more parallelism than you have cores, and the scheduler overhead adds up.

**Cached pools** (`Executors.newCachedThreadPool()`) create an unbounded number of platform threads on demand. Under sustained load, this can create thousands of OS threads and crash your process. In most cases, a virtual-thread-per-task executor is a better choice for bursty IO workloads.

**Scheduled pools** remain useful for cron-like tasks. Consider using a scheduled pool for _triggering_ work, and virtual threads for _executing_ it:

```java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
scheduler.scheduleAtFixedRate(() -> {
    Thread.startVirtualThread(() -> {
        // Actual work runs on a virtual thread
        syncInventoryWithWarehouse();
    });
}, 0, 10, TimeUnit.MINUTES);
```

### 5.2 Virtual Thread Per Task Executor

This is the executor you will reach for most often in modern IO-bound services:

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<UserProfile>> futures = userIds.stream()
        .map(id -> executor.submit(() -> fetchUserProfile(id)))
        .toList();

    List<UserProfile> profiles = new ArrayList<>();
    for (var future : futures) {
        profiles.add(future.get()); // blocking — perfectly fine on virtual threads
    }
}
```

Every submitted task gets its own virtual thread. There is no pooling, no queue — each task runs immediately on a new virtual thread. The JVM's carrier thread pool (typically sized to core count) handles the actual OS-level scheduling.

<callout variant="note" title="When NOT to Use Virtual-Thread-Per-Task">
Do not use this executor for CPU-bound tasks. If each task does heavy computation (parsing, encryption, matrix math), you will oversubscribe the CPU and waste time on context switching. Use a fixed-size pool instead.
</callout>

```java
// CPU work: bounded pool
ExecutorService cpuPool = Executors.newFixedThreadPool(
    Runtime.getRuntime().availableProcessors()
);

// IO work: virtual threads
ExecutorService ioExecutor = Executors.newVirtualThreadPerTaskExecutor();
```

### 5.3 Executor Shutdown and Resource Management

Failing to shut down an executor is one of the most common resource leaks in Java applications. The JVM will not exit while non-daemon threads are alive, and executor threads are non-daemon by default.

```java
ExecutorService executor = Executors.newFixedThreadPool(4);
try {
    // submit work...
} finally {
    executor.shutdown(); // stop accepting new tasks
    if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
        executor.shutdownNow(); // interrupt running tasks
        if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
            logger.error("Executor did not terminate");
        }
    }
}
```

With virtual-thread-per-task executors, prefer `try-with-resources` — `close()` calls `shutdown()` and `awaitTermination()` automatically:

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> doWork());
    // all tasks complete before exiting this block
}
```

<callout variant="warning" title="Gotcha: Static Executors in Tests">
A common pattern is declaring a `static final ExecutorService` at class level. In production code, this is fine — the executor lives for the process lifetime. In test code, it causes flaky tests and hanging JVMs because the executor is never shut down between test runs. Use `@BeforeEach`/`@AfterEach` lifecycle methods or dependency injection to manage executor lifetimes in tests.
</callout>

## 6. Structured Concurrency in Java 21+

### 6.1 What Is Structured Concurrency?

Structured concurrency applies the principle of structured programming to concurrent tasks: **tasks are created, run, and joined within a bounded scope**, just as local variables exist within a block. When the scope exits, all child tasks are guaranteed to have completed (or been cancelled).

Think of it as the concurrency equivalent of banning `goto`. Without structured concurrency, you spawn threads that outlive their creating scope, forget to join them, lose track of errors, and leak resources. With it, the structure of your code _enforces_ correct lifetime management.

### 6.2 Using StructuredTaskScope with Virtual Threads

`StructuredTaskScope` (preview in Java 21, evolving in later releases) lets you fork subtasks and join them as a unit:

```java
record UserProfile(String name, String email) {}
record OrderHistory(List<String> orders) {}
record DashboardData(UserProfile profile, OrderHistory history) {}

DashboardData loadDashboard(long userId) throws Exception {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        // Fork two tasks — each runs on its own virtual thread
        Subtask<UserProfile> profileTask = scope.fork(() ->
            userService.fetchProfile(userId)
        );
        Subtask<OrderHistory> historyTask = scope.fork(() ->
            orderService.fetchHistory(userId)
        );

        scope.join();            // wait for both tasks
        scope.throwIfFailed();   // propagate any exception

        return new DashboardData(profileTask.get(), historyTask.get());
    }
    // Scope is closed: all forked threads are guaranteed to be done
}
```

**`ShutdownOnFailure`**: if any subtask fails, the remaining subtasks are cancelled (interrupted). The first exception is propagated. This is perfect for "I need all results" fan-out patterns.

**`ShutdownOnSuccess`**: as soon as _one_ subtask succeeds, the rest are cancelled. Useful for "first response wins" patterns like querying multiple replicas:

```java
String fetchFromFastestReplica(List<String> replicaUrls) throws Exception {
    try (var scope = new StructuredTaskScope.ShutdownOnSuccess<String>()) {
        for (String url : replicaUrls) {
            scope.fork(() -> httpClient.send(
                HttpRequest.newBuilder(URI.create(url)).build(),
                BodyHandlers.ofString()
            ).body());
        }
        scope.join();
        return scope.result(); // first successful result
    }
}
```

<callout variant="important" title="Rule of Thumb">
Use structured concurrency whenever you fork-and-join related tasks within a single operation. It replaces the fragile pattern of creating `List<Future>`, iterating over them, calling `get()`, and hoping you remembered to cancel the rest on failure. The scope handles all of that for you.
</callout>

## 7. Synchronization and Shared State

The best concurrency strategy is to _share less_. Immutable objects, thread-local state, and message-passing eliminate entire categories of bugs. But when you must share mutable state, here are your tools.

### 7.1 Synchronized Blocks and Methods

Java's intrinsic locks (monitors) are simple and well-understood:

```java
public class AccountService {
    private final Object lock = new Object(); // dedicated lock object
    private BigDecimal balance = BigDecimal.ZERO;

    public void deposit(BigDecimal amount) {
        synchronized (lock) {
            balance = balance.add(amount);
        }
    }

    public BigDecimal getBalance() {
        synchronized (lock) {
            return balance;
        }
    }
}
```

<callout variant="warning" title="Synchronized + Virtual Threads = Pinning">
When a virtual thread enters a `synchronized` block, it becomes pinned to its carrier thread. If it then performs a blocking operation (IO, sleep, waiting on another lock), the carrier thread is blocked too. With many virtual threads contending on the same `synchronized` lock, you can pin all carrier threads and stall your entire application. Prefer `ReentrantLock` for any lock that guards blocking operations.
</callout>

```java
private final ReentrantLock lock = new ReentrantLock();

public void updateWithExternalCall() {
    lock.lock();
    try {
        var data = externalService.fetch(); // blocking IO
        applyUpdate(data);
    } finally {
        lock.unlock();
    }
}
```

### 7.2 Explicit Locks and Conditions

`ReentrantLock` offers features that `synchronized` lacks: timed lock attempts, interruptible locking, and fairness policies.

```java
private final ReentrantLock lock = new ReentrantLock();

public boolean tryUpdate(Duration timeout) throws InterruptedException {
    if (lock.tryLock(timeout.toMillis(), TimeUnit.MILLISECONDS)) {
        try {
            performUpdate();
            return true;
        } finally {
            lock.unlock();
        }
    }
    return false; // could not acquire lock in time
}
```

`ReadWriteLock` is valuable when reads vastly outnumber writes:

```java
private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
private Map<String, Config> configCache = Map.of();

public Config getConfig(String key) {
    rwLock.readLock().lock();
    try {
        return configCache.get(key);
    } finally {
        rwLock.readLock().unlock();
    }
}

public void reloadConfig(Map<String, Config> newConfig) {
    rwLock.writeLock().lock();
    try {
        configCache = Map.copyOf(newConfig);
    } finally {
        rwLock.writeLock().unlock();
    }
}
```

### 7.3 Atomic Variables and Concurrent Collections

For single-variable updates, atomic classes avoid locking entirely:

```java
private final AtomicReference<ImmutableConfig> config =
    new AtomicReference<>(ImmutableConfig.defaults());

public void updateConfig(Function<ImmutableConfig, ImmutableConfig> updater) {
    config.updateAndGet(updater::apply); // atomic CAS loop
}
```

`ConcurrentHashMap` is the workhorse concurrent collection, but be aware of its semantics:

```java
ConcurrentHashMap<String, LongAdder> metrics = new ConcurrentHashMap<>();

public void recordMetric(String name) {
    // computeIfAbsent is atomic for the map operation,
    // and LongAdder.increment() is thread-safe
    metrics.computeIfAbsent(name, k -> new LongAdder()).increment();
}
```

<callout variant="warning" title="Gotcha: Compound Operations on ConcurrentHashMap">
Individual operations on `ConcurrentHashMap` are atomic, but _sequences_ of operations are not. This is a classic mistake — always use the single-operation form.
</callout>

```java
// NOT THREAD-SAFE: check-then-act race condition
if (!map.containsKey(key)) {
    map.put(key, computeValue()); // another thread may have inserted between check and put
}

// CORRECT: single atomic operation
map.computeIfAbsent(key, k -> computeValue());
```

## 8. High-Level Async and Parallel Abstractions

### 8.1 CompletableFuture in the Virtual Thread Era

`CompletableFuture` was Java 8's answer to callback hell. It remains useful, but virtual threads reduce the need for its callback-based style in IO-bound code.

**Before virtual threads** — you chained callbacks to avoid blocking a thread pool:

```java
// Old way: callback chains to avoid blocking pool threads
CompletableFuture<DashboardData> loadDashboard(long userId) {
    return userService.fetchProfileAsync(userId)
        .thenCombine(
            orderService.fetchHistoryAsync(userId),
            (profile, history) -> new DashboardData(profile, history)
        )
        .exceptionally(ex -> {
            logger.error("Failed to load dashboard", ex);
            return DashboardData.empty();
        });
}
```

**With virtual threads** — write straight-line blocking code instead:

```java
// New way: blocking code on virtual threads — same scalability, simpler logic
DashboardData loadDashboard(long userId) throws Exception {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        var profile = scope.fork(() -> userService.fetchProfile(userId));
        var history = scope.fork(() -> orderService.fetchHistory(userId));
        scope.join();
        scope.throwIfFailed();
        return new DashboardData(profile.get(), history.get());
    }
}
```

The second version is easier to read, debug (real stack traces), and reason about. Use `CompletableFuture` when you are integrating with APIs that return them, or when you need its composition operators for genuinely event-driven logic.

### 8.2 Parallel Streams and ForkJoinPool

Parallel streams are for **CPU-bound data parallelism** over in-memory collections:

```java
double average = transactions.parallelStream()
    .filter(tx -> tx.getType() == TransactionType.SALE)
    .mapToDouble(Transaction::getAmount)
    .average()
    .orElse(0.0);
```

<callout variant="warning" title="Gotcha: Blocking in Parallel Streams">
Parallel streams use the common `ForkJoinPool`, which is sized to `availableProcessors() - 1`. If you perform blocking IO inside a parallel stream, you will starve the common pool and affect _all_ parallel streams in the entire JVM. Use virtual threads for IO-heavy work instead.
</callout>

```java
// DO NOT DO THIS — blocks ForkJoinPool threads on IO
List<String> results = urls.parallelStream()
    .map(url -> httpClient.send(request, BodyHandlers.ofString()).body())
    .toList();

// DO THIS INSTEAD: use virtual threads for IO
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = urls.stream()
        .map(url -> executor.submit(() ->
            httpClient.send(request, BodyHandlers.ofString()).body()))
        .toList();
    List<String> results = futures.stream()
        .map(f -> { try { return f.get(); } catch (Exception e) { throw new RuntimeException(e); } })
        .toList();
}
```

### 8.3 Virtual Threads vs Reactive / Non-blocking Frameworks

Reactive frameworks (Reactor, RxJava) were developed specifically to handle high-concurrency IO without blocking threads. They succeed at this, but at a significant cost: complex operator chains, difficult debugging, steep learning curves, and colored function problem (mixing reactive and blocking code is painful).

Virtual threads offer a different trade-off:

|                        | Virtual Threads             | Reactive (Reactor/RxJava)        |
| ---------------------- | --------------------------- | -------------------------------- |
| **Code style**         | Imperative, blocking        | Declarative, callback-based      |
| **Learning curve**     | Low (if you know threads)   | High                             |
| **Debugging**          | Normal stack traces         | Difficult (async traces)         |
| **Backpressure**       | Manual (semaphores, queues) | Built-in operators               |
| **Ecosystem maturity** | Growing (Java 21+)          | Mature                           |
| **Best for**           | Most IO-bound services      | Ultra-high-throughput, streaming |

For most enterprise services handling thousands to tens of thousands of concurrent requests, virtual threads are simpler and sufficient. Reserve reactive frameworks for cases where you genuinely need fine-grained backpressure, streaming operators, or are maintaining an existing reactive codebase.

## 9. Common Concurrency Patterns with Modern Java

### 9.1 Thread-per-Request Pattern Using Virtual Threads

The canonical pattern for IO-bound microservices. Configure your server framework to dispatch each request to a virtual thread:

```java
// Plain Java HTTP server with virtual threads
var server = HttpServer.create(new InetSocketAddress(8080), 0);
server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
server.createContext("/api/users", exchange -> {
    // Each request runs on its own virtual thread
    long userId = extractUserId(exchange);
    var profile = userRepository.findById(userId);     // blocking JDBC — fine
    var orders = orderRepository.findByUser(userId);   // blocking JDBC — fine
    var response = serialize(new UserResponse(profile, orders));
    exchange.sendResponseHeaders(200, response.length);
    exchange.getResponseBody().write(response);
    exchange.close();
});
server.start();
```

In Spring Boot 3.2+, add a single property:

```
spring.threads.virtual.enabled=true
```

Every request handler now runs on a virtual thread. Blocking JDBC calls, `RestTemplate` calls, and file IO all "just work" without starving a thread pool.

<callout variant="important" title="Database Connection Pools Still Matter">
Virtual threads let you handle 100,000 concurrent requests, but your database can't handle 100,000 concurrent connections. You still need a connection pool (e.g., HikariCP) sized to what the database can sustain. Virtual threads will park while waiting for a connection — that's the whole point — but if your pool is too small relative to demand, requests will wait a long time. Tune the pool size based on database capacity, not thread count.
</callout>

### 9.2 CPU-bound Task Pool Pattern

For computation-heavy work, bound your parallelism to core count:

```java
public class DataProcessor {
    private static final ExecutorService CPU_POOL = Executors.newFixedThreadPool(
        Runtime.getRuntime().availableProcessors()
    );

    public List<AnalysisResult> processInParallel(List<DataChunk> chunks) throws Exception {
        List<Future<AnalysisResult>> futures = chunks.stream()
            .map(chunk -> CPU_POOL.submit(() -> analyze(chunk))) // CPU-heavy
            .toList();

        List<AnalysisResult> results = new ArrayList<>();
        for (var future : futures) {
            results.add(future.get());
        }
        return results;
    }

    private AnalysisResult analyze(DataChunk chunk) {
        // Heavy computation: parsing, statistical analysis, ML inference, etc.
        return new AnalysisResult(chunk.id(), computeMetrics(chunk));
    }
}
```

You can orchestrate this from a virtual-thread-based request handler:

```java
// Request handler on a virtual thread
server.createContext("/api/analyze", exchange -> {
    var chunks = parseRequestBody(exchange);
    // Offload CPU work to the bounded pool, block the virtual thread until done
    var results = dataProcessor.processInParallel(chunks);
    sendJsonResponse(exchange, results);
});
```

### 9.3 Background Schedulers and Maintenance Tasks

Periodic tasks should be _triggered_ by a scheduler but can _execute_ on virtual threads:

```java
public class MaintenanceScheduler implements AutoCloseable {
    private final ScheduledExecutorService scheduler =
        Executors.newScheduledThreadPool(1);

    public void start() {
        // Trigger every 5 minutes; actual work runs on a virtual thread
        scheduler.scheduleAtFixedRate(() -> {
            Thread.startVirtualThread(() -> {
                try {
                    purgeExpiredSessions();
                    refreshMaterializedViews();
                    updateSearchIndex();
                } catch (Exception e) {
                    logger.error("Maintenance task failed", e);
                    // Do NOT rethrow — it would cancel future scheduled executions
                }
            });
        }, 0, 5, TimeUnit.MINUTES);
    }

    @Override
    public void close() {
        scheduler.shutdown();
    }
}
```

<callout variant="warning" title="Gotcha: Exceptions Kill Scheduled Tasks">
If a task submitted to `ScheduledExecutorService` throws an exception, the `ScheduledFuture` silently captures it and **no further executions are scheduled**. Always catch exceptions inside your scheduled tasks. Wrapping the work in a virtual thread (as above) isolates the scheduler from task failures.
</callout>

## 10. Pitfalls, Gotchas, and Failure Modes

### 10.1 Deadlocks, Livelocks, and Starvation

A **deadlock** occurs when two or more threads wait on each other in a cycle:

```java
// DEADLOCK: Thread A locks account1 then account2,
//           Thread B locks account2 then account1
public void transfer(Account from, Account to, BigDecimal amount) {
    synchronized (from) {
        synchronized (to) {
            from.debit(amount);
            to.credit(amount);
        }
    }
}
```

**Prevention**: always acquire locks in a consistent global order. For example, sort by account ID:

```java
public void transfer(Account a, Account b, BigDecimal amount) {
    Account first = a.getId() < b.getId() ? a : b;
    Account second = a.getId() < b.getId() ? b : a;
    synchronized (first) {
        synchronized (second) {
            a.debit(amount);
            b.credit(amount);
        }
    }
}
```

A **livelock** is worse to diagnose: threads keep changing state in response to each other but never make progress. This often happens with retry logic where both sides back off and retry on the same schedule.

**Starvation** occurs when a thread is perpetually denied access to a resource — for example, a non-fair lock under heavy contention always lets other threads in first. Use `new ReentrantLock(true)` for fair locking when starvation is a concern (at the cost of throughput).

### 10.2 Misusing Virtual Threads

The most common mistakes when adopting virtual threads:

**Mistake 1: Using virtual threads for CPU-bound work.**

```java
// BAD: 10,000 virtual threads all doing CPU-heavy work
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        executor.submit(() -> {
            // This is pure computation — virtual threads add overhead, not scalability
            return fibonacci(1_000_000);
        });
    }
}

// BETTER: fixed pool sized to cores
ExecutorService cpuPool = Executors.newFixedThreadPool(
    Runtime.getRuntime().availableProcessors()
);
```

**Mistake 2: Ignoring pinning.**

```java
// BAD: synchronized + blocking IO = pinned carrier thread
synchronized (cache) {
    var data = remoteService.fetch(key); // blocks while pinned!
    cache.put(key, data);
}

// BETTER: use ReentrantLock
private final ReentrantLock cacheLock = new ReentrantLock();

cacheLock.lock();
try {
    var data = remoteService.fetch(key); // virtual thread unmounts while waiting
    cache.put(key, data);
} finally {
    cacheLock.unlock();
}
```

**Mistake 3: Creating virtual threads without backpressure.**

```java
// BAD: unbounded creation — if messages arrive faster than processing,
// memory grows without bound
while (true) {
    var message = queue.poll();
    if (message != null) {
        Thread.startVirtualThread(() -> process(message));
    }
}

// BETTER: use a semaphore for backpressure
Semaphore permits = new Semaphore(10_000); // max 10k concurrent tasks
while (true) {
    var message = queue.take();
    permits.acquire();
    Thread.startVirtualThread(() -> {
        try {
            process(message);
        } finally {
            permits.release();
        }
    });
}
```

### 10.3 Improper Error and Exception Handling in Concurrent Code

Errors in concurrent tasks are easily lost:

```java
// BAD: exception is silently captured in the Future, never observed
executor.submit(() -> {
    riskyOperation(); // throws RuntimeException
});
// The exception is gone. No log, no alert, nothing.

// BETTER: always observe the Future
Future<?> future = executor.submit(() -> riskyOperation());
try {
    future.get(); // exception surfaces here
} catch (ExecutionException e) {
    logger.error("Task failed", e.getCause());
}
```

With structured concurrency, error handling is built into the scope:

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    scope.fork(() -> taskA());
    scope.fork(() -> taskB());
    scope.join();
    scope.throwIfFailed(); // propagates first failure, cancels the rest
}
```

### 10.4 Unsafe Publication and Visibility Bugs

**Unsafe publication** is when an object is made available to another thread before it is fully constructed:

```java
// DANGEROUS: object may be seen in a partially constructed state
public class Holder {
    private int value;

    public Holder(int value) {
        this.value = value; // write happens in constructor
    }
}

// Thread 1
holder = new Holder(42);

// Thread 2 (without happens-before)
System.out.println(holder.value); // might print 0!
```

**Safe publication techniques**:

- Store the reference in a `volatile` field or `AtomicReference`.
- Store it in a `final` field (the object is safely published via the constructor's happens-before guarantee for `final` fields).
- Store it under a lock (`synchronized` block).
- Store it in a concurrent collection.

<callout variant="important" title="Rule of Thumb">
Make fields `final` wherever possible. Immutable objects published via `final` fields are automatically thread-safe. This single habit prevents the majority of visibility bugs.
</callout>

## 11. Testing, Debugging, and Observability

### 11.1 Unit and Integration Testing Concurrency

Concurrency bugs are notoriously hard to reproduce because they depend on timing, scheduling, and hardware. Testing strategies:

**Test invariants, not interleavings.** Don't try to test specific thread orderings. Instead, submit many concurrent operations and verify the end state is consistent:

```java
@Test
void concurrentDepositsAreConsistent() throws Exception {
    var account = new Account(BigDecimal.ZERO);
    int numThreads = 100;
    var depositAmount = new BigDecimal("10.00");

    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        var latch = new CountDownLatch(1);
        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < numThreads; i++) {
            futures.add(executor.submit(() -> {
                latch.await(); // all threads start simultaneously
                account.deposit(depositAmount);
                return null;
            }));
        }

        latch.countDown(); // release all threads
        for (var future : futures) {
            future.get(5, TimeUnit.SECONDS);
        }
    }

    assertEquals(
        new BigDecimal("1000.00"),
        account.getBalance()
    );
}
```

**Use `CountDownLatch` to coordinate test threads**, not `Thread.sleep()`. Timing-based tests are flaky by nature.

### 11.2 Debugging Threads and Virtual Threads

**Thread dumps** are your primary diagnostic tool. In Java 21+, virtual threads appear in thread dumps taken via `jcmd`:

```bash
jcmd <pid> Thread.dump_to_file -format=json threads.json
```

The JSON format includes virtual thread groupings and their carrier thread assignments. For pinning detection at runtime:

```bash
java -Djdk.tracePinnedThreads=short MyApp
```

This prints a stack trace whenever a virtual thread is pinned during a blocking operation — invaluable for identifying `synchronized` blocks that need to be converted to `ReentrantLock`.

**Give threads meaningful names.** This costs nothing and saves hours during debugging:

```java
Thread.ofVirtual()
    .name("order-processor-", 0) // order-processor-0, order-processor-1, ...
    .factory();
```

### 11.3 Observability and Metrics for Concurrent Systems

Key metrics to monitor in production:

| Metric                              | Why It Matters                                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Platform thread count**           | Sudden increases may indicate pinning or pool misconfiguration                                       |
| **Virtual thread count**            | High counts are normal; correlate with throughput, not as a problem signal                           |
| **Executor queue length**           | Growing queues mean tasks are arriving faster than they're processed                                 |
| **Task completion time (p50, p99)** | Latency degradation signals contention or downstream slowness                                        |
| **Downstream error/timeout rate**   | Concurrency amplifies downstream failures                                                            |
| **CPU utilization**                 | Low CPU + high latency = IO-bound contention; high CPU + high latency = need more cores or less work |

<callout variant="note" title="Don't Panic Over High Virtual Thread Counts">
Seeing 50,000 virtual threads is not a problem. Most of them are parked (waiting on IO), consuming minimal resources. Focus on throughput and latency. If both are healthy, your thread count is fine. If latency is degrading while virtual thread count is high, look at downstream dependencies, connection pools, and lock contention.
</callout>

## 12. Performance Tuning and Design Guidelines

### 12.1 Designing for IO-bound vs CPU-bound Workloads

| Workload Type                     | Thread Strategy                                     | Pool Sizing               |
| --------------------------------- | --------------------------------------------------- | ------------------------- |
| **IO-bound** (HTTP, DB, gRPC)     | Virtual-thread-per-task                             | No explicit sizing needed |
| **CPU-bound** (parsing, math, ML) | Fixed platform thread pool                          | `availableProcessors()`   |
| **Mixed**                         | Virtual threads for IO, offload CPU to bounded pool | CPU pool = core count     |

A common architecture for mixed workloads:

```java
public class MixedWorkloadService {
    private final ExecutorService cpuPool = Executors.newFixedThreadPool(
        Runtime.getRuntime().availableProcessors()
    );

    // Called from a virtual thread (e.g., HTTP request handler)
    public AnalysisResult handleRequest(RawData data) throws Exception {
        // Step 1: IO-bound — fetch enrichment data (runs on virtual thread)
        var enrichment = enrichmentService.fetch(data.getId());

        // Step 2: CPU-bound — offload to CPU pool, block virtual thread
        var result = cpuPool.submit(() -> heavyAnalysis(data, enrichment)).get();

        // Step 3: IO-bound — persist result (runs on virtual thread)
        resultRepository.save(result);
        return result;
    }
}
```

### 12.2 Pool Sizing and Backpressure Strategies

Virtual threads handle IO-bound backpressure naturally (they park when resources are unavailable), but you still need to limit concurrency at system boundaries:

```java
// Limit concurrent calls to a downstream API
Semaphore apiPermits = new Semaphore(50); // max 50 concurrent requests

public ApiResponse callDownstream(ApiRequest request) throws Exception {
    apiPermits.acquire();
    try {
        return httpClient.send(request); // blocking — virtual thread parks
    } finally {
        apiPermits.release();
    }
}
```

For `ThreadPoolExecutor`, choose rejection policies deliberately:

| Policy                | Behavior                               | Use When                                  |
| --------------------- | -------------------------------------- | ----------------------------------------- |
| `AbortPolicy`         | Throws `RejectedExecutionException`    | You want fast failure                     |
| `CallerRunsPolicy`    | Executes task on the submitting thread | Natural backpressure — slows the producer |
| `DiscardPolicy`       | Silently drops the task                | Only for truly optional work              |
| `DiscardOldestPolicy` | Drops the oldest queued task           | Latest data matters more than old data    |

### 12.3 Simplifying with Immutability and Message Passing

The easiest concurrency bugs to fix are the ones you never create. Two techniques that eliminate entire categories of issues:

**Immutable data transfer objects** — use Java records:

```java
// Thread-safe by construction — all fields are final
record OrderEvent(
    String orderId,
    String customerId,
    BigDecimal amount,
    Instant timestamp
) {}

// Safely passed between threads without synchronization
queue.put(new OrderEvent("ORD-123", "CUST-456", new BigDecimal("99.95"), Instant.now()));
```

**Message passing via queues** — threads communicate by sending messages instead of sharing state:

```java
BlockingQueue<OrderEvent> orderQueue = new LinkedBlockingQueue<>(1000);

// Producer (virtual thread)
Thread.startVirtualThread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        var event = receiveFromKafka();
        orderQueue.put(event); // blocks if queue is full — backpressure
    }
});

// Consumer pool (virtual threads)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10; i++) {
        executor.submit(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                var event = orderQueue.take(); // blocks until available
                processOrder(event);
            }
        });
    }
}
```

No shared mutable state. No locks. The `BlockingQueue` handles all synchronization and provides natural backpressure.

## 13. Real-World Case Studies

### 13.1 High-Concurrency REST Service with Virtual Threads

**Scenario**: an order service handling 10,000+ concurrent requests, each requiring a database lookup, a call to a payment API, and a call to an inventory API.

```java
public class OrderController {
    private final OrderRepository orderRepo;
    private final PaymentClient paymentClient;
    private final InventoryClient inventoryClient;
    private final Semaphore paymentPermits = new Semaphore(100); // payment API limit

    public OrderResponse createOrder(OrderRequest request) throws Exception {
        // Validate locally (CPU — trivial)
        validate(request);

        // Fan out to payment and inventory checks in parallel
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
            var paymentCheck = scope.fork(() -> {
                paymentPermits.acquire();
                try {
                    return paymentClient.authorize(request.paymentInfo());
                } finally {
                    paymentPermits.release();
                }
            });
            var inventoryCheck = scope.fork(() ->
                inventoryClient.reserve(request.items())
            );

            scope.join();
            scope.throwIfFailed();

            // Both succeeded — persist the order
            var order = Order.from(request, paymentCheck.get(), inventoryCheck.get());
            orderRepo.save(order); // blocking JDBC

            return OrderResponse.success(order.getId());
        }
    }
}
```

**Design decisions**:

- **Virtual threads** for request-level concurrency — each HTTP request gets its own virtual thread via the server framework.
- **Structured concurrency** for the payment + inventory fan-out — if one fails, the other is cancelled.
- **Semaphore** on the payment API — the payment provider limits concurrent connections; we respect that limit even though we could create more virtual threads.
- **HikariCP connection pool** (not shown) sized to ~50 connections — the database, not the thread count, is the bottleneck.

### 13.2 Batch Data Processing Pipeline

**Scenario**: processing 10 million records from S3, transforming each with CPU-heavy parsing, and writing results to a database.

```java
public class BatchProcessor {
    private final ExecutorService cpuPool = Executors.newFixedThreadPool(
        Runtime.getRuntime().availableProcessors()
    );
    private final Semaphore dbPermits = new Semaphore(50); // DB connection limit
    private final AtomicLong processedCount = new AtomicLong();

    public void processBatch(List<S3ObjectKey> keys) throws Exception {
        try (var ioExecutor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<?>> futures = keys.stream()
                .map(key -> ioExecutor.submit(() -> processFile(key)))
                .toList();

            for (var future : futures) {
                future.get(); // propagate exceptions
            }
        }
        logger.info("Processed {} records", processedCount.get());
    }

    private void processFile(S3ObjectKey key) throws Exception {
        // Step 1: IO-bound — download from S3 (virtual thread parks)
        byte[] data = s3Client.getObject(key);

        // Step 2: CPU-bound — offload heavy parsing to CPU pool
        List<Record> records = cpuPool.submit(() -> parse(data)).get();

        // Step 3: IO-bound — write to DB with concurrency limit
        for (var record : records) {
            dbPermits.acquire();
            try {
                recordRepository.save(transform(record));
                processedCount.incrementAndGet();
            } finally {
                dbPermits.release();
            }
        }
    }
}
```

The key insight: **three different concurrency strategies in one pipeline** — virtual threads for IO (S3 download, DB writes), a fixed pool for CPU (parsing), and a semaphore for backpressure (DB connections).

### 13.3 Background Job Worker for Asynchronous Tasks

**Scenario**: a worker service consuming jobs from Kafka, where each job involves API calls and data enrichment.

```java
public class JobWorker implements AutoCloseable {
    private final ExecutorService cpuPool = Executors.newFixedThreadPool(
        Runtime.getRuntime().availableProcessors()
    );
    private final Semaphore concurrencyLimit = new Semaphore(500);
    private volatile boolean running = true;

    public void run(KafkaConsumer<String, Job> consumer) {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            while (running) {
                var records = consumer.poll(Duration.ofMillis(100));
                for (var record : records) {
                    concurrencyLimit.acquire();
                    executor.submit(() -> {
                        try {
                            processJob(record.value());
                        } catch (Exception e) {
                            logger.error("Job {} failed", record.key(), e);
                            deadLetterQueue.send(record);
                        } finally {
                            concurrencyLimit.release();
                        }
                    });
                }
            }
        }
    }

    private void processJob(Job job) throws Exception {
        // IO-bound: fetch enrichment data
        var enrichment = enrichmentApi.fetch(job.entityId());

        // CPU-bound: offload to bounded pool
        var result = cpuPool.submit(() -> transform(job, enrichment)).get();

        // IO-bound: persist
        resultStore.save(result);
    }

    public void shutdown() {
        running = false;
        cpuPool.shutdown();
    }

    @Override
    public void close() {
        shutdown();
    }
}
```

**Graceful shutdown**: set `running = false`, let in-flight jobs complete (the `concurrencyLimit` semaphore tracks active jobs), then shut down the CPU pool. The `try-with-resources` on the virtual thread executor ensures all submitted tasks finish.

## 14. Summary and Recommended Practices

If you take away one thing from this post, let it be this: **virtual threads change the cost model of threads, not the rules of concurrency**. The Java Memory Model, happens-before, atomicity, and locking are unchanged. What changes is that the right solution — simple, blocking, imperative code — is now also the scalable solution for IO-bound work.

Here is a checklist for modern Java concurrency:

1. **Use virtual threads by default for IO-bound workloads.** Thread-per-request is a sane default again. Configure your server framework to use virtual threads and write blocking code.

2. **Use bounded platform thread pools for CPU-bound work.** Size to `availableProcessors()`. Do not use virtual threads for heavy computation.

3. **Minimize shared mutable state.** Use immutable records, `final` fields, and message passing. Every shared mutable variable is a potential concurrency bug.

4. **Use structured concurrency for fan-out/fan-in.** `StructuredTaskScope` replaces manual `Future` juggling with clear scoping, automatic cancellation, and coherent error handling.

5. **Understand the Java Memory Model.** `volatile`, `synchronized`, and `final` are not optional decorations — they are the mechanisms that make writes visible across threads. Without them, your "working" code has latent bugs.

6. **Replace `synchronized` with `ReentrantLock` when guarding blocking operations.** This prevents virtual thread pinning and is the single most impactful change when migrating to virtual threads.

7. **Add backpressure at system boundaries.** Use semaphores, bounded queues, and connection pools to limit concurrency against downstream dependencies. Virtual threads make it easy to create 100,000 concurrent tasks; your database cannot handle 100,000 concurrent queries.

8. **Monitor thread counts, queue depths, and downstream latencies.** High virtual thread counts are normal. Focus on throughput and latency as health signals.

9. **Never swallow `InterruptedException`.** Re-throw or restore the interrupt flag. Broken interruption breaks shutdown, cancellation, and structured concurrency.

10. **Audit third-party libraries for virtual-thread-friendliness.** Libraries that use `synchronized` around blocking calls, or that assume platform thread identity, can undermine virtual thread benefits. Check documentation and test with `-Djdk.tracePinnedThreads=short`.

## 15. Common Interview Questions

This section covers frequently asked Java threading and concurrency interview questions, ranging from fundamentals to modern Java 21+ topics. Each answer is concise but technically precise — the kind of answer that demonstrates real understanding rather than textbook memorization.

---

### Fundamentals

**Q1: What is the difference between a process and a thread?**

A process is an independent execution unit with its own memory space (heap, stack, file descriptors). Threads exist within a process and share its heap memory, but each thread has its own stack and program counter. Because threads share memory, inter-thread communication is cheaper than inter-process communication — but it also introduces visibility and synchronization challenges that don't exist with processes.

---

**Q2: What are the different ways to create a thread in Java?**

There are three classic approaches and one modern one:

1. **Extend `Thread`** — subclass `Thread` and override `run()`. Inflexible because Java has single inheritance.
2. **Implement `Runnable`** — pass a `Runnable` to the `Thread` constructor. Preferred over extending `Thread` because it separates the task from the threading mechanism.
3. **Implement `Callable<V>`** — like `Runnable` but returns a result and can throw checked exceptions. Submit to an `ExecutorService` and get a `Future<V>` back.
4. **`Thread.ofVirtual().start(runnable)`** (Java 21+) — creates a virtual thread. This is the modern default for IO-bound work.

In practice, you rarely create threads directly. You submit tasks to executors.

---

**Q3: What is the difference between `Runnable` and `Callable`?**

`Runnable.run()` returns `void` and cannot throw checked exceptions. `Callable.call()` returns a value of type `V` and can throw `Exception`. When you need a result or need to propagate checked exceptions from a concurrent task, use `Callable`. When you submit a `Callable` to an `ExecutorService`, you get a `Future<V>` that lets you retrieve the result (blocking if necessary) or check for exceptions.

---

**Q4: What are the different thread states in Java?**

A thread can be in one of six states defined in `Thread.State`:

| State           | Meaning                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| `NEW`           | Created but `start()` not yet called                                                                    |
| `RUNNABLE`      | Executing or ready to execute (includes both "running" and "ready" from the OS perspective)             |
| `BLOCKED`       | Waiting to acquire a monitor lock (e.g., waiting to enter a `synchronized` block)                       |
| `WAITING`       | Waiting indefinitely for another thread — via `Object.wait()`, `Thread.join()`, or `LockSupport.park()` |
| `TIMED_WAITING` | Waiting with a timeout — via `Thread.sleep()`, `Object.wait(timeout)`, `Thread.join(timeout)`           |
| `TERMINATED`    | `run()` has completed (normally or via exception)                                                       |

Note that `RUNNABLE` in Java encompasses both "running on a CPU" and "ready to run but waiting for CPU time." The JVM does not distinguish between the two.

---

**Q5: What is a daemon thread?**

A daemon thread is a background thread that does not prevent the JVM from exiting. When all non-daemon threads have finished, the JVM terminates — and all daemon threads are abruptly stopped without running `finally` blocks. Use `thread.setDaemon(true)` before calling `start()`.

Common uses: garbage collection, monitoring, cleanup tasks. Virtual threads are always daemon threads.

---

**Q6: What does `Thread.join()` do?**

`join()` blocks the calling thread until the target thread terminates. Optionally takes a timeout. It establishes a happens-before relationship: everything the joined thread did before termination is visible to the thread that called `join()` after it returns.

```java
Thread worker = Thread.ofVirtual().start(() -> computeResult());
worker.join(); // blocks until worker finishes
// guaranteed to see everything worker wrote
```

---

### Synchronization and Locking

**Q7: What is the difference between `synchronized` and `ReentrantLock`?**

Both provide mutual exclusion, but `ReentrantLock` offers more control:

| Feature                | `synchronized`                    | `ReentrantLock`                   |
| ---------------------- | --------------------------------- | --------------------------------- |
| Lock acquisition       | Implicit (enter block)            | Explicit (`lock()` / `unlock()`)  |
| Try-lock               | No                                | `tryLock()` with optional timeout |
| Interruptible lock     | No                                | `lockInterruptibly()`             |
| Fairness policy        | No (always unfair)                | Optional fair ordering            |
| Condition variables    | One per monitor (`wait`/`notify`) | Multiple via `newCondition()`     |
| Virtual thread pinning | Yes (pins carrier thread)         | No                                |

The last row is critical for Java 21+: `synchronized` blocks that guard blocking IO operations pin virtual threads to their carrier, eliminating the scalability benefit. Replace with `ReentrantLock` in those cases.

---

**Q8: What is a deadlock? How do you prevent it?**

A deadlock occurs when two or more threads are each waiting for a lock held by the other, forming a circular dependency. No thread can make progress.

```java
// Thread 1: lock A → lock B
// Thread 2: lock B → lock A
// → Deadlock if both acquire their first lock simultaneously
```

Prevention strategies:

- **Lock ordering**: Always acquire locks in a consistent global order. If every thread locks A before B, circular dependencies are impossible.
- **Try-lock with timeout**: Use `tryLock(timeout)` and back off if the lock is not available.
- **Reduce lock scope**: Hold locks for the shortest time possible. Prefer immutable data that needs no locking.
- **Use higher-level concurrency utilities**: `ConcurrentHashMap`, `AtomicReference`, and `StructuredTaskScope` avoid manual locking entirely.

Detection: Use `jstack` or `jcmd Thread.print` to get thread dumps. The JVM detects monitor deadlocks and reports them in the dump.

---

**Q9: What is the difference between `wait()`/`notify()` and `Condition` variables?**

Both are mechanisms for threads to signal each other while holding a lock.

`wait()`/`notify()` are methods on `Object` and work with `synchronized` monitors. Each monitor has exactly one wait set, so if you have multiple conditions to wait on (e.g., "not full" and "not empty" in a bounded buffer), you must use `notifyAll()` and re-check the condition in a loop — which wastes CPU waking threads that cannot proceed.

`Condition` objects (from `Lock.newCondition()`) solve this by letting you create multiple wait sets per lock. A bounded buffer can have a `notFull` condition and a `notEmpty` condition, signaling only the relevant waiters.

```java
private final ReentrantLock lock = new ReentrantLock();
private final Condition notFull = lock.newCondition();
private final Condition notEmpty = lock.newCondition();
```

---

**Q10: What is the `volatile` keyword and when should you use it?**

`volatile` guarantees two things:

1. **Visibility**: A write to a volatile variable is immediately visible to all threads. Without `volatile`, a thread may cache a field value in a register or CPU cache indefinitely.
2. **Ordering**: Reads and writes to volatile variables cannot be reordered by the compiler or CPU past other volatile accesses (it establishes a happens-before edge).

`volatile` does **not** provide atomicity for compound operations. `count++` on a volatile `int` is still a read-modify-write race. For atomic increments, use `AtomicInteger`.

Use `volatile` for simple flags (e.g., a `volatile boolean running` checked in a loop) or for publishing an immutable object reference (where the object itself is safely constructed).

---

**Q11: What are spurious wakeups and how do you handle them?**

A spurious wakeup is when a thread returns from `wait()`, `await()`, or `park()` without being explicitly notified. This is allowed by the POSIX threading specification and by the JVM. The solution is to always call `wait()` inside a loop that checks the condition:

```java
synchronized (lock) {
    while (!conditionMet) {
        lock.wait(); // may wake spuriously
    }
    // condition is guaranteed to be true here
}
```

Never use `if` instead of `while` around `wait()`. This is one of the most common concurrency bugs in Java code.

---

### Thread Pools and Executors

**Q12: What are the main types of thread pools provided by `Executors`?**

| Factory Method                      | Pool Behavior                                                | Use Case                                                                        |
| ----------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `newFixedThreadPool(n)`             | Fixed number of platform threads, unbounded queue            | CPU-bound work or bounded parallelism                                           |
| `newCachedThreadPool()`             | Creates threads on demand, reuses idle threads (60s timeout) | Many short-lived tasks; dangerous for IO-bound work (unbounded thread creation) |
| `newSingleThreadExecutor()`         | Single thread, unbounded queue                               | Sequential task execution with thread confinement                               |
| `newScheduledThreadPool(n)`         | Fixed core threads, supports delayed/periodic tasks          | Timers, periodic cleanup, heartbeats                                            |
| `newVirtualThreadPerTaskExecutor()` | New virtual thread per task, no pooling                      | IO-bound work in Java 21+ (the default choice)                                  |

The virtual-thread-per-task executor is the modern default for IO-bound workloads. You do not pool virtual threads — they are cheap enough to create per task.

---

**Q13: Why should you not use `Executors.newFixedThreadPool()` in production without caution?**

The default `newFixedThreadPool` uses an unbounded `LinkedBlockingQueue`. If tasks are submitted faster than the pool processes them, the queue grows without limit, eventually causing `OutOfMemoryError`. In production, create a `ThreadPoolExecutor` directly with a bounded queue and a rejection policy:

```java
var executor = new ThreadPoolExecutor(
    coreSize, maxSize,
    60, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(1000),
    new ThreadPoolExecutor.CallerRunsPolicy()
);
```

The `CallerRunsPolicy` applies backpressure by making the submitting thread execute the task itself when the queue is full.

---

**Q14: What is the difference between `submit()` and `execute()` on an `ExecutorService`?**

`execute(Runnable)` fires and forgets — if the task throws an exception, it goes to the thread's `UncaughtExceptionHandler` and is otherwise silently lost.

`submit(Callable)` or `submit(Runnable)` returns a `Future`. The exception is captured inside the `Future` and re-thrown when you call `future.get()`. If you never call `get()`, the exception is silently swallowed.

Rule: if you care about the result or exceptions, use `submit()` and always inspect the `Future`. If you use `execute()`, install an `UncaughtExceptionHandler`.

---

**Q15: How do you gracefully shut down a thread pool?**

```java
executor.shutdown();                    // stop accepting new tasks
if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
    executor.shutdownNow();             // interrupt running tasks
    executor.awaitTermination(10, TimeUnit.SECONDS);
}
```

`shutdown()` lets in-flight tasks complete. `shutdownNow()` interrupts running tasks and returns queued tasks that never started. Always call `awaitTermination` after `shutdown` to wait for completion. The two-phase pattern (graceful then forced) is the standard approach.

---

### Java Memory Model

**Q16: What is the Java Memory Model and why does it matter?**

The Java Memory Model (JMM) defines the rules for when writes by one thread are guaranteed to be visible to reads by another thread. Without the JMM, the compiler, JIT, and CPU are free to reorder, cache, and optimize memory operations — meaning one thread's writes may never be seen by another thread, even after the writing thread has finished.

The JMM is built on the **happens-before** relationship. Key happens-before edges:

- Unlock of a monitor → subsequent lock of the same monitor
- Write to a `volatile` field → subsequent read of the same field
- `Thread.start()` → first action in the started thread
- Last action in a thread → `Thread.join()` return in the joining thread
- Write of a `final` field in a constructor → read after the constructor completes

If there is no happens-before path from a write to a read, the read may return any value — including stale, partially constructed, or default values.

---

**Q17: What is the difference between atomicity and visibility?**

**Visibility** means a write by one thread is seen by another thread. Without a happens-before relationship, writes can be invisible — cached in CPU registers or store buffers. `volatile`, `synchronized`, and `final` establish visibility.

**Atomicity** means an operation completes as a single indivisible step. A `volatile` read or write is atomic, but `volatile` compound operations (like `i++`) are not atomic because they involve a read, modify, and write — three separate steps that can be interleaved.

`AtomicInteger.incrementAndGet()` is both visible and atomic because it uses a CAS (compare-and-swap) CPU instruction.

---

**Q18: Can you explain what "happens-before" means with a concrete example?**

```java
// Shared state
volatile boolean ready = false;
int value = 0;

// Thread 1
value = 42;       // (A)
ready = true;     // (B) volatile write

// Thread 2
if (ready) {      // (C) volatile read
    print(value); // (D) guaranteed to print 42
}
```

The volatile write at (B) happens-before the volatile read at (C). Because (A) is sequenced-before (B) in Thread 1, and (C) is sequenced-before (D) in Thread 2, the full chain is: A → B → C → D. Therefore Thread 2 is guaranteed to see `value = 42` — not because `value` is volatile, but because the volatile write/read of `ready` transitively establishes visibility for all preceding writes.

Without the volatile, Thread 2 could see `ready = true` but `value = 0`, because the JVM is free to reorder the writes or cache stale values.

---

### Concurrent Collections and Atomics

**Q19: What is `ConcurrentHashMap` and how does it differ from `Hashtable` and `Collections.synchronizedMap()`?**

All three are thread-safe maps, but with different trade-offs:

- **`Hashtable`** and **`synchronizedMap`**: Coarse-grained locking — every method synchronizes on the entire map. Only one thread can read or write at a time. This is a bottleneck under contention.
- **`ConcurrentHashMap`**: Fine-grained concurrency using lock striping (pre-Java 8) and CAS-based algorithms (Java 8+). Multiple threads can read and write concurrently to different segments. Reads are generally lock-free.

Key differences: `ConcurrentHashMap` does not allow `null` keys or values (to avoid ambiguity with "absent" in concurrent contexts). Its iterators are weakly consistent — they reflect some but not necessarily all modifications made after the iterator was created. It also provides atomic compound operations like `computeIfAbsent()`, `merge()`, and `putIfAbsent()`.

---

**Q20: What are `AtomicInteger`, `AtomicReference`, and when would you use them?**

The `java.util.concurrent.atomic` classes provide lock-free thread-safe operations on single values using CPU compare-and-swap (CAS) instructions.

- **`AtomicInteger` / `AtomicLong`**: Atomic increment, decrement, add, compare-and-set on numeric values. Use for counters, sequence generators, and statistics.
- **`AtomicReference<V>`**: Atomic compare-and-set on object references. Use for lock-free data structures or when you need to atomically swap a reference (e.g., updating a cached config object).
- **`AtomicBoolean`**: Atomic flag operations.
- **`LongAdder`** (Java 8+): Optimized for high-contention counters. Internally stripes across multiple cells to reduce CAS contention. Use instead of `AtomicLong` when many threads increment frequently and you only need the sum occasionally.

```java
// AtomicInteger for a counter
private final AtomicInteger requestCount = new AtomicInteger(0);
requestCount.incrementAndGet(); // atomic, lock-free

// LongAdder for high-contention metrics
private final LongAdder totalBytes = new LongAdder();
totalBytes.add(bytesRead); // low contention per thread
long total = totalBytes.sum(); // slightly stale but fast
```

---

**Q21: What is the difference between `CopyOnWriteArrayList` and `synchronizedList`?**

`CopyOnWriteArrayList` creates a new copy of the underlying array on every mutation (add, set, remove). Reads are lock-free and never block. This makes it ideal for read-heavy workloads with infrequent writes — such as listener lists or configuration that rarely changes.

`synchronizedList` wraps a regular `ArrayList` with synchronized methods. Every read and write acquires the same lock. Iteration requires manual synchronization and is not safe by default.

Trade-off: `CopyOnWriteArrayList` has O(n) write cost and increased memory usage due to copying. If writes are frequent, it performs poorly. Use it only when reads vastly outnumber writes.

---

### Virtual Threads (Java 21+)

**Q22: What are virtual threads and how do they differ from platform threads?**

Virtual threads are lightweight threads managed by the JVM rather than the operating system. Key differences:

| Aspect           | Platform Thread             | Virtual Thread                       |
| ---------------- | --------------------------- | ------------------------------------ |
| Managed by       | OS kernel                   | JVM scheduler                        |
| Memory footprint | ~1 MB stack (pre-allocated) | ~1 KB (grows on demand)              |
| Creation cost    | Expensive (OS syscall)      | Cheap (Java object allocation)       |
| Count limit      | Thousands (OS limit)        | Millions (heap limit)                |
| Scheduling       | OS preemptive               | JVM cooperative (yields on blocking) |
| Thread pool      | Yes — reuse is necessary    | No — create per task                 |
| Daemon           | Configurable                | Always daemon                        |
| `ThreadLocal`    | Fine                        | Discouraged (use `ScopedValue`)      |

When a virtual thread blocks on IO, the JVM unmounts it from its carrier platform thread, allowing the carrier to run another virtual thread. This means blocking code scales like non-blocking code — without the complexity of callbacks or reactive streams.

---

**Q23: What is thread pinning and why is it a problem?**

Pinning occurs when a virtual thread cannot unmount from its carrier platform thread during a blocking operation. This defeats the purpose of virtual threads because it ties up a carrier — essentially reverting to platform thread behavior for that operation.

Two things cause pinning:

1. **`synchronized` blocks or methods** that guard blocking operations (the monitor is tied to the carrier)
2. **Native frames** on the stack (JNI calls)

Detection: Run with `-Djdk.tracePinnedThreads=short` to get stack traces when pinning occurs.

Fix: Replace `synchronized` with `ReentrantLock` for critical sections that contain blocking calls:

```java
// Bad: pins the virtual thread
synchronized (lock) {
    result = httpClient.send(request, handler); // blocking IO
}

// Good: virtual thread can unmount
private final ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    result = httpClient.send(request, handler);
} finally {
    lock.unlock();
}
```

---

**Q24: Should you pool virtual threads?**

No. Virtual threads are cheap to create (they are just Java objects) and are garbage-collected when done. Pooling them would add unnecessary overhead and complexity. Use `Executors.newVirtualThreadPerTaskExecutor()` and create a new virtual thread for every task.

However, you still need to limit concurrency against downstream resources. Use a `Semaphore` to cap how many virtual threads can access a database or external API concurrently — this is backpressure, not pooling.

```java
private final Semaphore dbPermits = new Semaphore(50);

void handleRequest() {
    dbPermits.acquire();
    try {
        db.query(...); // at most 50 concurrent queries
    } finally {
        dbPermits.release();
    }
}
```

---

**Q25: What is `ScopedValue` and why is it preferred over `ThreadLocal` for virtual threads?**

`ThreadLocal` stores per-thread data using the thread's identity. With virtual threads, you may create millions of threads — each with its own `ThreadLocal` copy, leading to high memory usage. `ThreadLocal` values also leak if not explicitly removed, and their mutability makes reasoning about concurrent behavior harder.

`ScopedValue` (preview in Java 21+) is an immutable, scoped alternative:

- Bound for the duration of a `Runnable` via `ScopedValue.where(KEY, value).run(() -> ...)`
- Automatically unbound when the scope exits (no cleanup needed)
- Inherited by child threads in structured concurrency scopes
- Immutable within the scope — no `set()` method

```java
private static final ScopedValue<User> CURRENT_USER = ScopedValue.newInstance();

ScopedValue.where(CURRENT_USER, authenticatedUser).run(() -> {
    handleRequest(); // CURRENT_USER.get() returns authenticatedUser
});
```

---

### Structured Concurrency

**Q26: What is structured concurrency and what problem does it solve?**

Structured concurrency ensures that the lifetime of concurrent tasks is bounded by a lexical scope — similar to how structured programming bounded control flow with blocks instead of `goto`.

The problem: with unstructured concurrency (`ExecutorService.submit()`), a submitted task's lifetime is independent of the code that submitted it. This leads to:

- Tasks that outlive their parent, leaking resources
- Forgotten `Future`s whose exceptions are silently lost
- Complex cancellation logic (cancel task A if task B fails)
- Thread dumps that show no relationship between parent and child tasks

`StructuredTaskScope` (Java 21+ preview) fixes this:

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<User> user = scope.fork(() -> fetchUser(id));
    Subtask<Order> order = scope.fork(() -> fetchOrder(id));

    scope.join();           // wait for both
    scope.throwIfFailed();  // propagate first failure

    return combine(user.get(), order.get());
}
// scope.close() cancels any incomplete tasks
```

If either subtask fails, the other is cancelled automatically. If the parent thread is interrupted, both subtasks are cancelled. The `try-with-resources` guarantees cleanup.

---

**Q27: What is the difference between `ShutdownOnFailure` and `ShutdownOnSuccess`?**

Both are policies for `StructuredTaskScope`:

- **`ShutdownOnFailure`**: Waits for all subtasks to succeed. If any subtask fails, cancels the remaining subtasks immediately. Use when you need all results (fan-out/fan-in).

- **`ShutdownOnSuccess<T>`**: Returns as soon as any subtask succeeds, cancelling the rest. Use when you want the first successful result (racing pattern — e.g., querying multiple replicas and taking the fastest response).

```java
// Race: first successful response wins
try (var scope = new StructuredTaskScope.ShutdownOnSuccess<String>()) {
    scope.fork(() -> queryReplica1());
    scope.fork(() -> queryReplica2());
    scope.fork(() -> queryReplica3());

    scope.join();
    return scope.result(); // fastest successful result
}
```

---

### CompletableFuture

**Q28: What is `CompletableFuture` and how does it differ from `Future`?**

`Future` (Java 5) represents a pending result but only supports blocking retrieval via `get()`. You cannot compose futures, chain callbacks, or combine results without blocking a thread.

`CompletableFuture` (Java 8) adds a full asynchronous pipeline API:

- **Chaining**: `thenApply`, `thenCompose`, `thenAccept` — transform results without blocking
- **Combining**: `thenCombine`, `allOf`, `anyOf` — merge multiple futures
- **Error handling**: `exceptionally`, `handle`, `whenComplete` — inline error recovery
- **Async control**: Each operation has an `*Async` variant that runs on a different thread

```java
CompletableFuture.supplyAsync(() -> fetchUser(id))
    .thenCompose(user -> fetchOrders(user.id()))
    .thenApply(orders -> summarize(orders))
    .exceptionally(ex -> fallbackSummary())
    .thenAccept(summary -> respond(summary));
```

With virtual threads in Java 21+, the need for `CompletableFuture` is reduced. Blocking code on virtual threads is simpler and achieves the same scalability without the callback complexity. Use `CompletableFuture` when you genuinely need asynchronous composition; otherwise, prefer blocking code on virtual threads with structured concurrency.

---

### Common Pitfalls

**Q29: What is a race condition? Give an example.**

A race condition occurs when the correctness of a program depends on the relative timing of operations in different threads. The result is non-deterministic and may only fail under specific interleaving.

Classic example — check-then-act:

```java
// Thread 1 and Thread 2 both run this
if (!map.containsKey(key)) {   // check
    map.put(key, compute());   // act
}
```

Both threads can see the key as absent, both compute and insert, and the second overwrites the first. Fix: use `map.computeIfAbsent(key, k -> compute())`, which is atomic on `ConcurrentHashMap`.

---

**Q30: What is the difference between a deadlock, a livelock, and starvation?**

- **Deadlock**: Threads are permanently blocked, each waiting for a lock held by the other. No progress is possible. Detected by the JVM in thread dumps.

- **Livelock**: Threads are not blocked — they keep executing — but they keep responding to each other in a way that prevents progress. Like two people in a hallway who keep stepping aside in the same direction. Unlike deadlock, threads are active but unproductive.

- **Starvation**: A thread is perpetually denied access to a resource because other threads keep acquiring it first. Common with unfair locks under high contention. A low-priority thread may starve if high-priority threads monopolize the lock. Fix with fair locks (`new ReentrantLock(true)`) or fair semaphores.

---

**Q31: Why should you never swallow `InterruptedException`?**

`InterruptedException` is a cooperative cancellation signal. When a thread is interrupted while waiting (`sleep`, `wait`, `join`, `Lock.lockInterruptibly`), the JVM throws `InterruptedException` and clears the interrupt flag.

If you catch it and do nothing:

```java
// WRONG — swallows the cancellation signal
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    // silently ignored
}
```

The calling code never knows the thread was interrupted. Shutdown hooks, `StructuredTaskScope` cancellation, and `Future.cancel(true)` all rely on interruption. Swallowing it breaks all of them.

Correct approaches:

1. **Propagate it**: Declare `throws InterruptedException` and let the caller handle it.
2. **Restore the flag**: Call `Thread.currentThread().interrupt()` so the next blocking call will throw.

---

**Q32: What is a `ThreadLocal` and what are its pitfalls?**

`ThreadLocal<T>` gives each thread its own copy of a variable. A common use case is storing per-request context (user, transaction ID) without passing it through every method.

Pitfalls:

1. **Memory leaks in thread pools**: Thread pool threads live long. If you set a `ThreadLocal` and forget to call `remove()` after the task, the value persists for the next task on that thread — leaking memory and potentially leaking data between requests.
2. **High memory with virtual threads**: Millions of virtual threads means millions of `ThreadLocal` copies. Use `ScopedValue` instead.
3. **Hidden coupling**: `ThreadLocal` is implicit state, making code harder to test and reason about.

Always clean up with `try/finally`:

```java
MY_CONTEXT.set(value);
try {
    doWork();
} finally {
    MY_CONTEXT.remove();
}
```

---

**Q33: What is the `ForkJoinPool` and how does it differ from a regular thread pool?**

`ForkJoinPool` is designed for recursive divide-and-conquer tasks. It uses a **work-stealing** algorithm: each thread has its own deque of tasks, and idle threads steal tasks from the tail of busy threads' deques. This keeps all threads active without centralized task scheduling.

Key differences from `ThreadPoolExecutor`:

- Optimized for tasks that spawn subtasks (`fork()` / `join()`)
- Work-stealing reduces contention on a shared queue
- `ForkJoinPool.commonPool()` is the default pool used by parallel streams and `CompletableFuture`
- Best for CPU-bound recursive work (merge sort, tree traversal, image processing)

`ForkJoinPool.commonPool()` is sized to `availableProcessors() - 1` by default. Do not use it for blocking IO — it will starve all parallel streams and async operations in the JVM.

---

**Q34: What is the `CountDownLatch` and how does it differ from `CyclicBarrier`?**

Both coordinate threads, but with different semantics:

**`CountDownLatch`**: One-shot countdown. Initialize with a count, threads call `countDown()` to decrement, and waiting threads block on `await()` until the count reaches zero. Cannot be reset. Use case: "wait until N initialization tasks complete before starting the main work."

**`CyclicBarrier`**: Reusable rendezvous point. N threads call `await()`, and all block until all N have arrived — then all proceed. Can be reset and reused for the next round. Use case: "all threads must finish phase 1 before any thread starts phase 2."

```java
// CountDownLatch: main thread waits for 3 services to initialize
var latch = new CountDownLatch(3);
for (var service : services) {
    executor.submit(() -> { service.init(); latch.countDown(); });
}
latch.await(); // blocks until all 3 services are ready

// CyclicBarrier: 4 threads synchronize at the end of each iteration
var barrier = new CyclicBarrier(4);
// each thread:
while (running) {
    doPhaseWork();
    barrier.await(); // wait for all 4 threads
}
```

---

**Q35: How do you handle exceptions in a multi-threaded application?**

It depends on the concurrency mechanism:

1. **`ExecutorService.submit()`**: Exceptions are captured in the `Future`. Call `future.get()` to retrieve (or re-throw) them. If you never call `get()`, exceptions are silently lost.

2. **`StructuredTaskScope`**: `throwIfFailed()` re-throws the first exception from any subtask. This is the cleanest model.

3. **`CompletableFuture`**: Use `exceptionally()`, `handle()`, or `whenComplete()` to process exceptions inline.

4. **`Thread.setUncaughtExceptionHandler()`**: Last resort for threads not using executors. Set per-thread or set a default via `Thread.setDefaultUncaughtExceptionHandler()`.

5. **`ThreadPoolExecutor`**: Override `afterExecute(Runnable, Throwable)` to log exceptions from `execute()` calls.

General rule: never let exceptions vanish. Log them, propagate them, or handle them — but never silently catch and ignore.

---

**Q36: What is the `ReadWriteLock` and when should you use it?**

`ReadWriteLock` (typically `ReentrantReadWriteLock`) allows multiple concurrent readers but exclusive writers. The read lock and write lock are mutually exclusive: a write lock blocks all readers and other writers, but multiple threads can hold the read lock simultaneously.

Use when reads significantly outnumber writes and reads are non-trivial (expensive enough that parallelism helps). If reads are trivial or writes are frequent, the overhead of the read-write lock may be worse than a simple `ReentrantLock`.

```java
private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
private Map<String, Config> cache = new HashMap<>();

Config read(String key) {
    rwLock.readLock().lock();
    try { return cache.get(key); }
    finally { rwLock.readLock().unlock(); }
}

void update(Map<String, Config> newCache) {
    rwLock.writeLock().lock();
    try { cache = newCache; }
    finally { rwLock.writeLock().unlock(); }
}
```

---

**Q37: What is a `Semaphore` and how does it differ from a lock?**

A lock provides mutual exclusion: only one thread can hold it. A `Semaphore` manages a set of permits: up to N threads can acquire permits concurrently. When all permits are taken, subsequent threads block until a permit is released.

Use cases:

- **Rate limiting**: Cap concurrent access to a database connection pool
- **Backpressure**: Limit how many virtual threads hit a downstream service
- **Resource pools**: Control access to a fixed number of resources

```java
Semaphore permits = new Semaphore(10); // 10 concurrent operations

void accessResource() throws InterruptedException {
    permits.acquire();
    try {
        useResource();
    } finally {
        permits.release();
    }
}
```

A binary semaphore (permits = 1) behaves like a lock, but unlike `ReentrantLock`, it is not reentrant — the same thread cannot acquire it twice without deadlocking.

---

**Q38: What is the `Phaser` and when would you use it over `CyclicBarrier`?**

`Phaser` is a more flexible barrier that supports:

- **Dynamic registration**: Parties can register and deregister at any time, unlike `CyclicBarrier` which has a fixed party count
- **Multiple phases**: Each `arriveAndAwaitAdvance()` advances to the next phase
- **Arrival without waiting**: `arrive()` signals completion without blocking
- **Termination**: Override `onAdvance()` to conditionally terminate the phaser

Use `Phaser` when the number of participating threads changes across phases, or when you need more control than `CyclicBarrier` provides.

---

**Q39: How do parallel streams interact with the `ForkJoinPool`?**

Parallel streams use `ForkJoinPool.commonPool()` by default, which is shared across the entire JVM. This has implications:

1. **Contention**: If multiple parts of your application use parallel streams, they compete for the same pool threads.
2. **Blocking is dangerous**: If a parallel stream operation blocks (database call, HTTP request), it starves the common pool, affecting all parallel streams and `CompletableFuture.supplyAsync()` calls.
3. **Pool size**: Defaults to `Runtime.getRuntime().availableProcessors() - 1`.

To use a custom pool:

```java
ForkJoinPool customPool = new ForkJoinPool(4);
customPool.submit(() ->
    myList.parallelStream()
          .map(this::transform)
          .collect(Collectors.toList())
).get();
```

In Java 21+, prefer virtual threads for IO-bound parallelism instead of parallel streams.

---

**Q40: What are the key differences between `synchronized`, `volatile`, `Atomic*`, and `Lock`?**

| Mechanism       | Mutual Exclusion | Visibility |     Atomicity     |  Blocking  | Use Case                                                        |
| --------------- | :--------------: | :--------: | :---------------: | :--------: | --------------------------------------------------------------- |
| `synchronized`  |       Yes        |    Yes     |  Yes (for block)  |    Yes     | General-purpose critical sections                               |
| `volatile`      |        No        |    Yes     | Only reads/writes |     No     | Simple flags, published references                              |
| `Atomic*`       |        No        |    Yes     |     Yes (CAS)     | No (spins) | Counters, lock-free algorithms                                  |
| `ReentrantLock` |       Yes        |    Yes     |  Yes (for block)  |    Yes     | When you need tryLock, fairness, or virtual-thread-friendliness |

Choose the lightest mechanism that provides the guarantees you need. If you only need visibility, use `volatile`. If you need atomic increment, use `AtomicInteger`. If you need mutual exclusion with blocking IO on virtual threads, use `ReentrantLock`. Reserve `synchronized` for simple cases where pinning is not a concern.
