var handlebars = require('handlebars'),
	async = require('async'),
	jsdom = require('jsdom'),
	marked = require('marked'),
	path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
  highlight = require('highlight.js'),
  domToHTML = require('./lib/domtohtml.js').domToHtml;

var config = {
  addIdsToHeadings: true,
  gfm: true, //github flavored markdown
  highlight: function(code, lang) {
    return highlight.highlight('javascript', code).value;
  }
};

var jqueryPath = './lib/jquery.js';

var transforms = {
  md: function(buffer, complete) {
    var tokens = marked.lexer(buffer.toString(), {
      gfm: config.gfm,
      highlight: config.highlight
    });
    var html = marked.parser(tokens);
    $(html, function($, window) {
      if (config.addIdsToHeadings) {
        addIdsToHeadings($);
      }
      complete(removeOuterBodyTag(domToHTML(window.document.body, true)));
    });
  },
  hbs: function(buffer, complete) {
    var output = handlebars.compile(buffer.toString())({});
    async.series(_.map(asyncTolkens, function(data, tolken) {
      return function(next) {
        var args = data.args;
        args.push(function(callbackOutput) {
          output = output.replace(tolken, callbackOutput.toString());
          next();
        });
        data.callback.apply(data.callback, args);
      };
    }), function() {
      complete(output);
    });
  }
};

function addIdsToHeadings($) {
  $('h1,h2,h3,h4,h5,h6').each(function() {
    var text = $(this).html().split('<').shift();
    var id = text.replace(/[^a-zA-Z0-9\_\-]/g, '').replace(/([a-z])([A-Z])/g, function() {
      return arguments[1] + '-' + arguments[2].toLowerCase();
    }).toLowerCase();
    if (id.match(/^\s+$/) || !id) {
      return;
    }
    $(this).attr('id', id);
  });
}

function removeOuterBodyTag(html) {
  return html.replace(/^\s*\<body\>/, '').replace(/\<\/body\>\s*$/, '');
}

function $(html, complete) {
  jsdom.env(html.toString(), [
    jqueryPath
  ], function(errors, window) {
    if (errors) {
      console.log('$ error', errors);
      throw errors;
    } else {
      complete(window.$, window);
    }
  });
}

handlebars.registerAsyncHelper = function(name, callback) {
  handlebars.registerHelper(name, function() {
    var tolken = String(new Date().getTime() + Math.random());
    var args = _.toArray(arguments);
    asyncTolkens[tolken] = {
      args: args,
      callback: callback
    };
    return tolken;
  });
};

var asyncTolkens = {};

handlebars.registerHelper('require', function(file) {
  require(path.join(process.cwd(), file))(module.exports);
  return '';
});

handlebars.registerAsyncHelper('include', function(file, options, callback) {
  transform(file, function(fileData) {
    var selector = options.hash.select;
    if (selector) {
      $(fileData.toString(), function($) {
        var generatedHTML = '';
        $(selector).each(function() {
          generatedHTML += options.fn(this);
        });
        callback(generatedHTML);
      });
    } else {
      callback(fileData.toString());
    }
  });
});

function transform(source, callback) {
  fs.readFile(source, function(err, data) {
  	if (err) {
  	  throw err;
  	}
  	var extensions = source.split('/').pop().split('.');
  	var callbacks = _.filter(extensions, function(extension) {
  	  return extension in transforms;
  	}).map(function(extension) {
      return function(next) {
      	transforms[extension](data, next);
      };
  	});
  	async.series(callbacks, callback);
  });
}

module.exports = {
  config: config,
  transform: transform,
  handlebars: handlebars,
  $: $
};