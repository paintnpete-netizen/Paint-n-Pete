# The config layer — how replication works

`business-profile.yml` is the only file that knows who the operator is.

Everything else in the back office — proposals, SOPs, review request texts,
capabilities statements, website copy, automation scripts — refers to those
values rather than restating them. That single indirection is what turns a
personal system into a franchisable one.

## Standing up a new operator

1. Copy `business-profile.yml`, set a new `meta.operator_id`.
2. Replace identity, contact, territory, credentials, and pricing.
3. Reset every credential to `status: todo`. **Licensing, insurance, and
   warranty terms never carry over between operators.** They are specific to a
   registered entity and copying them is a legal problem, not a shortcut.
4. Keep `philosophy`, `voice`, and `products` unless the operator genuinely
   works differently. These are the brand standard, and they are the reason the
   output sounds consistent across territories.
5. Re-generate `01-foundation/business-brief.md` from the new config.
6. Work the roadmap in `../README.md` from Phase 1.

## Rules for anything added to this back office

- **No hardcoded facts.** If a template needs the phone number, the service
  area, or the owner's name, it reads from config. A template with
  "St. Petersburg" typed into it is a bug.
- **Every claim carries a status.** `verified`, `unverified`, or `todo`.
  Unverified and todo values never reach a customer.
- **Territory-specific content is marked as such.** Florida salt air, hurricane
  season, and cure conditions are genuine differentiators here and meaningless
  in Denver. Tag that content rather than deleting it.

## Status flags

| Flag | Meaning |
|---|---|
| `verified` | Confirmed by the operator. Safe to publish, send, or print. |
| `unverified` | Believed correct, not confirmed. Internal use only. |
| `todo` | Missing. Blocks anything that depends on it. |
