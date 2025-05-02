-- for running electron
run "npx install" to install dependencies (just the first time is enough)
then run "npx electronmon ."

-- for the changes in app (auto update)
Each time you want to ship a new version:

Bump version in package.json:
X is the new version
> {.."version": "1.0.X"..}

Run on bash:

> npx electron-builder --publish always

That’s it. 🎉 All installed apps will auto-update.
