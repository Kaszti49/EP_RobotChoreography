param([Parameter(Mandatory)][string]$Port, [Parameter(Mandatory)][string]$Cmd, [int]$WaitMs = 800)
# One line to a robot, print what comes back.   .\tools\say.ps1 -Port COM5 S      (stop)
#                                              .\tools\say.ps1 -Port COM5 V      (battery mV)
$p = New-Object System.IO.Ports.SerialPort $Port,115200,None,8,One
$p.ReadTimeout = 500; $p.WriteTimeout = 3000
try {
  $p.Open(); Start-Sleep -Milliseconds 300; $p.DiscardInBuffer()
  $p.Write("$Cmd`n"); Start-Sleep -Milliseconds $WaitMs
  $p.ReadExisting()
} catch { "ERR: $($_.Exception.Message)"; exit 1 } finally { if ($p.IsOpen) { $p.Close() } }
