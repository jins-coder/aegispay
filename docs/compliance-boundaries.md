# Compliance & Regulatory Boundaries

## 1. Provider Interfaces
AegisPay decouples domain logic from specific third-party compliance vendors via clean port interfaces:

```typescript
export interface IdentityVerificationProvider {
  verifyUserKyc(userId: string, profile: KycProfile): Promise<KycDecision>;
}

export interface SanctionsScreeningProvider {
  screenAddress(address: string, networkId: string): Promise<SanctionsDecision>;
  screenEntity(name: string, jurisdiction: string): Promise<SanctionsDecision>;
}

export interface BlockchainRiskProvider {
  assessTransferRisk(txHash: string, fromAddress: string, networkId: string): Promise<RiskScoreResult>;
}
```

## 2. Regulatory Notice
Operating a custodial cryptocurrency deposit and settlement platform requires jurisdiction-specific regulatory licenses (e.g. VASP registration, MSB licenses, FIU compliance in India, MiCA compliance in the EU, FinCEN registration in the US). AegisPay software does not constitute legal or regulatory authorization to engage in financial operations.
