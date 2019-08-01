const { app } = require('electron');
const path = require('path');
const fsExtra = require('fs-extra');

const { getPreference } = require('../preferences');
const sendToAllWindows = require('../send-to-all-windows');

const getInstalledAppsAsync = () => {
  sendToAllWindows('clean-app-management');

  const apps = [];

  const installationPath = getPreference('installationPath').replace('~', app.getPath('home'));

  return Promise.resolve()
    .then(() => {
      if (fsExtra.pathExistsSync(installationPath)) {
        return fsExtra.readdir(installationPath)
          .then((files) => {
            files.forEach((fileName) => {
              if (fileName === '.DS_Store') return;

              const resourcesPath = process.platform === 'darwin'
                ? path.join(installationPath, fileName, 'Contents', 'Resources')
                : path.join(installationPath, fileName, 'resources');

              const packageJsonPath = path.join(resourcesPath, 'app.asar.unpacked', 'package.json');

              const legacyAppJsonPath = path.join(resourcesPath, 'app.asar.unpacked', 'public', 'app.json');
              const legacyIconPath = path.join(resourcesPath, 'app.asar.unpacked', 'public', 'icon.png');

              const appJsonPath = path.join(resourcesPath, 'app.asar.unpacked', 'build', 'app.json');
              const iconPath = path.join(resourcesPath, 'app.asar.unpacked', 'build', 'icon.png');

              let packageJson;
              let appJson;
              let icon;

              if (fsExtra.pathExistsSync(packageJsonPath)) {
                packageJson = fsExtra.readJSONSync(packageJsonPath);
              } else {
                return;
              }

              if (fsExtra.pathExistsSync(legacyAppJsonPath)) {
                appJson = fsExtra.readJSONSync(legacyAppJsonPath);
              } else if (fsExtra.pathExistsSync(appJsonPath)) {
                appJson = fsExtra.readJSONSync(appJsonPath);
              } else {
                return;
              }

              if (fsExtra.pathExistsSync(legacyIconPath)) {
                icon = legacyIconPath;
              } else if (fsExtra.pathExistsSync(iconPath)) {
                icon = iconPath;
              }

              apps.push(Object.assign(appJson, {
                version: packageJson.version,
                icon,
                status: 'INSTALLED',
              }));
            });
          });
      }

      return null;
    })
    .then(() => {
      apps.forEach((appObj) => {
        sendToAllWindows('set-app', appObj.id, appObj);
      });
    })
    .then(() => apps);
};

module.exports = getInstalledAppsAsync;
