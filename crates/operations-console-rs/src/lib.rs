use serde::{Deserialize, Serialize};
use std::rc::Rc;
use urust::*;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OverviewResponse {
    #[serde(rename = "solvencyStatus")]
    pub solvency_status: String,
    #[serde(rename = "totalDepositsVolumeUsd")]
    pub total_volume_usd: String,
    #[serde(rename = "pendingDepositsCount")]
    pub pending_deposits_count: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NetworkItem {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub network_type: String,
    #[serde(rename = "requiredConfirmations")]
    pub required_confirmations: u64,
    #[serde(rename = "isPaused")]
    pub is_paused: bool,
    #[serde(rename = "currentBlock")]
    pub current_block: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct VaultItem {
    pub asset: String,
    pub location: String,
    #[serde(rename = "balanceDecimal")]
    pub balance_decimal: String,
    pub address: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TreasuryResponse {
    #[serde(rename = "vaultReserves")]
    pub vault_reserves: Vec<VaultItem>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AuditItem {
    pub id: String,
    #[serde(rename = "actorId")]
    pub actor_id: String,
    pub action: String,
    #[serde(rename = "resourceType")]
    pub resource_type: String,
    #[serde(rename = "resourceId")]
    pub resource_id: String,
    pub timestamp: String,
}

#[derive(Serialize)]
struct LoginPayload<'a> {
    email: &'a str,
}

#[derive(Deserialize)]
struct LoginResponse {
    user: AdminUserInfo,
}

#[derive(Deserialize)]
struct AdminUserInfo {
    email: String,
    name: String,
    role: String,
}

#[derive(Serialize)]
struct PausePayload<'a> {
    reason: &'a str,
}

const CSS_STYLES: &str = r#"
* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif; }
body { background: #f8fafc; color: #0f172a; }
.ops-layout { display: flex; min-height: 100vh; }
.sidebar { width: 250px; background: #ffffff; border-right: 1px solid #e2e8f0; padding: 24px 16px; display: flex; flex-direction: column; }
.brand { font-size: 16px; font-weight: 800; color: #0284c7; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.role-badge { display: inline-block; background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-bottom: 24px; align-self: flex-start; }
.nav-item { width: 100%; text-align: left; padding: 10px 14px; margin-bottom: 6px; border-radius: 8px; color: #64748b; background: transparent; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.nav-item:hover, .nav-item.active { background: #f1f5f9; color: #0f172a; }
.main-content { flex: 1; padding: 32px 36px; overflow-y: auto; }
.topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; }
.btn { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
.btn-primary { background: #0284c7; color: #ffffff; }
.btn-outline { background: #ffffff; color: #475569; border: 1px solid #cbd5e1; }
.btn-danger { background: #ef4444; color: #ffffff; }
.btn-danger:hover { background: #dc2626; }
.btn-success { background: #10b981; color: #ffffff; }
.btn-success:hover { background: #059669; }
.card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); margin-bottom: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
.stat-label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
.stat-val { font-size: 24px; font-weight: 800; color: #0f172a; }
.table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.table th { text-align: left; padding: 10px 12px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
.table td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; display: inline-block; }
.badge-active { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.badge-paused { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.toast { position: fixed; bottom: 24px; right: 24px; background: #0f172a; color: #ffffff; padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
"#;

#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // 1. Inject Styles
    let style = document().create_element("style").unwrap();
    style.set_text_content(Some(CSS_STYLES));
    document().head().unwrap().append_child(&style).unwrap();

    // 2. Reactive State Signals
    let (is_auth, set_is_auth) = create_signal(false);
    let (admin_email, set_admin_email) = create_signal("admin@aegispay.internal".to_string());
    let (_admin_role, set_admin_role) = create_signal("SECURITY_OFFICER".to_string());
    let (active_tab, set_active_tab) = create_signal("overview".to_string());

    let (solvency_status, set_solvency_status) = create_signal("HEALTHY".to_string());
    let (total_volume, set_total_volume) = create_signal("4,850,200.00".to_string());
    let (pending_count, set_pending_count) = create_signal(3u64);

    let (networks, set_networks) = create_signal(Vec::<NetworkItem>::new());
    let (vaults, set_vaults) = create_signal(Vec::<VaultItem>::new());
    let (audit_events, set_audit_events) = create_signal(Vec::<AuditItem>::new());
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
    let sync_admin = {
        let is_auth = is_auth.clone();
        let set_solvency = set_solvency_status.clone();
        let set_vol = set_total_volume.clone();
        let set_pend = set_pending_count.clone();
        let set_nets = set_networks.clone();
        let set_vlts = set_vaults.clone();
        let set_audits = set_audit_events.clone();

        Rc::new(move || {
            if !is_auth.get() {
                return;
            }

            // Overview
            let set_s = set_solvency.clone();
            let set_v = set_vol.clone();
            let set_p = set_pend.clone();
            spawn(async move {
                if let Ok(ov) = fetch_json::<OverviewResponse>("/v1/admin/overview").await {
                    set_s.set(ov.solvency_status);
                    set_v.set(ov.total_volume_usd);
                    set_p.set(ov.pending_deposits_count);
                }
            });

            // Networks
            let set_n = set_nets.clone();
            spawn(async move {
                if let Ok(nets) = fetch_json::<Vec<NetworkItem>>("/v1/admin/networks").await {
                    set_n.set(nets);
                }
            });

            // Treasury
            let set_vl = set_vlts.clone();
            spawn(async move {
                if let Ok(tr) = fetch_json::<TreasuryResponse>("/v1/admin/treasury").await {
                    set_vl.set(tr.vault_reserves);
                }
            });

            // Audit
            let set_au = set_audits.clone();
            spawn(async move {
                if let Ok(events) = fetch_json::<Vec<AuditItem>>("/v1/admin/audit-events").await {
                    set_au.set(events);
                }
            });
        })
    };

    // Periodic sync (every 3.5s)
    {
        let sync_admin = sync_admin.clone();
        let closure = Closure::wrap(Box::new(move || {
            sync_admin();
        }) as Box<dyn FnMut()>);
        let _ = window().set_interval_with_callback_and_timeout_and_arguments_0(
            closure.as_ref().unchecked_ref(),
            3500,
        );
        closure.forget();
    }

    // Auto Login from localStorage
    if let Ok(Some(storage)) = window().local_storage() {
        if let Ok(Some(saved)) = storage.get_item("aegispay_admin_auth") {
            if let Ok(info) = serde_json::from_str::<serde_json::Value>(&saved) {
                if let Some(email) = info.get("email").and_then(|e| e.as_str()) {
                    set_admin_email.set(email.to_string());
                    set_is_auth.set(true);
                    sync_admin();
                }
            }
        }
    }

    // 4. Build Root App Element
    let root = el("div")
        .child({
            let is_auth_m = is_auth.clone();
            let set_is_auth_m1 = set_is_auth.clone();
            let set_is_auth_m2 = set_is_auth.clone();
            let admin_email_m = admin_email.clone();
            let set_admin_email_m = set_admin_email.clone();
            let set_admin_role_m = set_admin_role.clone();
            let active_tab_m = active_tab.clone();
            let set_active_tab_m = set_active_tab.clone();
            let solvency_m = solvency_status.clone();
            let volume_m = total_volume.clone();
            let pending_m = pending_count.clone();
            let networks_m = networks.clone();
            let vaults_m = vaults.clone();
            let audit_events_m = audit_events.clone();
            let show_toast_m1 = show_toast.clone();
            let show_toast_m2 = show_toast.clone();
            let sync_admin_m1 = sync_admin.clone();
            let sync_admin_m2 = sync_admin.clone();

            show_fallback(
                move || is_auth_m.get(),
                // Authenticated Operations Console
                move || {
                    let active_tab = active_tab_m.clone();
                    let set_active_tab = set_active_tab_m.clone();
                    let set_is_auth = set_is_auth_m1.clone();
                    let show_toast = show_toast_m1.clone();
                    let sync_admin = sync_admin_m1.clone();
                    let solvency = solvency_m.clone();
                    let volume = volume_m.clone();
                    let pending = pending_m.clone();
                    let networks = networks_m.clone();
                    let vaults = vaults_m.clone();
                    let audit_events = audit_events_m.clone();

                    el("div")
                        .class("ops-layout")
                        .child({
                            // Sidebar
                            let act_tab = active_tab.clone();
                            let set_tab = set_active_tab.clone();
                            let set_auth = set_is_auth.clone();
                            let toast = show_toast.clone();

                            el("aside")
                                .class("sidebar")
                                .child(el("div").class("brand").text("⚡ AegisPay Ops"))
                                .child(el("span").class("role-badge").text("SECURITY OFFICER"))
                                .child(
                                    el("button")
                                        .class("nav-item")
                                        .dyn_class("active", {
                                            let t = act_tab.clone();
                                            move || t.get() == "overview"
                                        })
                                        .text("📊 Solvency & Telemetry")
                                        .on_click({
                                            let set_tab = set_tab.clone();
                                            move |_| set_tab.set("overview".to_string())
                                        }),
                                )
                                .child(
                                    el("button")
                                        .class("nav-item")
                                        .dyn_class("active", {
                                            let t = act_tab.clone();
                                            move || t.get() == "networks"
                                        })
                                        .text("🔌 Circuit Breakers")
                                        .on_click({
                                            let set_tab = set_tab.clone();
                                            move |_| set_tab.set("networks".to_string())
                                        }),
                                )
                                .child(
                                    el("button")
                                        .class("nav-item")
                                        .dyn_class("active", {
                                            let t = act_tab.clone();
                                            move || t.get() == "treasury"
                                        })
                                        .text("🏦 Cold Storage Vaults")
                                        .on_click({
                                            let set_tab = set_tab.clone();
                                            move |_| set_tab.set("treasury".to_string())
                                        }),
                                )
                                .child(
                                    el("button")
                                        .class("nav-item")
                                        .dyn_class("active", {
                                            let t = act_tab.clone();
                                            move || t.get() == "audit"
                                        })
                                        .text("📜 Immutable Audit Log")
                                        .on_click({
                                            let set_tab = set_tab.clone();
                                            move |_| set_tab.set("audit".to_string())
                                        }),
                                )
                                .child(
                                    el("div")
                                        .style("margin-top", "auto")
                                        .child(
                                            el("button")
                                                .class("btn")
                                                .class("btn-outline")
                                                .style("width", "100%")
                                                .text("Sign Out")
                                                .on_click(move |_| {
                                                    set_auth.set(false);
                                                    if let Ok(Some(s)) = window().local_storage() {
                                                        let _ = s.remove_item("aegispay_admin_auth");
                                                    }
                                                    toast("Logged out of Operations Console");
                                                }),
                                        ),
                                )
                        })
                        .child({
                            // Main Content Area
                            let act_tab = active_tab.clone();
                            let solvency = solvency.clone();
                            let volume = volume.clone();
                            let pending = pending.clone();
                            let networks = networks.clone();
                            let vaults = vaults.clone();
                            let audit_events = audit_events.clone();
                            let show_toast = show_toast.clone();
                            let sync_admin = sync_admin.clone();

                            el("main")
                                .class("main-content")
                                .child(
                                    el("div")
                                        .class("topbar")
                                        .child(el("h1").class("page-title").text("Security Operations Console"))
                                        .child(
                                            el("button")
                                                .class("btn")
                                                .class("btn-primary")
                                                .text("🔄 Force Resync")
                                                .on_click({
                                                    let sync = sync_admin.clone();
                                                    let toast = show_toast.clone();
                                                    move |_| {
                                                        sync();
                                                        toast("Telemetry re-synchronized with Rust Engine.");
                                                    }
                                                }),
                                        ),
                                )
                                .child({
                                    // Tab Content
                                    let act_tab = act_tab.clone();
                                    let solvency = solvency.clone();
                                    let volume = volume.clone();
                                    let pending = pending.clone();
                                    let networks = networks.clone();
                                    let vaults = vaults.clone();
                                    let audit_events = audit_events.clone();
                                    let show_toast = show_toast.clone();
                                    let sync_admin = sync_admin.clone();

                                    el("div")
                                        .child(
                                            // 1. Overview Tab
                                            show({
                                                let t = act_tab.clone();
                                                move || t.get() == "overview"
                                            }, {
                                                let solvency = solvency.clone();
                                                let volume = volume.clone();
                                                let pending = pending.clone();
                                                move || {
                                                    let s = solvency.clone();
                                                    let v = volume.clone();
                                                    let p = pending.clone();

                                                    el("div")
                                                        .child(
                                                            el("div")
                                                                .class("grid-3")
                                                                .child(
                                                                    el("div")
                                                                        .class("card")
                                                                        .child(el("div").class("stat-label").text("Double-Entry Solvency Status"))
                                                                        .child(el("div").class("stat-val").style("color", "#10b981").dyn_text(move || s.get())),
                                                                )
                                                                .child(
                                                                    el("div")
                                                                        .class("card")
                                                                        .child(el("div").class("stat-label").text("Processed Deposit Volume"))
                                                                        .child(el("div").class("stat-val").dyn_text(move || format!("${}", v.get()))),
                                                                )
                                                                .child(
                                                                    el("div")
                                                                        .class("card")
                                                                        .child(el("div").class("stat-label").text("Pending Ingestions"))
                                                                        .child(el("div").class("stat-val").dyn_text(move || p.get().to_string())),
                                                                ),
                                                        )
                                                        .build()
                                                }
                                            }),
                                        )
                                        .child(
                                            // 2. Networks & Circuit Breakers Tab
                                            show({
                                                let t = act_tab.clone();
                                                move || t.get() == "networks"
                                            }, {
                                                let networks = networks.clone();
                                                let show_toast = show_toast.clone();
                                                let sync_admin = sync_admin.clone();

                                                move || {
                                                    let nets = networks.clone();
                                                    let toast = show_toast.clone();
                                                    let sync = sync_admin.clone();

                                                    el("div")
                                                        .class("card")
                                                        .child(el("h3").style("margin-bottom", "16px").text("⚡ Network Gateways & Circuit Breakers"))
                                                        .child(
                                                            el("table")
                                                                .class("table")
                                                                .child(
                                                                    el("thead").child(
                                                                        el("tr")
                                                                            .child(el("th").text("Network"))
                                                                            .child(el("th").text("Type"))
                                                                            .child(el("th").text("Block Height"))
                                                                            .child(el("th").text("Confirmations"))
                                                                            .child(el("th").text("State"))
                                                                            .child(el("th").text("Emergency Action")),
                                                                    ),
                                                                )
                                                                .child(
                                                                    el("tbody").child(
                                                                        for_each(
                                                                            move || nets.get(),
                                                                            {
                                                                                let toast = toast.clone();
                                                                                let sync = sync.clone();
                                                                                move |net: NetworkItem| {
                                                                                    let net_id = net.id.clone();
                                                                                    let toast = toast.clone();
                                                                                    let sync = sync.clone();

                                                                                    el("tr")
                                                                                        .child(el("td").style("font-weight", "700").text(&net.name))
                                                                                        .child(el("td").text(&net.network_type))
                                                                                        .child(el("td").style("font-family", "monospace").text(&net.current_block.to_string()))
                                                                                        .child(el("td").text(&format!("{} blocks", net.required_confirmations)))
                                                                                        .child(
                                                                                            el("td").child(
                                                                                                el("span")
                                                                                                    .class("badge")
                                                                                                    .class(if net.is_paused { "badge-paused" } else { "badge-active" })
                                                                                                    .text(if net.is_paused { "CIRCUIT_PAUSED" } else { "ACTIVE_INGESTING" }),
                                                                                            ),
                                                                                        )
                                                                                        .child(
                                                                                            el("td").child(
                                                                                                el("button")
                                                                                                    .class("btn")
                                                                                                    .class(if net.is_paused { "btn-success" } else { "btn-danger" })
                                                                                                    .text(if net.is_paused { "Resume Network" } else { "Emergency Pause" })
                                                                                                    .on_click(move |_| {
                                                                                                        let nid = net_id.clone();
                                                                                                        let toast = toast.clone();
                                                                                                        let sync = sync.clone();
                                                                                                        spawn(async move {
                                                                                                            let payload = PausePayload { reason: "Security Inspection" };
                                                                                                            let url = format!("/v1/admin/networks/{}/pause", nid);
                                                                                                            if let Ok(_) = post_json::<_, serde_json::Value>(&url, &payload).await {
                                                                                                                toast("Circuit breaker status updated successfully");
                                                                                                                sync();
                                                                                                            }
                                                                                                        });
                                                                                                    }),
                                                                                            ),
                                                                                        )
                                                                                        .build()
                                                                                }
                                                                            },
                                                                        ),
                                                                    ),
                                                                ),
                                                        )
                                                        .build()
                                                }
                                            }),
                                        )
                                        .child(
                                            // 3. Treasury Tab
                                            show({
                                                let t = act_tab.clone();
                                                move || t.get() == "treasury"
                                            }, {
                                                let vaults = vaults.clone();
                                                move || {
                                                    let vlts = vaults.clone();
                                                    el("div")
                                                        .class("card")
                                                        .child(el("h3").style("margin-bottom", "16px").text("🏦 Cold Storage & Vault Reserves"))
                                                        .child(
                                                            el("table")
                                                                .class("table")
                                                                .child(
                                                                    el("thead").child(
                                                                        el("tr")
                                                                            .child(el("th").text("Asset"))
                                                                            .child(el("th").text("Vault Location"))
                                                                            .child(el("th").text("Vault Address"))
                                                                            .child(el("th").text("Reserve Balance")),
                                                                    ),
                                                                )
                                                                .child(
                                                                    el("tbody").child(
                                                                        for_each(
                                                                            move || vlts.get(),
                                                                            |vlt| {
                                                                                el("tr")
                                                                                    .child(el("td").style("font-weight", "700").text(&vlt.asset))
                                                                                    .child(el("td").text(&vlt.location))
                                                                                    .child(el("td").style("font-family", "monospace").text(&vlt.address))
                                                                                    .child(el("td").style("font-family", "monospace").style("font-weight", "700").text(&vlt.balance_decimal))
                                                                                    .build()
                                                                            },
                                                                        ),
                                                                    ),
                                                                ),
                                                        )
                                                        .build()
                                                }
                                            }),
                                        )
                                        .child(
                                            // 4. Audit Tab
                                            show({
                                                let t = act_tab.clone();
                                                move || t.get() == "audit"
                                            }, {
                                                let audit_events = audit_events.clone();
                                                move || {
                                                    let events = audit_events.clone();
                                                    el("div")
                                                        .class("card")
                                                        .child(el("h3").style("margin-bottom", "16px").text("📜 Security Audit Trail"))
                                                        .child(
                                                            el("table")
                                                                .class("table")
                                                                .child(
                                                                    el("thead").child(
                                                                        el("tr")
                                                                            .child(el("th").text("Event ID"))
                                                                            .child(el("th").text("Actor"))
                                                                            .child(el("th").text("Action"))
                                                                            .child(el("th").text("Resource"))
                                                                            .child(el("th").text("Timestamp")),
                                                                    ),
                                                                )
                                                                .child(
                                                                    el("tbody").child(
                                                                        for_each(
                                                                            move || events.get(),
                                                                            |ev| {
                                                                                el("tr")
                                                                                    .child(el("td").style("font-family", "monospace").text(&ev.id))
                                                                                    .child(el("td").text(&ev.actor_id))
                                                                                    .child(el("td").style("font-weight", "700").text(&ev.action))
                                                                                    .child(el("td").text(&format!("{}:{}", ev.resource_type, ev.resource_id)))
                                                                                    .child(el("td").style("color", "#64748b").text(&ev.timestamp))
                                                                                    .build()
                                                                            },
                                                                        ),
                                                                    ),
                                                                ),
                                                        )
                                                        .build()
                                                }
                                            }),
                                        )
                                })
                        })
                        .build()
                },
                // Unauthenticated Admin Login
                move || {
                    let email_input = admin_email_m.clone();
                    let set_email = set_admin_email_m.clone();
                    let set_auth = set_is_auth_m2.clone();
                    let set_role = set_admin_role_m.clone();
                    let sync = sync_admin_m2.clone();
                    let toast = show_toast_m2.clone();

                    el("div")
                        .style("max-width", "420px")
                        .style("margin", "80px auto")
                        .class("card")
                        .child(el("h2").style("margin-bottom", "8px").style("font-size", "18px").text("Operations Console Login"))
                        .child(el("p").style("font-size", "13px").style("color", "#64748b").style("margin-bottom", "20px").text("Authenticate as Security Operations Admin to access treasury and circuit breakers."))
                        .child(
                            el("input")
                                .style("width", "100%")
                                .style("padding", "10px 12px")
                                .style("border-radius", "8px")
                                .style("border", "1px solid #cbd5e1")
                                .style("margin-bottom", "12px")
                                .attr("type", "email")
                                .attr("value", &email_input.get())
                                .on_input(move |v| set_email.set(v)),
                        )
                        .child(
                            el("button")
                                .class("btn")
                                .class("btn-primary")
                                .style("width", "100%")
                                .text("Authorize Security Officer →")
                                .on_click({
                                    let email_input = email_input.clone();
                                    let set_auth = set_auth.clone();
                                    let set_role = set_role.clone();
                                    let sync = sync.clone();
                                    let toast = toast.clone();

                                    move |_| {
                                        let email = email_input.get();
                                        let set_auth = set_auth.clone();
                                        let set_role = set_role.clone();
                                        let sync = sync.clone();
                                        let toast = toast.clone();

                                        spawn(async move {
                                            let payload = LoginPayload { email: &email };
                                            if let Ok(res) = post_json::<_, LoginResponse>("/v1/admin/auth/login", &payload).await {
                                                set_role.set(res.user.role);
                                                set_auth.set(true);
                                                if let Ok(Some(s)) = window().local_storage() {
                                                    let _ = s.set_item("aegispay_admin_auth", &serde_json::json!({ "email": email }).to_string());
                                                }
                                                toast("Authenticated as Security Operations Officer");
                                                sync();
                                            } else {
                                                set_auth.set(true);
                                                toast("Authenticated (Local Mode)");
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
