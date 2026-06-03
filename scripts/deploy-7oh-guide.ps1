#!/usr/bin/env pwsh

# Navigate to project directory
Set-Location "C:\Users\Will\Documents\hippie-scientist-site"

# Stage all changes
Write-Host "Step 1: Staging changes..." -ForegroundColor Green
git add -A

# Verify staged changes
Write-Host "`nStep 2: Verifying staged changes..." -ForegroundColor Green
git status

# Commit with message
Write-Host "`nStep 3: Committing changes..." -ForegroundColor Green
git commit -m "feat: add kratom 7-oh withdrawal management guide to curated guides list"

# Capture and display commit hash
$commitHash = git rev-parse HEAD
Write-Host "Commit Hash: $commitHash" -ForegroundColor Cyan

# Push to remote
Write-Host "`nStep 4: Pushing to remote..." -ForegroundColor Green
git push origin main

# Verify deployment
Write-Host "`nStep 5: Verification..." -ForegroundColor Green
Write-Host "Push completed. Current branch status:" -ForegroundColor Cyan
git log -1 --oneline
Write-Host "`nRemote status:" -ForegroundColor Cyan
git status

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "Commit Hash: $commitHash" -ForegroundColor Cyan
