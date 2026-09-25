param([Parameter(Mandatory)][string]$Port, [Parameter(Mandatory)][string]$Bin)
# Bluetooth / USB OTA from PowerShell -- host side of the keret-ep protocol
# (transport/README.md): F,<size>,<md5> -> F,READY, then raw bytes in
# 4096-byte windows, F,ACK,<n> after each, F,OK at the end, robot reboots.
#   .\tools\ota.ps1 -Port COM5 -Bin build\robot5\robot5.ino.bin
# Robot 5 over SPP: 1.1 MB in ~23 s. Close the browser tab holding the port first.
$bytes = [IO.File]::ReadAllBytes((Resolve-Path $Bin))
$md5 = ([Security.Cryptography.MD5]::Create().ComputeHash($bytes) | ForEach-Object { $_.ToString("x2") }) -join ""
$p = New-Object System.IO.Ports.SerialPort $Port,115200,None,8,One
$p.ReadTimeout = 15000; $p.WriteTimeout = 15000; $p.NewLine = "`n"
function ReadLineTimeout($sp, $ms) {
  $t0 = Get-Date; $buf = ""
  while (((Get-Date) - $t0).TotalMilliseconds -lt $ms) {
    if ($sp.BytesToRead -gt 0) { $buf += $sp.ReadExisting(); if ($buf -match "`n") { return $buf } }
    Start-Sleep -Milliseconds 20
  }
  return $buf
}
try {
  $p.Open(); Start-Sleep -Milliseconds 500; $p.DiscardInBuffer()
  $p.Write("`n"); Start-Sleep -Milliseconds 800; $p.DiscardInBuffer()     # wake an idle link
  $p.Write("F,$($bytes.Length),$md5`n")
  $r = ReadLineTimeout $p 8000
  "handshake: " + ($r -replace "`r?`n", " | ")
  if ($r -notmatch "F,READY") { throw "no F,READY" }
  $win = 4096; $sent = 0; $t0 = Get-Date
  while ($sent -lt $bytes.Length) {
    $n = [Math]::Min($win, $bytes.Length - $sent)
    $p.Write($bytes, $sent, $n); $sent += $n
    $r = ReadLineTimeout $p 15000
    if ($r -notmatch "F,ACK,(\d+)") { throw "no ACK after $sent bytes: $r" }
    if ([int]$Matches[1] -ne $sent) { throw "ACK mismatch: robot $($Matches[1]) vs sent $sent" }
    if ($sent % (64 * $win) -eq 0) { "  $sent / $($bytes.Length) bytes" }
  }
  $r = ReadLineTimeout $p 20000
  "final: " + ($r -replace "`r?`n", " | ") + "  ($([int]((Get-Date) - $t0).TotalSeconds) s, $([int]($bytes.Length / ((Get-Date) - $t0).TotalSeconds / 1024)) kB/s)"
  if ($r -notmatch "F,OK") { throw "no F,OK" }
} catch { "ERR: $($_.Exception.Message)"; exit 1 } finally { if ($p.IsOpen) { $p.Close() } }
