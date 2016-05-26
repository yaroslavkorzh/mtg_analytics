module.exports = function(grunt) {
    grunt.initConfig({
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'Dist/styles/style.css': 'Dev/styles/style.scss'
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
                    'Dist/scripts/background.js': [
                        'Dev/scripts/vendor/jquery.js',
                        'Dev/scripts/background.js'
                    ],
                    'Dist/scripts/browser.js': [
                        'Dev/scripts/vendor/jquery.js',
                        'Dev/scripts/browser.js'
                    ],
                    'Dist/scripts/inject.js': [
                        'Dev/scripts/vendor/jquery.js',
                        'Dev/scripts/inject.js'
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
                    'Dist/scripts/background.js': ['Dist/scripts/background.js'],
                    'Dist/scripts/browser.js': ['Dist/scripts/browser.js'],
                    'Dist/scripts/inject.js': ['Dist/scripts/inject.js']
                }
            }
        },
        watch: {
            styles: {
                files: ['Dev/styles/**/*.scss'],
                tasks: ['sass', 'postcss'],
                options: {
                    spawn: false
                }
            },
            scripts: {
                files: ['Dev/scripts/**/*.js'],
                tasks: ['concat']
            }
        },

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-browserify');

    //grunt.registerTask("default", ["grunt-browserify"]);
    grunt.registerTask("default", ["newer:sass", "newer:concat", "newer:postcss", "watch"]);
    grunt.registerTask("all", ["sass", "concat", "postcss"]);
    grunt.registerTask("dist", ["uglify"]);

};