const path = require("path");
const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");

const isWin = process.platform === "win32";
const isDev = process.env.NODE_ENV === "development";

function createMainWindow() {
  const win = new BrowserWindow({
    title: "FleetNow",
    width: 1920,
    height: 1080,
    fullscreen: true,
  });

  if (isDev) {
    win.webContents.openDevTools();
  }

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "./fn-admin/build/index.html")}`
  );

  win.webContents.on("will-navigate", (e) => e.preventDefault());

  win.maximize();
}

app.on("ready", () => {
  if (!isWin) {
    app.quit(); // Quit early on unsupported OS
    return;
  }

  const { autoUpdater } = require("electron-updater");

  app.on("ready", () => {
    createMainWindow();
    autoUpdater.checkForUpdatesAndNotify(); // checks and downloads updates
  });

  createMainWindow();
  autoUpdater.checkForUpdatesAndNotify();
});
