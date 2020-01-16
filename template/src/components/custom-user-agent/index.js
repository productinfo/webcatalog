import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import connectComponent from '../../helpers/connect-component';

import { updateForm, save } from '../../state/custom-user-agent/actions';

const styles = (theme) => ({
  root: {
    background: theme.palette.background.paper,
    height: '100vh',
    width: '100vw',
    padding: theme.spacing.unit * 3,
    display: 'flex',
    flexDirection: 'column',
  },
  flexGrow: {
    flex: 1,
  },
  button: {
    float: 'right',
  },
});

const CustomUserAgent = ({
  classes, code, onUpdateForm, onSave,
}) => (
  <div className={classes.root}>
    <div className={classes.flexGrow}>
      <TextField
        id="outlined-full-width"
        label="User-Agent"
        placeholder=""
        helperText="Leave it blank to use default User-Agent string."
        fullWidth
        margin="dense"
        variant="outlined"
        multiline={false}
        InputLabelProps={{
          shrink: true,
        }}
        value={code}
        onChange={(e) => onUpdateForm({ code: e.target.value })}
      />
    </div>
    <div>
      <Button color="primary" variant="contained" className={classes.button} onClick={onSave}>
        Save
      </Button>
    </div>
  </div>
);

CustomUserAgent.propTypes = {
  classes: PropTypes.object.isRequired,
  code: PropTypes.string.isRequired,
  onUpdateForm: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  code: state.customUserAgent.form.code,
});

const actionCreators = {
  updateForm,
  save,
};

export default connectComponent(
  CustomUserAgent,
  mapStateToProps,
  actionCreators,
  styles,
);
