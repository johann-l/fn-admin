const path = require('path');
const { app, BrowserWindow} = require('electron');
const isWin = process.platform === 'win32';
const isDev = process.env.NODE_ENV === 'development';

function createMainWindow(){
 const win = new BrowserWindow({
    title: "FleetNow",
    width: 1920,
    height: 1080,
    fullscreen: true
 });
 if (isDev) { 
    win.webContents.openDevTools();
 }
 win.loadFile(path.join(__dirname, './renderer/pages/index.html'));
 win.maximize();
}

app.on('ready', () => {
    if(!isWin){
        app.quit();
    }
    createMainWindow();
})

const { autoUpdater } = require("electron-updater");

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});