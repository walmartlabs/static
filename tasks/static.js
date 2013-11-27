module.exports = function(grunt) {
  var path = require('path'),
      fs = require('fs'),
      static = require('static'),
      async = require('async'),
      _ = require('underscore');

  grunt.registerMultiTask('static', "Process files with static", function() {
    var done = this.async();
    var config = this.data;
    if (config.require) {
      var deps = typeof config.require === 'string' ? [config.require] : config.require;
      _.each(deps, function(dep) {
        require(path.join(process.cwd(), dep))(static);
      });
    }
    async.series(_.map(config.build, function(source, target) {
      return function(complete) {
        var sourceData = source.file ? source.file : source,
            sources = typeof sourceData === 'string' ? [sourceData] : sourceData,
            output = ''
        async.series(sources.map(function(sourceFile) {
          return function(next) {
            static.transform(sourceFile, function(buffer) {
              output += buffer.toString();
              next();
            }, typeof source === 'object' ? source.context: undefined);
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