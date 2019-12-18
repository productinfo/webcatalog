
import {
  DIALOG_SET_INSTALLATION_PATH_CLOSE,
  DIALOG_SET_INSTALLATION_PATH_FORM_UPDATE,
  DIALOG_SET_INSTALLATION_PATH_OPEN,
} from '../../constants/actions';

import {
  requestSetPreference,
} from '../../senders';

import { getAppCount } from '../app-management/utils';

const { remote } = window.require('electron');

export const close = () => ({
  type: DIALOG_SET_INSTALLATION_PATH_CLOSE,
});

export const open = () => (dispatch, getState) => {
  const state = getState();

  return dispatch({
    type: DIALOG_SET_INSTALLATION_PATH_OPEN,
    initialForm: {
      installationPath: state.preferences.installationPath,
      requireAdmin: state.preferences.requireAdmin,
    },
  });
};

export const updateForm = (changes) => ({
  type: DIALOG_SET_INSTALLATION_PATH_FORM_UPDATE,
  changes,
});

export const save = () => (dispatch, getState) => {
  const state = getState();

  const { form } = state.dialogSetInstallationPath;

  const { installationPath, requireAdmin } = form;

  const appCount = getAppCount(state);

  if (appCount > 0) {
    remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      title: 'Uninstall all of WebCatalog apps first',
      message: 'You need to uninstall all of your WebCatalog apps before updating this preference.',
      buttons: ['OK'],
      cancelId: 0,
      defaultId: 0,
    });
    dispatch(close());
  } else {
    requestSetPreference('requireAdmin', requireAdmin);
    requestSetPreference('installationPath', installationPath);
  }
};
