const {
  BrowserWindow,
  Menu,
  app,
  ipcMain,
} = require('electron');
const windowStateKeeper = require('electron-window-state');
const { menubar } = require('menubar');
const path = require('path');

const { REACT_PATH } = require('../constants/paths');
const { getPreference } = require('../libs/preferences');
const appJson = require('../app.json');

let win;
let mb = {};
let attachToMenubar = false;

const get = () => {
  if (attachToMenubar) return mb.window;
  return win;
};

const createAsync = () => {
  attachToMenubar = getPreference('attachToMenubar');
  if (attachToMenubar) {
    const menubarWindowState = windowStateKeeper({
      file: 'window-state-menubar.json',
      defaultWidth: 400,
      defaultHeight: 400,
    });

    mb = menubar({
      index: REACT_PATH,
      icon: path.resolve(__dirname, '..', 'menubar-icon.png'),
      preloadWindow: true,
      tooltip: appJson.name,
      browserWindow: {
        x: menubarWindowState.x,
        y: menubarWindowState.y,
        width: menubarWindowState.width,
        height: menubarWindowState.height,
        minHeight: 100,
        minWidth: 250,
        webPreferences: {
          nodeIntegration: true,
          preload: path.join(__dirname, '..', 'preload', 'menubar.js'),
        },
      },
    });

    return new Promise((resolve, reject) => {
      try {
        mb.on('after-create-window', () => {
          menubarWindowState.manage(mb.window);

          mb.window.on('focus', () => {
            const view = mb.window.getBrowserView();
            if (view && view.webContents) {
              view.webContents.focus();
            }
          });
        });

        mb.on('ready', () => {
          mb.tray.on('right-click', () => {
            const contextMenu = Menu.buildFromTemplate([
              {
                label: `Open ${appJson.name}`,
                click: () => mb.showWindow(),
              },
              {
                type: 'separator',
              },
              {
                label: `About ${appJson.name}`,
                click: () => ipcMain.emit('request-show-about-window'),
              },
              { type: 'separator' },
              {
                label: 'Check for Updates...',
                click: () => ipcMain.emit('request-check-for-updates'),
              },
              { type: 'separator' },
              {
                label: 'Preferences...',
                click: () => ipcMain.emit('request-show-preferences-window'),
              },
              { type: 'separator' },
              {
                label: 'Quit',
                click: () => {
                  mb.app.quit();
                },
              },
            ]);

            mb.tray.popUpContextMenu(contextMenu);
          });

          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }


  const { wasOpenedAsHidden } = app.getLoginItemSettings();

  const mainWindowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 768,
  });

  win = new BrowserWindow({
    backgroundColor: '#FFF',
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minHeight: 100,
    minWidth: 350,
    title: global.appJson.name,
    titleBarStyle: 'hidden',
    show: false,
    icon: process.platform === 'linux' ? path.resolve(__dirname, '..', 'icon.png') : null,
    autoHideMenuBar: getPreference('hideMenuBar'),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, '..', 'preload', 'main.js'),
    },
  });

  mainWindowState.manage(win);

  win.loadURL(REACT_PATH);

  // Enable swipe to navigate
  const swipeToNavigate = getPreference('swipeToNavigate');
  if (swipeToNavigate) {
    win.on('swipe', (e, direction) => {
      const view = win.getBrowserView();
      if (view) {
        if (direction === 'left') {
          view.webContents.goBack();
        } else if (direction === 'right') {
          view.webContents.goForward();
        }
      }
    });
  }

  // Hide window instead closing on macos
  win.on('close', (e) => {
    if (process.platform === 'darwin' && !win.forceClose) {
      e.preventDefault();
      win.hide();
    }
  });

  win.on('closed', () => {
    win = null;
  });

  win.on('focus', () => {
    const view = win.getBrowserView();
    if (view && view.webContents) {
      view.webContents.focus();
    }
  });

  // Fix webview is not resized automatically
  // when window is maximized on Linux
  // https://github.com/atomery/webcatalog/issues/561
  if (process.platform === 'linux') {
    const handleMaximize = () => {
      // getContentSize is not updated immediately
      // try once after 0.2s (for fast computer), another one after 1s (to be sure)
      setTimeout(() => {
        ipcMain.emit('request-realign-active-workspace');
      }, 200);
      setTimeout(() => {
        ipcMain.emit('request-realign-active-workspace');
      }, 1000);
    };
    win.on('maximize', handleMaximize);
    win.on('unmaximize', handleMaximize);
  }

  return new Promise((resolve) => {
    win.once('ready-to-show', () => {
      resolve();
      if (!wasOpenedAsHidden) {
        win.show();
      }
    });

    win.loadURL(REACT_PATH);
  });
};

const show = () => {
  if (attachToMenubar) {
    if (mb == null) {
      createAsync();
    } else {
      mb.on('ready', () => {
        mb.showWindow();
      });
    }
  } else if (win == null) {
    createAsync();
  } else {
    win.show();
  }
};

const send = (...args) => {
  if (get() !== null) {
    get().webContents.send(...args);
  }
};

module.exports = {
  createAsync,
  get,
  send,
  show,
};
