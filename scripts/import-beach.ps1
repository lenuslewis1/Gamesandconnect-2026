$ErrorActionPreference = 'Stop'
$assetDir = Join-Path (Split-Path $PSScriptRoot) 'public/assets/games-connect/beach-hangout'
New-Item -ItemType Directory -Force -Path $assetDir | Out-Null
$photos = Get-Content (Join-Path $PSScriptRoot 'beach-photos.json') -Raw | ConvertFrom-Json
$photos | ForEach-Object -Parallel {
  $target = Join-Path $using:assetDir ($_.name + '.jpg')
  if (!(Test-Path -LiteralPath $target)) {
    Invoke-WebRequest -Uri ('https://drive.google.com/thumbnail?id=' + $_.id + '&sz=w1600') -OutFile $target -TimeoutSec 60
  }
  $bytes = [IO.File]::ReadAllBytes($target)
  if ($bytes.Length -lt 1000 -or $bytes[0] -ne 255 -or $bytes[1] -ne 216) { throw "Invalid JPEG: $target" }
  Write-Output $_.name
} -ThrottleLimit 5
