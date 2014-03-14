module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('boost.grunt.json'),
        concat: {
            js: {
                options: {
                    separator: ';'
                },
                // full list of files to combine and destination
                files: '<%= config.jsconcat %>'
            },
            // concat css
            css: {
                // full list of files to combine and destination
                files: '<%= config.cssconcat %>'
            }
        },
        // config.jsmin
        uglify: {
            main: {
                options: {
                    mangle: false
                },
                files: '<%= config.jsmin %>'
            },
            plugins : {
                options: {
                    mangle: false
                },
                files: '<%= config.plugins %>'
            }
        },
        // config.cssmin
        cssmin: {
            compress: {
                files: '<%= config.cssmin %>'
            }
        },
        jshint: {
            files: ['gruntfile.js', 'js/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib');

    grunt.registerTask('default', ['concat', 'uglify:main', 'cssmin']);

};