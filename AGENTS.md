# RPS ASPDNSF Manual — Codex Instructions

## Purpose

This repository is the canonical offline ASPDotNetStorefront 10 documentation reference used for RPS ecommerce-store work.

ASPDotNetStorefront may also be referred to as:

- ASPDNSF
- ASPDotNetStorefront
- ASP.NET Storefront
- the RPS ecommerce platform
- the RPS webstore platform

When a task concerns an RPS store or ASPDNSF behavior, treat this repository as the primary platform-documentation source.

## Mandatory reference rule

Before recommending, designing, or implementing an RPS store change, search this manual for relevant built-in ASPDNSF functionality.

This rule applies especially to work involving:

- skins and storefront rendering
- XML packages and XmlPackages
- topics
- prompts
- tokens
- AppConfigs
- customer groups
- StoreID and multistore behavior
- products, variants, attributes, and extensions
- cart and checkout behavior
- users and customer records
- points or allowance programs
- admin functionality
- entity helpers
- database tables or stored procedures
- email notifications
- authentication, login, SSO, or account creation
- JavaScript or server-side customization

Do not rely only on generic ASP.NET, MVC, Razor, or modern ecommerce assumptions when relevant ASPDNSF documentation exists here.

## How to research the manual

The manual is stored primarily as static HTML files. Search filenames and file contents before opening individual pages.

Preferred commands:

```bash
rg -i "topic|token|xmlpackage" .
rg -i "customer group|storeid|multistore" .
rg -i "appconfig|checkout|shopping cart" .
```

PowerShell fallback when ripgrep is unavailable:

```powershell
Get-ChildItem -Recurse -File -Include *.htm,*.html,*.js,*.txt |
    Select-String -Pattern "topic|token|xmlpackage" -CaseSensitive:$false
```

When multiple pages are relevant, compare them rather than relying on the first search result.

## Required development behavior

1. Inspect the existing RPS implementation before proposing new architecture.
2. Search this manual for supported ASPDNSF functionality.
3. Prefer supported platform functionality over unnecessary standalone layers when it can reasonably satisfy the requirement.
4. Never invent tokens, AppConfigs, fields, tables, XML package behavior, admin features, or platform capabilities.
5. Clearly distinguish documented ASPDNSF behavior from RPS-specific custom behavior.
6. Treat the existing RPS implementation as authoritative when it intentionally differs from the standard documentation.
7. Preserve multistore compatibility unless a task explicitly applies to one store only.
8. Avoid replacing working ASPDNSF patterns merely because a newer framework would normally use a different architecture.
9. Do not place credentials, customer data, private roster data, API keys, or production secrets in this repository.
10. Do not modify archived manual pages unless the task specifically requests a documentation correction or enhancement.

## Response requirements

For ASPDNSF or RPS-store research, report:

- the manual filenames or pages consulted
- the built-in ASPDNSF behavior found
- any relevant existing RPS files inspected
- what is documented versus inferred
- any gaps or ambiguity in the manual
- why the recommendation fits the RPS multistore environment

If the manual does not answer the question, say that directly rather than presenting an assumption as documented behavior.

## Repository identity

Canonical repository:

`https://github.com/i22y/-aspdnsf-offline-manual`

The included `install-rps-codex-reference.ps1` script can register the local checkout of this repository in the user's global Codex instructions so these rules are applied when working in separate RPS repositories.