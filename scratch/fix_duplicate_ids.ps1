$apiKey = "AIzaSyBjLc8L34Ok0s7Ml55iYjEHIy2-vLncl7E"
$projectId = "myth-card"

function Get-State($key) {
    $url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/myth_state/$key`?key=$apiKey"
    $response = Invoke-RestMethod -Uri $url -Method Get
    if ($response.fields.data.stringValue) {
        return ConvertFrom-Json $response.fields.data.stringValue
    }
    return @()
}

function Save-State($key, $data) {
    $url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/myth_state/$key`?key=$apiKey"
    $json = ConvertTo-Json -InputObject $data -Depth 10 -Compress
    $payload = @{
        fields = @{
            data = @{
                stringValue = $json
            }
        }
    } | ConvertTo-Json -Depth 5 -Compress
    
    $utf8Payload = [System.Text.Encoding]::UTF8.GetBytes($payload)
    $response = Invoke-RestMethod -Uri $url -Method Patch -Body $utf8Payload -ContentType "application/json; charset=utf-8"
    return $response
}

$venues = Get-State "myth_venues"

$seenIds = @{}
$nextId = 1100
$modifiedCount = 0

foreach ($v in $venues) {
    $vid = $v.id
    if ($null -eq $vid) { continue }
    
    # Force ID to be an integer (in case it is imported as a string or double)
    $vidInt = [int64]$vid
    
    if ($seenIds.ContainsKey($vidInt)) {
        # Duplicate! Assign new ID
        Write-Host "Duplicate found for: $($v.name) ($($v.region)) with ID $vidInt"
        $v.id = $nextId
        Write-Host "  -> Assigned new ID: $nextId"
        $nextId++
        $modifiedCount++
    } else {
        $seenIds[$vidInt] = $true
    }
}

if ($modifiedCount -gt 0) {
    Write-Host "`nSaving modified venues to Firebase..."
    $saveResult = Save-State "myth_venues" $venues
    Write-Host "Successfully saved to Firebase."
    
    # Also write to local backup file
    Write-Host "Saving to local backup file..."
    $localPath = "c:\Users\stj.sahra.berk\Desktop\work\myth_venues_backup_final.json"
    $localJson = ConvertTo-Json -InputObject $venues -Depth 10
    [System.IO.File]::WriteAllText($localPath, $localJson, [System.Text.Encoding]::UTF8)
    Write-Host "Successfully saved to $localPath"
} else {
    Write-Host "No duplicates found, nothing to do."
}
