
## Overview
 
Generate static sites with [Markdown](http://daringfireball.net/projects/markdown/), [Handlebars](http://www.handlebarsjs.com/) and [Stylus](http://learnboost.github.com/stylus/). Live previews with [socket.io](http://socket.io/).

    npm install -g static
    static create test

This bootstraps a static project inside of a folder named "test". You can then use the *static* command to watch this source folder and publish the generated site to an arbitrary number of target folders. Specify a port number to start an express server which will trigger automatic page reloads when files inside the source directory change.

    static ./test ./test-generated 8000    

This page is generated with Static, [view the source here](https://github.com/walmartlabs/static/tree/master/docs).

### Github Pages

To use static with [GitHub Pages](http://pages.github.com/) create a new static project in a directory named *docs* inside your repo, and a *gh-pages* branch in separate directory locally.

    # create a docs folder containing a new static project
    cd repo
    static create docs
    git add docs
    git commit -m "added docs"
    git push origin master
    cd ..

    # create a gh-pages branch containing the generated site
    static ./repo/docs ./repo-gh-pages 8000
    cd repo-gh-pages
    git symbolic-ref HEAD refs/heads/gh-pages
    git remote add origin git@github.com:username/repo.git
    git add *
    git commit -m "added generated docs"
    git push origin gh-pages
    
View your changes locally on port 8000 and when you're happy with the changes commit and push the *gh-pages* branches to GitHub.

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

### index.js

Most of the behaviors described so far are all specified in [index.js](https://github.com/walmartlabs/static/blob/bootstrap/index.js). You can specify additional behaviors or modify the output of your pages with jQuery by modifying this file. *index.js*  must export a single function which will receive a *static* object.

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

The rest of the documentation details the API available inside of a *index.js*.

## Static

### file *static.file(pattern, callback)*

Select files in the source project to modify or copy. *pattern* can be a relative path as a string or a regular expression. Callback will be called for each matching file with the file object as it's only argument. This example from the *index.js* plugin selects markdown files in any directory:

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

Write the file to a given path in the generated site. *target_path* should be relative and only a directory name. This example from *index.js* copies all asset files:

    static.file(/^assets\//, function(file) {
      file.write('assets');
    });

### $ *file.$(callback)*

Loads jQuery then calls callback with a DOM window object representing the current file and a *next* function that must be called. The DOM tree will then be serialized back to a string after callback is called. The table of contents for this document is created by scanning all h1, h2 and h3 tags then injecting HTML into the DOM.

    static.file('index.handlebars', function(file) {
      file.$(function(window, next) {
        window.$ === window.jQuery;
        next();
      });
    });

The callback is called after the file has been processed with Markdown and Handlebars.

### set *file.set(key, value)*

Sets a value to be made available in all handlebar templates rendered by the file (the file itself + includes).

### render *file.render(filename [,context])*

Render a Markdown or Handlebars file, returning the contents as a string. *filename* is a relative path in the source directory, *context* is the context that will be available if the file is handlebars template.

    var output = file.render('test.handlebars', {key: 'value'});

### transform *file.transform(callback)*

Transform a file, currently availble transforms are *handlebars*, *markdown* and *stylus*.

    static.file(/\.styl$/, function(file) {
      file.transform('stylus');
      file.changeExtensionTo('css');
    });

Arbitrary transforms can be supplied by passing a callback that receives the buffer of the file and a callback to call when the transformation is complete:

    static.file(/\.txt$/, function(file) {
      file.transform(function(buffer, next) {
        next(buffer.toLowerCase());
      });
    });

### changeExtensionTo *file.changeExtensionTo(extension)*

Change the extension of the file when it is written to a target. Does not modify the extension of the source file.

## Helpers

### live-reload *{{live-reload}}*

Put this inside of your <head> tag. Generates the JavaScript needed for live reload functionality. The *styles*, *style*, *scripts* and *script* helpers should all be used when using live-reload instead of plain HTML as it will ensure that the current page reloads when dependent stylesheets or scripts change.

### set *{{set key="value"}}*

Set a value in the current file that will be made available to any other handlebars templates the current file includes.

### include *{{include filename [key="value"]}}*

Include another handlebars, markdown or html file inside of the *includes* directory. Arbitrary values can be passed to the file if it is a handlebars template.

### styles *{{styles [key="value"]}}*

Generate style tags for all stylesheets inside of the *styles* folder. Arbitrary HTML attributes can be passed.

### style *{{style [key="value"]}}*

Generate a style tag for a single stylesheet.

### scripts *{{scripts [key="value"]}}*

Generate script tags for all scripts inside of the *scripts* folder. Arbitrary HTML attributes can be passed.

### script *{{script [key="value"]}}*

Generate a script tag for a single script.

### root *{{root}}*

Path to the root of the site from the current page.

### target *{{target}}*

The current filename that is being written.

## Recipes

### Page Templates

The default project assumes each page will *include* a header and a footer. You could instead insert the content of each page into a template:

    static.file(/^pages\//, function(file) {
      file.write('.');
      file.transform(function(buffer, next) {
        next(file.render('templates/index.handlebars', {
          yield: buffer
        }));
      });
    });

Inside of templates/index.handlebars:

    <html>
      <body>
        {{{yield}}}
      </body>
    </html>

