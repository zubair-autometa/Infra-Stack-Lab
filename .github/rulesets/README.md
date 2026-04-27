# Branch rulesets (GitHub) — import files

These JSON files match **GitHub → Settings → Rules → Rulesets → New ruleset → Import a ruleset**.

## File

| File | Purpose |
|------|---------|
| [`main-branch-infra-stack-lab.json`](./main-branch-infra-stack-lab.json) | Protects **`main`**: no force-push, no branch delete, **PR required** to merge, **three CI checks** from [`.github/workflows/ci.yml`](../workflows/ci.yml). |

## Before you import

1. Run **CI** on `main` at least once so GitHub knows the check names (Actions → green workflow).
2. Confirm your default branch is **`main`**. If it is not, edit the `conditions.ref_name.include` array in the JSON (or use `~DEFAULT_BRANCH` — see GitHub docs for ruleset conditions).

## After you import

Review the ruleset in the UI, set **Enforcement** to **Active**, then **Create** / **Save**.

If a required check name does not match what GitHub shows on a PR, open a completed **CI** run and copy the exact check titles, then edit the ruleset (or edit this JSON and re-import).

## Optional: default branch token

To target whatever the repo default branch is, you can replace `"refs/heads/main"` with `"~DEFAULT_BRANCH"` in `conditions.ref_name.include` (GitHub ruleset condition). This repo assumes **`main`**.
