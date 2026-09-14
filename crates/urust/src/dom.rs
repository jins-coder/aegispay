use crate::reactive::create_effect;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{Document, Element, Event, HtmlElement, HtmlInputElement, Node, Window};

pub fn window() -> Window {
    web_sys::window().expect("global window object exists")
}

pub fn document() -> Document {
    window().document().expect("document on window exists")
}

pub fn mount_to_body(element: &Element) {
    let body = document().body().expect("document body exists");
    body.append_child(element).expect("failed to mount element to body");
}

pub fn mount_to_id(id: &str, element: &Element) {
    let container = document()
        .get_element_by_id(id)
        .unwrap_or_else(|| document().body().expect("document body exists").into());
    container.append_child(element).expect("failed to mount element to container");
}

/// Dynamic reactive element builder
pub struct ElementBuilder {
    element: Element,
}

/// Create a new DOM element builder
pub fn el(tag: &str) -> ElementBuilder {
    let element = document()
        .create_element(tag)
        .expect("failed to create element");
    ElementBuilder { element }
}

impl ElementBuilder {
    /// Set a static attribute
    pub fn attr(self, name: &str, value: &str) -> Self {
        self.element.set_attribute(name, value).unwrap();
        self
    }

    /// Bind an attribute dynamically to a reactive closure
    pub fn dyn_attr<F: Fn() -> String + 'static>(self, name: &'static str, f: F) -> Self {
        let el = self.element.clone();
        create_effect(move || {
            let val = f();
            let _ = el.set_attribute(name, &val);
        });
        self
    }

    /// Add a CSS class name
    pub fn class(self, class_name: &str) -> Self {
        self.element.class_list().add_1(class_name).unwrap();
        self
    }

    /// Dynamically toggle a CSS class based on a reactive condition
    pub fn dyn_class<F: Fn() -> bool + 'static>(self, class_name: &'static str, condition: F) -> Self {
        let el = self.element.clone();
        create_effect(move || {
            if condition() {
                let _ = el.class_list().add_1(class_name);
            } else {
                let _ = el.class_list().remove_1(class_name);
            }
        });
        self
    }

    /// Set an inline CSS style property
    pub fn style(self, property: &str, value: &str) -> Self {
        if let Ok(html_el) = self.element.clone().dyn_into::<HtmlElement>() {
            let _ = html_el.style().set_property(property, value);
        }
        self
    }

    /// Dynamically set an inline CSS style property from a reactive signal
    pub fn dyn_style<F: Fn() -> String + 'static>(self, property: &'static str, f: F) -> Self {
        let el = self.element.clone();
        create_effect(move || {
            if let Ok(html_el) = el.clone().dyn_into::<HtmlElement>() {
                let _ = html_el.style().set_property(property, &f());
            }
        });
        self
    }

    /// Append static text content
    pub fn text(self, text_content: &str) -> Self {
        let text_node = document().create_text_node(text_content);
        self.element.append_child(&text_node).unwrap();
        self
    }

    /// Dynamically update text content from a reactive closure (fine-grained text node)
    pub fn dyn_text<F: Fn() -> String + 'static>(self, f: F) -> Self {
        let text_node = document().create_text_node("");
        self.element.append_child(&text_node).unwrap();

        let node = text_node.clone();
        create_effect(move || {
            node.set_node_value(Some(&f()));
        });
        self
    }

    /// Set inner HTML directly
    pub fn html(self, raw_html: &str) -> Self {
        self.element.set_inner_html(raw_html);
        self
    }

    /// Dynamically update inner HTML from a reactive closure
    pub fn dyn_html<F: Fn() -> String + 'static>(self, f: F) -> Self {
        let el = self.element.clone();
        create_effect(move || {
            el.set_inner_html(&f());
        });
        self
    }

    /// Append a child node/element
    pub fn child(self, child_element: impl AsRef<Node>) -> Self {
        self.element.append_child(child_element.as_ref()).unwrap();
        self
    }

    /// Append multiple children
    pub fn children(self, children: impl IntoIterator<Item = impl AsRef<Node>>) -> Self {
        for child in children {
            self.element.append_child(child.as_ref()).unwrap();
        }
        self
    }

    /// Attach an event listener
    pub fn on<E: 'static, F: FnMut(E) + 'static>(self, event_name: &str, mut handler: F) -> Self
    where
        E: JsCast,
    {
        let closure = Closure::wrap(Box::new(move |event: Event| {
            if let Ok(typed_event) = event.dyn_into::<E>() {
                handler(typed_event);
            }
        }) as Box<dyn FnMut(Event)>);

        self.element
            .add_event_listener_with_callback(event_name, closure.as_ref().unchecked_ref())
            .unwrap();
        closure.forget();
        self
    }

    /// Convenience: attach a click event listener
    pub fn on_click<F: FnMut(web_sys::MouseEvent) + 'static>(self, handler: F) -> Self {
        self.on("click", handler)
    }

    /// Convenience: attach an input change event listener with the current input value string
    pub fn on_input<F: FnMut(String) + 'static>(self, mut handler: F) -> Self {
        let closure = Closure::wrap(Box::new(move |event: Event| {
            if let Some(target) = event.target() {
                if let Ok(input) = target.dyn_into::<HtmlInputElement>() {
                    handler(input.value());
                }
            }
        }) as Box<dyn FnMut(Event)>);

        self.element
            .add_event_listener_with_callback("input", closure.as_ref().unchecked_ref())
            .unwrap();
        closure.forget();
        self
    }

    /// Finalize and return the raw web_sys::Element
    pub fn build(self) -> Element {
        self.element
    }
}

impl AsRef<Node> for ElementBuilder {
    fn as_ref(&self) -> &Node {
        self.element.as_ref()
    }
}

impl From<ElementBuilder> for Element {
    fn from(builder: ElementBuilder) -> Self {
        builder.build()
    }
}
