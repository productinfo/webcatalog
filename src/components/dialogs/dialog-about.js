import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import connectComponent from '../../helpers/connect-component';

import { close } from '../../state/dialog-about/actions';
import iconPng from '../../assets/icon.png';

import { requestOpenInBrowser } from '../../senders';

import EnhancedDialogTitle from '../shared/enhanced-dialog-title';

const styles = (theme) => ({
  icon: {
    height: 96,
    width: 96,
  },
  dialogContent: {
    minWidth: 320,
    textAlign: 'center',
    paddingBottom: theme.spacing(2),
  },
  title: {
    marginTop: theme.spacing(1),
  },
  version: {
    marginBottom: theme.spacing(2),
  },
  versionSmallContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  versionSmall: {
    fontSize: 13,
  },
  goToTheWebsiteButton: {
    marginRight: theme.spacing(1),
  },
  madeBy: {
    marginTop: theme.spacing(2),
  },
  link: {
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

const About = (props) => {
  const {
    classes,
    onClose,
    open,
  } = props;

  const appVersion = window.require('electron').remote.app.getVersion();

  return (
    <Dialog
      className={classes.root}
      onClose={onClose}
      open={open}
    >
      <EnhancedDialogTitle onClose={onClose}>
        About
      </EnhancedDialogTitle>
      <DialogContent className={classes.dialogContent}>
        <img src={iconPng} alt="WebCatalog" className={classes.icon} />
        <Typography variant="h6" className={classes.title}>WebCatalog</Typography>
        <Typography
          variant="body2"
          className={classes.version}
        >
          {`Version v${appVersion}`}
        </Typography>

        <Button
          onClick={() => requestOpenInBrowser('https://webcatalogapp.com')}
        >
          Website
        </Button>

        <Button
          onClick={() => requestOpenInBrowser('https://webcatalogapp.com/support')}
        >
          Support
        </Button>

        <Typography variant="body2" className={classes.madeBy}>
          <span>Made with </span>
          <span role="img" aria-label="love">❤</span>
          <span> by </span>
          <span
            onClick={() => requestOpenInBrowser('https://atomery.com/')}
            onKeyDown={() => requestOpenInBrowser('https://atomery.com/')}
            role="link"
            tabIndex="0"
            className={classes.link}
          >
            Atomery
          </span>
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

About.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  open: state.dialogAbout.open,
});

const actionCreators = {
  close,
};

export default connectComponent(
  About,
  mapStateToProps,
  actionCreators,
  styles,
);
