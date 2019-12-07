import { combineReducers } from 'redux';

import {
  DIALOG_SET_PREFERRED_ENGINE_CLOSE,
  DIALOG_SET_PREFERRED_ENGINE_FORM_UPDATE,
  DIALOG_SET_PREFERRED_ENGINE_OPEN,
} from '../../constants/actions';

const open = (state = false, action) => {
  switch (action.type) {
    case DIALOG_SET_PREFERRED_ENGINE_CLOSE: return false;
    case DIALOG_SET_PREFERRED_ENGINE_OPEN: return true;
    default: return state;
  }
};

const formInitialState = {
  engine: 'electron',
};
const form = (state = formInitialState, action) => {
  switch (action.type) {
    case DIALOG_SET_PREFERRED_ENGINE_OPEN: return {
      ...formInitialState,
      engine: action.engine,
    };
    case DIALOG_SET_PREFERRED_ENGINE_CLOSE: return formInitialState;
    case DIALOG_SET_PREFERRED_ENGINE_FORM_UPDATE: {
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
