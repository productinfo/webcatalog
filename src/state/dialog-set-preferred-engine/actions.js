
import {
  DIALOG_SET_PREFERRED_ENGINE_CLOSE,
  DIALOG_SET_PREFERRED_ENGINE_FORM_UPDATE,
  DIALOG_SET_PREFERRED_ENGINE_OPEN,
} from '../../constants/actions';

import {
  requestSetPreference,
} from '../../senders';

export const close = () => ({
  type: DIALOG_SET_PREFERRED_ENGINE_CLOSE,
});

export const updateForm = (changes) => ({
  type: DIALOG_SET_PREFERRED_ENGINE_FORM_UPDATE,
  changes,
});

export const save = () => (dispatch, getState) => {
  const state = getState();

  const { form } = state.dialogSetPreferredEngine;

  const {
    engine,
  } = form;

  requestSetPreference('preferredEngine', engine);

  dispatch(close());
  return null;
};

export const open = () => (dispatch, getState) => {
  dispatch({
    type: DIALOG_SET_PREFERRED_ENGINE_OPEN,
    engine: getState().preferences.preferredEngine,
  });
};
