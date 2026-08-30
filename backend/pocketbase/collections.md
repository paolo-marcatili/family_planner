# PocketBase collections and access rules

This is a setup specification for local development. It is not a production export and does not contain admin credentials or family data.

## Collections

| Collection | Type | Important fields |
|---|---|---|
| `users` | auth | `email`, `verified`; use PocketBase auth only |
| `households` | base | `name`, `timezone`, `week_starts_on` |
| `household_members` | base | `household` relation, `user` relation, `role` |
| `people` | base | `household`, `name`, `kind`, `date_of_birth`, `childcare_scope` |
| `events` | base | `household`, `title`, `start_at`, `end_at`, `category`, `status`, `assigned_to`, `recurrence` |
| `tasks` | base | `household`, `title`, `due_at`, `priority`, `status`, `assigned_to`, `recurrence` |
| `work_days` | base | `household`, `person`, `date`, `location`, `status` |
| `work_blocks` | base | `household`, `person`, `start_at`, `end_at`, `label`, `priority`, `flexibility` |
| `import_batches` | base | `household`, `week_start`, `schema_version`, `generated_at`, `status` |
| `proposals` | base | `household`, `import_batch`, `external_id`, `type`, `payload`, `status`, `reviewed_by` |

## Household authorization

Every non-auth collection must have a `household` relation. The intended rule is conceptually:

```text
@request.auth.id != ""
&& household_members_via_household.household = household
&& household_members_via_household.user = @request.auth.id
```

Implement the equivalent PocketBase relation rule for each collection, adapting relation expansion syntax to the exact collection schema. Do not use `true` as a production list/view/create/update/delete rule. Admin credentials are for the PocketBase admin UI/API only and must never be put in the frontend.

## Proposal lifecycle

New imports create `proposed` records. Organizers can transition them to `approved`, `edited`, `rejected`, or `deferred`. Accepted events/tasks/work statuses are separate records or explicitly linked records; an import must not silently overwrite accepted data.
