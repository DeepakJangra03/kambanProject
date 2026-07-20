# Architecture

## Two-agent setup

| Agent    | Role  | Status                                                                 |
|----------|-------|-------------------------------------------------------------------------|
| OpenClaw | Hands — writes/runs code, reports progress in Slack | Set up and running on Gemini 2.5 Flash (primary), with Groq and local Ollama configured as fallback providers. |
| Hermes   | Brain — plans, holds memory, runs a scheduled skill | Setup in progress at time of submission. Not fully verified for memory recall across sessions, SKILL.md firing, or autonomous cron run. |

## Slack channel scheme

| Channel        | Purpose                                                              |
|----------------|------------------------------------------------------------------------|
| `#sprint-main` | Human ↔ brain (Hermes). High-level planning, task delegation, blockers. |
| `#agent-coder` | Hands (OpenClaw) executes here — terminal commands, code output, technical status reports. |
| `#agent-log`   | Read-only audit trail — final task reports, raw agent activity, autonomous-run output. |

In practice, during this build, planning and execution both happened primarily in `#sprint-main`
and `#agent-coder` due to a channel-ID mixup early in the session (OpenClaw initially could not
resolve the `#agent-coder` channel ID and looped on retries before the correct channel ID was
supplied manually). See `agent-log.md` for the unedited record of this.

## Model routing

```
OpenClaw (hands)
  primary:  gemini/gemini-2.5-flash     (Google AI Studio free tier)
  fallback: groq/llama-3.3-70b-versatile (Groq free tier)
  fallback: ollama/qwen2.5-coder:latest  (local, unlimited, offline)
```

**Reasoning:**
- Gemini 2.5 Flash was chosen as primary for its large free-tier context window and more
  generous rate limits relative to Groq, which matters because OpenClaw's "coding" tool profile
  adds significant system-prompt/tool-schema overhead to every request.
- Groq's free tier has a low tokens-per-minute (TPM) ceiling (8,000 TPM observed on
  `gpt-oss-120b`), which produced repeated `413 Request too large` errors on larger models. A
  smaller Groq model (`llama-3.3-70b-versatile`) was kept as a secondary fallback rather than
  primary for this reason.
- Local Ollama (`qwen2.5-coder:latest`) was kept as a last-resort, zero-quota fallback. It was
  reliable for scoped, well-defined coding tasks, but produced incoherent/looping output
  (visible in `agent-log.md`) when given more open-ended conversational prompts, and ran into
  memory allocation errors during long sessions on this machine's available RAM.
- All three providers are free-tier with no billing attached, per the qualifier's "free stack
  only" rule. DeepSeek was not used anywhere in this build.

## What the agent loop actually did

1. Human (`sunny`) posted the Kanban build goal in `#sprint-main`.
2. OpenClaw set its own identity (`IDENTITY.md`, `USER.md`) and posted a phased plan
   (API development → frontend → deployment) before writing any code.
3. OpenClaw scaffolded the Laravel project (`kanban_final`), hit and resolved a missing
   `ext-fileinfo` PHP extension blocker, and built out migrations, models, and controllers for
   Boards, Lists, Cards, Tags, and Members.
4. A basic React + Vite frontend (`kanban-frontend`) was scaffolded to consume the Laravel API.
5. Two scoped follow-up fixes (tag-to-card linking, member/due-date field confirmation on the
   card update endpoint) were requested but not completed before repeated free-tier rate limits
   (Groq TPM ceiling, then Gemini daily quota, then local Ollama running out of memory on a
   bloated session) interrupted the loop close to the submission deadline.

## Human-in-the-loop visibility

All agent activity (plans, commands, errors, retries) is visible in the Slack channels listed
above — nothing was run in DMs or off-channel. `agent-log.md` contains the raw, unedited
transcript of these exchanges, including the failures and rate-limit interruptions, rather than
a cleaned-up version.