use crate::dom::document;
use crate::reactive::create_effect;
use web_sys::Element;

/// Declarative reactive conditional rendering
pub fn show<C: Fn() -> bool + 'static, V: Fn() -> Element + 'static>(condition: C, view: V) -> Element {
    let container = document().create_element("div").unwrap();
    let container_el = container.clone();

    create_effect(move || {
        container_el.set_inner_html("");
        if condition() {
            let child = view();
            let _ = container_el.append_child(&child);
        }
    });

    container
}

/// Declarative reactive conditional with fallback
pub fn show_fallback<
    C: Fn() -> bool + 'static,
    V: Fn() -> Element + 'static,
    F: Fn() -> Element + 'static,
>(
    condition: C,
    view: V,
    fallback: F,
) -> Element {
    let container = document().create_element("div").unwrap();
    let container_el = container.clone();

    create_effect(move || {
        container_el.set_inner_html("");
        if condition() {
            let child = view();
            let _ = container_el.append_child(&child);
        } else {
            let child = fallback();
            let _ = container_el.append_child(&child);
        }
    });

    container
}

/// Declarative reactive list rendering
pub fn for_each<T: Clone + 'static, L: Fn() -> Vec<T> + 'static, R: Fn(T) -> Element + 'static>(
    list_fn: L,
    render_fn: R,
) -> Element {
    let container = document().create_element("div").unwrap();
    let container_el = container.clone();

    create_effect(move || {
        container_el.set_inner_html("");
        let items = list_fn();
        for item in items {
            let item_el = render_fn(item);
            let _ = container_el.append_child(&item_el);
        }
    });

    container
}
