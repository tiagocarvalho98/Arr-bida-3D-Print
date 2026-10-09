# Supabase foundation implementation plan

> Execute locally; independent review before completion.

**Goal:** Remove automatic CRM mock loading and prepare tested, empty Supabase migrations before connecting the application.

**Architecture:** Normalized Postgres tables, UUID references, integer grams and milli-euros. All active studio members can read all operational records; assignment denotes responsibility, not ownership. No browser writes until transactional server commands are implemented.

**Scope:** Database foundation only. No remote migration application, public website redesign, authentication activation or import of browser demo data in this step.

## Tasks

- [x] Create CLI-generated migration: profiles, clients, products, orders, chosen route, items, jobs, tasks, quotations/materials, filament lots, reservations, stock ledger and history.
- [x] Explicit RLS/grants: active members can read; anon/non-members cannot; profiles cannot be self-provisioned. Mutations remain denied to browser roles.
- [x] Run migration on isolated PostgreSQL engine and test empty state, relational constraints, multiple materials, historical prices and permissions.
- [x] Replace CRM runtime entry with honest setup state; never read or seed old demo storage. Keep fixtures exclusively for regression tests and future adapter reference.
- [x] Document application sequence, Auth provisioning and remaining transactional integration work; run existing regression suite and browser check.
- [x] Independent review and fix material findings.

## Review focus

Old browser data must not leak into real CRM; unaffiliated authenticated accounts must not gain access; head is not a visibility boundary; quotes do not consume stock; SQL tests must run the exact migration file.
