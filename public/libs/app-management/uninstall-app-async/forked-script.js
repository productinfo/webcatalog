const path = require('path');
const fsExtra = require('fs-extra');
const argv = require('yargs-parser')(process.argv.slice(1));
const sudo = require('sudo-prompt');

const {
  id,
  name,
  installationPath,
  requireAdmin,
  homePath,
  desktopPath,
  username,
} = argv;

const sudoAsync = (prompt) => new Promise((resolve, reject) => {
  const opts = {
    name: 'WebCatalog',
  };
  console.log(prompt);
  process.env.USER = username;
  sudo.exec(prompt, opts, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      return reject(error);
    }
    console.log(stdout);
    console.log(stderr);
    return resolve(stdout, stderr);
  });
});

const checkExistsAndRemove = (dirPath) => fsExtra.exists(dirPath)
  .then((exists) => {
    if (exists) return fsExtra.remove(dirPath);
    return null;
  });

const checkExistsAndRemoveWithSudo = (dirPath) => fsExtra.exists(dirPath)
  .then((exists) => {
    if (exists) return sudoAsync(`rm -rf "${dirPath}"`);
    return null;
  });

const dotAppPath = process.platform === 'darwin'
  ? path.join(installationPath.replace('~', homePath), `${name}.app`)
  : path.join(installationPath.replace('~', homePath), `${name}`);

Promise.resolve()
  .then(() => {
    if (requireAdmin === 'true') {
      return checkExistsAndRemoveWithSudo(dotAppPath);
    }
    return checkExistsAndRemove(dotAppPath);
  })
  .then(() => {
    if (process.platform === 'darwin') {
      const appDataPath = path.join(homePath, 'Library', 'Application Support', name);
      return checkExistsAndRemove(appDataPath);
    }

    if (process.platform === 'linux') {
      const desktopFilePath = path.join(homePath, '.local', 'share', 'applications', `webcatalog-${id}.desktop`);
      return checkExistsAndRemove(desktopFilePath);
    }

    if (process.platform === 'win32') {
      const startMenuPath = path.join(homePath, 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'WebCatalog Apps');
      const startMenuShortcutPath = path.join(startMenuPath, `${name}.lnk`);
      const desktopShortcutPath = path.join(desktopPath, `${name}.lnk`);

      return Promise.all([
        checkExistsAndRemove(startMenuShortcutPath),
        checkExistsAndRemove(desktopShortcutPath),
      ]);
    }

    return null;
  })
  .then(() => {
    const chromiumDataPath = path.join(homePath, '.webcatalog', 'chromium-data', id);
    return checkExistsAndRemove(chromiumDataPath);
  })
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    process.send(e);
    process.exit(1);
  });

process.on('uncaughtException', (e) => {
  process.exit(1);
  process.send(e);
});
