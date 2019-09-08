import React from 'react';

import PropTypes from 'prop-types';

import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';

import connectComponent from '../../../helpers/connect-component';

import { requestOpenInBrowser } from '../../../senders';

import { getHits } from '../../../state/home/actions';
import { open as openDialogCreateCustomApp } from '../../../state/dialog-create-custom-app/actions';
import { getShouldUseDarkMode } from '../../../state/general/utils';

import AppCard from '../../shared/app-card';
import NoConnection from '../../shared/no-connection';
import EmptyState from '../../shared/empty-state';

import SearchBox from './search-box';

import searchByAlgoliaLightSvg from '../../../assets/search-by-algolia-light.svg';
import searchByAlgoliaDarkSvg from '../../../assets/search-by-algolia-dark.svg';


const styles = (theme) => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  title: {
    flex: 1,
  },
  paper: {
    zIndex: 1,
    display: 'flex',
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
  },
  scrollContainer: {
    flex: 1,
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 2,
    overflow: 'auto',
    boxSizing: 'border-box',
  },
  grid: {
    marginBottom: theme.spacing.unit,
  },
  searchByAlgoliaContainer: {
    marginTop: theme.spacing.unit * 3,
    outline: 'none',
  },
  searchByAlgolia: {
    height: 20,
    cursor: 'pointer',
  },
});

class Home extends React.Component {
  componentDidMount() {
    const { onGetHits } = this.props;

    onGetHits();

    const el = this.scrollContainer;
    el.onscroll = () => {
      // Plus 300 to run ahead.
      if (el.scrollTop + 300 >= el.scrollHeight - el.offsetHeight) {
        onGetHits();
      }
    };
  }

  render() {
    const {
      apps,
      classes,
      hasFailed,
      hits,
      shouldUseDarkMode,
      isGetting,
      onGetHits,
      onOpenDialogCreateCustomApp,
    } = this.props;

    const renderContent = () => {
      if (hasFailed) {
        return (
          <NoConnection
            onTryAgainButtonClick={onGetHits}
          />
        );
      }

      if (!isGetting && hits.length < 1) {
        return (
          <EmptyState icon={SearchIcon} title="No Matching Results">
            <>
              Please create a custom app instead
              <br />
              or submit a new app to the catalog (Help &gt; Report an Issue...).
            </>
          </EmptyState>
        );
      }

      return (
        <>
          <Grid container justify="center" spacing={16}>
            {hits.map((app) => (
              <AppCard
                key={app.id}
                id={app.id}
                name={app.name}
                url={app.url}
                icon={app.icon}
                icon128={app.icon128}
                mailtoHandler={app.mailtoHandler}
                status={apps[app.id] ? apps[app.id].status : null}
                engine={apps[app.id] ? apps[app.id].engine : null}
              />
            ))}
          </Grid>

          {!isGetting && (
            <Grid container justify="center" spacing={16}>
              <div
                onKeyDown={() => requestOpenInBrowser('https://algolia.com')}
                onClick={() => requestOpenInBrowser('https://algolia.com')}
                role="link"
                tabIndex="0"
                className={classes.searchByAlgoliaContainer}
              >
                <img
                  src={shouldUseDarkMode ? searchByAlgoliaDarkSvg : searchByAlgoliaLightSvg}
                  alt="Search by Algolia"
                  className={classes.searchByAlgolia}
                />
              </div>
            </Grid>
          )}
        </>
      );
    };

    return (
      <div className={classes.root}>
        <AppBar position="static" className={classes.appBar} elevation={0}>
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit" className={classes.title}>
              Home
            </Typography>
            <Button color="inherit" onClick={onOpenDialogCreateCustomApp}>
              <AddIcon className={classes.leftIcon} />
              Create Custom App
            </Button>
          </Toolbar>
        </AppBar>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <SearchBox />
          </Grid>
        </Grid>
        <div
          className={classes.scrollContainer}
          ref={(container) => { this.scrollContainer = container; }}
        >
          <Grid container className={classes.grid} spacing={16}>
            <Grid item xs={12}>
              {renderContent()}
            </Grid>
          </Grid>
          {isGetting && (<LinearProgress />)}
        </div>
      </div>
    );
  }
}


Home.propTypes = {
  apps: PropTypes.object.isRequired,
  hits: PropTypes.arrayOf(PropTypes.object).isRequired,
  classes: PropTypes.object.isRequired,
  hasFailed: PropTypes.bool.isRequired,
  shouldUseDarkMode: PropTypes.bool.isRequired,
  isGetting: PropTypes.bool.isRequired,
  onGetHits: PropTypes.func.isRequired,
  onOpenDialogCreateCustomApp: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  apps: state.appManagement.apps,
  hasFailed: state.home.hasFailed,
  hits: state.home.hits,
  shouldUseDarkMode: getShouldUseDarkMode(state),
  isGetting: state.home.isGetting,
});

const actionCreators = {
  getHits,
  openDialogCreateCustomApp,
};

export default connectComponent(
  Home,
  mapStateToProps,
  actionCreators,
  styles,
);
