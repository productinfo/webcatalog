
import {
  UPDATE_EDIT_WORKSPACE_FORM,
  UPDATE_EDIT_WORKSPACE_DOWNLOADING_ICON,
} from '../../constants/actions';

import hasErrors from '../../helpers/has-errors';
import isUrl from '../../helpers/is-url';
import validate from '../../helpers/validate';

import {
  requestSetWorkspace,
  requestSetWorkspacePicture,
  requestRemoveWorkspacePicture,
} from '../../senders';

const { ipcRenderer, remote } = window.require('electron');

const getValidationRules = () => ({
  homeUrl: {
    fieldName: 'Home URL',
    lessStrictUrl: true,
  },
});

// to be replaced with invoke (electron 7+)
// https://electronjs.org/docs/api/ipc-renderer#ipcrendererinvokechannel-args
export const getWebsiteIconUrlAsync = (url) => new Promise((resolve, reject) => {
  try {
    const id = Date.now().toString();
    ipcRenderer.once(id, (e, uurl) => {
      resolve(uurl);
    });
    ipcRenderer.send('request-get-website-icon-url', id, url);
  } catch (err) {
    reject(err);
  }
});

export const getIconFromInternet = (forceOverwrite) => (dispatch, getState) => {
  const { form: { picturePath, homeUrl, homeUrlError } } = getState().editWorkspace;
  if ((!forceOverwrite && picturePath) || homeUrlError) return;

  dispatch({
    type: UPDATE_EDIT_WORKSPACE_DOWNLOADING_ICON,
    downloadingIcon: true,
  });

  const appJson = remote.getGlobal('appJson');
  getWebsiteIconUrlAsync(homeUrl || appJson.url)
    .then((iconUrl) => {
      const { form } = getState().editWorkspace;
      if (form.homeUrl === homeUrl) {
        const changes = { internetIcon: iconUrl || form.internetIcon };
        if (forceOverwrite) changes.picturePath = null;
        dispatch(({
          type: UPDATE_EDIT_WORKSPACE_FORM,
          changes,
        }));
        dispatch({
          type: UPDATE_EDIT_WORKSPACE_DOWNLOADING_ICON,
          downloadingIcon: false,
        });
      }

      if (forceOverwrite && !iconUrl) {
        remote.dialog.showMessageBox(remote.getCurrentWindow(), {
          message: 'Unable to find a suitable icon from the Internet.',
          buttons: ['OK'],
          cancelId: 0,
          defaultId: 0,
        });
      }
    }).catch(console.log); // eslint-disable-line no-console
};


export const updateForm = (changes) => (dispatch) => dispatch({
  type: UPDATE_EDIT_WORKSPACE_FORM,
  changes: validate(changes, getValidationRules()),
});

export const save = () => (dispatch, getState) => {
  const { form } = getState().editWorkspace;

  const validatedChanges = validate(form, getValidationRules());
  if (hasErrors(validatedChanges)) {
    return dispatch(updateForm(validatedChanges));
  }

  const id = remote.getGlobal('editWorkspaceId');
  const homeUrl = (() => {
    if (form.homeUrl) {
      const url = form.homeUrl.trim();
      return isUrl(url) ? url : `http://${url}`;
    }
    return null;
  })();

  requestSetWorkspace(
    id,
    {
      name: form.name,
      homeUrl,
      // prefs
      disableAudio: Boolean(form.disableAudio),
      disableNotifications: Boolean(form.disableNotifications),
      hibernateWhenUnused: Boolean(form.hibernateWhenUnused),
      transparentBackground: Boolean(form.transparentBackground),
    },
  );

  if (form.picturePath) {
    requestSetWorkspacePicture(id, form.picturePath);
  } else if (form.internetIcon) {
    requestSetWorkspacePicture(id, form.internetIcon);
  } else {
    requestRemoveWorkspacePicture(id);
  }

  remote.getCurrentWindow().close();
  return null;
};
