# Security Policy — `@rvoh/create-psychic`

`create-psychic` is the scaffolding CLI for new Psychic applications. It runs once per app, on a developer's machine, to generate a project. It is not on the runtime path of any deployed application.

## Reporting a Vulnerability

We prefer **GitHub Security Advisories** for private reporting:

- https://github.com/rvohealth/create-psychic/security/advisories/new

If you cannot use the GHSA flow, email **psychic-security@rvohealth.com** instead. Please do not file public GitHub issues, pull requests, or chat messages for vulnerabilities — use the private channels above.

## Response SLA

| Stage | Target |
|---|---|
| Initial acknowledgement | 3 business days |
| Triage + severity decision | 7 business days |
| Fix landed in supported branch | 30 days for High/Critical; best-effort otherwise |
| Public disclosure | Coordinated with reporter |

## Supported Versions

| Branch | Status |
|---|---|
| 3.x (current) | Active — security patches |
| < 3.0 | Unsupported |

## Scope

**In scope:**

- Code-execution surfaces in the scaffolder itself (shell or filesystem operations driven by user-supplied CLI input).
- The defaults shipped in the boilerplate that generated apps inherit — including dependency overrides, scaffold-time pruning of those overrides, and the security defaults wired into `create-psychic/boilerplate/api/src/conf/`.
- The skill-installation flow (`installPsychicSkill`) and any other helper that writes into the developer's filesystem.

**Out of scope:**

- Vulnerabilities in third-party packages the scaffolder pulls in transiently (puppeteer, etc.) — please report those upstream.
- Vulnerabilities in the runtime framework packages — see `psychic/SECURITY.md`, `dream/SECURITY.md`, etc.
- Once a generated app is created, it is the application's own concern — `create-psychic` is not in its supply chain at runtime.

For the cross-package threat model, see `docs/THREAT_MODEL.md` in this monorepo.

## Disclosure Policy

Same coordinated-disclosure flow as the other framework packages — GHSA with CVSS, CVE via the GHSA flow, tracker entry in `SECURITY_AUDIT_TRACKER.md`.
