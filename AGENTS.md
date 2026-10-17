# Agent Guidance & Rules for MizanFlow

## Core Mandates & Rules

1. **Zero Backend & Zero Cost**:
   - MizanFlow must remain 100% serverless, zero paid API dependencies, and zero database server costs.
   - All data lives client-side in the browser IndexedDB.

2. **Money Field Rules**:
   - ALL financial amounts in domain models must be stored as integer minor units (`number`).
   - Never store money amounts as floats in database tables or state records.
   - Always use utility functions in `src/utils/money.ts` for conversions and formatting.

3. **Storage Abstraction Integrity**:
   - UI components MUST NOT import or call Dexie/IndexedDB directly.
   - All data operations must pass through the `StorageProvider` interface (`src/storage/StorageProvider.ts`) via `useStorage()`.

4. **Multi-Device & Soft Delete Standard**:
   - Every entity record must include `id` (UUID), `createdAt`, `updatedAt`, `deletedAt`, and `deviceId`.
   - Never perform hard `DELETE` queries on database records unless explicitly requested by administrative database clear utilities.

5. **Copyright & Code Originality**:
   - Do NOT copy code from Akaunting or any BSL-licensed project. Write code strictly from scratch.
   - Retain MIT License.

6. **Verification Directives**:
   - Never claim lint, tests, or build passed without actually executing them.
   - Run `npm run typecheck && npm run lint && npm run test && npm run build` prior to submitting changes.
