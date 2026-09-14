use crate::types::{NetworkFamily, NetworkManifest};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddressRecord {
    pub user_id: String,
    pub network_id: String,
    pub address: String,
    pub derivation_index: u32,
    pub derivation_path: String,
    pub created_at: String,
}

pub struct AddressAllocator {
    networks: Vec<NetworkManifest>,
    user_addresses: RwLock<HashMap<String, HashMap<String, AddressRecord>>>,
    next_index: RwLock<u32>,
}

impl AddressAllocator {
    pub fn new(networks: Vec<NetworkManifest>) -> Self {
        Self {
            networks,
            user_addresses: RwLock::new(HashMap::new()),
            next_index: RwLock::new(0),
        }
    }

    /// Ensure address for a user on a given network (idempotent)
    pub fn ensure_address(&self, user_id: &str, network_id: &str) -> Result<AddressRecord, String> {
        let network = self
            .networks
            .iter()
            .find(|n| n.id == network_id)
            .ok_or_else(|| format!("Network {} not supported", network_id))?;

        // 1. Check existing
        {
            let map = self.user_addresses.read().unwrap();
            if let Some(user_map) = map.get(user_id) {
                if let Some(rec) = user_map.get(network_id) {
                    return Ok(rec.clone());
                }
            }
        }

        // 2. Derive deterministic address for index
        let mut idx_lock = self.next_index.write().unwrap();
        let index = *idx_lock;
        *idx_lock += 1;

        let (address, path) = match network.family {
            NetworkFamily::Tron => {
                let path = format!("m/44'/195'/0'/0/{}", index);
                let mut hasher = Sha256::new();
                hasher.update(format!("TRON_ADDR_{}_{}", user_id, index).as_bytes());
                let hash = hex::encode(hasher.finalize());
                let address = format!("T{}", &hash[0..33]);
                (address, path)
            }
            NetworkFamily::Evm => {
                let path = format!("m/44'/60'/0'/0/{}", index);
                let mut hasher = Sha256::new();
                hasher.update(format!("EVM_ADDR_{}_{}", user_id, index).as_bytes());
                let hash = hex::encode(hasher.finalize());
                let address = format!("0x{}", &hash[0..40]);
                (address, path)
            }
        };

        let record = AddressRecord {
            user_id: user_id.to_string(),
            network_id: network_id.to_string(),
            address,
            derivation_index: index,
            derivation_path: path,
            created_at: chrono::Utc::now().to_rfc3339(),
        };

        let mut map = self.user_addresses.write().unwrap();
        map.entry(user_id.to_string())
            .or_default()
            .insert(network_id.to_string(), record.clone());

        Ok(record)
    }

    pub fn get_user_addresses(&self, user_id: &str) -> Vec<AddressRecord> {
        let map = self.user_addresses.read().unwrap();
        if let Some(user_map) = map.get(user_id) {
            user_map.values().cloned().collect()
        } else {
            Vec::new()
        }
    }
}
