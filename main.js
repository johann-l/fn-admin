const path = require("path");
const { app, BrowserWindow, net } = require("electron");
const { autoUpdater } = require("electron-updater");
const { spawn } = require("child_process");

const isWin = process.platform === "win32";
const isDev = process.env.NODE_ENV === "development";

let mainWindow;
let splashWindow;
let nextServerProcess; // For running next start in production

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true, // needed so splash can update its HTML
      contextIsolation: false,
    },
  });

  splashWindow.loadFile(path.join(__dirname, "splash.html"));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "FleetNow",
    width: 1920,
    height: 1080,
    fullscreen: true,
    show: false, // don’t show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:9002/login");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL("http://localhost:3000/login");
  }

  mainWindow.webContents.once("did-finish-load", () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (nextServerProcess) nextServerProcess.kill();
  });
}

function checkInternet(cb) {
  const request = net.request("https://www.google.com");
  request.on("response", () => cb(true));
  request.on("error", () => cb(false));
  request.end();
}

function tryLoadApp() {
  checkInternet((online) => {
    if (!online) {
      if (splashWindow) {
        splashWindow.webContents.send("no-internet");
      }
      // retry after 5s
      setTimeout(tryLoadApp, 5000);
      return;
    }

    if (!isDev) {
      // Start Next.js production server
      const nextPath = path.join(__dirname, "node_modules", ".bin", "next");
      nextServerProcess = spawn(nextPath, ["start"], {
        cwd: __dirname,
        shell: true,
      });

      nextServerProcess.stdout.on("data", (data) => {
        console.log(`Next.js: ${data}`);
        if (data.toString().includes("started server")) {
          createMainWindow();
        }
      });

      nextServerProcess.stderr.on("data", (data) => {
        console.error(`Next.js Error: ${data}`);
      });
    } else {
      createMainWindow();
    }
  });
}

app.on("ready", () => {
  if (!isWin) {
    app.quit();
    return;
  }

  createSplashWindow();
  tryLoadApp();

  autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
