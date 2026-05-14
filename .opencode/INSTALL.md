# Narukana Installation (Windows)

## Prerequisites
- OpenCode CLI installed
- Narukana repository cloned

## Step 1: Install skills

```powershell
# Copy entire skill pack to OpenCode global skills directory
cp -r skills $env:USERPROFILE\.config\opencode\skills\narukana-skills
```

## Step 2: Install command wrappers

```powershell
# Copy router wrappers to OpenCode command directory
cp command/*.md $env:USERPROFILE\.config\opencode\command\
```

## Step 3: Restart OpenCode

Close and reopen OpenCode terminal. Verify with:

```
/narukana-init
```

The skill should load and guide you through initialization.

No plugin registration, no build step, no dependencies.
