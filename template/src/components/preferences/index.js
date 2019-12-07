import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { TimePicker } from 'material-ui-pickers';

import connectComponent from '../../helpers/connect-component';
import getWorkspacesAsList from '../../helpers/get-workspaces-as-list';
import getMailtoUrl from '../../helpers/get-mailto-url';

import StatedMenu from '../shared/stated-menu';

import { updateIsDefaultMailClient, updateIsDefaultWebBrowser } from '../../state/general/actions';

import {
  requestClearBrowsingData,
  requestOpenInBrowser,
  requestRealignActiveWorkspace,
  requestResetPreferences,
  requestSetPreference,
  requestSetSystemPreference,
  requestSetThemeSource,
  requestShowCodeInjectionWindow,
  requestShowRequireRestartDialog,
} from '../../senders';

const { remote } = window.require('electron');

const styles = (theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    background: theme.palette.background.default,
  },
  sectionTitle: {
    paddingLeft: theme.spacing.unit * 2,
  },
  paper: {
    marginTop: theme.spacing.unit * 0.5,
    marginBottom: theme.spacing.unit * 3,
  },
  switchBase: {
    height: 'auto',
  },
  timePickerContainer: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    display: 'flex',
    justifyContent: 'space-between',
  },
});

const appJson = remote.getGlobal('appJson');

const getThemeString = (theme) => {
  if (theme === 'light') return 'Light';
  if (theme === 'dark') return 'Dark';
  return 'System default';
};

const getOpenAtLoginString = (openAtLogin) => {
  if (openAtLogin === 'yes-hidden') return 'Yes, but minimized';
  if (openAtLogin === 'yes') return 'Yes';
  return 'No';
};

const hasMailWorkspaceFunc = (workspaces) => {
  const workspacesList = getWorkspacesAsList(workspaces);
  return Boolean(workspacesList
    .find((workspace) => Boolean(getMailtoUrl(workspace.homeUrl || appJson.url))));
};

// language code extracted from https://github.com/electron/electron/releases/download/v8.0.0-beta.3/hunspell_dictionaries.zip
// languages name from http://www.lingoes.net/en/translator/langcode.htm & Chrome preferences
// sorted by name
const hunspellLanguagesMap = {
  'af-ZA': 'Afrikaans',
  sq: 'Albanian - shqip',
  hy: 'Armenian - հայերեն',
  'bg-BG': 'Bulgarian - български',
  'ca-ES': 'Catalan - català',
  'hr-HR': 'Croatian - hrvatski',
  'cs-CZ': 'Czech - čeština',
  'da-DK': 'Danish - dansk',
  'nl-NL': 'Dutch - Nederlands',
  'en-AU': 'English (Australia)',
  'en-CA': 'English (Canada)',
  'en-GB': 'English (United Kingdom)',
  'en-US': 'English (United States)',
  'et-EE': 'Estonian - eesti',
  'fo-FO': 'Faroese - føroyskt',
  'fr-FR': 'French - français',
  'de-DE': 'German - Deutsch',
  'el-GR': 'Greek - Ελληνικά',
  'he-IL': 'Hebrew - ‎‫עברית‬‎',
  'hi-IN': 'Hindi - हिन्दी',
  'hu-HU': 'Hungarian - magyar',
  'id-ID': 'Indonesian - Indonesia',
  'it-IT': 'Italian - italiano',
  ko: 'Korean - 한국어',
  'lv-LV': 'Latvian - latviešu',
  'lt-LT': 'Lithuanian - lietuvių',
  'nb-NO': 'Norwegian Bokmål - norsk bokmål',
  'fa-IR': 'Persian - ‎‫فارسی‬‎',
  'pl-PL': 'Polish - polski',
  'pt-BR': 'Portuguese (Brazil) - português (Brasil)',
  'pt-PT': 'Portuguese (Portugal) - português (Portugal)',
  'ro-RO': 'Romanian - română',
  'ru-RU': 'Russian - русский',
  sr: 'Serbian - српски',
  sh: 'Serbo-Croatian - srpskohrvatski',
  'sk-SK': 'Slovak - slovenčina',
  'sl-SI': 'Slovenian - slovenščina',
  'es-ES': 'Spanish - español',
  'sv-SE': 'Swedish - svenska',
  'tg-TG': 'Tajik - тоҷикӣ',
  'ta-IN': 'Tamil - தமிழ்',
  'tr-TR': 'Turkish - Türkçe',
  'uk-UA': 'Ukrainian - українська',
  'vi-VN': 'Vietnamese - Tiếng Việt',
  'cy-GB': 'Welsh - Cymraeg',
};

const Preferences = ({
  askForDownloadPath,
  attachToMenubar,
  autoCheckForUpdates,
  classes,
  cssCodeInjection,
  downloadPath,
  hasMailWorkspace,
  isDefaultMailClient,
  isDefaultWebBrowser,
  jsCodeInjection,
  navigationBar,
  onUpdateIsDefaultMailClient,
  onUpdateIsDefaultWebBrowser,
  openAtLogin,
  pauseNotificationsBySchedule,
  pauseNotificationsByScheduleFrom,
  pauseNotificationsByScheduleTo,
  pauseNotificationsMuteAudio,
  rememberLastPageVisited,
  shareWorkspaceBrowsingData,
  sidebar,
  spellChecker,
  spellCheckerLanguages,
  swipeToNavigate,
  themeSource,
  unreadCountBadge,
}) => (
  <div className={classes.root}>
    <Typography variant="subtitle2" className={classes.sectionTitle}>
      Appearance
    </Typography>
    <Paper className={classes.paper}>
      <List dense>
        <StatedMenu
          id="theme"
          buttonElement={(
            <ListItem button>
              <ListItemText primary="Theme" secondary={getThemeString(themeSource)} />
              <ChevronRightIcon color="action" />
            </ListItem>
          )}
        >
          {window.process.platform === 'darwin' && <MenuItem onClick={() => requestSetThemeSource('system')}>System default</MenuItem>}
          <MenuItem onClick={() => requestSetThemeSource('light')}>Light</MenuItem>
          <MenuItem onClick={() => requestSetThemeSource('dark')}>Dark</MenuItem>
        </StatedMenu>
        <Divider />
        <ListItem>
          <ListItemText
            primary="Show sidebar"
            secondary="Sidebar lets you switch easily between workspaces."
          />
          <Switch
            color="primary"
            checked={sidebar}
            onChange={(e) => {
              requestSetPreference('sidebar', e.target.checked);
              requestRealignActiveWorkspace();
            }}
            classes={{
              switchBase: classes.switchBase,
            }}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText
            primary="Show navigation bar"
            secondary="Navigation bar lets you go back, forward, home and reload."
          />
          <Switch
            color="primary"
            checked={navigationBar}
            onChange={(e) => {
              requestSetPreference('navigationBar', e.target.checked);
              requestRealignActiveWorkspace();
            }}
            classes={{
              switchBase: classes.switchBase,
            }}
          />
        </ListItem>
      </List>
    </Paper>

    <Typography variant="subtitle2" className={classes.sectionTitle}>
      Notifications
    </Typography>
    <Paper className={classes.paper}>
      <List dense>
        <ListItem>
          <ListItemText>
            Automatically disable notifications by schedule:
            <div className={classes.timePickerContainer}>
              <TimePicker
                autoOk={false}
                label="from"
                value={new Date(pauseNotificationsByScheduleFrom)}
                onChange={(d) => requestSetPreference('pauseNotificationsByScheduleFrom', d.toString())}
                disabled={!pauseNotificationsBySchedule}
              />
              <TimePicker
                autoOk={false}
                label="to"
                value={new Date(pauseNotificationsByScheduleTo)}
                onChange={(d) => requestSetPreference('pauseNotificationsByScheduleTo', d.toString())}
                disabled={!pauseNotificationsBySchedule}
              />
            </div>
            (
            {window.Intl.DateTimeFormat().resolvedOptions().timeZone}
            )
          </ListItemText>
          <Switch
            color="primary"
            checked={pauseNotificationsBySchedule}
            onChange={(e) => {
              requestSetPreference('pauseNotificationsBySchedule', e.target.checked);
            }}
            classes={{
              switchBase: classes.switchBase,
            }}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Mute audio when notifications are paused" />
          <Switch
            color="primary"
            checked={pauseNotificationsMuteAudio}
            onChange={(e) => {
              requestSetPreference('pauseNotificationsMuteAudio', e.target.checked);
            }}
            classes={{
              switchBase: classes.switchBase,
            }}
          />
        </ListItem>
        {window.process.platform === 'darwin' && (
          <>
            <Divider />
            <ListItem>
              <ListItemText primary="Show unread count badge" />
              <Switch
                color="primary"
                checked={unreadCountBadge}
                onChange={(e) => {
                  requestSetPreference('unreadCountBadge', e.target.checked);
                  requestShowRequireRestartDialog();
                }}
                classes={{
                  switchBase: classes.switchBase,
                }}
              />
            </ListItem>
          </>
        )}
      </List>
    </Paper>

    <Typography variant="subtitle2" className={classes.sectionTitle}>
      Languages
    </Typography>
    <Paper className={classes.paper}>
      <List dense>
        <ListItem>
          <ListItemText primary="Spell check" />
          <Switch
            color="primary"
            checked={spellChecker}
            onChange={(e) => {
              requestSetPreference('spellChecker', e.target.checked);
              requestShowRequireRestartDialog();
            }}
            classes={{
              switchBase: classes.switchBase,
            }}
          />
        </ListItem>
        <Divider />
        <StatedMenu
          id="spellcheckerLanguages"
          buttonElement={(
            <ListItem button>
              <ListItemText
                primary="Spell checking language"
                secondary={spellCheckerLanguages.map((code) => hunspellLanguagesMap[code]).join(' | ')}
              />
              <ChevronRightIcon color="action" />
            </ListItem>
          )}
        >
          {Object.keys(hunspellLanguagesMap).map((code) => (
            <MenuItem
              key={code}
              onClick={() => {
                requestSetPreference('spellCheckerLanguages', [code]);
                requestShowRequireRestartDialog();
              }}
            >
              {hunspellLanguagesMap[code]}
            </MenuItem>
          ))}
        </StatedMenu>
      </List>
    </Paper>

    <Typography variant="subtitle2" className={classes.sectionTitle}>
      Experience
    </Typography>
    <Paper className={classes.paper}>
      <List dense>
        <ListItem>
          <ListItemText
            primary={window.process.platform === 'win32'
              ? 'Attach to taskbar' : 'Attach to menubar'}
          />
          <Switch
            color="primary"
            checked={attachToMenubar}
            onChange={(e) => {
              requestSetPreference('attachToMenubar', e.target.checked);
              requestShowRequireRestartDialog();
            }}
            classes={{
              switchBase: classes.switchBase,
            }}
          />
        </ListItem>
        <Divider />
        {window.process.platform === 'darwin' && (
          <>
            <ListItem>
              <ListItemText
                primary="Swipe to navigate"
                secondary={(
                  <>
                    <span>Navigate between pages with 3-finger gestures.</span>
                    <br />
                    <span>To enable it, you also need to change </span>
                    <b>
                      macOS Preferences &gt; Trackpad &gt; More Gestures &gt; Swipe between page
                    </b>
                    <span> to </span>
                    <b>Swipe with three fingers</b>
                    <span> or </span>
                    <b>Swipe with two or three fingers.</b>
                  </>
                )}
              />
              <Switch
                color="primary"
                checked={swipeToNavigate}
                onChange={(e) => {
                  requestSetPreference('swipeToNavigate', e.target.checked);
                  requestShowRequireRestartDialog();
                }}
                classes={{
                  switchBase: classes.switchBase,
                }}
              />
            </ListItem>
            <Divider />
          </>
        )}
        <ListItem>
          <ListItemText primary="Automatically check for updates" />
          <Switch
            color="primary"
            checked={autoCheckForUpdates}
            onChange={(e) => {
              requestSetPreference('autoCheckForUpdates', e.target.checked);
            }}
            classes={{
              switchBase: classes.switchBase,
            }}
          />
        </ListItem>
      </List>
    </Paper>

    <Typography variant="subtitle2" className={classes.sectionTitle}>
      Downloads
    </Typography>
    <Paper className={classes.paper}>
      <List dense>
        <ListItem
          button
          onClick={() => {
            remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
              properties: ['openDirectory'],
            })
              .then(({ canceled, filePaths }) => {
                if (!canceled && filePaths && filePaths.length > 0) {
                  requestSetPreference('downloadPath', filePaths[0]);
                }
              })
              .catch(console.log); // eslint-disable-line
          }}
        >
          <ListItemText
            primary="Download Location"
            secondary={downloadPath}
          />
          <ChevronRightIcon color="action" />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Ask where to save each file before downloading" />
          <Switch
            color="primary"
            checked={askForDownloadPath}
            onChange={(e) => {
              requestSetPreference('askForDownloadPath', e.target.checked);
            }}
            classes={{
              switchBase: classes.switchBase,
            }}
          />
        </ListItem>
      </List>
    </Paper>

    <Typography variant="subtitle2" className={classes.sectionTitle}>
      Privacy &amp; Security
    </Typography>
    <Paper className={classes.paper}>
      <List dense>
        <ListItem>
          <ListItemText primary="Remember last page visited" />
          <Switch
            color="primary"
            checked={rememberLastPageVisited}
            onChange={(e) => {
              requestSetPreference('rememberLastPageVisited', e.target.checked);
              requestShowRequireRestartDialog();
            }}
            classes={{
              switchBase: classes.switchBase,
            }}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Share browsing data between workspaces" />
          <Switch
            color="primary"
            checked={shareWorkspaceBrowsingData}
            onChange={(e) => {
              requestSetPreference('shareWorkspaceBrowsingData', e.target.checked);
              requestShowRequireRestartDialog();
            }}
            classes={{
              switchBase: classes.switchBase,
            }}
          />
        </ListItem>
        <Divider />
        <ListItem button onClick={requestClearBrowsingData}>
          <ListItemText primary="Clear browsing data" secondary="Clear cookies, cache, and more" />
          <ChevronRightIcon color="action" />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => requestOpenInBrowser('https://getwebcatalog.com/privacy')}>
          <ListItemText primary="Privacy Policy" />
        </ListItem>
      </List>
    </Paper>

    <Typography variant="subtitle2" className={classes.sectionTitle}>
      Default App
    </Typography>
    <Paper className={classes.paper}>
      <List dense>
        {(hasMailWorkspace || isDefaultMailClient) && (
        <>
          {isDefaultMailClient ? (
            <ListItem>
              <ListItemText secondary={`${appJson.name} is your default email client.`} />
            </ListItem>
          ) : (
            <ListItem>
              <ListItemText primary="Default email client" secondary={`Make ${appJson.name} the default email client.`} />
              <Button
                variant="outlined"
                size="small"
                color="default"
                className={classes.button}
                onClick={() => {
                  remote.app.setAsDefaultProtocolClient('mailto');
                  onUpdateIsDefaultMailClient(remote.app.isDefaultProtocolClient('mailto'));
                }}
              >
                Make default
              </Button>
            </ListItem>
          )}
          <Divider />
        </>
        )}
        {isDefaultWebBrowser ? (
          <ListItem>
            <ListItemText secondary={`${appJson.name} is your default web browser.`} />
          </ListItem>
        ) : (
          <ListItem>
            <ListItemText primary="Default web browser" secondary={`Make ${appJson.name} the default web browser.`} />
            <Button
              variant="outlined"
              size="small"
              color="default"
              className={classes.button}
              onClick={() => {
                remote.app.setAsDefaultProtocolClient('http');
                remote.app.setAsDefaultProtocolClient('https');
                onUpdateIsDefaultWebBrowser(remote.app.isDefaultProtocolClient('http'));
              }}
            >
              Make default
            </Button>
          </ListItem>
        )}
      </List>
    </Paper>

    {window.process.platform !== 'linux' && (
    <>
      <Typography variant="subtitle2" className={classes.sectionTitle}>
        System
      </Typography>
      <Paper className={classes.paper}>
        <List dense>
          <StatedMenu
            id="openAtLogin"
            buttonElement={(
              <ListItem button>
                <ListItemText primary="Open at login" secondary={getOpenAtLoginString(openAtLogin)} />
                <ChevronRightIcon color="action" />
              </ListItem>
            )}
          >
            <MenuItem onClick={() => requestSetSystemPreference('openAtLogin', 'yes')}>Yes</MenuItem>
            <MenuItem onClick={() => requestSetSystemPreference('openAtLogin', 'yes-hidden')}>Yes, but minimized</MenuItem>
            <MenuItem onClick={() => requestSetSystemPreference('openAtLogin', 'no')}>No</MenuItem>
          </StatedMenu>
        </List>
      </Paper>
    </>
    )}

    <Typography variant="subtitle2" className={classes.sectionTitle}>
      Developers
    </Typography>
    <Paper className={classes.paper}>
      <List dense>
        <ListItem button onClick={() => requestShowCodeInjectionWindow('js')}>
          <ListItemText primary="JS Code Injection" secondary={jsCodeInjection ? 'Set' : 'Not set'} />
          <ChevronRightIcon color="action" />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => requestShowCodeInjectionWindow('css')}>
          <ListItemText primary="CSS Code Injection" secondary={cssCodeInjection ? 'Set' : 'Not set'} />
          <ChevronRightIcon color="action" />
        </ListItem>
      </List>
    </Paper>

    <Typography variant="subtitle2" className={classes.sectionTitle}>
      Reset
    </Typography>
    <Paper className={classes.paper}>
      <List dense>
        <ListItem button onClick={requestResetPreferences}>
          <ListItemText primary="Restore preferences to their original defaults" />
          <ChevronRightIcon color="action" />
        </ListItem>
      </List>
    </Paper>
  </div>
);

Preferences.defaultProps = {
  cssCodeInjection: null,
  jsCodeInjection: null,
};

Preferences.propTypes = {
  askForDownloadPath: PropTypes.bool.isRequired,
  attachToMenubar: PropTypes.bool.isRequired,
  autoCheckForUpdates: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  cssCodeInjection: PropTypes.string,
  downloadPath: PropTypes.string.isRequired,
  hasMailWorkspace: PropTypes.bool.isRequired,
  isDefaultMailClient: PropTypes.bool.isRequired,
  isDefaultWebBrowser: PropTypes.bool.isRequired,
  jsCodeInjection: PropTypes.string,
  navigationBar: PropTypes.bool.isRequired,
  onUpdateIsDefaultMailClient: PropTypes.func.isRequired,
  onUpdateIsDefaultWebBrowser: PropTypes.func.isRequired,
  openAtLogin: PropTypes.oneOf(['yes', 'yes-hidden', 'no']).isRequired,
  pauseNotificationsBySchedule: PropTypes.bool.isRequired,
  pauseNotificationsByScheduleFrom: PropTypes.string.isRequired,
  pauseNotificationsByScheduleTo: PropTypes.string.isRequired,
  pauseNotificationsMuteAudio: PropTypes.bool.isRequired,
  rememberLastPageVisited: PropTypes.bool.isRequired,
  shareWorkspaceBrowsingData: PropTypes.bool.isRequired,
  sidebar: PropTypes.bool.isRequired,
  spellChecker: PropTypes.bool.isRequired,
  spellCheckerLanguages: PropTypes.arrayOf(PropTypes.string).isRequired,
  swipeToNavigate: PropTypes.bool.isRequired,
  themeSource: PropTypes.string.isRequired,
  unreadCountBadge: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  askForDownloadPath: state.preferences.askForDownloadPath,
  attachToMenubar: state.preferences.attachToMenubar,
  autoCheckForUpdates: state.preferences.autoCheckForUpdates,
  cssCodeInjection: state.preferences.cssCodeInjection,
  downloadPath: state.preferences.downloadPath,
  hasMailWorkspace: hasMailWorkspaceFunc(state.workspaces),
  isDefaultMailClient: state.general.isDefaultMailClient,
  isDefaultWebBrowser: state.general.isDefaultWebBrowser,
  jsCodeInjection: state.preferences.jsCodeInjection,
  navigationBar: state.preferences.navigationBar,
  openAtLogin: state.systemPreferences.openAtLogin,
  pauseNotificationsBySchedule: state.preferences.pauseNotificationsBySchedule,
  pauseNotificationsByScheduleFrom: state.preferences.pauseNotificationsByScheduleFrom,
  pauseNotificationsByScheduleTo: state.preferences.pauseNotificationsByScheduleTo,
  pauseNotificationsMuteAudio: state.preferences.pauseNotificationsMuteAudio,
  rememberLastPageVisited: state.preferences.rememberLastPageVisited,
  shareWorkspaceBrowsingData: state.preferences.shareWorkspaceBrowsingData,
  sidebar: state.preferences.sidebar,
  spellChecker: state.preferences.spellChecker,
  spellCheckerLanguages: state.preferences.spellCheckerLanguages,
  swipeToNavigate: state.preferences.swipeToNavigate,
  themeSource: state.general.themeSource,
  unreadCountBadge: state.preferences.unreadCountBadge,
});

const actionCreators = {
  updateIsDefaultMailClient,
  updateIsDefaultWebBrowser,
};

export default connectComponent(
  Preferences,
  mapStateToProps,
  actionCreators,
  styles,
);
