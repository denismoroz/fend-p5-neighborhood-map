/*global module*/

module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'dist/js/app.js': ['js/app.js']
        }
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/css/style.css': ['css/style.css']
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'index.html'
        }
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, src: ['images/*'], dest: 'dist/', filter: 'isFile'},
          {expand: true, src: ['bower_components/bootstrap/dist/css/bootstrap.min.css',
                               'bower_components/bootstrap/dist/js/bootstrap.min.js',
                               'bower_components/bootstrap/dist/fonts/*',
                               'bower_components/bootstrap-sidebar/dist/css/sidebar.css',
                               'bower_components/bootstrap-sidebar/dist/js/sidebar.js'],
              dest: 'dist/'},
          {expand: true, src: ['bower_components/knockout/dist/knockout.js'],
              dest: 'dist/'},
          {expand: true, src: ['bower_components/jquery/dist/jquery.min.js'],
              dest: 'dist/'}
        ]
      }
    },
    jsdoc: {
      dist: {
          src: ['js/*.js', 'README.md'],
          jsdoc: './node_modules/.bin/jsdoc',
          options: {
              destination: 'doc'
          }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsdoc');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin', 'htmlmin', 'copy', 'jsdoc']);

};