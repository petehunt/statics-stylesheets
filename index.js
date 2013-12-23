var fs = require('fs-extra');
var glob = require('glob').sync;
var mimetype = require('mimetype');
var path = require('path');
var rework = require('rework');

function plugin(destDir, projectRoot, projectStaticRoot) {
  var files = glob(path.join(projectRoot, projectStaticRoot, '**'));
  fs.mkdirpSync(destDir);

  var concatenatedStylesheet = '';

  files.forEach(function(file) {
    var relativePath = path.dirname(
      path.resolve(file).replace(
        path.resolve(path.join(projectRoot, projectStaticRoot)),
        ''
      )
    ).slice(1);

    if (process.env.NODE_ENV === 'production' && mimetype.lookup(file) === 'text/css') {
      var src = fs.readFileSync(file, {encoding: 'utf8'});
      concatenatedStylesheet += rework(src).use(rework.url(function(url) {
        return url.replace('./', relativePath + '/');
      })).toString();
      return;
    }

    var destFile = path.join(destDir, relativePath, path.basename(file));
    if (fs.existsSync(destFile)) {
      fs.unlinkSync(destFile);
    }

    if (fs.statSync(file).isFile()) {
      fs.mkdirpSync(path.dirname(destFile));
      fs.symlinkSync(file, destFile);
    }
  });

  if (concatenatedStylesheet.length > 0) {
    fs.writeFileSync(path.join(destDir, '_all.css'), concatenatedStylesheet, {encoding: 'utf8'});
  }
}

module.exports = plugin;