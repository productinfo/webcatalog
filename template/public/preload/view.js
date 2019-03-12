const {
  ipcRenderer,
  remote,
  webFrame,
} = require('electron');

const {
  SpellCheckHandler,
  ContextMenuListener,
  ContextMenuBuilder,
} = require('electron-spellchecker');

const { MenuItem } = remote;

window.global = {};
window.ipcRenderer = ipcRenderer;

window.onload = () => {
  window.close = () => {
    ipcRenderer.send('request-go-home');
  };

  const jsCodeInjection = ipcRenderer.sendSync('get-preference', 'jsCodeInjection');
  const cssCodeInjection = ipcRenderer.sendSync('get-preference', 'cssCodeInjection');

  if (jsCodeInjection && jsCodeInjection.trim().length > 0) {
    try {
      const node = document.createElement('script');
      node.innerHTML = jsCodeInjection;
      document.body.appendChild(node);
    } catch (err) {
      /* eslint-disable no-console */
      console.log(err);
      /* eslint-enable no-console */
    }
  }

  if (cssCodeInjection && cssCodeInjection.trim().length > 0) {
    try {
      const node = document.createElement('style');
      node.innerHTML = cssCodeInjection;
      document.body.appendChild(node);
    } catch (err) {
      /* eslint-disable no-console */
      console.log(err);
      /* eslint-enable no-console */
    }
  }

  const spellChecker = ipcRenderer.sendSync('get-preference', 'spellChecker');

  if (spellChecker) {
    window.spellCheckHandler = new SpellCheckHandler();
    setTimeout(() => window.spellCheckHandler.attachToInput(), 1000);
    window.spellCheckHandler.switchLanguage('en-US');
  }

  window.contextMenuBuilder = new ContextMenuBuilder(
    spellChecker ? window.spellCheckHandler : null,
    null,
    true,
  );


  window.contextMenuListener = new ContextMenuListener((info) => {
    window.contextMenuBuilder.buildMenuForElement(info)
      .then((menu) => {
        menu.append(new MenuItem({ type: 'separator' }));
        menu.append(new MenuItem({
          label: 'Back',
          click: () => {
            remote.getCurrentWindow().send('go-back');
          },
        }));
        menu.append(new MenuItem({
          label: 'Forward',
          click: () => {
            remote.getCurrentWindow().send('go-forward');
          },
        }));
        menu.append(new MenuItem({
          label: 'Reload',
          click: () => {
            remote.getCurrentWindow().send('reload');
          },
        }));

        menu.popup(remote.getCurrentWindow());
      });
  });

  // Link preview
  const linkPreview = document.createElement('div');
  linkPreview.style.cssText = 'max-width: 80vw;height: 22px;position: fixed;bottom: -1px;right: -1px;z-index: 1000000;background-color: rgb(245, 245, 245);border-radius: 2px;border: #9E9E9E  1px solid;font-size: 12.5px;color: rgb(0, 0, 0);padding: 0px 8px;line-height: 22px;font-family: -apple-system, system-ui, BlinkMacSystemFont, sans-serif;white-space: nowrap;text-overflow: ellipsis;overflow: hidden; pointer-events:none;';
  ipcRenderer.on('update-target-url', (e, url) => {
    if (url) {
      linkPreview.innerText = url;
      document.body.appendChild(linkPreview);
    } else {
      document.body.removeChild(linkPreview);
    }
  });
};

// Fix Can't show file list of Google Drive
// https://github.com/electron/electron/issues/16587
webFrame.executeJavaScript(`
window.chrome = {
  runtime: {
    connect: () => {
      return {
        onMessage: {
          addListener: () => {},
          removeListener: () => {},
        },
        postMessage: () => {},
        disconnect: () => {},
      }
    }
  }
}
`);
