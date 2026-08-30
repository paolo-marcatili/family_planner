# Planning operating model

## Weekly Review

Once per week, ask the planning assistant for a broader horizon. Start with 7 days; choose 14 days when activities/travel need advance coordination, and 21 or 28 days for term/holiday planning. Reconcile additions, changes, removals, conflicts, and unassigned work. Existing accepted duties remain protected.

## Incremental Update

When either organizer adds or changes an event in the shared calendar, ingest only that event and its local impact window (duration plus configured travel/buffer). Show a delta preview: what changed, which duty is affected, and what alternatives are suggested. Do not regenerate the full week.

## Urgent Change

For a same-day or next-day conflict, show a prominent targeted decision. Reassignments require explicit approval. Unrelated events and duties stay unchanged.

## Merge rules

- A new calendar event is an authoritative calendar fact.
- An inferred childcare assignment, work-from-home suggestion, or duty change is a proposal until approved.
- Accepted duties are never silently overwritten.
- External events are never deleted.
- Missing or malformed Family Planner metadata produces a review item rather than a destructive repair.

## ChatGPT payload guidance

Every request should declare `planning_mode` (`weekly_review`, `incremental_update`, or `urgent_change`), `horizon_days` (7, 14, 21, or 28), `generated_at`, and a list of changed calendar event IDs when incremental. Return only the affected proposals for incremental/urgent requests. Keep work meeting details obfuscated and exclude raw email/calendar payloads.

The app should display the selected mode and horizon in Settings so the request can be reproduced. A new event added by either organizer is not itself a proposal: it is a calendar fact. Only inferred assignment changes, conflict resolutions, or new duties become proposals.
