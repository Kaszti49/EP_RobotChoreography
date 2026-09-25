param(
  # robot id -> COM port, e.g. @{1='COM6';2='COM10';3='COM13';4='COM8';5='COM5'}
  [Parameter(Mandatory)][hashtable]$Ports,
  [string]$Show = "data/keringo-show.json",
  [int]$Seconds = 200,
  [string]$Label = ""
)
# Run SEVERAL robots' show sketches at once over their COM ports -- the shell
# twin of the Muszerfal's "Start mind": X (wake the idle SPP links), 300 ms,
# then T to every port back to back. The beat clock is in each sketch, so
# robots that get T together stay in step.
#   .\tools\run-all.ps1 -Ports @{1='COM6';3='COM13';4='COM8'} -Label proba1
# Every robot's lines go to logs/run_robot<N>_<stamp>_<label>.log and each log
# is traced with tools/trace.js at the end.
# EMERGENCY STOP from another window (the ports are held by this script):
#   New-Item logs\STOP      -> S goes to every robot, the script ends.
$root = Split-Path (Split-Path $PSCommandPath)
$logDir = Join-Path $root "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory $logDir | Out-Null }
$stopFile = Join-Path $logDir "STOP"
if (Test-Path $stopFile) { Remove-Item $stopFile }
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$suffix = if ($Label) { "_$Label" } else { "" }

$ids = @($Ports.Keys | Sort-Object)
$sp = @{}; $log = @{}; $done = @{}
foreach ($id in $ids) {
  $p = New-Object System.IO.Ports.SerialPort $Ports[$id],115200,None,8,One
  $p.ReadTimeout = 500; $p.WriteTimeout = 3000
  $ok = $false
  for ($i = 0; $i -lt 4 -and -not $ok; $i++) { try { $p.Open(); $ok = $true } catch { Start-Sleep -Seconds 2 } }
  if (-not $ok) { "robot ${id}: could not open $($Ports[$id]) (browser tab holding it? robot off?)"; foreach ($q in $sp.Values) { $q.Close() }; exit 1 }
  $sp[$id] = $p; $log[$id] = ""; $done[$id] = $false
  "robot ${id}: $($Ports[$id]) open"
}
try {
  Start-Sleep -Milliseconds 500
  foreach ($id in $ids) { $sp[$id].DiscardInBuffer(); $sp[$id].Write("X`n") }
  Start-Sleep -Milliseconds 1200
  foreach ($id in $ids) { $sp[$id].DiscardInBuffer(); $sp[$id].Write("V`n") }
  Start-Sleep -Milliseconds 700
  foreach ($id in $ids) { $log[$id] += $sp[$id].ReadExisting() }
  "battery: " + (($ids | ForEach-Object { "robot $_ " + ((($log[$_] -split "`r?`n") | Where-Object { $_ -match "^V," } | Select-Object -Last 1) -replace "V,", "") + " mV" }) -join " | ")
  foreach ($id in $ids) { $sp[$id].Write("X`n") }
  Start-Sleep -Milliseconds 300
  $t0 = Get-Date
  foreach ($id in $ids) { $sp[$id].Write("T`n") }
  "T sent to robot $($ids -join ', ') at $(Get-Date -Format HH:mm:ss.fff) (spread $([int]((Get-Date) - $t0).TotalMilliseconds) ms)"
  while (((Get-Date) - $t0).TotalSeconds -lt $Seconds) {
    Start-Sleep -Milliseconds 200
    if (Test-Path $stopFile) {
      foreach ($id in $ids) { try { $sp[$id].Write("S`n") } catch {} }
      "!!! STOP file seen -- S sent to every robot"; Start-Sleep -Milliseconds 800
      foreach ($id in $ids) { try { $log[$id] += $sp[$id].ReadExisting() } catch {} }
      break
    }
    foreach ($id in $ids) {
      try {
        if ($sp[$id].BytesToRead -gt 0) {
          $chunk = $sp[$id].ReadExisting(); $log[$id] += $chunk
          foreach ($line in ($chunk -split "`r?`n")) { if ($line.Trim()) { Write-Host "[$id] $line" } }
        }
      } catch { $log[$id] += "`n[read error: $($_.Exception.Message)]`n" }
      if (-not $done[$id] -and $log[$id] -match "SHOW VEGE") { $done[$id] = $true; "robot ${id}: SHOW VEGE at $([int]((Get-Date) - $t0).TotalSeconds) s" }
    }
    if (($done.Values | Where-Object { -not $_ }).Count -eq 0) { Start-Sleep -Milliseconds 1500; foreach ($id in $ids) { try { $log[$id] += $sp[$id].ReadExisting() } catch {} }; break }
  }
  foreach ($id in $ids) { try { $sp[$id].Write("V`n") } catch {} }
  Start-Sleep -Milliseconds 800
  foreach ($id in $ids) { try { $log[$id] += $sp[$id].ReadExisting() } catch {} }
} finally { foreach ($p in $sp.Values) { if ($p.IsOpen) { $p.Close() } } }

""
"elapsed: $([int]((Get-Date) - $t0).TotalSeconds) s"
$paths = @{}
foreach ($id in $ids) {
  $paths[$id] = Join-Path $logDir "run_robot${id}_${stamp}${suffix}.log"
  $log[$id] | Out-File -Encoding utf8 $paths[$id]
  $bat = (($log[$id] -split "`r?`n") | Where-Object { $_ -match "^V," }) -join " -> "
  $end = if ($log[$id] -match "SHOW VEGE") { "SHOW VEGE" } else { "!!! no SHOW VEGE (stopped or timed out)" }
  "robot ${id}: $end; battery $bat; log $($paths[$id])"
}
Push-Location $root
try {
  foreach ($id in $ids) {
    ""; "=================== robot $id ==================="
    node tools/trace.js $paths[$id] --robot $id --show $Show
  }
} finally { Pop-Location }
