@echo off
cd /d "C:\Users\Will\Documents\hippie-scientist-site"

echo Step 1: Staging changes...
git add -A

echo.
echo Step 2: Verifying staged changes...
git status

echo.
echo Step 3: Committing changes...
git commit -m "feat: add kratom 7-oh withdrawal management guide to curated guides list"

echo.
echo Step 4: Capturing commit hash...
for /f %%i in ('git rev-parse HEAD') do set COMMIT_HASH=%%i
echo Commit Hash: %COMMIT_HASH%

echo.
echo Step 5: Pushing to remote...
git push origin main

echo.
echo Step 6: Verification...
echo Push completed. Current branch status:
git log -1 --oneline

echo.
echo Remote status:
git status

echo.
echo Deployment complete!
echo Commit Hash: %COMMIT_HASH%

pause
