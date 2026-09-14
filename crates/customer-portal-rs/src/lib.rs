use serde::{Deserialize, Serialize};
use std::rc::Rc;
use urust::*;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BalanceItem {
    #[serde(rename = "assetId")]
    pub asset_id: String,
    pub symbol: String,
    #[serde(rename = "fundingDecimal")]
    pub funding_decimal: String,
    #[serde(rename = "tradingDecimal")]
    pub trading_decimal: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EnsureAddressResponse {
    pub address: String,
    #[serde(rename = "networkId")]
    pub network_id: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TransactionItem {
    pub id: String,
    #[serde(rename = "txHash")]
    pub tx_hash: String,
    #[serde(rename = "networkId")]
    pub network_id: String,
    #[serde(rename = "assetId")]
    pub asset_id: String,
    #[serde(rename = "amountDecimal")]
    pub amount_decimal: String,
    pub direction: String,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

#[derive(Serialize)]
struct LoginPayload<'a> {
    email: &'a str,
}

#[derive(Deserialize)]
struct LoginResponse {
    user: UserInfo,
    #[serde(rename = "apiKey")]
    api_key: String,
}

#[derive(Deserialize)]
struct UserInfo {
    email: String,
    name: String,
}

#[derive(Serialize)]
struct EnsureAddressPayload<'a> {
    #[serde(rename = "networkId")]
    network_id: &'a str,
}

#[derive(Serialize)]
struct SimulateDepositPayload<'a> {
    #[serde(rename = "networkId")]
    network_id: &'a str,
    #[serde(rename = "assetId")]
    asset_id: &'a str,
    #[serde(rename = "amountDecimal")]
    amount_decimal: &'a str,
}

#[derive(Serialize)]
struct TransferPayload<'a> {
    #[serde(rename = "assetId")]
    asset_id: &'a str,
    #[serde(rename = "fromSubAccount")]
    from_sub_account: &'a str,
    #[serde(rename = "toSubAccount")]
    to_sub_account: &'a str,
    #[serde(rename = "amountDecimal")]
    amount_decimal: &'a str,
}

const CSS_STYLES: &str = r#"
* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif; }
body { background: #f8fafc; color: #0f172a; }
.portal-container { max-width: 1080px; margin: 0 auto; padding: 32px 24px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
.brand-title { font-size: 22px; font-weight: 800; color: #0284c7; display: flex; align-items: center; gap: 8px; }
.badge-testnet { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; }
.btn { padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
.btn-primary { background: #0284c7; color: #ffffff; }
.btn-primary:hover { background: #0369a1; }
.btn-outline { background: #ffffff; color: #475569; border: 1px solid #cbd5e1; }
.btn-outline:hover { background: #f1f5f9; color: #0f172a; }
.btn-success { background: #10b981; color: #ffffff; }
.btn-success:hover { background: #059669; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
.card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
.card-title { font-size: 15px; font-weight: 700; color: #334155; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
.balance-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.balance-label { font-size: 13px; color: #64748b; }
.balance-val { font-size: 15px; font-weight: 700; color: #0f172a; font-family: monospace; }
.addr-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 13px; word-break: break-all; margin: 12px 0; color: #0f172a; }
.net-select { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; font-size: 13px; margin-bottom: 12px; color: #0f172a; outline: none; }
.table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.table th { text-align: left; padding: 10px 12px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
.table td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.toast { position: fixed; bottom: 24px; right: 24px; background: #0f172a; color: #ffffff; padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal { background: #ffffff; border-radius: 12px; padding: 28px; width: 100%; max-width: 440px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
"#;

#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // 1. Inject Styles
    let style = document().create_element("style").unwrap();
    style.set_text_content(Some(CSS_STYLES));
    document().head().unwrap().append_child(&style).unwrap();

    // 2. Reactive State Signals
    let (is_auth, set_is_auth) = create_signal(false);
    let (user_email, set_user_email) = create_signal("demo@aegispay.io".to_string());
    let (_user_name, set_user_name) = create_signal("Demo Merchant".to_string());
    let (_api_key, set_api_key) = create_signal("".to_string());

    let (funding_usdt, set_funding_usdt) = create_signal("100.000000".to_string());
    let (trading_usdt, set_trading_usdt) = create_signal("0.000000".to_string());
    let (funding_usdc, set_funding_usdc) = create_signal("50.000000".to_string());

    let (selected_network, set_selected_network) = create_signal("tron_nile".to_string());
    let (deposit_address, set_deposit_address) = create_signal("TNVzP2F4eC6pM7qY1uR9kL8bX4tS3jW2aE".to_string());
    let (transactions, set_transactions) = create_signal(Vec::<TransactionItem>::new());

    let (is_modal_open, set_is_modal_open) = create_signal(false);
    let (transfer_amt, set_transfer_amt) = create_signal("10.000000".to_string());
    let (toast_msg, set_toast_msg) = create_signal("".to_string());

    let show_toast = move |msg: &str| {
        set_toast_msg.set(msg.to_string());
        let window = window();
        let set_toast = set_toast_msg.clone();
        let closure = Closure::wrap(Box::new(move || {
            set_toast.set("".to_string());
        }) as Box<dyn FnMut()>);
        let _ = window.set_timeout_with_callback_and_timeout_and_arguments_0(
            closure.as_ref().unchecked_ref(),
            2500,
        );
        closure.forget();
    };

    // 3. API Sync Logic
    let sync_data = {
        let is_auth = is_auth.clone();
        let selected_network = selected_network.clone();
        let set_funding_usdt = set_funding_usdt.clone();
        let set_trading_usdt = set_trading_usdt.clone();
        let set_funding_usdc = set_funding_usdc.clone();
        let set_deposit_address = set_deposit_address.clone();
        let set_transactions = set_transactions.clone();

        Rc::new(move || {
            if !is_auth.get() {
                return;
            }

            // Sync Balances
            let set_f_usdt = set_funding_usdt.clone();
            let set_t_usdt = set_trading_usdt.clone();
            let set_f_usdc = set_funding_usdc.clone();
            spawn(async move {
                if let Ok(bals) = fetch_json::<Vec<BalanceItem>>("/v1/balances").await {
                    for b in bals {
                        if b.asset_id == "usdt" {
                            set_f_usdt.set(b.funding_decimal);
                            set_t_usdt.set(b.trading_decimal);
                        } else if b.asset_id == "usdc" {
                            set_f_usdc.set(b.funding_decimal);
                        }
                    }
                }
            });

            // Ensure Address
            let net = selected_network.get();
            let set_addr = set_deposit_address.clone();
            spawn(async move {
                if let Ok(res) = post_json::<_, EnsureAddressResponse>(
                    "/v1/deposit-addresses/ensure",
                    &EnsureAddressPayload { network_id: &net },
                )
                .await
                {
                    set_addr.set(res.address);
                }
            });

            // Sync Transactions
            let set_txs = set_transactions.clone();
            spawn(async move {
                if let Ok(txs) = fetch_json::<Vec<TransactionItem>>("/v1/transactions").await {
                    set_txs.set(txs);
                }
            });
        })
    };

    // Background interval poll (every 3s)
    {
        let sync_data = sync_data.clone();
        let closure = Closure::wrap(Box::new(move || {
            sync_data();
        }) as Box<dyn FnMut()>);
        let _ = window().set_interval_with_callback_and_timeout_and_arguments_0(
            closure.as_ref().unchecked_ref(),
            3000,
        );
        closure.forget();
    }

    // Auto Login from localStorage
    if let Ok(Some(storage)) = window().local_storage() {
        if let Ok(Some(saved)) = storage.get_item("aegispay_auth") {
            if let Ok(info) = serde_json::from_str::<serde_json::Value>(&saved) {
                if let Some(email) = info.get("email").and_then(|e| e.as_str()) {
                    set_user_email.set(email.to_string());
                    set_is_auth.set(true);
                    sync_data();
                }
            }
        }
    }

    // 4. Build Root App Element
    let root = el("div")
        .class("portal-container")
        .child({
            // Header
            let is_auth_h = is_auth.clone();
            let user_email_h = user_email.clone();
            let set_is_auth_h = set_is_auth.clone();
            let show_toast_h = show_toast.clone();

            el("header")
                .class("header")
                .child(
                    el("div")
                        .child(
                            el("div")
                                .class("brand-title")
                                .text("🛡️ AegisPay Gateway")
                                .child(el("span").class("badge-testnet").text("Pure Rust WASM + Light")),
                        )
                        .child(
                            el("div")
                                .style("font-size", "12px")
                                .style("color", "#64748b")
                                .style("margin-top", "4px")
                                .text("High-Performance Custodial Multi-Chain Crypto Settlement"),
                        ),
                )
                .child(
                    show(
                        move || is_auth_h.get(),
                        {
                            let user_email_h = user_email_h.clone();
                            let set_is_auth_h = set_is_auth_h.clone();
                            let show_toast_h = show_toast_h.clone();
                            move || {
                                el("div")
                                    .style("display", "flex")
                                    .style("align-items", "center")
                                    .style("gap", "12px")
                                    .child(
                                        el("span")
                                            .style("font-size", "13px")
                                            .style("font-weight", "600")
                                            .style("color", "#334155")
                                            .dyn_text({
                                                let email = user_email_h.clone();
                                                move || email.get()
                                            }),
                                    )
                                    .child(
                                        el("button")
                                            .class("btn")
                                            .class("btn-outline")
                                            .text("Logout")
                                            .on_click({
                                                let set_auth = set_is_auth_h.clone();
                                                let toast = show_toast_h.clone();
                                                move |_| {
                                                    set_auth.set(false);
                                                    if let Ok(Some(s)) = window().local_storage() {
                                                        let _ = s.remove_item("aegispay_auth");
                                                    }
                                                    toast("Logged out successfully");
                                                }
                                            }),
                                    )
                                    .build()
                            }
                        },
                    ),
                )
        })
        .child({
            let is_auth_m = is_auth.clone();
            let set_is_auth_m = set_is_auth.clone();
            let user_email_m = user_email.clone();
            let set_user_email_m = set_user_email.clone();
            let set_user_name_m = set_user_name.clone();
            let set_api_key_m = set_api_key.clone();
            let sync_data_m1 = sync_data.clone();
            let sync_data_m2 = sync_data.clone();
            let show_toast_m1 = show_toast.clone();
            let show_toast_m2 = show_toast.clone();

            let funding_usdt_m = funding_usdt.clone();
            let trading_usdt_m = trading_usdt.clone();
            let funding_usdc_m = funding_usdc.clone();
            let selected_network_m = selected_network.clone();
            let set_selected_network_m = set_selected_network.clone();
            let deposit_address_m = deposit_address.clone();
            let transactions_m = transactions.clone();
            let set_is_modal_open_m = set_is_modal_open.clone();

            show_fallback(
                move || is_auth_m.get(),
                // Authenticated Dashboard
                move || {
                    let funding_usdt = funding_usdt_m.clone();
                    let trading_usdt = trading_usdt_m.clone();
                    let funding_usdc = funding_usdc_m.clone();
                    let selected_network = selected_network_m.clone();
                    let set_selected_network = set_selected_network_m.clone();
                    let deposit_address = deposit_address_m.clone();
                    let transactions = transactions_m.clone();
                    let set_is_modal_open = set_is_modal_open_m.clone();
                    let show_toast = show_toast_m1.clone();
                    let sync_data = sync_data_m1.clone();

                    el("div")
                        .child(
                            el("div")
                                .class("grid-2")
                                .child({
                                    // 1. Balances Card
                                    let f_usdt = funding_usdt.clone();
                                    let t_usdt = trading_usdt.clone();
                                    let f_usdc = funding_usdc.clone();
                                    let set_modal = set_is_modal_open.clone();

                                    el("div")
                                        .class("card")
                                        .child(
                                            el("div")
                                                .class("card-title")
                                                .text("💰 Multi-Account Balances")
                                                .child(
                                                    el("button")
                                                        .class("btn")
                                                        .class("btn-outline")
                                                        .text("Transfer Funds ⇄")
                                                        .on_click(move |_| {
                                                            set_modal.set(true);
                                                        }),
                                                ),
                                        )
                                        .child(
                                            el("div")
                                                .class("balance-row")
                                                .child(el("span").class("balance-label").text("USDT (Funding Account)"))
                                                .child(
                                                    el("span")
                                                        .class("balance-val")
                                                        .dyn_text(move || format!("{} USDT", f_usdt.get())),
                                                ),
                                        )
                                        .child(
                                            el("div")
                                                .class("balance-row")
                                                .child(el("span").class("balance-label").text("USDT (Trading Account)"))
                                                .child(
                                                    el("span")
                                                        .class("balance-val")
                                                        .dyn_text(move || format!("{} USDT", t_usdt.get())),
                                                ),
                                        )
                                        .child(
                                            el("div")
                                                .class("balance-row")
                                                .child(el("span").class("balance-label").text("USDC (Funding Account)"))
                                                .child(
                                                    el("span")
                                                        .class("balance-val")
                                                        .dyn_text(move || format!("{} USDC", f_usdc.get())),
                                                ),
                                        )
                                })
                                .child({
                                    // 2. Deposit Address & Simulator Card
                                    let sel_net = selected_network.clone();
                                    let set_sel_net = set_selected_network.clone();
                                    let dep_addr = deposit_address.clone();
                                    let show_toast = show_toast.clone();
                                    let sync_data = sync_data.clone();

                                    el("div")
                                        .class("card")
                                        .child(el("div").class("card-title").text("📥 Instant Testnet Deposit"))
                                        .child(
                                            el("select")
                                                .class("net-select")
                                                .child(el("option").attr("value", "tron_nile").text("TRON Nile Testnet (TRC-20 USDT)"))
                                                .child(el("option").attr("value", "eth_sepolia").text("Ethereum Sepolia (ERC-20 USDT)"))
                                                .child(el("option").attr("value", "polygon_amoy").text("Polygon Amoy (ERC-20 USDC)"))
                                                .on("change", {
                                                    let set_net = set_sel_net.clone();
                                                    let sync = sync_data.clone();
                                                    move |e: web_sys::Event| {
                                                        if let Some(target) = e.target() {
                                                            if let Ok(sel) = target.dyn_into::<web_sys::HtmlSelectElement>() {
                                                                set_net.set(sel.value());
                                                                sync();
                                                            }
                                                        }
                                                    }
                                                }),
                                        )
                                        .child(el("div").style("font-size", "12px").style("color", "#64748b").text("Watch-Only Segregated Address:"))
                                        .child(
                                            el("div")
                                                .class("addr-box")
                                                .dyn_text({
                                                    let addr = dep_addr.clone();
                                                    move || addr.get()
                                                }),
                                        )
                                        .child(
                                            el("button")
                                                .class("btn")
                                                .class("btn-success")
                                                .style("width", "100%")
                                                .text("⚡ Simulate +10.000000 USDT Deposit")
                                                .on_click({
                                                    let sel_net = sel_net.clone();
                                                    let toast = show_toast.clone();
                                                    let sync = sync_data.clone();
                                                    move |_| {
                                                        let net = sel_net.get();
                                                        let toast = toast.clone();
                                                        let sync = sync.clone();
                                                        spawn(async move {
                                                            let payload = SimulateDepositPayload {
                                                                network_id: &net,
                                                                asset_id: "usdt",
                                                                amount_decimal: "10.000000",
                                                            };
                                                            if let Ok(_) = post_json::<_, serde_json::Value>("/v1/deposits/simulate", &payload).await {
                                                                toast("Simulated +10.000000 USDT deposit accepted! Ledger updated.");
                                                                sync();
                                                            } else {
                                                                toast("Simulation failed. Check network status.");
                                                            }
                                                        });
                                                    }
                                                }),
                                        )
                                }),
                        )
                        .child({
                            // 3. Transactions Table
                            let txs = transactions.clone();
                            el("div")
                                .class("card")
                                .child(el("div").class("card-title").text("📜 Real-Time Ledger Transactions"))
                                .child(
                                    el("table")
                                        .class("table")
                                        .child(
                                            el("thead").child(
                                                el("tr")
                                                    .child(el("th").text("TX Hash / Journal ID"))
                                                    .child(el("th").text("Network"))
                                                    .child(el("th").text("Asset"))
                                                    .child(el("th").text("Amount"))
                                                    .child(el("th").text("Direction"))
                                                    .child(el("th").text("Status")),
                                            ),
                                        )
                                        .child(
                                            el("tbody").child(
                                                for_each(
                                                    move || txs.get(),
                                                    |tx| {
                                                        el("tr")
                                                            .child(el("td").style("font-family", "monospace").text(&tx.tx_hash))
                                                            .child(el("td").text(&tx.network_id))
                                                            .child(el("td").text(&tx.asset_id.to_uppercase()))
                                                            .child(el("td").style("font-weight", "700").text(&tx.amount_decimal))
                                                            .child(el("td").text(&tx.direction))
                                                            .child(
                                                                el("td")
                                                                    .child(
                                                                        el("span")
                                                                            .class("badge-testnet")
                                                                            .text(&tx.status),
                                                                    ),
                                                            )
                                                            .build()
                                                    },
                                                ),
                                            ),
                                        ),
                                )
                        })
                        .build()
                },
                // Unauthenticated Login Form View
                move || {
                    let email_input = user_email_m.clone();
                    let set_email = set_user_email_m.clone();
                    let set_auth = set_is_auth_m.clone();
                    let set_name = set_user_name_m.clone();
                    let set_key = set_api_key_m.clone();
                    let sync = sync_data_m2.clone();
                    let toast = show_toast_m2.clone();

                    el("div")
                        .style("max-width", "400px")
                        .style("margin", "60px auto")
                        .class("card")
                        .child(el("h2").style("margin-bottom", "8px").style("font-size", "18px").text("Merchant Portal Access"))
                        .child(el("p").style("font-size", "13px").style("color", "#64748b").style("margin-bottom", "20px").text("Sign in to manage addresses, balances, and view real-time settlement logs."))
                        .child(
                            el("input")
                                .class("net-select")
                                .attr("type", "email")
                                .attr("placeholder", "Merchant Email")
                                .attr("value", &email_input.get())
                                .on_input(move |val| {
                                    set_email.set(val);
                                }),
                        )
                        .child(
                            el("button")
                                .class("btn")
                                .class("btn-primary")
                                .style("width", "100%")
                                .text("Authorize & Enter Gateway →")
                                .on_click({
                                    let email_input = email_input.clone();
                                    let set_auth = set_auth.clone();
                                    let set_name = set_name.clone();
                                    let set_key = set_key.clone();
                                    let sync = sync.clone();
                                    let toast = toast.clone();

                                    move |_| {
                                        let email = email_input.get();
                                        let set_auth = set_auth.clone();
                                        let set_name = set_name.clone();
                                        let set_key = set_key.clone();
                                        let sync = sync.clone();
                                        let toast = toast.clone();

                                        spawn(async move {
                                            let payload = LoginPayload { email: &email };
                                            if let Ok(res) = post_json::<_, LoginResponse>("/v1/auth/login", &payload).await {
                                                set_name.set(res.user.name);
                                                set_key.set(res.api_key);
                                                set_auth.set(true);

                                                if let Ok(Some(s)) = window().local_storage() {
                                                    let _ = s.set_item("aegispay_auth", &serde_json::json!({ "email": email }).to_string());
                                                }

                                                toast("Welcome to AegisPay Customer Portal");
                                                sync();
                                            } else {
                                                // Fallback offline login
                                                set_auth.set(true);
                                                toast("Logged in (Local Mode)");
                                                sync();
                                            }
                                        });
                                    }
                                }),
                        )
                        .build()
                },
            )
        })
        .child({
            // Modal for Internal Transfers
            let is_open = is_modal_open.clone();
            let set_open = set_is_modal_open.clone();
            let amt = transfer_amt.clone();
            let set_amt = set_transfer_amt.clone();
            let toast = show_toast.clone();
            let sync = sync_data.clone();

            show(
                move || is_open.get(),
                move || {
                    let set_open = set_open.clone();
                    let set_open_btn = set_open.clone();
                    let amt = amt.clone();
                    let set_amt = set_amt.clone();
                    let toast = toast.clone();
                    let sync = sync.clone();

                    el("div")
                        .class("modal-backdrop")
                        .child(
                            el("div")
                                .class("modal")
                                .child(el("h3").style("margin-bottom", "16px").text("⇄ Internal Account Transfer"))
                                .child(el("p").style("font-size", "13px").style("color", "#64748b").style("margin-bottom", "16px").text("Zero-fee atomic ledger transfer between Funding and Trading sub-accounts."))
                                .child(el("label").style("font-size", "12px").style("font-weight", "600").text("Amount (USDT):"))
                                .child(
                                    el("input")
                                        .class("net-select")
                                        .attr("type", "text")
                                        .attr("value", &amt.get())
                                        .on_input(move |v| {
                                            set_amt.set(v);
                                        }),
                                )
                                .child(
                                    el("div")
                                        .style("display", "flex")
                                        .style("gap", "12px")
                                        .style("margin-top", "16px")
                                        .child(
                                            el("button")
                                                .class("btn")
                                                .class("btn-outline")
                                                .style("flex", "1")
                                                .text("Cancel")
                                                .on_click(move |_| {
                                                    set_open_btn.set(false);
                                                }),
                                        )
                                        .child(
                                            el("button")
                                                .class("btn")
                                                .class("btn-primary")
                                                .style("flex", "1")
                                                .text("Execute Transfer")
                                                .on_click({
                                                    let amt = amt.clone();
                                                    let set_open = set_open.clone();
                                                    let toast = toast.clone();
                                                    let sync = sync.clone();

                                                    move |_| {
                                                        let amount = amt.get();
                                                        let set_open = set_open.clone();
                                                        let toast = toast.clone();
                                                        let sync = sync.clone();

                                                        spawn(async move {
                                                            let payload = TransferPayload {
                                                                asset_id: "usdt",
                                                                from_sub_account: "funding",
                                                                to_sub_account: "trading",
                                                                amount_decimal: &amount,
                                                            };
                                                            if let Ok(_) = post_json::<_, serde_json::Value>("/v1/internal-transfers", &payload).await {
                                                                toast("Atomic internal transfer executed successfully!");
                                                                set_open.set(false);
                                                                sync();
                                                            } else {
                                                                toast("Transfer rejected. Insufficient balance.");
                                                            }
                                                        });
                                                    }
                                                }),
                                        ),
                                ),
                        )
                        .build()
                },
            )
        })
        .child({
            // Toast Notification
            let toast_check = toast_msg.clone();
            let toast_render = toast_msg.clone();
            show(
                move || !toast_check.get().is_empty(),
                move || {
                    let toast = toast_render.clone();
                    el("div")
                        .class("toast")
                        .dyn_text(move || toast.get())
                        .build()
                },
            )
        });

    mount_to_body(&root.build());
    Ok(())
}
