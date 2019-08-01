import { combineReducers } from 'redux';

import {
  DIALOG_SET_INSTALLATION_PATH_CLOSE,
  DIALOG_SET_INSTALLATION_PATH_FORM_UPDATE,
  DIALOG_SET_INSTALLATION_PATH_OPEN,
} from '../../constants/actions';

const open = (state = false, action) => {
  switch (action.type) {
    case DIALOG_SET_INSTALLATION_PATH_CLOSE: return false;
    case DIALOG_SET_INSTALLATION_PATH_OPEN: return true;
    default: return state;
  }
};

const formInitialState = {
  name: '',
  url: '',
  icon: null,
};
const form = (state = formInitialState, action) => {
  switch (action.type) {
    case DIALOG_SET_INSTALLATION_PATH_OPEN: return action.initialForm;
    case DIALOG_SET_INSTALLATION_PATH_CLOSE: return formInitialState;
    case DIALOG_SET_INSTALLATION_PATH_FORM_UPDATE: {
      const { changes } = action;
      return { ...state, ...changes };
    }
    default: return state;
  }
};

export default combineReducers({
  form,
  open,
});
