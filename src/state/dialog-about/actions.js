import {
  DIALOG_ABOUT_CLOSE,
  DIALOG_ABOUT_OPEN,
} from '../../constants/actions';


export const close = () => ({
  type: DIALOG_ABOUT_CLOSE,
});

export const open = () => ({
  type: DIALOG_ABOUT_OPEN,
});
