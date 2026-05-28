# Open Source Maturity Models: A Comparative Overview

This document surveys and compares the major frameworks used to assess the maturity, readiness, and health of open source software projects. It focuses on models that are particularly relevant to Digital Public Goods (DPGs), Digital Public Infrastructure (DPI), and government technology ecosystems.

---

## Why Maturity Models Matter

Governments, implementers, and funders increasingly need structured ways to evaluate whether an open source project is ready for adoption in public-sector contexts. A project may be technically capable while still lacking governance, documentation, accessibility, or sustainability attributes that matter for long-term public use. Maturity models provide the vocabulary and structure for making those differences visible.

No single model captures everything. Each framework reflects its authors' priorities, user base, and theory of change. Understanding their differences and overlaps allows practitioners to choose the right lens for the right question.

---

## Models Surveyed

1. [DPGA DPG Maturity Indicators](#1-dpga-dpg-maturity-indicators)
2. [CHAOSS Business Readiness](#2-chaoss-business-readiness)
3. [OpenSSF Scorecard](#3-openssf-scorecard)
4. [OpenSSF Best Practices Badge (CII)](#4-openssf-best-practices-badge-cii)
5. [Linaker & Muto OSS Enablement Indicators](#5-linaker--muto-oss-enablement-indicators)
6. [GovStack Building Block Specifications](#6-govstack-building-block-specifications)
7. [DPG Standard (DPGA)](#7-dpg-standard-dpga)
8. [The DPI Atlas Maturity Dimensions](#8-the-dpi-atlas-maturity-dimensions)

---

## 1. DPGA DPG Maturity Indicators

**Source:** [https://github.com/DPGAlliance/dpg-maturity-indicators](https://github.com/DPGAlliance/dpg-maturity-indicators)  
**Led by:** UNICEF, Digital Square at PATH, FAO, GitHub, and the Digital Public Goods Alliance (DPGA)  
**Primary audience:** DPG product owners, implementers, OSPOs, and partner organizations  
**Rating scale:** LOW / MED / HIGH across seven pillars

### Overview

The DPGA DPG Maturity Indicators project is a Community of Practice (CoP) initiative producing a mutual maturity assessment framework specifically for Digital Public Goods. Its assessment questionnaire covers seven pillars and is designed for self-assessment by project owners and OSPOs.

### The Seven Pillars

| Pillar                              | Description                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| **1. Governance**                   | Transparency of ownership, decision-making, and community structure                            |
| **2. Data Protection and Security** | Secure development practices, regulatory compliance (e.g. GDPR), and security controls         |
| **3. Open Standards**               | Use of open standards, modular design, and data interoperability/export capabilities           |
| **4. Product Strategy and Roadmap** | Clarity and public availability of the roadmap; structured community input into prioritization |
| **5. Source Code Accessibility**    | Developer friendliness, documentation quality, code structure, OSI-approved licensing          |
| **6. Total Cost of Ownership**      | Guidance on operational costs including deployment, training, and maintenance                  |
| **7. Composability**                | Architectural modularity and extensibility; ability to add functionality without forking       |

### Maturity Levels

Each pillar is rated LOW, MED, or HIGH with specific observable practices at each level. For example, Governance HIGH requires formal community structures with documented roles, not just informal processes.

### Key Characteristics

- Self-assessment questionnaire with evidence prompts for each indicator
- Designed specifically for the DPG context (public-sector deployment, global south applicability)
- Covers both technical (security, code) and organizational (governance, roadmap, TCO) dimensions
- Produced collaboratively under a CC0 license

---

## 2. CHAOSS Business Readiness

**Source:** [https://chaoss.community/kb/metrics-model-business-readiness-of-an-open-source-project/](https://chaoss.community/kb/metrics-model-business-readiness-of-an-open-source-project/)  
**Stable URL:** https://chaoss.community/?p=5284  
**Led by:** CHAOSS community (Linux Foundation project)  
**Primary audience:** OSPO managers, enterprise adopters, and individual developers evaluating OSS dependencies  
**Rating scale:** Quantitative metrics; data-driven

### Overview

CHAOSS (Community Health Analytics for Open Source Software) produces a library of metrics models for evaluating open source project health. The Business Readiness model focuses specifically on whether a project is safe and sustainable to adopt as a dependency or direct-use tool.

### Metric Categories

| Category            | Metrics                                                   |
| ------------------- | --------------------------------------------------------- |
| **Code Quality**    | Defect Resolution Duration, Test Coverage                 |
| **License Issues**  | License Coverage, License Declared, OSI Approved Licenses |
| **Risk Assessment** | Contributor Absence Factor, Committers, Elephant Factor   |

### Key Metrics Explained

- **Defect Resolution Duration** — How quickly are bugs resolved? Long durations suggest backlog problems.
- **Test Coverage** — What percentage of code is covered by automated tests?
- **License Coverage** — What fraction of files include license declarations?
- **Contributor Absence Factor** — How much does the project depend on any single contributor? (Related to bus factor.)
- **Elephant Factor** — What fraction of project commits come from the top employers? High concentration signals organizational risk.

### Key Characteristics

- Quantitative and automatable; suited for continuous monitoring
- Focuses on adoption risk rather than public-sector readiness specifically
- Part of a broader CHAOSS metrics model library that includes Community Health, Responsiveness, Diversity, and more
- Pairs well with tooling such as Augur or GrimoireLab for automated measurement

### Other Relevant CHAOSS Metrics Models

While Business Readiness is the model cited in this issue, other CHAOSS models are directly relevant to DPG/DPI evaluation:

| Model                         | Focus                                            |
| ----------------------------- | ------------------------------------------------ |
| Community Health              | Contributor growth, retention, and diversity     |
| Responsiveness                | Issue and PR response times                      |
| Diversity, Equity & Inclusion | Contributor demographics and inclusive practices |
| Software Dependency Risk      | Supply chain health for dependencies             |

---

## 3. OpenSSF Scorecard

**Source:** [https://github.com/ossf/scorecard](https://github.com/ossf/scorecard)  
**Led by:** Open Source Security Foundation (OpenSSF)  
**Primary audience:** Open source maintainers and consumers evaluating security posture  
**Rating scale:** 0–10 per check; aggregate score 0–10

### Overview

OpenSSF Scorecard is an automated security assessment tool that evaluates GitHub-hosted projects against a set of security-relevant heuristics. It is designed to help maintainers improve security posture and help consumers evaluate supply chain risk.

### Example Scorecard Checks

| Check                  | What It Measures                               |
| ---------------------- | ---------------------------------------------- |
| Maintained             | Is the project actively maintained?            |
| Code Review            | Are changes reviewed before merging?           |
| Branch Protection      | Are branch protection rules configured?        |
| Pinned Dependencies    | Are dependencies version-pinned?               |
| Token Permissions      | Are GitHub Actions permissions minimal?        |
| Vulnerabilities        | Are known CVEs present in dependencies?        |
| SAST                   | Is static analysis run in CI?                  |
| Fuzzing                | Is fuzzing performed?                          |
| Security Policy        | Is there a SECURITY.md?                        |
| Signed Releases        | Are releases cryptographically signed?         |
| Binary Artifacts       | Are binary artifacts committed to the repo?    |
| Dangerous Workflow     | Do workflows contain dangerous patterns?       |
| License                | Is a license file present?                     |
| CI Tests               | Do tests run in CI?                            |
| Dependency Update Tool | Is an automated dependency update tool in use? |

### Key Characteristics

- Fully automated; can run as a GitHub Action
- Focused narrowly on security (not governance, sustainability, or public-sector readiness)
- Scores published in OpenSSF public BigQuery dataset for wide comparison
- Not a definitive pass/fail requirement — scores are heuristics with false positives/negatives
- Complements the DPGA model for the security pillar

---

## 4. OpenSSF Best Practices Badge (CII)

**Source:** [https://www.bestpractices.dev](https://www.bestpractices.dev)  
**Led by:** OpenSSF / Linux Foundation (formerly Core Infrastructure Initiative)  
**Primary audience:** OSS maintainers seeking to demonstrate best practice adherence  
**Rating scale:** Passing → Silver → Gold badges

### Overview

The CII Best Practices Badge program allows projects to self-certify against a set of software development and security best practices. Unlike Scorecard, it is declarative (projects answer questions) rather than fully automated.

### Criteria Areas

| Area           | Includes                                             |
| -------------- | ---------------------------------------------------- |
| Basics         | Public repo, OSI-approved license, project website   |
| Change Control | Version control, unique versioning                   |
| Reporting      | Bug reporting mechanism, vulnerability disclosure    |
| Quality        | Working build system, automated tests, CI            |
| Security       | Secure development knowledge, vulnerability response |
| Analysis       | Static analysis, dynamic analysis                    |

Silver and Gold badges add stricter requirements around documentation, code coverage, and security hardening.

### Key Characteristics

- Self-assessment with some automated verification
- Badge levels (Passing / Silver / Gold) provide incremental targets
- Widely recognized signal in open source community
- Can be integrated with Scorecard results for a combined view

---

## 5. Linaker & Muto OSS Enablement Indicators

**Source:** "Advancing Digital Government: Integrating Open Source Software Enablement Indicators in Maturity Indexes"  
**Reference:** [ResearchGate](https://www.researchgate.net/publication/396250702_Advancing_Digital_Government_Integrating_Open_Source_Software_Enablement_Indicators_in_Maturity_Indexes) · arXiv:2510.04603v1  
**Authors:** Johan Linaker and Sachiko Muto  
**Primary audience:** Digital government program evaluators; DGI (Digital Government Index) assessors  
**Rating scale:** Presence/maturity of policy, institutional, and practice indicators

### Overview

This academic research paper argues that existing digital government maturity indexes (e.g. UN E-Government Survey, OECD Digital Government Index) largely omit open source software enablement as an assessment dimension. The authors propose integrating OSS enablement indicators across 14 areas grouped into four categories.

### Four Categories and 14 Areas

| Category              | Areas                                                                               |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Policy Incentives** | OSS mandate or preference policies; procurement reform; funding for OSS maintenance |
| **Policy Design**     | Governance models; licensing clarity; contribution policies                         |
| **Implementation**    | OSPO presence; OSS use in government systems; OSS contribution activity             |
| **Support**           | Developer training; legal support; vendor ecosystem; community engagement           |

### Key Characteristics

- Uniquely focused on the _government_ side of the equation: the national and institutional enablers that allow DPGs to succeed
- Addresses gaps in existing digital maturity indexes that treat software as a procurement choice rather than a policy variable
- Not a project-level assessment but a national/institutional maturity indicator
- Provides the theoretical foundation for how the DPI Atlas structures its maturity evidence model

---

## 6. GovStack Building Block Specifications

**Source:** [https://govstack.global](https://govstack.global)  
**Led by:** GovStack Initiative (ITU, DIAL, GIZ, Estonia e-Governance Academy)  
**Primary audience:** Government ICT teams, system integrators, and DPG developers  
**Rating scale:** Compliance with functional and non-functional specifications

### Overview

GovStack does not provide a project maturity model in the traditional sense. Instead, it defines functional _building block specifications_ that candidate software implementations must satisfy. Compliance is verified through a sandbox testing process.

### Building Block Categories

- Digital Registries
- Identity
- Payments
- Messaging
- Workflow and Business Process Automation
- Information Mediation (data exchange)
- Consent Management
- Scheduling and Appointments

### Key Characteristics

- Functional requirements rather than maturity levels
- Spec compliance is binary for each requirement
- Provides an interoperability layer: software that complies with BB specs can interoperate with other BB-compliant systems
- Relevant to the Atlas's `interoperability` maturity dimension and standards alignment

---

## 7. DPG Standard (DPGA)

**Source:** [https://digitalpublicgoods.net/standard/](https://digitalpublicgoods.net/standard/)  
**Led by:** Digital Public Goods Alliance (DPGA)  
**Primary audience:** Projects applying for DPG recognition  
**Rating scale:** Pass / Fail against 9 indicators (binary eligibility)

### Overview

The DPG Standard defines the minimum criteria a project must meet to be recognized as a Digital Public Good. It is an eligibility bar, not a maturity scale — a project either meets the standard or it does not.

### The 9 Indicators

| #   | Indicator                                  |
| --- | ------------------------------------------ |
| 1   | Relevance to Sustainable Development Goals |
| 2   | Use of Approved Open License               |
| 3   | Clear Ownership                            |
| 4   | Platform Independence                      |
| 5   | Documentation                              |
| 6   | Mechanism for Extracting Data              |
| 7   | Adherence to Privacy and Applicable Laws   |
| 8   | Adherence to Standards and Best Practices  |
| 9   | Do No Significant Harm by Design           |

### Key Characteristics

- Binary eligibility check, not a spectrum
- Does not assess deployment maturity, sustainability, or community health
- Complemented by the DPGA Maturity Indicators (above), which layer depth onto projects that already meet the Standard
- The DPI Atlas ingests the DPG registry as its primary data source

---

## 8. The DPI Atlas Maturity Dimensions

**Source:** This repository (`docs/MATURITY_MODEL.md`)  
**Primary audience:** Governments, implementers, funders, and policy teams evaluating DPI software  
**Rating scale:** Scored dimensions with provenance and confidence metadata

### Overview

The DPI Atlas translates the Linaker & Muto framework into an operational evidence model. It scores projects across eleven maturity dimensions, each backed by inspectable evidence. The goal is to surface the dimensions of maturity that matter for public-sector adoption, not just repository activity.

### Eleven Dimensions

| Dimension          | What It Captures                                                      |
| ------------------ | --------------------------------------------------------------------- |
| `code`             | Repository health, commit frequency, contributor activity             |
| `governance`       | Governance files, community structures, decision-making transparency  |
| `stewardship`      | Steward organizations, sustainability of institutional backing        |
| `public_sector`    | Deployment in government or public-sector settings                    |
| `accessibility`    | Conformance to accessibility standards (WCAG, etc.)                   |
| `sustainability`   | Environmental and organizational sustainability signals               |
| `security`         | Security policy, OpenSSF scorecard, advisory history                  |
| `interoperability` | Standards alignment, API conformance, GovStack building block mapping |
| `procurement`      | Procurement readiness, TCO guidance, licensing clarity                |
| `community`        | Contributor diversity, responsiveness, community governance           |
| `documentation`    | Developer and user documentation quality and completeness             |

### Key Characteristics

- Evidence-backed: each score is accompanied by provenance metadata indicating source, confidence level, and retrieval date
- Multi-dimensional by design: avoids collapsing quality into a single popularity proxy
- Public-interest framing: emphasizes adoption readiness for governments, not just technical quality
- Phased implementation: the model matures before automation expands

---

## Comparative Summary

The table below maps each model against the main evaluation areas relevant to DPG and DPI contexts.

| Evaluation Area              | DPGA Maturity Indicators  | CHAOSS Business Readiness |   OpenSSF Scorecard   | CII Best Practices | Linaker & Muto | GovStack BB |        DPG Standard        |    DPI Atlas     |
| ---------------------------- | :-----------------------: | :-----------------------: | :-------------------: | :----------------: | :------------: | :---------: | :------------------------: | :--------------: |
| Governance                   |            ✅             |             —             |           —           |         ✅         |       ✅       |      —      |       ✅ (ownership)       |        ✅        |
| Security                     |            ✅             |       ✅ (partial)        |          ✅           |         ✅         |       —        |     ✅      |             ✅             |        ✅        |
| Licensing                    |    ✅ (source access)     |            ✅             |          ✅           |         ✅         |       ✅       |      —      |             ✅             |        ✅        |
| Interoperability / Standards |            ✅             |             —             |           —           |         —          |       —        |     ✅      |             ✅             |        ✅        |
| Community health             |             —             |            ✅             |     ✅ (partial)      |         ✅         |       ✅       |      —      |             —              |        ✅        |
| Code quality                 |             —             |            ✅             |          ✅           |         ✅         |       —        |      —      |             —              |        ✅        |
| Documentation                | ✅ (source access pillar) |             —             |     ✅ (partial)      |         ✅         |       —        |     ✅      |             ✅             |        ✅        |
| Product strategy / Roadmap   |            ✅             |             —             |           —           |         —          |       —        |      —      |             —              |        —         |
| Total cost of ownership      |            ✅             |             —             |           —           |         —          |       —        |      —      |             —              | ✅ (procurement) |
| Composability / Architecture |            ✅             |             —             |           —           |         —          |       —        |     ✅      | ✅ (platform independence) |        —         |
| Public sector deployment     |             —             |             —             |           —           |         —          |       ✅       |     ✅      |             ✅             |        ✅        |
| National/policy enablement   |             —             |             —             |           —           |         —          |       ✅       |      —      |             —              |        —         |
| Sustainability (long-term)   |             —             |         ✅ (risk)         | ✅ (maintained check) |         —          |       ✅       |      —      |             —              |        ✅        |
| Accessibility                |             —             |             —             |           —           |         —          |       —        |      —      |             —              |        ✅        |
| Automated measurement        |             —             |            ✅             |          ✅           |      Partial       |       —        |   Partial   |             —              |     Partial      |
| Self-assessment              |            ✅             |             —             |           —           |         ✅         |       —        |      —      |             ✅             | Manual curation  |

---

## Key Observations

### No model does everything

Each framework has a different primary audience and theory of change. OpenSSF Scorecard is excellent for automated, continuous security monitoring but says nothing about governance, procurement readiness, or public-sector deployment. The DPGA Maturity Indicators are comprehensive for DPG contexts but require self-assessment rather than automated measurement.

### The DPG Standard is a floor, not a ceiling

DPG recognition via the DPG Standard confirms that a project is eligible to be considered a public good. The DPGA Maturity Indicators (and the DPI Atlas dimensions) go beyond that floor to assess _how mature and adoptable_ the project actually is.

### Quantitative and qualitative approaches are complementary

CHAOSS metrics and OpenSSF Scorecard provide objective, automatable signals. DPGA Maturity Indicators and CII Best Practices add qualitative, context-dependent dimensions that automated tools cannot easily capture (e.g. roadmap quality, TCO guidance, regulatory compliance support).

### Public-sector framing is underserved

Most general-purpose open source health models are designed for enterprise or developer audiences. The Linaker & Muto paper, the DPGA Maturity Indicators, and the DPI Atlas are unusual in explicitly addressing public-sector deployment, national policy enablement, and procurement context. This gap reflects the relative newness of the DPG/DPI discourse as a structured field.

### Composability and total cost of ownership are DPGA-specific

The DPGA DPG Maturity Indicators uniquely include TCO guidance and architectural composability as explicit pillars. These reflect the realities of government procurement and implementation, where hidden costs and the ability to adapt software without forking matter enormously. No other model surveyed here covers these areas explicitly.

---

## Recommendations for Practitioners

| If you need to…                                 | Use…                          |
| ----------------------------------------------- | ----------------------------- |
| Check if a project meets DPG eligibility        | DPG Standard                  |
| Deeply assess DPG maturity for adoption         | DPGA DPG Maturity Indicators  |
| Monitor security posture continuously           | OpenSSF Scorecard             |
| Demonstrate security best practices             | CII Best Practices Badge      |
| Assess business/enterprise adoption risk        | CHAOSS Business Readiness     |
| Evaluate government interoperability readiness  | GovStack Building Block Specs |
| Assess national-level OSS policy enablement     | Linaker & Muto Indicators     |
| Compare DPI projects across multiple dimensions | DPI Atlas                     |

---

## Further Reading

- [DPGA DPG Maturity Indicators repository](https://github.com/DPGAlliance/dpg-maturity-indicators)
- [CHAOSS Business Readiness metrics model](https://chaoss.community/?p=5284)
- [CHAOSS Metrics Models library](https://chaoss.community/kb-metrics-models/)
- [OpenSSF Scorecard documentation](https://github.com/ossf/scorecard)
- [OpenSSF Best Practices Badge](https://www.bestpractices.dev)
- [Linaker & Muto (2025) — ResearchGate](https://www.researchgate.net/publication/396250702_Advancing_Digital_Government_Integrating_Open_Source_Software_Enablement_Indicators_in_Maturity_Indexes)
- [GovStack Building Block Specifications](https://govstack.gitbook.io/specification/)
- [DPG Standard](https://digitalpublicgoods.net/standard/)
- [DPI Atlas Maturity Model](../MATURITY_MODEL.md)
