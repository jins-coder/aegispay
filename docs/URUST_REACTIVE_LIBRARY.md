# 🦀 urust — Fine-Grained Reactive Web Framework for Rust WASM

`urust` is a lightweight, zero-virtual-DOM, fine-grained reactive UI library written in 100% pure Rust for WebAssembly applications.

---

## 🚀 Core Primitives

### 1. Fine-Grained Signals
```rust
use urust::*;

// Create reactive state
let (count, set_count) = create_signal(0);

// Read value (automatically tracks active effects)
let current = count.get();

// Mutate value (triggers only dependent DOM nodes)
set_count.set(current + 1);
```

### 2. Auto-Tracking Effects
```rust
create_effect(move || {
    println!("Count updated to: {}", count.get());
});
```

### 3. Memoized Computations
```rust
let is_even = create_memo(move || count.get() % 2 == 0);
```

### 4. Declarative Reactive DOM Builders
```rust
let app = el("div")
    .class("container")
    .child(el("h1").text("AegisPay"))
    .child(
        el("button")
            .class("btn-primary")
            .dyn_text(move || format!("Clicks: {}", count.get()))
            .on_click(move |_| set_count.update(|c| *c += 1))
    );

mount_to_body(&app.build());
```

### 5. Reactive Control Flow (`show`, `for_each`)
```rust
// Conditional Rendering
let view = show(
    move || is_authenticated.get(),
    move || el("div").text("Welcome Back!").build()
);

// Reactive List Rendering
let list_view = el("ul").child(
    for_each(
        move || transactions.get(),
        |tx| el("li").text(&format!("{}: {} {}", tx.tx_hash, tx.amount_decimal, tx.asset_id)).build()
    )
);
```

---

## 📦 Crates Overview in AegisPay

| Crate | Target | Role |
| :--- | :--- | :--- |
| `crates/urust` | `wasm32` / Native | Pure Rust Reactive UI Engine (Signals, DOM, Async HTTP) |
| `crates/customer-portal-rs` | `wasm32-unknown-unknown` | Customer Merchant Portal UI in WebAssembly |
| `crates/operations-console-rs` | `wasm32-unknown-unknown` | Security Operations Console UI in WebAssembly |
| `crates/aegispay-core` | Native / WASM | In-memory double-entry balanced ledger (`u128` atomic math) |
| `crates/aegispay-server` | Native (`Axum` + `Tokio`) | Standalone server embedding WASM frontends and hosting APIs |
