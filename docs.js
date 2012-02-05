module.exports = function(static) {
  static.file('README.md', function(file) {
    file.transform('documentup', {
      name: 'Static'
    });
    file.$(function(window) {
      window.document.head.innerHTML += static.helpers['live-reload']().string;
      window.$('#nav #sections a').each(function() {
        this.innerHTML = this.innerHTML.replace(/\s?\*.+/,'');
      });
    });
    file.save('index.html');
  })
}
