$body = @{
    email = "test@example.com"
    password = "123456"
    name = "Test User"
} | ConvertTo-Json

Write-Host "Testing Register API..."
$response = Invoke-RestMethod -Uri "http://localhost:3001/auth/register" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10

Write-Host "`nTesting Login API..."
$loginBody = @{
    email = "test@example.com"
    password = "123456"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$loginResponse | ConvertTo-Json -Depth 10
