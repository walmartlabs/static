module.exports = function(grunt) {
  var path = require('path'),
      fs = require('fs'),
      static = require('static'),
      async = require('async'),
      _ = require('underscore');

  grunt.registerTask('static', "Process files with static", function() {
    var done = this.async();
    this.requiresConfig('static');
    var config = grunt.config('static');
    if (config.require) {
      var deps = typeof config.require === 'string' ? [config.require] : config.require;
      _.each(deps, function(dep) {
        require(path.join(process.cwd(), dep))(static);
      });
    }
    async.series(_.map(config.build, function(source, target) {
      return function(complete) {
        var sources = typeof source === 'string' ? [source] : source,
            output = '';
        async.series(sources.map(function(source) {
          return function(next) {
            static.transform(source, function(buffer) {
              output += buffer.toString();
              next();
            });
          }
        }), function() {
          console.log('grunt.static: wrote ' + target);
          grunt.file.write(target, output);
          complete();
        });
      }
    }), function() {
      done(true);
    });
  });
};