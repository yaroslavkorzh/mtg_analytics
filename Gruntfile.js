module.exports = function(grunt) {
    grunt.initConfig({
        browserify: {
            all: {
                files: {
                    'js/app.js': ['js/main.js']
                },
                options: {

                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'styles/style.css': 'styles/style.scss'
                }
            }
        },
        postcss: {
            options: {
                map: true,
                processors: [
                    require('autoprefixer')({
                        browsers: ['> 1%', 'ie >= 7']
                    }),
                    require('postcss-opacity'),
                    require('postcss-color-rgba-fallback'),
                    require('cssnano')()
                ]
            },
            dist: {
                src: 'Dist/styles/*.css'
            }
        },
        concat: {
            scripts: {
                files: {
                    'Dist/scripts/app.js': [
                        'js/app.js'
                    ],
                    'Dist/scripts/lib.js': [
                        'js/libraries/*.js'
                    ]
                }
            }
        },
        uglify: {
            options: {
                compress: {
                    drop_console: true
                }
            },
            dist: {
                files: {
                    'Dist/scripts/app.js': ['Dist/scripts/app.js'],
                    'Dist/scripts/lib.js': ['Dist/scripts/lib.js']
                }
            }
        },
        watch: {
            styles: {
                files: ['styles/**/*.scss'],
                tasks: ['sass'],
                options: {
                    spawn: false
                }
            },
            scripts: {
                files: ['js/**/*.js'],
                tasks: ['default']
            }
        },

    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-newer');

    grunt.registerTask("default", ['browserify', "newer:sass", "newer:concat", "watch"]);
    grunt.registerTask("all", ["sass", "concat", 'browserify']);
    grunt.registerTask("dist", ["uglify"]);

};