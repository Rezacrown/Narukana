---
name: narukana-brainstorm
description: Free-form brainstorming with AI-assisted web research. Use when exploring project ideas, architecture decisions, or creative solutions.
  Do not use for committing finalized ideas or creating structured specs.
---

# Narukana Brainstorm

## Detail
Free-form brainstorming and ideation. Explores project ideas, architecture decisions, and creative solutions through discussion and optional web research. No strict output format — the focus is on exploration.

**Use when:**
- Exploring project ideas or features
- Discussing architecture decisions
- Researching technologies or approaches

**Do NOT use for:**
- Committing finalized ideas (use commit-idea)
- Creating structured specs or plans

## HARD RULES
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
- (free text): topic, question, or idea to brainstorm
- (free text, optional): additional instructions or context for this task

## Procedure
1. Receive the topic or question from the user
- If the user provided additional instructions, incorporate them into your work.
2. Analyze and explore the topic from multiple angles
3. If relevant: use web search for additional context and information
4. Discuss findings and possibilities with the user
5. Refine ideas based on user feedback
6. When the idea is clear enough, suggest: "Use /narukana-commit-idea to save this idea"

## Stop Conditions
- User indicates the brainstorming session is complete
- User wants to commit the idea
- User changes topic

## Failure Modes
- No clear direction: Ask the user for a specific topic or question
