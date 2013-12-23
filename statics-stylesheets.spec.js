var collectStatic = require('statics/src/collectStatic');
var fs = require('fs-extra');
var path = require('path');

describe('statics-stylesheets', function() {
  it('should work normally in dev', function() {
    process.env.NODE_ENV = 'development';

    if (fs.existsSync('./testbuild')) {
      fs.removeSync('./testbuild');
    }

    var done = false;

    runs(function() {
      collectStatic('./testdata/sample.js', './testbuild', function() {
        expect(function() {
          expect(fs.readFileSync('./testbuild/file1.css', {encoding: 'utf8'})).toBe('/* file1.css */');
          expect(fs.readFileSync('./testbuild/yoink/file2.css', {encoding: 'utf8'})).toBe('/* file2.css */');
          done = true;
        }).not.toThrow();
      });
    });

    waitsFor(function() {
      return done;
    });
  });

  it('should concatenate in prod', function() {
    process.env.NODE_ENV = 'production';

    if (fs.existsSync('./testbuild')) {
      fs.removeSync('./testbuild');
    }

    var done = false;

    runs(function() {
      collectStatic('./testdata/sample.js', './testbuild', function() {
        expect(function() {
          expect(fs.existsSync('./testbuild/file1.css')).toBe(false);
          expect(fs.existsSync('./testbuild/yoink/file2.css')).toBe(false);
          expect(fs.readFileSync('./testbuild/_all.css', {encoding: 'utf8'})).toBe('/* file1.css *//* file2.css */');
          done = true;
        }).not.toThrow();
      });
    });

    waitsFor(function() {
      return done;
    });
  });
});