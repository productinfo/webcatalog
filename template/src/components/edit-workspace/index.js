import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import connectComponent from '../../helpers/connect-component';
import getAvatarText from '../../helpers/get-avatar-text';
import getMailtoUrl from '../../helpers/get-mailto-url';

import {
  getIconFromInternet,
  updateForm,
  save,
} from '../../state/edit-workspace/actions';

const { remote } = window.require('electron');

const appJson = remote.getGlobal('appJson');

const styles = (theme) => ({
  root: {
    background: theme.palette.background.paper,
    height: '100vh',
    width: '100vw',
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    display: 'flex',
    flexDirection: 'column',
  },
  flexGrow: {
    flex: 1,
  },
  button: {
    float: 'right',
  },
  textField: {
    marginBottom: theme.spacing.unit * 3,
  },
  avatarFlex: {
    display: 'flex',
  },
  avatarLeft: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: 0,
    paddingRight: theme.spacing.unit,
  },
  avatarRight: {
    flex: 1,
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit,
    paddingRight: 0,
  },
  avatar: {
    fontFamily: theme.typography.fontFamily,
    height: 64,
    width: 64,
    background: theme.palette.common.white,
    borderRadius: 4,
    color: theme.palette.getContrastText(theme.palette.common.white),
    fontSize: '32px',
    lineHeight: '64px',
    textAlign: 'center',
    fontWeight: 500,
    textTransform: 'uppercase',
    userSelect: 'none',
    boxShadow: theme.shadows[1],
  },
  textAvatar: {
    background: theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.common.black,
    color: theme.palette.getContrastText(theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.common.black),
  },
  transparentAvatar: {
    background: 'transparent',
    boxShadow: 'none',
    color: theme.palette.text.primary,
  },
  avatarPicture: {
    height: 64,
    width: 64,
    borderRadius: 4,
  },
  buttonBot: {
    marginTop: theme.spacing.unit,
  },
});

const EditWorkspace = ({
  classes,
  disableAudio,
  disableNotifications,
  downloadingIcon,
  hibernateWhenUnused,
  homeUrl,
  homeUrlError,
  id,
  internetIcon,
  isMailApp,
  name,
  onGetIconFromInternet,
  onSave,
  onUpdateForm,
  order,
  picturePath,
  transparentBackground,
}) => (
  <div className={classes.root}>
    <div className={classes.flexGrow}>
      <TextField
        id="outlined-full-width"
        label="Name"
        placeholder="Optional"
        fullWidth
        margin="dense"
        variant="outlined"
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
        value={name}
        onChange={(e) => onUpdateForm({ name: e.target.value })}
      />
      <TextField
        id="outlined-full-width"
        label={homeUrlError || 'Home URL'}
        error={Boolean(homeUrlError)}
        placeholder="Optional"
        fullWidth
        margin="dense"
        variant="outlined"
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
        value={homeUrl}
        onChange={(e) => onUpdateForm({ homeUrl: e.target.value })}
        helperText={(() => {
          if (!homeUrlError && isMailApp) {
            return 'Email app detected.';
          }
          if (!homeUrl) {
            return `Defaults to ${appJson.url}.`;
          }
          return null;
        })()}
      />
      <div className={classes.avatarFlex}>
        <div className={classes.avatarLeft}>
          <div
            className={classNames(
              classes.avatar,
              !picturePath && !internetIcon && classes.textAvatar,
              transparentBackground && classes.transparentAvatar,
            )}
          >
            {picturePath || internetIcon ? (
              <img alt="Icon" className={classes.avatarPicture} src={picturePath ? `file://${picturePath}` : internetIcon} />
            ) : getAvatarText(id, name, order)}
          </div>
        </div>
        <div className={classes.avatarRight}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const opts = {
                properties: ['openFile'],
                filters: [
                  { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'tif', 'bmp', 'dib'] },
                ],
              };
              remote.dialog.showOpenDialog(remote.getCurrentWindow(), opts)
                .then(({ canceled, filePaths }) => {
                  if (!canceled && filePaths && filePaths.length > 0) {
                    onUpdateForm({ picturePath: filePaths[0] });
                  }
                })
                .catch(console.log); // eslint-disable-line
            }}
          >
            Select Local Image...
          </Button>
          <Typography variant="caption">
            PNG, JPEG, GIF, TIFF or BMP.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            className={classes.buttonBot}
            disabled={homeUrlError || downloadingIcon}
            onClick={() => onGetIconFromInternet(true)}
          >
            {downloadingIcon ? 'Downloading Icon from the Internet...' : 'Download Icon from the Internet'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.buttonBot}
            onClick={() => onUpdateForm({ picturePath: null, internetIcon: null })}
            disabled={!(picturePath || internetIcon)}
          >
            Reset to Default
          </Button>
          <FormGroup>
            <FormControlLabel
              control={(
                <Checkbox
                  checked={transparentBackground}
                  onChange={(e) => onUpdateForm({ transparentBackground: e.target.checked })}
                />
              )}
              label="Use transparent background"
            />
          </FormGroup>
        </div>
      </div>
      <List>
        <Divider />
        <ListItem disableGutters>
          <ListItemText primary="Hibernate when not used" secondary="Save CPU usage, memory and battery." />
          <ListItemSecondaryAction>
            <Switch
              color="primary"
              checked={hibernateWhenUnused}
              onChange={(e) => onUpdateForm({ hibernateWhenUnused: e.target.checked })}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem disableGutters>
          <ListItemText primary="Disable notifications" secondary="Prevent workspace from sending notifications." />
          <ListItemSecondaryAction>
            <Switch
              color="primary"
              checked={disableNotifications}
              onChange={(e) => onUpdateForm({ disableNotifications: e.target.checked })}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem disableGutters>
          <ListItemText primary="Disable audio" secondary="Prevent workspace from playing audio." />
          <ListItemSecondaryAction>
            <Switch
              color="primary"
              checked={disableAudio}
              onChange={(e) => onUpdateForm({ disableAudio: e.target.checked })}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </div>
    <div>
      <Button color="primary" variant="contained" className={classes.button} onClick={onSave}>
        Save
      </Button>
    </div>
  </div>
);

EditWorkspace.defaultProps = {
  homeUrlError: null,
  internetIcon: null,
  picturePath: null,
};

EditWorkspace.propTypes = {
  classes: PropTypes.object.isRequired,
  disableAudio: PropTypes.bool.isRequired,
  disableNotifications: PropTypes.bool.isRequired,
  downloadingIcon: PropTypes.bool.isRequired,
  hibernateWhenUnused: PropTypes.bool.isRequired,
  homeUrl: PropTypes.string.isRequired,
  homeUrlError: PropTypes.string,
  id: PropTypes.string.isRequired,
  internetIcon: PropTypes.string,
  isMailApp: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  onGetIconFromInternet: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onUpdateForm: PropTypes.func.isRequired,
  order: PropTypes.number.isRequired,
  picturePath: PropTypes.string,
  transparentBackground: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  disableAudio: Boolean(state.editWorkspace.form.disableAudio),
  disableNotifications: Boolean(state.editWorkspace.form.disableNotifications),
  downloadingIcon: state.editWorkspace.downloadingIcon,
  hibernateWhenUnused: Boolean(state.editWorkspace.form.hibernateWhenUnused),
  homeUrl: state.editWorkspace.form.homeUrl,
  homeUrlError: state.editWorkspace.form.homeUrlError,
  id: state.editWorkspace.form.id,
  internetIcon: state.editWorkspace.form.internetIcon,
  isMailApp: Boolean(getMailtoUrl(state.editWorkspace.form.homeUrl)),
  name: state.editWorkspace.form.name,
  order: state.editWorkspace.form.order,
  picturePath: state.editWorkspace.form.picturePath,
  transparentBackground: Boolean(state.editWorkspace.form.transparentBackground),
});

const actionCreators = {
  getIconFromInternet,
  updateForm,
  save,
};

export default connectComponent(
  EditWorkspace,
  mapStateToProps,
  actionCreators,
  styles,
);
