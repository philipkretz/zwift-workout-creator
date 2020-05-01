// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

var electron = require('electron');
var app = electron.remote;
window.app = app;
window.fs = require('fs');
window.dialog = app.dialog;
window.path = (electron.app || electron.remote.app).getPath('home');

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  window.saveFile = (filename, content) => {
    let options = {
      'defaultPath':  window.path+filename
    }

    filename = dialog.showSaveDialog(null, options).then(result => {
      filename = result.filePath;
      if (filename === undefined) {
        return;
      }
      window.fs.writeFileSync(filename, content, 'utf-8');
    }).catch(err => {});
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
