module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'js/jquery.ui.<%= pkg.name %>.js'
      ]
    },
    uglify: {
      options: {
        sourceMap: true,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'js/<%= pkg.name %>.js',
        dest: 'js/<%= pkg.name %>.min.js'
      }
    }
  });

  // Load "jshint".
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Load "uglify".
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  
  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify']);

};

