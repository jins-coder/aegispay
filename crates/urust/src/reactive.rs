use std::cell::RefCell;
use std::collections::HashSet;
use std::rc::Rc;

thread_local! {
    static RUNTIME: RefCell<ReactiveRuntime> = RefCell::new(ReactiveRuntime::new());
}

struct ReactiveRuntime {
    current_effect: Option<usize>,
    effects: Vec<Option<Rc<RefCell<dyn FnMut()>>>>,
    signals: Vec<SignalRecord>,
    batch_depth: usize,
    pending_effects: HashSet<usize>,
}

struct SignalRecord {
    subscribers: HashSet<usize>,
}

impl ReactiveRuntime {
    fn new() -> Self {
        Self {
            current_effect: None,
            effects: Vec::new(),
            signals: Vec::new(),
            batch_depth: 0,
            pending_effects: HashSet::new(),
        }
    }

    fn register_signal(&mut self) -> usize {
        let id = self.signals.len();
        self.signals.push(SignalRecord {
            subscribers: HashSet::new(),
        });
        id
    }

    fn track(&mut self, signal_id: usize) {
        if let Some(effect_id) = self.current_effect {
            if signal_id < self.signals.len() {
                self.signals[signal_id].subscribers.insert(effect_id);
            }
        }
    }

    fn trigger(&mut self, signal_id: usize) {
        if signal_id >= self.signals.len() {
            return;
        }

        let subs = self.signals[signal_id].subscribers.clone();
        for effect_id in subs {
            if self.batch_depth > 0 {
                self.pending_effects.insert(effect_id);
            } else {
                self.run_effect(effect_id);
            }
        }
    }

    fn run_effect(&mut self, effect_id: usize) {
        if effect_id >= self.effects.len() {
            return;
        }

        if let Some(effect_rc) = self.effects[effect_id].clone() {
            let prev = self.current_effect;
            self.current_effect = Some(effect_id);
            
            // Execute effect
            if let Ok(mut effect) = effect_rc.try_borrow_mut() {
                effect();
            }

            self.current_effect = prev;
        }
    }

    fn start_batch(&mut self) {
        self.batch_depth += 1;
    }

    fn end_batch(&mut self) {
        if self.batch_depth > 0 {
            self.batch_depth -= 1;
            if self.batch_depth == 0 {
                let pending = std::mem::take(&mut self.pending_effects);
                for effect_id in pending {
                    self.run_effect(effect_id);
                }
            }
        }
    }
}

/// A read-only handle to a reactive signal
#[derive(Clone)]
pub struct ReadSignal<T: 'static> {
    id: usize,
    value: Rc<RefCell<T>>,
}

/// A write-only handle to a reactive signal
#[derive(Clone)]
pub struct WriteSignal<T: 'static> {
    id: usize,
    value: Rc<RefCell<T>>,
}

/// Create a fine-grained reactive state signal
pub fn create_signal<T: Clone + 'static>(initial_value: T) -> (ReadSignal<T>, WriteSignal<T>) {
    let id = RUNTIME.with(|rt| rt.borrow_mut().register_signal());
    let value = Rc::new(RefCell::new(initial_value));

    (
        ReadSignal {
            id,
            value: value.clone(),
        },
        WriteSignal { id, value },
    )
}

impl<T: Clone + 'static> ReadSignal<T> {
    /// Read the signal value and track current effect dependency
    pub fn get(&self) -> T {
        RUNTIME.with(|rt| rt.borrow_mut().track(self.id));
        self.value.borrow().clone()
    }

    /// Read without cloning by executing a closure
    pub fn with<R, F: FnOnce(&T) -> R>(&self, f: F) -> R {
        RUNTIME.with(|rt| rt.borrow_mut().track(self.id));
        f(&self.value.borrow())
    }

    /// Peek the value without subscribing to reactivity
    pub fn peek(&self) -> T {
        self.value.borrow().clone()
    }
}

impl<T: 'static> WriteSignal<T> {
    /// Set a new value and trigger all dependent effects
    pub fn set(&self, new_val: T) {
        *self.value.borrow_mut() = new_val;
        RUNTIME.with(|rt| rt.borrow_mut().trigger(self.id));
    }

    /// Mutate the value via a function and trigger reactivity
    pub fn update<F: FnOnce(&mut T)>(&self, f: F) {
        f(&mut *self.value.borrow_mut());
        RUNTIME.with(|rt| rt.borrow_mut().trigger(self.id));
    }
}

/// Register a reactive effect that automatically re-runs when its tracked signals change
pub fn create_effect<F: FnMut() + 'static>(f: F) {
    let effect_rc: Rc<RefCell<dyn FnMut()>> = Rc::new(RefCell::new(f));
    let effect_id = RUNTIME.with(|rt| {
        let mut rt = rt.borrow_mut();
        let id = rt.effects.len();
        rt.effects.push(Some(effect_rc.clone()));
        id
    });

    RUNTIME.with(|rt| {
        rt.borrow_mut().run_effect(effect_id);
    });
}

/// Create a derived memoized computed value that updates only when dependencies change
pub fn create_memo<T: Clone + PartialEq + 'static, F: Fn() -> T + 'static>(f: F) -> ReadSignal<T> {
    let (read, write) = create_signal(f());
    let calc = Rc::new(f);
    let read_clone = read.clone();

    create_effect({
        let calc = calc.clone();
        move || {
            let next = calc();
            if read_clone.peek() != next {
                write.set(next);
            }
        }
    });

    read
}

/// Batch multiple signal updates together so effects trigger only once
pub fn batch<F: FnOnce()>(f: F) {
    RUNTIME.with(|rt| rt.borrow_mut().start_batch());
    f();
    RUNTIME.with(|rt| rt.borrow_mut().end_batch());
}
