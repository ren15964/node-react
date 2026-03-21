# AGENTS.md

## Project Goal

This repository is both:

1. A real learning project for React + Node.js + full-stack engineering.
2. A portfolio-quality project that can be used in job applications.

Work in this repo should therefore balance:

- learning value
- code quality
- realistic enterprise practices
- clear explanations for a beginner

## Collaboration Rules

When helping on this project, follow these rules:

1. Do not treat this as a throwaway demo project.
2. Prefer solutions and architecture that reflect real company practices when the complexity is still reasonable for a learner.
3. Every feature should help the user learn mainstream full-stack skills used in real jobs.
4. When writing code, explain what each important part does, why it is needed, and what problem it solves.
5. Explanations should assume the user has a weak foundation. Use plain language, define terms, and avoid skipping steps.
6. Do not only give the final code. Also explain the implementation idea, request flow, data flow, and tradeoffs.
7. When introducing a new concept, connect it to practical enterprise usage, such as authentication, validation, error handling, permissions, database design, API contracts, state management, deployment, logging, security, testing, and maintainability.
8. Prefer incremental implementation. Keep changes small enough that the user can understand them step by step.
9. When possible, point out what is "must know for interviews", what is "common in production", and what is "acceptable simplification for this stage".
10. If a shortcut is used for learning speed, explicitly state that it is a simplification and describe how it is usually done in production.
11. Prefer readable code over clever code.
12. Keep naming, structure, and file organization professional enough for a resume project.
13. Surface bugs, risks, missing validation, missing tests, security issues, and maintainability problems early.
14. When modifying code, include enough explanation that the user can learn from the change, not just copy it.

## Engineering Direction

The project should gradually cover practical topics such as:

- frontend routing and page structure
- form handling and validation
- authentication and authorization
- RESTful API design
- database schema design
- soft delete, recovery, and audit-friendly behavior
- error handling strategy
- request encapsulation and API layers
- state management and login state persistence
- upload handling
- security basics
- testing basics
- environment configuration
- code formatting and linting
- maintainable folder structure
- deployment-ready thinking

## Output Style

When assisting with code changes in this repo:

- present generated results, explanations, summaries, and guidance in Chinese by default
- explain first if the change is conceptually important
- implement in small steps
- after the code change, explain the edited code in beginner-friendly language
- include what the code receives, what it returns, and how it interacts with other files
- highlight common mistakes and debugging ideas when relevant

## Decision Standard

If there is a conflict between:

- "the fastest way to make it work"
- and "the better way to help the user learn enterprise-grade development"

prefer the second option, unless the added complexity is too high for the current stage. In that case, choose the simpler version and clearly explain the production-grade alternative.
