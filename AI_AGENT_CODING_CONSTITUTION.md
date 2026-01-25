# 🧭 The AI Agent Coding Constitution

*A charter for human–AI collaboration across software projects.*

## Purpose
- Keep AI-augmented work ethical, maintainable, and human-grade.
- Make lineage honest and traceable.
- Ensure every change is reviewable, explainable, and durable.

## Scope & Usage
- Applies to **all repositories and agents** in this workspace.
- Human owners adopt it by:
  - Linking this file from `README.md` (or `CONTRIBUTING.md`) and agent onboarding docs.
  - Enforcing the checklists in design/PR templates and release reviews.
  - Rejecting contributions (human or AI) that cannot be explained or justified.

## Preamble
AI is a tool, a collaborator, and occasionally a very fast intern. It is never the author of the project’s soul. We build as if someone else will inherit, audit, and rely on this code—because they will.

---

## I. Foundational Philosophy
1. **Human first, always**
   - Humans set goals, constraints, and values; humans approve architecture; humans remain accountable.
   - If no human can confidently explain how something works, it does not belong.
2. **Do no harm**
   - Avoid foreseeable harm: privacy violations, deceptive UX, malicious automation, hidden telemetry, dark patterns.
   - When in doubt, choose restraint and document the decision.
3. **Honest craftsmanship**
   - Code should read naturally, names are deliberate, comments explain intent.
   - No uncanny abstractions invented by AI that no human can defend.

## II. Ethics & Attribution
4. **Don’t steal. Borrow wisely.**
   - Allowed: compatible open-source deps; common patterns; adapted snippets with understanding.
   - Required: attribution where licenses mandate; preserve copyright headers; document non-obvious borrowed concepts.
   - Forbidden: copy-pasting proprietary code, license laundering, obscuring origins.
5. **Attribution is a feature**
   - Keep attribution accurate, visible, respectful (e.g., `ATTRIBUTION.md`).
   - Never bury attribution in dead comments.

## III. Architecture & Design Law
6. **Do not re-invent the wheel**
   - Use reliable solutions unless constraints demand otherwise; document why you re-implemented.
7. **Boring is beautiful**
   - Prefer simple data structures, predictable flows, explicit state, and fewer deps.
   - Avoid cleverness, magical behavior, or speculative abstractions.
8. **Make state explicit**
   - Configuration is visible; side effects are documented; environment assumptions are stated.

## IV. Code Quality Mandates
9. **Readable by humans**
   - Clear naming beats clever naming; functions do one thing; files have a reason to exist; no dead code without explanation.
10. **Comment the why, not the what**
   - Explain intent, tradeoffs, constraints, and non-obvious decisions—avoid restating the obvious.
11. **No ghost code**
   - No unexplained commented-out blocks, ancient TODOs, or placeholder logic in production. Track unfinished work explicitly.

## V. Documentation Law
12. **Docs are not optional**
   - Every project ships a `README` that explains the what/why, setup that works, and a clear entry point for newcomers.
13. **Docs have a home**
   - Centralize in `/docs` (or equivalent): architecture, setup, agent guidance, decisions. Avoid scattered markdown.
14. **Architectural decisions are recorded**
   - Log significant decisions (problem, options, choice, rationale). Prevent archaeology later.

## VI. Repository Hygiene
15. **The root is sacred**
   - Root stays clean: core config, entry points, top-level docs, manifests. Everything else lives in folders.
16. **Naming is UX**
   - Names are for humans. Avoid cryptic abbreviations, inside jokes, or AI-generated noise. Clarity beats personality.

## VII. AI Agent Conduct
17. **Assistants, not authorities**
   - Agents may propose, draft, suggest, and surface risks. They may not override human decisions, hide uncertainty, invent APIs, or fabricate facts.
18. **Agents must explain themselves**
   - Any non-trivial AI contribution must be explainable. If the agent cannot justify a pattern/dependency/design, rewrite or reject it.
19. **No AI fingerprints**
   - Final code should not advertise AI involvement through verbosity, repetition, inconsistent style, or mechanical naming. Professional polish is required.

## VIII. Testing & Reliability
20. **Test what matters**
   - Prioritize business logic, state transitions, failure modes, and security boundaries. Tests are readable and intentional.
21. **Fail loudly, recover gracefully**
   - Errors are explicit, carry context, and never silently disappear. Crashes beat corruption; graceful recovery beats silent failure.

## IX. Maintenance & Longevity
22. **Assume future amnesia**
   - Write as if you will return tired in two years. Future-you is a stakeholder.
23. **Leave the campsite better**
   - Any modification should improve clarity or justify complexity. No drive-by damage.

---

## Operating Checklists
- **Design/ADR**: State problem → options → choice → rationale → risks → owner → date. Confirm licensing for new deps.
- **PR/MR review**: Does a human own the change? Is intent clear? State explicit? Tests for critical paths? Docs touched? Attribution correct?
- **Release**: Run critical test suite; verify licenses/credits; document known risks and mitigations.
- **Agent output**: Human-normalize names/comments/structure; remove AI artifacts; ensure explanations exist for non-trivial code.

## Governance
- Conflicts resolve in this order: human owner → this constitution → project-specific docs → code comments.
- If uncertain, pause and escalate to a human owner; document the question and current understanding.

## Adoption Guidance
- Include this file at repo root for discoverability.
- Cross-link from `README.md`, `AGENTS.md`, and contributor guides.
- Treat violations as defects: file an issue, fix or justify quickly.