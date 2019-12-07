import semver from 'semver';

import { SET_APP, REMOVE_APP, CLEAN_APP_MANAGEMENT } from '../../constants/actions';

import {
  isNameExisted,
  getAppCount,
  getOutdatedAppsAsList,
} from './utils';

import packageJson from '../../../package.json';

import {
  requestShowMessageBox,
  requestInstallApp,
  requestUpdateApp,
} from '../../senders';

import {
  open as openDialogLicenseRegistration,
} from '../dialog-license-registration/actions';

export const clean = () => ({
  type: CLEAN_APP_MANAGEMENT,
});

export const setApp = (id, app) => ({
  type: SET_APP,
  id,
  app,
});

export const removeApp = (id) => ({
  type: REMOVE_APP,
  id,
});

export const installApp = (engine, id, name, url, icon) => (dispatch, getState) => {
  const state = getState();

  const shouldAskForLicense = !state.preferences.registered && getAppCount(state) > 1;

  if (shouldAskForLicense) {
    dispatch(openDialogLicenseRegistration());
    return null;
  }

  const sanitizedName = name.trim();
  if (isNameExisted(sanitizedName, state)) {
    requestShowMessageBox(`An app named ${sanitizedName} already exists.`, 'error');
    return null;
  }

  requestInstallApp(engine, id, sanitizedName, url, icon);
  return null;
};

export const updateApp = (engine, id, name, url, icon) => (dispatch, getState) => {
  const state = getState();

  const { latestTemplateVersion } = state.general;

  if (semver.lt(packageJson.templateVersion, latestTemplateVersion)) {
    return requestShowMessageBox('WebCatalog is outdated. Please update WebCatalog first to continue.', 'error');
  }

  // download icon when updating apps in the catalog
  const iconUrl = id.startsWith('custom-') ? icon : `https://s3.getwebcatalog.com/apps/${id}/${id}-icon.png`;

  return requestUpdateApp(engine, id, name, url, iconUrl);
};

export const updateAllApps = () => (dispatch, getState) => {
  const state = getState();

  const { latestTemplateVersion } = state.general;

  if (semver.lt(packageJson.templateVersion, latestTemplateVersion)) {
    return requestShowMessageBox('WebCatalog is outdated. Please update WebCatalog first to continue.', 'error');
  }

  const outdatedApps = getOutdatedAppsAsList(state);

  outdatedApps.forEach((app) => {
    const {
      engine, id, name, url, icon,
    } = app;

    // download icon when updating apps in the catalog
    const iconUrl = id.startsWith('custom-') ? icon : `https://s3.getwebcatalog.com/apps/${id}/${id}-icon.png`;

    return requestUpdateApp(engine, id, name, url, iconUrl);
  });

  return null;
};
