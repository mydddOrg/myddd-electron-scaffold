import { session, protocol, app, BrowserWindow, dialog, ipcMain, nativeImage, Notification } from 'electron'
import { autoUpdater } from "electron-updater"
const path = require('path')
const url = require('url')

const nodeEnv = process.env.NODE_ENV;
let win: BrowserWindow;
require('@electron/remote/main').initialize()

const globalAny: any = global;

globalAny.NODE_ENV = process.env.NODE_ENV;


app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });
});


//全局存储变量
globalAny.sharedObject = {
  type: null,
  auth: null,
  message: null,
  messages: null,
  index: -1
}


const gotTheLock = app.requestSingleInstanceLock()

const linuxIconUrl = process.env.NODE_ENV === 'development' ? path.join(__dirname, '/src/assets/icon.png') : path.join(__dirname, '/dist/assets/icon.png')

if (!gotTheLock) {
  app.quit()
} else {
  /**
   * 创建主窗口
   */
  const createWindow = () => {
    win = new BrowserWindow({
      width: 280, height: 380, backgroundColor: '#fff',
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        contextIsolation: false
      },
      resizable: false,
      show: false,
      frame: false,
      icon: linuxIconUrl
    })

    win.webContents.on('new-window', function (e, url) {
      e.preventDefault();
      win.webContents.send('OPEN_URL_EXTERNAL', url);
    });

    require("@electron/remote/main").enable(win.webContents)

    win.hide();

    loadWindow(win, nodeEnv);

    win.on('closed', () => {
      console.error('closed')
      app.quit();
      win = null
    });

  }

  
  app.on('ready', () => {
    //创建主界面
    createWindow();
    listener();
    if (process.env.NODE_ENV != 'development') {
      updateHandle();
    }

    if (process.platform === 'win32') {
      app.setAppUserModelId("org.myddd.electron.desktop");
    }

  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
    win.show();
  });

  // 根据运行环境加载窗口 //
  const loadWindow = (window: any, env: any) => {
    if (env === 'development') {
      window.loadURL(url.format({
        pathname: 'localhost:3000',
        protocol: 'http:',
        slashes: true
      }));
      loadDevTool();
    } else {
      const loadUrl: any = url.format({
        pathname: path.resolve(app.getAppPath(), 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true
      });
      window.loadURL(loadUrl);
    }

    window.once('ready-to-show', () => {
      window.show();
      window.center();
    })
  }

  const loadDevTool = () => {
    win.webContents.openDevTools({ mode: 'detach' })
  }


  const clearCache = () => {
    session.defaultSession.clearCache();
  }


  const listener = () => {
    ipcMain.on('QUITE_APP', () => {
      win.close();
      app.quit();
    })

    ipcMain.on('HIDDEN_APP', () => {
      win.hide();
    })

    //打开DEV TOOLS
    ipcMain.on('OPEN_DEV_TOOLS', (event: any, arg: any) => {
      loadDevTool();
    })

        //打开DEV TOOLS
    ipcMain.on('CLEAR_CACHE', (event: any, arg: any) => {
      clearCache();
    })
  }
}

const uploadUrl = 'https://myddd.org/update/'

let checked = false;

const updateHandle = () => {

  autoUpdater.setFeedURL(uploadUrl);

  autoUpdater.on('error', function (error) {
    new Notification({
      title: '更新检测异常',
      body: '异常代码:' + error
    }).show()
  });

  autoUpdater.on('checking-for-update', function () {
  });

  autoUpdater.on('update-available', function (info) {
    new Notification({
      title: '检测到新版本',
      body: '在后台为您下载新版本中'
    }).show()
  });

  autoUpdater.on('update-not-available', function (info) {
    if (checked) return;
    checked = true;
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {

  })

  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    const dialogOpts = {
      type: 'info',
      buttons: ['重启更新', '稍后更新'],
      title: '更新提示',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: '检测到新版本，是否马上重启并更新'
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
  });

  //执行自动更新检查
  autoUpdater.checkForUpdates();

  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 1000 * 60 * 15)
}