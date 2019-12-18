
import semver from 'semver';

export const isOutdatedApp = (id, state) => {
  const { apps } = state.appManagement;

  if (apps[id] && apps[id].status === 'INSTALLING') return false;

  if (apps[id] && apps[id].engine !== 'electron') return false;

  const v = apps[id] ? apps[id].version : null;
  const latestV = state.general.latestTemplateVersion;

  if (!v) return true;
  return semver.lt(v, latestV);
};

export const isCancelableApp = (id, state) => {
  const { apps } = state.appManagement;
  return (apps[id] && apps[id].cancelable);
};

export const getOutdatedAppsAsList = (state) => {
  const { apps } = state.appManagement;
  return Object.values(apps).filter((app) => isOutdatedApp(app.id, state));
};

export const getCancelableAppsAsList = (state) => {
  const { apps } = state.appManagement;
  return Object.values(apps).filter((app) => isCancelableApp(app.id, state));
};

export const getInstallingAppsAsList = (state) => {
  const { apps } = state.appManagement;
  return Object.values(apps).filter((app) => app.status !== 'INSTALLED');
};

export const getAppBadgeCount = (state) => {
  const { apps } = state.appManagement;
  return Object.values(apps)
    .filter((app) => isOutdatedApp(app.id, state) || app.status !== 'INSTALLED').length;
};

export const isNameExisted = (name, state) => {
  const { apps } = state.appManagement;
  return Boolean(Object.keys(apps).find((id) => {
    if (apps[id].name === name) {
      return true;
    }

    return false;
  }));
};

export const getAppCount = (state) => {
  const { apps } = state.appManagement;
  return Object.values(apps).length;
};

export const filterApps = (apps, query) => {
  if (query.length < 1) return apps;

  const processedQuery = query.trim().toLowerCase();

  const newApps = {};
  const keys = Object.keys(apps);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const app = apps[key];
    if (app.name.toLowerCase().includes(processedQuery)
    || app.url.toLowerCase().includes(processedQuery)) {
      newApps[key] = app;
    }
  }

  return newApps;
};
