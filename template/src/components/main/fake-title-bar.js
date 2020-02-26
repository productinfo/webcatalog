import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import connectComponent from '../../helpers/connect-component';

const titleBarHeight = 22;

const { remote } = window.require('electron');

const styles = (theme) => ({
  root: {
    background: theme.palette.type === 'dark' ? '#2a2b2c' : 'radial-gradient(7px at 14px 50%, #ff5e57 0px, #ff635a 5px, #fd5249 6px, rgba(255, 255, 255, 0) 7px), radial-gradient(7px at 34px 50%, #ffbd2e 0px, #ffc42f 5px, #fcb91b 6px, rgba(255, 255, 255, 0) 7px), radial-gradient(7px at 54px 50%, #cfcfcf 0px, #d3d3d3 5px, #c6c6c6 6px, rgba(255, 255, 255, 0) 7px), linear-gradient(to top, #cccccc 0%, #d6d6d6 1px, #ebebeb 100%);',
    height: titleBarHeight,
    WebkitAppRegion: 'drag',
    WebkitUserSelect: 'none',
    textAlign: 'center',
    lineHeight: '22px',
    fontSize: '13px',
    color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgb(77, 77, 77)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
    fontWeight: 500,
    paddingLeft: 72,
    paddingRight: 72,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rootMenubar: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
  },
});

const FakeTitleBar = (props) => {
  const {
    classes,
    title,
  } = props;

  if (window.process.platform !== 'darwin') return null;

  return (
    <div
      className={classnames(classes.root, window.mode === 'menubar' && classes.rootMenubar)}
    >
      {(window.mode === 'main' || window.mode === 'menubar') && title ? title : remote.getCurrentWindow().getTitle()}
    </div>
  );
};

FakeTitleBar.defaultProps = {
  title: '',
};

FakeTitleBar.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
};

const mapStateToProps = (state) => ({
  title: state.general.title,
});

export default connectComponent(
  FakeTitleBar,
  mapStateToProps,
  null,
  styles,
);
