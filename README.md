Static
======

Markdown and Handlebars static site generator. Transforms files with `.hbs` and `.md` with Handlebars and Markdown respectively.

## Command line interface

    ./bin/static source.hbs.html target.html

## JavaScript interface

    var static = require('./static');
    static.transform('source.hbs.html', function(buffer) {
      fs.writeFile('target.html', buffer.toString());
    });

## Example

A handlebars file similar to this could be used to generate documentation from a README.md file:

    <ul class="toc">
      {{#include "README.md" select="h3"}}
        <li><a href="#{{id}}">{{innerHTML}}</a></li>
      {{/include}}
    </ul>
    <div class="body">
      {{include "README.md"}}
    </div>

## Handlebars API

### include *{{include filename [select=selector]}}*

Include a file. If `select` is specified a block must be passed. The block will be called once for each selected node (with the context set to the node) from the file and the resulting HTML will be embedded.

## JavaScript API

### transform *static.transform(source, callback)*

Transforms a given file with Handlebars and Markdown if file extensions are present. Calls callback with a buffer containing the transformed file.

### handlebars *static.handlebars*

A reference to the handlebars object static is using. Useful to register new helpers on.

### registerAsyncHelper *static.handlebars.registerAsyncHelper(name, callback)*

Just like `Handlebars.registerHelper` but async. `callback` recieves arguments to the helper (if any) followed by an options object, followed by a callback. Call the callback with your generated output instad of returning.

    static.handlebars.registerAsyncHelper('toc', function(options, callback) {
      static.transform('README.md', function(html) {
        static.$(html, function(window) {
          var output = '<ul>';
          window.$('h3', function() {
            output += '<li>' + this.innerHTML + '</li>'
          });
          callback(output + '</ul>');
        });
      });
    });

### $ *static.$(html, callback)* 

Create a DOM window and jQuery object from the specified HTML. `callback` recieves `window` with jQuery initialized. The `select` argument to `include` is implemented with this.


    static.$(html, function(window) {
      window.$('a').each(...);
    });

### modifyDocumentFragment *static.modifyDocumentFragment(html, callback, next)*

Similar to `$`, calls `callback` with a `window` object initialized with jQuery. The `window` can be modified within the callback. `next` will be called with the resulting HTML.

    static.modifyDocumentFragment('<ul></ul>', function(window) {
      window.$('ul').append('<li></li>');
    }, function(html) {
      // html === '<ul><li></li></ul>'
    });

### onMarkdown *static.onMarkdown(callback)*

Called anytime after `transform` transforms a markdown document. `callback` is called with the generated HTML and a `next` function that must be called with the modified HTML. Pairs well with `modifyDocumentFragment`.

    static.onMarkdown(function(html, next) {
      next(html);
    });

### config *static.config*

Defaults to:
  
  {
    addIdsToHeadings: true, //in markdown add ids to h[1-6] tags
    gfm: true, //github flavored markdown
    highlight: function(code, lang) {
      return require('highlight.js').highlight(lang || 'javascript', code).value;
    }
  }
