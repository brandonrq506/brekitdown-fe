---
name: write-acceptance-criteria
description: >-
  Generate rigorous, QA-verifiable acceptance criteria for a unit of work,
  story, ticket, or described change. Use when the user wants to write or add
  acceptance criteria, define what QA should verify, or turn a unit of work / spec / story
  into a checklist. Triggers on phrases like 'write acceptance criteria',
  'write ACs', 'add ACs', 'define ACs for this', 'turn this into a
  QA checklist', or 'what should QA verify'.
---

# Write Acceptance Criteria

Turn a unit of work, story, ticket, or described change into acceptance criteria a QA reviewer can actually check by using the running product — its UI, its admin/dashboard views, its data views, its emails, its confirmation screens. ACs describe **observable behavior**, never implementation. They are the contract for "this is done and didn't break anything else."

This skill is a reasoning method, not a transcription pass. You generate the valuable checks by thinking about the change and what it touches — you don't just restate a spec line by line.

## What makes an acceptance criterion valuable

- **Functional and observable** — someone can confirm it by operating the product, with no access to the code.
- **Implementation-independent** — it would still read as true after the feature is refactored. If a line hard-codes a file, function, component, or framework detail, it's not an AC.
- **One rule per line** — a single trigger and a single observable result.
- **It earns its place** — every line catches a real, distinct failure. Volume is not the goal; coverage of what can actually go wrong is.

## Format rules (non-negotiable)

- Each line is a GitHub checkbox: `- [ ] `.
- Every line starts with **`Verify that …`**.
- One rule per line. Split compound checks into separate lines.
- Quote exact UI copy, labels, and messages in backticks, verbatim. Never paraphrase user-facing text. If the copy isn't known yet, write it as `*TBD — confirm*` rather than inventing it.
- State observable outcomes only. Name the artifact the reviewer sees (a screen, a row, a value, a message, an email) — not the file, function, component, or framework that produces it.
- State the negative / else branch where it matters: if "when X, shows Y" has a meaningful "when not X," write both.

## Always produce two categories

Every scope gets **both**:

1. **New behavior** — the change does what it's supposed to do.
2. **Keep working (regression)** — existing behavior the change could affect still works.

When the work splits into several units of work or capabilities, write a focused set per unit rather than one long undifferentiated list.

## New-behavior ACs — sweep these dimensions

For each capability in scope, walk these dimensions and write a line wherever there's something real to check. Skip a dimension when it genuinely doesn't apply — don't pad to fill it.

- **Visibility / gating** — who sees the thing and who doesn't. State both sides (signed-in vs guest, has-data vs empty state, permitted vs not).
- **Core action** — the happy path: the user does the thing and observes the intended result.
- **Variations** — meaningful variants of the action: full vs partial, one vs many, and each surface the feature appears on (every page/flow gets its own line).
- **State transitions** — apply / edit / change / remove / undo; confirm the visible state reflects each, and that reverting returns to the prior state.
- **Boundaries & caps** — the limits: the maximum applicable amount, can't exceed what's available, can't exceed what's owed; values never go negative and never go over.
- **Errors & edge states** — loading, empty, invalid input, the state changing between load and submit, and a downstream failure; name the exact message shown.
- **Access control** — each access boundary expressed as observed behavior (can / can't see, can / can't do), not as raw HTTP status codes.
- **Cross-surface consistency** — when the same artifact appears in two places, they agree; the value reported to the user matches the value actually recorded.

## Keep-working ACs — trace the blast radius

This is the part that takes the most digging, and it's proactive, not reactive. Don't wait until you "feel" a risk — ask directly: _what does this change touch that already works?_ Then walk the radius:

- **Shared code path / shared component** — other flows that run through the code you're changing (the other payment methods, the other tender types, the other consumers of a shared component) each still work.
- **The negative of the new artifact** — when the new feature is _not_ used, the new record or side-effect is _not_ created and nothing else changes. (E.g. "a payment without the new option does not create the new record.")
- **Adjacent features sharing the same data or state** — anything that reads or writes the same data the change touches (a total also fed by another source; a list also driven by sort, pagination, or existing filters).
- **Downstream steps** — whatever happens after the changed step still completes (issuance, notification, redirect, receipt).
- **Access changes** — if access was widened, bracket the boundary: the role that was meant to gain access now has it, **and** roles that should not have it still don't.

Value rule: assert a regression only where there's a plausible mechanism for breakage, and name both the existing behavior and the change that could affect it. Don't list unrelated features "to be safe" — that's noise.

## Making backend / data outcomes checkable

QA validates through the product's surfaces, so frame data outcomes around something they can see: a record or value in an admin/dashboard view, a value in a data view, a visible state change, an email, or a confirmation screen.

Some high-value checks can only be proven by hitting the API directly, manipulating the database, or forcing concurrency — for example "the same balance can't be spent twice" or "resubmitting doesn't double-charge." Still write these; they're often the most important. But flag them as needing an engineering or automated test rather than manual UI QA, so the reviewer knows.

## Process

1. **Establish scope** — identify the unit(s) of work / capability and the surfaces each touches. Write one focused set per unit.
2. **New behavior** — sweep the coverage dimensions; keep only the lines that catch a real failure.
3. **Keep working** — trace the blast radius; write a line for each existing behavior with a plausible breakage path.
4. **Group the output** under **new behavior** and **keep working** (per unit when there are several).
5. **Quote real copy**; mark anything unknown as `*TBD — confirm*`; never invent labels, fields, or thresholds.
6. **Show the draft for review first.** Only after the user approves, write it under the relevant unit/section as GitHub-checkbox markdown.

## Anti-patterns (never produce)

- Vague verbs: "works correctly", "looks good", "is intuitive", "is fast".
- Implementation detail: file, function, component, or framework names; internal field names that aren't the artifact the reviewer sees.
- Compound lines that bundle several rules — split them.
- Padding: lines added for volume rather than to catch a distinct failure.
- Invented copy, field names, or numeric thresholds not in the source — flag them instead.
- Regression lines with no plausible breakage mechanism.
- A missing negative / else branch where one is meaningful.

## Worked example (generic)

Scope: _a list page gains a bulk **Archive** action._ (Domain-neutral on purpose — the same method applies to any feature.)

**Acceptance criteria — new behavior**

- [ ] Verify that the `Archive` bulk action appears only when at least one row is selected.
- [ ] Verify that the `Archive` bulk action is not available to a user without archive permission.
- [ ] Verify that a confirmation step is shown before archiving, and cancelling it leaves every row unchanged.
- [ ] Verify that archiving the selected rows removes them from the default list and shows a confirmation reading `N items archived`.
- [ ] Verify that archiving a single selected row and archiving multiple selected rows both succeed.
- [ ] Verify that archived items appear under the `Archived` filter and not in the default list.
- [ ] Verify that if the archive request fails, the rows stay in the list and an error message is shown.
- [ ] Verify that the count shown on the `Archived` filter matches the number of items actually archived.

**Acceptance criteria — keep working**

- [ ] Verify that the existing per-row actions (edit, delete) still work with the bulk action present.
- [ ] Verify that list sorting, pagination, and existing filters still work unchanged.
- [ ] Verify that a user without archive permission sees the list exactly as before.
- [ ] Verify that creating or editing an item still works and the item appears in the default list.
