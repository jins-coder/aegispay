use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum EntryDirection {
    Debit,
    Credit,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JournalEntry {
    pub account_id: String,
    pub asset_id: String,
    pub direction: EntryDirection,
    pub amount_atomic: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionJournal {
    pub id: String,
    pub description: String,
    pub reference_type: String,
    pub reference_id: String,
    pub idempotency_key: String,
    pub entries: Vec<JournalEntry>,
    pub created_at: String,
}

#[derive(Debug, Default, Clone)]
pub struct AccountBalances {
    pub funding_atomic: u128,
    pub trading_atomic: u128,
    pub locked_atomic: u128,
}

pub struct LedgerEngine {
    /// Account balances: account_id -> asset_id -> atomic balance
    balances: RwLock<HashMap<String, HashMap<String, u128>>>,
    /// Idempotency index: idempotency_key -> TransactionJournal
    idempotency_index: RwLock<HashMap<String, TransactionJournal>>,
    /// Posted journals history
    journals: RwLock<Vec<TransactionJournal>>,
}

impl Default for LedgerEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl LedgerEngine {
    pub fn new() -> Self {
        Self {
            balances: RwLock::new(HashMap::new()),
            idempotency_index: RwLock::new(HashMap::new()),
            journals: RwLock::new(Vec::new()),
        }
    }

    /// Post a balanced double-entry transaction journal with atomic verification
    pub fn post_transaction(
        &self,
        journal: TransactionJournal,
    ) -> Result<TransactionJournal, String> {
        // 1. Idempotency Check
        {
            let index = self.idempotency_index.read().unwrap();
            if let Some(existing) = index.get(&journal.idempotency_key) {
                return Ok(existing.clone());
            }
        }

        // 2. Minimum Entries Check
        if journal.entries.len() < 2 {
            return Err("A balanced transaction requires at least 2 entries".to_string());
        }

        // 3. Balance Invariant: Total Debits == Total Credits per asset
        let mut asset_debits: HashMap<String, u128> = HashMap::new();
        let mut asset_credits: HashMap<String, u128> = HashMap::new();
        let mut assets: HashSet<String> = HashSet::new();

        for entry in &journal.entries {
            if entry.amount_atomic == 0 {
                return Err("Entry amount must be positive and non-zero".to_string());
            }
            assets.insert(entry.asset_id.clone());
            match entry.direction {
                EntryDirection::Debit => {
                    *asset_debits.entry(entry.asset_id.clone()).or_insert(0) += entry.amount_atomic;
                }
                EntryDirection::Credit => {
                    *asset_credits.entry(entry.asset_id.clone()).or_insert(0) += entry.amount_atomic;
                }
            }
        }

        for asset in assets {
            let total_debits = asset_debits.get(&asset).copied().unwrap_or(0);
            let total_credits = asset_credits.get(&asset).copied().unwrap_or(0);

            if total_debits != total_credits {
                return Err(format!(
                    "Double-entry equation violated for asset {}: Debits ({}) != Credits ({})",
                    asset, total_debits, total_credits
                ));
            }
        }

        // 4. Atomic Execution: Update account balances
        let mut balances = self.balances.write().unwrap();

        // Verify debit balances for liability accounts
        for entry in &journal.entries {
            if entry.account_id.starts_with("liability:user:") && entry.direction == EntryDirection::Debit {
                let current = balances
                    .get(&entry.account_id)
                    .and_then(|m| m.get(&entry.asset_id))
                    .copied()
                    .unwrap_or(0);

                if current < entry.amount_atomic {
                    return Err(format!(
                        "Insufficient balance in account {} for asset {}: required {}, available {}",
                        entry.account_id, entry.asset_id, entry.amount_atomic, current
                    ));
                }
            }
        }

        // Apply balanced changes
        for entry in &journal.entries {
            let account_map = balances.entry(entry.account_id.clone()).or_default();
            let current = account_map.entry(entry.asset_id.clone()).or_insert(0);

            // In standard accounting:
            // - For Assets: Debit increases balance, Credit decreases balance.
            // - For Liabilities/Equity: Credit increases balance, Debit decreases balance.
            let is_liability = entry.account_id.starts_with("liability:");

            if is_liability {
                if entry.direction == EntryDirection::Credit {
                    *current += entry.amount_atomic;
                } else {
                    *current -= entry.amount_atomic;
                }
            } else {
                if entry.direction == EntryDirection::Debit {
                    *current += entry.amount_atomic;
                } else {
                    *current -= entry.amount_atomic;
                }
            }
        }

        // 5. Commit to index and history
        let mut index = self.idempotency_index.write().unwrap();
        let mut journals = self.journals.write().unwrap();

        index.insert(journal.idempotency_key.clone(), journal.clone());
        journals.push(journal.clone());

        Ok(journal)
    }

    /// Retrieve user balances across funding, trading, and locked sub-accounts
    pub fn get_user_balance(&self, user_id: &str, asset_id: &str) -> AccountBalances {
        let balances = self.balances.read().unwrap();

        let funding_acc = format!("liability:user:{}:funding:{}", user_id, asset_id);
        let trading_acc = format!("liability:user:{}:trading:{}", user_id, asset_id);
        let locked_acc = format!("liability:user:{}:locked:{}", user_id, asset_id);

        let funding = balances
            .get(&funding_acc)
            .and_then(|m| m.get(asset_id))
            .copied()
            .unwrap_or(0);

        let trading = balances
            .get(&trading_acc)
            .and_then(|m| m.get(asset_id))
            .copied()
            .unwrap_or(0);

        let locked = balances
            .get(&locked_acc)
            .and_then(|m| m.get(asset_id))
            .copied()
            .unwrap_or(0);

        AccountBalances {
            funding_atomic: funding,
            trading_atomic: trading,
            locked_atomic: locked,
        }
    }

    /// Retrieve all posted transaction journals
    pub fn get_journals(&self) -> Vec<TransactionJournal> {
        self.journals.read().unwrap().clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_balanced_deposit_posting() {
        let ledger = LedgerEngine::new();
        let journal = TransactionJournal {
            id: "tx_01".to_string(),
            description: "Deposit credit".to_string(),
            reference_type: "DEPOSIT".to_string(),
            reference_id: "dep_01".to_string(),
            idempotency_key: "idem_01".to_string(),
            created_at: "2026-09-14T00:00:00Z".to_string(),
            entries: vec![
                JournalEntry {
                    account_id: "asset:custody:hot:usdt".to_string(),
                    asset_id: "usdt".to_string(),
                    direction: EntryDirection::Debit,
                    amount_atomic: 10_000_000,
                },
                JournalEntry {
                    account_id: "liability:user:usr_01:funding:usdt".to_string(),
                    asset_id: "usdt".to_string(),
                    direction: EntryDirection::Credit,
                    amount_atomic: 10_000_000,
                },
            ],
        };

        let res = ledger.post_transaction(journal);
        assert!(res.is_ok());

        let bal = ledger.get_user_balance("usr_01", "usdt");
        assert_eq!(bal.funding_atomic, 10_000_000);
        assert_eq!(bal.trading_atomic, 0);
    }

    #[test]
    fn test_reject_unbalanced_journal() {
        let ledger = LedgerEngine::new();
        let journal = TransactionJournal {
            id: "tx_unbal".to_string(),
            description: "Unbalanced".to_string(),
            reference_type: "TEST".to_string(),
            reference_id: "ref_01".to_string(),
            idempotency_key: "idem_unbal".to_string(),
            created_at: "2026-09-14T00:00:00Z".to_string(),
            entries: vec![
                JournalEntry {
                    account_id: "asset:custody:hot:usdt".to_string(),
                    asset_id: "usdt".to_string(),
                    direction: EntryDirection::Debit,
                    amount_atomic: 10_000_000,
                },
                JournalEntry {
                    account_id: "liability:user:usr_01:funding:usdt".to_string(),
                    asset_id: "usdt".to_string(),
                    direction: EntryDirection::Credit,
                    amount_atomic: 5_000_000, // Unbalanced!
                },
            ],
        };

        let res = ledger.post_transaction(journal);
        assert!(res.is_err());
    }

    #[test]
    fn test_idempotency_100_replays() {
        let ledger = LedgerEngine::new();
        for _ in 0..100 {
            let journal = TransactionJournal {
                id: "tx_replay".to_string(),
                description: "Deposit".to_string(),
                reference_type: "DEPOSIT".to_string(),
                reference_id: "dep_replay".to_string(),
                idempotency_key: "idem_fixed_123".to_string(),
                created_at: "2026-09-14T00:00:00Z".to_string(),
                entries: vec![
                    JournalEntry {
                        account_id: "asset:custody:hot:usdt".to_string(),
                        asset_id: "usdt".to_string(),
                        direction: EntryDirection::Debit,
                        amount_atomic: 10_000_000,
                    },
                    JournalEntry {
                        account_id: "liability:user:usr_01:funding:usdt".to_string(),
                        asset_id: "usdt".to_string(),
                        direction: EntryDirection::Credit,
                        amount_atomic: 10_000_000,
                    },
                ],
            };
            assert!(ledger.post_transaction(journal).is_ok());
        }

        let bal = ledger.get_user_balance("usr_01", "usdt");
        // Must be exactly 10, not 1000
        assert_eq!(bal.funding_atomic, 10_000_000);
    }
}
