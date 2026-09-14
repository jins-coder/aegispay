use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum NetworkFamily {
    #[serde(rename = "evm")]
    Evm,
    #[serde(rename = "tron")]
    Tron,
}

impl fmt::Display for NetworkFamily {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            NetworkFamily::Evm => write!(f, "evm"),
            NetworkFamily::Tron => write!(f, "tron"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkManifest {
    pub id: String,
    pub name: String,
    pub family: NetworkFamily,
    pub chain_id: String,
    pub confirmation_depth: u64,
    pub is_testnet: bool,
    pub is_paused: bool,
    pub rpc_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetInfo {
    pub id: String,
    pub symbol: String,
    pub name: String,
    pub decimals: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserBalance {
    pub asset_id: String,
    pub symbol: String,
    pub name: String,
    pub decimals: u8,
    pub funding_atomic: String,
    pub trading_atomic: String,
    pub locked_atomic: String,
    pub funding_decimal: String,
    pub trading_decimal: String,
    pub locked_decimal: String,
}

/// Convert decimal string (e.g. "10.500000") to exact integer atomic string
pub fn decimal_to_atomic(decimal_str: &str, decimals: u8) -> Result<u128, String> {
    let clean = decimal_str.trim();
    if clean.is_empty() {
        return Err("Decimal amount cannot be empty".to_string());
    }

    let parts: Vec<&str> = clean.split('.').collect();
    if parts.len() > 2 {
        return Err(format!("Invalid decimal format: {}", clean));
    }

    let integer_part = parts[0];
    let integer_val: u128 = integer_part
        .parse()
        .map_err(|e| format!("Invalid integer component: {}", e))?;

    let fractional_part = if parts.len() == 2 { parts[1] } else { "" };

    if fractional_part.len() > decimals as usize {
        return Err(format!(
            "Excess precision: maximum allowed decimals is {}",
            decimals
        ));
    }

    let multiplier = 10u128.pow(decimals as u32);
    let mut fractional_val: u128 = 0;
    if !fractional_part.is_empty() {
        let padded = format!("{:0<width$}", fractional_part, width = decimals as usize);
        fractional_val = padded
            .parse()
            .map_err(|e| format!("Invalid fractional component: {}", e))?;
    }

    Ok(integer_val * multiplier + fractional_val)
}

/// Convert exact integer atomic amount to decimal string
pub fn atomic_to_decimal(atomic: u128, decimals: u8) -> String {
    let multiplier = 10u128.pow(decimals as u32);
    let integer_part = atomic / multiplier;
    let fraction_part = atomic % multiplier;

    if decimals == 0 {
        return integer_part.to_string();
    }

    let fraction_str = format!("{:0>width$}", fraction_part, width = decimals as usize);
    format!("{}.{}", integer_part, fraction_str)
}

pub fn initial_networks() -> Vec<NetworkManifest> {
    vec![
        NetworkManifest {
            id: "tron-nile".to_string(),
            name: "TRON Nile Testnet".to_string(),
            family: NetworkFamily::Tron,
            chain_id: "201910292".to_string(),
            confirmation_depth: 19,
            is_testnet: true,
            is_paused: false,
            rpc_url: "https://nile.trongrid.io".to_string(),
        },
        NetworkManifest {
            id: "ethereum-sepolia".to_string(),
            name: "Ethereum Sepolia".to_string(),
            family: NetworkFamily::Evm,
            chain_id: "11155111".to_string(),
            confirmation_depth: 12,
            is_testnet: true,
            is_paused: false,
            rpc_url: "https://rpc.sepolia.org".to_string(),
        },
        NetworkManifest {
            id: "polygon-amoy".to_string(),
            name: "Polygon Amoy".to_string(),
            family: NetworkFamily::Evm,
            chain_id: "80002".to_string(),
            confirmation_depth: 32,
            is_testnet: true,
            is_paused: false,
            rpc_url: "https://rpc-amoy.polygon.technology".to_string(),
        },
        NetworkManifest {
            id: "arbitrum-sepolia".to_string(),
            name: "Arbitrum Sepolia".to_string(),
            family: NetworkFamily::Evm,
            chain_id: "421614".to_string(),
            confirmation_depth: 64,
            is_testnet: true,
            is_paused: false,
            rpc_url: "https://sepolia-rollup.arbitrum.io/rpc".to_string(),
        },
    ]
}

pub fn initial_assets() -> Vec<AssetInfo> {
    vec![
        AssetInfo {
            id: "usdt".to_string(),
            symbol: "USDT".to_string(),
            name: "Tether USD".to_string(),
            decimals: 6,
        },
        AssetInfo {
            id: "usdc".to_string(),
            symbol: "USDC".to_string(),
            name: "USD Coin".to_string(),
            decimals: 6,
        },
        AssetInfo {
            id: "trx".to_string(),
            symbol: "TRX".to_string(),
            name: "TRON".to_string(),
            decimals: 6,
        },
        AssetInfo {
            id: "eth".to_string(),
            symbol: "ETH".to_string(),
            name: "Ethereum".to_string(),
            decimals: 18,
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_decimal_to_atomic_conversions() {
        assert_eq!(decimal_to_atomic("10.000000", 6).unwrap(), 10000000);
        assert_eq!(decimal_to_atomic("0.5", 6).unwrap(), 500000);
        assert_eq!(
            decimal_to_atomic("1.25", 18).unwrap(),
            1250000000000000000
        );
        assert!(decimal_to_atomic("10.0000001", 6).is_err());
    }

    #[test]
    fn test_atomic_to_decimal_formatting() {
        assert_eq!(atomic_to_decimal(10000000, 6), "10.000000");
        assert_eq!(atomic_to_decimal(500000, 6), "0.500000");
        assert_eq!(atomic_to_decimal(1250000000000000000, 18), "1.250000000000000000");
    }
}
