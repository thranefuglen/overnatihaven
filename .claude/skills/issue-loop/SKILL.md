---
name: issue-loop
description: Start a Ralph Loop that solves open GitHub issues in dependency order, one tracer-bullet vertical slice at a time, all on one branch. Use when user wants to work through GitHub issues automatically.
---

# GitHub Issue Loop

Start a Ralph Loop that works through all open GitHub sub-issues on a single branch, in dependency order. One PR at the end.

## Step 1 – Start the loop

Invoke the Ralph Loop with the prompt below. Replace nothing — pass it verbatim.

```
/ralph-loop "
## Mission

Work through all open GitHub sub-issues on a single branch, in dependency order.
One branch. One PR at the end. No merging until the user approves.

## Setup (first iteration only)

### Find the active PRD

Run: gh issue list --state open

Identify the parent PRD issue — it is the one whose title starts with 'PRD:'.
If there are multiple open PRD issues, pick the one with the most open sub-issues referencing it.

Note: prd_number = <that issue's number>, prd_title = <that issue's title without the 'PRD: ' prefix>

### Derive branch name

Convert prd_title to kebab-case (lowercase, spaces and special chars → hyphens).
Branch name = 'feature/' + kebab-case title.
Example: 'PRD: Administrationsmodul til facilitetskort' → 'feature/administrationsmodul-til-facilitetskort'

### Check out branch

  git branch --list '<branch-name>'

If not exists → git checkout -b <branch-name>
If exists     → git checkout <branch-name>

## Algorithm (repeat each iteration)

### 1. Assess state

Run: gh issue list --state open

Collect sub-issues: issues that have '## Parent PRD' in their body referencing the active PRD.
To check: gh issue view <number> and look for '## Parent PRD' section.

Filter out the parent PRD issue itself.

If no sub-issues remain open → go to DONE.

### 2. Pick next issue

For each remaining open sub-issue (lowest number first):
- Run: gh issue view <number>
- Read the 'Blocked by' section
- For each listed blocker: run gh issue view <blocker-number> --json state -q .state
- If all blockers are CLOSED (or 'None') → this is the target issue
- Otherwise → skip and try the next

If no unblocked issue is found → all remaining issues are blocked by still-open issues.
List the situation clearly and stop.

### 3. Read and understand the issue

Run: gh issue view <number>

Read carefully:
- 'What to build' — the vertical slice to implement
- 'Acceptance criteria' — the definition of done
- 'Parent PRD' — fetch with gh issue view <prd_number> for full context if needed

### 4. Explore relevant code

Read the existing code this issue touches before writing anything.
Find prior art: look for similar existing modules (same patterns, same abstractions, same file structure).
Run grep or glob searches to locate relevant files.

### 5. Implement the vertical slice

Implement end-to-end:
- Database/migration first (if needed)
- Backend: repository → service → API route
- Frontend: admin panel + public page (if needed)
- Tests alongside implementation

Rules:
- Small, focused commits — one logical change per commit
- Implement exactly what the acceptance criteria describe — no more, no less
- Do not refactor surrounding code unless it directly blocks the task

### 6. Verify acceptance criteria

Go through each checkbox in 'Acceptance criteria'.
Confirm each is satisfied by the code you wrote before moving on.

### 7. Commit and close the issue

Stage only the files relevant to this issue:
  git add <relevant files>
  git commit -m '<short imperative description> (closes #<number>)'

Close the issue:
  gh issue close <number> --comment 'Implemented in branch <branch-name>'

### 8. Loop

The Ralph Loop feeds this same prompt back.
Closed issues are filtered out in step 1.
Pick the next unblocked issue and repeat.

## DONE

All sub-issues are closed. Create the final PR.

Summarize what was built by reading the git log since this branch diverged from main:
  git log main..<branch-name> --oneline

Build the PR body dynamically from the closed issues and commit log.

Run:
  gh pr create \
    --title 'feat: <prd_title in lowercase>' \
    --base main \
    --body '<dynamic body — see format below>'

PR body format:
---
Implements: #<prd_number>
Closes #<sub-issue-1>, #<sub-issue-2>, ... (list all closed sub-issues)

## Hvad er lavet
<bullet per closed issue — one line each, based on issue titles>

## Test plan
- [ ] Alle acceptance criteria i #<sub-issues> er opfyldt
- [ ] Eksisterende tests er grønne
- [ ] Preview-deployment virker

🤖 Generated with [Claude Code](https://claude.com/claude-code)
---

Then output: <promise>ALL ISSUES RESOLVED</promise>
" --completion-promise "ALL ISSUES RESOLVED"
```

## Notes

- Issues created by `/prd-to-issues` always have `## Parent PRD`, `## Blocked by`, and `## Acceptance criteria` sections — the loop uses these to navigate.
- The parent PRD issue is never closed by this loop — only sub-issues are.
- This skill works for any PRD. Run `/issue-loop` again after creating a new set of issues and it will pick up the new PRD automatically.
