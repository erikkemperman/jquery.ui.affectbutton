Usage
=====
Please refer to http://radharing.github.io/jquery.ui.affectbutton for a demo,
details about how to use the widget, and an explanation of how it works. 

Build
=====
You'll need a recent version of Node.js from http://nodejs.org/ (which will
include the Node Package Manager `npm`).

Clone the repository:

    git clone https://github.com/radharing/jquery.ui.affectbutton.git

Change into the new directory:

    cd jquery.ui.affectbutton

Install the dependencies from `package.json`:

    npm install

To run the `jshint` (static code analysis) and `uglify` (minification) tasks:

    grunt

To run a local server (Defaults bind to `0.0.0.0:8080`):

    grunt connect
