[CmdletBinding()]
param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSCommandPath
$manualPath = (Resolve-Path -LiteralPath $repoRoot).Path
$codexDirectory = Join-Path $HOME '.codex'
$agentsPath = Join-Path $codexDirectory 'AGENTS.md'

$startMarker = '<!-- BEGIN RPS ASPDNSF MANUAL — MANAGED BLOCK -->'
$endMarker = '<!-- END RPS ASPDNSF MANUAL — MANAGED BLOCK -->'

function Remove-ManagedBlock {
    param([string]$Text)

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return ''
    }

    $pattern = '(?ms)^\s*' + [regex]::Escape($startMarker) + '.*?' + [regex]::Escape($endMarker) + '\s*'
    return ([regex]::Replace($Text, $pattern, '')).Trim()
}

$existingContent = ''
if (Test-Path -LiteralPath $agentsPath) {
    $existingContent = Get-Content -LiteralPath $agentsPath -Raw -Encoding UTF8
}

$preservedContent = Remove-ManagedBlock -Text $existingContent

if ($Uninstall) {
    if ([string]::IsNullOrWhiteSpace($preservedContent)) {
        if (Test-Path -LiteralPath $agentsPath) {
            Remove-Item -LiteralPath $agentsPath -Force
        }
    }
    else {
        Set-Content -LiteralPath $agentsPath -Value ($preservedContent + [Environment]::NewLine) -Encoding UTF8
    }

    Write-Host 'Removed the managed RPS ASPDNSF instructions from Codex.'
    Write-Host "Codex instructions file: $agentsPath"
    exit 0
}

New-Item -ItemType Directory -Path $codexDirectory -Force | Out-Null

$managedBlock = @"
$startMarker
# RPS ASPDNSF Global Reference

Whenever a task concerns RPS, RPS Manufacturing Solutions, an RPS webstore, mycrudestore.com, ASPDotNetStorefront, ASPDNSF, store skins, XML packages, topics, prompts, tokens, AppConfigs, customer groups, StoreID behavior, allowances, points, products, checkout, users, authentication, or other RPS ecommerce-platform behavior:

1. Treat the local ASPDNSF manual below as the primary platform-documentation source:

   `$manualPath`

2. Read `$manualPath\AGENTS.md` before performing platform-specific work.
3. Search the manual's HTML files for relevant documented behavior before recommending or implementing changes.
4. Inspect the current RPS project's existing implementation before proposing new architecture.
5. Do not rely only on generic ASP.NET, MVC, Razor, or modern ecommerce assumptions.
6. Do not invent ASPDNSF tokens, AppConfigs, fields, database tables, admin features, XML package behavior, or supported functionality.
7. Clearly distinguish documented ASPDNSF behavior from RPS-specific customization or inference.
8. Report the exact manual filenames or pages consulted in the final response.
9. Preserve multistore compatibility unless the task explicitly applies to one store only.
10. If the local manual path is unavailable in the current environment, use the canonical repository as the fallback reference and state that the local copy could not be accessed:

    `https://github.com/i22y/-aspdnsf-offline-manual`

Do not modify the archived manual pages unless the user specifically asks to update the documentation.
$endMarker
"@

if ([string]::IsNullOrWhiteSpace($preservedContent)) {
    $newContent = $managedBlock.Trim() + [Environment]::NewLine
}
else {
    $newContent = $preservedContent.Trim() + [Environment]::NewLine + [Environment]::NewLine + $managedBlock.Trim() + [Environment]::NewLine
}

Set-Content -LiteralPath $agentsPath -Value $newContent -Encoding UTF8

Write-Host 'RPS ASPDNSF reference instructions were installed for Codex.'
Write-Host "Manual path: $manualPath"
Write-Host "Codex instructions file: $agentsPath"
Write-Host ''
Write-Host 'Restart Codex or open a new Codex session before testing the instructions.'
