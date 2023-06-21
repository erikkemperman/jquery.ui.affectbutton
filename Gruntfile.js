module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig( {
    
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
    },
    
    connect: {
      server: {
        options: {
          port: 8080,
          keepalive: true
        }
      }
    },
    
    watch: {
      scripts: {
        files: ['js/<%= pkg.name %>.js'],
        tasks: ['default'],
        options: {
          spawn: true,
        },
      },
    },
    
    concurrent: {
      serve: ['watch', 'connect']
    }
    
  } );

  // Load tasks (use autoloader which examines package.json):
  require( 'load-grunt-tasks' )( grunt );
  
  // Default task(s):
  grunt.registerTask( 'default', ['jshint', 'uglify'] );

  // Serve task (watch and connect)
  grunt.registerTask( 'serve', ['concurrent:serve'] );
  
};

