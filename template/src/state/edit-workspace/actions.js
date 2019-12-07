
import { UPDATE_EDIT_WORKSPACE_FORM } from '../../constants/actions';

import validate from '../../helpers/validate';
import hasErrors from '../../helpers/has-errors';

import {
  requestSetWorkspace,
  requestSetWorkspacePicture,
  requestRemoveWorkspacePicture,
} from '../../senders';

const { remote } = window.require('electron');

const getValidationRules = () => ({
  homeUrl: {
    fieldName: 'Home URL',
    url: true,
  },
});

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

  requestSetWorkspace(
    id,
    {
      name: form.name,
      homeUrl: form.homeUrl ? form.homeUrl.trim() : form.homeUrl,
    },
  );

  if (form.picturePath) {
    requestSetWorkspacePicture(id, form.picturePath);
  } else {
    requestRemoveWorkspacePicture(id);
  }

  remote.getCurrentWindow().close();
  return null;
};
