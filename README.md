
## Overview

Generate static sites with [Markdown](http://daringfireball.net/projects/markdown/), [Handlebars](http://www.handlebarsjs.com/) and [Stylus](http://learnboost.github.com/stylus/). Live previews with [socket.io](http://socket.io/).

    npm install -g static
    static create test

This bootstraps a static project inside of a folder named "test". Static can write the generated site to a path of your choosing using the *publish* command or serve it out with on a given port using the *start* command, triggering your browser to reload when needed.

    static publish ./test ./test-generated
    static start ./test 8000

## Project Structure

### Assets

Put any media files such as images, movies, etc in here. They will be copied to the *assets* folder in the generated site as is.

### Includes

Any files in this directory can be included into your pages using the *include* helper, specifying the file extension is not necessary. If the include is a handlebars file, you can pass arbitrary key, value pairs.

    {{include "header" key="value"}}
    <p>Content</p>
    {{include "footer"}}

### Pages

Any *.html*, *.md* or *.handlebars* files here will be processed, have their extension changed to *.html*, and will be copied to the root folder of your generated site, for example: *source/pages/index.handlebars* -> *target/index.html*

### Scripts

Javascript files, will be copied to the *scripts* folder of the generated site as is. You can include all scripts or a single script inside a handlebars template with one of the helpers:

    {{script src}}
    {{scripts}}

### Styles

Stylus or CSS files, will be processed and copied to the *styles* folder of the generated site. You can include all stylesheets or a single stylesheet inside a handlebars template with one of the helpers. You can pass arbitrary HTML attributes to either helper.

    {{style href}}
    {{styles media="screen"}}

### package.json

Any keys specified here will be available inside of your handlebars templates.

### Plugins

Most of the behaviors described so far are all specified in the *builtin.js* plugin. You can specify additional behaviors or modify the output of your pages with jQuery by creating a new *.js* file in this directory. Each file must export a single function which will receive a *static* object.

    module.exports = function(static) {
      static.file('index.handlebars', function(file) {
        file.$(function(window) {
          //add extra emphasis to all em tags
          window.$('em').each(function() {
            this.innerHTML += '!';
          });
        });
      });
    }

The rest of the documentation details the API available inside of a plugin.

## Static

### file *static.file(pattern, callback)*

Select files in the source project to modify or copy. *pattern* can be a relative path as a string or a regular expression. Callback will be called for each matching file with the file object as it's only argument. This example from the *builtin.js* plugin selects markdown files in any directory:

    static.file(/\.(md|markdown)$/, function(file) {
      file.transform('markdown');
      file.changeExtensionTo('html');
    });

### helper *static.helper(key, callback)*

Register a new handlebars helper. The callback will recieve the current file object, any ordered arguments passed followed by an an options hash (accessed via *options.hash*) if any attributes were passed to the helper.

    static.helper('bold', function(file, content, options) {
      return '<b>' + content + '</b>';
    }); 

    {{bold "Text"}}

### path *static.path*

Path to the source project.

### package *static.package*

Parsed *package.json*

## File

### write *file.write(target_path)*

Write the file to a given path in the generated site. *target_path* should be relative and only a directory name. This example from *builtin.js* copies all asset files:

    static.file(/^assets\//, function(file) {
      file.write('assets');
    });

### $ *file.$(callback)*

Loads jQuery then calls callback with a DOM window object that represents the current file. The DOM tree will then be serialized back to a string after callback is called. The table of contents for this document is created scanning all h1, h2 and h3 tags then injecting HTML into the DOM.

    static.file('index.handlebars', function(file) {
      file.$(function(window) {
        window.$ === window.jQuery;
      });
    });

### set *file.set(key, value)*

Sets a value to be made available in all handlebar templates rendered by the file (the file itself + includes).

### transform *file.transform(name [,callback])*

Transform a file, currently available transforms are:

- handlebars
- markdown
- stylus

An optional callback can be specified which will receive the buffer of the current file before it is transformed plus the object which will transform the file.

    static.file(/\.styl$/, function(file) {
      file.transform('stylus', function(buffer, stylus){
        
      });
      file.changeExtensionTo('css');
    });

### changeExtensionTo *file.changeExtensionTo(extension)*

Change the extension of the file when it is written. Does not modify the extension of the source file.

## Helpers

### live-reload *{{live-reload}}*

Enables live reload functionality. The *styles*, *style*, *scripts* and *script* helpers should all be used when using live-reload instead of plain HTML as it will ensure that the current page reloads when dependent stylesheets or scripts change.

### set *{{set key="value"}}*

Set a value in the current file that will be made available to any other handlebars templates the current file includes.

### include *{{include filename [key="value"]}}*

Include another handlebars, markdown or html file. Arbitrary values can be passed to the file if it is a handlebars template.

### styles *{{styles [key="value"]}}*

Generate style tags for all stylesheets inside of the *styles* folder. Arbitrary HTML attributes can be passed.

### style *{{style [key="value"]}}*

Generate a style tag for a single stylesheet.

### scripts *{{scripts [key="value"]}}*

Generate script tags for all scripts inside of the *scripts* folder. Arbitrary HTML attributes can be passed.

### script *{{script [key="value"]}}*

Generate a script tag for a single script.
