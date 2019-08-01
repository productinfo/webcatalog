const {
  BrowserWindow,
  Menu,
  app,
  ipcMain,
} = require('electron');
const windowStateKeeper = require('electron-window-state');
const { menubar } = require('menubar');
const path = require('path');

const { REACT_PATH } = require('../constants');
const { getPreference } = require('../libs/preferences');

const {
  checkForUpdates,
} = require('../libs/updater');

let win;
let mb = {};

const get = () => {
  const attachToMenubar = getPreference('attachToMenubar');
  if (attachToMenubar) return mb.window;
  return win;
};

const createAsync = () => {
  const attachToMenubar = getPreference('attachToMenubar');
  if (attachToMenubar) {
    mb = menubar({
      index: REACT_PATH,
      icon: path.resolve(__dirname, '..', 'menubar-icon.png'),
      preloadWindow: true,
      browserWindow: {
        webPreferences: {
          nodeIntegration: true,
        },
      },
    });

    const contextMenu = Menu.buildFromTemplate([
      { role: 'about' },
      {
        label: 'Check for Updates...',
        click: () => checkForUpdates(),
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

    return new Promise((resolve, reject) => {
      try {
        mb.on('ready', () => {
          mb.tray.on('right-click', () => {
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
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minHeight: 100,
    title: global.appJson.name,
    titleBarStyle: 'hidden',
    show: !wasOpenedAsHidden,
    icon: process.platform === 'linux' ? path.resolve(__dirname, '..', 'icon.png') : null,
    webPreferences: {
      nodeIntegration: true,
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

  return Promise.resolve();
};

const show = () => {
  const attachToMenubar = getPreference('attachToMenubar');

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
  if (win !== null) {
    win.webContents.send(...args);
  }
};

module.exports = {
  createAsync,
  get,
  send,
  show,
};
