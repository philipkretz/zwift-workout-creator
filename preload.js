// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

var app = require('electron').remote;
window.app = app;
window.fs = require('fs');
window.dialog = app.dialog;

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  window.saveFile = (filename, content) => {
    let options = [];
    window.dialog.showSaveDialog(options, (filename) => {
      filename = window.app.getPath('home')+filename;
      //document.getElementById('total-time').innerText = filename;
      window.fs.writeFileSync(filename, content, 'utf-8');
    });
  }


  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
