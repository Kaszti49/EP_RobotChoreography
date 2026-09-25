param(
  [Parameter(Mandatory)][int]$Robot,
  [Parameter(Mandatory)][string]$Port,
  [string]$Show = "data/keringo-show.json",
  [int]$Seconds = 200,
  [string]$Label = ""
)
# Run ONE robot's show sketch over its COM port and trace it.
#   .\tools\run-one.ps1 -Robot 5 -Port COM5
# Wakes the link, sends T, logs everything the robot says until "SHOW VEGE"
# (or -Seconds), reads the battery, saves logs/run_robot<N>_<stamp>.log and
# runs  node tools/trace.js  on it: encoder-reckoned pose vs the plan per beat.
# Stop early from another window:  .\tools\say.ps1 -Port COM5 S
$root = Split-Path (Split-Path $PSCommandPath)
$logDir = Join-Path $root "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory $logDir | Out-Null }
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$suffix = if ($Label) { "_$Label" } else { "" }
$logPath = Join-Path $logDir "run_robot${Robot}_${stamp}${suffix}.log"

$p = New-Object System.IO.Ports.SerialPort $Port,115200,None,8,One
$p.ReadTimeout = 500; $p.WriteTimeout = 3000
$ok = $false
for ($i = 0; $i -lt 4 -and -not $ok; $i++) { try { $p.Open(); $ok = $true } catch { Start-Sleep -Seconds 2 } }
if (-not $ok) { "could not open $Port (browser tab holding it?)"; exit 1 }
$log = ""
try {
  Start-Sleep -Milliseconds 500; $p.DiscardInBuffer(); $p.Write("`n"); Start-Sleep -Milliseconds 1200; $p.DiscardInBuffer()
  $p.Write("V`n"); Start-Sleep -Milliseconds 600; $log += $p.ReadExisting()
  $p.Write("T`n"); "T sent to robot $Robot on $Port at $(Get-Date -Format HH:mm:ss) -- log: $logPath"
  $t0 = Get-Date
  while (((Get-Date) - $t0).TotalSeconds -lt $Seconds) {
    Start-Sleep -Milliseconds 200
    try { if ($p.BytesToRead -gt 0) { $chunk = $p.ReadExisting(); $log += $chunk; Write-Host -NoNewline $chunk } }
    catch { $log += "`n[read error: $($_.Exception.Message)]`n" }
    if ($log -match "SHOW VEGE") { Start-Sleep -Milliseconds 1500; try { $log += $p.ReadExisting() } catch {}; break }
  }
  $p.Write("V`n"); Start-Sleep -Milliseconds 800; try { $log += $p.ReadExisting() } catch {}
} finally { if ($p.IsOpen) { $p.Close() } }
$log | Out-File -Encoding utf8 $logPath
""
"elapsed: $([int]((Get-Date) - $t0).TotalSeconds) s; battery lines: " + ((($log -split "`r?`n") | Where-Object { $_ -match "^V," }) -join " -> ")
if ($log -notmatch "SHOW VEGE") { "!!! no SHOW VEGE in the log (stopped or timed out)" }
""
Push-Location $root
try { node tools/trace.js $logPath --robot $Robot --show $Show } finally { Pop-Location }
