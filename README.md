Usage
=====
Please refer to http://radharing.github.io/jquery.ui.affectbutton for a demo,
details about how to use the widget, and an explanation of how it works. 

Build
=====
You'll need a recent version of Node.js from http://nodejs.org/ (which will
include the Node Package Manager `npm`). Fire up a shell terminal and
proceed as follows.

Clone the repository:

    git clone https://github.com/radharing/jquery.ui.affectbutton.git

Change into the new directory:

    cd jquery.ui.affectbutton

Install the dependencies from `package.json`:

    npm install

To run the `jshint` (static code analysis) and `uglify` (minification) tasks:

    grunt

While developing I find it convenient to run a local server:

    grunt serve

The defaults bind it to `0.0.0.0:8080`. To kill the server hit `CTRL-C`.

The `serve` task is just a wrapper around `watch` and `connect`. The former
watches for changes in the javascript source and automatically triggers the
default task (`jshint` and `uglify`) when needed. The latter runs a minimal
webserver.

TODO We could add a task which starts the server as well as a local browser,
watches for changes in javascript, style or markup -- and automatically have
the browser refresh the page when needed.
