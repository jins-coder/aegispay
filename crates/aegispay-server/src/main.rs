use aegispay_core::{
    atomic_to_decimal, decimal_to_atomic, initial_assets, initial_networks, AddressAllocator,
    EntryDirection, JournalEntry, LedgerEngine, NetworkManifest, TransactionJournal, UserBalance,
};
use axum::{
    body::Body,
    extract::{Path, State},
    http::{header, HeaderValue, Response, StatusCode, Uri},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use rust_embed::RustEmbed;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

#[derive(RustEmbed)]
#[folder = "../../dist_wasm/customer-portal/"]
struct CustomerPortalAssets;

#[derive(RustEmbed)]
#[folder = "../../dist_wasm/operations-console/"]
struct OpsConsoleAssets;

async fn static_portal_handler(uri: Uri) -> impl IntoResponse {
    let mut path = uri.path().trim_start_matches('/').to_string();
    if path.is_empty() {
        path = "index.html".to_string();
    }

    match CustomerPortalAssets::get(&path) {
        Some(content) => {
            let mime = mime_guess::from_path(&path).first_or_octet_stream();
            Response::builder()
                .header(header::CONTENT_TYPE, HeaderValue::from_str(mime.as_ref()).unwrap())
                .body(Body::from(content.data))
                .unwrap()
        }
        None => {
            if let Some(index) = CustomerPortalAssets::get("index.html") {
                Response::builder()
                    .header(header::CONTENT_TYPE, HeaderValue::from_static("text/html"))
                    .body(Body::from(index.data))
                    .unwrap()
            } else {
                Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .body(Body::from("Customer Portal not built. Run npm run build first."))
                    .unwrap()
            }
        }
    }
}

async fn static_ops_handler(uri: Uri) -> impl IntoResponse {
    let mut path = uri.path().trim_start_matches('/').to_string();
    if path.is_empty() {
        path = "index.html".to_string();
    }

    match OpsConsoleAssets::get(&path) {
        Some(content) => {
            let mime = mime_guess::from_path(&path).first_or_octet_stream();
            Response::builder()
                .header(header::CONTENT_TYPE, HeaderValue::from_str(mime.as_ref()).unwrap())
                .body(Body::from(content.data))
                .unwrap()
        }
        None => {
            if let Some(index) = OpsConsoleAssets::get("index.html") {
                Response::builder()
                    .header(header::CONTENT_TYPE, HeaderValue::from_static("text/html"))
                    .body(Body::from(index.data))
                    .unwrap()
            } else {
                Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .body(Body::from("Operations Console not built. Run npm run build first."))
                    .unwrap()
            }
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditEvent {
    pub id: String,
    pub actor_id: String,
    pub actor_role: String,
    pub action: String,
    pub resource_type: String,
    pub resource_id: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DepositRecord {
    pub id: String,
    pub tx_hash: String,
    pub network_id: String,
    pub asset_id: String,
    pub user_id: String,
    pub amount_atomic: String,
    pub amount_decimal: String,
    pub status: String,
    pub confirmations: u64,
    pub required_confirmations: u64,
    pub created_at: String,
}

pub struct AppState {
    pub ledger: LedgerEngine,
    pub allocator: AddressAllocator,
    pub networks: RwLock<Vec<NetworkManifest>>,
    pub audit_events: RwLock<Vec<AuditEvent>>,
    pub deposits: RwLock<HashMap<String, DepositRecord>>,
}

impl AppState {
    pub fn new() -> Self {
        let networks = initial_networks();
        Self {
            ledger: LedgerEngine::new(),
            allocator: AddressAllocator::new(networks.clone()),
            networks: RwLock::new(networks),
            audit_events: RwLock::new(Vec::new()),
            deposits: RwLock::new(HashMap::new()),
        }
    }

    pub fn add_audit(&self, action: &str, resource_type: &str, resource_id: &str, actor: &str) {
        let mut events = self.audit_events.write().unwrap();
        events.insert(
            0,
            AuditEvent {
                id: format!("audit_{}_{}", chrono::Utc::now().timestamp_millis(), rand::random::<u16>()),
                actor_id: actor.to_string(),
                actor_role: "security_admin".to_string(),
                action: action.to_string(),
                resource_type: resource_type.to_string(),
                resource_id: resource_id.to_string(),
                timestamp: chrono::Utc::now().to_rfc3339(),
            },
        );
    }
}

// -----------------------------------------------------------------------------
// PUBLIC API HANDLERS (Port 3000)
// -----------------------------------------------------------------------------

async fn public_root() -> impl IntoResponse {
    Json(serde_json::json!({
        "service": "AegisPay Public API Gateway (Rust / Axum)",
        "version": "v1.0.0-rust",
        "runtime": "Rust 1.98 (Tokio Multi-Threaded)",
        "status": "HEALTHY",
        "environment": "testnet",
        "mainnetEnabled": false,
        "endpoints": [
            "/v1/account",
            "/v1/networks",
            "/v1/balances",
            "/v1/deposit-addresses/ensure",
            "/v1/deposits/simulate",
            "/v1/internal-transfers",
            "/v1/transactions",
            "/v1/auth/login"
        ],
        "customerPortalUrl": "http://localhost:4000",
        "operationsConsoleUrl": "http://localhost:4001"
    }))
}

#[derive(Deserialize)]
struct LoginRequest {
    email: Option<String>,
}

async fn public_login(Json(payload): Json<LoginRequest>) -> impl IntoResponse {
    let email = payload.email.unwrap_or_else(|| "demo@aegispay.io".to_string());
    let name = email.split('@').next().unwrap_or("DEMO").to_uppercase();
    let api_key = format!("ak_rust_{}", rand::random::<u32>());

    Json(serde_json::json!({
        "token": format!("jwt_rust_{}", rand::random::<u64>()),
        "user": {
            "id": "usr_demo_01",
            "email": email,
            "name": name,
            "kycLevel": "TIER_2_VERIFIED",
            "sanctionsStatus": "CLEARED",
            "apiKey": api_key
        }
    }))
}

async fn public_get_account() -> impl IntoResponse {
    Json(serde_json::json!({
        "id": "usr_demo_01",
        "email": "demo@aegispay.io",
        "name": "DEMO TRADER",
        "kycLevel": "TIER_2_VERIFIED",
        "sanctionsStatus": "CLEARED"
    }))
}

async fn public_get_networks(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let networks = state.networks.read().unwrap().clone();
    Json(networks)
}

async fn public_get_balances(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let user_id = "usr_demo_01";
    let assets = initial_assets();

    let balances: Vec<UserBalance> = assets
        .into_iter()
        .map(|asset| {
            let bal = state.ledger.get_user_balance(user_id, &asset.id);
            UserBalance {
                asset_id: asset.id.clone(),
                symbol: asset.symbol,
                name: asset.name,
                decimals: asset.decimals,
                funding_atomic: bal.funding_atomic.to_string(),
                trading_atomic: bal.trading_atomic.to_string(),
                locked_atomic: bal.locked_atomic.to_string(),
                funding_decimal: atomic_to_decimal(bal.funding_atomic, asset.decimals),
                trading_decimal: atomic_to_decimal(bal.trading_atomic, asset.decimals),
                locked_decimal: atomic_to_decimal(bal.locked_atomic, asset.decimals),
            }
        })
        .collect();

    Json(balances)
}

#[derive(Deserialize)]
struct EnsureAddressRequest {
    network_id: Option<String>,
}

async fn public_ensure_address(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<EnsureAddressRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let network_id = payload.network_id.unwrap_or_else(|| "tron-nile".to_string());
    let user_id = "usr_demo_01";

    match state.allocator.ensure_address(user_id, &network_id) {
        Ok(rec) => Ok(Json(rec)),
        Err(e) => Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": e })),
        )),
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SimulateDepositRequest {
    network_id: Option<String>,
    asset_id: Option<String>,
    amount_decimal: Option<String>,
}

async fn public_simulate_deposit(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<SimulateDepositRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let network_id = payload.network_id.unwrap_or_else(|| "tron-nile".to_string());
    let asset_id = payload.asset_id.unwrap_or_else(|| "usdt".to_string());
    let amount_decimal = payload.amount_decimal.unwrap_or_else(|| "10.000000".to_string());
    let user_id = "usr_demo_01";

    let decimals = if asset_id == "eth" { 18 } else { 6 };
    let amount_atomic = decimal_to_atomic(&amount_decimal, decimals)
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e }))))?;

    let tx_hash = format!("0x{:016x}{:016x}", rand::random::<u64>(), rand::random::<u64>());

    // Post double-entry credit journal to ledger
    let journal = TransactionJournal {
        id: format!("tx_{}", chrono::Utc::now().timestamp_millis()),
        description: format!("On-chain deposit {} {} on {}", amount_decimal, asset_id.to_uppercase(), network_id),
        reference_type: "DEPOSIT".to_string(),
        reference_id: tx_hash.clone(),
        idempotency_key: format!("dep_{}", tx_hash),
        entries: vec![
            JournalEntry {
                account_id: format!("asset:custody:hot:{}", asset_id),
                asset_id: asset_id.clone(),
                direction: EntryDirection::Debit,
                amount_atomic,
            },
            JournalEntry {
                account_id: format!("liability:user:{}:funding:{}", user_id, asset_id),
                asset_id: asset_id.clone(),
                direction: EntryDirection::Credit,
                amount_atomic,
            },
        ],
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    state.ledger.post_transaction(journal).map_err(|e| {
        (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e })))
    })?;

    let deposit_rec = DepositRecord {
        id: format!("dep_{}", chrono::Utc::now().timestamp_millis()),
        tx_hash: tx_hash.clone(),
        network_id: network_id.clone(),
        asset_id: asset_id.clone(),
        user_id: user_id.to_string(),
        amount_atomic: amount_atomic.to_string(),
        amount_decimal: amount_decimal.clone(),
        status: "CREDITED".to_string(),
        confirmations: 20,
        required_confirmations: 19,
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    state.deposits.write().unwrap().insert(tx_hash.clone(), deposit_rec.clone());
    state.add_audit("DEPOSIT_CREDITED", "DEPOSIT", &tx_hash, user_id);

    Ok(Json(deposit_rec))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct InternalTransferRequest {
    from_account_type: Option<String>,
    to_account_type: Option<String>,
    from_account: Option<String>,
    to_account: Option<String>,
    asset_id: Option<String>,
    amount_decimal: Option<String>,
    idempotency_key: Option<String>,
}

async fn public_internal_transfer(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<InternalTransferRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let from_type = payload.from_account_type.or(payload.from_account).unwrap_or_else(|| "funding".to_string());
    let to_type = payload.to_account_type.or(payload.to_account).unwrap_or_else(|| "trading".to_string());
    let asset_id = payload.asset_id.ok_or_else(|| (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Missing assetId" }))))?;
    let amount_decimal = payload.amount_decimal.ok_or_else(|| (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Missing amountDecimal" }))))?;
    let idempotency_key = payload.idempotency_key.unwrap_or_else(|| format!("xfer_{}", rand::random::<u64>()));
    let user_id = "usr_demo_01";

    let decimals = if asset_id == "eth" { 18 } else { 6 };
    let amount_atomic = decimal_to_atomic(&amount_decimal, decimals)
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e }))))?;

    let journal = TransactionJournal {
        id: format!("tx_{}", chrono::Utc::now().timestamp_millis()),
        description: format!("Internal transfer {} {} from {} to {}", amount_decimal, asset_id.to_uppercase(), from_type, to_type),
        reference_type: "INTERNAL_TRANSFER".to_string(),
        reference_id: idempotency_key.clone(),
        idempotency_key: idempotency_key.clone(),
        entries: vec![
            JournalEntry {
                account_id: format!("liability:user:{}:{}:{}", user_id, from_type.to_lowercase(), asset_id),
                asset_id: asset_id.clone(),
                direction: EntryDirection::Debit,
                amount_atomic,
            },
            JournalEntry {
                account_id: format!("liability:user:{}:{}:{}", user_id, to_type.to_lowercase(), asset_id),
                asset_id: asset_id.clone(),
                direction: EntryDirection::Credit,
                amount_atomic,
            },
        ],
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    let res = state.ledger.post_transaction(journal).map_err(|e| {
        (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e })))
    })?;

    Ok(Json(serde_json::json!({
        "success": true,
        "transactionId": res.id
    })))
}

async fn public_get_transactions(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let journals = state.ledger.get_journals();
    Json(journals)
}

// -----------------------------------------------------------------------------
// ADMIN API HANDLERS (Port 3001)
// -----------------------------------------------------------------------------

async fn admin_root() -> impl IntoResponse {
    Json(serde_json::json!({
        "service": "AegisPay Admin Operations API Gateway (Rust / Axum)",
        "version": "v1.0.0-rust",
        "runtime": "Rust 1.98 (Tokio Multi-Threaded)",
        "status": "HEALTHY",
        "environment": "testnet",
        "mainnetEnabled": false,
        "withdrawalsEnabled": false,
        "endpoints": [
            "/v1/admin/auth/login",
            "/v1/admin/overview",
            "/v1/admin/networks",
            "/v1/admin/networks/:id/pause",
            "/v1/admin/treasury",
            "/v1/admin/audit-events"
        ],
        "operationsConsoleUrl": "http://localhost:4001",
        "customerPortalUrl": "http://localhost:4000"
    }))
}

async fn admin_login(Json(payload): Json<LoginRequest>) -> impl IntoResponse {
    let email = payload.email.unwrap_or_else(|| "admin@aegispay.internal".to_string());
    Json(serde_json::json!({
        "token": format!("jwt_admin_rust_{}", rand::random::<u64>()),
        "user": {
            "id": "admin_sec_01",
            "email": email,
            "name": "Security Ops Admin",
            "role": "SECURITY_OFFICER",
            "clearance": "LEVEL_4_TREASURY"
        }
    }))
}

async fn admin_get_overview() -> impl IntoResponse {
    Json(serde_json::json!({
        "totalUsers": 1420,
        "totalDepositsVolumeUsd": "4,850,200.00",
        "pendingDepositsCount": 3,
        "activeSweepJobsCount": 1,
        "scannerLagBlocks": {
            "tron-nile": 0,
            "ethereum-sepolia": 1,
            "polygon-amoy": 0,
            "arbitrum-sepolia": 0
        },
        "solvencyStatus": "HEALTHY",
        "mainnetEnabled": false,
        "withdrawalsEnabled": false
    }))
}

async fn admin_get_networks(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let networks = state.networks.read().unwrap().clone();
    Json(networks)
}

#[derive(Deserialize)]
struct PauseRequest {
    reason: Option<String>,
}

async fn admin_toggle_pause_network(
    State(state): State<Arc<AppState>>,
    Path(network_id): Path<String>,
    Json(payload): Json<PauseRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let reason = payload.reason.unwrap_or_else(|| "Routine maintenance".to_string());
    let mut networks = state.networks.write().unwrap();

    if let Some(net) = networks.iter_mut().find(|n| n.id == network_id) {
        net.is_paused = !net.is_paused;
        let action = if net.is_paused { "NETWORK_PAUSED" } else { "NETWORK_RESUMED" };
        state.add_audit(action, "NETWORK", &network_id, "admin_sec_01");
        info!("Network {} pause status toggled to {}. Reason: {}", network_id, net.is_paused, reason);
        Ok(Json(net.clone()))
    } else {
        Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "error": format!("Network {} not found", network_id) })),
        ))
    }
}

async fn admin_get_treasury() -> impl IntoResponse {
    Json(serde_json::json!({
        "vaultReserves": [
            {
                "asset": "USDT",
                "location": "Cold Storage Vault Alpha (Multi-Sig)",
                "balanceDecimal": "3,400,000.000000",
                "address": "TNDepositColdAlphaVault7899128372"
            },
            {
                "asset": "USDC",
                "location": "Cold Storage Vault Beta (MPC HSM)",
                "balanceDecimal": "1,450,200.000000",
                "address": "0x892aF098C12e2D091B87654a1A2B9Cd0872E412"
            }
        ]
    }))
}

async fn admin_get_audit_events(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let events = state.audit_events.read().unwrap().clone();
    Json(events)
}

// -----------------------------------------------------------------------------
// APPLICATION ENTRYPOINT
// -----------------------------------------------------------------------------

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let state = Arc::new(AppState::new());
    state.add_audit("BACKEND_STARTUP", "SYSTEM", "rust_core_engine", "system_init");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // 1. Build Public API Router (Port 3000)
    let public_app = Router::new()
        .route("/health", get(public_root))
        .route("/api", get(public_root))
        .route("/v1/auth/login", post(public_login))
        .route("/v1/auth/me", get(public_get_account))
        .route("/v1/account", get(public_get_account))
        .route("/v1/networks", get(public_get_networks))
        .route("/v1/balances", get(public_get_balances))
        .route("/v1/deposit-addresses/ensure", post(public_ensure_address))
        .route("/v1/deposits/simulate", post(public_simulate_deposit))
        .route("/v1/internal-transfers", post(public_internal_transfer))
        .route("/v1/transactions", get(public_get_transactions))
        .fallback(static_portal_handler)
        .layer(cors.clone())
        .with_state(state.clone());

    // 2. Build Admin API Router (Port 3001)
    let admin_app = Router::new()
        .route("/health", get(admin_root))
        .route("/api", get(admin_root))
        .route("/v1/admin/auth/login", post(admin_login))
        .route("/v1/admin/overview", get(admin_get_overview))
        .route("/v1/admin/networks", get(admin_get_networks))
        .route("/v1/admin/networks/:id/pause", post(admin_toggle_pause_network))
        .route("/v1/admin/treasury", get(admin_get_treasury))
        .route("/v1/admin/audit-events", get(admin_get_audit_events))
        .fallback(static_ops_handler)
        .layer(cors)
        .with_state(state.clone());

    let public_addr = "0.0.0.0:3000";
    let admin_addr = "0.0.0.0:3001";

    info!("🚀 Launching AegisPay High-Performance Rust Backend (Axum + Tokio)");
    info!("• Public Gateway: http://localhost:3000");
    info!("• Admin Gateway:  http://localhost:3001");

    let public_listener = tokio::net::TcpListener::bind(public_addr).await.unwrap();
    let admin_listener = tokio::net::TcpListener::bind(admin_addr).await.unwrap();

    let public_handle = tokio::spawn(async move {
        axum::serve(public_listener, public_app).await.unwrap();
    });

    let admin_handle = tokio::spawn(async move {
        axum::serve(admin_listener, admin_app).await.unwrap();
    });

    let _ = tokio::join!(public_handle, admin_handle);
}
