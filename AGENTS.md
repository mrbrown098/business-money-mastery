Read docs/BRIEF.md first. It is the source of truth for the business and the rules.

## Git workflow (mandatory)
1. The repo has only two branches: `main` and `workspace`. Never create any other branch (no feat/..., fix/..., or tool-generated names). If your tooling creates another branch automatically, move the work to `workspace`, delete the extra branch, and tell the user.
2. Before every task: fetch origin, then merge origin/main into `workspace` (merge, not rebase, never force-push). If there are conflicts, resolve them and tell the user.
3. Do all work on `workspace` and push it. Then open a pull request from `workspace` into `main` (title = task name). If a PR from `workspace` is already open, just push to it. If you cannot open a PR, say so clearly: the user will open it.
4. Never merge a PR yourself. The user merges with "Create a merge commit" and keeps the branch.
5. Never delete `workspace` or `main`.
6. Before submitting, actually run: npm run typecheck && npm run lint && npm run test && npm run build, and report the real results (never claim a pass you did not run).

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
