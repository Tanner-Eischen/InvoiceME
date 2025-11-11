# AI Tooling Documentation

## Tools Used
- Trae AI Coding Assistant (agentic IDE-integrated assistant): used to search, edit, and validate code changes across frontend and backend.
- MapStruct: compile-time mapper generation for DTO↔entity transforms.
- Lombok: reduces boilerplate for entities and services.

## Example Prompts and Automation
- “Scan backend for PaymentDto and mappers to diagnose build failures”
  - Outcome: confirmed mapper configurations, validated annotation processing, and suggested `mvn clean verify` to regenerate classes.
- “Rename invoicing-system → frontend, invoicing-api → backend; patch Tailwind, CI, and README references”
  - Outcome: prepared a precise plan and file patches to align configuration and documentation.
- “Fix TypeScript ‘Unexpected any’ and React hook lint warnings in the frontend”
  - Outcome: introduced `UserData` types, guard functions in `api.ts`, and corrected `useEffect` deps.

## Why AI Accelerated Development Without Harming Architecture
- Context-aware search minimized time spent locating DDD/CQRS components and their cross-references.
- Patch proposals were small and targeted, preserving DDD boundaries and CQRS intent.
- The assistant avoided overreach by confining edits to requested areas and documenting rationale.

## Guidance for Future Use
- Use AI for exploration (search, reading), small refactors, and documentation generation.
- Keep architecture decisions human-owned; use AI to propose, then review deliberately.
- Prefer type-safe changes; avoid runtime-only fixes.