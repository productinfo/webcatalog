import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/SettingsSharp';

import { sortableContainer, sortableElement } from 'react-sortable-hoc';

import connectComponent from '../../helpers/connect-component';
import getWorkspacesAsList from '../../helpers/get-workspaces-as-list';

import WorkspaceSelector from './workspace-selector';
import FindInPage from './find-in-page';
import NavigationBar from './navigation-bar';
import FakeTitleBar from './fake-title-bar';

import {
  requestShowPreferencesWindow,
  requestCreateWorkspace,
  requestSetWorkspace,
  requestSetActiveWorkspace,
  requestRemoveWorkspace,
  requestShowEditWorkspaceWindow,
} from '../../senders';

const { remote } = window.require('electron');

const styles = (theme) => ({
  outerRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
  },
  root: {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
    width: '100vw',
    flex: 1,
  },
  sidebarRoot: {
    height: '100vh',
    width: 68,
    borderRight: '1px solid rgba(0, 0, 0, 0.2)',
    backgroundColor: theme.palette.background.paper,
    WebkitAppRegion: 'drag',
    WebkitUserSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: theme.spacing.unit,
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  sidebarTop: {
    flex: 1,
    paddingTop: window.process.platform === 'darwin' ? theme.spacing.unit * 3 : 0,
  },
  sidebarTopFullScreen: {
    paddingTop: 0,
  },
  innerContentRoot: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRoot: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  grabbing: {
    cursor: 'grabbing !important',
    pointerEvents: 'auto !important',
  },
});

const SortableItem = sortableElement(({ value }) => {
  const { workspace, index } = value;
  const {
    active, id, name, badgeCount, picturePath,
  } = workspace;
  return (
    <WorkspaceSelector
      active={active}
      id={id}
      key={id}
      name={name}
      badgeCount={badgeCount}
      picturePath={picturePath}
      order={index}
      onClick={() => requestSetActiveWorkspace(id)}
      onContextMenu={(e) => {
        e.preventDefault();

        const template = [
          {
            label: 'Edit Workspace',
            click: () => requestShowEditWorkspaceWindow(id),
          },
          {
            label: 'Remove Workspace',
            click: () => requestRemoveWorkspace(id),
          },
        ];
        const menu = remote.Menu.buildFromTemplate(template);

        menu.popup(remote.getCurrentWindow());
      }}
    />
  );
});

const SortableContainer = sortableContainer(({ children }) => <div>{children}</div>);

const Main = ({
  attachToMenubar,
  classes,
  didFailLoad,
  isFullScreen,
  isLoading,
  navigationBar,
  sidebar,
  workspaces,
}) => {
  const workspacesList = getWorkspacesAsList(workspaces);
  return (
    <div className={classes.outerRoot}>
      {!sidebar && !attachToMenubar && (<FakeTitleBar />)}
      <div className={classes.root}>
        {sidebar && (
          <div className={classes.sidebarRoot}>
            <div className={classNames(classes.sidebarTop,
              isFullScreen && classes.sidebarTopFullScreen)}
            >
              <SortableContainer
                pressDelay={250}
                helperClass={classes.grabbing}
                onSortEnd={({ oldIndex, newIndex }) => {
                  if (oldIndex === newIndex) return;
                  const oldWorkspace = workspacesList[oldIndex];
                  const newWorkspace = workspacesList[newIndex];
                  requestSetWorkspace(oldWorkspace.id, {
                    order: newWorkspace.order,
                  });
                  requestSetWorkspace(newWorkspace.id, {
                    order: oldWorkspace.order,
                  });
                }}
              >
                {workspacesList.map((workspace, i) => (
                  <SortableItem key={`item-${workspace.id}`} index={i} value={{ index: i, workspace }} />
                ))}
              </SortableContainer>
              {Object.keys(workspaces).length < 9 && (
                <WorkspaceSelector id="add" onClick={requestCreateWorkspace} />
              )}
            </div>
            {!navigationBar && (
            <div className={classes.end}>
              <IconButton aria-label="Preferences" onClick={requestShowPreferencesWindow}>
                <SettingsIcon />
              </IconButton>
            </div>
            )}
          </div>
        )}
        <div className={classes.contentRoot}>
          {navigationBar && <NavigationBar />}
          <FindInPage />
          <div className={classes.innerContentRoot}>
            {didFailLoad && !isLoading && (
              <div>
                <Typography align="center" variant="h6">
                  No internet
                </Typography>

                <Typography align="center" variant="body1">
                  Try: - Checking the network cables, modem, and router. - Reconnecting to Wi-Fi.
                </Typography>

                <Typography align="center" variant="body1">
                  Press ⌘ + R to reload.
                </Typography>
              </div>
            )}
            {isLoading && <CircularProgress />}
          </div>
        </div>
      </div>
    </div>
  );
};

Main.propTypes = {
  attachToMenubar: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  didFailLoad: PropTypes.bool.isRequired,
  isFullScreen: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  navigationBar: PropTypes.bool.isRequired,
  sidebar: PropTypes.bool.isRequired,
  workspaces: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  attachToMenubar: state.preferences.attachToMenubar,
  didFailLoad: state.general.didFailLoad,
  isFullScreen: state.general.isFullScreen,
  isLoading: state.general.isLoading,
  navigationBar: state.preferences.navigationBar,
  sidebar: state.preferences.sidebar,
  workspaces: state.workspaces,
});

export default connectComponent(
  Main,
  mapStateToProps,
  null,
  styles,
);
