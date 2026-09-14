param(
    [int]$Port = 8080
)

Set-Location $PSScriptRoot

$ip = (
    Get-NetIPConfiguration |
    Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq "Up" } |
    ForEach-Object { $_.IPv4Address.IPAddress } |
    Where-Object { $_ -and $_ -notmatch "^169\\.254\\." } |
    Select-Object -First 1
)

if (-not $ip) {
    $ip = (
        Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.IPAddress -notmatch "^169\\.254\\." } |
        Select-Object -ExpandProperty IPAddress -First 1
    )
}

if (-not $ip) {
    Write-Error "Could not determine a local IPv4 address."
    exit 1
}

Write-Output ""
Write-Output "Site preview is starting..."
Write-Output "Desktop URL: http://localhost:$Port/"
Write-Output "Mobile URL:  http://$ip`:$Port/"
Write-Output ""
Write-Output "Keep this terminal open while previewing."
Write-Output "Press Ctrl+C to stop."
Write-Output ""

python -m http.server $Port --bind 0.0.0.0
