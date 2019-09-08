const path = require('path');
const { fork } = require('child_process');
const { app } = require('electron');

const { getPreference } = require('./../../preferences');
const isEngineInstalled = require('../../is-engine-installed');

const installAppAsync = (
  engine, id, name, url, icon, mailtoHandler,
) => new Promise((resolve, reject) => {
  if (!isEngineInstalled(engine)) {
    let engineName;
    switch (engine) {
      case 'electron': {
        engineName = 'Electron';
        break;
      }
      case 'firefox': {
        engineName = 'Mozilla Firefox';
        break;
      }
      case 'chromium': {
        engineName = 'Chromium';
        break;
      }
      default:
      case 'chrome': {
        engineName = 'Google Chrome';
        break;
      }
    }
    reject(new Error(`${engineName} is not installed.`));
    return;
  }

  const scriptPath = path.join(__dirname, engine === 'electron' ? 'forked-script-electron.js' : 'forked-script-lite.js');

  const params = [
    '--engine',
    engine,
    '--id',
    id,
    '--name',
    name,
    '--url',
    url,
    '--icon',
    icon,
    '--homePath',
    app.getPath('home'),
    '--desktopPath',
    app.getPath('desktop'),
    '--installationPath',
    getPreference('installationPath'),
    '--requireAdmin',
    getPreference('requireAdmin').toString(),
    '--username',
    process.env.USER, // required by sudo-prompt,
    '--createDesktopShortcut',
    getPreference('createDesktopShortcut'),
    '--createStartMenuShortcut',
    getPreference('createStartMenuShortcut'),
  ];

  if (mailtoHandler && mailtoHandler.length > 0) {
    params.push(
      '--mailtoHandler',
      mailtoHandler,
    );
  }

  const child = fork(scriptPath, params, {
    env: {
      ELECTRON_RUN_AS_NODE: 'true',
      ELECTRON_NO_ASAR: 'true',
      APPDATA: app.getPath('appData'),
    },
  });

  child.on('message', (message) => {
    console.log(message);
  });

  child.on('exit', (code) => {
    if (code === 1) {
      reject(new Error('Forked script failed to run correctly.'));
      return;
    }

    resolve();
  });
});

module.exports = installAppAsync;
