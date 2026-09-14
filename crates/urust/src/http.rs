use serde::de::DeserializeOwned;
use serde::Serialize;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};

pub fn spawn<F: std::future::Future<Output = ()> + 'static>(future: F) {
    wasm_bindgen_futures::spawn_local(future);
}

pub async fn fetch_json<T: DeserializeOwned>(url: &str) -> Result<T, String> {
    let opts = RequestInit::new();
    opts.set_method("GET");
    opts.set_mode(RequestMode::Cors);

    let request = Request::new_with_str_and_init(url, &opts)
        .map_err(|e| format!("Failed to create request: {:?}", e))?;

    let window = web_sys::window().ok_or("No window")?;
    let resp_value = JsFuture::from(window.fetch_with_request(&request))
        .await
        .map_err(|e| format!("Fetch error: {:?}", e))?;

    let resp: Response = resp_value.dyn_into().map_err(|e| format!("{:?}", e))?;
    if !resp.ok() {
        return Err(format!("HTTP error status: {}", resp.status()));
    }

    let text_val = JsFuture::from(resp.text().map_err(|e| format!("{:?}", e))?)
        .await
        .map_err(|e| format!("{:?}", e))?;

    let text_str = text_val.as_string().ok_or("Invalid text response")?;
    serde_json::from_str(&text_str).map_err(|e| format!("JSON parse error: {:?}", e))
}

pub async fn post_json<B: Serialize, T: DeserializeOwned>(url: &str, body: &B) -> Result<T, String> {
    let body_str = serde_json::to_string(body).map_err(|e| format!("Serialize error: {:?}", e))?;

    let opts = RequestInit::new();
    opts.set_method("POST");
    opts.set_mode(RequestMode::Cors);
    opts.set_body(&wasm_bindgen::JsValue::from_str(&body_str));

    let request = Request::new_with_str_and_init(url, &opts)
        .map_err(|e| format!("Failed to create request: {:?}", e))?;

    request
        .headers()
        .set("Content-Type", "application/json")
        .map_err(|e| format!("{:?}", e))?;

    let window = web_sys::window().ok_or("No window")?;
    let resp_value = JsFuture::from(window.fetch_with_request(&request))
        .await
        .map_err(|e| format!("Fetch error: {:?}", e))?;

    let resp: Response = resp_value.dyn_into().map_err(|e| format!("{:?}", e))?;
    if !resp.ok() {
        return Err(format!("HTTP error status: {}", resp.status()));
    }

    let text_val = JsFuture::from(resp.text().map_err(|e| format!("{:?}", e))?)
        .await
        .map_err(|e| format!("{:?}", e))?;

    let text_str = text_val.as_string().ok_or("Invalid text response")?;
    serde_json::from_str(&text_str).map_err(|e| format!("JSON parse error: {:?}", e))
}
