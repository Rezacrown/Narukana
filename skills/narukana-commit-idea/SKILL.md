---
name: narukana-commit-idea
description: Capture current discussion context into idea.md. Use after brainstorming when an idea is clear.
  Do not use for formal spec creation or plan generation.
---

# Narukana Commit Idea

## Detail
Captures the current brainstorming or discussion context into `.narukana/context/idea.md`. Automatically extracts the goal, key points, constraints, and risks from the conversation.

**Use when:**
- After a brainstorming session yielded a concrete idea
- You want to save the discussion output for formalization later

**Do NOT use for:**
- Brainstorming (use brainstorm skill)
- Creating formal specs or context (use spec-create skills)

## HARD RULES
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
- (free text, optional): additional notes to include in the idea
- (free text, optional): additional instructions or context for this task

## Procedure

**Step 1: Scan Context**
1. Review the conversation history for:
   - Goal / purpose of the idea
   - Key points and decisions made
- If the user provided additional instructions, incorporate them into your work.
   - System overview (what is being built, who are the users)
   - Constraints and risks identified
   - Open questions remaining

**Step 2: Write**
1. Read `references/idea-template.md` for the expected format
2. Write `.narukana/context/idea.md` with all extracted information
3. Ensure the file captures the essence of the discussion accurately

**Step 3: Next Steps**
1. Inform the user: "Idea saved to .narukana/context/idea.md"
2. Suggest: "Ready to formalize with /narukana-context-create"

## Verification
- `.narukana/context/idea.md` exists and contains meaningful content
- Required sections from the template are present

## References
- `references/idea-template.md` — format for idea.md

## Stop Conditions
- No clear idea can be extracted from the conversation
- User cancels the commit
- idea.md already exists and user doesn't want to overwrite

## Failure Modes
- No discussion context found: "No recent discussion to commit. Run /narukana-brainstorm first."
