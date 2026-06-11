$apiKey = "AIzaSyBjLc8L34Ok0s7Ml55iYjEHIy2-vLncl7E"
$projectId = "myth-card"

function Get-State($key) {
    $url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/myth_state/$key`?key=$apiKey"
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get
        if ($response.fields.data.stringValue) {
            return ConvertFrom-Json $response.fields.data.stringValue
        }
    } catch {
        Write-Host "Failed to fetch $key`: $_"
    }
    return @{}
}

$users = Get-State "myth_users"
Write-Host "Users content:"
$users | ConvertTo-Json -Depth 5
