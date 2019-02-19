# WebCatalog [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0) [![Travis Build Status](https://travis-ci.com/quanglam2807/webcatalog.svg?branch=master)](https://travis-ci.com/quanglam2807/webcatalog)

**[WebCatalog](https://getwebcatalog.com)** - Bring Thousands of Apps to Your Mac.

**master** branch only includes the source code of WebCatalog 13 & up. For older versions, check out the **legacy-** branches.

WebCatalog is an Electron app and can be built on Windows & Linux, but it's **only offically supported on macOS**. 

## Development
```bash
# First, clone the project:
git clone https://github.com/quanglam2807/webcatalog.git
cd webcatalog

# install the dependencies
yarn

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

# Get latest code
git pull

# Install catalog app dependencies
yarn

# Prepare production version template app
yarn template:prepare-dist

# Run catalog app
yarn electron-dev

# Update apps from catalog app second tab
click update on each installed app
```