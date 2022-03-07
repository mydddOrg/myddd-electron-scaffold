import { session, protocol, app, BrowserWindow, clipboard, dialog, globalShortcut, ipcMain, Menu, nativeImage, Notification, Tray, systemPreferences } from 'electron'
import { autoUpdater } from "electron-updater"
import Events from 'events'
const path = require('path')
const fs = require('fs')
const os = require('os')
const url = require('url')

const nodeEnv = process.env.NODE_ENV;
let win: BrowserWindow;
let imageWin: ImageWindow;
let documentWin: DocumentWindow;
let joinMeetingWin: JoinMettingWindow;
let tray: any;

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

const iconUrl = process.env.NODE_ENV === 'development' ? path.join(__dirname, '/src/assets/icon_toolbar.png') : path.join(__dirname, '/dist/assets/icon_toolbar.png')
const icon = nativeImage.createFromPath(iconUrl)

const alertIconUrl = process.env.NODE_ENV === 'development' ? path.join(__dirname, '/src/assets/alert.png') : path.join(__dirname, '/dist/assets/alert.png')
const alertIcon = nativeImage.createFromPath(alertIconUrl)

//新消息通知
let timer: any;
let count = 0

if (!gotTheLock) {
  app.quit()
} else {

  /**
 * 创建托盘
 */
  const createTray = () => {
    tray = new Tray(icon)
    tray.setToolTip('WorkPlus');

    if (process.platform == 'win32') {
      const contextMenu = Menu.buildFromTemplate([
        { label: '退出', click: () => app.quit() }
      ])
      tray.setContextMenu(contextMenu);
    }

    tray.on('click', () => {
      clearTrayAlert();
    });
  }

  const clearTrayAlert = () => {
    win.show();

    if (win.isMinimized()) {
      win.restore();
    }
    tray.setImage(icon)
    clearInterval(timer)
    timer = null
    count = 0
  }

  const isMac = process.platform === 'darwin'


  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
      ]
    }] : []),
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startspeaking' },
              { role: 'stopspeaking' }
            ]
          }
        ] : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
          ])
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template as any)
  Menu.setApplicationMenu(menu)

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

  const spawn = require('child_process').spawn;

  const captureScreen = () => {
    return new Promise(function (resolve, reject) {
      try {
        fs.chmodSync(path.join(__dirname, './bin/ScreenCapture.app/Contents/MacOS/ScreenCapture'), 0o777);
        const capture = spawn(path.join(__dirname, './bin/ScreenCapture.app/Contents/MacOS/ScreenCapture'))
        capture.on('close', function (code: any) {
          if (code === 0) {
            resolve(code);
          } else {
            reject(code);
          }
        })
      } catch (e) {
        reject(e);
      }
    })
  }

  const clipImage = () => {
    win.webContents.send('SCREENSHOT_BEGIN');
    setTimeout(() => {

      if (process.platform == 'darwin') {
        captureScreen().then(function () {
          win.webContents.send('SCREENSHOT_FINISH');
          win.webContents.send('IMG_CLIPED');
        }, function (e: any) {
          console.log('fail', e);
          win.show();
        })
      }

      if (process.platform == 'win32') {

        const screen_window = require('child_process').execFile(path.join(__dirname, './bin/PrintScr.exe'))
        screen_window.on('exit', function (code: number) {
          if (code == 1) {
            win.webContents.send('SCREENSHOT_FINISH');
            win.webContents.send('IMG_CLIPED');
          }else{
            win.show();
          }
        })

        // screen_window.on('error',(error:any)=>{
        //   console.log('错误 error',error);
        // })
      }

    }, 300);
  }

  const initImageWin = () => {
    imageWin = new ImageWindow();
    imageWin.startImageView();
  }

  const initDocumentWin = () => {
    documentWin = new DocumentWindow();
  }

  const initOtherWins = () => {
    initImageWin();
    initDocumentWin();
    initJoinMeetingWin();
  }

  const initJoinMeetingWin = () => {
    joinMeetingWin = new JoinMettingWindow();
  }

  app.on('ready', () => {
    //创建主界面
    createWindow();
    //创建tray
    createTray();
    listener();
    initOtherWins();

    if (process.env.NODE_ENV != 'development') {
      updateHandle();
    }

    let clipShortcut = 'CmdOrCtrl+shift+a';
    if (process.env.NODE_ENV === 'development') {
      clipShortcut = 'shift+a';
    }

    if (process.platform == 'darwin' || process.platform == 'win32') {
      globalShortcut.register(clipShortcut, () => {
        clipImage();
      });
    }


    if (process.platform === 'win32') {
      app.setAppUserModelId("com.foreverht.workplus.pcx");
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
      initImageWin();
    }

    win.show();
    clearTrayAlert();


    if (process.env.NODE_ENV != 'development') {
      askForMediaAccess();
    }

  });

  //检测文件或者文件夹存在 nodeJS
  const fsExistsSync = (path: string) => {
    try {
      fs.accessSync(path, fs.F_OK);
    } catch (e) {
      return false;
    }
    return true;
  }

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

    ipcMain.on('SCREEN_SHOT_BEGIN', () => {
      clipImage();
    });

    ipcMain.on('QUITE_APP', () => {
      win.close();
      app.quit();
    })

    ipcMain.on('HIDDEN_APP', () => {
      win.hide();
    })

    ipcMain.on('HIDDEN_IMAGE', (e) => {
      imageWin.close();

    })

    //打开DEV TOOLS
    ipcMain.on('OPEN_DEV_TOOLS', (event: any, arg: any) => {
      loadDevTool();
    })

        //打开DEV TOOLS
    ipcMain.on('CLEAR_CACHE', (event: any, arg: any) => {
      clearCache();
    })

    /**最小化窗口时候消息通知 */
    ipcMain.on('MESSAGE_FOCUS', (event: any, arg: any) => {
      if(win.isMinimized()){
        win.flashFrame(true)
      }
      
    })

    ipcMain.on('CLIPBORAD_COPY_TEXT', (event: any, text: string) => {
      clipboard.writeText(text);
    })

    ipcMain.on('NEW_MESSAGE_NOTICE', (event: any, arg: any) => {
      if (win.isVisible()) return;
      if (!timer) {
        timer = setInterval(() => {
          count += 1
          if (count % 2 === 0) {
            tray.setImage(icon)
          } else {
            tray.setImage(alertIcon) // 创建一个空的nativeImage实例
          }
        }, 1000)
      }

    });

    ipcMain.on('CLEAR_MESSAGE_NOTICE', (event: any, arg: any) => {
      clearTrayAlert();
    });



    ipcMain.on('CLOSE_IMAGE_WIN', (event: any, arg: any) => {
      imageWin.close();
    })

    ipcMain.on('SHOW_IMAGE_WIN', (event: any, auth) => {
      globalAny.sharedObject.type = 'image';
      globalAny.sharedObject.auth = auth;
      imageWin.show();
    })

    ipcMain.on('SHOW_VIDEO_WIN', (event: any, auth) => {
      globalAny.sharedObject.type = 'video';
      globalAny.sharedObject.auth = auth;
      imageWin.show();
    })

    ipcMain.on('SHOW_DOCUMENT_WIN', (event: any, url: string) => {
      documentWin.show(url);
    })

    ipcMain.on('SHOW_JOIN_MEETING_WIN', (event: any, url: string) => {
      joinMeetingWin.show();
    })

    ipcMain.on('CLOSE_JOIN_MEETING_WIN', (event: any, url: string) => {
      joinMeetingWin.close();
    })

  }
}

/**
 * 图片浏览二级窗口
 */

class ImageWindow extends Events {

  // 浏览图片窗口对象
  public imageWin: BrowserWindow | null = null

  private width = 960;
  private heiht = 800;

  /**
  * 开始截图
  */
  public startImageView(): void {
    if (!this.imageWin) {
      this.createImageWindow();
    }

  }


  public close(): void {
    this.imageWin.webContents.send('Hidden_Image');
    this.imageWin.hide();
  }

  public show(): void {
    if (this.imageWin) {
      this.imageWin.webContents.send('RELOAD_MEDIA');
      this.imageWin.show();
    } else {
      this.createImageWindow();
    }
    this.imageWin.show();
    this.imageWin.focus();
  }

  constructor() {
    super()
  }

  /**
* 初始化窗口
*/
  private createImageWindow(): void {
    this.imageWin = new BrowserWindow({
      width: this.width, height: this.heiht, webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        contextIsolation: false
      },
      resizable: false,
      show: false,
      frame: false,
      fullscreenable: false,
    })

    this.imageWin.on('closed', () => {
      this.imageWin = null;
    });

    this.loadImageView(nodeEnv);
  }

  private loadImageView = (env: any) => { 
    const loadUrl: any = url.format({
      pathname: path.resolve(app.getAppPath(), 'dist', 'index.html'),
      protocol: 'file:',
      slashes: true
    });
    this.imageWin.loadURL(loadUrl + "#/imageWin");
    // this.imageWin.webContents.openDevTools({mode: 'detach' });

    this.imageWin.once('ready-to-show', () => {
      this.imageWin.hide();
      this.imageWin.center();
    })
  }

}

class DocumentWindow extends Events {

  public documentWin: BrowserWindow | null = null

  private width = 1080;
  private height = 960;

  public show(url: string): void {
    if (this.documentWin) {
      this.documentWin.show();
    } else {
      this.createImageWindow(url);
    }
    this.documentWin.show();
    this.documentWin.focus();
  }

  constructor() {
    super()
  }

  /**
* 初始化窗口
*/
  private createImageWindow(url: string): void {
    this.documentWin = new BrowserWindow({
      width: this.width, height: this.height,
      resizable: true,
      show: false,
      parent: win,
      webPreferences: {
        nodeIntegration: false,
        webSecurity: false
      },
    })

    this.documentWin.on('closed', () => {
      this.documentWin = null;
    });

    this.documentWin.loadURL(url);

    this.documentWin.webContents.openDevTools();
    this.documentWin.once('ready-to-show', () => {
      this.documentWin.hide();
      this.documentWin.center();
    })
  }

}

class JoinMettingWindow extends Events {

  public joinMeetingWin: BrowserWindow | null = null

  private width = 280;
  private height = 200;

  public show(): void {
    if (this.joinMeetingWin) {
      this.joinMeetingWin.show();
    } else {
      this.createWindow();
    }
    this.joinMeetingWin.show();
    this.joinMeetingWin.focus();
  }

  public close() {
    this.joinMeetingWin.hide();
  }

  constructor() {
    super()
    this.createWindow();
  }

  private createWindow(): void {
    this.joinMeetingWin = new BrowserWindow({
      width: this.width, height: this.height,
      resizable: false,
      show: false,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
      },
      parent:win,
      modal: true,
      movable:false
    })

    this.joinMeetingWin.on('closed', () => {
      this.joinMeetingWin = null;
    });

    const loadUrl: any = url.format({
      pathname: path.resolve(app.getAppPath(), 'dist', 'index.html'),
      protocol: 'file:',
      slashes: true
    });
    this.joinMeetingWin.loadURL(loadUrl + "#/joinMetting");
    // this.joinMeetingWin.webContents.openDevTools();

    this.joinMeetingWin.once('ready-to-show', () => {
      this.joinMeetingWin.hide();
      this.joinMeetingWin.center();
    })
  }

}


const uploadUrl = 'https://lite.workplus.io/update/'

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
    // new Notification({
    //   title: '版本提示',
    //   body: '当前已是最新版本，启动定时检测更新机制'
    // }).show()
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
const platform = os.platform();
const arch = os.arch();

async function askForMediaAccess(): Promise<boolean> {
  try {
    if (platform !== "darwin") {
      return true;
    }

    const status = await systemPreferences.getMediaAccessStatus("microphone");
    //
    console.info("Current microphone access status:", status);

    if (status === "not-determined") {
      const success = await systemPreferences.askForMediaAccess("microphone");
      console.info("Result of microphone access:",success.valueOf() ? "granted" : "denied");
    }

    const cameraStatus = await systemPreferences.getMediaAccessStatus("camera");
    if (cameraStatus === "not-determined") {
      const microSuccess = await systemPreferences.askForMediaAccess("camera");
      console.info("Result of microphone access:",microSuccess.valueOf() ? "granted" : "denied");
    }

    return status === "granted" && cameraStatus === 'granted';
  } catch (error) {
    console.error("Could not get microphone permission:", error.message);
  }
  return false;
}