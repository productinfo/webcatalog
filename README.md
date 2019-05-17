# WebCatalog [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0) [![Travis Build Status](https://travis-ci.com/quanglam2807/webcatalog.svg?branch=master)](https://travis-ci.com/quanglam2807/webcatalog)

**[WebCatalog](https://getwebcatalog.com)** - Run Web Apps like Real Apps.

**master** branch only includes the source code of WebCatalog 13 & up. For older versions, check out the **legacy-** branches.

---

## Notes
**WebCatalog is open-source but not free.** You can install up to two apps for free. [Pay just $19.99](https://webcatalog.onfastspring.com/webcatalog-lite) to install as many as you need.

WebCatalog has permanent licenses, which have no time limit. In other words, the license never expires and works with all versions (including major updates). Also, your license permits you to use the app on all of the devices you own, as long as you are the only one using the app.

---

## Development
```bash
# First, clone the project:
git clone https://github.com/quanglam2807/webcatalog.git
cd webcatalog

# install the dependencies
yarn
yarn template:install

# Run development mode of WebCatalog
yarn electron-dev

# Run development mode of the template app
yarn template:electron-dev

# Build for production
yarn template:prepare-dist
yarn dist
```

## Upgrade installed app template
```bash
# Get into webcatalog cloned folder
cd webcatalog

# Get latest code, make sure you are on proper branch
git pull

# Install catalog app dependencies
yarn

# Prepare production version template app
yarn template:prepare-dist

# Run catalog app
yarn electron-dev

# Update apps from catalog app second tab
click "UPDATE" on each installed app or "UPDATE ALL" from "Installed" tab
```