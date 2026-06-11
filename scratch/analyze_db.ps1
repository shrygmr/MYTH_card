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

$venues = Get-State "myth_venues"
$deals = Get-State "myth_deals"
$reviews = Get-State "myth_reviews"

Write-Host "Total venues: $($venues.Count)"
Write-Host "Total deals: $($deals.Count)"
Write-Host "Total reviews: $($reviews.Count)"

# Check duplicate venue IDs
$idMap = @{}
foreach ($v in $venues) {
    $vid = $v.id
    if ($null -eq $vid) { continue }
    if (-not $idMap.ContainsKey($vid)) {
        $idMap[$vid] = [System.Collections.Generic.List[PSCustomObject]]::new()
    }
    $idMap[$vid].Add($v)
}

Write-Host "`nDuplicate Venue IDs found:"
$hasDuplicates = $false
foreach ($key in ($idMap.Keys | Sort-Object)) {
    if ($idMap[$key].Count -gt 1) {
        $hasDuplicates = $true
        Write-Host "ID $key`:"
        $idx = 0
        foreach ($v in $idMap[$key]) {
            Write-Host "  [$idx] $($v.name) ($($v.region))"
            $idx++
        }
    }
}
if (-not $hasDuplicates) {
    Write-Host "No duplicate Venue IDs found."
}

# Check references in deals
Write-Host "`nDeals references:"
foreach ($d in $deals) {
    $venueId = $d.venueId
    $title = $d.title
    $matching = $venues | Where-Object { $_.id -eq $venueId }
    if ($null -eq $matching -or $matching.Count -eq 0) {
        Write-Host "  Deal '$title' references non-existent venue ID: $venueId"
    } elseif ($matching.Count -gt 1) {
        $matchNames = ($matching | ForEach-Object { $_.name }) -join ", "
        Write-Host "  Deal '$title' references duplicated venue ID: $venueId (matches: $matchNames)"
    }
}

# Check references in reviews
Write-Host "`nReviews references:"
foreach ($r in $reviews) {
    $venueId = $r.venueId
    $text = $r.text
    if ($text.Length -gt 30) { $text = $text.Substring(0, 30) + "..." }
    $matching = $venues | Where-Object { $_.id -eq $venueId }
    if ($null -eq $matching -or $matching.Count -eq 0) {
        Write-Host "  Review '$text' references non-existent venue ID: $venueId"
    } elseif ($matching.Count -gt 1) {
        $matchNames = ($matching | ForEach-Object { $_.name }) -join ", "
        Write-Host "  Review '$text' references duplicated venue ID: $venueId (matches: $matchNames)"
    }
}
