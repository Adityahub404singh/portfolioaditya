$ErrorActionPreference = "Stop"
$folders = @("public\images","src\components","src\hooks","src\lib","src\pages","supabase")
foreach ($folder in $folders) { New-Item -ItemType Directory -Force -Path $folder | Out-Null }
Write-Host "APS Portfolio Studio structure created." -ForegroundColor Cyan
