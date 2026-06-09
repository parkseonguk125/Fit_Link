$ErrorActionPreference = "Stop"

try {
  $rule = Get-NetFirewallRule -DisplayName "Fit Link 8082" -ErrorAction SilentlyContinue
  if ($rule) {
    Write-Host "Windows firewall: port 8082 rule already exists"
    exit 0
  }

  New-NetFirewallRule `
    -DisplayName "Fit Link 8082" `
    -Direction Inbound `
    -LocalPort 8082 `
    -Protocol TCP `
    -Action Allow `
    -Profile Private, Domain | Out-Null

  Write-Host "Windows firewall: added inbound rule for port 8082 (Private/Domain)"
} catch {
  Write-Host "Firewall rule failed (run PowerShell as Administrator): npm run docker:firewall"
  exit 1
}
